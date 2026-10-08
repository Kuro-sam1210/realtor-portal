-- A member has exactly one premium-star, fixed at sign-up.
--
-- The single premium_star_id column already means nobody can have two uplines.
-- What was missing is permanence: without this, an update could move a member
-- to a different premium-star, or hand the same member to a second one, which
-- would rewrite who earns commission on their sales.

create function public.freeze_premium_star()
returns trigger
language plpgsql
as $$
begin
  if old.premium_star_id is distinct from new.premium_star_id then
    raise exception 'A member keeps the premium-star they joined with; it cannot be changed.';
  end if;
  return new;
end;
$$;

create trigger premium_star_is_permanent
  before update on public.profiles
  for each row execute function public.freeze_premium_star();

-- A member cannot be their own premium-star.
alter table public.profiles
  add constraint premium_star_is_not_self check (premium_star_id is distinct from id);
