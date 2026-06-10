import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Wallet } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { getPendingPayouts } from "@/lib/queries";
import { formatINR, formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHero } from "@/components/PageHero";
import { AdminPayoutActions } from "@/components/AdminPayoutActions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Payout queue" };

function destinationDetail(account: {
  method: "UPI" | "BANK";
  upiId: string | null;
  accountNumber: string | null;
  ifsc: string | null;
  bankName: string | null;
  holderName: string;
} | null): string {
  if (!account) return "No payout method on file";
  if (account.method === "UPI")
    return `UPI · ${account.upiId} · ${account.holderName}`;
  return `${account.bankName} · A/C ${account.accountNumber} · IFSC ${account.ifsc} · ${account.holderName}`;
}

export default async function AdminPayoutsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/admin/payouts");
  if (profile.role !== "ADMIN") redirect("/dashboard");

  const payouts = await getPendingPayouts();

  return (
    <div>
      <PageHero containerClassName="max-w-4xl">
        <h1 className="display text-2xl text-ink sm:text-3xl">Payout queue</h1>
        <p className="mt-1.5 text-sm text-muted">
          Send the money to each creator&apos;s account, then mark the request paid
          (or reject it to release the held balance).
        </p>
      </PageHero>

      <div className="mx-auto max-w-4xl px-5 py-8">
        {payouts.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="No payouts to process"
            description="New withdrawal requests from creators will appear here."
          />
        ) : (
          <div className="space-y-3">
            {payouts.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl border border-line bg-surface p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-base font-semibold text-ink">
                        {formatINR(p.amountInPaise)}
                      </p>
                      <Badge variant="outline">
                        {p.status === "PROCESSING" ? "Processing" : "Requested"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-ink-soft">
                      {p.creator.fullName} · @{p.creator.username}
                    </p>
                    <p className="text-xs text-faint">{p.creator.email}</p>
                    <p className="mt-2 text-xs text-muted">
                      {destinationDetail(p.creator.payoutAccount)}
                    </p>
                    <p className="mt-0.5 text-xs text-faint">
                      Requested {formatDate(p.createdAt)}
                    </p>
                  </div>
                  <div className="w-full max-w-sm">
                    <AdminPayoutActions
                      payoutId={p.id}
                      status={p.status as "REQUESTED" | "PROCESSING"}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
