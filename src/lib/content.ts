import { z } from "zod";

export const ServiceContent = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  shortTitle: z.string().min(1),
  category: z.string().min(1),
  summary: z.string().min(1),
  metaTitle: z.string().min(1),
  metaDescription: z.string().min(1),
  hero: z.object({
    headline: z.string().min(1),
    description: z.string().min(1),
  }),
  problem: z.string().min(1),
  whatsIncluded: z.array(z.string()).min(1),
  deliverables: z.array(z.string()).min(1),
  whoItsFor: z.array(z.string()).min(1),
  isoRefs: z.array(z.string()).default([]),
  process: z
    .array(
      z.object({
        step: z.string().min(1),
        title: z.string().min(1),
        body: z.string().min(1),
      }),
    )
    .min(1),
  ctaLabel: z.string().default("Schedule a discovery call"),
  order: z.number().int().nonnegative(),
  // Optional: a productized tool or platform that ships with this service.
  // Renders as a featured "Powered by …" card on the service detail page,
  // linking to the product's showcase page at /products/<slug>.
  featuredProduct: z
    .object({
      name: z.string().min(1),
      slug: z.string().min(1),
      tagline: z.string().min(1),
      summary: z.string().min(1),
      ctaLabel: z.string().default("Learn more"),
    })
    .optional(),
});
export type ServiceContent = z.infer<typeof ServiceContent>;

export const ArticleFrontmatter = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  updatedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  author: z.string().default("e|Resilient"),
  readingTimeMinutes: z.number().int().positive(),
  keywords: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  draft: z.boolean().default(false),
});
export type ArticleFrontmatter = z.infer<typeof ArticleFrontmatter>;

export const PackageContent = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  tagline: z.string().min(1),
  startingAt: z.string().min(1),
  duration: z.string().min(1),
  order: z.number().int().nonnegative(),
  highlight: z.boolean().default(false),
  bestFor: z.string().min(1),
  includes: z.array(z.string()).min(1),
  excludes: z.array(z.string()).default([]),
  ctaLabel: z.string().default("Discuss this engagement"),
});
export type PackageContent = z.infer<typeof PackageContent>;
