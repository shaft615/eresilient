"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/bia/auth";
import { createClient as createSupabase } from "@/lib/supabase/server";
import { slugify } from "@/lib/bia/slug";

export async function createSiteAction(
  clientSlug: string,
  formData: FormData,
): Promise<void> {
  await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const cityState = String(formData.get("city_state") ?? "").trim() || null;
  const address = String(formData.get("address") ?? "").trim() || null;

  if (!name) {
    redirect(`/tools/bia/${clientSlug}?error=name`);
  }

  const supabase = await createSupabase();
  const baseSlug = slugify(name) || "site";

  let slug = baseSlug;
  for (let i = 0; i < 10; i++) {
    const { data, error } = await supabase
      .rpc("create_site_for_caller", {
        p_client_slug: clientSlug,
        p_name: name,
        p_slug: slug,
        p_city_state: cityState,
        p_address: address,
      })
      .single<{ slug: string }>();

    if (!error && data) {
      revalidatePath(`/tools/bia/${clientSlug}`);
      redirect(`/tools/bia/${clientSlug}/${data.slug}`);
    }
    if (error?.code === "23505") {
      slug = `${baseSlug}-${i + 2}`;
      continue;
    }
    if (error) {
      console.error("[bia/createSite] rpc failed:", error);
      redirect(`/tools/bia/${clientSlug}?error=create`);
    }
  }
  redirect(`/tools/bia/${clientSlug}?error=create`);
}
