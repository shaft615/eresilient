import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextMiddleware, NextRequest } from "next/server";

// /admin and /portal require a signed-in Clerk session. Finer-grained
// authorization (admin email allowlist, client_users membership) happens
// in the page layer — the proxy only guarantees authentication.
const isProtectedRoute = createRouteMatcher(["/admin(.*)", "/portal(.*)"]);

function hasClerkKeys(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
  );
}

// Built lazily so environments without Clerk keys (local dev, previews
// before provisioning) never construct the middleware at all.
let clerkHandler: NextMiddleware | null = null;

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  if (!hasClerkKeys()) {
    return NextResponse.next();
  }
  if (!clerkHandler) {
    clerkHandler = clerkMiddleware(async (auth, req) => {
      if (isProtectedRoute(req)) {
        await auth.protect({
          unauthenticatedUrl: new URL("/sign-in", req.url).toString(),
        });
      }
    });
  }
  return clerkHandler(request, event);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
