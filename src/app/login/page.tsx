import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth";
import { AuthForm } from "@/components/AuthForm";
import {
  DoodlePlane,
  DoodleSparkle,
  DoodleTrail,
} from "@/components/Doodles";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Almanac account.",
};

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/dashboard");

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center">
      <DoodleTrail className="pointer-events-none absolute right-24 top-16 hidden h-10 w-28 -rotate-[10deg] text-ink/30 md:block" />
      <DoodlePlane className="pointer-events-none absolute right-10 top-12 hidden h-8 w-12 -rotate-[15deg] text-ink/80 md:block" />
      <DoodleSparkle className="pointer-events-none absolute bottom-16 left-12 hidden h-7 w-7 text-pink-500 md:block" />
      <div className="mx-auto w-full max-w-md px-5 py-16">
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8">
          <h1 className="display text-3xl text-ink">Welcome back</h1>
          <p className="mt-2 text-sm text-muted">
            Sign in to reach your library and continue learning.
          </p>

          <div className="mt-8">
            <Suspense fallback={<div className="h-72" />}>
              <AuthForm mode="login" />
            </Suspense>
          </div>

          <p className="mt-6 text-center text-sm text-muted">
            New to Almanac?{" "}
            <Link
              href="/signup"
              className="font-medium text-ink underline-offset-2 hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
