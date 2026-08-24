/**
 * Catalog of RISC-family tools a client can be entitled to. Slugs are
 * stored in clients.tool_access; hrefs currently point at the showcase
 * pages and will move to the real workspaces as each one ships.
 */
export type PortalTool = {
  slug: string;
  name: string;
  description: string;
  href: string;
};

export const PORTAL_TOOLS: PortalTool[] = [
  {
    slug: "risc-analysis",
    name: "riscAnalysis™",
    description: "Business Impact Analysis workspace (RTO, RPO, MBCO, MTPD).",
    href: "/tools/risc-analysis",
  },
  {
    slug: "risc-scope",
    name: "riscScope™",
    description: "Enterprise risk assessment and threat register.",
    href: "/tools/risc-scope",
  },
  {
    slug: "risc-response",
    name: "riscResponse™",
    description: "Incident response and plan activation workspace.",
    href: "/tools/risc-response",
  },
];

export const TOOL_SLUGS = PORTAL_TOOLS.map((t) => t.slug);

export const toolBySlug = new Map(PORTAL_TOOLS.map((t) => [t.slug, t]));
