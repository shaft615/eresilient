import { createHmac, timingSafeEqual } from "node:crypto";
import { SITE } from "./site";

/**
 * Token generation/verification for one-click unsubscribe links.
 *
 * Token format: base64url(HMAC-SHA256(email, secret)) — ~43 chars.
 * Stateless and verifiable; no DB lookup needed to confirm a token belongs
 * to a given email. The secret should rotate only when you want to
 * invalidate every existing unsubscribe link in flight.
 */

function secret(): string {
  // Falls back to a build-time-static derivation so dev / preview can
  // generate verifiable tokens without configuring NURTURE_UNSUBSCRIBE_SECRET.
  // Production MUST set the env var.
  return (
    process.env.NURTURE_UNSUBSCRIBE_SECRET ??
    `dev-fallback-not-for-production-${SITE.url}`
  );
}

export function makeUnsubscribeToken(email: string): string {
  const h = createHmac("sha256", secret());
  h.update(email.trim().toLowerCase());
  return h.digest("base64url");
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  if (!email || !token) return false;
  const expected = makeUnsubscribeToken(email);
  if (expected.length !== token.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(token));
  } catch {
    return false;
  }
}

export function makeUnsubscribeUrl(email: string): string {
  const token = makeUnsubscribeToken(email);
  const url = new URL("/unsubscribe", SITE.url);
  url.searchParams.set("e", email);
  url.searchParams.set("t", token);
  return url.toString();
}
