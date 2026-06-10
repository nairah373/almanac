import { Check } from "lucide-react";
import {
  PLAN_KEYS,
  SUBSCRIPTION_PLANS,
  type PlanKey,
} from "@/lib/constants";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/cn";
import { SubscribeButton } from "@/components/SubscribeButton";

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

export function PricingPlans({
  isSignedIn,
  currentPlan,
}: {
  isSignedIn: boolean;
  currentPlan?: PlanKey | null;
}) {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {PLAN_KEYS.map((key) => {
        const plan = SUBSCRIPTION_PLANS[key];
        const isBest = key === "YEARLY";
        const isCurrent = currentPlan === key;
        const savesVsMonthly = plan.months > 1 && perMonth(key) < MONTHLY_PRICE;
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
                <li
                  key={perk}
                  className="flex items-start gap-2 text-sm text-ink-soft"
                >
                  <Check size={15} className="mt-0.5 shrink-0 text-gold" />
                  {perk}
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <SubscribeButton
                plan={key}
                label={plan.label}
                isSignedIn={isSignedIn}
                isCurrent={isCurrent}
                variant={isBest ? "primary" : "secondary"}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
