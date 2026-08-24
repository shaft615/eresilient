import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getClient,
  listClientUsers,
  listEngagements,
  listInvoices,
} from "@/lib/portal-db";
import { hasStripe } from "@/lib/stripe";
import { fmtUsd } from "@/lib/money";
import { packages } from "@/content/packages";
import {
  addClientUserAction,
  createEngagementAction,
  createInvoiceAction,
  removeClientUserAction,
  updateClientStatusAction,
  updateEngagementStatusAction,
} from "../../actions";
import {
  Card,
  ErrorNotice,
  Field,
  StatusBadge,
  buttonCls,
  buttonGhostCls,
  inputCls,
} from "../../ui";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function ClientDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { error } = await searchParams;

  const client = await getClient(id);
  if (!client) notFound();

  const [users, engagements, invoices] = await Promise.all([
    listClientUsers(id),
    listEngagements(id),
    listInvoices(id),
  ]);

  return (
    <div className="space-y-8">
      <ErrorNotice message={error} />

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-brand-ink-mid">
            <Link className="hover:text-brand-orange" href="/admin">
              ← All clients
            </Link>
          </p>
          <h1 className="mt-1 font-display text-3xl text-brand-ink">{client.name}</h1>
          <p className="mt-2 text-sm text-brand-ink-mid">
            {client.primaryContactName ?? "No primary contact"}
            {client.primaryContactEmail ? ` · ${client.primaryContactEmail}` : ""}
            {client.phone ? ` · ${client.phone}` : ""}
            {client.website ? (
              <>
                {" · "}
                <a
                  className="underline"
                  href={client.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {client.website.replace(/^https?:\/\//, "")}
                </a>
              </>
            ) : null}
          </p>
          {client.notes && (
            <p className="mt-2 max-w-2xl text-sm text-brand-ink-mid">{client.notes}</p>
          )}
        </div>
        <form action={updateClientStatusAction} className="flex items-center gap-2">
          <input type="hidden" name="clientId" value={client.id} />
          <StatusBadge status={client.status} />
          <select name="status" defaultValue={client.status} className={inputCls}>
            <option value="prospect">prospect</option>
            <option value="active">active</option>
            <option value="archived">archived</option>
          </select>
          <button type="submit" className={buttonGhostCls}>
            Set
          </button>
        </form>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Portal access */}
        <Card title="Portal access">
          {users.length === 0 ? (
            <p className="text-sm text-brand-ink-mid">
              Nobody from {client.name} can see the client portal yet.
            </p>
          ) : (
            <ul className="mb-4 divide-y divide-brand-taupe-mid/40 text-sm">
              {users.map((u) => (
                <li key={u.id} className="flex items-center justify-between gap-3 py-2">
                  <span className="text-brand-ink">
                    {u.name ? `${u.name} · ` : ""}
                    {u.email}
                  </span>
                  <form action={removeClientUserAction}>
                    <input type="hidden" name="id" value={u.id} />
                    <input type="hidden" name="clientId" value={client.id} />
                    <button type="submit" className={buttonGhostCls}>
                      Remove
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
          <form action={addClientUserAction} className="mt-2 flex flex-wrap items-end gap-3">
            <input type="hidden" name="clientId" value={client.id} />
            <Field label="Name" className="min-w-32 flex-1">
              <input name="name" className={inputCls} />
            </Field>
            <Field label="Email *" className="min-w-48 flex-1">
              <input name="email" type="email" required className={inputCls} />
            </Field>
            <button type="submit" className={buttonCls}>
              Grant access
            </button>
          </form>
          <p className="mt-3 text-xs leading-relaxed text-brand-ink-mid">
            Granting access sends a welcome email; they sign up at /sign-up with
            that address and land in the portal.
          </p>
        </Card>

        {/* Engagements */}
        <Card title="Engagements">
          {engagements.length === 0 ? (
            <p className="text-sm text-brand-ink-mid">No engagements yet.</p>
          ) : (
            <ul className="mb-4 divide-y divide-brand-taupe-mid/40 text-sm">
              {engagements.map((e) => (
                <li key={e.id} className="py-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-brand-ink">{e.title}</span>
                    <form
                      action={updateEngagementStatusAction}
                      className="flex items-center gap-2"
                    >
                      <input type="hidden" name="clientId" value={client.id} />
                      <input type="hidden" name="engagementId" value={e.id} />
                      <StatusBadge status={e.status} />
                      <select name="status" defaultValue={e.status} className={inputCls}>
                        {["proposed", "active", "on_hold", "complete", "cancelled"].map(
                          (s) => (
                            <option key={s} value={s}>
                              {s.replace("_", " ")}
                            </option>
                          ),
                        )}
                      </select>
                      <button type="submit" className={buttonGhostCls}>
                        Set
                      </button>
                    </form>
                  </div>
                  <p className="mt-1 text-xs text-brand-ink-mid">
                    {e.packageSlug ? `${e.packageSlug} package · ` : ""}
                    {e.priceCents != null ? `${fmtUsd(e.priceCents)} · ` : ""}
                    {fmtDate(e.startDate)} → {fmtDate(e.targetEndDate)}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <form action={createEngagementAction} className="mt-2 space-y-3">
            <input type="hidden" name="clientId" value={client.id} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Package">
                <select name="packageSlug" className={inputCls} defaultValue="">
                  <option value="">Custom (no package)</option>
                  {packages.map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.title} — from {p.startingAt}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Title (defaults to package)">
                <input name="title" className={inputCls} />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Price (USD)">
                <input name="price" placeholder="5000" className={inputCls} />
              </Field>
              <Field label="Start date">
                <input name="startDate" type="date" className={inputCls} />
              </Field>
              <Field label="Target end">
                <input name="targetEndDate" type="date" className={inputCls} />
              </Field>
            </div>
            <button type="submit" className={buttonCls}>
              Add engagement
            </button>
          </form>
        </Card>
      </div>

      {/* Invoices */}
      <Card title="Invoices">
        {!hasStripe() && (
          <p className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Stripe isn&rsquo;t configured (STRIPE_SECRET_KEY unset) — invoices
            created here are saved as local drafts without a payment link. See
            docs/portal-setup.md.
          </p>
        )}
        {invoices.length === 0 ? (
          <p className="text-sm text-brand-ink-mid">No invoices yet.</p>
        ) : (
          <div className="mb-6 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-brand-taupe-mid/60 text-xs uppercase tracking-wide text-brand-ink-mid">
                  <th className="py-2 pr-4">Description</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Due</th>
                  <th className="py-2 pr-4">Paid</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-brand-taupe-mid/40">
                    <td className="py-2.5 pr-4 text-brand-ink">{inv.description}</td>
                    <td className="py-2.5 pr-4 font-medium text-brand-ink">
                      {fmtUsd(inv.amountCents)}
                    </td>
                    <td className="py-2.5 pr-4">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="py-2.5 pr-4 text-brand-ink-mid">{fmtDate(inv.dueDate)}</td>
                    <td className="py-2.5 pr-4 text-brand-ink-mid">{fmtDate(inv.paidAt)}</td>
                    <td className="py-2.5 text-right">
                      {inv.hostedInvoiceUrl ? (
                        <a
                          className={buttonGhostCls}
                          href={inv.hostedInvoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Payment page ↗
                        </a>
                      ) : (
                        <span className="text-xs text-brand-ink-mid">no link</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <h3 className="mb-3 font-display text-lg text-brand-ink">New invoice</h3>
        <form action={createInvoiceAction} className="space-y-3">
          <input type="hidden" name="clientId" value={client.id} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Description *">
              <input
                name="description"
                required
                placeholder="Foundation engagement — 50% deposit"
                className={inputCls}
              />
            </Field>
            <Field label="Engagement">
              <select name="engagementId" className={inputCls} defaultValue="">
                <option value="">Not tied to an engagement</option>
                {engagements.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Amount (USD) *">
              <input name="amount" required placeholder="2500" className={inputCls} />
            </Field>
            <Field label="Days until due">
              <input name="daysUntilDue" type="number" defaultValue={14} min={1} className={inputCls} />
            </Field>
            <Field label="Billing email">
              <input
                name="billingEmail"
                type="email"
                placeholder={client.primaryContactEmail ?? "billing@client.com"}
                className={inputCls}
              />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-brand-ink-mid">
            <input type="checkbox" name="emailInvoice" defaultChecked className="accent-brand-orange" />
            Email the payment link to the billing contact
          </label>
          <button type="submit" className={buttonCls}>
            Create invoice{hasStripe() ? " in Stripe" : " (local draft)"}
          </button>
        </form>
      </Card>
    </div>
  );
}
