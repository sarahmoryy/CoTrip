-- Social tables: groups, group_members, rides, ride_requests, connections

-- ---------- groups ----------
create table public.groups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  description text not null default '',
  created_at timestamptz not null default now()
);

alter table public.groups enable row level security;

-- ---------- group_members (must exist before groups_select policy) ----------
create table public.group_members (
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null default '',
  display_name text not null default '',
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

alter table public.group_members enable row level security;

-- ---------- groups policies ----------
create policy "groups_select" on public.groups for select using (
  auth.uid() = owner_id
  or exists (
    select 1 from public.group_members gm
    where gm.group_id = groups.id and gm.user_id = auth.uid()
  )
);
create policy "groups_insert" on public.groups for insert with check (auth.uid() = owner_id);
create policy "groups_update" on public.groups for update using (auth.uid() = owner_id);
create policy "groups_delete" on public.groups for delete using (auth.uid() = owner_id);

-- ---------- group_members policies ----------
create policy "group_members_select" on public.group_members for select using (
  user_id = auth.uid()
  or exists (
    select 1 from public.groups g
    where g.id = group_members.group_id and g.owner_id = auth.uid()
  )
);
create policy "group_members_insert" on public.group_members for insert with check (
  exists (
    select 1 from public.groups g
    where g.id = group_members.group_id and g.owner_id = auth.uid()
  )
  or user_id = auth.uid()
);
create policy "group_members_delete" on public.group_members for delete using (
  exists (
    select 1 from public.groups g
    where g.id = group_members.group_id and g.owner_id = auth.uid()
  )
  or user_id = auth.uid()
);

-- ---------- rides (shared rides offered by drivers) ----------
create table public.rides (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  group_id uuid references public.groups(id) on delete set null,
  vehicle text not null default '',
  origin text not null,
  destination text not null,
  departure_time text not null default 'TBD',
  date text not null,
  approximate_cost numeric default 0,
  seats_total int default 4,
  seats_left int default 3,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

alter table public.rides enable row level security;

create policy "rides_select" on public.rides for select using (true);
create policy "rides_insert" on public.rides for insert with check (auth.uid() = driver_id);
create policy "rides_update" on public.rides for update using (auth.uid() = driver_id);
create policy "rides_delete" on public.rides for delete using (auth.uid() = driver_id);

-- ---------- ride_requests ----------
create table public.ride_requests (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references public.rides(id) on delete cascade,
  rider_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  pickup_point text not null default '',
  dropoff_point text not null default '',
  expected_total_cost numeric default 0,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.ride_requests enable row level security;

create policy "ride_requests_select" on public.ride_requests for select using (
  auth.uid() = rider_id
  or exists (
    select 1 from public.rides r
    where r.id = ride_requests.ride_id and r.driver_id = auth.uid()
  )
);
create policy "ride_requests_insert" on public.ride_requests for insert with check (auth.uid() = rider_id);
create policy "ride_requests_update" on public.ride_requests for update using (
  auth.uid() = rider_id
  or exists (
    select 1 from public.rides r
    where r.id = ride_requests.ride_id and r.driver_id = auth.uid()
  )
);

-- ---------- connections (friends) ----------
create table public.connections (
  user_id uuid not null references auth.users(id) on delete cascade,
  friend_id uuid not null references auth.users(id) on delete cascade,
  friend_email text not null default '',
  friend_name text not null default '',
  created_at timestamptz not null default now(),
  primary key (user_id, friend_id)
);

alter table public.connections enable row level security;

create policy "connections_select" on public.connections for select using (auth.uid() = user_id);
create policy "connections_insert" on public.connections for insert with check (auth.uid() = user_id);
create policy "connections_delete" on public.connections for delete using (auth.uid() = user_id);
