import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import {
  BookOpen,
  Download,
  FileText,
  Library,
  Upload,
} from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import {
  getCreatorStats,
  getUserLibrary,
  getUserUploads,
} from "@/lib/queries";
import { RESOURCE_TYPE_META } from "@/lib/constants";
import { formatDate, formatNumber } from "@/lib/format";
import { tierOf } from "@/lib/reputation";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { buttonVariants } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { CreatorBadge } from "@/components/CreatorBadge";
import { PageHero } from "@/components/PageHero";
import { DeleteResourceButton } from "@/components/DeleteResourceButton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Dashboard" };

const TABS = [
  { id: "library", label: "My library", icon: Library },
  { id: "uploads", label: "My uploads", icon: Upload },
] as const;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard");

  const sp = await searchParams;
  const tab = sp.tab === "uploads" ? "uploads" : "library";

  const stats = await getCreatorStats(profile.id);
  const tier = tierOf(stats);

  return (
    <div>
      <PageHero containerClassName="max-w-5xl">
        <div className="flex items-center gap-4">
          <Avatar name={profile.fullName} src={profile.avatarUrl} size={64} />
          <div>
            <h1 className="display text-2xl text-ink sm:text-3xl">
              {profile.fullName}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <CreatorBadge tier={tier} />
              <Link
                href={`/creators/${profile.username}`}
                className="text-xs text-muted underline-offset-2 hover:text-ink hover:underline"
              >
                View &amp; edit profile
              </Link>
            </div>
          </div>
        </div>
      </PageHero>

      <div className="mx-auto max-w-5xl px-5 py-8">
        <nav className="flex gap-1 overflow-x-auto border-b border-line no-scrollbar">
          {TABS.map((t) => {
            const active = t.id === tab;
            return (
              <Link
                key={t.id}
                href={`/dashboard?tab=${t.id}`}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 border-b-2 px-3 pb-2.5 text-sm transition",
                  active
                    ? "border-ink font-medium text-ink"
                    : "border-transparent text-muted hover:text-ink",
                )}
              >
                <t.icon size={15} />
                {t.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-7">
          {tab === "library" && <LibraryTab userId={profile.id} />}
          {tab === "uploads" && <UploadsTab userId={profile.id} />}
        </div>
      </div>
    </div>
  );
}

async function LibraryTab({ userId }: { userId: string }) {
  const library = await getUserLibrary(userId);

  if (library.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Your library is empty"
        description="Resources you buy or download will be collected here for instant access."
        action={
          <Link href="/browse" className={buttonVariants({ size: "sm" })}>
            Browse resources
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-2">
      {library.map((purchase) => {
        const r = purchase.resource;
        return (
          <div
            key={purchase.id}
            className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3.5"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-muted">
              <FileText size={17} />
            </span>
            <div className="min-w-0 flex-1">
              <Link
                href={`/resources/${r.id}`}
                className="block truncate text-sm font-medium text-ink hover:underline"
              >
                {r.title}
              </Link>
              <p className="truncate text-xs text-faint">
                {RESOURCE_TYPE_META[r.resourceType].label} · {r.creator.fullName}{" "}
                · {formatDate(purchase.createdAt)}
              </p>
            </div>
            <a
              href={`/api/download/${r.id}`}
              className={buttonVariants({ variant: "secondary", size: "sm" })}
            >
              <Download size={14} />
              Download
            </a>
          </div>
        );
      })}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface px-4 py-3.5">
      <p className="text-xl font-semibold text-ink">{value}</p>
      <p className="mt-0.5 text-xs text-faint">{label}</p>
    </div>
  );
}

async function UploadsTab({ userId }: { userId: string }) {
  const uploads = await getUserUploads(userId);
  const totalDownloads = uploads.reduce((s, r) => s + r.downloadCount, 0);
  const totalStudents = uploads.reduce((s, r) => s + r._count.purchases, 0);
  const published = uploads.filter((r) => r.status === "PUBLISHED").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Resources" value={formatNumber(uploads.length)} />
        <StatCard label="Published" value={formatNumber(published)} />
        <StatCard
          label="Total downloads"
          value={formatNumber(totalDownloads)}
        />
        <StatCard
          label="Students reached"
          value={formatNumber(totalStudents)}
        />
      </div>

      {uploads.length === 0 ? (
        <EmptyState
          icon={Upload}
          title="No uploads yet"
          description="Share your first resource and help students across India."
          action={
            <Link href="/upload" className={buttonVariants({ size: "sm" })}>
              Upload a resource
            </Link>
          }
        />
      ) : (
        <div className="space-y-2">
          {uploads.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3.5"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/resources/${r.id}`}
                    className="truncate text-sm font-medium text-ink hover:underline"
                  >
                    {r.title}
                  </Link>
                  <Badge
                    variant={
                      r.status === "PUBLISHED"
                        ? "success"
                        : r.status === "DRAFT"
                          ? "neutral"
                          : "outline"
                    }
                  >
                    {r.status}
                  </Badge>
                </div>
                <p className="mt-0.5 truncate text-xs text-faint">
                  Free · {formatNumber(r.downloadCount)} downloads ·{" "}
                  {formatNumber(r._count.purchases)} students ·{" "}
                  {r._count.reviews} reviews
                </p>
              </div>
              <Link
                href={`/resources/${r.id}`}
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                View
              </Link>
              <DeleteResourceButton resourceId={r.id} />
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-faint">
        Everything you share on Almanac is free for students. Your downloads,
        ratings and followers build your reputation across colleges.
      </p>
    </div>
  );
}
