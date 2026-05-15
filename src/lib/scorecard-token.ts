/**
 * Signed view tokens for /scorecard/view/[id].
 *
 * Token format: base64url(HMAC-SHA256(id, secret)) — ~43 chars.
 * Stateless — no DB lookup required to verify a token belongs to a
 * given submission id. Mirrors the unsubscribe.ts pattern.
 *
 * Use:
 *   - Karl's notification email contains a link with ?t=<token>
 *   - The viewer page validates the token against the submission id
 *     before fetching/rendering the row
 *
 * Security: anyone with the link can view the submission. That's
 * intentional — Karl can forward the link to the consultant team. The
 * surface stays scoped because the token is unguessable (HMAC over a
 * UUID with a server secret).
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { SITE } from "./site";

function secret(): string {
  // Same fallback pattern as unsubscribe — production MUST set the env
  // var, but dev/preview without it still produces verifiable tokens.
  return (
    process.env.SCORECARD_VIEW_SECRET ??
    `dev-fallback-not-for-production-${SITE.url}`
  );
}

export function makeScorecardViewToken(id: string): string {
  const h = createHmac("sha256", secret());
  h.update(id);
  return h.digest("base64url");
}

export function verifyScorecardViewToken(id: string, token: string): boolean {
  if (!id || !token) return false;
  const expected = makeScorecardViewToken(id);
  if (expected.length !== token.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(token));
  } catch {
    return false;
  }
}

export function makeScorecardViewUrl(id: string): string {
  const token = makeScorecardViewToken(id);
  const url = new URL(`/scorecard/view/${id}`, SITE.url);
  url.searchParams.set("t", token);
  return url.toString();
}
