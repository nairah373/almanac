import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";
import { DoodlePlane, DoodleSparkle } from "@/components/Doodles";

export default function NotFound() {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <DoodlePlane className="pointer-events-none absolute right-16 top-20 hidden h-8 w-12 -rotate-[20deg] text-ink/80 md:block" />
      <DoodleSparkle className="pointer-events-none absolute bottom-24 left-20 hidden h-7 w-7 text-pink-500 md:block" />
      <div className="mx-auto flex max-w-md flex-col items-center px-5 py-24 text-center">
        <p className="display text-7xl text-line-strong">404</p>
        <h1 className="mt-4 text-xl font-semibold text-ink">Page not found</h1>
        <p className="mt-2 text-sm text-muted">
          The page you are looking for does not exist or may have moved.
        </p>
        <Link href="/" className={buttonVariants({ className: "mt-6" })}>
          Back to home
        </Link>
      </div>
    </div>
  );
}
