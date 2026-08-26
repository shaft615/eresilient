import Link from "next/link";
import { listAllTickets } from "@/lib/collab-db";
import { Card, StatusBadge, buttonGhostCls } from "../ui";

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function AdminTicketsPage() {
  const tickets = await listAllTickets();
  const open = tickets.filter((t) => t.status !== "closed").length;

  return (
    <Card title={`Support tickets (${open} open)`}>
      {tickets.length === 0 ? (
        <p className="text-sm text-brand-ink-mid">
          No tickets yet. Clients open them from the &ldquo;Get help&rdquo;
          card in their portal.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-brand-taupe-mid/60 text-xs uppercase tracking-wide text-brand-ink-mid">
                <th className="py-2 pr-4">Subject</th>
                <th className="py-2 pr-4">Client</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Updated</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id} className="border-b border-brand-taupe-mid/40">
                  <td className="py-2.5 pr-4">
                    <Link
                      className="font-medium text-brand-ink hover:text-brand-orange"
                      href={`/admin/tickets/${t.id}`}
                    >
                      {t.subject}
                    </Link>
                    <span className="block text-xs text-brand-ink-mid">
                      {t.createdName ?? t.createdBy} · {t.postCount}{" "}
                      {t.postCount === 1 ? "post" : "posts"}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-brand-ink-mid">
                    <Link className="hover:text-brand-orange" href={`/admin/clients/${t.clientId}`}>
                      {t.clientName}
                    </Link>
                  </td>
                  <td className="py-2.5 pr-4">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="py-2.5 pr-4 text-brand-ink-mid">{fmtDate(t.updatedAt)}</td>
                  <td className="py-2.5 text-right">
                    <Link className={buttonGhostCls} href={`/admin/tickets/${t.id}`}>
                      Work ticket
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
