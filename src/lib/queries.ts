import { Prisma, type ResourceType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { SortValue } from "@/lib/constants";
import { reputationScore, type CreatorStats } from "@/lib/reputation";

/**
 * Server-side data access. Every page and route handler reads through here so
 * query shapes stay consistent and access rules live in one place.
 *
 * Rating sort/filter is applied in-memory over a capped scan — fine for an
 * MVP catalogue; revisit with a materialised rating column at scale.
 */

const cardSelect = {
  id: true,
  title: true,
  description: true,
  resourceType: true,
  university: true,
  branch: true,
  semester: true,
  subject: true,
  moduleName: true,
  examType: true,
  priceInPaise: true,
  isFree: true,
  previewKey: true,
  pageCount: true,
  downloadCount: true,
  createdAt: true,
  creator: {
    select: {
      id: true,
      username: true,
      fullName: true,
      avatarUrl: true,
      collegeVerified: true,
    },
  },
} satisfies Prisma.ResourceSelect;

type CardRow = Prisma.ResourceGetPayload<{ select: typeof cardSelect }>;

export type ResourceCard = CardRow & {
  avgRating: number;
  reviewCount: number;
};

async function attachRatings(rows: CardRow[]): Promise<ResourceCard[]> {
  if (rows.length === 0) return [];
  const grouped = await prisma.review.groupBy({
    by: ["resourceId"],
    where: { resourceId: { in: rows.map((r) => r.id) } },
    _avg: { rating: true },
    _count: { rating: true },
  });
  const map = new Map(grouped.map((g) => [g.resourceId, g]));
  return rows.map((r) => {
    const g = map.get(r.id);
    return {
      ...r,
      avgRating: g?._avg.rating ?? 0,
      reviewCount: g?._count.rating ?? 0,
    };
  });
}

export type ResourceFilters = {
  q?: string;
  university?: string;
  branch?: string;
  semester?: number;
  subject?: string;
  resourceType?: ResourceType;
  examType?: string;
  price?: "free" | "paid";
  minRating?: number;
  sort?: SortValue;
  page?: number;
  perPage?: number;
};

const SCAN_CAP = 240;

function sortCards(items: ResourceCard[], sort: SortValue): ResourceCard[] {
  const c = [...items];
  switch (sort) {
    case "popular":
      return c.sort((a, b) => b.downloadCount - a.downloadCount);
    case "rating":
      return c.sort(
        (a, b) => b.avgRating - a.avgRating || b.reviewCount - a.reviewCount,
      );
    default:
      return c.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      );
  }
}

export async function getResourceCards(filters: ResourceFilters): Promise<{
  items: ResourceCard[];
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
}> {
  const where: Prisma.ResourceWhereInput = { status: "PUBLISHED" };
  if (filters.university) where.university = filters.university;
  if (filters.branch) where.branch = filters.branch;
  if (filters.semester) where.semester = filters.semester;
  if (filters.subject)
    where.subject = { contains: filters.subject, mode: "insensitive" };
  if (filters.resourceType) where.resourceType = filters.resourceType;
  if (filters.examType) where.examType = filters.examType;
  if (filters.price === "free") where.isFree = true;
  if (filters.price === "paid") where.isFree = false;
  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: "insensitive" } },
      { subject: { contains: filters.q, mode: "insensitive" } },
      { moduleName: { contains: filters.q, mode: "insensitive" } },
      { description: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  const rows = await prisma.resource.findMany({
    where,
    select: cardSelect,
    orderBy: { createdAt: "desc" },
    take: SCAN_CAP,
  });
  let items = await attachRatings(rows);

  if (filters.minRating) {
    const min = filters.minRating;
    items = items.filter((r) => r.avgRating >= min);
  }
  items = sortCards(items, filters.sort ?? "recent");

  const perPage = filters.perPage ?? 12;
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(1, filters.page ?? 1), pageCount);
  const start = (page - 1) * perPage;

  return {
    items: items.slice(start, start + perPage),
    total,
    page,
    perPage,
    pageCount,
  };
}

export async function getFeaturedResources(limit = 8): Promise<ResourceCard[]> {
  const rows = await prisma.resource.findMany({
    where: { status: "PUBLISHED" },
    select: cardSelect,
    orderBy: [{ downloadCount: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
  return attachRatings(rows);
}

export async function getRecentResources(limit = 6): Promise<ResourceCard[]> {
  const rows = await prisma.resource.findMany({
    where: { status: "PUBLISHED" },
    select: cardSelect,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return attachRatings(rows);
}

export async function getCreatorResources(
  creatorId: string,
): Promise<ResourceCard[]> {
  const rows = await prisma.resource.findMany({
    where: { creatorId, status: "PUBLISHED" },
    select: cardSelect,
    orderBy: { createdAt: "desc" },
  });
  return attachRatings(rows);
}

export async function getResourceDetail(id: string) {
  const resource = await prisma.resource.findUnique({
    where: { id },
    include: {
      creator: true,
      reviews: {
        include: {
          author: {
            select: { id: true, username: true, fullName: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { purchases: true } },
    },
  });
  if (!resource || resource.status !== "PUBLISHED") return null;
  const avgRating = resource.reviews.length
    ? resource.reviews.reduce((s, r) => s + r.rating, 0) / resource.reviews.length
    : 0;
  return { ...resource, avgRating, reviewCount: resource.reviews.length };
}

export async function getCreatorStats(creatorId: string): Promise<CreatorStats> {
  const [resourceAgg, reviewAgg, followerCount] = await Promise.all([
    prisma.resource.aggregate({
      where: { creatorId, status: "PUBLISHED" },
      _count: { _all: true },
      _sum: { downloadCount: true },
    }),
    prisma.review.aggregate({
      where: { resource: { creatorId } },
      _avg: { rating: true },
      _count: { _all: true },
    }),
    prisma.follow.count({ where: { creatorId } }),
  ]);
  return {
    resourceCount: resourceAgg._count._all,
    totalDownloads: resourceAgg._sum.downloadCount ?? 0,
    avgRating: reviewAgg._avg.rating ?? 0,
    reviewCount: reviewAgg._count._all,
    followerCount,
  };
}

export async function getCreatorByUsername(username: string) {
  return prisma.profile.findUnique({ where: { username } });
}

export async function getTopCreators(limit = 6) {
  const creators = await prisma.profile.findMany({
    where: { resources: { some: { status: "PUBLISHED" } } },
    take: 80,
  });
  const withStats = await Promise.all(
    creators.map(async (creator) => ({
      creator,
      stats: await getCreatorStats(creator.id),
    })),
  );
  return withStats
    .sort((a, b) => reputationScore(b.stats) - reputationScore(a.stats))
    .slice(0, limit);
}

export async function getUserPurchase(userId: string, resourceId: string) {
  return prisma.purchase.findUnique({
    where: { buyerId_resourceId: { buyerId: userId, resourceId } },
  });
}

export async function isFollowing(followerId: string, creatorId: string) {
  if (followerId === creatorId) return false;
  const row = await prisma.follow.findUnique({
    where: { followerId_creatorId: { followerId, creatorId } },
  });
  return Boolean(row);
}

export async function getUserLibrary(userId: string) {
  return prisma.purchase.findMany({
    where: { buyerId: userId, status: { in: ["PAID", "FREE"] } },
    include: {
      resource: {
        include: {
          creator: { select: { username: true, fullName: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserUploads(userId: string) {
  return prisma.resource.findMany({
    where: { creatorId: userId },
    include: { _count: { select: { purchases: true, reviews: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCreatorEarnings(userId: string) {
  const agg = await prisma.purchase.aggregate({
    where: { creatorId: userId, status: "PAID" },
    _sum: { creatorEarningInPaise: true },
    _count: { _all: true },
  });
  return {
    totalEarningInPaise: agg._sum.creatorEarningInPaise ?? 0,
    salesCount: agg._count._all,
  };
}

/** The student's current active subscription, or null if none is live. */
export async function getActiveSubscription(userId: string) {
  return prisma.subscription.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      currentPeriodEnd: { gt: new Date() },
    },
    orderBy: { currentPeriodEnd: "desc" },
  });
}

/** True if the student can download any resource right now. */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  return (await getActiveSubscription(userId)) !== null;
}

export async function getAllPublishedResourceIds(): Promise<
  { id: string; updatedAt: Date }[]
> {
  return prisma.resource.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, updatedAt: true },
    orderBy: { createdAt: "desc" },
    take: 1000,
  });
}
