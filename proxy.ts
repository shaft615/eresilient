/**
 * Next 16 proxy (formerly middleware.ts).
 *
 * Refreshes Supabase sessions on every BIA-tool request so server components
 * see a current auth state. Authorization itself happens inside the route
 * layouts — see src/app/tools/bia/layout.tsx.
 */
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Run only on tool routes + the auth callback. Skip everything else
  // (marketing pages, _next assets, images, etc).
  matcher: ["/tools/bia/:path*", "/auth/callback"],
};
