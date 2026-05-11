import { NextResponse } from "next/server";
import { LeadCaptureInput } from "@/lib/lead-capture";
import { upsertSubscriber } from "@/lib/db";
import {
  sendRiscManagerWaitlistWelcome,
  sendScorecardWelcome,
} from "@/lib/email";
import { SITE } from "@/lib/site";

const RISC_MANAGER_SOURCE = "risc-manager-waitlist";

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

  // Pick the right welcome email based on which form the visitor came from.
  // Both fire-and-forget; failures are logged inside the email helpers.
  if (source === RISC_MANAGER_SOURCE) {
    void sendRiscManagerWaitlistWelcome({ to: email, name });
    // Waitlist form renders an inline success state and doesn't redirect.
    return NextResponse.json({ ok: true });
  }

  void sendScorecardWelcome({
    to: email,
    name,
    scorecardUrl: `${SITE.url}/scorecard`,
  });
  return NextResponse.json({ ok: true, redirectTo: "/scorecard?welcome=1" });
}
