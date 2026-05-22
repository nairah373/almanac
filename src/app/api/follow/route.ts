import { type NextRequest } from "next/server";
import { z } from "zod";
import { apiError, apiOk, requireApiProfile } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const schema = z.object({ creatorId: z.string().uuid() });

/** Toggle the signed-in user's follow on a creator. */
export async function POST(request: NextRequest) {
  const auth = await requireApiProfile();
  if (auth.response) return auth.response;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("Invalid request.");
  const { creatorId } = parsed.data;

  if (creatorId === auth.profile.id) {
    return apiError("You can't follow yourself.");
  }

  const creator = await prisma.profile.findUnique({ where: { id: creatorId } });
  if (!creator) return apiError("Creator not found.", 404);

  const key = {
    followerId_creatorId: { followerId: auth.profile.id, creatorId },
  };
  const existing = await prisma.follow.findUnique({ where: key });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
    return apiOk({ following: false });
  }

  await prisma.follow.create({
    data: { followerId: auth.profile.id, creatorId },
  });
  return apiOk({ following: true });
}
