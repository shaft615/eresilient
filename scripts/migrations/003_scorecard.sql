-- 003 — Scorecard submission storage.
--
-- Captures BCP Readiness Scorecard submissions when the user opts in
-- on the intro screen. Karl gets an email notification with a signed
-- link to view the saved submission.
--
-- Apply via Vercel Postgres dashboard SQL editor, or:
--   psql "$POSTGRES_URL_NON_POOLING" -f scripts/migrations/003_scorecard.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS scorecard_submissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Identity captured on the intro screen
  org_name        TEXT NOT NULL,
  assessor_name   TEXT,
  assess_date     DATE,

  -- Full payload — keeps the editor's exact shape so we can re-render
  -- the same results page from the saved data verbatim.
  -- scores: { "1.1": 3, "1.2": 4, ... } (integer 0..4 per question id)
  -- notes:  { "1.1": "evidence text", ... } (string per question id, may be empty)
  scores          JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes           JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Derived snapshots — stored so we can sort/filter without
  -- re-computing from scores JSON every time.
  total_score     INT  NOT NULL DEFAULT 0,
  total_max       INT  NOT NULL DEFAULT 0,
  maturity_band   TEXT,

  -- Optional correlation back to the lead-capture email if known.
  -- Not required (the scorecard intro doesn't currently ask for email).
  lead_email      TEXT,

  -- Coarse provenance for audit / debugging.
  user_agent      TEXT,
  source_ip       TEXT
);

-- Most-recent-first listing for the (eventual) admin index.
CREATE INDEX IF NOT EXISTS scorecard_submissions_created_at_idx
  ON scorecard_submissions (created_at DESC);

-- Fast lookup for "all submissions from one organization".
CREATE INDEX IF NOT EXISTS scorecard_submissions_org_idx
  ON scorecard_submissions (org_name);
