import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  Award,
  Fingerprint,
  Gift,
  Heart,
  Sparkles,
  Tag,
  Upload,
  Users,
} from "lucide-react";
import type { ResourceType } from "@prisma/client";
import { getCurrentProfile } from "@/lib/auth";
import { APP_NAME, RESOURCE_TYPES, RESOURCE_TYPE_META } from "@/lib/constants";
import { RESOURCE_TYPE_STYLE } from "@/lib/resourceTypes";
import { buttonVariants } from "@/components/ui/Button";
import { SectionHeading } from "@/components/SectionHeading";
import {
  DoodleDots,
  DoodlePlane,
  DoodleSparkle,
  DoodleSquiggle,
  DoodleStar,
  DoodleTrail,
} from "@/components/Doodles";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Become a creator",
  description:
    "Share your notes on Almanac and reach students across India — the trusted academic library for Indian students.",
};

const TYPE_DESCRIPTIONS: Record<ResourceType, string> = {
  HANDWRITTEN:
    "Scanned or photographed pages of your own handwriting — the format students trust the most.",
  TYPED:
    "Clean, structured typed notes with headings, tables and diagrams.",
  PPT_SUMMARY:
    "A whole semester of slides distilled into one focused study guide.",
  LAB_RECORD:
    "Programs, observations and write-ups laid out exactly for record submission.",
  PYQ:
    "Solved papers with question patterns and likely repeats highlighted.",
  FORMULA_SHEET:
    "Every important formula for a subject on one compact, reliable page.",
  FLASHCARDS:
    "Quick-recall cards for spaced-repetition revision right before exams.",
};

const STEPS = [
  {
    icon: Upload,
    title: "Upload",
    body: "Drag and drop your PDF. We auto-generate a clean preview — your full file stays private.",
    tile: "bg-indigo-100 text-indigo-600",
  },
  {
    icon: Tag,
    title: "Tag it",
    body: "Add university, branch, semester and subject so the right students find your notes.",
    tile: "bg-rose-100 text-rose-600",
  },
  {
    icon: Heart,
    title: "Reach students",
    body: "Your resource is unlocked for every subscribed student. Each download builds your reputation across colleges.",
    tile: "bg-emerald-100 text-emerald-600",
  },
];

const PERKS = [
  {
    icon: Gift,
    title: "Reach every subscriber",
    body: "Subscribers can download anything you publish — no paywall between your notes and the students who need them.",
    tile: "bg-emerald-100 text-emerald-600",
  },
  {
    icon: Fingerprint,
    title: "Watermarked downloads",
    body: "Every file students download is stamped with their identity — so leaked copies stay traceable to them.",
    tile: "bg-amber-100 text-amber-600",
  },
  {
    icon: Award,
    title: "Earn reputation tiers",
    body: "Climb from New → Rising → Trusted → Elite as your uploads, ratings and downloads grow.",
    tile: "bg-indigo-100 text-indigo-600",
  },
  {
    icon: Users,
    title: "Build a following",
    body: "Students can follow your profile and see every new resource you publish across colleges.",
    tile: "bg-pink-100 text-pink-600",
  },
];

function TypeCard({ type }: { type: ResourceType }) {
  const meta = RESOURCE_TYPE_META[type];
  const style = RESOURCE_TYPE_STYLE[type];
  const Icon = style.icon;
  return (
    <Link
      href={`/browse?type=${type}`}
      className="lift block overflow-hidden rounded-2xl border border-line bg-surface"
    >
      <div
        className="relative h-24 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, ${style.from}, ${style.to})`,
        }}
      >
        <Icon
          size={88}
          strokeWidth={1}
          className="absolute -bottom-3 -right-2 text-white/30"
        />
      </div>
      <div className="p-5">
        <h3 className="text-[15px] font-semibold text-ink">{meta.label}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">
          {TYPE_DESCRIPTIONS[type]}
        </p>
      </div>
    </Link>
  );
}

export default async function CreatorPortalPage() {
  const profile = await getCurrentProfile().catch(() => null);
  const ctaHref = profile ? "/upload" : "/signup?role=creator&next=/upload";
  const ctaLabel = profile
    ? "Upload your next resource"
    : "Create a creator account";

  return (
    <div>
      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section>
        <div className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
          <div className="relative mx-auto max-w-3xl text-center">
            {/* Scattered doodles */}
            <DoodleTrail className="pointer-events-none absolute -left-32 top-2 hidden h-12 w-32 -rotate-6 text-ink/35 lg:block" />
            <DoodlePlane className="pointer-events-none absolute -left-4 -top-2 hidden h-8 w-12 -rotate-[15deg] text-ink/85 lg:block" />
            <DoodleTrail className="pointer-events-none absolute -right-32 top-4 hidden h-12 w-32 -scale-x-100 -rotate-[8deg] text-ink/35 lg:block" />
            <DoodlePlane className="pointer-events-none absolute -right-4 top-4 hidden h-8 w-12 rotate-[200deg] text-ink/85 lg:block" />
            <DoodleStar className="pointer-events-none absolute -left-12 bottom-12 hidden h-7 w-7 text-indigo-500 lg:block" />
            <DoodleSparkle className="pointer-events-none absolute -right-10 bottom-16 hidden h-7 w-7 text-pink-500 lg:block" />
            <DoodleDots className="pointer-events-none absolute -left-20 top-1/2 hidden h-6 w-6 text-amber-500 lg:block" />

            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-white/80 px-3 py-1 text-xs font-medium text-indigo-700">
              <Sparkles size={13} />
              For creators
            </span>
            <h1 className="display mt-6 text-balance text-4xl leading-[1.08] text-ink sm:text-5xl lg:text-6xl">
              Turn your notes into{" "}
              <span
                style={{
                  backgroundImage:
                    "linear-gradient(120deg, #6366f1, #d946ef)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                impact.
              </span>
            </h1>
            <DoodleSquiggle className="mx-auto mt-2 h-3.5 w-40 text-violet-500" />
            <p className="mx-auto mt-5 max-w-xl text-balance text-base leading-relaxed text-muted sm:text-lg">
              {APP_NAME} is built for student creators. Upload once, reach
              subscribed students everywhere, and build a reputation that
              follows you across colleges.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={ctaHref}
                className={buttonVariants({ size: "lg" })}
              >
                {ctaLabel}
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/browse"
                className={buttonVariants({ variant: "secondary", size: "lg" })}
              >
                See what creators share
              </Link>
            </div>

            <p className="mt-7 text-xs text-faint">
              Reach every subscriber · Watermarked downloads · Build your following
            </p>
          </div>
        </div>
      </section>

      {/* ─── What you can share ──────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 pt-4 pb-16">
        <SectionHeading
          eyebrow="What you can share"
          title="Every kind of academic material"
          description="Whatever helps your peers, share it — handwritten pages, typed notes, slides, lab work and more."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {RESOURCE_TYPES.map((type) => (
            <TypeCard key={type} type={type} />
          ))}
        </div>

        {/* Mid-page CTA — direct entry into the upload flow */}
        <div className="mx-auto mt-14 max-w-2xl rounded-3xl border border-line bg-surface p-8 text-center shadow-card sm:p-10">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
            <Upload size={20} strokeWidth={1.75} />
          </div>
          <h3 className="display mt-4 text-2xl text-ink sm:text-3xl">
            Got notes that helped you?
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
            Share them now and help another student every time they download.
          </p>
          <Link
            href={ctaHref}
            className={buttonVariants({ size: "lg", className: "mt-6" })}
          >
            Share your note now
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ─── How it works ────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-12">
        <SectionHeading
          eyebrow="How it works"
          title="From notes to impact in three steps"
          description="No setup, no contracts. Just upload and help students."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className="rounded-2xl border border-line bg-surface p-6"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${step.tile}`}
                >
                  <step.icon size={20} strokeWidth={1.75} />
                </div>
                <span className="display text-3xl text-line-strong">
                  0{i + 1}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-ink">
                {step.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Why creators love it ────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-12">
        <SectionHeading
          eyebrow="Why creators love it"
          title="Built for student creators"
          description="Every decision on Almanac is designed to respect the time you spent making your notes."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PERKS.map((perk) => (
            <div
              key={perk.title}
              className="rounded-2xl border border-line bg-surface p-6"
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${perk.tile}`}
              >
                <perk.icon size={20} strokeWidth={1.75} />
              </div>
              <h3 className="mt-4 text-base font-semibold text-ink">
                {perk.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {perk.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Final CTA ───────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 pb-8">
        <div
          className="overflow-hidden rounded-3xl px-8 py-14 text-center sm:px-16"
          style={{
            backgroundImage:
              "linear-gradient(135deg, #1c1b19 0%, #312e81 60%, #5b21b6 100%)",
          }}
        >
          <Upload size={26} className="mx-auto text-white/70" />
          <h2 className="display mt-4 text-3xl text-white sm:text-4xl">
            Start sharing your notes today.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/70">
            Your work helped you get through your exams. Let it help thousands
            of other students across India.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={ctaHref}
              className={buttonVariants({
                variant: "secondary",
                className: "bg-white",
              })}
            >
              {ctaLabel}
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/browse"
              className="text-sm font-medium text-white/80 transition hover:text-white"
            >
              Explore the marketplace
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
