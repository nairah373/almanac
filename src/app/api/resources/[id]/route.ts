import { type NextRequest } from "next/server";
import { apiError, apiOk, requireApiProfile } from "@/lib/api";
import { prisma } from "@/lib/prisma";

/** Remove a resource from the catalogue (soft delete — buyers keep access). */
export async function DELETE(
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

  await prisma.resource.update({
    where: { id },
    data: { status: "REMOVED" },
  });
  return apiOk({ ok: true });
}
