import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  Download,
  Fingerprint,
  FileText,
  Layers,
  MessagesSquare,
} from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import {
  getCreatorStats,
  getResourceDetail,
  getUserPurchase,
} from "@/lib/queries";
import { previewPublicUrl } from "@/lib/storage";
import { RESOURCE_TYPE_META } from "@/lib/constants";
import { formatDate, formatNumber } from "@/lib/format";
import { tierOf } from "@/lib/reputation";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { StarRating } from "@/components/ui/StarRating";
import { CreatorBadge } from "@/components/CreatorBadge";
import { PdfPreview } from "@/components/PdfPreview";
import { BuyButton } from "@/components/BuyButton";
import { ReviewForm } from "@/components/ReviewForm";
import { PageHero } from "@/components/PageHero";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const resource = await getResourceDetail(id).catch(() => null);
  if (!resource) return { title: "Resource not found" };
  const summary = resource.description.slice(0, 155);
  return {
    title: resource.title,
    description: summary,
    openGraph: { title: resource.title, description: summary },
  };
}

export default async function ResourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const resource = await getResourceDetail(id).catch(() => null);
  if (!resource) notFound();

  const viewer = await getCurrentProfile().catch(() => null);
  const isOwner = viewer?.id === resource.creatorId;
  const purchase =
    viewer && !isOwner ? await getUserPurchase(viewer.id, id) : null;
  const hasPurchase =
    !!purchase && (purchase.status === "PAID" || purchase.status === "FREE");
  const hasAccess = isOwner || hasPurchase;

  const existingReview = viewer
    ? resource.reviews.find((r) => r.authorId === viewer.id)
    : undefined;

  const creatorStats = await getCreatorStats(resource.creatorId).catch(() => ({
    resourceCount: 0,
    totalDownloads: 0,
    avgRating: 0,
    reviewCount: 0,
    followerCount: 0,
  }));
  const tier = tierOf(creatorStats);

  const type = RESOURCE_TYPE_META[resource.resourceType];
  const previewUrl = resource.previewKey
    ? previewPublicUrl(resource.previewKey)
    : null;

  const metaBits = [
    resource.university,
    resource.branch,
    `Semester ${resource.semester}`,
    resource.moduleName,
    resource.examType,
  ].filter(Boolean);

  return (
    <div>
      <PageHero containerClassName="max-w-6xl">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="ink">{type.label}</Badge>
          {resource.isFree && <Badge variant="success">Free</Badge>}
          <Link
            href={`/browse?subject=${encodeURIComponent(resource.subject)}`}
            className="text-xs text-muted hover:text-ink"
          >
            {resource.subject}
          </Link>
        </div>
        <h1 className="display mt-3 max-w-3xl text-3xl leading-tight text-ink sm:text-4xl">
          {resource.title}
        </h1>
        <p className="mt-2 text-sm text-muted">{metaBits.join("  ·  ")}</p>
        <div className="mt-3 flex items-center gap-2 text-sm">
          <StarRating value={resource.avgRating} size={15} />
          <span className="font-medium text-ink">
            {resource.avgRating > 0 ? resource.avgRating.toFixed(1) : "New"}
          </span>
          <span className="text-faint">
            ({resource.reviewCount} review
            {resource.reviewCount === 1 ? "" : "s"})
          </span>
        </div>
      </PageHero>

      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 lg:grid-cols-[1fr_340px]">
        {/* ── Main ─────────────────────────────────────────── */}
        <div className="order-2 space-y-10 lg:order-1">
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-faint">
              Preview
            </h2>
            <PdfPreview url={previewUrl} title={resource.title} />
            <p className="mt-2 text-xs text-faint">
              Showing the opening pages. The full {resource.pageCount}-page
              document unlocks after you get this resource.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-faint">
              About this resource
            </h2>
            <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-ink-soft">
              {resource.description}
            </p>
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-faint">
              <MessagesSquare size={15} />
              Reviews ({resource.reviewCount})
            </h2>

            {hasPurchase && (
              <div className="mt-4">
                <ReviewForm
                  resourceId={resource.id}
                  initialRating={existingReview?.rating}
                  initialComment={existingReview?.comment ?? undefined}
                />
              </div>
            )}

            <div className="mt-4 space-y-3">
              {resource.reviews.length === 0 ? (
                <p className="rounded-xl border border-dashed border-line-strong bg-surface/60 px-4 py-6 text-center text-sm text-muted">
                  No reviews yet — be the first to review this resource.
                </p>
              ) : (
                resource.reviews.map((review) => (
                  <article
                    key={review.id}
                    className="rounded-xl border border-line bg-surface p-4"
                  >
                    <div className="flex items-center gap-2.5">
                      <Avatar
                        name={review.author.fullName}
                        src={review.author.avatarUrl}
                        size={32}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">
                          {review.author.fullName}
                        </p>
                        <p className="text-xs text-faint">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                      <StarRating
                        value={review.rating}
                        size={13}
                        className="ml-auto"
                      />
                    </div>
                    {review.comment && (
                      <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">
                        {review.comment}
                      </p>
                    )}
                  </article>
                ))
              )}
            </div>
          </section>
        </div>

        {/* ── Purchase / trust card ────────────────────────── */}
        <aside className="order-1 lg:order-2 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
            <p className="text-3xl font-semibold text-ink">
              {resource.isFree ? "Free" : `₹${resource.priceInPaise / 100}`}
            </p>
            <p className="mt-0.5 text-xs text-faint">
              {resource.isFree
                ? "Download at no cost"
                : "One-time purchase · lifetime access"}
            </p>

            <div className="mt-4">
              <BuyButton
                resourceId={resource.id}
                isFree={resource.isFree}
                priceInPaise={resource.priceInPaise}
                isSignedIn={!!viewer}
                hasAccess={hasAccess}
              />
            </div>
            {hasAccess && (
              <p className="mt-2 text-center text-xs text-success">
                {isOwner ? "This is your resource." : "In your library."}
              </p>
            )}

            <div className="mt-5 space-y-3 border-t border-line pt-5">
              <Link
                href={`/creators/${resource.creator.username}`}
                className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-surface-2"
              >
                <Avatar
                  name={resource.creator.fullName}
                  src={resource.creator.avatarUrl}
                  size={40}
                />
                <div className="min-w-0">
                  <p className="flex items-center gap-1 truncate text-sm font-medium text-ink">
                    {resource.creator.fullName}
                    {resource.creator.collegeVerified && (
                      <BadgeCheck size={13} className="shrink-0 text-gold" />
                    )}
                  </p>
                  <p className="truncate text-xs text-faint">
                    @{resource.creator.username}
                  </p>
                </div>
              </Link>
              <CreatorBadge tier={tier} />
            </div>

            <dl className="mt-5 space-y-2.5 border-t border-line pt-5 text-sm">
              <TrustRow
                icon={<FileText size={15} />}
                label="Pages"
                value={`${resource.pageCount} pages`}
              />
              <TrustRow
                icon={<Download size={15} />}
                label="Downloads"
                value={formatNumber(resource.downloadCount)}
              />
              <TrustRow
                icon={<Layers size={15} />}
                label="Uploaded"
                value={formatDate(resource.createdAt)}
              />
              <TrustRow
                icon={<Fingerprint size={15} />}
                label="Protection"
                value="Watermarked download"
              />
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}

function TrustRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="flex items-center gap-2 text-muted">
        {icon}
        {label}
      </dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}
