import type { Metadata } from "next";
import { loadBia } from "@/lib/bia/load";
import { BiaEditor } from "@/components/bia/bia-editor";
import { saveBiaAction } from "./actions";

type Params = Promise<{
  clientSlug: string;
  siteSlug: string;
  biaSlug: string;
}>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { biaSlug } = await params;
  return { title: biaSlug };
}

export default async function BiaEditorPage({ params }: { params: Params }) {
  const { clientSlug, siteSlug, biaSlug } = await params;
  const bia = await loadBia(clientSlug, siteSlug, biaSlug);

  return (
    <BiaEditor
      initial={bia.data ?? {}}
      title={bia.title}
      status={bia.status}
      clientName={bia.client_name}
      clientSlug={clientSlug}
      siteName={bia.site_name}
      siteSlug={siteSlug}
      exportHref={`/tools/bia/${clientSlug}/${siteSlug}/${biaSlug}/export`}
      save={saveBiaAction.bind(null, clientSlug, siteSlug, biaSlug)}
    />
  );
}
