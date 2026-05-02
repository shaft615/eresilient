// MDX modules in this project may export a `metadata` constant alongside the
// default component export. Augment the ambient type from @types/mdx so the
// dynamic-import sites in src/content/* can read both.
declare module "*.mdx" {
  import type { ComponentType } from "react";
  export const metadata: unknown;
  const Component: ComponentType;
  export default Component;
}
