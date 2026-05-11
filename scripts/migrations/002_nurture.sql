-- Adds nurture send-state and unsubscribe tracking to the subscribers table.
-- Apply via Vercel Postgres dashboard SQL editor, or:
--   psql "$POSTGRES_URL_NON_POOLING" -f scripts/migrations/002_nurture.sql

ALTER TABLE subscribers
  ADD COLUMN IF NOT EXISTS nurture_email_2_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS nurture_email_3_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS unsubscribed_at         TIMESTAMPTZ;

-- Indices to keep the cron query fast as the list grows.
CREATE INDEX IF NOT EXISTS subscribers_nurture_2_due_idx
  ON subscribers (created_at)
  WHERE nurture_email_2_sent_at IS NULL AND unsubscribed_at IS NULL;

CREATE INDEX IF NOT EXISTS subscribers_nurture_3_due_idx
  ON subscribers (created_at)
  WHERE nurture_email_3_sent_at IS NULL AND unsubscribed_at IS NULL;
