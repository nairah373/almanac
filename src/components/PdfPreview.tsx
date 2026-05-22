import { FileText } from "lucide-react";

/**
 * Renders the public preview PDF (first pages only) inline via the browser's
 * native PDF viewer. The full file is never exposed here.
 */
export function PdfPreview({
  url,
  title,
}: {
  url: string | null;
  title: string;
}) {
  if (!url) {
    return (
      <div className="flex h-[420px] flex-col items-center justify-center rounded-xl border border-dashed border-line-strong bg-surface-2 text-muted">
        <FileText size={28} strokeWidth={1.5} />
        <p className="mt-2 text-sm">Preview is being prepared</p>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface-2">
      <iframe
        src={`${url}#view=FitH&toolbar=0`}
        title={`${title} — preview`}
        className="h-[520px] w-full"
        loading="lazy"
      />
    </div>
  );
}
