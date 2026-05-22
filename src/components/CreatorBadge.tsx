import { Award } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { TIER_META, type Tier } from "@/lib/reputation";

/** A creator's reputation tier rendered as a pill. */
export function CreatorBadge({
  tier,
  className,
}: {
  tier: Tier;
  className?: string;
}) {
  const meta = TIER_META[tier];
  const variant =
    tier === "ELITE" ? "gold" : tier === "TRUSTED" ? "ink" : "outline";
  return (
    <Badge variant={variant} className={className}>
      <Award size={11} strokeWidth={2} />
      {meta.label}
    </Badge>
  );
}
