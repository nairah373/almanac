/**
 * Creator reputation & tiers.
 * Reputation is computed from aggregates so it is always consistent with
 * the data — there is no stored score to drift out of sync.
 */

export type CreatorStats = {
  resourceCount: number;
  totalDownloads: number;
  avgRating: number; // 0–5
  reviewCount: number;
  followerCount: number;
};

export type Tier = "NEW" | "RISING" | "TRUSTED" | "ELITE";

export function reputationScore(s: CreatorStats): number {
  return Math.round(
    s.resourceCount * 12 +
      s.totalDownloads * 3 +
      s.avgRating * s.reviewCount * 8 +
      s.followerCount * 6,
  );
}

export function creatorTier(score: number): Tier {
  if (score >= 1500) return "ELITE";
  if (score >= 500) return "TRUSTED";
  if (score >= 120) return "RISING";
  return "NEW";
}

export const TIER_META: Record<
  Tier,
  { label: string; blurb: string; rank: number }
> = {
  NEW: { label: "New Contributor", blurb: "Just getting started", rank: 0 },
  RISING: {
    label: "Rising Creator",
    blurb: "Building a trusted catalogue",
    rank: 1,
  },
  TRUSTED: {
    label: "Trusted Creator",
    blurb: "Consistently high-quality resources",
    rank: 2,
  },
  ELITE: {
    label: "Elite Creator",
    blurb: "Top of the academic community",
    rank: 3,
  },
};

export function tierOf(stats: CreatorStats): Tier {
  return creatorTier(reputationScore(stats));
}
