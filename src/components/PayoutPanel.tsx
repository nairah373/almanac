"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Banknote, Wallet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { formatINR, formatDate } from "@/lib/format";
import { MIN_PAYOUT_INR } from "@/lib/constants";

type Method = "UPI" | "BANK";

type Balance = {
  availableInPaise: number;
  pendingInPaise: number;
  paidOutInPaise: number;
  lifetimeInPaise: number;
};

type Account = {
  method: Method;
  holderName: string;
  upiId: string | null;
  accountNumber: string | null;
  ifsc: string | null;
  bankName: string | null;
} | null;

type PayoutRow = {
  id: string;
  amountInPaise: number;
  status: "REQUESTED" | "PROCESSING" | "PAID" | "REJECTED";
  destination: string;
  reference: string | null;
  note: string | null;
  createdAt: string | Date;
};

const STATUS_LABEL: Record<PayoutRow["status"], string> = {
  REQUESTED: "Requested",
  PROCESSING: "Processing",
  PAID: "Paid",
  REJECTED: "Rejected",
};

function StatusBadge({ status }: { status: PayoutRow["status"] }) {
  if (status === "PAID") return <Badge variant="success">Paid</Badge>;
  if (status === "REJECTED")
    return (
      <Badge variant="outline" className="text-danger border-danger/30">
        Rejected
      </Badge>
    );
  return <Badge variant="outline">{STATUS_LABEL[status]}</Badge>;
}

function BalanceCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface px-4 py-3.5">
      <p className={accent ? "text-xl font-semibold text-ink" : "text-xl font-semibold text-ink-soft"}>
        {value}
      </p>
      <p className="mt-0.5 text-xs text-faint">{label}</p>
    </div>
  );
}

export function PayoutPanel({
  balance,
  account,
  payouts,
}: {
  balance: Balance;
  account: Account;
  payouts: PayoutRow[];
}) {
  const router = useRouter();
  const [method, setMethod] = useState<Method>(account?.method ?? "UPI");

  const [savingAccount, setSavingAccount] = useState(false);
  const [accountMsg, setAccountMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [amount, setAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawMsg, setWithdrawMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const availableRupees = balance.availableInPaise / 100;
  const canWithdraw = Boolean(account) && availableRupees >= MIN_PAYOUT_INR;

  async function saveAccount(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSavingAccount(true);
    setAccountMsg(null);
    const fd = new FormData(e.currentTarget);
    const body =
      method === "UPI"
        ? {
            method,
            holderName: String(fd.get("holderName") || ""),
            upiId: String(fd.get("upiId") || "") || undefined,
          }
        : {
            method,
            holderName: String(fd.get("holderName") || ""),
            accountNumber: String(fd.get("accountNumber") || "") || undefined,
            ifsc: String(fd.get("ifsc") || "") || undefined,
            bankName: String(fd.get("bankName") || "") || undefined,
          };
    try {
      const res = await fetch("/api/payout-account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Could not save payout method.");
      setAccountMsg({ ok: true, text: "Payout method saved." });
      router.refresh();
    } catch (err) {
      setAccountMsg({
        ok: false,
        text: err instanceof Error ? err.message : "Something went wrong.",
      });
    } finally {
      setSavingAccount(false);
    }
  }

  async function requestWithdrawal(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setWithdrawing(true);
    setWithdrawMsg(null);
    try {
      const res = await fetch("/api/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountInRupees: Math.floor(Number(amount) || 0) }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Could not request the payout.");
      setWithdrawMsg({ ok: true, text: "Withdrawal requested. We'll process it shortly." });
      setAmount("");
      router.refresh();
    } catch (err) {
      setWithdrawMsg({
        ok: false,
        text: err instanceof Error ? err.message : "Something went wrong.",
      });
    } finally {
      setWithdrawing(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Balance summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <BalanceCard label="Available to withdraw" value={formatINR(balance.availableInPaise)} accent />
        <BalanceCard label="Pending payouts" value={formatINR(balance.pendingInPaise)} />
        <BalanceCard label="Paid out" value={formatINR(balance.paidOutInPaise)} />
        <BalanceCard label="Lifetime earnings" value={formatINR(balance.lifetimeInPaise)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Withdraw */}
        <form
          onSubmit={requestWithdrawal}
          className="space-y-4 rounded-2xl border border-line bg-surface p-6"
        >
          <div className="flex items-center gap-2">
            <Wallet size={18} className="text-muted" />
            <h3 className="text-sm font-semibold text-ink">Withdraw earnings</h3>
          </div>
          <p className="text-xs text-faint">
            You keep 85% of every sale. Withdraw to your saved method once you have at
            least {formatINR(MIN_PAYOUT_INR * 100)}.
          </p>
          <Input
            label="Amount (₹)"
            name="amount"
            type="number"
            inputMode="numeric"
            min={MIN_PAYOUT_INR}
            step={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={String(Math.floor(availableRupees) || MIN_PAYOUT_INR)}
            disabled={!canWithdraw}
            hint={
              account
                ? `Available: ${formatINR(balance.availableInPaise)}`
                : "Add a payout method first."
            }
          />
          {withdrawMsg && (
            <p className={withdrawMsg.ok ? "text-sm text-success" : "text-sm text-danger"}>
              {withdrawMsg.text}
            </p>
          )}
          <Button type="submit" disabled={withdrawing || !canWithdraw}>
            {withdrawing && <Spinner size={16} />}
            Request withdrawal
          </Button>
        </form>

        {/* Payout method */}
        <form
          onSubmit={saveAccount}
          className="space-y-4 rounded-2xl border border-line bg-surface p-6"
        >
          <div className="flex items-center gap-2">
            <Banknote size={18} className="text-muted" />
            <h3 className="text-sm font-semibold text-ink">Payout method</h3>
          </div>

          <Select
            label="Method"
            name="method"
            value={method}
            onChange={(e) => setMethod(e.target.value as Method)}
          >
            <option value="UPI">UPI</option>
            <option value="BANK">Bank account</option>
          </Select>

          <Input
            label="Account holder name"
            name="holderName"
            defaultValue={account?.holderName ?? ""}
            minLength={2}
            maxLength={80}
            required
          />

          {method === "UPI" ? (
            <Input
              label="UPI ID"
              name="upiId"
              defaultValue={account?.upiId ?? ""}
              placeholder="name@bank"
              required
            />
          ) : (
            <>
              <Input
                label="Account number"
                name="accountNumber"
                defaultValue={account?.accountNumber ?? ""}
                inputMode="numeric"
                required
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="IFSC"
                  name="ifsc"
                  defaultValue={account?.ifsc ?? ""}
                  placeholder="HDFC0001234"
                  required
                />
                <Input
                  label="Bank name"
                  name="bankName"
                  defaultValue={account?.bankName ?? ""}
                  required
                />
              </div>
            </>
          )}

          {accountMsg && (
            <p className={accountMsg.ok ? "text-sm text-success" : "text-sm text-danger"}>
              {accountMsg.text}
            </p>
          )}
          <Button type="submit" variant="secondary" disabled={savingAccount}>
            {savingAccount && <Spinner size={16} />}
            Save payout method
          </Button>
        </form>
      </div>

      {/* History */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-ink">Payout history</h3>
        {payouts.length === 0 ? (
          <p className="rounded-xl border border-line bg-surface px-4 py-6 text-center text-sm text-faint">
            No withdrawals yet.
          </p>
        ) : (
          <div className="space-y-2">
            {payouts.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">
                    {formatINR(p.amountInPaise)}
                  </p>
                  <p className="truncate text-xs text-faint">
                    {p.destination} · {formatDate(p.createdAt)}
                    {p.reference ? ` · Ref ${p.reference}` : ""}
                    {p.status === "REJECTED" && p.note ? ` · ${p.note}` : ""}
                  </p>
                </div>
                <StatusBadge status={p.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
