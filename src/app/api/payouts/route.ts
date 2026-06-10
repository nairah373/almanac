import { type NextRequest } from "next/server";
import { z } from "zod";
import { apiError, apiOk, requireApiProfile } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { rupeesToPaise, formatINR } from "@/lib/format";
import { MIN_PAYOUT_INR } from "@/lib/constants";

const schema = z.object({
  amountInRupees: z.number().int().min(MIN_PAYOUT_INR).max(1_000_000),
});

/** Short, non-sensitive label for the destination an amount is paid to. */
function destinationLabel(account: {
  method: "UPI" | "BANK";
  upiId: string | null;
  accountNumber: string | null;
  bankName: string | null;
}): string {
  if (account.method === "UPI") return account.upiId ?? "UPI";
  const last4 = (account.accountNumber ?? "").slice(-4);
  return `${account.bankName ?? "Bank"} ••••${last4}`;
}

/** Request a withdrawal of earned balance to the saved payout account. */
export async function POST(request: NextRequest) {
  const auth = await requireApiProfile();
  if (auth.response) return auth.response;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return apiError(
      parsed.error.issues[0]?.message ??
        `Enter an amount of at least ${formatINR(MIN_PAYOUT_INR * 100)}.`,
    );
  }
  const amountInPaise = rupeesToPaise(parsed.data.amountInRupees);

  try {
    await prisma.$transaction(async (tx) => {
      // Lock this creator's row so two concurrent withdrawal requests can't both
      // read the same balance and over-withdraw — the second waits for the first.
      await tx.$executeRaw`SELECT id FROM "Profile" WHERE id = ${auth.profile.id}::uuid FOR UPDATE`;

      const account = await tx.payoutAccount.findUnique({
        where: { profileId: auth.profile.id },
      });
      if (!account) {
        throw new Error("Add a payout method before requesting a withdrawal.");
      }

      // Recompute the available balance inside the locked transaction.
      const [earn, payoutAgg] = await Promise.all([
        tx.purchase.aggregate({
          where: { creatorId: auth.profile.id, status: "PAID" },
          _sum: { creatorEarningInPaise: true },
        }),
        tx.payout.aggregate({
          where: {
            creatorId: auth.profile.id,
            status: { in: ["REQUESTED", "PROCESSING", "PAID"] },
          },
          _sum: { amountInPaise: true },
        }),
      ]);
      const lifetime = earn._sum.creatorEarningInPaise ?? 0;
      const reserved = payoutAgg._sum.amountInPaise ?? 0;
      const available = lifetime - reserved;

      if (amountInPaise > available) {
        throw new Error(
          `You can withdraw up to ${formatINR(Math.max(0, available))} right now.`,
        );
      }

      await tx.payout.create({
        data: {
          creatorId: auth.profile.id,
          amountInPaise,
          method: account.method,
          destination: destinationLabel(account),
          status: "REQUESTED",
        },
      });
    });
  } catch (err) {
    return apiError(
      err instanceof Error ? err.message : "Could not request the payout.",
    );
  }

  return apiOk({ ok: true });
}
