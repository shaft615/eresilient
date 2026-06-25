# Supabase migrations

These files are meant to be run against the eResilient Supabase project.

## How to apply

1. Open the Supabase project dashboard → **SQL Editor**
2. Paste the contents of the next un-applied `*.sql` file
3. Run

Migrations are designed to be idempotent (`if not exists`, `drop policy if exists ...; create policy ...`), so re-running is safe.

## Files

| File | What it does |
| --- | --- |
| `0001_bia_schema.sql` | `clients`, `client_members`, `sites`, `bias` tables + RLS policies + auto-add-owner trigger |

## Conventions

- Multi-tenant root is `clients`. Every other table joins back to it.
- Access is granted via `client_members`. RLS uses `public.is_client_member(client_id uuid)`.
- The `bias.data` column holds the full pydantic-shape BIA (see `bia-engine/src/bia_engine/schema.py`).
