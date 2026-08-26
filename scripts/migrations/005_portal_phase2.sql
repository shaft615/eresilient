-- 005 — Portal phases 2 & 3: documents, milestones, scorecard linkage,
-- tool entitlements.
--
-- Apply via Vercel Postgres dashboard SQL editor, or:
--   psql "$POSTGRES_URL_NON_POOLING" -f scripts/migrations/005_portal_phase2.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Deliverables and shared files. The binary lives in Vercel Blob; this row
-- is the authorization record — downloads go through /api/documents/[id],
-- which checks the requester belongs to the client (or is an admin) before
-- redirecting to the blob URL.
CREATE TABLE IF NOT EXISTS documents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  client_id     UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  engagement_id UUID REFERENCES engagements(id) ON DELETE SET NULL,

  title         TEXT NOT NULL,
  filename      TEXT NOT NULL,
  content_type  TEXT,
  size_bytes    BIGINT,
  blob_url      TEXT NOT NULL,
  uploaded_by   TEXT             -- admin email, for the audit trail
);

CREATE INDEX IF NOT EXISTS documents_client_idx ON documents (client_id, created_at DESC);

-- Milestones within an engagement, shown to the client as delivery progress.
CREATE TABLE IF NOT EXISTS milestones (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  engagement_id UUID NOT NULL REFERENCES engagements(id) ON DELETE CASCADE,

  title         TEXT NOT NULL,
  due_date      DATE,
  -- pending → in_progress → complete
  status        TEXT NOT NULL DEFAULT 'pending',
  sort_order    INT  NOT NULL DEFAULT 0,
  completed_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS milestones_engagement_idx
  ON milestones (engagement_id, sort_order ASC, created_at ASC);

-- Attribute scorecard submissions to a client so their assessment history
-- shows in the portal and the admin view.
ALTER TABLE scorecard_submissions
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS scorecard_client_idx ON scorecard_submissions (client_id);

-- Per-client tool entitlements (slugs: risc-analysis, risc-scope,
-- risc-response). riscManager access is expressed via
-- clients.riscmanager_workspace from migration 004.
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS tool_access TEXT[] NOT NULL DEFAULT '{}';
