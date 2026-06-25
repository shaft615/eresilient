"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/bia/auth";
import { createClient as createSupabase } from "@/lib/supabase/server";
import { slugify } from "@/lib/bia/slug";

export async function createClientAction(formData: FormData): Promise<void> {
  await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    redirect("/tools/bia?error=name");
  }

  const supabase = await createSupabase();
  const baseSlug = slugify(name) || "client";

  // Try the obvious slug first, then fall back to suffixed variants on collision.
  let slug = baseSlug;
  for (let i = 0; i < 10; i++) {
    const { data, error } = await supabase
      .rpc("create_client_for_caller", { p_name: name, p_slug: slug })
      .single<{ slug: string }>();

    if (!error && data) {
      revalidatePath("/tools/bia");
      redirect(`/tools/bia/${data.slug}`);
    }
    // 23505 = unique_violation on the slug; try a suffixed variant
    if (error?.code === "23505") {
      slug = `${baseSlug}-${i + 2}`;
      continue;
    }
    if (error) {
      console.error("[bia/createClient] rpc failed:", error);
      redirect("/tools/bia?error=create");
    }
  }
  redirect("/tools/bia?error=create");
}
