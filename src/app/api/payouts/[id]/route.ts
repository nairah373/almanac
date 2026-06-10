import { type NextRequest } from "next/server";
import { z } from "zod";
import { apiError, apiOk, requireApiProfile } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  status: z.enum(["PROCESSING", "PAID", "REJECTED"]),
  reference: z.string().trim().max(140).optional(),
  note: z.string().trim().max(280).optional(),
});

/** Admin-only: move a payout through its lifecycle. */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiProfile();
  if (auth.response) return auth.response;
  if (auth.profile.role !== "ADMIN") {
    return apiError("Only admins can manage payouts.", 403);
  }

  const { id } = await params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid update.");
  }
  const { status, reference, note } = parsed.data;

  const payout = await prisma.payout.findUnique({ where: { id } });
  if (!payout) return apiError("Payout not found.", 404);
  if (status === "REJECTED" && !note && !payout.note) {
    return apiError("Add a reason when rejecting a payout.");
  }

  const isFinal = status === "PAID" || status === "REJECTED";

  // Atomic compare-and-set: only settle if still open, so two concurrent
  // admin actions can't double-settle or clobber the processed timestamp.
  const result = await prisma.payout.updateMany({
    where: { id, status: { in: ["REQUESTED", "PROCESSING"] } },
    data: {
      status,
      reference: reference || payout.reference,
      note: note || payout.note,
      processedAt: isFinal ? new Date() : payout.processedAt,
    },
  });

  if (result.count === 0) {
    return apiError("This payout has already been settled.");
  }

  return apiOk({ ok: true });
}
