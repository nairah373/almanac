import { type NextRequest } from "next/server";
import { z } from "zod";
import { apiError, apiOk, requireApiProfile } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const schema = z
  .object({
    method: z.enum(["UPI", "BANK"]),
    holderName: z.string().trim().min(2).max(80),
    upiId: z
      .string()
      .trim()
      .regex(/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/, "Enter a valid UPI ID, e.g. name@bank.")
      .optional(),
    accountNumber: z
      .string()
      .trim()
      .regex(/^\d{6,18}$/, "Enter a valid account number.")
      .optional(),
    ifsc: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Enter a valid IFSC code.")
      .optional(),
    bankName: z.string().trim().max(120).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.method === "UPI" && !val.upiId) {
      ctx.addIssue({ code: "custom", message: "A UPI ID is required.", path: ["upiId"] });
    }
    if (val.method === "BANK") {
      if (!val.accountNumber)
        ctx.addIssue({ code: "custom", message: "An account number is required.", path: ["accountNumber"] });
      if (!val.ifsc)
        ctx.addIssue({ code: "custom", message: "An IFSC code is required.", path: ["ifsc"] });
      if (!val.bankName)
        ctx.addIssue({ code: "custom", message: "A bank name is required.", path: ["bankName"] });
    }
  });

/** Create or update the signed-in creator's payout destination. */
export async function PUT(request: NextRequest) {
  const auth = await requireApiProfile();
  if (auth.response) return auth.response;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid payout details.");
  }
  const input = parsed.data;

  // Keep only the fields relevant to the chosen method.
  const data =
    input.method === "UPI"
      ? {
          method: "UPI" as const,
          holderName: input.holderName,
          upiId: input.upiId ?? null,
          accountNumber: null,
          ifsc: null,
          bankName: null,
        }
      : {
          method: "BANK" as const,
          holderName: input.holderName,
          upiId: null,
          accountNumber: input.accountNumber ?? null,
          ifsc: input.ifsc ?? null,
          bankName: input.bankName ?? null,
        };

  await prisma.payoutAccount.upsert({
    where: { profileId: auth.profile.id },
    create: { profileId: auth.profile.id, ...data },
    update: data,
  });

  return apiOk({ ok: true });
}
