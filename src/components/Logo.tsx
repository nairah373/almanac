import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/cn";

export function Logo({
  className,
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2.5", className)}
      aria-label={`${APP_NAME} home`}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-bg">
        <span className="display text-lg leading-none">A</span>
      </span>
      <span className="display text-xl tracking-tight text-ink">{APP_NAME}</span>
    </Link>
  );
}
