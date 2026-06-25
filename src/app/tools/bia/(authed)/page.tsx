import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";
import { createClient } from "@/lib/supabase/server";
import { createClientAction } from "./actions";

export const metadata: Metadata = {
  title: "Dashboard",
};

type ClientRow = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

type SearchParams = Promise<{ error?: string }>;

const ERRORS: Record<string, string> = {
  name: "Please enter a client name.",
  create: "Couldn't create that client. Try a different name.",
};

export default async function BiaDashboard({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const errorMessage = params.error ? ERRORS[params.error] : null;

  const supabase = await createClient();
  const { data: clients, error } = await supabase
    .from("clients")
    .select("id, name, slug, created_at")
    .order("created_at", { ascending: false })
    .returns<ClientRow[]>();

  return (
    <section className="py-12 sm:py-16">
      <Container width="wide">
        <h1 className="font-display text-3xl text-brand-maroon">Clients</h1>
        <p className="mt-2 max-w-2xl text-sm text-brand-ink-mid">
          Each client groups one or more sites and the BIAs produced for their
          departments.
        </p>

        {/* Create-client form */}
        <form
          action={createClientAction}
          className="mt-8 flex max-w-xl flex-col gap-3 rounded-2xl border border-brand-taupe-mid bg-brand-paper p-5 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <label
              htmlFor="name"
              className="block text-xs font-semibold uppercase tracking-[0.12em] text-brand-ink-mid"
            >
              New client
            </label>
            <input
              id="name"
              name="name"
              required
              placeholder="e.g. Elanco Animal Health"
              className="mt-2 w-full rounded-lg border border-brand-taupe-mid bg-brand-paper px-3 py-2 text-sm text-brand-ink shadow-sm focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-brand-orange px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-brand-paper transition hover:bg-brand-maroon"
          >
            Create
          </button>
        </form>

        {errorMessage ? (
          <p className="mt-3 text-sm text-brand-maroon" role="alert">
            {errorMessage}
          </p>
        ) : null}

        {/* List */}
        {error ? (
          <p className="mt-8 rounded-lg border border-brand-maroon bg-brand-maroon/5 p-4 text-sm text-brand-maroon">
            Couldn&apos;t load clients: {error.message}
          </p>
        ) : !clients || clients.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-brand-taupe-mid bg-brand-taupe-light/40 p-10 text-center">
            <p className="font-display text-lg text-brand-maroon">
              No clients yet.
            </p>
            <p className="mt-2 text-sm text-brand-ink-mid">
              Use the form above to add your first client.
            </p>
          </div>
        ) : (
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clients.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/tools/bia/${c.slug}`}
                  className="block h-full rounded-2xl border border-brand-taupe-mid bg-brand-paper p-5 transition hover:border-brand-orange"
                >
                  <p className="font-display text-lg text-brand-maroon">
                    {c.name}
                  </p>
                  <p className="mt-1 text-xs text-brand-ink-mid">/{c.slug}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
}
