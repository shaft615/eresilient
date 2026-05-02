import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Capability Statement",
  description:
    "e|Resilient Capability Statement — services, differentiators, federal registration. Web version publishing soon; the PDF is available on request.",
  alternates: { canonical: `${SITE.url}/capabilities` },
};

export default function CapabilitiesPage() {
  return (
    <ComingSoon
      eyebrow="Capability Statement"
      title="Web version publishing soon."
      body="The full Capability Statement — services, past performance differentiators, certifications, and federal registration — will live here as a web page with a downloadable PDF. Reach out and we'll send the current PDF directly."
    />
  );
}
