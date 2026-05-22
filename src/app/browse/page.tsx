import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchX } from "lucide-react";
import { ResourceType } from "@prisma/client";
import { getResourceCards, type ResourceFilters } from "@/lib/queries";
import { RESOURCE_TYPES, SORT_OPTIONS, type SortValue } from "@/lib/constants";
import { ResourceGrid } from "@/components/ResourceGrid";
import { BrowseFilters } from "@/components/BrowseFilters";
import { Pagination } from "@/components/Pagination";
import { PageHero } from "@/components/PageHero";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse resources",
  description:
    "Search trusted study notes, PYQs and resources by university, branch, semester and subject.",
};

type SP = Record<string, string | string[] | undefined>;

function str(sp: SP, k: string): string | undefined {
  const v = sp[k];
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

function parseFilters(sp: SP): ResourceFilters {
  const type = str(sp, "type");
  const sort = str(sp, "sort");
  const price = str(sp, "price");
  return {
    q: str(sp, "q"),
    university: str(sp, "university"),
    branch: str(sp, "branch"),
    semester: str(sp, "semester") ? Number(str(sp, "semester")) : undefined,
    subject: str(sp, "subject"),
    resourceType:
      type && (RESOURCE_TYPES as string[]).includes(type)
        ? (type as ResourceType)
        : undefined,
    examType: str(sp, "examType"),
    price: price === "free" ? "free" : price === "paid" ? "paid" : undefined,
    minRating: str(sp, "rating") ? Number(str(sp, "rating")) : undefined,
    sort:
      sort && SORT_OPTIONS.some((o) => o.value === sort)
        ? (sort as SortValue)
        : "recent",
    page: str(sp, "page") ? Math.max(1, Number(str(sp, "page"))) : 1,
    perPage: 12,
  };
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const filters = parseFilters(sp);

  const result = await getResourceCards(filters).catch(() => ({
    items: [],
    total: 0,
    page: 1,
    pageCount: 1,
    perPage: 12,
  }));

  const base = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string" && v && k !== "page") base.set(k, v);
  }
  const makeHref = (p: number) => {
    const x = new URLSearchParams(base);
    x.set("page", String(p));
    return `/browse?${x.toString()}`;
  };

  return (
    <div>
      <PageHero
        eyebrow="Explore"
        title="Browse resources"
        description={
          result.total > 0
            ? `${result.total} trusted resource${result.total === 1 ? "" : "s"} match your search.`
            : "Find trusted notes, PYQs and study material from students across India."
        }
      />

      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <Suspense fallback={<div className="h-96" />}>
              <BrowseFilters />
            </Suspense>
          </aside>

          <div>
            {result.items.length > 0 ? (
              <>
                <ResourceGrid resources={result.items} />
                <Pagination
                  page={result.page}
                  pageCount={result.pageCount}
                  makeHref={makeHref}
                />
              </>
            ) : (
              <EmptyState
                icon={SearchX}
                title="No resources found"
                description="Try removing a filter or searching for a different subject."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
