import Link from "next/link";
import { BadgeCheck, Download, FileText, Star } from "lucide-react";
import type { Profile } from "@prisma/client";
import { Avatar } from "@/components/ui/Avatar";
import { CreatorBadge } from "@/components/CreatorBadge";
import { tierOf, type CreatorStats } from "@/lib/reputation";
import { formatNumber } from "@/lib/format";

export function CreatorCard({
  creator,
  stats,
  rank,
}: {
  creator: Profile;
  stats: CreatorStats;
  rank?: number;
}) {
  const tier = tierOf(stats);

  return (
    <Link href={`/creators/${creator.username}`} className="block h-full">
      <article className="lift flex h-full flex-col rounded-2xl border border-line bg-surface p-5">
        <div className="flex w-full items-center gap-3">
          <div className="relative">
            <Avatar name={creator.fullName} src={creator.avatarUrl} size={48} />
            {rank !== undefined && rank <= 3 && (
              <span className="absolute -left-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[10px] font-semibold text-bg">
                {rank}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="flex items-center gap-1 truncate font-semibold text-ink">
              {creator.fullName}
              {creator.collegeVerified && (
                <BadgeCheck size={14} className="shrink-0 text-gold" />
              )}
            </p>
            <p className="truncate text-xs text-faint">@{creator.username}</p>
          </div>
        </div>

        <div className="mt-3">
          <CreatorBadge tier={tier} />
        </div>
        {creator.university && (
          <p className="mt-2 line-clamp-1 text-xs text-muted">
            {creator.university}
          </p>
        )}

        <div className="mt-auto flex w-full flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-line pt-3 text-xs text-muted">
          <span className="flex items-center gap-1">
            <FileText size={13} />
            {formatNumber(stats.resourceCount)} resources
          </span>
          <span className="flex items-center gap-1">
            <Download size={13} />
            {formatNumber(stats.totalDownloads)}
          </span>
          {stats.reviewCount > 0 && (
            <span className="flex items-center gap-1">
              <Star size={13} className="fill-gold text-gold" />
              {stats.avgRating.toFixed(1)}
            </span>
          )}
        </div>
      </article>
    </Link>
  );
}
