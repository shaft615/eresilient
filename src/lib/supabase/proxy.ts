/**
 * Helper used by the project-root proxy.ts (Next 16's renamed middleware).
 *
 * Refreshes the user's Supabase session on every request so server components
 * see a current auth state. Returns a NextResponse that has the new cookies
 * attached.
 *
 * IMPORTANT: per Next 16 docs, never trust the proxy alone for authorization —
 * route layouts/handlers must verify auth too. This function exists purely to
 * keep the session cookie fresh.
 */
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Reading the user forces a session refresh + cookie rewrite when needed.
  await supabase.auth.getUser();

  return response;
}
