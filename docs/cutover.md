# eresilient.com — Cutover Guide

End-to-end runbook for moving eresilient.com from GoDaddy Website Builder to the Vercel-hosted Next.js rebuild. Designed to be followable without a phone call. Every step lists what to do, where to do it, and how to confirm it worked.

**Conventions used below:**

- "T-day" = the day you flip DNS over.
- Anything wrapped in `code` is a literal value, command, or path.
- Each step ends with a **Verify** clause — don't move on until it's true.

**Total elapsed time:** ~2–4 hours of hands-on work, spread across 7–10 days. The clock time is dominated by waiting on DNS verifications and DNS TTL propagation.

---

## Phase 0 — Provision external services (T-7 days)

This is the heaviest phase. Do it once, never touch most of it again.

### 0.1 — Confirm the Vercel project is linked to GitHub

Already done if previews have been deploying successfully — but worth a sanity check.

1. Go to https://vercel.com/karl-bryants-projects/eresilient
2. Settings → Git
3. **Verify:** "Connected Git Repository" shows `shaft615/eresilient`. If not, click "Connect" and authorize.

### 0.2 — Provision Vercel Postgres

The lead-capture form, contact form, nurture cron, and unsubscribe flow all need a database.

1. https://vercel.com/karl-bryants-projects/eresilient → Storage tab
2. Click **Create Database** → choose **Postgres** → name it `eresilient-prod` → pick a region close to your users (US East works for Chicago)
3. Click through the defaults; Vercel auto-creates the database
4. **Verify:** Storage tab now shows the Postgres database. Open it, click the **`.env.local`** tab — you should see `POSTGRES_URL`, `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`, and a few others. These auto-inject into all environments (Production / Preview / Development) — you don't need to copy them anywhere.

### 0.3 — Run both database migrations

The `subscribers` table and the nurture/unsubscribe columns are not auto-created.

1. From the Postgres dashboard (Storage → click your database) → **Query** tab
2. Open `scripts/migrations/001_subscribers.sql` from this repo, paste the entire contents into the Query box, click **Run Query**
3. **Verify:** at the bottom, "Query executed successfully." Click the **Browse** tab → **Tables** → `subscribers` should appear. Click it → no rows, but the columns `email, name, organization, role, source, metadata, created_at` should be visible.
4. Now repeat for `scripts/migrations/002_nurture.sql`.
5. **Verify:** Browse → Tables → `subscribers` → columns now include `nurture_email_2_sent_at`, `nurture_email_3_sent_at`, `unsubscribed_at`.

### 0.4 — Set up Resend (transactional email)

Resend sends the scorecard welcome, contact form notifications, and the day-3 / day-7 nurture emails.

1. Sign up at https://resend.com → free tier is fine (3,000 emails/month)
2. Once in: **Domains** → **Add Domain** → enter `eresilient.com` → choose region US East
3. Resend gives you 3–5 DNS records to add (typically: 1× MX, 1× TXT for SPF, 1× TXT for DKIM). **Copy them — you'll add them to GoDaddy in step 0.5.**
4. After adding the DNS records (next step), come back here and click **Verify** — Resend may need 5 min to 24 hours to detect the records
5. Once verified: **API Keys** → **Create API Key** → name it `production` → permission `Sending access` → domain `eresilient.com`
6. **Copy the key** (starts with `re_...`) — Resend only shows it once. Save it temporarily in a password manager; you'll paste it into Vercel in step 0.10.

### 0.5 — Add Resend's DNS records to GoDaddy

1. https://dcc.godaddy.com → Sign in → **My Products** → **eresilient.com** → **DNS**
2. Click **Add New Record** for each record Resend gave you. Most likely:
   - **TXT** record at the apex (`@`) — value `v=spf1 include:amazonses.com ~all` or similar (SPF)
   - **TXT** record at `resend._domainkey` — long DKIM string
   - Possibly **MX** record(s) for incoming bounces
3. Set TTL to **1 hour** for these (default is fine — they're permanent)
4. **Verify:** back in Resend, your domain shows ✅ Verified. May take 5 min to a few hours for DNS to propagate.

### 0.6 — Set up Google Analytics 4

Capturing baseline traffic on the **current** GoDaddy site before cutover so you have a "before" snapshot.

1. https://analytics.google.com → **Admin** (gear icon, bottom left) → **Create** → **Property**
2. Property name: `eresilient.com`. Time zone: Central. Currency: USD.
3. Industry: Business and industrial markets. Business size: Small (1-9).
4. **Create stream** → **Web** → URL `https://eresilient.com`, stream name `eResilient Production`
5. Copy the **Measurement ID** (looks like `G-ABC1234XYZ`)
6. **Add it to the current GoDaddy site too** — log into GoDaddy Website Builder, find the analytics integration in site settings, paste the GA4 measurement ID. This gives you ~7 days of baseline traffic before cutover.
7. **Verify:** GA4 → **Reports** → **Realtime** → after 1–2 minutes of you browsing the live GoDaddy site, you should see "1 user in the last 30 minutes." If yes, GA4 is collecting on the current site.
8. Save the measurement ID for step 0.10.

### 0.7 — Verify the domain in Google Search Console

1. https://search.google.com/search-console → **Add Property** → choose **Domain** (left option)
2. Enter `eresilient.com`
3. Google gives you a DNS TXT record to add — copy the value (looks like `google-site-verification=ABC123...`)
4. Back in GoDaddy DNS (step 0.5 process): add a **TXT** record at the apex (`@`) with that value
5. Back in Search Console, click **Verify**. May take a few minutes for DNS to propagate.
6. **Verify:** Search Console shows ✅ Ownership verified. The Domain method covers all subdomains and both http/https — no further verification needed when you cut over.

> **Note:** because we used the Domain (DNS) verification method, you do **not** need to set `NEXT_PUBLIC_GSC_VERIFICATION` in Vercel. That env var is only needed if you used the HTML-meta-tag method. Leave it blank.

### 0.8 — Generate the two cron / unsubscribe secrets

In a terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run it twice. Save both 64-character hex strings — one is `CRON_SECRET`, the other is `NURTURE_UNSUBSCRIBE_SECRET`. Treat them like passwords; they only need to be entered into Vercel once.

### 0.9 — (Optional) Mint a de-identified Calendly URL

_(Done — Calendly URL is now `calendly.com/eresilient/30min`.)_ The previous flow for renaming a Calendly URL is left here for reference if it ever needs to happen again:

1. Log into Calendly → **Account** → **Branding & URL** → change your username to something like `eresilient` or `eresilient-team`
2. Calendly may not allow `eresilient` (already taken) — try `eresilient-consulting` or `eresilient-bcm`
3. Recreate the "30-min consultation" event under the new username
4. Note the new URL (e.g. `calendly.com/eresilient-consulting/30min`)
5. **Update `src/lib/site.ts`** → both `calendly:` and `primaryCta.href:` constants → push the change

If you skip this, the consultation link continues to work but exposes the old slug. Not blocking for cutover.

### 0.10 — Set ALL production env vars in Vercel

https://vercel.com/karl-bryants-projects/eresilient → **Settings** → **Environment Variables** → for each row below, click **Add New**:

| Key | Value | Environment(s) |
|-----|-------|----------------|
| `NEXT_PUBLIC_SITE_URL` | `https://eresilient.com` | Production, Preview, Development |
| `RESEND_API_KEY` | `re_...` from step 0.5 | Production, Preview |
| `RESEND_FROM_EMAIL` | `e\|Resilient <info@eresilient.com>` | Production, Preview |
| `NEXT_PUBLIC_GA4_ID` | `G-...` from step 0.6 | Production |
| `CRON_SECRET` | first hex string from step 0.8 | Production, Preview |
| `NURTURE_UNSUBSCRIBE_SECRET` | second hex string from step 0.8 | Production, Preview |

> Postgres env vars (`POSTGRES_URL` etc.) auto-inject from step 0.2 — don't add them manually.
> Skip `NEXT_PUBLIC_GSC_VERIFICATION` if you used DNS-method verification in 0.7.

After saving them all, click **Deployments** → top-right **⋯** menu on the latest production deployment → **Redeploy** → uncheck "Use existing build cache" → **Redeploy**. This pushes the new env vars into the running deployment. Wait for it to finish (2–3 min).

**Verify:** open the latest Production URL → submit a test on `/resources/bcp-readiness-scorecard` with your own email → confirmation email arrives → row appears in Postgres `subscribers` table.

### 0.11 — Merge the open PR stack into main

Until now everything has been on feature branches. Production runs from `main`. Merge the stack in order:

1. Open https://github.com/shaft615/eresilient/pulls
2. Merge in this order (each one's base will auto-retarget to main as the parent merges):
   1. `feat/pr-2-core-pages`
   2. `feat/pr-3-service-pages`
   3. `fix/brand-wordmark-svg`
   4. `feat/pr-4-packages-leadmagnet`
   5. `feat/pr-5-insights-articles`
   6. `feat/pr-6-capabilities-legal-analytics`
   7. `fix/wordmark-bigger`
   8. `fix/de-identify`
   9. `feat/pr-7-nurture-sequence`
3. Each merge triggers a production build at https://eresilient.vercel.app (the auto-generated production URL until DNS cuts over)
4. **Verify:** after the final merge, **Deployments** tab shows a **Production** deployment with the PR #7 commit SHA, state **Ready**

---

## Phase 1 — Pre-cutover (T-1 day)

### 1.1 — Lower TTL on GoDaddy DNS

Drops cache lifetimes so the cutover propagates fast and rollback would be fast.

1. GoDaddy DNS dashboard for eresilient.com
2. Find the existing **A** record at `@` (apex). Edit → set **TTL** to **600 seconds** (10 min). Save.
3. Find the existing **CNAME** record at `www`. Edit → set **TTL** to **600 seconds**. Save.
4. **Verify:** wait 5 min, then run `dig +short eresilient.com` from any terminal — output is the IP Vercel will replace tomorrow. The point is just that the records still exist; you've made them quick to update.

### 1.2 — Final preview-deploy smoke test

Run the smoke checklist (see end of this doc) against the production-target preview URL — the one that builds from `main` after step 0.11. URL pattern: `https://eresilient-git-main-karl-bryants-projects.vercel.app` or whatever Vercel shows in the Production row of the Deployments tab.

Don't proceed to cutover if anything in the smoke checklist fails.

### 1.3 — Confirm GA4 baseline data has accumulated

GA4 → **Reports** → **Acquisition** → date range last 7 days. You should see traffic data from the GoDaddy site. Screenshot it as your baseline. Anything that drops sharply post-cutover is a regression you'll want to investigate.

---

## Phase 2 — Cutover (T-day)

Pick a low-traffic time. **Tuesday or Wednesday at 8 PM Central** is ideal — minimal business-hours impact, full overnight to detect issues.

### 2.1 — Add the production domain in Vercel

1. https://vercel.com/karl-bryants-projects/eresilient → **Settings** → **Domains** → **Add**
2. Enter `eresilient.com` → click **Add**
3. Vercel will show "Invalid Configuration" — that's expected, DNS hasn't pointed here yet
4. Vercel will tell you exactly what records to add at the bottom — **note the A-record IP**, typically `76.76.21.21`
5. Now **Add** `www.eresilient.com` too. Vercel will tell you to add a CNAME → `cname.vercel-dns.com`
6. Decide on the canonical: I'd recommend setting `eresilient.com` (apex) as canonical and redirecting `www.eresilient.com` → `eresilient.com`. Vercel surfaces a toggle for this on the Domains screen — flip it.

### 2.2 — Switch GoDaddy DNS to Vercel

This is the moment of truth.

1. GoDaddy DNS dashboard for eresilient.com
2. **Edit the A record at `@`** → change value to `76.76.21.21` (or whatever Vercel told you in step 2.1) → save. Keep TTL at 600.
3. **Edit the CNAME record at `www`** → change value to `cname.vercel-dns.com` → save. Keep TTL at 600.
4. If GoDaddy is showing other A or AAAA records pointing at the old WSB IPs, **delete them** — they'll fight the new record.
5. Note the time. DNS propagation typically takes 5–60 minutes with TTL at 600, max 4 hours.

### 2.3 — Wait for DNS to propagate, then confirm SSL

1. Run `dig +short eresilient.com` every 5 min until it returns `76.76.21.21` (or whatever Vercel's IP was)
2. Once it does, visit `https://eresilient.com` in an incognito browser
3. **Verify:** the new site loads, the URL bar shows the lock icon (SSL is good — Vercel auto-provisions Let's Encrypt). If you see "Not Secure" or a cert warning, give it 5 more min and reload.
4. In Vercel **Settings** → **Domains**: both `eresilient.com` and `www.eresilient.com` should show ✅ green checkmarks.

### 2.4 — Run the smoke checklist on the live site

(See "Smoke Checklist" at the bottom of this doc.) **Do this thoroughly.** Anything broken now is broken for visitors.

### 2.5 — Submit the new sitemap to Search Console

1. https://search.google.com/search-console → property `eresilient.com` → **Sitemaps** (left nav)
2. **Add a new sitemap** → enter `sitemap.xml` → **Submit**
3. **Verify:** within a few minutes, Status shows "Success" and Sitemap shows ~25 URLs discovered.

### 2.6 — Manual cron trigger (verify nurture wiring)

You won't have any subscribers yet so no emails will actually fire, but the endpoint should respond with a "0 sent" summary instead of an error.

```bash
curl "https://eresilient.com/api/cron/nurture?secret=YOUR_CRON_SECRET"
```

**Expected response:**

```json
{"ok":true,"startedAt":"...","finishedAt":"...","insightsSent":0,"insightsFailed":0,"consultationsSent":0,"consultationsFailed":0}
```

If you get `401 Unauthorized`, the secret is wrong. If you get `500`, check Vercel function logs (Project → Logs → filter `/api/cron/nurture`).

---

## Phase 3 — Post-cutover (T+1 day)

### 3.1 — Confirm Vercel Cron auto-triggered

1. Vercel project → **Logs** tab → filter to `/api/cron/nurture`
2. You should see one entry around **14:00 UTC** (9 AM Central) — Vercel Cron firing on schedule
3. **Verify:** the log shows the same `{"ok":true, "insightsSent":0,...}` JSON. If 401, your `CRON_SECRET` env var doesn't match what Vercel Cron is sending — double-check it was set for **Production** environment in step 0.10.

### 3.2 — Watch Vercel function logs for runtime errors

Vercel project → **Logs** → tail for the next 24 hours. Anything red is worth investigating. Common things to expect:

- 404s on `/about-us`, `/contact-us`, `/about/karl` — those are the 308 redirects firing correctly. Not errors.
- 404s on assets you don't recognize — likely scrapers / scanners hitting old URLs. Ignorable unless it's a real visitor path.

### 3.3 — Search Console crawl monitoring

1. Search Console → **Coverage** report (or **Indexing** → **Pages** in newer UI)
2. **Verify:** within a few days, Google starts showing pages as "Indexed". 25 pages may take 1–2 weeks for full indexing.
3. If "Errors" count grows, click in to see what's failing — most common is a redirect loop or a missing canonical, both fixable in code.

### 3.4 — Raise TTL back up

After 48 hours of stable operation, you don't need fast-rollback DNS anymore.

1. GoDaddy DNS for eresilient.com
2. Edit the A record at `@` and the CNAME at `www` → set TTL back to **1 hour** (3600 seconds), the GoDaddy default
3. Save both

---

## Phase 4 — 30-day rollback window

### 4.1 — Keep GoDaddy WSB subscription active

Don't cancel it yet. If the new site has a fundamental problem, you can flip A and CNAME records back and the old site still serves. That's the entire point of the 30-day buffer.

### 4.2 — Daily drive-by

For the first week post-cutover:

- Visit https://eresilient.com once a day, click around. Anything visually broken? Forms still submit?
- Search Console → **Performance** report → check that impressions and clicks aren't tanking
- GA4 → **Realtime** → confirm traffic is flowing

For weeks 2–4: weekly check-in is enough.

### 4.3 — After 30 days: cancel GoDaddy WSB

1. GoDaddy → **My Products** → **Website Builder** → cancel the subscription
2. Keep the **domain registration** — that's separate from WSB. The domain still points at Vercel via the DNS records you set in step 2.2.
3. **Verify:** site still loads at https://eresilient.com. (It will — the WSB cancellation only stops the old hosting; DNS doesn't change.)

---

## Rollback procedure (if cutover goes wrong)

If within the 30-day window the new site has a critical issue you can't fix quickly:

1. GoDaddy DNS → edit A record at `@` → change back to GoDaddy's WSB IP. Vercel showed you the original value when you replaced it; if you didn't note it, GoDaddy's default WSB IPs are typically in the `184.168.x.x` range — call GoDaddy support if you need the right one for your account.
2. Edit CNAME at `www` → change back to the original GoDaddy CNAME (typically `<accountname>.secureserver.net` or similar)
3. With TTL at 600 (or 3600 if you raised it), propagation takes 10–60 min
4. **Verify:** https://eresilient.com serves the old WSB site again

The Vercel deployment stays running. Your data in Postgres stays intact. You can leave the new site at `https://eresilient.vercel.app` while you debug.

---

## Smoke Checklist

Run this against the **production URL** after cutover (and against the **preview URL** before cutover). Mark each item ✅ or ❌:

### Page rendering

- [ ] `https://eresilient.com/` — homepage loads, wordmark renders cleanly in header (no broken image), maroon hero + Aptos display headline visible
- [ ] `/services` — index page loads, all 5 service cards render
- [ ] `/services/business-continuity-planning` — service detail page loads
- [ ] `/services/crisis-management` — loads
- [ ] `/services/emergency-response` — loads
- [ ] `/services/supply-chain-risk` — loads
- [ ] `/services/real-time-support` — loads
- [ ] `/packages` — three engagement tiers render side-by-side; "Most Common" badge on Program tier
- [ ] `/about` — Team block + Certifications + Federal Registration sidebar render
- [ ] `/insights` — featured + 2-card grid render
- [ ] `/insights/business-continuity-planning-for-small-business` — article body renders, MDX prose styled, related-articles cards at bottom
- [ ] `/insights/how-to-conduct-a-business-impact-analysis` — article body renders, GFM table at "BIA vs. risk assessment" renders correctly
- [ ] `/insights/iso-22301-compliance-checklist` — article body renders, GFM checklists `- [ ]` render as task-list items
- [ ] `/contact` — Calendly iframe loads, contact form renders, address shows new "1 East Erie St" address
- [ ] `/capabilities` — page renders, "Download PDF" button visible
- [ ] `/capability-statement.pdf` — clicking the link downloads the PDF
- [ ] `/scorecard` — interactive assessment loads, intro screen visible
- [ ] `/legal/privacy` — full text renders
- [ ] `/legal/terms` — full text renders

### Redirects (should all 308 to the right place)

- [ ] `/about-us` → `/about`
- [ ] `/contact-us` → `/contact`
- [ ] `/about/karl` → `/about`

### Forms + email pipeline (use a real email you can check)

- [ ] `/resources/bcp-readiness-scorecard` form submits with no errors → redirects to `/scorecard?welcome=1`
- [ ] Welcome email lands in your inbox within 1 minute, brand-styled, with a working "Take the scorecard" button and a working unsubscribe link in the footer
- [ ] `subscribers` table in Postgres has a new row with your test data and `created_at` set to now
- [ ] `/contact` form submits → success state shows
- [ ] Confirmation email lands in your inbox
- [ ] Notification email lands at `info@eresilient.com`
- [ ] Click the unsubscribe link in the welcome email → `/unsubscribe` page loads with your email pre-populated → click "Confirm unsubscribe" → success state
- [ ] Postgres → `SELECT email, unsubscribed_at FROM subscribers WHERE email = 'YOUR_TEST_EMAIL'` → `unsubscribed_at` is set

### Cron + secrets

- [ ] `curl "https://eresilient.com/api/cron/nurture?secret=YOUR_CRON_SECRET"` → 200 OK with summary JSON
- [ ] Same call with wrong secret → 401 Unauthorized
- [ ] Vercel project → **Cron Jobs** tab → schedule `0 14 * * *` for `/api/cron/nurture` is registered

### SEO + analytics

- [ ] `https://eresilient.com/sitemap.xml` returns XML with ~25 URLs including all 5 services and all 3 articles
- [ ] `https://eresilient.com/robots.txt` returns a valid robots.txt with `Sitemap:` line
- [ ] View page source on `/` — `<script type="application/ld+json">` blocks for `Organization` and `ProfessionalService` are present
- [ ] View page source on `/insights/how-to-conduct-a-business-impact-analysis` — JSON-LD `Article` block present, `author` is the Organization (e|Resilient), not a Person
- [ ] GA4 Realtime → 1 user (you) appears within 60 seconds of visiting the site

### Brand / de-identification

- [ ] No occurrence of "Karl Bryant" / "Karl D. Bryant" / "Managing Principal" / "(312) 576-5202" / "karl.bryant@eresilient.com" / "4800 S Chicago Beach" anywhere on the site (use Cmd+F on `/`, `/about`, `/contact`, `/capabilities`)
- [ ] Phone shown is "(833) PLAN-365" with "(833) 752-6365" alongside it
- [ ] Email shown is "info@eresilient.com"
- [ ] Address shown is "1 East Erie St, Suite 525-4252, Chicago, IL 60611"
- [ ] Article author bylines all read "e|Resilient"

If any line is ❌, file an issue or message the dev team before declaring cutover complete.

---

## Quick reference: production env vars checklist

| Variable | Where it's used | Required |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical URLs, sitemap, OG tags, unsubscribe links | **Yes** |
| `POSTGRES_URL` (+ siblings) | Subscriber CRUD, nurture queries, unsubscribe writes | **Yes** (auto-injected by Vercel) |
| `RESEND_API_KEY` | All transactional and nurture emails | **Yes** |
| `RESEND_FROM_EMAIL` | The `From:` line on outbound emails | Yes (defaults to `e\|Resilient <info@eresilient.com>` if unset) |
| `NEXT_PUBLIC_GA4_ID` | Loads gtag.js in production builds | Yes if you want analytics |
| `NEXT_PUBLIC_GSC_VERIFICATION` | Renders verification meta tag | Only if not using DNS verification |
| `CRON_SECRET` | Authenticates `/api/cron/nurture` | **Yes** in production |
| `NURTURE_UNSUBSCRIBE_SECRET` | Signs/verifies unsubscribe-link tokens | **Yes** in production |
