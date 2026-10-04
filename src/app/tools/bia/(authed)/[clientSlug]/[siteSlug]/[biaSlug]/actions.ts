"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/bia/auth";
import { createClient as createSupabase } from "@/lib/supabase/server";
import { sanitizeBia } from "@/lib/bia/model";
import type { SaveResult } from "@/lib/bia/types";

/**
 * Autosave target for the editor. The client sends the whole document; it is
 * reduced to the known BIA shape before it is written, and the RPC enforces
 * that the caller is a member of the owning client.
 */
export async function saveBiaAction(
  clientSlug: string,
  siteSlug: string,
  biaSlug: string,
  data: unknown,
): Promise<SaveResult> {
  await requireUser();
  const supabase = await createSupabase();
  const { error } = await supabase.rpc("update_bia_data_for_caller", {
    p_client_slug: clientSlug,
    p_site_slug: siteSlug,
    p_bia_slug: biaSlug,
    p_data: sanitizeBia(data),
  });
  if (error) {
    console.error("[bia/update] rpc failed:", error);
    return { ok: false };
  }
  // Keeps the site list's "updated" date and any cached copy of the editor
  // current, so going back and forward never reopens a stale document.
  revalidatePath(`/tools/bia/${clientSlug}/${siteSlug}`);
  revalidatePath(`/tools/bia/${clientSlug}/${siteSlug}/${biaSlug}`);
  return { ok: true, savedAt: new Date().toISOString() };
}
