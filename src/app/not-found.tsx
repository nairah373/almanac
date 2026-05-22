import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
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
