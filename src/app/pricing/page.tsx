import Link from "next/link";
import type { Metadata } from "next";
import { Check, Crown } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { getActiveSubscription } from "@/lib/queries";
import {
  APP_NAME,
  PLAN_KEYS,
  SUBSCRIPTION_PLANS,
  type PlanKey,
} from "@/lib/constants";
import { formatINR, formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/Badge";
import { buttonVariants } from "@/components/ui/Button";
import { PageHero } from "@/components/PageHero";
import { SubscribeButton } from "@/components/SubscribeButton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Plans & pricing",
  description: `Subscribe to ${APP_NAME} and download any study note, PYQ or resource — unlimited, across every college.`,
};

const PERKS = [
  "Unlimited downloads of every resource",
  "Handwritten notes, PYQs, formula sheets & more",
  "All universities, branches and semesters",
  "Watermarked PDFs, yours to keep",
  "New resources added by students every week",
];

const MONTHLY_PRICE = SUBSCRIPTION_PLANS.MONTHLY.priceInPaise;

/** Equivalent monthly rate for a multi-month plan, for an at-a-glance compare. */
function perMonth(plan: PlanKey): number {
  const p = SUBSCRIPTION_PLANS[plan];
  return Math.round(p.priceInPaise / p.months);
}

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

        <div className="grid gap-5 md:grid-cols-3">
          {PLAN_KEYS.map((key) => {
            const plan = SUBSCRIPTION_PLANS[key];
            const isBest = key === "YEARLY";
            const isCurrent = subscription?.plan === key;
            const savesVsMonthly =
              plan.months > 1 && perMonth(key) < MONTHLY_PRICE;
            return (
              <div
                key={key}
                className={cn(
                  "relative flex flex-col rounded-2xl border bg-surface p-6",
                  isBest ? "border-gold shadow-card" : "border-line",
                )}
              >
                {isBest && (
                  <span className="absolute -top-2.5 left-6 rounded-full bg-gold px-2.5 py-0.5 text-[11px] font-semibold text-white">
                    Best value
                  </span>
                )}
                <h3 className="text-sm font-semibold text-ink">{plan.label}</h3>
                <p className="mt-3 flex items-baseline gap-1">
                  <span className="display text-3xl text-ink">
                    {formatINR(plan.priceInPaise)}
                  </span>
                </p>
                <p className="mt-1 text-xs text-faint">
                  {plan.months === 1
                    ? "per month"
                    : `for ${plan.months} months · ${formatINR(perMonth(key))}/mo`}
                  {savesVsMonthly ? " · save vs monthly" : ""}
                </p>

                <ul className="mt-5 space-y-2.5">
                  {PERKS.map((perk) => (
                    <li key={perk} className="flex items-start gap-2 text-sm text-ink-soft">
                      <Check size={15} className="mt-0.5 shrink-0 text-gold" />
                      {perk}
                    </li>
                  ))}
                </ul>

                <div className="mt-6">
                  <SubscribeButton
                    plan={key}
                    label={plan.label}
                    isSignedIn={!!profile}
                    isCurrent={isCurrent}
                    variant={isBest ? "primary" : "secondary"}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-faint">
          Payments are processed securely by Razorpay. A subscription is a
          one-time payment that unlocks downloads for the plan&apos;s duration;
          subscribe again before it ends to extend your access.
        </p>
      </div>
    </div>
  );
}
