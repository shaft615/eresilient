/**
 * Supabase magic-link / OAuth callback.
 *
 * Magic-link emails redirect here with `?token_hash=...&type=magiclink`.
 * OAuth providers redirect here with `?code=...`.
 * We accept either, exchange for a session, and bounce the user into the tool.
 */
import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/tools/bia";

  const supabase = await createClient();

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("[auth/callback] verifyOtp failed:", {
      status: error.status,
      code: error.code,
      message: error.message,
    });
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("[auth/callback] exchangeCodeForSession failed:", {
      status: error.status,
      code: error.code,
      message: error.message,
    });
  } else {
    console.error("[auth/callback] no token_hash/type or code in URL", {
      url: request.url,
    });
  }

  return NextResponse.redirect(`${origin}/tools/bia/login?error=callback`);
}
