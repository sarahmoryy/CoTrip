-- CoTrip initial schema: profiles, trips, cars
-- Mirrors the ownership model from firestore.rules: every row is owned by
-- exactly one auth user, readable/writable only by that user.

-- ---------- profiles ----------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  phone text not null default '',
  address text not null default ''
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- Auto-create a profile row when a new auth user signs up, reading
-- full_name from the signup call's options.data (see UserService.signup).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.email, '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- shared updated_at trigger ----------
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- trips ----------
create table public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  destination text not null,
  date text not null,
  from_location_name text,
  to_location_name text,
  from_location text,
  to_location text,
  passengers text,
  car_id text,
  car_name text,
  cost numeric,
  savings numeric,
  distance numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.trips enable row level security;

create policy "trips_select_own" on public.trips
  for select using (auth.uid() = user_id);
create policy "trips_insert_own" on public.trips
  for insert with check (auth.uid() = user_id);
create policy "trips_update_own" on public.trips
  for update using (auth.uid() = user_id);
create policy "trips_delete_own" on public.trips
  for delete using (auth.uid() = user_id);

create trigger trips_set_updated_at
  before update on public.trips
  for each row execute procedure public.set_updated_at();

-- ---------- cars ----------
create table public.cars (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  make text not null,
  model text not null,
  year int,
  license_plate text,
  consumption_l_100km numeric,
  fuel_efficiency numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.cars enable row level security;

create policy "cars_select_own" on public.cars
  for select using (auth.uid() = user_id);
create policy "cars_insert_own" on public.cars
  for insert with check (auth.uid() = user_id);
create policy "cars_update_own" on public.cars
  for update using (auth.uid() = user_id);
create policy "cars_delete_own" on public.cars
  for delete using (auth.uid() = user_id);

create trigger cars_set_updated_at
  before update on public.cars
  for each row execute procedure public.set_updated_at();
