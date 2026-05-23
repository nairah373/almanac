import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import {
  DoodlePlane,
  DoodleStar,
  DoodleTrail,
} from "@/components/Doodles";

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
    <section
      className={cn(
        "relative mx-auto px-5 pt-12 sm:pt-16",
        containerClassName,
      )}
    >
      {/* A few scattered doodles in the top-right padding area */}
      <DoodleTrail className="pointer-events-none absolute right-12 top-3 hidden h-9 w-24 -rotate-[8deg] text-ink/30 md:block" />
      <DoodlePlane className="pointer-events-none absolute right-2 top-1 hidden h-7 w-10 -rotate-[18deg] text-ink/80 md:block" />
      <DoodleStar className="pointer-events-none absolute right-40 top-6 hidden h-5 w-5 text-indigo-500 lg:block" />

      {eyebrow && (
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">
          <DoodlePlane className="h-3 w-5 -rotate-[10deg]" />
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
