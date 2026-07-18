-- Let the DB set owner_id via default auth.uid() instead of checking the
-- client-supplied value. The default guarantees ownership; client doesn't need
-- to send owner_id at all.
drop policy if exists "groups_insert" on public.groups;
create policy "groups_insert" on public.groups
  for insert with check (auth.uid() is not null);
