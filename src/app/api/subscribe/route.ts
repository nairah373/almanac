import { type NextRequest } from "next/server";
import { z } from "zod";
import { apiError, apiOk, requireApiProfile } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getRazorpay } from "@/lib/razorpay";
import { env } from "@/lib/env";
import { SUBSCRIPTION_PLANS } from "@/lib/constants";

const schema = z.object({
  plan: z.enum(["MONTHLY", "SIX_MONTH", "YEARLY"]),
});

/**
 * Begin a subscription purchase — returns a Razorpay order for the chosen
 * plan. A one-time payment grants access for the plan's duration; renewing
 * before expiry extends the period.
 */
export async function POST(request: NextRequest) {
  const auth = await requireApiProfile();
  if (auth.response) return auth.response;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("Choose a valid plan.");
  const plan = parsed.data.plan;
  const planInfo = SUBSCRIPTION_PLANS[plan];

  let order;
  try {
    order = await getRazorpay().orders.create({
      amount: planInfo.priceInPaise,
      currency: "INR",
      receipt: `sub_${auth.profile.id.slice(0, 12)}_${Date.now().toString().slice(-6)}`,
      notes: { kind: "subscription", plan, userId: auth.profile.id },
    });
  } catch (err) {
    return apiError(
      err instanceof Error ? err.message : "Could not start checkout.",
      500,
    );
  }

  await prisma.subscription.create({
    data: {
      userId: auth.profile.id,
      plan,
      status: "CREATED",
      amountInPaise: planInfo.priceInPaise,
      razorpayOrderId: order.id,
    },
  });

  return apiOk({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: env.razorpayKeyId(),
    planLabel: planInfo.label,
    buyerName: auth.profile.fullName,
    buyerEmail: auth.profile.email,
  });
}
