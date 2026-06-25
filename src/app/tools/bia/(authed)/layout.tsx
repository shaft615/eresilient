/**
 * Auth gate for every BIA-tool page that requires a signed-in user.
 * Login lives outside this route group so it can render unauthenticated.
 */
import { requireUser } from "@/lib/bia/auth";
import { signOut } from "../login/actions";
import { Container } from "@/components/container";

export default async function AuthedBiaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="min-h-[60vh]">
      <div className="border-b border-brand-taupe-mid bg-brand-taupe-light/40">
        <Container width="wide" className="flex items-center justify-between py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-orange">
            BIA Tool
          </p>
          <form action={signOut} className="flex items-center gap-3">
            <span className="text-xs text-brand-ink-mid">{user.email}</span>
            <button
              type="submit"
              className="text-xs font-semibold uppercase tracking-[0.1em] text-brand-maroon hover:text-brand-orange"
            >
              Sign out
            </button>
          </form>
        </Container>
      </div>
      {children}
    </div>
  );
}
