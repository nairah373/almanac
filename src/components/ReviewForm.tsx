"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/cn";

export function ReviewForm({
  resourceId,
  initialRating,
  initialComment,
}: {
  resourceId: string;
  initialRating?: number;
  initialComment?: string;
}) {
  const router = useRouter();
  const editing = Boolean(initialRating);
  const [rating, setRating] = useState(initialRating ?? 0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(initialComment ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (rating < 1) {
      setError("Please choose a star rating.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resourceId,
          rating,
          comment: comment.trim() || undefined,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Could not submit review.");
      setDone(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-line bg-surface p-5"
    >
      <h3 className="text-sm font-semibold text-ink">
        {editing ? "Update your review" : "Rate this resource"}
      </h3>
      <p className="mt-0.5 text-xs text-muted">
        Honest reviews keep the library trustworthy for everyone.
      </p>

      <div className="mt-3 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            type="button"
            key={n}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(n)}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            className="transition-transform hover:scale-110"
          >
            <Star
              size={26}
              strokeWidth={1.5}
              className={cn(
                "transition-colors",
                (hover || rating) >= n
                  ? "fill-gold text-gold"
                  : "text-line-strong",
              )}
            />
          </button>
        ))}
      </div>

      <div className="mt-4">
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share how this resource helped you (optional)"
          maxLength={1000}
        />
      </div>

      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
      {done && (
        <p className="mt-2 text-xs text-success">
          Thank you — your review is live.
        </p>
      )}

      <Button type="submit" size="sm" disabled={loading} className="mt-3">
        {loading && <Spinner size={14} />}
        {editing ? "Update review" : "Submit review"}
      </Button>
    </form>
  );
}
