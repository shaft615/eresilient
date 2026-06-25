/**
 * GET /tools/bia/[clientSlug]/[siteSlug]/[biaSlug]/export
 *
 * Reads the BIA from Supabase, ships it through the engine's /render
 * endpoint, and streams the resulting .docx back as a download.
 */
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/bia/auth";
import { createClient } from "@/lib/supabase/server";
import { engineRender } from "@/lib/bia/engine";

type Params = Promise<{
  clientSlug: string;
  siteSlug: string;
  biaSlug: string;
}>;

export async function GET(_request: Request, { params }: { params: Params }) {
  await requireUser();
  const { clientSlug, siteSlug, biaSlug } = await params;

  const supabase = await createClient();
  const { data: bia, error } = await supabase
    .from("bias")
    .select("title, data, sites!inner(slug, clients!inner(slug))")
    .eq("slug", biaSlug)
    .eq("sites.slug", siteSlug)
    .eq("sites.clients.slug", clientSlug)
    .single<{ title: string; data: unknown }>();

  if (error || !bia) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  let docx: Buffer;
  try {
    docx = await engineRender(bia.data);
  } catch (err) {
    console.error("[bia/export] engine render failed:", err);
    return NextResponse.json(
      { error: "render failed", detail: String(err) },
      { status: 502 },
    );
  }

  const filename = `BIA - ${(bia.title || "Document").replace(/[^A-Za-z0-9 \-_]/g, " ").replace(/\s+/g, " ").trim()}.docx`;

  // Buffer-as-BodyInit works in Node-runtime route handlers; cast through
  // BodyInit for the lib.dom typings.
  return new NextResponse(docx as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
