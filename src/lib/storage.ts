import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { BUCKET_ORIGINALS, BUCKET_PREVIEWS } from "@/lib/constants";

/** A signed URL the browser can upload the original file straight into. */
export async function createOriginalUploadUrl(path: string) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.storage
    .from(BUCKET_ORIGINALS)
    .createSignedUploadUrl(path);
  if (error || !data) {
    throw new Error(error?.message ?? "Could not create an upload URL");
  }
  return { path: data.path, token: data.token, signedUrl: data.signedUrl };
}

/** Download the private original as bytes (server only). */
export async function downloadOriginal(path: string): Promise<Uint8Array> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.storage.from(BUCKET_ORIGINALS).download(path);
  if (error || !data) {
    throw new Error(error?.message ?? "Original file not found");
  }
  return new Uint8Array(await data.arrayBuffer());
}

/** Upload (or replace) the public preview PDF. */
export async function uploadPreview(path: string, bytes: Uint8Array): Promise<void> {
  const admin = createSupabaseAdminClient();
  const { error } = await admin.storage
    .from(BUCKET_PREVIEWS)
    .upload(path, new Blob([bytes as BlobPart], { type: "application/pdf" }), {
      contentType: "application/pdf",
      upsert: true,
    });
  if (error) throw new Error(error.message);
}

/**
 * Replace the file stored at the originals bucket path — used when an image
 * upload is converted into a single-page PDF at publish time.
 */
export async function uploadOriginal(path: string, bytes: Uint8Array): Promise<void> {
  const admin = createSupabaseAdminClient();
  const { error } = await admin.storage
    .from(BUCKET_ORIGINALS)
    .upload(path, new Blob([bytes as BlobPart], { type: "application/pdf" }), {
      contentType: "application/pdf",
      upsert: true,
    });
  if (error) throw new Error(error.message);
}

/** Public URL for a preview PDF. */
export function previewPublicUrl(path: string): string {
  const admin = createSupabaseAdminClient();
  return admin.storage.from(BUCKET_PREVIEWS).getPublicUrl(path).data.publicUrl;
}

/** Best-effort cleanup of stored files for a resource. */
export async function removeResourceFiles(
  originalKey: string,
  previewKey: string | null,
): Promise<void> {
  const admin = createSupabaseAdminClient();
  await admin.storage.from(BUCKET_ORIGINALS).remove([originalKey]);
  if (previewKey) {
    await admin.storage.from(BUCKET_PREVIEWS).remove([previewKey]);
  }
}
