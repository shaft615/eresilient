-- Server-side helpers used by the BIA tool.
-- Idempotent: safe to re-run.

-- =========================================================================
-- Diagnostic: returns auth.uid() to the caller. Useful to verify the JWT is
-- propagating to Postgres from a Server Action. Safe to leave in production.
-- =========================================================================

create or replace function public.uid_diag()
returns uuid
language sql
security invoker
stable
as $$ select auth.uid() $$;

grant execute on function public.uid_diag() to authenticated, anon;

-- =========================================================================
-- create_client_for_caller(name, slug): inserts a row into public.clients
-- on behalf of the calling user. Runs SECURITY DEFINER so it sidesteps a
-- known issue where Server Action data calls don't always carry the user
-- JWT into PostgREST's RLS context — but it still uses auth.uid() to
-- stamp the owner, so an unauthenticated caller is rejected.
-- =========================================================================

create or replace function public.create_client_for_caller(
  p_name text,
  p_slug text
)
returns public.clients
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_id uuid;
  new_client public.clients;
begin
  caller_id := auth.uid();
  if caller_id is null then
    raise exception 'not authenticated' using errcode = 'P0001';
  end if;

  insert into public.clients (name, slug, owner_id)
  values (p_name, p_slug, caller_id)
  returning * into new_client;

  return new_client;
end;
$$;

revoke all on function public.create_client_for_caller(text, text) from public;
grant execute on function public.create_client_for_caller(text, text) to authenticated;

-- =========================================================================
-- create_site_for_caller(client_slug, name, slug, city_state, address):
-- insert a site under a client the caller owns. Membership check happens
-- via the existing is_client_member() function.
-- =========================================================================

create or replace function public.create_site_for_caller(
  p_client_slug text,
  p_name text,
  p_slug text,
  p_city_state text,
  p_address text
)
returns public.sites
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_id uuid;
  target_client_id uuid;
  new_site public.sites;
begin
  caller_id := auth.uid();
  if caller_id is null then
    raise exception 'not authenticated' using errcode = 'P0001';
  end if;

  select id into target_client_id
  from public.clients
  where slug = p_client_slug;

  if target_client_id is null then
    raise exception 'client not found' using errcode = 'P0002';
  end if;

  if not exists (
    select 1 from public.client_members
    where client_id = target_client_id and user_id = caller_id
  ) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  insert into public.sites (client_id, name, slug, city_state, address)
  values (target_client_id, p_name, p_slug, p_city_state, p_address)
  returning * into new_site;

  return new_site;
end;
$$;

revoke all on function public.create_site_for_caller(text, text, text, text, text) from public;
grant execute on function public.create_site_for_caller(text, text, text, text, text) to authenticated;

-- =========================================================================
-- create_bia_for_caller(client_slug, site_slug, slug, title, data):
-- insert a BIA under a site the caller has access to.
-- =========================================================================

create or replace function public.create_bia_for_caller(
  p_client_slug text,
  p_site_slug text,
  p_slug text,
  p_title text,
  p_data jsonb
)
returns public.bias
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_id uuid;
  target_site_id uuid;
  target_client_id uuid;
  new_bia public.bias;
begin
  caller_id := auth.uid();
  if caller_id is null then
    raise exception 'not authenticated' using errcode = 'P0001';
  end if;

  select s.id, s.client_id
    into target_site_id, target_client_id
  from public.sites s
  join public.clients c on c.id = s.client_id
  where c.slug = p_client_slug and s.slug = p_site_slug;

  if target_site_id is null then
    raise exception 'site not found' using errcode = 'P0002';
  end if;

  if not exists (
    select 1 from public.client_members
    where client_id = target_client_id and user_id = caller_id
  ) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  insert into public.bias (site_id, slug, title, data, created_by)
  values (target_site_id, p_slug, p_title, coalesce(p_data, '{}'::jsonb), caller_id)
  returning * into new_bia;

  return new_bia;
end;
$$;

revoke all on function public.create_bia_for_caller(text, text, text, text, jsonb) from public;
grant execute on function public.create_bia_for_caller(text, text, text, text, jsonb) to authenticated;
