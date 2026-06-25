/**
 * Supabase client for Server Components, Server Actions, and Route Handlers.
 *
 * Note Next 16 made `cookies()` async — `await cookies()` returns the cookie
 * store, on which `.getAll()` and `.set(...)` work. The catch around `setAll`
 * is the recommended pattern from Supabase: writing cookies during a Server
 * Component render throws, so we silently ignore it there and rely on the
 * proxy to refresh sessions.
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component — refresh handled by proxy.ts
          }
        },
      },
    },
  );
}
