"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "done" | "error";

export function UnsubscribeForm({
  email,
  token,
}: {
  email: string;
  token: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setStatus("error");
        setError(data.error ?? "Could not unsubscribe. Please try again.");
        return;
      }
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Network error.");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-md border border-brand-orange bg-brand-taupe-light/60 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-orange">
          Done
        </p>
        <h3 className="mt-2 font-display text-lg text-brand-maroon">
          You&apos;re unsubscribed.
        </h3>
        <p className="mt-2 text-sm text-brand-ink-mid">
          We&apos;ve removed{" "}
          <span className="font-semibold text-brand-ink">{email}</span> from
          all future campaigns. If this was a mistake, reach out and
          we&apos;ll re-subscribe you.
        </p>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={submit}
        disabled={status === "submitting"}
        className="inline-flex items-center justify-center rounded-md bg-brand-orange px-6 py-3 text-sm font-semibold text-brand-paper shadow-sm shadow-brand-orange/30 transition-opacity hover:opacity-95 disabled:cursor-wait disabled:opacity-60"
      >
        {status === "submitting" ? "Unsubscribing…" : "Confirm unsubscribe"}
      </button>
      {error && (
        <p
          role="alert"
          className="mt-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </p>
      )}
    </div>
  );
}
