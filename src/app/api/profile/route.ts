import { type NextRequest } from "next/server";
import { z } from "zod";
import { apiError, apiOk, requireApiProfile } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  fullName: z.string().trim().min(2).max(80),
  username: z
    .string()
    .trim()
    .min(3)
    .max(20)
    .regex(/^[a-z0-9_]+$/, "Username: lowercase letters, numbers, underscores."),
  university: z.string().trim().max(120).optional(),
  branch: z.string().trim().max(120).optional(),
  bio: z.string().trim().max(400).optional(),
});

/** Update the signed-in user's profile. */
export async function PATCH(request: NextRequest) {
  const auth = await requireApiProfile();
  if (auth.response) return auth.response;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid profile.");
  }
  const input = parsed.data;

  if (input.username !== auth.profile.username) {
    const taken = await prisma.profile.findUnique({
      where: { username: input.username },
    });
    if (taken) return apiError("That username is already taken.");
  }

  await prisma.profile.update({
    where: { id: auth.profile.id },
    data: {
      fullName: input.fullName,
      username: input.username,
      university: input.university || null,
      branch: input.branch || null,
      bio: input.bio || null,
    },
  });

  return apiOk({ ok: true });
}
