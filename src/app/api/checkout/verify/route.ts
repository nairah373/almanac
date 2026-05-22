import { type NextRequest } from "next/server";
import { z } from "zod";
import { apiError, apiOk, requireApiProfile } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { verifyPaymentSignature } from "@/lib/razorpay";

const schema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

/**
 * Confirm a payment right after Razorpay Checkout closes. The webhook is the
 * source of truth; this gives the buyer instant access on success.
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

  const purchase = await prisma.purchase.findUnique({
    where: { razorpayOrderId: razorpay_order_id },
  });
  if (!purchase || purchase.buyerId !== auth.profile.id) {
    return apiError("Purchase not found.", 404);
  }

  if (purchase.status !== "PAID") {
    await prisma.$transaction([
      prisma.purchase.update({
        where: { id: purchase.id },
        data: { status: "PAID", razorpayPaymentId: razorpay_payment_id },
      }),
      prisma.resource.update({
        where: { id: purchase.resourceId },
        data: { downloadCount: { increment: 1 } },
      }),
    ]);
  }

  return apiOk({ ok: true });
}
