import type { MetadataRoute } from "next";
import { getAllArticleMetadata } from "@/content/insights";
import { services } from "@/content/services";
import { SITE } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPaths = [
    "",
    "/services",
    "/packages",
    "/about",
    "/capabilities",
    "/insights",
    "/contact",
    "/resources/bcp-readiness-scorecard",
    "/scorecard",
    "/legal/privacy",
    "/legal/terms",
  ];

  const servicePaths = services.map((s) => `/services/${s.slug}`);

  const articles = await getAllArticleMetadata();
  const articleEntries: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE.url}/insights/${a.slug}`,
    lastModified: a.updatedAt
      ? new Date(`${a.updatedAt}T00:00:00Z`)
      : new Date(`${a.publishedAt}T00:00:00Z`),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const staticEntries: MetadataRoute.Sitemap = [
    ...staticPaths,
    ...servicePaths,
  ].map((path) => ({
    url: `${SITE.url}${path}`,
    lastModified: now,
    changeFrequency: path === "/insights" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path.startsWith("/services/") ? 0.9 : 0.7,
  }));

  return [...staticEntries, ...articleEntries];
}
