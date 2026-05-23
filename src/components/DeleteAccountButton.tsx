"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Account deletion control with an inline typed-username confirmation so it
 * can't be triggered by accident.
 */
export function DeleteAccountButton({ username }: { username: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function deleteAccount() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Failed to delete account.");
      }
      // Sign the (now nonexistent) user out and bounce to the home page.
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut().catch(() => {});
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-danger/30 bg-danger/5 p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger/15 text-danger">
          <AlertTriangle size={18} />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-ink">Delete account</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            Permanently delete your account and everything you have uploaded,
            downloaded or reviewed. This cannot be undone.
          </p>

          {!confirming ? (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setConfirming(true)}
              className="mt-4"
            >
              Delete my account
            </Button>
          ) : (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-ink">
                To confirm, type your username{" "}
                <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">
                  {username}
                </code>{" "}
                below:
              </p>
              <Input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder={username}
                autoComplete="off"
              />
              {error && <p className="text-xs text-danger">{error}</p>}
              <div className="flex gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={deleteAccount}
                  disabled={typed !== username || loading}
                >
                  {loading && <Spinner size={14} />}
                  Delete forever
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setConfirming(false);
                    setTyped("");
                    setError(null);
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
