/**
 * Shared resolution for the client portal: who is signed in, which client
 * workspace they see, and whether this is an admin "view as client"
 * preview.
 */
import { currentUser } from "@clerk/nextjs/server";
import { getPortalIdentity, hasClerk, type PortalIdentity } from "./portal-auth";
import { findClientForEmails, getClient, type ClientRecord } from "./portal-db";

export type PortalContext = {
  identity: PortalIdentity;
  client: ClientRecord | null;
  /** True when an admin is viewing a client's portal via ?as=<clientId>. */
  isAdminPreview: boolean;
};

/**
 * Resolve the portal context. `asClientId` comes from the ?as= search
 * param and is honored only for admins — everyone else always gets the
 * client their email is linked to.
 */
export async function getPortalContext(
  asClientId?: string,
): Promise<PortalContext | null> {
  if (!hasClerk()) return null;
  const identity = await getPortalIdentity();
  if (!identity) return null;

  if (identity.isAdmin && asClientId) {
    const client = await getClient(asClientId);
    return { identity, client, isAdminPreview: Boolean(client) };
  }

  const client = await findClientForEmails(identity.emails);
  return { identity, client, isAdminPreview: false };
}

/**
 * Sign-in discipline: after a first sign-in via emailed code, the user
 * must set a password before using the portal. A connected SSO account
 * (e.g. Google) satisfies the requirement too. Admins are held to the
 * same rule.
 */
export async function needsPasswordSetup(): Promise<boolean> {
  if (!hasClerk()) return false;
  const user = await currentUser();
  if (!user) return false;
  return !user.passwordEnabled && (user.externalAccounts?.length ?? 0) === 0;
}
