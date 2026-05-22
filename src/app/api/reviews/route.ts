import { type NextRequest } from "next/server";
import { z } from "zod";
import { apiError, apiOk, requireApiProfile } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  resourceId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
});

/** Create or update the signed-in user's review for a resource. */
export async function POST(request: NextRequest) {
  const auth = await requireApiProfile();
  if (auth.response) return auth.response;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid review.");
  }
  const { resourceId, rating, comment } = parsed.data;

  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
  });
  if (!resource) return apiError("Resource not found.", 404);
  if (resource.creatorId === auth.profile.id) {
    return apiError("You can't review your own resource.");
  }

  const purchase = await prisma.purchase.findUnique({
    where: {
      buyerId_resourceId: { buyerId: auth.profile.id, resourceId },
    },
  });
  if (!purchase || (purchase.status !== "PAID" && purchase.status !== "FREE")) {
    return apiError(
      "Only students who downloaded this resource can review it.",
      403,
    );
  }

  await prisma.review.upsert({
    where: {
      resourceId_authorId: { resourceId, authorId: auth.profile.id },
    },
    create: {
      resourceId,
      authorId: auth.profile.id,
      rating,
      comment: comment || null,
    },
    update: { rating, comment: comment || null },
  });

  return apiOk({ ok: true });
}
