import { NextResponse } from "next/server";
import { LeadCaptureInput } from "@/lib/lead-capture";
import { upsertSubscriber } from "@/lib/db";
import { sendScorecardWelcome } from "@/lib/email";
import { SITE } from "@/lib/site";

export async function POST(req: Request) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = LeadCaptureInput.safeParse(payload);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return NextResponse.json(
      { error: firstIssue?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  // Honeypot tripped → silent success (don't tip off the bot)
  if (parsed.data.website) {
    return NextResponse.json({ ok: true, redirectTo: "/scorecard" });
  }

  const { email, name, organization, role, source } = parsed.data;

  const dbResult = await upsertSubscriber({
    email,
    name,
    organization,
    role: role ?? null,
    source,
    metadata: { ip: req.headers.get("x-forwarded-for") ?? null },
  });

  if (!dbResult.ok) {
    return NextResponse.json(
      { error: "Could not record submission. Please try again." },
      { status: 500 },
    );
  }

  // Fire and don't block on email send — user gets to scorecard immediately
  void sendScorecardWelcome({
    to: email,
    name,
    scorecardUrl: `${SITE.url}/scorecard`,
  });

  return NextResponse.json({ ok: true, redirectTo: "/scorecard?welcome=1" });
}
