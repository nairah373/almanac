import { type NextRequest } from "next/server";
import { z } from "zod";
import { apiError, apiOk, requireApiProfile } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { activateSubscription } from "@/lib/subscription";

const schema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

/**
 * Confirm a subscription payment right after Razorpay Checkout closes. The
 * webhook is the source of truth; this gives the student instant access.
 */
export async function POST(request: NextRequest) {
  const auth = await requireApiProfile();
  if (auth.response) return auth.response;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("Invalid request.");
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    parsed.data;

  if (
    !verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    )
  ) {
    return apiError("Payment could not be verified.", 400);
  }

  const sub = await prisma.subscription.findUnique({
    where: { razorpayOrderId: razorpay_order_id },
  });
  if (!sub || sub.userId !== auth.profile.id) {
    return apiError("Subscription not found.", 404);
  }

  await activateSubscription(sub.id, razorpay_payment_id);
  return apiOk({ ok: true });
}
