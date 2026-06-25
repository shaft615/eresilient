import type { Metadata } from "next";
import { Container } from "@/components/container";
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
    <section className="py-20 sm:py-28">
      <Container width="narrow">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">
          BIA Tool
        </p>
        <h1 className="mt-3 font-display text-3xl text-brand-maroon sm:text-4xl">
          Sign in
        </h1>
        <p className="mt-4 text-sm text-brand-ink-mid">
          We&apos;ll email you a one-time link. No password needed.
        </p>

        {sent ? (
          <div className="mt-8 rounded-2xl border border-brand-taupe-mid bg-brand-taupe-light/60 p-6 text-sm text-brand-ink-mid">
            <p className="font-semibold text-brand-maroon">Check your inbox.</p>
            <p className="mt-2">
              If that address has access, a sign-in link is on its way. The link
              is good for one hour.
            </p>
          </div>
        ) : (
          <form action={sendMagicLink} className="mt-8 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-[0.12em] text-brand-ink-mid"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="mt-2 w-full rounded-lg border border-brand-taupe-mid bg-brand-paper px-4 py-3 text-base text-brand-ink shadow-sm focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange"
                placeholder="you@company.com"
              />
            </div>

            {errorMessage ? (
              <p className="text-sm text-brand-maroon" role="alert">
                {errorMessage}
              </p>
            ) : null}

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-lg bg-brand-orange px-5 py-3 text-sm font-semibold uppercase tracking-[0.1em] text-brand-paper transition hover:bg-brand-maroon"
            >
              Send sign-in link
            </button>
          </form>
        )}
      </Container>
    </section>
  );
}
