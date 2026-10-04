/**
 * Auth gate for every BIA-tool page that requires a signed-in user.
 * Login lives outside this route group so it can render unauthenticated.
 */
import { requireUser } from "@/lib/bia/auth";
import { signOut } from "../login/actions";

export default async function AuthedBiaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <>
      <div className="bia-userbar">
        <div className="bia-userbar-inner">
          <span>BIA Tool</span>
          <form action={signOut}>
            <span className="bia-user">{user.email}</span>
            <button type="submit">Sign out</button>
          </form>
        </div>
      </div>
      {children}
    </>
  );
}
