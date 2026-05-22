import { NextResponse } from "next/server";
import type { Profile } from "@prisma/client";
import { getCurrentProfile } from "@/lib/auth";

/** A JSON error response. */
export function apiError(message: string, status = 400): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/** A JSON success response. */
export function apiOk<T extends object>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

/**
 * Resolve the signed-in Profile for an API route.
 * Returns either `{ profile }` or a ready-to-return 401 `{ response }`.
 */
export async function requireApiProfile(): Promise<
  { profile: Profile; response?: never } | { profile?: never; response: NextResponse }
> {
  const profile = await getCurrentProfile().catch(() => null);
  if (!profile) {
    return { response: apiError("You need to be signed in to do this.", 401) };
  }
  return { profile };
}
