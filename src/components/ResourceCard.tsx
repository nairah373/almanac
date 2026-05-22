import Link from "next/link";
import {
  BadgeCheck,
  Download,
  FileQuestion,
  FileText,
  FlaskConical,
  Layers,
  PenLine,
  Presentation,
  Sigma,
  type LucideIcon,
} from "lucide-react";
import type { ResourceType } from "@prisma/client";
import type { ResourceCard as ResourceCardData } from "@/lib/queries";
import { RESOURCE_TYPE_META } from "@/lib/constants";
import { formatINR, formatNumber } from "@/lib/format";
import { StarRating } from "@/components/ui/StarRating";
import { Avatar } from "@/components/ui/Avatar";

// A colour + icon per resource type — gives every card a vivid cover.
const TYPE_STYLE: Record<
  ResourceType,
  { from: string; to: string; icon: LucideIcon }
> = {
  HANDWRITTEN: { from: "#fbbf24", to: "#f97316", icon: PenLine },
  TYPED: { from: "#818cf8", to: "#8b5cf6", icon: FileText },
  PPT_SUMMARY: { from: "#fb7185", to: "#ec4899", icon: Presentation },
  LAB_RECORD: { from: "#2dd4bf", to: "#10b981", icon: FlaskConical },
  PYQ: { from: "#38bdf8", to: "#3b82f6", icon: FileQuestion },
  FORMULA_SHEET: { from: "#e879f9", to: "#a855f7", icon: Sigma },
  FLASHCARDS: { from: "#22d3ee", to: "#14b8a6", icon: Layers },
};

export function ResourceCard({ resource }: { resource: ResourceCardData }) {
  const type = RESOURCE_TYPE_META[resource.resourceType];
  const style = TYPE_STYLE[resource.resourceType];
  const CoverIcon = style.icon;

  return (
    <Link href={`/resources/${resource.id}`} className="group block h-full">
      <article className="lift flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface">
        {/* Coloured cover */}
        <div
          className="relative h-28 overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(135deg, ${style.from}, ${style.to})`,
          }}
        >
          <CoverIcon
            size={104}
            strokeWidth={1}
            className="absolute -bottom-5 -right-3 text-white/25"
          />
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-semibold text-ink">
            {type.short}
          </span>
          <span className="absolute right-3 top-3 rounded-full bg-ink/85 px-2.5 py-0.5 text-[11px] font-semibold text-white">
            {resource.isFree ? "Free" : formatINR(resource.priceInPaise)}
          </span>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col p-4">
          <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-ink group-hover:text-ink-soft">
            {resource.title}
          </h3>
          <p className="mt-1 line-clamp-1 text-xs text-muted">
            {resource.subject} · Semester {resource.semester} · {resource.branch}
          </p>

          <div className="mt-3 flex items-center gap-1.5 text-xs text-muted">
            <StarRating value={resource.avgRating} size={13} />
            <span>
              {resource.avgRating > 0 ? resource.avgRating.toFixed(1) : "New"}
            </span>
            {resource.reviewCount > 0 && (
              <span className="text-faint">({resource.reviewCount})</span>
            )}
          </div>

          <div className="mt-auto flex items-center justify-between gap-2 border-t border-line pt-3">
            <span className="flex min-w-0 items-center gap-1.5">
              <Avatar
                name={resource.creator.fullName}
                src={resource.creator.avatarUrl}
                size={22}
              />
              <span className="truncate text-xs text-ink-soft">
                {resource.creator.fullName}
              </span>
              {resource.creator.collegeVerified && (
                <BadgeCheck size={13} className="shrink-0 text-gold" />
              )}
            </span>
            <span className="flex shrink-0 items-center gap-1 text-xs text-faint">
              <Download size={12} />
              {formatNumber(resource.downloadCount)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
