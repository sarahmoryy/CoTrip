-- Friend requests table (pending → accepted/declined before connection is created)
create table public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  receiver_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  unique(sender_id, receiver_id)
);

alter table public.friend_requests enable row level security;

create policy "friend_requests_select" on public.friend_requests for select using (
  auth.uid() = sender_id or auth.uid() = receiver_id
);
create policy "friend_requests_insert" on public.friend_requests for insert with check (
  auth.uid() = sender_id
);
create policy "friend_requests_update" on public.friend_requests for update using (
  auth.uid() = receiver_id
);
create policy "friend_requests_delete" on public.friend_requests for delete using (
  auth.uid() = sender_id or auth.uid() = receiver_id
);

-- Accepts a pending request: updates status and inserts both connection directions
create or replace function public.accept_friend_request(request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  req record;
  sender_profile record;
  receiver_profile record;
begin
  select * into req
    from public.friend_requests
    where id = request_id and receiver_id = auth.uid() and status = 'pending';
  if not found then
    raise exception 'Request not found or not authorized';
  end if;

  select * into sender_profile from public.profiles where id = req.sender_id;
  select * into receiver_profile from public.profiles where id = req.receiver_id;

  update public.friend_requests set status = 'accepted' where id = request_id;

  insert into public.connections (user_id, friend_id, friend_email, friend_name)
  values
    (req.receiver_id, req.sender_id, sender_profile.email, coalesce(nullif(sender_profile.full_name,''), sender_profile.email)),
    (req.sender_id, req.receiver_id, receiver_profile.email, coalesce(nullif(receiver_profile.full_name,''), receiver_profile.email))
  on conflict do nothing;
end;
$$;

grant execute on function public.accept_friend_request(uuid) to authenticated;

-- Enable real-time for friend_requests
alter publication supabase_realtime add table public.friend_requests;
