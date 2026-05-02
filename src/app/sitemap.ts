import type { MetadataRoute } from "next";
import { services } from "@/content/services";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPaths = [
    "",
    "/services",
    "/packages",
    "/about",
    "/about/karl",
    "/capabilities",
    "/insights",
    "/contact",
    "/resources/bcp-readiness-scorecard",
    "/scorecard",
    "/legal/privacy",
    "/legal/terms",
  ];

  const servicePaths = services.map((s) => `/services/${s.slug}`);

  return [...staticPaths, ...servicePaths].map((path) => ({
    url: `${SITE.url}${path}`,
    lastModified: now,
    changeFrequency: path === "/insights" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path.startsWith("/services/") ? 0.9 : 0.7,
  }));
}
