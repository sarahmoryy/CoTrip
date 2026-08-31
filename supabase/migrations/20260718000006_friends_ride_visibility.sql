-- Returns true if auth.uid() and other_id have a connection in either direction
create or replace function public.are_friends(other_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.connections
    where (user_id = auth.uid() and friend_id = other_id)
       or (user_id = other_id and friend_id = auth.uid())
  );
$$;

-- Replace open rides_select with friends-only visibility
drop policy if exists "rides_select" on public.rides;
create policy "rides_select" on public.rides for select using (
  auth.uid() = driver_id
  or public.are_friends(driver_id)
);
