import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { Container } from "@/components/container";
import { PortalSetupNotice } from "@/components/portal-setup-notice";
import { hasClerk } from "@/lib/portal-auth";

export const metadata: Metadata = {
  title: "Sign up",
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
  if (!hasClerk()) return <PortalSetupNotice area="Client sign-up" />;
  return (
    <section className="section-warm py-20 sm:py-24">
      <Container className="flex justify-center">
        <SignUp
          path="/sign-up"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/portal"
        />
      </Container>
    </section>
  );
}
