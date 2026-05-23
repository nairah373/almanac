import { type NextRequest } from "next/server";
import { apiError, apiOk, requireApiProfile } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { removeResourceFiles } from "@/lib/storage";

/**
 * Permanently delete the signed-in user's account.
 *
 * Order matters: clean up storage objects first (best-effort), then drop the
 * Profile row (cascades to resources / purchases / reviews / follows), then
 * delete the Supabase auth user so they can no longer sign in.
 */
export async function DELETE(_request: NextRequest) {
  const auth = await requireApiProfile();
  if (auth.response) return auth.response;
  const profile = auth.profile;

  // Best-effort cleanup of uploaded files. Failures are ignored — the DB
  // delete below removes the rows that reference these files.
  const resources = await prisma.resource.findMany({
    where: { creatorId: profile.id },
    select: { originalKey: true, previewKey: true },
  });
  for (const r of resources) {
    try {
      await removeResourceFiles(r.originalKey, r.previewKey);
    } catch {
      // ignore
    }
  }

  // Cascade-delete app data via the Profile row.
  try {
    await prisma.profile.delete({ where: { id: profile.id } });
  } catch (err) {
    return apiError(
      err instanceof Error ? err.message : "Could not delete profile.",
      500,
    );
  }

  // Remove the Supabase auth user so they can't sign back in.
  try {
    const admin = createSupabaseAdminClient();
    await admin.auth.admin.deleteUser(profile.id);
  } catch (err) {
    // App data is already gone; surface the failure so we can log it.
    return apiError(
      err instanceof Error
        ? `Account data deleted, but sign-in could not be revoked: ${err.message}`
        : "Account data deleted, but sign-in could not be revoked.",
      500,
    );
  }

  return apiOk({ ok: true });
}
