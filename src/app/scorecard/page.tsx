import type { Metadata } from "next";
import BCPAssessment from "@/components/scorecard";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "BCP Readiness Assessment",
  description:
    "Self-assess your business continuity program across 8 ISO 22301-aligned domains and 42 questions. Instant scorecard with maturity band, radar visualization, and prioritized gap analysis.",
  alternates: { canonical: `${SITE.url}/scorecard` },
  // Public route, but the natural funnel sends visitors here from the
  // email-gated landing page at /resources/bcp-readiness-scorecard.
  // Keep it indexable so the link can be shared directly when useful.
};

export default function ScorecardPage() {
  return <BCPAssessment />;
}
