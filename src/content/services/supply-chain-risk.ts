import type { ServiceContent } from "@/lib/content";

export const supplyChainRisk: ServiceContent = {
  slug: "supply-chain-risk",
  title: "Supply Chain Risk",
  shortTitle: "Supply Chain Risk",
  category: "Continuous Monitoring",
  summary:
    "Global supply chain mapping, supplier monitoring, and dynamic mitigation strategies. Integrated with ERP and continuity programs.",
  metaTitle: "Supply Chain Risk Management Consulting | e|Resilient",
  metaDescription:
    "Map your global supply chain, monitor supplier risk continuously, and integrate mitigation into your continuity program. Active monitoring via riscManager.com™ with ERP and BCM/Crisis integration. Built for SMBs with concentrated supplier exposure.",
  hero: {
    headline:
      "Your continuity plan is only as resilient as your weakest tier-2 supplier.",
    description:
      "Supply Chain Risk Solutions map your dependencies, monitor supplier health continuously, and turn supply-side disruption signals into pre-staged mitigation actions.",
  },
  problem:
    "The supply-side disruptions of the last five years — port closures, semiconductor shortages, vendor bankruptcies, geopolitical shocks — exposed how few companies actually know who their tier-2 and tier-3 suppliers are. A continuity plan that recovers your operations is irrelevant if your single-source coating vendor is still down. Supply Chain Risk closes that gap with mapping, monitoring, and pre-staged response.",
  whatsIncluded: [
    "Global supply chain mapping — direct, tier-2, and concentration analysis",
    "Supplier questionnaires and tracking with response-rate management",
    "Active monitoring via riscManager.com™ — financial, geopolitical, and event signals",
    "Dynamic mitigation strategies for product and service-line specific risks",
    "Integration with ERP systems for live inventory and PO visibility",
    "Integration into Business Continuity and Crisis Management plans",
  ],
  deliverables: [
    "Supply chain map with concentration heat-map and SPOF identification",
    "Supplier risk register with categorized exposures and mitigation owners",
    "Active monitoring dashboard with alert thresholds configured to your tolerances",
    "Mitigation playbook for top-tier risks (alternate suppliers, inventory buffers, contractual remedies)",
    "BCM/Crisis plan integration documenting supplier-disruption activation criteria",
  ],
  whoItsFor: [
    "Manufacturers with single-source dependencies on critical components",
    "Companies whose customers conduct supply-chain due-diligence (Fortune 500 buyers, regulated industries)",
    "Organizations exposed to concentrated geographic or geopolitical supply risk",
    "Firms whose existing BCM program treats supply-side disruption as a footnote",
  ],
  isoRefs: [
    "ISO 22301 §8.2.3 (Risk Assessment)",
    "ISO/TS 22318 (Supply Chain Continuity Guidance)",
    "ISO 28000 (Security and Resilience for Supply Chains)",
  ],
  process: [
    {
      step: "01",
      title: "Map",
      body: "Direct supplier inventory and tier-2 mapping. Concentration analysis surfaces where a single failure creates outsized exposure.",
    },
    {
      step: "02",
      title: "Assess",
      body: "Supplier questionnaires, financial signals, and geopolitical exposure feed into a risk register with categorized severity.",
    },
    {
      step: "03",
      title: "Monitor",
      body: "riscManager.com™ surfaces live signals on supplier financial health, news events, and geographic disruption. Alerts route to the right people on your team.",
    },
    {
      step: "04",
      title: "Respond",
      body: "Pre-staged mitigation playbooks activate when thresholds breach — alternate sourcing, inventory commitments, contract remedies, BCM/Crisis activation as appropriate.",
    },
  ],
  ctaLabel: "Schedule a supply-chain risk call",
  order: 4,
  featuredProduct: {
    name: "riscManager.com™",
    slug: "risc-manager",
    tagline: "The operating layer behind the methodology.",
    summary:
      "Our purpose-built SaaS platform for inventorying products by recovery readiness, mapping supply chains down to raw-material sources, and managing sole-source mitigation. Bundled with Program and Enterprise engagements; standalone licensing on request.",
    ctaLabel: "Learn more about riscManager.com™",
  },
};
