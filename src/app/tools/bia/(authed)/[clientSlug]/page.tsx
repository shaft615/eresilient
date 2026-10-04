import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createSiteAction } from "./actions";

type Params = Promise<{ clientSlug: string }>;
type SearchParams = Promise<{ error?: string }>;

const ERRORS: Record<string, string> = {
  name: "Please enter a site name.",
  create: "Couldn't create that site. Try a different name.",
};

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { clientSlug } = await params;
  return { title: clientSlug };
}

type SiteRow = {
  id: string;
  name: string;
  slug: string;
  city_state: string | null;
  created_at: string;
};

export default async function ClientPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { clientSlug } = await params;
  const sp = await searchParams;
  const errorMessage = sp.error ? ERRORS[sp.error] : null;

  const supabase = await createClient();
  const { data: client } = await supabase
    .from("clients")
    .select("id, name, slug")
    .eq("slug", clientSlug)
    .single();

  if (!client) {
    notFound();
  }

  const { data: sites } = await supabase
    .from("sites")
    .select("id, name, slug, city_state, created_at")
    .eq("client_id", client.id)
    .order("created_at", { ascending: true })
    .returns<SiteRow[]>();

  const submitSite = createSiteAction.bind(null, clientSlug);

  return (
    <>
      <header className="bia-band">
        <div className="bia-band-inner">
          <div>
            <div className="bia-eyebrow">
              <Link href="/tools/bia">Clients</Link> · {client.name}
            </div>
            <h1>{client.name}</h1>
            <div className="bia-eyebrow bia-band-sub">Sites</div>
          </div>
        </div>
      </header>
      <div className="bia-page bia-stack">
        <div className="bia-instr">
          <span className="bia-eyebrow">What to do on this page</span>
          <span>
            <b>Pick a site, or add a new one.</b> Each site holds the BIAs for
            its departments.
          </span>
        </div>

        {!sites || sites.length === 0 ? (
          <div className="bia-empty">
            No sites yet. Use the box below to add the first one.
          </div>
        ) : (
          <ul className="bia-cards">
            {sites.map((s, i) => (
              <li key={s.id}>
                <Link
                  href={`/tools/bia/${clientSlug}/${s.slug}`}
                  className="bia-frame bia-card"
                >
                  <div className="bia-ftag">
                    <span>
                      Site {i + 1} of {sites.length}
                    </span>
                  </div>
                  <div className="bia-fbody">
                    <h3>{s.name}</h3>
                    {s.city_state ? <span>{s.city_state}</span> : null}
                    <span className="bia-hint bia-mono">/{s.slug}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <form action={submitSite} className="bia-block">
          <h3>Add a site</h3>
          <div className="bia-grid3">
            <div className="bia-field">
              <label htmlFor="name">Site name</label>
              <input id="name" name="name" type="text" required placeholder="e.g., Clinton" />
            </div>
            <div className="bia-field">
              <label htmlFor="city_state">City / state or region</label>
              <input
                id="city_state"
                name="city_state"
                type="text"
                placeholder="e.g., Clinton, Indiana"
              />
            </div>
            <div className="bia-field">
              <label htmlFor="address">Address (optional)</label>
              <input id="address" name="address" type="text" placeholder="Street address" />
            </div>
          </div>
          {errorMessage ? (
            <p className="bia-alert" role="alert">
              {errorMessage}
            </p>
          ) : null}
          <div className="bia-btn-row">
            <button type="submit" className="bia-btn primary">
              Add site
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
