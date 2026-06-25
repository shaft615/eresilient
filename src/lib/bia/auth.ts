/**
 * Auth helpers for BIA tool pages. Per Next 16 docs, every server-rendered
 * route must verify auth itself rather than relying on proxy.ts.
 */
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export async function requireUser(): Promise<User> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/tools/bia/login");
  }
  return user;
}
