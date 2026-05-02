import { z } from "zod";

export const ServiceFrontmatter = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  shortTitle: z.string().min(1),
  summary: z.string().min(1),
  order: z.number().int().nonnegative(),
  keywords: z.array(z.string()).default([]),
  isoRefs: z.array(z.string()).default([]),
  outcomes: z.array(z.string()).default([]),
  ctaLabel: z.string().default("Schedule a discovery call"),
});
export type ServiceFrontmatter = z.infer<typeof ServiceFrontmatter>;

export const ArticleFrontmatter = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  author: z.string().default("Karl Bryant"),
  keywords: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
});
export type ArticleFrontmatter = z.infer<typeof ArticleFrontmatter>;

export const PackageFrontmatter = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  tagline: z.string().min(1),
  startingAt: z.string().min(1),
  order: z.number().int().nonnegative(),
  bestFor: z.string().min(1),
  includes: z.array(z.string()).min(1),
  ctaLabel: z.string().default("Discuss this engagement"),
});
export type PackageFrontmatter = z.infer<typeof PackageFrontmatter>;
