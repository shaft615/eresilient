import Link from "next/link";
import {
  listClients,
  listRecentLeads,
  listRecentScorecards,
} from "@/lib/portal-db";
import { Card, StatusBadge, buttonGhostCls } from "./ui";

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function AdminDashboardPage() {
  const [clients, leads, scorecards] = await Promise.all([
    listClients(),
    listRecentLeads(15),
    listRecentScorecards(15),
  ]);

  return (
    <div className="space-y-8">
      <Card title={`Clients (${clients.length})`}>
        {clients.length === 0 ? (
          <p className="text-sm text-brand-ink-mid">
            No clients yet.{" "}
            <Link className="underline" href="/admin/clients/new">
              Create the first one
            </Link>{" "}
            — or convert a lead below.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-brand-taupe-mid/60 text-xs uppercase tracking-wide text-brand-ink-mid">
                  <th className="py-2 pr-4">Company</th>
                  <th className="py-2 pr-4">Primary contact</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Since</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.id} className="border-b border-brand-taupe-mid/40">
                    <td className="py-2.5 pr-4 font-medium text-brand-ink">
                      <Link className="hover:text-brand-orange" href={`/admin/clients/${c.id}`}>
                        {c.name}
                      </Link>
                    </td>
                    <td className="py-2.5 pr-4 text-brand-ink-mid">
                      {c.primaryContactName ?? "—"}
                      {c.primaryContactEmail ? ` · ${c.primaryContactEmail}` : ""}
                    </td>
                    <td className="py-2.5 pr-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-2.5 pr-4 text-brand-ink-mid">
                      {fmtDate(c.createdAt)}
                    </td>
                    <td className="py-2.5 text-right">
                      <Link className={buttonGhostCls} href={`/admin/clients/${c.id}`}>
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card title="Recent leads">
          {leads.length === 0 ? (
            <p className="text-sm text-brand-ink-mid">
              No lead-capture submissions yet (or the database isn&rsquo;t
              provisioned in this environment).
            </p>
          ) : (
            <ul className="divide-y divide-brand-taupe-mid/40 text-sm">
              {leads.map((l) => (
                <li key={l.email} className="flex items-center justify-between gap-3 py-2.5">
                  <div>
                    <p className="font-medium text-brand-ink">
                      {l.name} · {l.organization}
                    </p>
                    <p className="text-xs text-brand-ink-mid">
                      {l.email}
                      {l.role ? ` · ${l.role}` : ""} · {fmtDate(l.createdAt)}
                      {l.source ? ` · via ${l.source}` : ""}
                    </p>
                  </div>
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
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Recent scorecard submissions">
          {scorecards.length === 0 ? (
            <p className="text-sm text-brand-ink-mid">
              No saved scorecard submissions yet.
            </p>
          ) : (
            <ul className="divide-y divide-brand-taupe-mid/40 text-sm">
              {scorecards.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div>
                    <p className="font-medium text-brand-ink">
                      {s.orgName} — {s.totalScore}/{s.totalMax}
                      {s.maturityBand ? ` (${s.maturityBand})` : ""}
                    </p>
                    <p className="text-xs text-brand-ink-mid">
                      {s.assessorName ?? "Unknown assessor"}
                      {s.leadEmail ? ` · ${s.leadEmail}` : ""} · {fmtDate(s.createdAt)}
                    </p>
                  </div>
                  <Link
                    className={buttonGhostCls}
                    href={{
                      pathname: "/admin/clients/new",
                      query: {
                        name: s.orgName,
                        contactName: s.assessorName ?? "",
                        contactEmail: s.leadEmail ?? "",
                      },
                    }}
                  >
                    Convert
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
