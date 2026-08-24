import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getClient,
  listClientUsers,
  listDocuments,
  listEngagements,
  listInvoices,
  listMilestonesForEngagements,
  type Milestone,
} from "@/lib/portal-db";
import { hasStripe } from "@/lib/stripe";
import { hasBlob } from "@/lib/blob";
import { fmtUsd } from "@/lib/money";
import { packages } from "@/content/packages";
import { PORTAL_TOOLS } from "@/lib/portal-tools";
import {
  addClientUserAction,
  addMilestoneAction,
  createEngagementAction,
  createInvoiceAction,
  deleteDocumentAction,
  deleteMilestoneAction,
  removeClientUserAction,
  setRiscWorkspaceAction,
  setToolAccessAction,
  updateClientStatusAction,
  updateEngagementStatusAction,
  updateMilestoneStatusAction,
  uploadDocumentAction,
} from "../../actions";
import {
  Card,
  ErrorNotice,
  Field,
  StatusBadge,
  buttonCls,
  buttonGhostCls,
  inputCls,
  labelCls,
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

  const [users, engagements, invoices, documents] = await Promise.all([
    listClientUsers(id),
    listEngagements(id),
    listInvoices(id),
    listDocuments(id),
  ]);
  const milestones = await listMilestonesForEngagements(engagements.map((e) => e.id));
  const milestonesByEngagement = new Map<string, Milestone[]>();
  for (const m of milestones) {
    const list = milestonesByEngagement.get(m.engagementId) ?? [];
    list.push(m);
    milestonesByEngagement.set(m.engagementId, list);
  }

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

                  {/* Milestones */}
                  <ul className="mt-2 space-y-1 border-l-2 border-brand-taupe-mid/50 pl-3">
                    {(milestonesByEngagement.get(e.id) ?? []).map((m) => (
                      <li
                        key={m.id}
                        className="flex flex-wrap items-center justify-between gap-2 text-xs"
                      >
                        <span className="text-brand-ink">
                          {m.title}
                          {m.dueDate ? ` · due ${fmtDate(m.dueDate)}` : ""}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <StatusBadge status={m.status} />
                          <form action={updateMilestoneStatusAction} className="inline-flex gap-1.5">
                            <input type="hidden" name="clientId" value={client.id} />
                            <input type="hidden" name="id" value={m.id} />
                            <select
                              name="status"
                              defaultValue={m.status}
                              className="rounded border border-brand-ink/20 bg-white px-1 py-0.5 text-xs"
                            >
                              <option value="pending">pending</option>
                              <option value="in_progress">in progress</option>
                              <option value="complete">complete</option>
                            </select>
                            <button type="submit" className={buttonGhostCls}>
                              Set
                            </button>
                          </form>
                          <form action={deleteMilestoneAction} className="inline">
                            <input type="hidden" name="clientId" value={client.id} />
                            <input type="hidden" name="id" value={m.id} />
                            <button
                              type="submit"
                              className={buttonGhostCls}
                              aria-label={`Delete milestone ${m.title}`}
                            >
                              ✕
                            </button>
                          </form>
                        </span>
                      </li>
                    ))}
                    <li>
                      <form
                        action={addMilestoneAction}
                        className="mt-1 flex flex-wrap items-center gap-1.5"
                      >
                        <input type="hidden" name="clientId" value={client.id} />
                        <input type="hidden" name="engagementId" value={e.id} />
                        <input
                          name="title"
                          placeholder="Add milestone…"
                          required
                          className="w-40 rounded border border-brand-ink/20 bg-white px-2 py-1 text-xs"
                        />
                        <input
                          name="dueDate"
                          type="date"
                          className="rounded border border-brand-ink/20 bg-white px-2 py-1 text-xs"
                        />
                        <button type="submit" className={buttonGhostCls}>
                          Add
                        </button>
                      </form>
                    </li>
                  </ul>
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

      {/* Documents */}
      <Card title="Documents & deliverables">
        {!hasBlob() && (
          <p className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Blob storage isn&rsquo;t configured (BLOB_READ_WRITE_TOKEN unset) —
            uploads are disabled. See docs/portal-setup.md.
          </p>
        )}
        {documents.length === 0 ? (
          <p className="text-sm text-brand-ink-mid">No documents shared yet.</p>
        ) : (
          <div className="mb-6 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-brand-taupe-mid/60 text-xs uppercase tracking-wide text-brand-ink-mid">
                  <th className="py-2 pr-4">Title</th>
                  <th className="py-2 pr-4">File</th>
                  <th className="py-2 pr-4">Uploaded</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {documents.map((d) => (
                  <tr key={d.id} className="border-b border-brand-taupe-mid/40">
                    <td className="py-2.5 pr-4 font-medium text-brand-ink">{d.title}</td>
                    <td className="py-2.5 pr-4 text-brand-ink-mid">
                      {d.filename}
                      {d.sizeBytes != null
                        ? ` · ${(d.sizeBytes / 1024 / 1024).toFixed(1)} MB`
                        : ""}
                    </td>
                    <td className="py-2.5 pr-4 text-brand-ink-mid">
                      {fmtDate(d.createdAt)}
                      {d.uploadedBy ? ` · ${d.uploadedBy}` : ""}
                    </td>
                    <td className="py-2.5 text-right">
                      <span className="inline-flex gap-2">
                        <a className={buttonGhostCls} href={`/api/documents/${d.id}`}>
                          Download
                        </a>
                        <form action={deleteDocumentAction} className="inline">
                          <input type="hidden" name="clientId" value={client.id} />
                          <input type="hidden" name="id" value={d.id} />
                          <button type="submit" className={buttonGhostCls}>
                            Delete
                          </button>
                        </form>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <form action={uploadDocumentAction} className="space-y-3">
          <input type="hidden" name="clientId" value={client.id} />
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="File * (max 20 MB)">
              <input name="file" type="file" required className={inputCls} />
            </Field>
            <Field label="Title (defaults to filename)">
              <input name="title" className={inputCls} />
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
          <button type="submit" className={buttonCls} disabled={!hasBlob()}>
            Upload document
          </button>
          <p className="text-xs leading-relaxed text-brand-ink-mid">
            Files are stored privately; the client downloads them through their
            portal after signing in.
          </p>
        </form>
      </Card>

      {/* Access & integrations */}
      <Card title="Access & integrations">
        <div className="grid gap-8 lg:grid-cols-2">
          <form action={setToolAccessAction} className="space-y-3">
            <input type="hidden" name="clientId" value={client.id} />
            <p className={labelCls}>RISC tool entitlements (shown in their portal)</p>
            {PORTAL_TOOLS.map((t) => (
              <label key={t.slug} className="flex items-center gap-2 text-sm text-brand-ink">
                <input
                  type="checkbox"
                  name="tools"
                  value={t.slug}
                  defaultChecked={client.toolAccess.includes(t.slug)}
                  className="accent-brand-orange"
                />
                {t.name}
                <span className="text-xs text-brand-ink-mid">— {t.description}</span>
              </label>
            ))}
            <button type="submit" className={buttonCls}>
              Save entitlements
            </button>
          </form>

          <form action={setRiscWorkspaceAction} className="space-y-3">
            <input type="hidden" name="clientId" value={client.id} />
            <Field label="riscManager workspace URL">
              <input
                name="workspace"
                placeholder="https://riscmanager.com/…"
                defaultValue={client.riscmanagerWorkspace ?? ""}
                className={inputCls}
              />
            </Field>
            <button type="submit" className={buttonCls}>
              Save workspace link
            </button>
            <p className="text-xs leading-relaxed text-brand-ink-mid">
              When set, the client&rsquo;s portal shows an &ldquo;Open
              riscManager&rdquo; button pointing here. Clear the field to
              remove it.
            </p>
          </form>
        </div>
      </Card>
    </div>
  );
}
