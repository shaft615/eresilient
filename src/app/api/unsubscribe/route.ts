import { NextResponse } from "next/server";
import { z } from "zod";
import { markUnsubscribed } from "@/lib/db";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe";

const Body = z.object({
  email: z.string().email(),
  token: z.string().min(1),
});

export const runtime = "nodejs";

export async function POST(req: Request) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = Body.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const { email, token } = parsed.data;
  if (!verifyUnsubscribeToken(email, token)) {
    return NextResponse.json(
      { error: "Invalid or expired unsubscribe link." },
      { status: 401 },
    );
  }

  await markUnsubscribed(email);
  return NextResponse.json({ ok: true });
}
