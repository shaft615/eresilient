"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

const ALLOWED = (process.env.BIA_ALLOWED_EMAILS ?? "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

function isAllowed(email: string): boolean {
  if (ALLOWED.length === 0) return true; // dev / unset → permissive
  return ALLOWED.includes(email.toLowerCase());
}

export async function sendMagicLink(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email || !email.includes("@")) {
    redirect("/tools/bia/login?error=invalid");
  }

  if (!isAllowed(email)) {
    // Don't reveal whether the email is on the list — same UX either way.
    redirect("/tools/bia/login?sent=1");
  }

  const supabase = await createClient();
  const headerStore = await headers();
  const host = headerStore.get("host") ?? "localhost:3000";
  const proto = headerStore.get("x-forwarded-proto") ?? "https";
  const origin = `${proto}://${host}`;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });

  if (error) {
    // Surface the cause in the dev-server console — we can't show it on
    // the page without leaking info, but during local debugging we want it.
    console.error("[bia/login] signInWithOtp failed:", {
      status: error.status,
      code: error.code,
      message: error.message,
      origin,
    });
    redirect("/tools/bia/login?error=send");
  }
  redirect("/tools/bia/login?sent=1");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/tools/bia/login");
}
