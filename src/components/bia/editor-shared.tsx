/**
 * Shared atoms for BIA editor sections.
 * All server components — no client JS needed.
 */
import type { ReactNode } from "react";

export function SectionShell({
  id,
  title,
  hint,
  children,
}: {
  id: string;
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-2xl border border-brand-taupe-mid bg-brand-paper p-6"
    >
      <div className="mb-4">
        <h2 className="font-display text-2xl text-brand-maroon">{title}</h2>
        {hint ? (
          <p className="mt-1 text-xs text-brand-ink-mid">{hint}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-xs font-semibold uppercase tracking-[0.12em] text-brand-ink-mid"
    >
      {children}
    </label>
  );
}

export function TextInput({
  id,
  name,
  defaultValue,
  placeholder,
  required,
  type = "text",
}: {
  id?: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <input
      id={id ?? name}
      name={name}
      type={type}
      required={required}
      defaultValue={defaultValue ?? ""}
      placeholder={placeholder}
      className="mt-1 w-full rounded-lg border border-brand-taupe-mid bg-brand-paper px-3 py-2 text-sm text-brand-ink shadow-sm focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange"
    />
  );
}

export function TextArea({
  id,
  name,
  defaultValue,
  placeholder,
  rows = 3,
}: {
  id?: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      id={id ?? name}
      name={name}
      rows={rows}
      defaultValue={defaultValue ?? ""}
      placeholder={placeholder}
      className="mt-1 w-full rounded-lg border border-brand-taupe-mid bg-brand-paper px-3 py-2 text-sm text-brand-ink shadow-sm focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange"
    />
  );
}

export function PrimaryButton({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <button
      type="submit"
      className="inline-flex items-center justify-center rounded-lg bg-brand-orange px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-brand-paper transition hover:bg-brand-maroon"
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <button
      type="submit"
      className="inline-flex items-center justify-center rounded-lg border border-brand-taupe-mid bg-brand-paper px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-brand-ink-mid transition hover:border-brand-maroon hover:text-brand-maroon"
    >
      {children}
    </button>
  );
}

export function DangerButton({
  children,
  ariaLabel,
}: {
  children: ReactNode;
  ariaLabel?: string;
}) {
  return (
    <button
      type="submit"
      aria-label={ariaLabel}
      className="inline-flex items-center justify-center rounded-lg border border-brand-taupe-mid bg-brand-paper px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-brand-maroon transition hover:bg-brand-maroon hover:text-brand-paper"
    >
      {children}
    </button>
  );
}
