"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";

type Status = "PROCESSING" | "PAID" | "REJECTED";

export function AdminPayoutActions({
  payoutId,
  status,
}: {
  payoutId: string;
  status: "REQUESTED" | "PROCESSING";
}) {
  const router = useRouter();
  const [reference, setReference] = useState("");
  const [busy, setBusy] = useState<Status | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function update(next: Status) {
    setBusy(next);
    setError(null);
    try {
      const res = await fetch(`/api/payouts/${payoutId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: next,
          reference: next === "PAID" ? reference || undefined : undefined,
          note: next === "REJECTED" ? reference || undefined : undefined,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Could not update payout.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-2">
      <Input
        name="reference"
        value={reference}
        onChange={(e) => setReference(e.target.value)}
        placeholder="Payment reference (paid) or reason (rejected)"
        className="h-9 text-[13px]"
      />
      <div className="flex flex-wrap gap-2">
        {status === "REQUESTED" && (
          <Button
            size="sm"
            variant="secondary"
            disabled={busy !== null}
            onClick={() => update("PROCESSING")}
          >
            {busy === "PROCESSING" && <Spinner size={14} />}
            Mark processing
          </Button>
        )}
        <Button size="sm" disabled={busy !== null} onClick={() => update("PAID")}>
          {busy === "PAID" && <Spinner size={14} />}
          Mark paid
        </Button>
        <Button
          size="sm"
          variant="danger"
          disabled={busy !== null}
          onClick={() => update("REJECTED")}
        >
          {busy === "REJECTED" && <Spinner size={14} />}
          Reject
        </Button>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
