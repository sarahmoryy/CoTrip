-- Security-definer function so a driver can look up profiles for riders
-- who submitted requests, bypassing the own-only RLS on profiles.
create or replace function public.get_profiles_by_ids(ids uuid[])
returns table(id uuid, full_name text, email text)
language sql
security definer
set search_path = public
as $$
  select id, full_name, email
  from public.profiles
  where id = any(ids);
$$;

grant execute on function public.get_profiles_by_ids(uuid[]) to authenticated;
