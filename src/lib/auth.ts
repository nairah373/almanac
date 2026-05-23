import type { Profile } from "@prisma/client";
import type { User } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** The authenticated Supabase user for this request, or null. */
export async function getSessionUser(): Promise<User | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    return data.user ?? null;
  } catch {
    return null;
  }
}

function slugifyUsername(input: string): string {
  const base = input.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 18);
  return base.length >= 3 ? base : `student${base}`;
}

async function uniqueUsername(seed: string): Promise<string> {
  const base = slugifyUsername(seed);
  let candidate = base;
  for (let i = 0; i < 50; i++) {
    const taken = await prisma.profile.findUnique({ where: { username: candidate } });
    if (!taken) return candidate;
    candidate = `${base}${Math.floor(1000 + Math.random() * 9000)}`;
  }
  return `${base}${Date.now().toString().slice(-6)}`;
}

/** Find the app Profile for a Supabase user, creating it on first sight. */
export async function ensureProfile(user: User): Promise<Profile> {
  const existing = await prisma.profile.findUnique({ where: { id: user.id } });
  if (existing) return existing;

  const email = user.email ?? `${user.id}@placeholder.local`;
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const fullName =
    (meta.full_name as string) ||
    (meta.name as string) ||
    email.split("@")[0];
  const avatarUrl =
    (meta.avatar_url as string) || (meta.picture as string) || null;
  const username = await uniqueUsername(
    (meta.user_name as string) || email.split("@")[0],
  );
  const metaRole = typeof meta.role === "string" ? meta.role : "";
  const role: "STUDENT" | "CREATOR" | "COACHING" =
    metaRole === "CREATOR"
      ? "CREATOR"
      : metaRole === "COACHING"
        ? "COACHING"
        : "STUDENT";

  try {
    return await prisma.profile.create({
      data: { id: user.id, email, fullName, username, avatarUrl, role },
    });
  } catch {
    // Lost a creation race — the row now exists.
    const row = await prisma.profile.findUnique({ where: { id: user.id } });
    if (row) return row;
    throw new Error("Could not create profile");
  }
}

/** The current user's Profile, or null if signed out. */
export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getSessionUser();
  if (!user) return null;
  return ensureProfile(user);
}
