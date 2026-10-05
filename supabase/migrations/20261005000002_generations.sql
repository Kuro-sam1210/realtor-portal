-- The three generations of premium-lines below a member, for the downlines page.

create function public.my_premium_generations()
returns table (
  generation int,
  id uuid,
  full_name text,
  email text,
  phone text,
  date_of_birth date,
  ref_code text
)
language sql
stable
security definer
set search_path = public
as $$
  with recursive tree as (
    select p.id, 1 as generation
    from profiles p
    where p.premium_star_id = auth.uid()
    union all
    select c.id, t.generation + 1
    from profiles c
    join tree t on c.premium_star_id = t.id
    where t.generation < 3
  )
  select t.generation, p.id, p.full_name, p.email, p.phone, p.date_of_birth, p.ref_code
  from tree t
  join profiles p on p.id = t.id
  order by t.generation, p.created_at;
$$;

revoke execute on function public.my_premium_generations() from public, anon;
grant execute on function public.my_premium_generations() to authenticated;
