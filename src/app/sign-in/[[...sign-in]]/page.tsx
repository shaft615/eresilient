import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { Container } from "@/components/container";
import { PortalSetupNotice } from "@/components/portal-setup-notice";
import { hasClerk } from "@/lib/portal-auth";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  if (!hasClerk()) return <PortalSetupNotice area="Client sign-in" />;
  return (
    <section className="section-warm py-20 sm:py-24">
      <Container className="flex justify-center">
        <SignIn
          path="/sign-in"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/portal"
        />
      </Container>
    </section>
  );
}
