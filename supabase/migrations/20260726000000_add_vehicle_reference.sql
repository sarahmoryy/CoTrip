-- EPA fuel-economy reference data (make/model/year -> combined fuel economy).
-- Public reference data: readable by anyone via the API, writable only via
-- the service role (bulk-loaded by scripts/importVehicles.js).

create table public.vehicle_reference (
  id bigint generated always as identity primary key,
  make text not null,
  model text not null,
  year int not null,
  comb_mpg numeric,
  combined_l_100km numeric
);

create index vehicle_reference_make_idx on public.vehicle_reference (make);
create index vehicle_reference_make_model_idx on public.vehicle_reference (make, model);
create index vehicle_reference_lookup_idx on public.vehicle_reference (make, model, year);

alter table public.vehicle_reference enable row level security;

create policy "vehicle_reference_select_all" on public.vehicle_reference
  for select using (true);

-- ---------- lookup functions ----------
-- Prefix matches are ranked ahead of plain substring matches.

create function public.vehicle_makes(search text default '')
returns table (make text)
language sql stable
as $$
  select s.make from (
    select distinct v.make, (v.make ilike search || '%') as is_prefix
    from public.vehicle_reference v
    where search = '' or v.make ilike '%' || search || '%'
  ) s
  order by s.is_prefix desc, s.make
  limit 20;
$$;

create function public.vehicle_models(p_make text, search text default '')
returns table (model text)
language sql stable
as $$
  select s.model from (
    select distinct v.model, (v.model ilike search || '%') as is_prefix
    from public.vehicle_reference v
    where v.make = p_make
      and (search = '' or v.model ilike '%' || search || '%')
  ) s
  order by s.is_prefix desc, s.model
  limit 20;
$$;

create function public.vehicle_years(p_make text, p_model text)
returns table (year int)
language sql stable
as $$
  select distinct v.year
  from public.vehicle_reference v
  where v.make = p_make and v.model = p_model
  order by v.year desc;
$$;

create function public.vehicle_consumption(p_make text, p_model text, p_year int)
returns numeric
language sql stable
as $$
  select v.combined_l_100km
  from public.vehicle_reference v
  where v.make = p_make and v.model = p_model and v.year = p_year
  order by v.id
  limit 1;
$$;

grant execute on function public.vehicle_makes(text) to anon, authenticated;
grant execute on function public.vehicle_models(text, text) to anon, authenticated;
grant execute on function public.vehicle_years(text, text) to anon, authenticated;
grant execute on function public.vehicle_consumption(text, text, int) to anon, authenticated;
