"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { buttonCls } from "@/app/admin/ui";

/**
 * Companion to the portal's set-password gate. The gate itself is
 * server-rendered, so it only re-evaluates on a fresh request — this
 * watches the client-side Clerk user and refreshes the route the moment
 * a password lands, plus offers a manual continue button as a fallback.
 */
export function PasswordGateWatch() {
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    if (user?.passwordEnabled) {
      router.refresh();
      return;
    }
    // The embedded profile panel mutates Clerk state in this tab, but
    // poll as a belt-and-braces fallback (e.g. password set in another
    // tab or via the account portal).
    const timer = setInterval(() => {
      void user?.reload();
    }, 3000);
    return () => clearInterval(timer);
  }, [user, user?.passwordEnabled, router]);

  return (
    <div className="mt-8 text-center">
      <button type="button" className={buttonCls} onClick={() => router.refresh()}>
        I&rsquo;ve set my password — continue
      </button>
    </div>
  );
}
