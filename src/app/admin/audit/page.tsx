import Link from "next/link";
import { listAudit } from "@/lib/audit";
import { listClients } from "@/lib/portal-db";
import { Card, buttonGhostCls } from "../ui";

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

type Props = {
  searchParams: Promise<{ client?: string }>;
};

export default async function AuditPage({ searchParams }: Props) {
  const { client: clientFilter } = await searchParams;
  const [entries, clients] = await Promise.all([
    listAudit({ clientId: clientFilter || undefined, limit: 200 }),
    listClients(),
  ]);
  const filterName = clientFilter
    ? (clients.find((c) => c.id === clientFilter)?.name ?? "selected client")
    : null;

  return (
    <Card
      title={
        filterName ? `Audit log — ${filterName}` : "Audit log (latest 200 actions)"
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
        <Link
          className={`${buttonGhostCls} ${!clientFilter ? "border-brand-orange text-brand-orange" : ""}`}
          href="/admin/audit"
        >
          All
        </Link>
        {clients.map((c) => (
          <Link
            key={c.id}
            className={`${buttonGhostCls} ${clientFilter === c.id ? "border-brand-orange text-brand-orange" : ""}`}
            href={`/admin/audit?client=${c.id}`}
          >
            {c.name}
          </Link>
        ))}
      </div>
      {entries.length === 0 ? (
        <p className="text-sm text-brand-ink-mid">
          No audit entries yet (or the database isn&rsquo;t provisioned in this
          environment). Every admin and client action lands here once
          migration 006 is applied.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-brand-taupe-mid/60 text-xs uppercase tracking-wide text-brand-ink-mid">
                <th className="py-2 pr-4">When</th>
                <th className="py-2 pr-4">Actor</th>
                <th className="py-2 pr-4">Action</th>
                <th className="py-2 pr-4">Client</th>
                <th className="py-2">Detail</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-b border-brand-taupe-mid/40 align-top">
                  <td className="whitespace-nowrap py-2 pr-4 text-brand-ink-mid">
                    {fmtDateTime(e.createdAt)}
                  </td>
                  <td className="py-2 pr-4">
                    <span className="text-brand-ink">{e.actorEmail ?? "system"}</span>
                    <span className="block text-xs text-brand-ink-mid">{e.actorRole}</span>
                  </td>
                  <td className="py-2 pr-4 font-mono text-xs text-brand-ink">{e.action}</td>
                  <td className="py-2 pr-4 text-brand-ink-mid">
                    {e.clientId ? (
                      <Link className="underline" href={`/admin/clients/${e.clientId}`}>
                        {e.clientName ?? "client"}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-2 font-mono text-xs text-brand-ink-mid">
                    {JSON.stringify(e.detail)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-4 text-xs leading-relaxed text-brand-ink-mid">
        Sign-in and sign-out events live in the Clerk dashboard&rsquo;s own
        logs; everything the application does is recorded here.
      </p>
    </Card>
  );
}
