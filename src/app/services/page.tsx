import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Five service lines: Business Continuity Planning, Crisis Management, Emergency Response, Supply Chain Risk, and Real-Time Support. Detail pages publishing soon.",
  alternates: { canonical: `${SITE.url}/services` },
};

export default function ServicesPage() {
  return (
    <ComingSoon
      eyebrow="Services"
      title="Detailed service pages publishing soon."
      body="Dedicated pages for Business Continuity Planning, Crisis Management, Emergency Response, Supply Chain Risk, and Real-Time Support are in production. In the meantime, the consultation calendar is open and Karl can walk you through any of the five service lines."
    />
  );
}
