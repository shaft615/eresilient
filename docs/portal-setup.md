# Client portal & payments — setup guide

Runbook for provisioning the client onboarding / payment capability: Clerk
(authentication), Stripe (invoicing + payments), and the client-management
database tables. Written in the same spirit as `cutover.md` — every step ends
with a **Verify** clause.

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

## 1 — Run migration 004

The clients / client_users / engagements / invoices tables.

1. Vercel dashboard → eresilient project → Storage → your Postgres DB → **Query**
2. Paste the contents of `scripts/migrations/004_clients.sql` and run it.
   (Or locally: `psql "$POSTGRES_URL_NON_POOLING" -f scripts/migrations/004_clients.sql`)
3. **Verify:** `SELECT COUNT(*) FROM clients;` returns `0` (not an error).

## 2 — Create the Clerk application (free tier)

1. https://dashboard.clerk.com → **Create application**
   - Name: `eResilient`
   - Sign-in options: **Email** (enable email verification code; Google SSO
     optional — it's nice for clients)
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

## 5 — Book the first client (the actual workflow)

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
- **riscManager:** the `clients.riscmanager_workspace` column is reserved for
  linking a client to their riscManager workspace once riscManager exposes a
  linkable id/URL; eResilient stays the system of record for the client
  relationship.
- **Phase 2 candidates:** deliverable/document sharing in the portal,
  milestone tracking per engagement, pipeline views, riscManager SSO.
