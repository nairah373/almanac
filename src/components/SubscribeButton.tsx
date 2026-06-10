"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { APP_NAME, type PlanKey } from "@/lib/constants";

type RazorpayResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  order_id: string;
  amount: number | string;
  currency: string;
  name: string;
  description?: string;
  prefill?: { name?: string; email?: string };
  theme?: { color?: string };
  handler: (response: RazorpayResponse) => void;
  modal?: { ondismiss?: () => void };
};

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}

function loadRazorpay(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load the payment gateway."));
    document.body.appendChild(script);
  });
}

type SubscribeResponse = {
  error?: string;
  orderId?: string;
  amount?: number;
  currency?: string;
  keyId?: string;
  planLabel?: string;
  buyerName?: string;
  buyerEmail?: string;
};

export function SubscribeButton({
  plan,
  label,
  isSignedIn,
  isCurrent,
  variant = "primary",
}: {
  plan: PlanKey;
  label: string;
  isSignedIn: boolean;
  isCurrent?: boolean;
  variant?: "primary" | "secondary";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isSignedIn) {
    return (
      <Link
        href="/login?next=/pricing"
        className={buttonVariants({ variant, className: "w-full" })}
      >
        Sign in to subscribe
      </Link>
    );
  }

  async function subscribe() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = (await res.json()) as SubscribeResponse;
      if (!res.ok) throw new Error(data.error || "Could not start checkout.");
      if (!data.orderId || !data.keyId || !data.amount) {
        throw new Error("Checkout could not be started.");
      }

      await loadRazorpay();
      const rzp = new window.Razorpay({
        key: data.keyId,
        order_id: data.orderId,
        amount: data.amount,
        currency: data.currency ?? "INR",
        name: APP_NAME,
        description: `${data.planLabel} subscription`,
        prefill: { name: data.buyerName, email: data.buyerEmail },
        theme: { color: "#1c1b19" },
        handler: async (response) => {
          const verify = await fetch("/api/subscribe/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          if (verify.ok) {
            router.push("/dashboard");
            router.refresh();
          } else {
            setError("Payment verification failed. Contact support if charged.");
            setLoading(false);
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      });
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        variant={variant}
        onClick={subscribe}
        disabled={loading}
        className="w-full"
      >
        {loading && <Spinner size={16} />}
        {isCurrent ? "Extend this plan" : `Choose ${label}`}
      </Button>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
