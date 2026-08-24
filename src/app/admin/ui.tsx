import type { ReactNode } from "react";

/** Shared form styling for the admin/portal surfaces. */
export const inputCls =
  "w-full rounded-md border border-brand-ink/20 bg-white px-3 py-2 text-sm text-brand-ink placeholder:text-brand-ink-mid/50 focus:border-brand-orange focus:outline-none";

export const labelCls =
  "block text-xs font-semibold uppercase tracking-[0.14em] text-brand-ink-mid";

export const buttonCls =
  "inline-flex items-center justify-center rounded-md bg-brand-orange px-4 py-2 text-sm font-semibold tracking-wide text-brand-paper transition-colors hover:bg-brand-orange-soft";

export const buttonGhostCls =
  "inline-flex items-center justify-center rounded-md border border-brand-ink/20 px-3 py-1.5 text-xs font-semibold text-brand-ink transition-colors hover:border-brand-orange hover:text-brand-orange";

export function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className={labelCls}>{label}</span>
      <span className="mt-1 block">{children}</span>
    </label>
  );
}

export function Card({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border border-brand-taupe-mid/60 bg-white/70 p-6 shadow-sm ${className}`}
    >
      {title && (
        <h2 className="mb-4 font-display text-xl text-brand-ink">{title}</h2>
      )}
      {children}
    </div>
  );
}

const statusStyles: Record<string, string> = {
  // clients
  prospect: "bg-amber-100 text-amber-900",
  active: "bg-emerald-100 text-emerald-900",
  archived: "bg-stone-200 text-stone-700",
  // engagements
  proposed: "bg-amber-100 text-amber-900",
  on_hold: "bg-stone-200 text-stone-700",
  complete: "bg-sky-100 text-sky-900",
  cancelled: "bg-stone-200 text-stone-700",
  // milestones
  pending: "bg-stone-200 text-stone-700",
  in_progress: "bg-amber-100 text-amber-900",
  // tickets
  waiting_on_client: "bg-sky-100 text-sky-900",
  closed: "bg-stone-200 text-stone-700",
  // invoices
  draft: "bg-stone-200 text-stone-700",
  open: "bg-amber-100 text-amber-900",
  paid: "bg-emerald-100 text-emerald-900",
  void: "bg-stone-200 text-stone-700",
  uncollectible: "bg-red-100 text-red-900",
};

export function StatusBadge({ status }: { status: string }) {
  const cls = statusStyles[status] ?? "bg-stone-200 text-stone-700";
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

export function ErrorNotice({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="mb-6 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">
      {message}
    </div>
  );
}
