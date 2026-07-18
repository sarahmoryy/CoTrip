-- Fix infinite recursion between groups_select and group_members_select.
-- Both policies referenced each other, causing 42P17.
-- Solution: a security-definer function bypasses RLS when checking membership,
-- breaking the cycle.

create or replace function public.is_group_member_or_owner(gid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.groups where id = gid and owner_id = auth.uid()
  ) or exists (
    select 1 from public.group_members where group_id = gid and user_id = auth.uid()
  );
$$;

grant execute on function public.is_group_member_or_owner(uuid) to authenticated;

-- Recreate groups policies using the function
drop policy if exists "groups_select" on public.groups;
create policy "groups_select" on public.groups for select using (
  is_group_member_or_owner(id)
);

-- Recreate group_members policies using the function
drop policy if exists "group_members_select" on public.group_members;
create policy "group_members_select" on public.group_members for select using (
  is_group_member_or_owner(group_id)
);

drop policy if exists "group_members_insert" on public.group_members;
create policy "group_members_insert" on public.group_members for insert with check (
  is_group_member_or_owner(group_id) or user_id = auth.uid()
);

drop policy if exists "group_members_delete" on public.group_members;
create policy "group_members_delete" on public.group_members for delete using (
  is_group_member_or_owner(group_id) or user_id = auth.uid()
);
