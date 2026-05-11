"use client";

import { useState, type FormEvent } from "react";
import { TOPICS } from "@/lib/contact-form";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
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
      organization: String(fd.get("organization") ?? "").trim() || undefined,
      topic: String(fd.get("topic") ?? "general"),
      message: String(fd.get("message") ?? "").trim(),
      website: String(fd.get("website") ?? ""),
    };

    try {
      const res = await fetch("/api/contact", {
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
      e.currentTarget.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Network error.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl border border-brand-orange bg-brand-taupe-light/60 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-orange">
          Message sent
        </p>
        <h3 className="mt-2 font-display text-2xl text-brand-maroon">
          Thanks — we&apos;ll be in touch.
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-brand-ink-mid">
          We respond to inbound inquiries within one business day. A
          confirmation should land in your inbox shortly. For active incidents
          or anything time-sensitive, the phone is faster.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-5 text-sm font-semibold text-brand-orange hover:underline"
        >
          Send another message
        </button>
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
          <label htmlFor="cf-name" className={labelClass}>
            Your name
          </label>
          <input
            id="cf-name"
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
          <label htmlFor="cf-email" className={labelClass}>
            Work email
          </label>
          <input
            id="cf-email"
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

      <div>
        <label htmlFor="cf-org" className={labelClass}>
          Organization{" "}
          <span className="font-normal text-brand-ink-faint">(optional)</span>
        </label>
        <input
          id="cf-org"
          name="organization"
          type="text"
          autoComplete="organization"
          placeholder="Acme Corp"
          disabled={submitting}
          className={`mt-2 ${fieldClass}`}
        />
      </div>

      <div>
        <label htmlFor="cf-topic" className={labelClass}>
          What&apos;s this about?
        </label>
        <select
          id="cf-topic"
          name="topic"
          defaultValue="general"
          disabled={submitting}
          className={`mt-2 ${fieldClass}`}
        >
          {TOPICS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="cf-message" className={labelClass}>
          Message
        </label>
        <textarea
          id="cf-message"
          name="message"
          required
          rows={6}
          minLength={10}
          placeholder="Briefly: what's going on, where you are in your continuity program, and what would help."
          disabled={submitting}
          className={`mt-2 ${fieldClass}`}
        />
      </div>

      {/* Honeypot */}
      <div
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
      >
        <label htmlFor="cf-website">Website</label>
        <input
          id="cf-website"
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
        {submitting ? "Sending…" : "Send message →"}
      </button>

      <p className="text-xs leading-relaxed text-brand-ink-light">
        Replies route to a real practitioner within one business day. For
        active incidents call us — phone gets the fastest response.
      </p>
    </form>
  );
}
