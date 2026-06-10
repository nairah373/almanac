import { type NextRequest } from "next/server";
import { apiError, requireApiProfile } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { hasActiveSubscription } from "@/lib/queries";
import { downloadOriginal } from "@/lib/storage";
import { watermarkPdf } from "@/lib/pdf";

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "resource"
  );
}

/**
 * Stream the full resource as a PDF watermarked with the buyer's identity.
 * Access requires ownership of the resource or a completed/free purchase.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiProfile();
  if (auth.response) return auth.response;
  const { id } = await params;

  const resource = await prisma.resource.findUnique({ where: { id } });
  if (!resource) return apiError("Resource not found.", 404);

  const isOwner = resource.creatorId === auth.profile.id;

  // Access requires ownership or an active subscription.
  if (!isOwner) {
    if (resource.status !== "PUBLISHED") {
      return apiError("This resource is not available.", 404);
    }
    const subscribed = await hasActiveSubscription(auth.profile.id);
    if (!subscribed) {
      return apiError("Subscribe to download this resource.", 403);
    }

    // Record the download in the student's library (once) and bump the count.
    const existing = await prisma.purchase.findUnique({
      where: {
        buyerId_resourceId: { buyerId: auth.profile.id, resourceId: id },
      },
    });
    if (!existing) {
      await prisma.$transaction([
        prisma.purchase.create({
          data: {
            buyerId: auth.profile.id,
            resourceId: id,
            creatorId: resource.creatorId,
            status: "FREE",
            amountInPaise: 0,
          },
        }),
        prisma.resource.update({
          where: { id },
          data: { downloadCount: { increment: 1 } },
        }),
      ]);
    }
  }

  let original: Uint8Array;
  try {
    original = await downloadOriginal(resource.originalKey);
  } catch {
    return apiError("The file is currently unavailable.", 404);
  }

  const stamped = await watermarkPdf(original, [
    `Licensed to ${auth.profile.fullName}`,
    auth.profile.email,
    `Almanac · ${new Date().toISOString().slice(0, 10)}`,
  ]);

  return new Response(new Blob([stamped as BlobPart], { type: "application/pdf" }), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${slugify(resource.title)}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
