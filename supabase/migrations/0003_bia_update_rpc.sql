-- Update RPC for BIA data. Caller-checked, SECURITY DEFINER, idempotent.

create or replace function public.update_bia_data_for_caller(
  p_client_slug text,
  p_site_slug   text,
  p_bia_slug    text,
  p_data        jsonb
)
returns public.bias
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_id        uuid;
  target_bia_id    uuid;
  target_client_id uuid;
  updated          public.bias;
begin
  caller_id := auth.uid();
  if caller_id is null then
    raise exception 'not authenticated' using errcode = 'P0001';
  end if;

  select b.id, s.client_id
    into target_bia_id, target_client_id
  from public.bias b
  join public.sites s on s.id = b.site_id
  join public.clients c on c.id = s.client_id
  where c.slug = p_client_slug
    and s.slug = p_site_slug
    and b.slug = p_bia_slug;

  if target_bia_id is null then
    raise exception 'bia not found' using errcode = 'P0002';
  end if;

  if not exists (
    select 1 from public.client_members
    where client_id = target_client_id and user_id = caller_id
  ) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  update public.bias
     set data = coalesce(p_data, '{}'::jsonb)
   where id = target_bia_id
   returning * into updated;

  return updated;
end;
$$;

revoke all on function public.update_bia_data_for_caller(text, text, text, jsonb) from public;
grant execute on function public.update_bia_data_for_caller(text, text, text, jsonb) to authenticated;
