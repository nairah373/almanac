import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Eye,
  Fingerprint,
  GraduationCap,
  Search,
  Sparkles,
  Star,
  Upload,
} from "lucide-react";
import { APP_NAME, UNIVERSITIES } from "@/lib/constants";
import { getFeaturedResources, getTopCreators } from "@/lib/queries";
import { buttonVariants } from "@/components/ui/Button";
import { SectionHeading } from "@/components/SectionHeading";
import { ResourceGrid } from "@/components/ResourceGrid";
import { CreatorCard } from "@/components/CreatorCard";
import {
  DoodleBolt,
  DoodleDots,
  DoodleLoop,
  DoodlePlane,
  DoodleSparkle,
  DoodleSquiggle,
  DoodleStar,
  DoodleTrail,
} from "@/components/Doodles";

export const dynamic = "force-dynamic";

const QUICK_LINKS = [
  { label: "Previous year questions", href: "/browse?type=PYQ" },
  { label: "Handwritten notes", href: "/browse?type=HANDWRITTEN" },
  { label: "Formula sheets", href: "/browse?type=FORMULA_SHEET" },
  { label: "Flashcards", href: "/browse?type=FLASHCARDS" },
];

const STEPS = [
  {
    icon: Search,
    title: "Discover precisely",
    body: "Filter by university, branch, semester and subject to find exactly the resource your exam needs — nothing noisy in between.",
    tile: "bg-indigo-100 text-indigo-600",
  },
  {
    icon: Eye,
    title: "Preview before you download",
    body: "Read the opening pages and check ratings, downloads and the uploader's identity before you download a thing.",
    tile: "bg-rose-100 text-rose-600",
  },
  {
    icon: GraduationCap,
    title: "Learn, then give back",
    body: "Subscribe once and download anything. Upload your own notes to help students across the country.",
    tile: "bg-emerald-100 text-emerald-600",
  },
];

const TRUST = [
  {
    icon: BadgeCheck,
    title: "Verified creators",
    body: "Identity and college shown on every upload, with reputation tiers earned over time.",
    tile: "bg-indigo-100 text-indigo-600",
  },
  {
    icon: Star,
    title: "Honest ratings",
    body: "Real reviews from students who downloaded the resource — quality rises, noise falls away.",
    tile: "bg-amber-100 text-amber-600",
  },
  {
    icon: Fingerprint,
    title: "Traceable downloads",
    body: "Every file is watermarked with the student's identity, so good work stays respected.",
    tile: "bg-teal-100 text-teal-600",
  },
];

export default async function HomePage() {
  const [featured, topCreators] = await Promise.all([
    getFeaturedResources(6).catch(() => []),
    getTopCreators(4).catch(() => []),
  ]);

  return (
    <div>
      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section>
        <div className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
          <div className="relative mx-auto w-full max-w-3xl text-center">
            {/* Paper planes + dashed trails flying around the hero */}
            <DoodleTrail className="pointer-events-none absolute -left-32 -top-2 hidden h-12 w-32 -rotate-6 text-ink/35 lg:block" />
            <DoodlePlane className="pointer-events-none absolute -left-4 -top-3 hidden h-8 w-12 -rotate-[15deg] text-ink/85 lg:block" />

            <DoodleTrail className="pointer-events-none absolute -right-32 top-0 hidden h-12 w-32 -scale-x-100 -rotate-[8deg] text-ink/35 lg:block" />
            <DoodlePlane className="pointer-events-none absolute -right-4 top-2 hidden h-8 w-12 rotate-[200deg] text-ink/85 lg:block" />

            <DoodleLoop className="pointer-events-none absolute -left-12 bottom-4 hidden h-12 w-20 text-ink/35 lg:block" />

            <DoodleTrail className="pointer-events-none absolute -right-28 bottom-6 hidden h-12 w-28 -rotate-[15deg] text-ink/35 lg:block" />
            <DoodlePlane className="pointer-events-none absolute right-2 bottom-24 hidden h-8 w-12 -rotate-[25deg] text-ink/85 lg:block" />

            {/* Sprinkled colourful star-shape doodles */}
            <DoodleStar className="pointer-events-none absolute -left-2 top-28 hidden h-7 w-7 text-indigo-500 lg:block" />
            <DoodleSparkle className="pointer-events-none absolute -right-1 top-24 hidden h-6 w-6 text-pink-500 lg:block" />
            <DoodleDots className="pointer-events-none absolute -right-16 top-1/2 hidden h-7 w-7 text-amber-500 lg:block" />
            <DoodleBolt className="pointer-events-none absolute -left-2 bottom-32 hidden h-7 w-7 text-violet-500 lg:block" />
            <DoodleSparkle className="pointer-events-none absolute -left-20 top-1/2 hidden h-5 w-5 text-sky-500 lg:block" />
            <DoodleStar className="pointer-events-none absolute -right-2 bottom-40 hidden h-6 w-6 text-emerald-500 lg:block" />
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-white/80 px-3 py-1 text-xs font-medium text-indigo-700">
              <Sparkles size={13} />
              The academic library for Indian students
            </span>
            <h1 className="display mt-6 text-balance text-4xl leading-[1.08] text-ink sm:text-5xl lg:text-6xl">
              Find the notes that{" "}
              <span
                style={{
                  backgroundImage:
                    "linear-gradient(120deg, #6366f1, #d946ef)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                actually get you through exams.
              </span>
            </h1>
            <DoodleSquiggle className="mx-auto mt-2 h-3.5 w-40 text-violet-500" />
            <p className="mx-auto mt-5 max-w-xl text-balance text-base leading-relaxed text-muted sm:text-lg">
              {APP_NAME} is a trusted marketplace for high-quality study
              material — handwritten notes, PYQs, formula sheets and more, from
              top students across the country.
            </p>

            <form
              action="/browse"
              className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-full border border-line-strong bg-white p-1.5 shadow-card focus-within:border-indigo-400"
            >
              <Search size={18} className="ml-3 shrink-0 text-faint" />
              <input
                type="search"
                name="q"
                placeholder="Search a subject, e.g. Data Structures"
                className="h-10 w-full bg-transparent text-sm text-ink outline-none placeholder:text-faint"
                aria-label="Search resources"
              />
              <button
                type="submit"
                className={buttonVariants({ variant: "primary", size: "sm" })}
              >
                Search
              </button>
            </form>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              {QUICK_LINKS.map((q) => (
                <Link
                  key={q.href}
                  href={q.href}
                  className="rounded-full border border-line bg-white/70 px-3 py-1.5 text-xs text-ink-soft transition hover:border-indigo-400 hover:text-indigo-700"
                >
                  {q.label}
                </Link>
              ))}
            </div>

            <p className="mt-8 text-xs text-faint">
              Resources spanning {UNIVERSITIES.length - 1}+ universities ·
              Engineering & MBBS · Verified student creators
            </p>
          </div>
        </div>
      </section>

      {/* ─── How it works ─────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <SectionHeading
          eyebrow="How it works"
          title="A smarter way to study"
          description="No clutter, no noise — just the resource you need and the trust to use it."
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

      {/* ─── Featured resources ───────────────────────────────── */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 py-8">
          <SectionHeading
            eyebrow="Most downloaded"
            title="Resources students rely on"
            href="/browse"
            linkLabel="Browse all"
          />
          <div className="mt-8">
            <ResourceGrid resources={featured} />
          </div>
        </section>
      )}

      {/* ─── Trust ────────────────────────────────────────────── */}
      <section className="mt-4">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <SectionHeading
            eyebrow="Built on trust"
            title="Why students trust Almanac"
            description="Every decision on the platform protects the quality of what you study from."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {TRUST.map((t) => (
              <div
                key={t.title}
                className="rounded-2xl border border-line bg-surface p-6"
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${t.tile}`}
                >
                  <t.icon size={20} strokeWidth={1.75} />
                </div>
                <h3 className="mt-4 text-base font-semibold text-ink">
                  {t.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {t.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Top creators ─────────────────────────────────────── */}
      {topCreators.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 py-20">
          <SectionHeading
            eyebrow="The community"
            title="Top creators this season"
            href="/creators"
            linkLabel="View leaderboard"
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {topCreators.map((c, i) => (
              <CreatorCard
                key={c.creator.id}
                creator={c.creator}
                stats={c.stats}
                rank={i + 1}
              />
            ))}
          </div>
        </section>
      )}

      {/* ─── Creator CTA ──────────────────────────────────────── */}
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
            Your notes helped you. Let them help others.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/70">
            Upload once, help a student every time they download. Build a
            reputation that follows you across campuses.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/upload"
              className={buttonVariants({
                variant: "secondary",
                className: "bg-white",
              })}
            >
              Start sharing notes
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/browse"
              className="text-sm font-medium text-white/80 transition hover:text-white"
            >
              Explore resources first
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
