"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Status = "idle" | "submitting" | "error";

export function LeadCaptureForm({
  source = "bcp-readiness-scorecard",
}: {
  source?: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const formData = new FormData(e.currentTarget);
    const payload = {
      email: String(formData.get("email") ?? "").trim(),
      name: String(formData.get("name") ?? "").trim(),
      organization: String(formData.get("organization") ?? "").trim(),
      role: String(formData.get("role") ?? "").trim() || undefined,
      website: String(formData.get("website") ?? ""),
      source,
    };

    try {
      const res = await fetch("/api/lead-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; redirectTo?: string };
      if (!res.ok || !data.ok) {
        setStatus("error");
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      router.push(data.redirectTo ?? "/scorecard?welcome=1");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Network error.");
    }
  }

  const fieldClass =
    "w-full rounded-md border border-brand-taupe-mid bg-brand-paper px-4 py-3 text-sm text-brand-ink placeholder:text-brand-ink-faint focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange disabled:opacity-60";
  const labelClass =
    "block text-xs font-semibold uppercase tracking-[0.12em] text-brand-ink-light";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <label htmlFor="lc-name" className={labelClass}>
          Your name
        </label>
        <input
          id="lc-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          placeholder="Karl Bryant"
          disabled={status === "submitting"}
          className={`mt-2 ${fieldClass}`}
        />
      </div>

      <div>
        <label htmlFor="lc-email" className={labelClass}>
          Work email
        </label>
        <input
          id="lc-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          disabled={status === "submitting"}
          className={`mt-2 ${fieldClass}`}
        />
      </div>

      <div>
        <label htmlFor="lc-org" className={labelClass}>
          Organization
        </label>
        <input
          id="lc-org"
          name="organization"
          type="text"
          required
          autoComplete="organization"
          placeholder="Acme Corp"
          disabled={status === "submitting"}
          className={`mt-2 ${fieldClass}`}
        />
      </div>

      <div>
        <label htmlFor="lc-role" className={labelClass}>
          Role <span className="font-normal text-brand-ink-faint">(optional)</span>
        </label>
        <input
          id="lc-role"
          name="role"
          type="text"
          autoComplete="organization-title"
          placeholder="Director of Operations"
          disabled={status === "submitting"}
          className={`mt-2 ${fieldClass}`}
        />
      </div>

      {/* Honeypot — hidden from real users */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="lc-website">Website</label>
        <input id="lc-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
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
        disabled={status === "submitting"}
        className="inline-flex w-full items-center justify-center rounded-md bg-brand-orange px-5 py-3 text-sm font-semibold text-brand-paper shadow-sm shadow-brand-orange/30 transition-opacity hover:opacity-95 disabled:cursor-wait disabled:opacity-60"
      >
        {status === "submitting" ? "Submitting…" : "Send me the scorecard →"}
      </button>

      <p className="text-xs leading-relaxed text-brand-ink-light">
        We&apos;ll email you the link and add you to occasional, practitioner-grade
        BCM updates from Karl. No marketing automation — unsubscribe any time.
      </p>
    </form>
  );
}
