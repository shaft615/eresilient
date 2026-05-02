import type { ComponentType } from "react";
import { ArticleFrontmatter } from "@/lib/content";

// Explicit module map keeps the dynamic imports statically analyzable
// for the bundler. Add a new article: drop the .mdx file in this
// directory and add an entry below.
const articleModules: Record<
  string,
  () => Promise<{ default: ComponentType; metadata: unknown }>
> = {
  "business-continuity-planning-for-small-business": () =>
    import("./business-continuity-planning-for-small-business.mdx"),
  "how-to-conduct-a-business-impact-analysis": () =>
    import("./how-to-conduct-a-business-impact-analysis.mdx"),
  "iso-22301-compliance-checklist": () =>
    import("./iso-22301-compliance-checklist.mdx"),
};

export const articleSlugs = Object.keys(articleModules);

export type LoadedArticle = {
  Component: ComponentType;
  metadata: ArticleFrontmatter;
};

export async function getArticle(slug: string): Promise<LoadedArticle | null> {
  const loader = articleModules[slug];
  if (!loader) return null;
  const mod = await loader();
  const metadata = ArticleFrontmatter.parse(mod.metadata);
  if (metadata.draft) return null;
  return { Component: mod.default, metadata };
}

export async function getAllArticleMetadata(): Promise<ArticleFrontmatter[]> {
  const items = await Promise.all(
    articleSlugs.map(async (slug) => {
      const mod = await articleModules[slug]();
      return ArticleFrontmatter.parse(mod.metadata);
    }),
  );
  return items
    .filter((a) => !a.draft)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function getRelatedArticles(
  currentSlug: string,
  limit = 2,
): Promise<ArticleFrontmatter[]> {
  const all = await getAllArticleMetadata();
  return all.filter((a) => a.slug !== currentSlug).slice(0, limit);
}
