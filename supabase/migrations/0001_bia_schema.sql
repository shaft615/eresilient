-- BIA tool schema for the eResilient platform.
-- Tables: clients (multi-tenant root), client_members (sharing), sites, bias.
-- Authn: Supabase Auth (auth.users).
-- Authz: row-level security gates everything by client membership.

-- =========================================================================
-- Tables
-- =========================================================================

create table if not exists public.clients (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  owner_id    uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.client_members (
  client_id   uuid not null references public.clients(id) on delete cascade,
  user_id     uuid not null references auth.users(id)     on delete cascade,
  role        text not null default 'member' check (role in ('owner','member')),
  created_at  timestamptz not null default now(),
  primary key (client_id, user_id)
);

create table if not exists public.sites (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.clients(id) on delete cascade,
  name        text not null,             -- e.g. "Clinton"
  slug        text not null,             -- e.g. "clinton"
  city_state  text,
  address     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (client_id, slug)
);

create table if not exists public.bias (
  id          uuid primary key default gen_random_uuid(),
  site_id     uuid not null references public.sites(id) on delete cascade,
  slug        text not null,             -- e.g. "finance"
  title       text not null,             -- e.g. "BIA - Finance"
  status      text not null default 'draft' check (status in ('draft','review','final')),
  data        jsonb not null default '{}'::jsonb,   -- pydantic BIA shape
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid references auth.users(id),
  unique (site_id, slug)
);

create index if not exists idx_clients_owner       on public.clients(owner_id);
create index if not exists idx_client_members_user on public.client_members(user_id);
create index if not exists idx_sites_client        on public.sites(client_id);
create index if not exists idx_bias_site           on public.bias(site_id);

-- =========================================================================
-- Triggers
-- =========================================================================

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_clients_updated_at on public.clients;
create trigger touch_clients_updated_at
  before update on public.clients
  for each row execute function public.touch_updated_at();

drop trigger if exists touch_sites_updated_at on public.sites;
create trigger touch_sites_updated_at
  before update on public.sites
  for each row execute function public.touch_updated_at();

drop trigger if exists touch_bias_updated_at on public.bias;
create trigger touch_bias_updated_at
  before update on public.bias
  for each row execute function public.touch_updated_at();

-- When a client is created, auto-insert the owner into client_members.
-- security definer because the inserting user doesn't yet have a member row,
-- so the RLS check on client_members would reject the insert.
create or replace function public.add_client_owner_to_members()
returns trigger language plpgsql security definer as $$
begin
  insert into public.client_members (client_id, user_id, role)
  values (new.id, new.owner_id, 'owner')
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_client_created on public.clients;
create trigger on_client_created
  after insert on public.clients
  for each row execute function public.add_client_owner_to_members();

-- =========================================================================
-- Membership helper (bypasses RLS for clean policy expressions)
-- =========================================================================

create or replace function public.is_client_member(target_client_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.client_members
    where client_id = target_client_id
      and user_id = auth.uid()
  );
$$;

-- =========================================================================
-- Row Level Security
-- =========================================================================

alter table public.clients         enable row level security;
alter table public.client_members  enable row level security;
alter table public.sites           enable row level security;
alter table public.bias            enable row level security;

-- ---- clients ----------------------------------------------------------

drop policy if exists clients_select_member on public.clients;
create policy clients_select_member on public.clients
  for select using (public.is_client_member(id));

drop policy if exists clients_insert_self on public.clients;
create policy clients_insert_self on public.clients
  for insert with check (auth.uid() = owner_id);

drop policy if exists clients_update_owner on public.clients;
create policy clients_update_owner on public.clients
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists clients_delete_owner on public.clients;
create policy clients_delete_owner on public.clients
  for delete using (auth.uid() = owner_id);

-- ---- client_members ---------------------------------------------------

drop policy if exists members_select on public.client_members;
create policy members_select on public.client_members
  for select using (
    user_id = auth.uid()
    or exists (
      select 1 from public.clients c
      where c.id = client_id and c.owner_id = auth.uid()
    )
  );

drop policy if exists members_insert_owner on public.client_members;
create policy members_insert_owner on public.client_members
  for insert with check (
    exists (
      select 1 from public.clients c
      where c.id = client_id and c.owner_id = auth.uid()
    )
  );

drop policy if exists members_delete_owner on public.client_members;
create policy members_delete_owner on public.client_members
  for delete using (
    exists (
      select 1 from public.clients c
      where c.id = client_id and c.owner_id = auth.uid()
    )
  );

-- ---- sites ------------------------------------------------------------

drop policy if exists sites_select_member on public.sites;
create policy sites_select_member on public.sites
  for select using (public.is_client_member(client_id));

drop policy if exists sites_insert_member on public.sites;
create policy sites_insert_member on public.sites
  for insert with check (public.is_client_member(client_id));

drop policy if exists sites_update_member on public.sites;
create policy sites_update_member on public.sites
  for update using (public.is_client_member(client_id))
  with check (public.is_client_member(client_id));

drop policy if exists sites_delete_member on public.sites;
create policy sites_delete_member on public.sites
  for delete using (public.is_client_member(client_id));

-- ---- bias -------------------------------------------------------------

drop policy if exists bias_select_member on public.bias;
create policy bias_select_member on public.bias
  for select using (
    public.is_client_member((select client_id from public.sites s where s.id = site_id))
  );

drop policy if exists bias_insert_member on public.bias;
create policy bias_insert_member on public.bias
  for insert with check (
    public.is_client_member((select client_id from public.sites s where s.id = site_id))
  );

drop policy if exists bias_update_member on public.bias;
create policy bias_update_member on public.bias
  for update using (
    public.is_client_member((select client_id from public.sites s where s.id = site_id))
  )
  with check (
    public.is_client_member((select client_id from public.sites s where s.id = site_id))
  );

drop policy if exists bias_delete_member on public.bias;
create policy bias_delete_member on public.bias
  for delete using (
    public.is_client_member((select client_id from public.sites s where s.id = site_id))
  );
