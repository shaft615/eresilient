-- 006 — Pre-boarding collaboration, ticketing, and the audit log.
--
-- Apply via Vercel Postgres dashboard SQL editor, or:
--   psql "$POSTGRES_URL_NON_POOLING" -f scripts/migrations/006_collab_audit.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Who put a document in the store: the firm (deliverables) or the client
-- (pre-boarding submissions). Existing rows are firm uploads.
ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS uploaded_by_role TEXT NOT NULL DEFAULT 'firm';

-- Discussion boards: per-client threads both sides can open and post to.
-- Available from prospect stage onward — this is the pre-boarding
-- collaboration surface.
CREATE TABLE IF NOT EXISTS discussions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  client_id   UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  created_by  TEXT NOT NULL,            -- email
  created_role TEXT NOT NULL DEFAULT 'client'  -- 'firm' | 'client'
);

CREATE INDEX IF NOT EXISTS discussions_client_idx ON discussions (client_id, created_at DESC);

CREATE TABLE IF NOT EXISTS discussion_posts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  discussion_id UUID NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
  author_email  TEXT NOT NULL,
  author_name   TEXT,
  author_role   TEXT NOT NULL DEFAULT 'client',  -- 'firm' | 'client'
  body          TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS discussion_posts_thread_idx
  ON discussion_posts (discussion_id, created_at ASC);

-- Support tickets ("Get help"). Status workflow:
-- open → in_progress → waiting_on_client → closed
CREATE TABLE IF NOT EXISTS tickets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  client_id     UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  subject       TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'open',
  created_by    TEXT NOT NULL,          -- email
  created_name  TEXT
);

CREATE INDEX IF NOT EXISTS tickets_client_idx ON tickets (client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS tickets_status_idx ON tickets (status, updated_at DESC);

CREATE TABLE IF NOT EXISTS ticket_posts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ticket_id    UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author_email TEXT NOT NULL,
  author_name  TEXT,
  author_role  TEXT NOT NULL DEFAULT 'client',  -- 'firm' | 'client'
  body         TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS ticket_posts_thread_idx
  ON ticket_posts (ticket_id, created_at ASC);

-- Application audit trail: one row per action, admin- and client-side.
-- Inserts are fire-and-forget; a few hundred bytes per action makes this
-- effectively free at this scale. Prune with:
--   DELETE FROM audit_log WHERE created_at < NOW() - INTERVAL '2 years';
CREATE TABLE IF NOT EXISTS audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actor_email TEXT,
  actor_role  TEXT NOT NULL,            -- 'admin' | 'client' | 'system'
  client_id   UUID REFERENCES clients(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,            -- e.g. 'invoice.create', 'document.download'
  detail      JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS audit_created_idx ON audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS audit_client_idx  ON audit_log (client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS audit_action_idx  ON audit_log (action);
