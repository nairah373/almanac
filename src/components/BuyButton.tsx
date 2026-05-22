"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, Lock, ShoppingBag } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { formatINR } from "@/lib/format";
import { APP_NAME } from "@/lib/constants";

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

type CheckoutResponse = {
  error?: string;
  free?: boolean;
  alreadyOwned?: boolean;
  orderId?: string;
  amount?: number;
  currency?: string;
  keyId?: string;
  resourceTitle?: string;
  buyerName?: string;
  buyerEmail?: string;
};

export function BuyButton({
  resourceId,
  isFree,
  priceInPaise,
  isSignedIn,
  hasAccess,
}: {
  resourceId: string;
  isFree: boolean;
  priceInPaise: number;
  isSignedIn: boolean;
  hasAccess: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isSignedIn) {
    return (
      <Link
        href={`/login?next=/resources/${resourceId}`}
        className={buttonVariants({ size: "lg", className: "w-full" })}
      >
        <Lock size={16} />
        Sign in to {isFree ? "download" : "buy"}
      </Link>
    );
  }

  if (hasAccess) {
    return (
      <a
        href={`/api/download/${resourceId}`}
        className={buttonVariants({ size: "lg", className: "w-full" })}
      >
        <Download size={16} />
        Download resource
      </a>
    );
  }

  async function acquire() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceId }),
      });
      const data = (await res.json()) as CheckoutResponse;
      if (!res.ok) throw new Error(data.error || "Checkout failed.");

      if (data.free || data.alreadyOwned) {
        router.refresh();
        return;
      }

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
        description: data.resourceTitle,
        prefill: { name: data.buyerName, email: data.buyerEmail },
        theme: { color: "#1c1b19" },
        handler: async (response) => {
          const verify = await fetch("/api/checkout/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          if (verify.ok) {
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
      <Button size="lg" onClick={acquire} disabled={loading} className="w-full">
        {loading ? (
          <Spinner size={16} />
        ) : isFree ? (
          <Download size={16} />
        ) : (
          <ShoppingBag size={16} />
        )}
        {isFree ? "Get it for free" : `Buy for ${formatINR(priceInPaise)}`}
      </Button>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
