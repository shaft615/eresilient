import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/container";
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
    <section className="py-12 sm:py-16">
      <Container width="wide">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-orange">
          <Link href="/tools/bia" className="hover:text-brand-maroon">
            Clients
          </Link>{" "}
          / {client.name}
        </p>
        <h1 className="mt-2 font-display text-3xl text-brand-maroon">
          {client.name}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-brand-ink-mid">
          Sites for this client. Each site holds the BIAs for its departments.
        </p>

        {/* Create-site form */}
        <form
          action={submitSite}
          className="mt-8 grid gap-3 rounded-2xl border border-brand-taupe-mid bg-brand-paper p-5 sm:grid-cols-3"
        >
          <div className="sm:col-span-1">
            <label
              htmlFor="name"
              className="block text-xs font-semibold uppercase tracking-[0.12em] text-brand-ink-mid"
            >
              Site name
            </label>
            <input
              id="name"
              name="name"
              required
              placeholder="Clinton"
              className="mt-2 w-full rounded-lg border border-brand-taupe-mid bg-brand-paper px-3 py-2 text-sm text-brand-ink shadow-sm focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange"
            />
          </div>
          <div className="sm:col-span-1">
            <label
              htmlFor="city_state"
              className="block text-xs font-semibold uppercase tracking-[0.12em] text-brand-ink-mid"
            >
              City / State
            </label>
            <input
              id="city_state"
              name="city_state"
              placeholder="Clinton, Indiana"
              className="mt-2 w-full rounded-lg border border-brand-taupe-mid bg-brand-paper px-3 py-2 text-sm text-brand-ink shadow-sm focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange"
            />
          </div>
          <div className="sm:col-span-1">
            <label
              htmlFor="address"
              className="block text-xs font-semibold uppercase tracking-[0.12em] text-brand-ink-mid"
            >
              Address (optional)
            </label>
            <input
              id="address"
              name="address"
              placeholder="10500 IN-63"
              className="mt-2 w-full rounded-lg border border-brand-taupe-mid bg-brand-paper px-3 py-2 text-sm text-brand-ink shadow-sm focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange"
            />
          </div>
          <div className="sm:col-span-3">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg bg-brand-orange px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-brand-paper transition hover:bg-brand-maroon"
            >
              Add site
            </button>
          </div>
        </form>

        {errorMessage ? (
          <p className="mt-3 text-sm text-brand-maroon" role="alert">
            {errorMessage}
          </p>
        ) : null}

        {/* Sites list */}
        {!sites || sites.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-brand-taupe-mid bg-brand-taupe-light/40 p-10 text-center">
            <p className="font-display text-lg text-brand-maroon">
              No sites yet.
            </p>
          </div>
        ) : (
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sites.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/tools/bia/${clientSlug}/${s.slug}`}
                  className="block h-full rounded-2xl border border-brand-taupe-mid bg-brand-paper p-5 transition hover:border-brand-orange"
                >
                  <p className="font-display text-lg text-brand-maroon">
                    {s.name}
                  </p>
                  {s.city_state ? (
                    <p className="mt-1 text-sm text-brand-ink-mid">
                      {s.city_state}
                    </p>
                  ) : null}
                  <p className="mt-1 text-xs text-brand-ink-mid">/{s.slug}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
}
