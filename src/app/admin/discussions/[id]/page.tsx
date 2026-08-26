import Link from "next/link";
import { notFound } from "next/navigation";
import { ThreadPosts } from "@/components/thread-posts";
import { getDiscussion, listDiscussionPosts } from "@/lib/collab-db";
import { getClient } from "@/lib/portal-db";
import { adminPostDiscussionAction } from "../../actions";
import { Card, ErrorNotice, Field, buttonCls, inputCls } from "../../ui";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminDiscussionPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { error } = await searchParams;

  const discussion = await getDiscussion(id);
  if (!discussion) notFound();
  const [posts, client] = await Promise.all([
    listDiscussionPosts(id),
    getClient(discussion.clientId),
  ]);

  return (
    <div className="space-y-6">
      <p className="text-sm">
        <Link
          className="text-brand-ink-mid hover:text-brand-orange"
          href={`/admin/clients/${discussion.clientId}`}
        >
          ← {client?.name ?? "Client"}
        </Link>
      </p>
      <ErrorNotice message={error} />
      <Card title={discussion.title}>
        <ThreadPosts posts={posts} />
        <form action={adminPostDiscussionAction} className="mt-6 space-y-3">
          <input type="hidden" name="discussionId" value={discussion.id} />
          <Field label="Reply as the firm">
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
