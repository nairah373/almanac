import Image from "next/image";
import { cn } from "@/lib/cn";
import { initials } from "@/lib/format";

export function Avatar({
  name,
  src,
  size = 40,
  className,
}: {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={size}
        height={size}
        className={cn(
          "rounded-full object-cover border border-line",
          className,
        )}
      />
    );
  }
  return (
    <span
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full",
        "bg-surface-2 text-ink-soft font-medium border border-line",
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
