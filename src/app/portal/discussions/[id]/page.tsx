import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/container";
import { ThreadPosts } from "@/components/thread-posts";
import { getPortalContext } from "@/lib/portal-access";
import { getDiscussion, listDiscussionPosts } from "@/lib/collab-db";
import { Card, ErrorNotice, Field, buttonCls, inputCls } from "../../../admin/ui";
import { postDiscussionAction } from "../../actions";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; as?: string }>;
};

export default async function PortalDiscussionPage({ params, searchParams }: Props) {
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
            to view this discussion.
          </p>
        </Container>
      </section>
    );
  }

  const discussion = await getDiscussion(id);
  if (!discussion) notFound();

  const isMember = ctx.client?.id === discussion.clientId;
  if (!isMember && !ctx.identity.isAdmin) notFound();
  const canPost = isMember && !ctx.isAdminPreview;

  const posts = await listDiscussionPosts(id);

  return (
    <div className="section-warm min-h-full py-10 sm:py-14">
      <Container width="default">
        <p className="mb-4 text-sm">
          <Link className="text-brand-ink-mid hover:text-brand-orange" href="/portal">
            ← Back to portal
          </Link>
        </p>
        <ErrorNotice message={error} />
        <Card title={discussion.title}>
          <ThreadPosts posts={posts} />
          {canPost ? (
            <form action={postDiscussionAction} className="mt-6 space-y-3">
              <input type="hidden" name="discussionId" value={discussion.id} />
              <Field label="Reply">
                <textarea name="body" rows={3} required className={inputCls} />
              </Field>
              <button type="submit" className={buttonCls}>
                Post reply
              </button>
            </form>
          ) : (
            <p className="mt-6 text-xs text-brand-ink-mid">
              {ctx.identity.isAdmin ? (
                <>
                  Viewing as admin — reply from the{" "}
                  <Link className="underline" href={`/admin/discussions/${discussion.id}`}>
                    admin thread view
                  </Link>
                  .
                </>
              ) : (
                "Replies are disabled."
              )}
            </p>
          )}
        </Card>
      </Container>
    </div>
  );
}
