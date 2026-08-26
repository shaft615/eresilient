import Link from "next/link";
import {
  invoiceTotals,
  listClients,
  listKnownClientEmails,
  listRecentLeads,
  listRecentScorecards,
} from "@/lib/portal-db";
import { fmtUsd } from "@/lib/money";
import { makeScorecardViewUrl } from "@/lib/scorecard-token";
import { linkScorecardAction } from "../actions";
import { Card, StatusBadge, buttonGhostCls, inputCls } from "../ui";

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-brand-taupe-mid/60 bg-white/70 p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-ink-mid">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl text-brand-ink">{value}</p>
    </div>
  );
}

export default async function PipelinePage() {
  const [clients, leads, scorecards, totals, knownEmails] = await Promise.all([
    listClients(),
    listRecentLeads(200),
    listRecentScorecards(200),
    invoiceTotals(),
    listKnownClientEmails(),
  ]);

  const clientById = new Map(clients.map((c) => [c.id, c]));
  const prospects = clients.filter((c) => c.status === "prospect").length;
  const active = clients.filter((c) => c.status === "active").length;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <Stat label="Leads" value={String(leads.length)} />
        <Stat label="Scorecards" value={String(scorecards.length)} />
        <Stat label="Prospects" value={String(prospects)} />
        <Stat label="Active clients" value={String(active)} />
        <Stat
          label={`Outstanding (${totals.openCount})`}
          value={fmtUsd(totals.openCents)}
        />
        <Stat label={`Collected (${totals.paidCount})`} value={fmtUsd(totals.paidCents)} />
      </div>

      <Card title="Leads">
        {leads.length === 0 ? (
          <p className="text-sm text-brand-ink-mid">No leads captured yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-brand-taupe-mid/60 text-xs uppercase tracking-wide text-brand-ink-mid">
                  <th className="py-2 pr-4">Lead</th>
                  <th className="py-2 pr-4">Source</th>
                  <th className="py-2 pr-4">Captured</th>
                  <th className="py-2 pr-4">Stage</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => {
                  const converted = knownEmails.has(l.email.toLowerCase());
                  return (
                    <tr key={l.email} className="border-b border-brand-taupe-mid/40">
                      <td className="py-2.5 pr-4">
                        <span className="font-medium text-brand-ink">
                          {l.name} · {l.organization}
                        </span>
                        <span className="block text-xs text-brand-ink-mid">{l.email}</span>
                      </td>
                      <td className="py-2.5 pr-4 text-brand-ink-mid">{l.source ?? "—"}</td>
                      <td className="py-2.5 pr-4 text-brand-ink-mid">{fmtDate(l.createdAt)}</td>
                      <td className="py-2.5 pr-4">
                        <StatusBadge status={converted ? "active" : "prospect"} />
                        <span className="ml-1.5 text-xs text-brand-ink-mid">
                          {converted ? "converted" : "lead"}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        {!converted && (
                          <Link
                            className={buttonGhostCls}
                            href={{
                              pathname: "/admin/clients/new",
                              query: {
                                name: l.organization,
                                contactName: l.name,
                                contactEmail: l.email,
                              },
                            }}
                          >
                            Convert
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="Scorecard submissions">
        {scorecards.length === 0 ? (
          <p className="text-sm text-brand-ink-mid">No saved submissions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-brand-taupe-mid/60 text-xs uppercase tracking-wide text-brand-ink-mid">
                  <th className="py-2 pr-4">Organization</th>
                  <th className="py-2 pr-4">Score</th>
                  <th className="py-2 pr-4">Taken</th>
                  <th className="py-2 pr-4">Linked client</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {scorecards.map((s) => (
                  <tr key={s.id} className="border-b border-brand-taupe-mid/40">
                    <td className="py-2.5 pr-4">
                      <span className="font-medium text-brand-ink">{s.orgName}</span>
                      <span className="block text-xs text-brand-ink-mid">
                        {s.assessorName ?? "Unknown assessor"}
                        {s.leadEmail ? ` · ${s.leadEmail}` : ""}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-brand-ink">
                      {s.totalScore}/{s.totalMax}
                      {s.maturityBand ? (
                        <span className="block text-xs text-brand-ink-mid">
                          {s.maturityBand}
                        </span>
                      ) : null}
                    </td>
                    <td className="py-2.5 pr-4 text-brand-ink-mid">{fmtDate(s.createdAt)}</td>
                    <td className="py-2.5 pr-4">
                      {s.clientId ? (
                        <Link
                          className="text-sm underline hover:text-brand-orange"
                          href={`/admin/clients/${s.clientId}`}
                        >
                          {clientById.get(s.clientId)?.name ?? "View client"}
                        </Link>
                      ) : (
                        <form action={linkScorecardAction} className="flex items-center gap-1.5">
                          <input type="hidden" name="submissionId" value={s.id} />
                          <select name="clientId" className={inputCls} defaultValue="">
                            <option value="">Link to client…</option>
                            {clients.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                          <button type="submit" className={buttonGhostCls}>
                            Link
                          </button>
                        </form>
                      )}
                    </td>
                    <td className="py-2.5 text-right">
                      <a
                        className={buttonGhostCls}
                        href={makeScorecardViewUrl(s.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View ↗
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
