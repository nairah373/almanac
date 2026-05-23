"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MailCheck, Wrench } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";

function GoogleMark() {
  return (
    <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
      />
    </svg>
  );
}

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const role = params.get("role");

  const [loading, setLoading] = useState<null | "email" | "google">(null);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  async function handleGoogle() {
    setError(null);
    setLoading("google");
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(null);
    }
  }

  async function handleEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading("email");
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const fullName = String(form.get("fullName") ?? "").trim();
    const supabase = createSupabaseBrowserClient();

    try {
      if (mode === "signup") {
        const metadata: Record<string, string> = { full_name: fullName };
        if (role === "creator") metadata.role = "CREATOR";
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: metadata,
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          },
        });
        if (error) throw error;
        if (data.session) {
          router.push(next);
          router.refresh();
          return;
        }
        // Email confirmation is enabled — ask the user to check their inbox.
        setEmailSent(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push(next);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(null);
    }
  }

  // If the project hasn't been connected to Supabase yet, don't try to call
  // it — show a friendly notice instead of crashing on click.
  const isSupabaseReady = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  if (!isSupabaseReady) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
            <Wrench size={16} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-ink">
              Sign-in isn&apos;t connected yet
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              Almanac needs a Supabase project to handle accounts. Copy{" "}
              <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs text-amber-800">
                .env.example
              </code>{" "}
              to{" "}
              <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs text-amber-800">
                .env
              </code>{" "}
              and follow{" "}
              <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs text-amber-800">
                SETUP.md
              </code>{" "}
              to connect one.
            </p>
            <p className="mt-2 text-sm text-muted">
              Until then you can still browse the site as a guest.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (emailSent) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-success">
          <MailCheck size={22} />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-ink">
          Confirm your email
        </h2>
        <p className="mt-1.5 text-sm text-muted">
          We sent a confirmation link to your inbox. Open it to activate your
          account and start exploring.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button
        type="button"
        variant="secondary"
        onClick={handleGoogle}
        disabled={loading !== null}
        className="w-full"
      >
        {loading === "google" ? <Spinner size={16} /> : <GoogleMark />}
        Continue with Google
      </Button>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="text-xs text-faint">or</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={handleEmail} className="space-y-4">
        {mode === "signup" && (
          <Input
            label="Full name"
            name="fullName"
            type="text"
            placeholder="Ananya Sharma"
            autoComplete="name"
            required
          />
        )}
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="you@college.edu"
          autoComplete="email"
          required
        />
        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          minLength={6}
          required
        />

        {error && (
          <p className="rounded-lg bg-danger/8 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={loading !== null}
          className="w-full"
        >
          {loading === "email" && <Spinner size={16} />}
          {mode === "signup" ? "Create account" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
