import Link from "next/link";
import type { Metadata } from "next";
import { Crown } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { getActiveSubscription } from "@/lib/queries";
import { APP_NAME, SUBSCRIPTION_PLANS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { buttonVariants } from "@/components/ui/Button";
import { PageHero } from "@/components/PageHero";
import { PricingPlans } from "@/components/PricingPlans";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Plans & pricing",
  description: `Subscribe to ${APP_NAME} and download any study note, PYQ or resource — unlimited, across every college.`,
};

export default async function PricingPage() {
  const profile = await getCurrentProfile().catch(() => null);
  const subscription = profile ? await getActiveSubscription(profile.id) : null;

  return (
    <div>
      <PageHero containerClassName="max-w-5xl">
        <div className="text-center">
          <Badge variant="gold" className="mx-auto">
            <Crown size={12} /> Almanac Premium
          </Badge>
          <h1 className="display mt-4 text-3xl text-ink sm:text-4xl">
            One subscription. Every note.
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            Subscribe once and download anything on {APP_NAME} — no per-note
            charges, no limits. Cancel anytime; renew to extend.
          </p>
        </div>
      </PageHero>

      <div className="mx-auto max-w-5xl px-5 py-10">
        {subscription && (
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/30 bg-gold/8 p-4">
            <p className="text-sm text-ink">
              <span className="font-semibold">
                {SUBSCRIPTION_PLANS[subscription.plan].label} plan active
              </span>{" "}
              · downloads unlocked until{" "}
              {subscription.currentPeriodEnd
                ? formatDate(subscription.currentPeriodEnd)
                : "—"}
            </p>
            <Link
              href="/browse"
              className={buttonVariants({ variant: "secondary", size: "sm" })}
            >
              Start downloading
            </Link>
          </div>
        )}

        <PricingPlans
          isSignedIn={!!profile}
          currentPlan={subscription?.plan ?? null}
        />

        <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-faint">
          Payments are processed securely by Razorpay. A subscription is a
          one-time payment that unlocks downloads for the plan&apos;s duration;
          subscribe again before it ends to extend your access.
        </p>
      </div>
    </div>
  );
}
