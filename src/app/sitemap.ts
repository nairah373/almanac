import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { getAllPublishedResourceIds } from "@/lib/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.siteUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/browse`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/creators`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/signup`, changeFrequency: "monthly", priority: 0.5 },
  ];

  let resources: MetadataRoute.Sitemap = [];
  try {
    const ids = await getAllPublishedResourceIds();
    resources = ids.map((r) => ({
      url: `${base}/resources/${r.id}`,
      lastModified: r.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch {
    // Database not reachable at build time — ship the static routes only.
  }

  return [...staticRoutes, ...resources];
}
