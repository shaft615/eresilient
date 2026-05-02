import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "e|Resilient terms of service. Full text publishing soon.",
  alternates: { canonical: `${SITE.url}/legal/terms` },
  robots: { index: false, follow: true },
};

export default function TermsPage() {
  return (
    <ComingSoon
      eyebrow="Legal"
      title="Terms of Service."
      body="The full terms of service are being finalized. For questions in the meantime, reach out directly."
    />
  );
}
