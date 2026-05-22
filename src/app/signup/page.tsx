import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { BadgeCheck, Eye, GraduationCap } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { AuthForm } from "@/components/AuthForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create account",
  description: "Join Almanac — the trusted academic library for Indian students.",
};

const PERKS = [
  { icon: Eye, text: "Preview every resource before you pay" },
  { icon: BadgeCheck, text: "Buy only from verified student creators" },
  { icon: GraduationCap, text: "Upload your own notes and start earning" },
];

export default async function SignupPage() {
  const user = await getSessionUser();
  if (user) redirect("/dashboard");

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center">
      <div className="mx-auto grid w-full max-w-4xl gap-10 px-5 py-16 md:grid-cols-2 md:items-center">
        <div className="hidden md:block">
          <h2 className="display text-3xl text-ink">
            Join a smarter way to study.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Thousands of students share and discover trusted academic resources
            on Almanac every semester.
          </p>
          <ul className="mt-8 space-y-4">
            {PERKS.map((p) => (
              <li key={p.text} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                  <p.icon size={16} />
                </span>
                <span className="text-sm text-ink-soft">{p.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="w-full rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8">
          <h1 className="display text-2xl text-ink">Create your account</h1>
          <p className="mt-2 text-sm text-muted">
            Join the trusted academic library for Indian students.
          </p>
          <div className="mt-6">
            <Suspense fallback={<div className="h-96" />}>
              <AuthForm mode="signup" />
            </Suspense>
          </div>
          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-ink underline-offset-2 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
