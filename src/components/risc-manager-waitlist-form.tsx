"use client";

import { useState, type FormEvent } from "react";

type Status = "idle" | "submitting" | "success" | "error";

export function RiscManagerWaitlistForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      organization: String(fd.get("organization") ?? "").trim(),
      role: String(fd.get("role") ?? "").trim() || undefined,
      website: String(fd.get("website") ?? ""),
      source: "risc-manager-waitlist",
    };

    try {
      const res = await fetch("/api/lead-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setStatus("error");
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Network error.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl border border-brand-orange bg-brand-taupe-light/60 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-orange">
          You&apos;re on the list
        </p>
        <h3 className="mt-2 font-display text-2xl text-brand-maroon">
          Thanks — we&apos;ll be in touch.
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-brand-ink-mid">
          A confirmation should land in your inbox in the next minute. We&apos;ll
          reach out personally when workspace slots open up. If you want to talk
          supply chain right now, book a working call from the link in that
          email.
        </p>
      </div>
    );
  }

  const fieldClass =
    "w-full rounded-md border border-brand-taupe-mid bg-brand-paper px-4 py-3 text-sm text-brand-ink placeholder:text-brand-ink-faint focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange disabled:opacity-60";
  const labelClass =
    "block text-xs font-semibold uppercase tracking-[0.12em] text-brand-ink-light";
  const submitting = status === "submitting";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="rm-name" className={labelClass}>
            Your name
          </label>
          <input
            id="rm-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            placeholder="Jane Doe"
            disabled={submitting}
            className={`mt-2 ${fieldClass}`}
          />
        </div>
        <div>
          <label htmlFor="rm-email" className={labelClass}>
            Work email
          </label>
          <input
            id="rm-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@company.com"
            disabled={submitting}
            className={`mt-2 ${fieldClass}`}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="rm-org" className={labelClass}>
            Organization
          </label>
          <input
            id="rm-org"
            name="organization"
            type="text"
            required
            autoComplete="organization"
            placeholder="Acme Manufacturing"
            disabled={submitting}
            className={`mt-2 ${fieldClass}`}
          />
        </div>
        <div>
          <label htmlFor="rm-role" className={labelClass}>
            Role{" "}
            <span className="font-normal text-brand-ink-faint">(optional)</span>
          </label>
          <input
            id="rm-role"
            name="role"
            type="text"
            autoComplete="organization-title"
            placeholder="VP Supply Chain"
            disabled={submitting}
            className={`mt-2 ${fieldClass}`}
          />
        </div>
      </div>

      {/* Honeypot — hidden from real users */}
      <div
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
      >
        <label htmlFor="rm-website">Website</label>
        <input
          id="rm-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex w-full items-center justify-center rounded-md bg-brand-orange px-5 py-3 text-sm font-semibold text-brand-paper shadow-sm shadow-brand-orange/30 transition-opacity hover:opacity-95 disabled:cursor-wait disabled:opacity-60"
      >
        {submitting ? "Submitting…" : "Request early access →"}
      </button>

      <p className="text-xs leading-relaxed text-brand-ink-light">
        We won&apos;t share your information. We&apos;ll only email you about
        riscManager.com™ access and occasional practitioner-grade BCM updates
        from e|Resilient. Unsubscribe any time.
      </p>
    </form>
  );
}
