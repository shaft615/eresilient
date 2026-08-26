-- 004 — Client management: clients, portal users, engagements, invoices.
--
-- Turns the site from lead-gen into an operating platform: leads
-- (subscribers / scorecard submissions) convert into client records,
-- engagements track delivery, invoices track money (Stripe-backed).
--
-- Apply via Vercel Postgres dashboard SQL editor, or:
--   psql "$POSTGRES_URL_NON_POOLING" -f scripts/migrations/004_clients.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- The client company. System of record for the enterprise; riscManager
-- workspaces and Stripe customers hang off this row via the *_id columns.
CREATE TABLE IF NOT EXISTS clients (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  name                  TEXT NOT NULL,
  website               TEXT,
  primary_contact_name  TEXT,
  primary_contact_email TEXT,
  phone                 TEXT,
  notes                 TEXT,

  -- prospect → active → archived
  status                TEXT NOT NULL DEFAULT 'prospect',

  -- External system linkage
  stripe_customer_id    TEXT UNIQUE,
  riscmanager_workspace TEXT
);

CREATE INDEX IF NOT EXISTS clients_status_idx     ON clients (status);
CREATE INDEX IF NOT EXISTS clients_created_at_idx ON clients (created_at DESC);

-- Emails authorized to see a client's portal. A Clerk user whose verified
-- email matches a row here gets that client's /portal view. No Clerk ids
-- stored — email is the join key, so users can be added before they ever
-- sign up.
CREATE TABLE IF NOT EXISTS client_users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  client_id   UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  name        TEXT,
  UNIQUE (client_id, email)
);

CREATE INDEX IF NOT EXISTS client_users_email_idx ON client_users (LOWER(email));

-- A scoped piece of work for a client, usually one of the /packages.
CREATE TABLE IF NOT EXISTS engagements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  client_id       UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  title           TEXT NOT NULL,
  package_slug    TEXT,          -- foundation | program | enterprise | null (custom)
  -- proposed → active → on_hold → complete → cancelled
  status          TEXT NOT NULL DEFAULT 'proposed',
  price_cents     BIGINT,        -- engagement value in USD cents; null while scoping
  start_date      DATE,
  target_end_date DATE,
  notes           TEXT
);

CREATE INDEX IF NOT EXISTS engagements_client_idx ON engagements (client_id, created_at DESC);

-- An invoice issued to a client, mirrored to Stripe. Status follows
-- Stripe's invoice lifecycle; webhook keeps it in sync.
CREATE TABLE IF NOT EXISTS invoices (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  client_id          UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  engagement_id      UUID REFERENCES engagements(id) ON DELETE SET NULL,

  description        TEXT NOT NULL,
  amount_cents       BIGINT NOT NULL,
  currency           TEXT NOT NULL DEFAULT 'usd',
  -- draft → open → paid → void → uncollectible (Stripe lifecycle)
  status             TEXT NOT NULL DEFAULT 'draft',
  due_date           DATE,

  stripe_invoice_id  TEXT UNIQUE,
  hosted_invoice_url TEXT,

  issued_at          TIMESTAMPTZ,
  paid_at            TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS invoices_client_idx ON invoices (client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS invoices_status_idx ON invoices (status);
