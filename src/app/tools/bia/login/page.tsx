import type { Metadata } from "next";
import { sendMagicLink } from "./actions";

export const metadata: Metadata = {
  title: "Sign in to the BIA Tool",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ sent?: string; error?: string }>;

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "Please enter a valid email address.",
  send: "Couldn't send the link. Try again in a moment.",
  callback: "That link expired or was already used. Request a new one.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const sent = params.sent === "1";
  const errorMessage = params.error ? ERROR_MESSAGES[params.error] : null;

  return (
    <>
      <header className="bia-band">
        <div className="bia-band-inner">
          <div>
            <div className="bia-eyebrow">BIA Tool</div>
            <h1>Sign in</h1>
          </div>
        </div>
      </header>
      <div className="bia-page bia-narrow bia-stack">
        {sent ? (
          <div className="bia-callout">
            <b>Check your inbox.</b> If that address has access, a sign-in link
            is on its way. The link is good for one hour.
          </div>
        ) : (
          <form action={sendMagicLink} className="bia-block">
            <p className="bia-hint">
              We&apos;ll email you a one-time link. No password needed.
            </p>
            <div className="bia-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@company.com"
              />
            </div>

            {errorMessage ? (
              <p className="bia-alert" role="alert">
                {errorMessage}
              </p>
            ) : null}

            <div className="bia-btn-row">
              <button type="submit" className="bia-btn primary">
                Send sign-in link
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
