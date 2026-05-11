import { NextResponse } from "next/server";
import { ContactFormInput } from "@/lib/contact-form";
import { sendContactFormEmails } from "@/lib/email";

export async function POST(req: Request) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = ContactFormInput.safeParse(payload);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return NextResponse.json(
      { error: firstIssue?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  // Honeypot tripped → silent success
  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  const result = await sendContactFormEmails(parsed.data);

  if (!result.ok) {
    return NextResponse.json(
      { error: "Could not send your message. Please try again or call us." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
