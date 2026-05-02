import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "BCP Readiness Scorecard",
  description:
    "Self-assess your business continuity program across 8 ISO 22301-aligned domains. Interactive scorecard launching soon.",
  alternates: { canonical: `${SITE.url}/resources/bcp-readiness-scorecard` },
};

export default function ScorecardPage() {
  return (
    <ComingSoon
      eyebrow="Lead Magnet · Coming Soon"
      title="BCP Readiness Scorecard."
      body="An interactive 42-question self-assessment across 8 ISO 22301-aligned domains — governance, risk, BIA, strategy, plans, training, exercising, and improvement. Wiring up the form, email handoff, and scoring engine. If you'd like early access, drop us a line."
    />
  );
}
