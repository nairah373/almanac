import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

/** Read-only star rating with smooth partial fill. */
export function StarRating({
  value,
  size = 14,
  className,
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  const stars = (fill: string) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} size={size} className={fill} strokeWidth={1.5} />
    ));

  return (
    <span
      className={cn("relative inline-flex", className)}
      aria-label={`${value.toFixed(1)} out of 5`}
    >
      <span className="flex">{stars("text-line-strong")}</span>
      <span
        className="absolute inset-0 flex overflow-hidden"
        style={{ width: `${pct}%` }}
      >
        {stars("fill-gold text-gold")}
      </span>
    </span>
  );
}
