import type { Metadata } from "next";
import { Users } from "lucide-react";
import { getTopCreators } from "@/lib/queries";
import { CreatorCard } from "@/components/CreatorCard";
import { PageHero } from "@/components/PageHero";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Top creators",
  description:
    "The most trusted student creators on Almanac, ranked by reputation.",
};

export default async function CreatorsPage() {
  const creators = await getTopCreators(24).catch(() => []);

  return (
    <div>
      <PageHero
        eyebrow="The community"
        title="Top creators"
        description="The students whose resources the community trusts most — ranked by reputation across uploads, downloads and ratings."
      />

      <div className="mx-auto max-w-6xl px-5 py-10">
        {creators.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {creators.map((c, i) => (
              <CreatorCard
                key={c.creator.id}
                creator={c.creator}
                stats={c.stats}
                rank={i + 1}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title="No creators yet"
            description="Be the first to upload a resource and claim the leaderboard."
          />
        )}
      </div>
    </div>
  );
}
