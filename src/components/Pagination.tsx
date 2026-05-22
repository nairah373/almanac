import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

function Step({
  href,
  children,
}: {
  href: string | null;
  children: React.ReactNode;
}) {
  const base =
    "flex h-9 items-center gap-1 rounded-full border px-4 text-sm transition";
  if (!href) {
    return (
      <span className={cn(base, "border-line text-faint")}>{children}</span>
    );
  }
  return (
    <Link
      href={href}
      className={cn(base, "border-line-strong text-ink-soft hover:border-ink hover:text-ink")}
    >
      {children}
    </Link>
  );
}

/** Minimal prev / next pagination. `makeHref` builds a page URL. */
export function Pagination({
  page,
  pageCount,
  makeHref,
}: {
  page: number;
  pageCount: number;
  makeHref: (page: number) => string;
}) {
  if (pageCount <= 1) return null;
  return (
    <nav className="mt-10 flex items-center justify-center gap-3">
      <Step href={page > 1 ? makeHref(page - 1) : null}>
        <ChevronLeft size={15} />
        Previous
      </Step>
      <span className="text-sm text-muted">
        Page {page} of {pageCount}
      </span>
      <Step href={page < pageCount ? makeHref(page + 1) : null}>
        Next
        <ChevronRight size={15} />
      </Step>
    </nav>
  );
}
