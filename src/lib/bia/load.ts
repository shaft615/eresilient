import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { BiaData } from "./types";

export type LoadedBia = {
  id: string;
  title: string;
  status: string;
  data: BiaData;
  updated_at: string;
  client_name: string;
  client_slug: string;
  site_name: string;
  site_slug: string;
};

export async function loadBia(
  clientSlug: string,
  siteSlug: string,
  biaSlug: string,
): Promise<LoadedBia> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bias")
    .select(
      "id, title, status, data, updated_at, sites!inner(name, slug, clients!inner(name, slug))",
    )
    .eq("slug", biaSlug)
    .eq("sites.slug", siteSlug)
    .eq("sites.clients.slug", clientSlug)
    .single<{
      id: string;
      title: string;
      status: string;
      data: BiaData;
      updated_at: string;
      sites: {
        name: string;
        slug: string;
        clients: { name: string; slug: string };
      };
    }>();

  if (!data) notFound();

  return {
    id: data.id,
    title: data.title,
    status: data.status,
    data: data.data ?? {},
    updated_at: data.updated_at,
    client_name: data.sites.clients.name,
    client_slug: data.sites.clients.slug,
    site_name: data.sites.name,
    site_slug: data.sites.slug,
  };
}
