import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "gold";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-ink text-bg hover:bg-ink-soft",
  secondary:
    "bg-surface text-ink border border-line-strong hover:border-ink",
  ghost: "text-ink-soft hover:bg-surface-2 hover:text-ink",
  danger: "bg-danger text-white hover:opacity-90",
  gold: "bg-gold text-white hover:opacity-90",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-7 text-[15px]",
};

/** Shared button styling — also usable on <Link> and <a>. */
export function buttonVariants(opts?: {
  variant?: Variant;
  size?: Size;
  className?: string;
}): string {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-medium",
    "transition-all duration-200 select-none whitespace-nowrap",
    "active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20",
    VARIANTS[opts?.variant ?? "primary"],
    SIZES[opts?.size ?? "md"],
    opts?.className,
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function Button({
  variant,
  size,
  className,
  ...props
}: ButtonProps) {
  return (
    <button className={buttonVariants({ variant, size, className })} {...props} />
  );
}
