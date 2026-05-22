import { cn } from "@/lib/cn";

type Variant = "neutral" | "outline" | "ink" | "gold" | "success";

const VARIANTS: Record<Variant, string> = {
  neutral: "bg-surface-2 text-ink-soft",
  outline: "border border-line-strong text-ink-soft",
  ink: "bg-ink text-bg",
  gold: "bg-gold/12 text-gold border border-gold/25",
  success: "bg-success/12 text-success border border-success/25",
};

export function Badge({
  variant = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide",
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}
