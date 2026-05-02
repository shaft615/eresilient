import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "e|Resilient privacy policy. Full text publishing soon.",
  alternates: { canonical: `${SITE.url}/legal/privacy` },
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return (
    <ComingSoon
      eyebrow="Legal"
      title="Privacy Policy."
      body="The full privacy policy is being finalized. For questions about how we handle your information in the meantime, reach out directly."
    />
  );
}
