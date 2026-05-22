import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Consistent page header — eyebrow, title and description. The background
 * comes from the site-wide AuroraBackdrop, so this stays transparent.
 */
export function PageHero({
  eyebrow,
  title,
  description,
  children,
  containerClassName = "max-w-6xl",
}: {
  eyebrow?: string;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  containerClassName?: string;
}) {
  return (
    <section className={cn("mx-auto px-5 pt-12 sm:pt-16", containerClassName)}>
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">
          {eyebrow}
        </p>
      )}
      {title && (
        <h1 className="display mt-1.5 text-3xl text-ink sm:text-4xl">{title}</h1>
      )}
      {description && (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          {description}
        </p>
      )}
      {children}
    </section>
  );
}
