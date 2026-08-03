-- The live "Add car" picker needs full make/model lists (not just a
-- top-20 typeahead), so add a max_rows override to the existing lookup
-- functions instead of introducing parallel ones.

drop function if exists public.vehicle_makes(text);
drop function if exists public.vehicle_models(text, text);

create function public.vehicle_makes(search text default '', max_rows int default 20)
returns table (make text)
language sql stable
as $$
  select s.make from (
    select distinct v.make, (v.make ilike search || '%') as is_prefix
    from public.vehicle_reference v
    where search = '' or v.make ilike '%' || search || '%'
  ) s
  order by s.is_prefix desc, s.make
  limit max_rows;
$$;

create function public.vehicle_models(p_make text, search text default '', max_rows int default 20)
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
  limit max_rows;
$$;

grant execute on function public.vehicle_makes(text, int) to anon, authenticated;
grant execute on function public.vehicle_models(text, text, int) to anon, authenticated;
