import { type NextRequest } from "next/server";
import { z } from "zod";
import { apiError, apiOk, requireApiProfile } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getRazorpay } from "@/lib/razorpay";
import { splitAmount } from "@/lib/commission";
import { env } from "@/lib/env";

const schema = z.object({ resourceId: z.string().min(1) });

/**
 * Begin a purchase. Free resources are granted instantly; paid resources
 * return a Razorpay order for the browser checkout.
 */
export async function POST(request: NextRequest) {
  const auth = await requireApiProfile();
  if (auth.response) return auth.response;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("Invalid request.");

  const resource = await prisma.resource.findUnique({
    where: { id: parsed.data.resourceId },
  });
  if (!resource || resource.status !== "PUBLISHED") {
    return apiError("This resource is not available.", 404);
  }
  if (resource.creatorId === auth.profile.id) {
    return apiError("You can't buy your own resource.");
  }

  const where = {
    buyerId_resourceId: {
      buyerId: auth.profile.id,
      resourceId: resource.id,
    },
  };
  const existing = await prisma.purchase.findUnique({ where });
  if (existing && (existing.status === "PAID" || existing.status === "FREE")) {
    return apiOk({ alreadyOwned: true });
  }

  // Free resource — grant access immediately.
  if (resource.isFree || resource.priceInPaise === 0) {
    await prisma.$transaction([
      prisma.purchase.upsert({
        where,
        create: {
          buyerId: auth.profile.id,
          resourceId: resource.id,
          creatorId: resource.creatorId,
          status: "FREE",
          amountInPaise: 0,
        },
        update: { status: "FREE" },
      }),
      prisma.resource.update({
        where: { id: resource.id },
        data: { downloadCount: { increment: 1 } },
      }),
    ]);
    return apiOk({ free: true });
  }

  // Paid resource — create a Razorpay order (test mode).
  const split = splitAmount(resource.priceInPaise);
  let order;
  try {
    order = await getRazorpay().orders.create({
      amount: resource.priceInPaise,
      currency: "INR",
      receipt: `rcpt_${resource.id.slice(0, 14)}_${Date.now().toString().slice(-6)}`,
      notes: { resourceId: resource.id, buyerId: auth.profile.id },
    });
  } catch (err) {
    return apiError(
      err instanceof Error ? err.message : "Could not start checkout.",
      500,
    );
  }

  await prisma.purchase.upsert({
    where,
    create: {
      buyerId: auth.profile.id,
      resourceId: resource.id,
      creatorId: resource.creatorId,
      status: "CREATED",
      amountInPaise: split.amountInPaise,
      platformFeeInPaise: split.platformFeeInPaise,
      creatorEarningInPaise: split.creatorEarningInPaise,
      razorpayOrderId: order.id,
    },
    update: {
      status: "CREATED",
      amountInPaise: split.amountInPaise,
      platformFeeInPaise: split.platformFeeInPaise,
      creatorEarningInPaise: split.creatorEarningInPaise,
      razorpayOrderId: order.id,
    },
  });

  return apiOk({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: env.razorpayKeyId(),
    resourceTitle: resource.title,
    buyerName: auth.profile.fullName,
    buyerEmail: auth.profile.email,
  });
}
