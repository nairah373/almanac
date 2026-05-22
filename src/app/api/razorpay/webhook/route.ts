import { type NextRequest } from "next/server";
import { apiError, apiOk } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/razorpay";

type WebhookEvent = {
  event?: string;
  payload?: {
    payment?: { entity?: { id?: string; order_id?: string } };
    order?: { entity?: { id?: string } };
  };
};

/**
 * Razorpay webhook — the authoritative confirmation of payment.
 * Configure it in the Razorpay dashboard to point at /api/razorpay/webhook.
 */
export async function POST(request: NextRequest) {
  const raw = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";

  if (!verifyWebhookSignature(raw, signature)) {
    return apiError("Invalid webhook signature.", 400);
  }

  let event: WebhookEvent;
  try {
    event = JSON.parse(raw) as WebhookEvent;
  } catch {
    return apiError("Malformed payload.");
  }

  const orderId =
    event.payload?.payment?.entity?.order_id ??
    event.payload?.order?.entity?.id ??
    null;
  const paymentId = event.payload?.payment?.entity?.id ?? null;

  if (orderId) {
    const purchase = await prisma.purchase.findUnique({
      where: { razorpayOrderId: orderId },
    });
    if (purchase && purchase.status !== "PAID") {
      await prisma.$transaction([
        prisma.purchase.update({
          where: { id: purchase.id },
          data: { status: "PAID", razorpayPaymentId: paymentId },
        }),
        prisma.resource.update({
          where: { id: purchase.resourceId },
          data: { downloadCount: { increment: 1 } },
        }),
      ]);
    }
  }

  return apiOk({ received: true });
}
