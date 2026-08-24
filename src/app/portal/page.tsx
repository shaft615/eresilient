import type { Metadata } from "next";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Container } from "@/components/container";
import { PortalSetupNotice } from "@/components/portal-setup-notice";
import { getPortalIdentity, hasClerk } from "@/lib/portal-auth";
import {
  findClientForEmails,
  listClientScorecards,
  listDocuments,
  listEngagements,
  listInvoices,
  listMilestonesForEngagements,
  type Milestone,
} from "@/lib/portal-db";
import { fmtUsd } from "@/lib/money";
import { makeScorecardViewUrl } from "@/lib/scorecard-token";
import { PORTAL_TOOLS } from "@/lib/portal-tools";
import { SITE } from "@/lib/site";
import { Card, StatusBadge, buttonCls, buttonGhostCls } from "../admin/ui";

export const metadata: Metadata = {
  title: "Client portal",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function PortalPage() {
  if (!hasClerk()) return <PortalSetupNotice area="Client portal" />;

  const identity = await getPortalIdentity();
  if (!identity) {
    // The proxy normally redirects; defense in depth.
    return (
      <section className="section-warm py-24">
        <Container width="narrow">
          <h1 className="font-display text-3xl text-brand-ink">Sign in required</h1>
          <p className="mt-4 text-brand-ink-mid">
            <Link className="underline" href="/sign-in">
              Sign in
            </Link>{" "}
            to access your client portal.
          </p>
        </Container>
      </section>
    );
  }

  const client = await findClientForEmails(identity.emails);

  if (!client) {
    return (
      <section className="section-warm py-24">
        <Container width="narrow">
          <div className="flex items-start justify-between gap-4">
            <h1 className="font-display text-3xl text-brand-ink">
              No workspace on this account yet
            </h1>
            <UserButton />
          </div>
          <p className="mt-5 leading-relaxed text-brand-ink-mid">
            You&rsquo;re signed in, but this email address isn&rsquo;t linked to
            a client workspace. If your organization works with {SITE.name},
            ask your engagement lead to grant this address portal access — or
            reach us at{" "}
            <a className="underline" href={SITE.contact.emailHref}>
              {SITE.contact.email}
            </a>{" "}
            / {SITE.contact.phone}.
          </p>
          <p className="mt-5 text-sm text-brand-ink-mid">
            Not a client yet? Start with the free{" "}
            <Link className="underline" href="/scorecard">
              BCP Readiness Scorecard
            </Link>{" "}
            or{" "}
            <Link className="underline" href="/packages">
              explore engagement packages
            </Link>
            .
          </p>
        </Container>
      </section>
    );
  }

  const [engagements, invoices, documents, scorecards] = await Promise.all([
    listEngagements(client.id),
    listInvoices(client.id),
    listDocuments(client.id),
    listClientScorecards(client.id),
  ]);
  const openInvoices = invoices.filter((i) => i.status === "open");
  const milestones = await listMilestonesForEngagements(engagements.map((e) => e.id));
  const milestonesByEngagement = new Map<string, Milestone[]>();
  for (const m of milestones) {
    const list = milestonesByEngagement.get(m.engagementId) ?? [];
    list.push(m);
    milestonesByEngagement.set(m.engagementId, list);
  }
  const entitledTools = PORTAL_TOOLS.filter((t) =>
    client.toolAccess.includes(t.slug),
  );

  return (
    <div className="section-warm min-h-full py-10 sm:py-14">
      <Container width="wide">
        <div className="mb-8 flex items-center justify-between gap-4 border-b border-brand-taupe-mid/60 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">
              Client portal
            </p>
            <h1 className="mt-1 font-display text-3xl text-brand-ink">{client.name}</h1>
          </div>
          <UserButton />
        </div>

        {openInvoices.length > 0 && (
          <div className="mb-8 rounded-md border border-amber-300 bg-amber-50 px-5 py-4">
            <p className="text-sm font-semibold text-amber-900">
              {openInvoices.length === 1
                ? "You have an open invoice."
                : `You have ${openInvoices.length} open invoices.`}
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              {openInvoices.map((inv) =>
                inv.hostedInvoiceUrl ? (
                  <a
                    key={inv.id}
                    href={inv.hostedInvoiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonCls}
                  >
                    Pay {fmtUsd(inv.amountCents)} — {inv.description}
                  </a>
                ) : null,
              )}
            </div>
          </div>
        )}

        <div className="space-y-8">
          <Card title="Engagements">
            {engagements.length === 0 ? (
              <p className="text-sm text-brand-ink-mid">
                No engagements yet. When work kicks off, status and milestones
                appear here.
              </p>
            ) : (
              <ul className="divide-y divide-brand-taupe-mid/40">
                {engagements.map((e) => {
                  const ms = milestonesByEngagement.get(e.id) ?? [];
                  const done = ms.filter((m) => m.status === "complete").length;
                  return (
                    <li key={e.id} className="py-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium text-brand-ink">{e.title}</span>
                        <StatusBadge status={e.status} />
                      </div>
                      <p className="mt-1 text-xs text-brand-ink-mid">
                        {fmtDate(e.startDate)} → {fmtDate(e.targetEndDate)}
                        {ms.length > 0 ? ` · ${done}/${ms.length} milestones complete` : ""}
                      </p>
                      {ms.length > 0 && (
                        <ul className="mt-2 space-y-1 border-l-2 border-brand-taupe-mid/50 pl-3">
                          {ms.map((m) => (
                            <li
                              key={m.id}
                              className="flex flex-wrap items-center justify-between gap-2 text-xs"
                            >
                              <span className="text-brand-ink">
                                {m.title}
                                {m.dueDate ? ` · due ${fmtDate(m.dueDate)}` : ""}
                              </span>
                              <StatusBadge status={m.status} />
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card title="Invoices">
            {invoices.length === 0 ? (
              <p className="text-sm text-brand-ink-mid">No invoices yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-brand-taupe-mid/60 text-xs uppercase tracking-wide text-brand-ink-mid">
                      <th className="py-2 pr-4">Description</th>
                      <th className="py-2 pr-4">Amount</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4">Due</th>
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
                        <td className="py-2.5 pr-4 text-brand-ink-mid">
                          {fmtDate(inv.dueDate)}
                        </td>
                        <td className="py-2.5 text-right">
                          {inv.hostedInvoiceUrl && inv.status === "open" ? (
                            <a
                              className={buttonCls}
                              href={inv.hostedInvoiceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View &amp; pay
                            </a>
                          ) : inv.hostedInvoiceUrl ? (
                            <a
                              className="text-xs underline"
                              href={inv.hostedInvoiceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Receipt
                            </a>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="mt-4 text-xs leading-relaxed text-brand-ink-mid">
              Payments are processed securely by Stripe and accept bank
              transfer (ACH) or card. Questions about an invoice? Email{" "}
              <a className="underline" href={SITE.contact.emailHref}>
                {SITE.contact.email}
              </a>
              .
            </p>
          </Card>

          <Card title="Documents & deliverables">
            {documents.length === 0 ? (
              <p className="text-sm text-brand-ink-mid">
                No documents shared yet. Deliverables from your engagements
                appear here.
              </p>
            ) : (
              <ul className="divide-y divide-brand-taupe-mid/40 text-sm">
                {documents.map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div>
                      <p className="font-medium text-brand-ink">{d.title}</p>
                      <p className="text-xs text-brand-ink-mid">
                        {d.filename}
                        {d.sizeBytes != null
                          ? ` · ${(d.sizeBytes / 1024 / 1024).toFixed(1)} MB`
                          : ""}{" "}
                        · {fmtDate(d.createdAt)}
                      </p>
                    </div>
                    <a className={buttonGhostCls} href={`/api/documents/${d.id}`}>
                      Download
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Assessment history">
            {scorecards.length === 0 ? (
              <p className="text-sm text-brand-ink-mid">
                No BCP Readiness Scorecard results linked yet.{" "}
                <Link className="underline" href="/scorecard">
                  Take the scorecard
                </Link>{" "}
                and opt in to share results, and they&rsquo;ll show up here.
              </p>
            ) : (
              <ul className="divide-y divide-brand-taupe-mid/40 text-sm">
                {scorecards.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div>
                      <p className="font-medium text-brand-ink">
                        {s.totalScore}/{s.totalMax}
                        {s.maturityBand ? ` — ${s.maturityBand}` : ""}
                      </p>
                      <p className="text-xs text-brand-ink-mid">
                        {s.assessorName ?? "Unknown assessor"} · {fmtDate(s.createdAt)}
                      </p>
                    </div>
                    <a
                      className={buttonGhostCls}
                      href={makeScorecardViewUrl(s.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View results ↗
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {(entitledTools.length > 0 || client.riscmanagerWorkspace) && (
            <Card title="Your workspaces">
              <ul className="divide-y divide-brand-taupe-mid/40 text-sm">
                {client.riscmanagerWorkspace && (
                  <li className="flex items-center justify-between gap-3 py-2.5">
                    <div>
                      <p className="font-medium text-brand-ink">riscManager.com™</p>
                      <p className="text-xs text-brand-ink-mid">
                        Your Risk Intelligent Supply Chain workspace.
                      </p>
                    </div>
                    <a
                      className={buttonCls}
                      href={client.riscmanagerWorkspace}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open riscManager ↗
                    </a>
                  </li>
                )}
                {entitledTools.map((t) => (
                  <li key={t.slug} className="flex items-center justify-between gap-3 py-2.5">
                    <div>
                      <p className="font-medium text-brand-ink">{t.name}</p>
                      <p className="text-xs text-brand-ink-mid">{t.description}</p>
                    </div>
                    <Link className={buttonGhostCls} href={t.href}>
                      Open
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card title="Your team at e|Resilient">
            <p className="text-sm leading-relaxed text-brand-ink-mid">
              Reach your engagement lead any time at{" "}
              <a className="underline" href={SITE.contact.emailHref}>
                {SITE.contact.email}
              </a>{" "}
              or {SITE.contact.phone}. Between engagements, the{" "}
              <Link className="underline" href="/tools">
                RISC family tools
              </Link>{" "}
              and the{" "}
              <Link className="underline" href="/scorecard">
                BCP Readiness Scorecard
              </Link>{" "}
              are available to keep your program moving.
            </p>
          </Card>
        </div>
      </Container>
    </div>
  );
}
