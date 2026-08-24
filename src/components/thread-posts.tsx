import { SITE } from "@/lib/site";

export type ThreadPost = {
  id: string;
  createdAt: string;
  authorEmail: string;
  authorName: string | null;
  authorRole: string; // 'firm' | 'client'
  body: string;
};

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Message list shared by discussion and ticket threads (portal + admin). */
export function ThreadPosts({ posts }: { posts: ThreadPost[] }) {
  if (posts.length === 0) {
    return <p className="text-sm text-brand-ink-mid">No messages yet.</p>;
  }
  return (
    <ul className="space-y-4">
      {posts.map((p) => {
        const isFirm = p.authorRole === "firm";
        return (
          <li
            key={p.id}
            className={`rounded-lg border p-4 ${
              isFirm
                ? "border-brand-orange/30 bg-brand-paper"
                : "border-brand-taupe-mid/60 bg-white/70"
            }`}
          >
            <p className="text-xs font-semibold text-brand-ink">
              {isFirm
                ? `${SITE.name} team${p.authorName ? ` (${p.authorName})` : ""}`
                : (p.authorName ?? p.authorEmail)}
              <span className="ml-2 font-normal text-brand-ink-mid">
                {fmtDateTime(p.createdAt)}
              </span>
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-brand-ink">
              {p.body}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
