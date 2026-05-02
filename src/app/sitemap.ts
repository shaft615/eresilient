import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = [
    "",
    "/services",
    "/packages",
    "/about",
    "/about/karl",
    "/capabilities",
    "/insights",
    "/contact",
    "/resources/bcp-readiness-scorecard",
    "/legal/privacy",
    "/legal/terms",
  ];
  return routes.map((path) => ({
    url: `${SITE.url}${path}`,
    lastModified: now,
    changeFrequency: path === "/insights" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
