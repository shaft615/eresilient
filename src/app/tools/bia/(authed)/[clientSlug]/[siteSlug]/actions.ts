"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/bia/auth";
import { createClient as createSupabase } from "@/lib/supabase/server";
import { engineExtract } from "@/lib/bia/engine";
import { slugify } from "@/lib/bia/slug";

async function insertBia(
  clientSlug: string,
  siteSlug: string,
  baseSlug: string,
  title: string,
  data: Record<string, unknown>,
): Promise<{ slug: string } | { error: string }> {
  const supabase = await createSupabase();
  let slug = baseSlug;
  for (let i = 0; i < 10; i++) {
    const { data: row, error } = await supabase
      .rpc("create_bia_for_caller", {
        p_client_slug: clientSlug,
        p_site_slug: siteSlug,
        p_slug: slug,
        p_title: title,
        p_data: data,
      })
      .single<{ slug: string }>();

    if (!error && row) return { slug: row.slug };
    if (error?.code === "23505") {
      slug = `${baseSlug}-${i + 2}`;
      continue;
    }
    if (error) {
      console.error("[bia] rpc create_bia_for_caller failed:", error);
      return { error: "db" };
    }
  }
  return { error: "db" };
}

/** Create a brand-new BIA with an empty data object. */
export async function createBlankBiaAction(
  clientSlug: string,
  siteSlug: string,
  formData: FormData,
): Promise<void> {
  await requireUser();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) {
    redirect(`/tools/bia/${clientSlug}/${siteSlug}?error=name`);
  }

  const baseSlug = slugify(title) || "bia";
  const result = await insertBia(clientSlug, siteSlug, baseSlug, title, {});
  if ("error" in result) {
    redirect(`/tools/bia/${clientSlug}/${siteSlug}?error=${result.error}`);
  }
  revalidatePath(`/tools/bia/${clientSlug}/${siteSlug}`);
  redirect(`/tools/bia/${clientSlug}/${siteSlug}/${result.slug}`);
}

/** Upload an existing BIA .docx, run it through the engine, and save the JSON. */
export async function importBiaAction(
  clientSlug: string,
  siteSlug: string,
  formData: FormData,
): Promise<void> {
  await requireUser();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    redirect(`/tools/bia/${clientSlug}/${siteSlug}?error=file`);
  }
  if (!(file as File).name.toLowerCase().endsWith(".docx")) {
    redirect(`/tools/bia/${clientSlug}/${siteSlug}?error=type`);
  }

  // Extract via the engine.
  let parsed: Record<string, unknown>;
  try {
    parsed = (await engineExtract(file as File)) as Record<string, unknown>;
  } catch (err) {
    console.error("[bia/import] engine extract failed:", err);
    redirect(`/tools/bia/${clientSlug}/${siteSlug}?error=engine`);
  }

  // Title: prefer explicit override, else inferred from filename (strip ".docx" + leading "BIA - ").
  const overrideTitle = String(formData.get("title") ?? "").trim();
  const inferredTitle = (file as File).name
    .replace(/\.docx$/i, "")
    .replace(/^BIA\s*-\s*/i, "")
    .trim();
  const title = overrideTitle || inferredTitle || "Imported BIA";

  const baseSlug = slugify(title) || "imported";
  const result = await insertBia(clientSlug, siteSlug, baseSlug, title, parsed);
  if ("error" in result) {
    redirect(`/tools/bia/${clientSlug}/${siteSlug}?error=${result.error}`);
  }
  revalidatePath(`/tools/bia/${clientSlug}/${siteSlug}`);
  redirect(`/tools/bia/${clientSlug}/${siteSlug}/${result.slug}`);
}
