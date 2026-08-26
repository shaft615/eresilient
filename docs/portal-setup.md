# Client portal & payments — setup guide

Runbook for provisioning the client onboarding / payment capability: Clerk
(authentication), Stripe (invoicing + payments), Vercel Blob (deliverable
sharing), and the client-management database tables. Written in the same
spirit as `cutover.md` — every step ends with a **Verify** clause.

Until these steps are done the site still builds and runs: `/admin`, `/portal`,
and the sign-in pages render a "not configured" notice, and invoices save as
local drafts without payment links. Nothing on the marketing site changes.

**What you get when done:**

- `/admin` — your enterprise console (gated to `ADMIN_EMAILS`): client records,
  lead + scorecard conversion, engagements, Stripe invoicing.
- `/portal` — the client-facing portal (Clerk sign-in): engagement status,
  invoices, hosted payment pages (ACH + card).
- Emails via the existing Resend account: portal welcome, invoice with pay
  link, paid/failed notifications to the firm inbox.

---

## 1 — Run migrations 004, 005, and 006

004: clients / client_users / engagements / invoices. 005: documents /
milestones / scorecard linkage / tool entitlements. 006: discussions /
tickets / audit log. Run all three, in order.

1. Vercel dashboard → eresilient project → Storage → your Postgres DB → **Query**
2. Paste and run, in order: `scripts/migrations/004_clients.sql`, then
   `005_portal_phase2.sql`, then `006_collab_audit.sql`.
   (Or locally: `psql "$POSTGRES_URL_NON_POOLING" -f scripts/migrations/<file>`)
3. **Verify:** `SELECT COUNT(*) FROM clients;`,
   `SELECT COUNT(*) FROM tickets;`, and `SELECT COUNT(*) FROM audit_log;`
   all return `0` (not an error).

## 2 — Create the Clerk application (free tier)

1. https://dashboard.clerk.com → **Create application**
   - Name: `eResilient`
   - Sign-in options: **Email** — enable BOTH **Email verification code**
     AND **Password** (Google SSO optional — it's nice for clients).
     This drives the sign-in discipline: a new user's first sign-in happens
     with an emailed code; the portal then forces them to set a password
     before showing any content (SSO accounts are exempt), and code sign-in
     stays available afterward as an alternative. In Clerk, set Password as
     optional at sign-up (users may arrive passwordless via code) — the
     portal's gate does the enforcing.
2. On the new app's **API keys** page, copy:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts `pk_`)
   - `CLERK_SECRET_KEY` (starts `sk_`)
3. Vercel → eresilient → Settings → Environment Variables → add both to
   **Production and Preview**. Also add:
   - `ADMIN_EMAILS` = comma-separated list of the email address(es) that may
     access `/admin` (your work email; add teammates later the same way).
4. When you're ready for production: in Clerk, switch the app to a production
   instance (Clerk dashboard → **Deploy to production**) and follow its DNS
   steps for `eresilient.com`; swap the `pk_live_` / `sk_live_` keys into
   Vercel's Production env. Dev keys (`pk_test_`) are fine for previews.
5. Redeploy.
6. **Verify:** visit `/sign-in` on the deployment — the Clerk sign-in card
   renders. Sign up with an `ADMIN_EMAILS` address, then visit `/admin` — the
   dashboard loads. Visit `/admin` in an incognito window — you're redirected
   to sign-in.

## 3 — Create the Stripe account

1. https://dashboard.stripe.com → create/activate the **e|Resilient LLC**
   account (business details, bank account for payouts).
2. **Enable ACH:** Settings → Payment methods → turn on **ACH Direct Debit**
   (a.k.a. US bank account). At $5k+ invoice sizes this is the difference
   between a $5 fee (ACH, 0.8% capped) and ~$145+ (card).
3. Developers → API keys → copy the **Secret key** (`sk_live_...`, or
   `sk_test_...` while testing).
4. Vercel → Environment Variables → add `STRIPE_SECRET_KEY`.
   Tip: use the test key on Preview and the live key on Production.
5. **Verify:** create a test client in `/admin`, issue a $1 invoice — the
   invoice row shows status `open` with a "Payment page ↗" link that opens a
   Stripe-hosted invoice.

## 4 — Wire the Stripe webhook

Keeps invoice status (paid/failed/void) in sync and emails you when money
lands.

1. Stripe dashboard → Developers → Webhooks → **Add endpoint**
   - URL: `https://eresilient.com/api/stripe-webhook`
   - Events: `invoice.finalized`, `invoice.paid`, `invoice.payment_failed`,
     `invoice.voided`, `invoice.marked_uncollectible`
2. Copy the endpoint's **Signing secret** (`whsec_...`) → Vercel env var
   `STRIPE_WEBHOOK_SECRET`.
3. **Verify:** Stripe dashboard → the endpoint → **Send test event** →
   `invoice.paid` returns HTTP 200. (Status only syncs for invoices created
   through `/admin`, matched by Stripe invoice id.)

## 5 — Provision Vercel Blob (deliverable sharing)

Client deliverables uploaded in `/admin` are stored as **private** blobs;
the only way to the bytes is the authenticated download route.

1. Vercel dashboard → eresilient project → **Storage** → **Create Database**
   → choose **Blob** → name it `eresilient-documents`.
2. Connect it to the project (Production + Preview). This auto-injects
   `BLOB_READ_WRITE_TOKEN` — nothing to copy manually.
3. Redeploy.
4. **Verify:** on a client page in `/admin`, the "Documents & deliverables"
   upload form no longer shows the "Blob storage isn't configured" notice.
   Upload a test PDF, then download it from the table — and confirm the
   `/api/documents/<id>` URL returns 401 in an incognito window.

## 6 — Book the first client (the actual workflow)

1. `/admin` → the lead appears under **Recent leads** or **Recent scorecard
   submissions** → click **Convert** (or **New client** for a cold start).
2. On the client page:
   - **Portal access** — grant the client contact's email; they get a welcome
     email pointing at `/sign-up`.
   - **Engagements** — add one (pick Foundation / Program / Enterprise or
     custom, set price and dates).
   - **Invoices** — e.g. "Foundation engagement — 50% deposit", amount, days
     until due, leave "Email the payment link" checked → **Create invoice in
     Stripe**.
3. Client pays on the Stripe-hosted page (ACH or card). You get a "Invoice
   PAID" email; the invoice flips to `paid` in `/admin` and `/portal`.
4. Flip the client's status to **active** and the engagement to **active**.

## Environment variable summary

| Variable | Where | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Vercel (Prod+Preview) | Clerk client-side key |
| `CLERK_SECRET_KEY` | Vercel (Prod+Preview) | Clerk server-side key |
| `ADMIN_EMAILS` | Vercel (Prod+Preview) | Comma-separated admin allowlist for `/admin` |
| `STRIPE_SECRET_KEY` | Vercel (Prod+Preview) | Stripe API key (test key on Preview) |
| `STRIPE_WEBHOOK_SECRET` | Vercel (Production) | Webhook signature verification |
| `BLOB_READ_WRITE_TOKEN` | auto-injected | Vercel Blob store for deliverables |

Existing vars (`POSTGRES_URL`, `RESEND_API_KEY`, …) are unchanged and still
required for the underlying storage/email.

## Design notes / future phases

- **Portal access model:** access is by verified email match against
  `client_users` — users can be granted access before they've ever signed up,
  and revoking a row revokes the portal. No Clerk organization setup needed at
  this stage.
- **Payments are invoice-shaped** (Stripe `send_invoice` collection), matching
  consulting economics — deposits, milestones, net-N terms — rather than a
  checkout cart. Recurring retainers can later use Stripe subscriptions on the
  same customer records.
- **Documents are private-by-default:** blobs are stored with private access
  and only served through `/api/documents/[id]`, which checks the signed-in
  user's membership in the document's client (admins always pass). Uploads
  are capped at 20 MB per file (server-action body limit is 25 MB).
- **riscManager linking:** set a client's workspace URL on their admin page
  ("Access & integrations") and their portal shows an "Open riscManager"
  button. eResilient stays the system of record for the client relationship;
  SSO into riscManager is a later phase once it can share the Clerk tenant.
- **Tool entitlements** are slugs in `clients.tool_access`, edited via
  checkboxes on the client's admin page; the portal renders only entitled
  tools. The catalog lives in `src/lib/portal-tools.ts` — as riscAnalysis /
  riscScope / riscResponse become real workspaces, update each `href` there.
- **Pipeline** (`/admin/pipeline`): funnel counts, outstanding vs collected
  revenue, every lead with converted/lead stage (matched by email against
  clients and portal users), and every scorecard submission with a
  link-to-client control. Linking a scorecard to a client also surfaces it
  in that client's portal "Assessment history".
- **Admin preview ("view as client"):** every client's admin page has a
  "View as client" button opening `/portal?as=<clientId>` — the same code
  path the client sees, with forms disabled and a preview banner. The `as`
  parameter is honored only for admins.
- **Pre-boarding:** a `prospect`-status client is a full workspace — grant
  their people portal access and they can submit documents and use the
  discussion boards while the sale closes; the portal shows a pre-boarding
  banner until you flip them to `active`, and everything carries over.
- **Tickets:** clients open tickets from the portal's "Get help" card;
  the queue lives at `/admin/tickets` with statuses open → in progress →
  waiting on client → closed. Firm replies are emailed to the ticket's
  creator; client replies reopen waiting/closed tickets and notify the firm
  inbox.
- **Audit log:** every application action (admin and client side, plus
  Stripe webhook events and document downloads) writes one row to
  `audit_log`, viewable at `/admin/audit` with per-client filtering.
  Inserts are fire-and-forget and cost effectively nothing; prune old rows
  per the note in migration 006. Sign-in events live in Clerk's own logs.
- **Phase 4 candidates:** riscManager SSO, recurring retainers (Stripe
  subscriptions), proposal/SOW e-signature flow, per-engagement message
  threads.
