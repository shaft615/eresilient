/**
 * Auth helpers for the admin and client portals (Clerk-backed).
 *
 * Follows the graceful-degradation pattern used across src/lib: when the
 * Clerk env vars aren't set, hasClerk() is false and callers render a
 * "not configured" notice instead of crashing the build or the page.
 */
import { auth, currentUser } from "@clerk/nextjs/server";

export function hasClerk(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
  );
}

/** Comma-separated ADMIN_EMAILS env → lowercase list. Empty = nobody is admin. */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export type PortalIdentity = {
  userId: string;
  /** All verified email addresses on the Clerk user, lowercased. */
  emails: string[];
  firstName: string | null;
  isAdmin: boolean;
};

/**
 * Resolve the signed-in user, or null when signed out / Clerk unconfigured.
 * Admin = any verified email listed in ADMIN_EMAILS.
 */
export async function getPortalIdentity(): Promise<PortalIdentity | null> {
  if (!hasClerk()) return null;
  const { userId } = await auth();
  if (!userId) return null;
  const user = await currentUser();
  if (!user) return null;
  const emails = user.emailAddresses
    .filter((e) => e.verification?.status === "verified")
    .map((e) => e.emailAddress.toLowerCase());
  const admins = adminEmails();
  return {
    userId,
    emails,
    firstName: user.firstName,
    isAdmin: emails.some((e) => admins.includes(e)),
  };
}
