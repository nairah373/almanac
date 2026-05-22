import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BadgeCheck, FileText } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import {
  getCreatorByUsername,
  getCreatorResources,
  getCreatorStats,
  isFollowing,
} from "@/lib/queries";
import { formatNumber } from "@/lib/format";
import { reputationScore, tierOf, TIER_META } from "@/lib/reputation";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { CreatorBadge } from "@/components/CreatorBadge";
import { ResourceGrid } from "@/components/ResourceGrid";
import { FollowButton } from "@/components/FollowButton";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const creator = await getCreatorByUsername(username).catch(() => null);
  if (!creator) return { title: "Creator not found" };
  return {
    title: `${creator.fullName} (@${creator.username})`,
    description:
      creator.bio ?? `Study resources shared by ${creator.fullName} on Almanac.`,
  };
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-bg px-4 py-3">
      <p className="text-lg font-semibold text-ink">{value}</p>
      <p className="text-xs text-faint">{label}</p>
    </div>
  );
}

export default async function CreatorPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const creator = await getCreatorByUsername(username).catch(() => null);
  if (!creator) notFound();

  const [stats, resources, viewer] = await Promise.all([
    getCreatorStats(creator.id),
    getCreatorResources(creator.id),
    getCurrentProfile().catch(() => null),
  ]);

  const tier = tierOf(stats);
  const isSelf = viewer?.id === creator.id;
  const following =
    viewer && !isSelf ? await isFollowing(viewer.id, creator.id) : false;

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <Avatar
            name={creator.fullName}
            src={creator.avatarUrl}
            size={84}
            className="shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="display text-2xl text-ink sm:text-3xl">
                {creator.fullName}
              </h1>
              {creator.collegeVerified && (
                <BadgeCheck size={18} className="text-gold" />
              )}
            </div>
            <p className="mt-0.5 text-sm text-faint">@{creator.username}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <CreatorBadge tier={tier} />
              <span className="text-xs text-muted">{TIER_META[tier].blurb}</span>
            </div>
            {(creator.university || creator.branch) && (
              <p className="mt-2 text-sm text-ink-soft">
                {[creator.branch, creator.university]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
            {creator.bio && (
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
                {creator.bio}
              </p>
            )}
          </div>
          {!isSelf && (
            <div className="shrink-0">
              <FollowButton
                creatorId={creator.id}
                creatorUsername={creator.username}
                initialFollowing={following}
                isSignedIn={!!viewer}
              />
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Resources" value={formatNumber(stats.resourceCount)} />
          <Stat label="Downloads" value={formatNumber(stats.totalDownloads)} />
          <Stat
            label="Average rating"
            value={stats.reviewCount > 0 ? stats.avgRating.toFixed(1) : "—"}
          />
          <Stat label="Followers" value={formatNumber(stats.followerCount)} />
        </div>
        <p className="mt-3 text-xs text-faint">
          Reputation score: {formatNumber(reputationScore(stats))}
        </p>
      </div>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-faint">
          Published resources ({resources.length})
        </h2>
        <div className="mt-5">
          {resources.length > 0 ? (
            <ResourceGrid resources={resources} />
          ) : (
            <EmptyState
              icon={FileText}
              title="No resources yet"
              description={
                isSelf
                  ? "Upload your first resource to start building your reputation."
                  : `${creator.fullName} hasn't published any resources yet.`
              }
            />
          )}
        </div>
      </section>
    </div>
  );
}
