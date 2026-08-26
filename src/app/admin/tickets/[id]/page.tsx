import Link from "next/link";
import { notFound } from "next/navigation";
import { ThreadPosts } from "@/components/thread-posts";
import { getTicket, listTicketPosts } from "@/lib/collab-db";
import { adminPostTicketAction, adminSetTicketStatusAction } from "../../actions";
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

export default async function AdminTicketPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { error } = await searchParams;

  const ticket = await getTicket(id);
  if (!ticket) notFound();
  const posts = await listTicketPosts(id);

  return (
    <div className="space-y-6">
      <p className="text-sm">
        <Link className="text-brand-ink-mid hover:text-brand-orange" href="/admin/tickets">
          ← All tickets
        </Link>
      </p>
      <ErrorNotice message={error} />
      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl text-brand-ink">{ticket.subject}</h1>
            <p className="mt-1 text-xs text-brand-ink-mid">
              <Link className="underline" href={`/admin/clients/${ticket.clientId}`}>
                {ticket.clientName}
              </Link>{" "}
              · opened by {ticket.createdName ?? ticket.createdBy}
            </p>
          </div>
          <form action={adminSetTicketStatusAction} className="flex items-center gap-2">
            <input type="hidden" name="ticketId" value={ticket.id} />
            <StatusBadge status={ticket.status} />
            <select name="status" defaultValue={ticket.status} className={inputCls}>
              {["open", "in_progress", "waiting_on_client", "closed"].map((s) => (
                <option key={s} value={s}>
                  {s.replaceAll("_", " ")}
                </option>
              ))}
            </select>
            <button type="submit" className={buttonGhostCls}>
              Set
            </button>
          </form>
        </div>
        <ThreadPosts posts={posts} />
        <form action={adminPostTicketAction} className="mt-6 space-y-3">
          <input type="hidden" name="ticketId" value={ticket.id} />
          <Field label="Reply (emailed to the ticket creator)">
            <textarea name="body" rows={3} required className={inputCls} />
          </Field>
          <button type="submit" className={buttonCls}>
            Post reply
          </button>
        </form>
      </Card>
    </div>
  );
}
