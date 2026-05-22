import crypto from "node:crypto";
import Razorpay from "razorpay";
import { env } from "@/lib/env";

let client: Razorpay | null = null;

/** Lazily-built Razorpay server client (test mode keys). */
export function getRazorpay(): Razorpay {
  if (!client) {
    client = new Razorpay({
      key_id: env.razorpayKeyId(),
      key_secret: env.razorpayKeySecret(),
    });
  }
  return client;
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

/** Verify the signature returned by Razorpay Checkout on the client. */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
): boolean {
  const expected = crypto
    .createHmac("sha256", env.razorpayKeySecret())
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return safeEqual(expected, signature);
}

/** Verify the X-Razorpay-Signature header on a webhook delivery. */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const expected = crypto
    .createHmac("sha256", env.razorpayWebhookSecret())
    .update(rawBody)
    .digest("hex");
  return safeEqual(expected, signature);
}
