-- Security-definer function so authenticated users can look up any profile by
-- email without the profiles RLS policy blocking cross-user reads.
create or replace function public.find_profile_by_email(lookup_email text)
returns table(id uuid, full_name text, email text)
language sql
security definer
set search_path = public
as $$
  select id, full_name, email
  from public.profiles
  where email = lookup_email
  limit 1;
$$;

grant execute on function public.find_profile_by_email(text) to authenticated;
