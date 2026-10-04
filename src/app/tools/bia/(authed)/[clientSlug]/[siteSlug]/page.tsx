import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createBlankBiaAction, importBiaAction } from "./actions";

type Params = Promise<{ clientSlug: string; siteSlug: string }>;
type SearchParams = Promise<{ error?: string }>;

const ERRORS: Record<string, string> = {
  name: "Please enter a title.",
  file: "Choose a file to upload.",
  type: "That file isn't a .docx.",
  engine: "The engine couldn't parse that file. Is the engine running locally?",
  db: "Saved file but couldn't write to the database.",
  create: "Couldn't save. Try a different title.",
};

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { siteSlug } = await params;
  return { title: siteSlug };
}

type BiaRow = {
  id: string;
  slug: string;
  title: string;
  status: string;
  updated_at: string;
};

export default async function SitePage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { clientSlug, siteSlug } = await params;
  const sp = await searchParams;
  const errorMessage = sp.error ? ERRORS[sp.error] : null;

  const supabase = await createClient();

  const { data: site } = await supabase
    .from("sites")
    .select("id, name, slug, city_state, clients!inner(name, slug)")
    .eq("slug", siteSlug)
    .eq("clients.slug", clientSlug)
    .single<{
      id: string;
      name: string;
      slug: string;
      city_state: string | null;
      clients: { name: string; slug: string };
    }>();

  if (!site) notFound();

  const { data: bias } = await supabase
    .from("bias")
    .select("id, slug, title, status, updated_at")
    .eq("site_id", site.id)
    .order("updated_at", { ascending: false })
    .returns<BiaRow[]>();

  const submitImport = importBiaAction.bind(null, clientSlug, siteSlug);
  const submitBlank = createBlankBiaAction.bind(null, clientSlug, siteSlug);

  return (
    <>
      <header className="bia-band">
        <div className="bia-band-inner">
          <div>
            <div className="bia-eyebrow">
              <Link href="/tools/bia">Clients</Link> ·{" "}
              <Link href={`/tools/bia/${clientSlug}`}>{site.clients.name}</Link> ·{" "}
              {site.name}
            </div>
            <h1>{site.name}</h1>
            <div className="bia-eyebrow bia-band-sub">
              {site.city_state ? `${site.city_state} · ` : ""}BIAs
            </div>
          </div>
        </div>
      </header>
      <div className="bia-page bia-stack">
        <div className="bia-instr">
          <span className="bia-eyebrow">What to do on this page</span>
          <span>
            <b>Open a BIA to edit it, or start a new one.</b> There is one BIA
            per department at this site. Start from an existing Word document,
            or from a blank BIA.
          </span>
        </div>

        {errorMessage ? (
          <p className="bia-alert" role="alert">
            {errorMessage}
          </p>
        ) : null}

        {!bias || bias.length === 0 ? (
          <div className="bia-empty">
            No BIAs for this site yet. Import a Word document or start from
            blank below.
          </div>
        ) : (
          <ul className="bia-cards">
            {bias.map((b, i) => (
              <li key={b.id}>
                <Link
                  href={`/tools/bia/${clientSlug}/${siteSlug}/${b.slug}`}
                  className="bia-frame bia-card"
                >
                  <div className="bia-ftag">
                    <span>
                      BIA {i + 1} of {bias.length}
                    </span>
                    <span className="bia-ftag-note">{b.status}</span>
                  </div>
                  <div className="bia-fbody">
                    <h3>{b.title}</h3>
                    <span className="bia-hint">
                      Updated {new Date(b.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="bia-grid2">
          <form
            action={submitImport}
            encType="multipart/form-data"
            className="bia-block"
          >
            <h3>Import a Word document</h3>
            <p className="bia-block-instr">
              <b>Upload an existing BIA (.docx).</b> Its tables are read into
              the editor so you can review and complete them.
            </p>
            <div className="bia-field">
              <label htmlFor="file">File</label>
              <input id="file" name="file" type="file" accept=".docx" required />
            </div>
            <div className="bia-field">
              <label htmlFor="title">Title (optional)</label>
              <span className="bia-hint">Left blank, the file name is used.</span>
              <input id="title" name="title" type="text" placeholder="e.g., Finance" />
            </div>
            <div className="bia-btn-row">
              <button type="submit" className="bia-btn primary">
                Import
              </button>
            </div>
          </form>

          <form action={submitBlank} className="bia-block">
            <h3>Start from blank</h3>
            <p className="bia-block-instr">
              <b>Create an empty BIA</b> and fill it in section by section in
              the editor.
            </p>
            <div className="bia-field">
              <label htmlFor="blank-title">Title</label>
              <span className="bia-hint">Usually the department name.</span>
              <input
                id="blank-title"
                name="title"
                type="text"
                required
                placeholder="e.g., Human Resources"
              />
            </div>
            <div className="bia-btn-row">
              <button type="submit" className="bia-btn">
                Create blank BIA
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
