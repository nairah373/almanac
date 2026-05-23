import { type NextRequest } from "next/server";
import { apiError, apiOk, requireApiProfile } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { downloadOriginal, uploadOriginal, uploadPreview } from "@/lib/storage";
import { detectFileKind, generatePreviewPdf, imageToPdf } from "@/lib/pdf";
import { PREVIEW_PAGE_COUNT } from "@/lib/constants";

/**
 * Step 2 of upload: turn the uploaded original into a public preview PDF and
 * publish the resource.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiProfile();
  if (auth.response) return auth.response;
  const { id } = await params;

  const resource = await prisma.resource.findUnique({ where: { id } });
  if (!resource) return apiError("Resource not found.", 404);
  if (resource.creatorId !== auth.profile.id) {
    return apiError("This resource isn't yours.", 403);
  }
  if (resource.status === "PUBLISHED") {
    return apiOk({ ok: true, resourceId: id });
  }

  let original: Uint8Array;
  try {
    original = await downloadOriginal(resource.originalKey);
  } catch {
    return apiError(
      "We couldn't find your uploaded file. Please try uploading again.",
      400,
    );
  }

  // Image uploads get wrapped into a single-page PDF so previews + watermarked
  // downloads keep working through one code path.
  const kind = detectFileKind(original);
  let pdfBytes: Uint8Array;
  if (kind === "pdf") {
    pdfBytes = original;
  } else if (kind === "png" || kind === "jpeg") {
    try {
      pdfBytes = await imageToPdf(original, kind);
    } catch {
      return apiError(
        "We couldn't process that image — try a smaller JPG or PNG.",
        400,
      );
    }
    try {
      await uploadOriginal(resource.originalKey, pdfBytes);
    } catch (err) {
      return apiError(
        err instanceof Error ? err.message : "Could not store the file.",
        500,
      );
    }
  } else {
    return apiError("Only PDF, JPG and PNG files are supported.", 400);
  }

  let previewBytes: Uint8Array;
  let pageCount: number;
  try {
    const preview = await generatePreviewPdf(pdfBytes, PREVIEW_PAGE_COUNT);
    previewBytes = preview.bytes;
    pageCount = preview.pageCount;
  } catch {
    return apiError(
      "We couldn't generate the preview from that file.",
      400,
    );
  }

  const previewKey = `${resource.creatorId}/${resource.id}.pdf`;
  try {
    await uploadPreview(previewKey, previewBytes);
  } catch (err) {
    return apiError(
      err instanceof Error ? err.message : "Could not store the preview.",
      500,
    );
  }

  const published = await prisma.resource.update({
    where: { id },
    data: {
      status: "PUBLISHED",
      previewKey,
      pageCount,
      fileSizeBytes: pdfBytes.length,
    },
  });

  return apiOk({ ok: true, resourceId: published.id });
}
