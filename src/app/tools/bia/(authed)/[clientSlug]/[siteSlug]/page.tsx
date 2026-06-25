import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/container";
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
    <section className="py-12 sm:py-16">
      <Container width="wide">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-orange">
          <Link href="/tools/bia" className="hover:text-brand-maroon">
            Clients
          </Link>{" "}
          /{" "}
          <Link
            href={`/tools/bia/${clientSlug}`}
            className="hover:text-brand-maroon"
          >
            {site.clients.name}
          </Link>{" "}
          / {site.name}
        </p>
        <h1 className="mt-2 font-display text-3xl text-brand-maroon">
          {site.name}
        </h1>
        {site.city_state ? (
          <p className="mt-2 text-sm text-brand-ink-mid">{site.city_state}</p>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Import */}
          <form
            action={submitImport}
            encType="multipart/form-data"
            className="rounded-2xl border border-brand-taupe-mid bg-brand-paper p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-orange">
              Import .docx
            </p>
            <p className="mt-2 text-sm text-brand-ink-mid">
              Upload an existing BIA Word document. The engine extracts the
              tables into structured data.
            </p>
            <div className="mt-4">
              <label
                htmlFor="file"
                className="block text-xs font-semibold uppercase tracking-[0.12em] text-brand-ink-mid"
              >
                File
              </label>
              <input
                id="file"
                name="file"
                type="file"
                accept=".docx"
                required
                className="mt-2 block w-full text-sm text-brand-ink"
              />
            </div>
            <div className="mt-4">
              <label
                htmlFor="title"
                className="block text-xs font-semibold uppercase tracking-[0.12em] text-brand-ink-mid"
              >
                Title (optional, falls back to filename)
              </label>
              <input
                id="title"
                name="title"
                placeholder="Finance"
                className="mt-2 w-full rounded-lg border border-brand-taupe-mid bg-brand-paper px-3 py-2 text-sm text-brand-ink shadow-sm focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange"
              />
            </div>
            <button
              type="submit"
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-brand-orange px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-brand-paper transition hover:bg-brand-maroon"
            >
              Import
            </button>
          </form>

          {/* Create blank */}
          <form
            action={submitBlank}
            className="rounded-2xl border border-brand-taupe-mid bg-brand-paper p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-orange">
              Start from blank
            </p>
            <p className="mt-2 text-sm text-brand-ink-mid">
              Create an empty BIA you&apos;ll fill in via the editor (the editor
              UI lands in the next push).
            </p>
            <div className="mt-4">
              <label
                htmlFor="blank-title"
                className="block text-xs font-semibold uppercase tracking-[0.12em] text-brand-ink-mid"
              >
                Title
              </label>
              <input
                id="blank-title"
                name="title"
                required
                placeholder="Finance"
                className="mt-2 w-full rounded-lg border border-brand-taupe-mid bg-brand-paper px-3 py-2 text-sm text-brand-ink shadow-sm focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange"
              />
            </div>
            <button
              type="submit"
              className="mt-4 inline-flex items-center justify-center rounded-lg border border-brand-maroon bg-brand-paper px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-brand-maroon transition hover:bg-brand-maroon hover:text-brand-paper"
            >
              Create blank BIA
            </button>
          </form>
        </div>

        {errorMessage ? (
          <p className="mt-3 text-sm text-brand-maroon" role="alert">
            {errorMessage}
          </p>
        ) : null}

        {/* BIA list */}
        <h2 className="mt-12 font-display text-2xl text-brand-maroon">BIAs</h2>
        {!bias || bias.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-brand-taupe-mid bg-brand-taupe-light/40 p-10 text-center">
            <p className="text-sm text-brand-ink-mid">
              No BIAs for this site yet. Import a .docx or start from blank
              above.
            </p>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-brand-taupe-mid rounded-2xl border border-brand-taupe-mid bg-brand-paper">
            {bias.map((b) => (
              <li key={b.id}>
                <Link
                  href={`/tools/bia/${clientSlug}/${siteSlug}/${b.slug}`}
                  className="flex items-center justify-between gap-4 px-5 py-3 transition hover:bg-brand-taupe-light/40"
                >
                  <div>
                    <p className="font-display text-base text-brand-maroon">
                      {b.title}
                    </p>
                    <p className="text-xs text-brand-ink-mid">
                      /{b.slug} · updated{" "}
                      {new Date(b.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="rounded-full border border-brand-taupe-mid px-2 py-1 text-xs uppercase tracking-[0.1em] text-brand-ink-mid">
                    {b.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
}
