import { foundation } from "./foundation";
import { program } from "./program";
import { enterprise } from "./enterprise";
import type { PackageContent } from "@/lib/content";

export const packages: PackageContent[] = [foundation, program, enterprise].sort(
  (a, b) => a.order - b.order,
);

export const packageBySlug = new Map(packages.map((p) => [p.slug, p]));
