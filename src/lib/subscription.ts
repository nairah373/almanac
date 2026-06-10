import { prisma } from "@/lib/prisma";
import { SUBSCRIPTION_PLANS } from "@/lib/constants";

/** Add a whole number of months to a date. */
export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

/**
 * Activate a CREATED subscription after payment. Idempotent — if the row is
 * already ACTIVE it does nothing. Renewals extend from any still-active period,
 * so paying again before expiry stacks the new term on top.
 */
export async function activateSubscription(
  subscriptionId: string,
  paymentId: string | null,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const sub = await tx.subscription.findUnique({
      where: { id: subscriptionId },
    });
    if (!sub || sub.status === "ACTIVE") return;

    const now = new Date();
    const live = await tx.subscription.findFirst({
      where: {
        userId: sub.userId,
        status: "ACTIVE",
        currentPeriodEnd: { gt: now },
        id: { not: sub.id },
      },
      orderBy: { currentPeriodEnd: "desc" },
    });
    const base =
      live?.currentPeriodEnd && live.currentPeriodEnd > now
        ? live.currentPeriodEnd
        : now;
    const end = addMonths(base, SUBSCRIPTION_PLANS[sub.plan].months);

    await tx.subscription.update({
      where: { id: sub.id },
      data: {
        status: "ACTIVE",
        startedAt: now,
        currentPeriodEnd: end,
        razorpayPaymentId: paymentId ?? sub.razorpayPaymentId,
      },
    });
  });
}
