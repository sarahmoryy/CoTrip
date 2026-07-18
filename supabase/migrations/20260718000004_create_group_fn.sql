-- Security-definer function for creating a group, bypasses RLS entirely.
-- auth.uid() is called inside the function where the session context is
-- available from the JWT, so ownership is set correctly server-side.
create or replace function public.create_group(group_name text, group_description text)
returns table(id uuid, name text, description text, owner_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  insert into public.groups (name, description, owner_id)
  values (group_name, group_description, auth.uid())
  returning public.groups.id into new_id;

  return query
    select g.id, g.name, g.description, g.owner_id
    from public.groups g
    where g.id = new_id;
end;
$$;

grant execute on function public.create_group(text, text) to authenticated;
