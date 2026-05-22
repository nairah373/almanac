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
