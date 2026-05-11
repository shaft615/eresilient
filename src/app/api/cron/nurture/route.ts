import { NextResponse } from "next/server";
import {
  getDueForNurture,
  markNurtureSent,
  type DueSubscriber,
} from "@/lib/db";
import {
  sendNurtureConsultation,
  sendNurtureInsight,
} from "@/lib/email";

// Vercel Cron pings this endpoint daily. It can also be invoked manually
// for testing — both flows require CRON_SECRET to match.
//
// Auth: Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` automatically
// when CRON_SECRET is set as a project env var. For manual triggers,
// pass `?secret=<CRON_SECRET>` in the URL instead.
//
// Behavior: queries Postgres for subscribers whose age has crossed the
// 3-day or 7-day mark and whose corresponding nurture email hasn't been
// sent yet. Sends the appropriate email; stamps the send timestamp on
// success. Failures don't roll back — the next cron run will retry the
// same subscribers.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    // Dev/preview without CRON_SECRET — allow so we can hand-trigger
    // locally. Production MUST set this env var.
    console.warn("[cron] CRON_SECRET not set; allowing request");
    return true;
  }
  const authHeader = req.headers.get("authorization");
  if (authHeader === `Bearer ${secret}`) return true;
  const url = new URL(req.url);
  if (url.searchParams.get("secret") === secret) return true;
  return false;
}

type SendResult = {
  to: string;
  ok: boolean;
  error?: string;
};

async function processBatch(
  emailNumber: 2 | 3,
  send: (s: DueSubscriber) => Promise<{ ok: boolean; error?: string }>,
): Promise<SendResult[]> {
  const due = await getDueForNurture(emailNumber);
  if (due.length === 0) return [];
  const results: SendResult[] = [];
  for (const s of due) {
    const res = await send(s);
    results.push({ to: s.email, ok: res.ok, error: res.error });
    if (res.ok) await markNurtureSent(s.email, emailNumber);
  }
  return results;
}

async function handle(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const startedAt = new Date().toISOString();
  const insights = await processBatch(2, (s) =>
    sendNurtureInsight({ to: s.email, name: s.name }),
  );
  const consultations = await processBatch(3, (s) =>
    sendNurtureConsultation({ to: s.email, name: s.name }),
  );

  const summary = {
    startedAt,
    finishedAt: new Date().toISOString(),
    insightsSent: insights.filter((r) => r.ok).length,
    insightsFailed: insights.filter((r) => !r.ok).length,
    consultationsSent: consultations.filter((r) => r.ok).length,
    consultationsFailed: consultations.filter((r) => !r.ok).length,
  };
  console.log("[cron/nurture] complete", summary);
  return NextResponse.json({ ok: true, ...summary });
}

// Vercel Cron uses GET by default; accept POST too for manual triggers.
export async function GET(req: Request) {
  return handle(req);
}

export async function POST(req: Request) {
  return handle(req);
}
