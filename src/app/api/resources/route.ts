import { randomUUID } from "node:crypto";
import { type NextRequest } from "next/server";
import { ResourceType } from "@prisma/client";
import { z } from "zod";
import { apiError, apiOk, requireApiProfile } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { createOriginalUploadUrl } from "@/lib/storage";
import { MAX_PRICE_INR, MAX_UPLOAD_BYTES, MIN_PRICE_INR } from "@/lib/constants";
import { rupeesToPaise } from "@/lib/format";

const schema = z.object({
  title: z.string().trim().min(6).max(140),
  description: z.string().trim().min(20).max(2000),
  resourceType: z.nativeEnum(ResourceType),
  university: z.string().trim().min(2).max(120),
  branch: z.string().trim().min(2).max(120),
  semester: z.number().int().min(1).max(10),
  subject: z.string().trim().min(2).max(120),
  moduleName: z.string().trim().max(120).optional(),
  examType: z.string().trim().max(80).optional(),
  isFree: z.boolean(),
  priceInRupees: z.number().int().min(0).max(MAX_PRICE_INR).optional(),
  fileSizeBytes: z.number().int().positive().max(MAX_UPLOAD_BYTES),
});

/**
 * Step 1 of upload: create the DRAFT resource and hand back a signed URL the
 * browser uploads the original PDF straight into.
 */
export async function POST(request: NextRequest) {
  const auth = await requireApiProfile();
  if (auth.response) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid request body.");
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid input.");
  }
  const input = parsed.data;

  let priceInPaise = 0;
  if (!input.isFree) {
    const rupees = input.priceInRupees ?? 0;
    if (rupees < MIN_PRICE_INR) {
      return apiError(`Paid resources must cost at least ₹${MIN_PRICE_INR}.`);
    }
    priceInPaise = rupeesToPaise(rupees);
  }

  const originalKey = `${auth.profile.id}/${randomUUID()}.pdf`;

  const resource = await prisma.resource.create({
    data: {
      title: input.title,
      description: input.description,
      resourceType: input.resourceType,
      university: input.university,
      branch: input.branch,
      semester: input.semester,
      subject: input.subject,
      moduleName: input.moduleName || null,
      examType: input.examType || null,
      isFree: input.isFree,
      priceInPaise,
      fileSizeBytes: input.fileSizeBytes,
      originalKey,
      status: "DRAFT",
      creatorId: auth.profile.id,
    },
  });

  try {
    const upload = await createOriginalUploadUrl(originalKey);
    return apiOk({
      resourceId: resource.id,
      uploadPath: upload.path,
      uploadToken: upload.token,
    });
  } catch (err) {
    // Roll back the draft if storage is unreachable.
    await prisma.resource.delete({ where: { id: resource.id } }).catch(() => {});
    return apiError(
      err instanceof Error ? err.message : "Could not start the upload.",
      500,
    );
  }
}
