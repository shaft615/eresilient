import type { Metadata } from "next";
import Link from "next/link";
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
    <>
      <header className="bia-band">
        <div className="bia-band-inner">
          <div>
            <div className="bia-eyebrow">Business Impact Analysis (BIA)</div>
            <h1>Clients</h1>
          </div>
        </div>
      </header>
      <div className="bia-page bia-stack">
        <div className="bia-instr">
          <span className="bia-eyebrow">What to do on this page</span>
          <span>
            <b>Pick a client, or add a new one.</b> Each client groups one or
            more sites and the BIAs produced for their departments.
          </span>
        </div>

        {error ? (
          <p className="bia-alert" role="alert">
            Could not load clients: {error.message}
          </p>
        ) : !clients || clients.length === 0 ? (
          <div className="bia-empty">
            No clients yet. Use the box below to add your first client.
          </div>
        ) : (
          <ul className="bia-cards">
            {clients.map((c, i) => (
              <li key={c.id}>
                <Link href={`/tools/bia/${c.slug}`} className="bia-frame bia-card">
                  <div className="bia-ftag">
                    <span>
                      Client {i + 1} of {clients.length}
                    </span>
                  </div>
                  <div className="bia-fbody">
                    <h3>{c.name}</h3>
                    <span className="bia-hint bia-mono">/{c.slug}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <form action={createClientAction} className="bia-block">
          <h3>Add a client</h3>
          <div className="bia-field">
            <label htmlFor="name">Client name</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="e.g., Elanco Animal Health"
            />
          </div>
          {errorMessage ? (
            <p className="bia-alert" role="alert">
              {errorMessage}
            </p>
          ) : null}
          <div className="bia-btn-row">
            <button type="submit" className="bia-btn primary">
              Add client
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
