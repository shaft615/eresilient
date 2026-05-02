import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Packages",
  description:
    "Productized engagement tiers for SMB business continuity programs. Detail page publishing soon.",
  alternates: { canonical: `${SITE.url}/packages` },
};

export default function PackagesPage() {
  return (
    <ComingSoon
      eyebrow="Packages"
      title="Engagement tiers publishing soon."
      body="We're packaging up the most common SMB engagement shapes into clear, fixed-scope tiers — so you can pick the right starting point without a full discovery call. Until then, book a consultation and we'll scope something that fits."
    />
  );
}
