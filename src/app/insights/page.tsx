import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Practitioner-grade writing on business continuity, BIA, ISO 22301, and supply chain resilience for SMB leaders. First articles publishing soon.",
  alternates: { canonical: `${SITE.url}/insights` },
};

export default function InsightsPage() {
  return (
    <ComingSoon
      eyebrow="Insights"
      title="Articles publishing soon."
      body="Our first cornerstone pieces — on BCP for SMBs, conducting a Business Impact Analysis, and ISO 22301 readiness — are being drafted from 25+ years of working notes. Subscribe via the BCP Readiness Scorecard to get them when they land."
    />
  );
}
