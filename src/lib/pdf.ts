import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";

/**
 * Build the public preview PDF: the first `maxPages` pages of the original,
 * each stamped with a faint "PREVIEW" mark. Also reports the true page count.
 */
export async function generatePreviewPdf(
  originalBytes: Uint8Array,
  maxPages: number,
): Promise<{ bytes: Uint8Array; pageCount: number }> {
  const src = await PDFDocument.load(originalBytes, { ignoreEncryption: true });
  const pageCount = src.getPageCount();

  const out = await PDFDocument.create();
  const take = Math.max(1, Math.min(maxPages, pageCount));
  const copied = await out.copyPages(
    src,
    Array.from({ length: take }, (_, i) => i),
  );
  copied.forEach((p) => out.addPage(p));

  const font = await out.embedFont(StandardFonts.HelveticaBold);
  for (const page of out.getPages()) {
    const { width, height } = page.getSize();
    page.drawText("PREVIEW", {
      x: width / 2 - 150,
      y: height / 2 - 30,
      size: 64,
      font,
      color: rgb(0.84, 0.83, 0.8),
      rotate: degrees(38),
      opacity: 0.4,
    });
  }

  const bytes = await out.save();
  return { bytes, pageCount };
}

/** Detect the file's true format by reading its magic bytes. */
export function detectFileKind(
  bytes: Uint8Array,
): "pdf" | "png" | "jpeg" | "unknown" {
  if (bytes.length < 4) return "unknown";
  if (
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46
  ) {
    return "pdf"; // %PDF
  }
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "png";
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "jpeg";
  }
  return "unknown";
}

/**
 * Wrap a JPEG or PNG image in a single-page PDF so it can flow through the
 * same preview + watermark pipeline as native PDF uploads.
 */
export async function imageToPdf(
  imageBytes: Uint8Array,
  kind: "png" | "jpeg",
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const img =
    kind === "png"
      ? await doc.embedPng(imageBytes)
      : await doc.embedJpg(imageBytes);

  // Cap the page dimensions so a very-high-res photo doesn't make the PDF huge.
  const maxDim = 2000;
  let { width, height } = img.size();
  if (width > maxDim || height > maxDim) {
    const scale = Math.min(maxDim / width, maxDim / height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const page = doc.addPage([width, height]);
  page.drawImage(img, { x: 0, y: 0, width, height });
  return doc.save();
}

/**
 * Stamp a buyer-identity watermark along the bottom of every page so a
 * leaked copy is traceable. Returns the watermarked PDF bytes.
 */
export async function watermarkPdf(
  originalBytes: Uint8Array,
  lines: string[],
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(originalBytes, { ignoreEncryption: true });
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const label = lines.filter(Boolean).join("   •   ");
  const size = 8;

  for (const page of doc.getPages()) {
    const { width } = page.getSize();
    const textWidth = font.widthOfTextAtSize(label, size);
    page.drawText(label, {
      x: Math.max(16, (width - textWidth) / 2),
      y: 14,
      size,
      font,
      color: rgb(0.45, 0.45, 0.45),
      opacity: 0.65,
    });
  }

  return doc.save();
}
