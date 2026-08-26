import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/container";
import { ThreadPosts } from "@/components/thread-posts";
import { getPortalContext } from "@/lib/portal-access";
import { getTicket, listTicketPosts } from "@/lib/collab-db";
import {
  Card,
  ErrorNotice,
  Field,
  StatusBadge,
  buttonCls,
  buttonGhostCls,
  inputCls,
} from "../../../admin/ui";
import { closeOwnTicketAction, postTicketAction } from "../../actions";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; as?: string }>;
};

export default async function PortalTicketPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { error, as } = await searchParams;

  const ctx = await getPortalContext(as);
  if (!ctx) {
    return (
      <section className="section-warm py-24">
        <Container width="narrow">
          <p className="text-brand-ink-mid">
            <Link className="underline" href="/sign-in">
              Sign in
            </Link>{" "}
            to view this ticket.
          </p>
        </Container>
      </section>
    );
  }

  const ticket = await getTicket(id);
  if (!ticket) notFound();

  const isMember = ctx.client?.id === ticket.clientId;
  if (!isMember && !ctx.identity.isAdmin) notFound();
  const canPost = isMember && !ctx.isAdminPreview;

  const posts = await listTicketPosts(id);

  return (
    <div className="section-warm min-h-full py-10 sm:py-14">
      <Container width="default">
        <p className="mb-4 text-sm">
          <Link className="text-brand-ink-mid hover:text-brand-orange" href="/portal">
            ← Back to portal
          </Link>
        </p>
        <ErrorNotice message={error} />
        <Card>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h1 className="font-display text-xl text-brand-ink">{ticket.subject}</h1>
            <StatusBadge status={ticket.status} />
          </div>
          <ThreadPosts posts={posts} />
          {canPost && (
            <>
              <form action={postTicketAction} className="mt-6 space-y-3">
                <input type="hidden" name="ticketId" value={ticket.id} />
                <Field label="Reply">
                  <textarea name="body" rows={3} required className={inputCls} />
                </Field>
                <div className="flex flex-wrap items-center gap-3">
                  <button type="submit" className={buttonCls}>
                    Post reply
                  </button>
                </div>
              </form>
              {ticket.status !== "closed" && (
                <form action={closeOwnTicketAction} className="mt-3">
                  <input type="hidden" name="ticketId" value={ticket.id} />
                  <button type="submit" className={buttonGhostCls}>
                    Mark as resolved / close ticket
                  </button>
                </form>
              )}
            </>
          )}
          {!canPost && ctx.identity.isAdmin && (
            <p className="mt-6 text-xs text-brand-ink-mid">
              Viewing as admin — work this ticket from the{" "}
              <Link className="underline" href={`/admin/tickets/${ticket.id}`}>
                admin ticket view
              </Link>
              .
            </p>
          )}
        </Card>
      </Container>
    </div>
  );
}
