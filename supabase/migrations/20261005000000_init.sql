-- Realtor group portal: members, premium-star / premium-line links, sales, commissions.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  city text,
  date_of_birth date,
  state_of_origin text,
  gender text,
  country text,
  bank_name text,
  account_name text,
  account_number text,
  ref_code text not null unique,
  -- The member whose link this member joined with (their boss).
  premium_star_id uuid references public.profiles (id),
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);
create index profiles_premium_star_id_idx on public.profiles (premium_star_id);

create table public.settings (
  id boolean primary key default true check (id),
  commission_percent numeric(5, 2) not null check (commission_percent >= 0 and commission_percent <= 100)
);
-- Placeholder rate: change it from the admin page.
insert into public.settings (commission_percent) values (5);

create table public.notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);
create index notifications_user_id_idx on public.notifications (user_id, created_at desc);

create table public.sales (
  id bigint generated always as identity primary key,
  seller_id uuid not null references public.profiles (id),
  property_type text not null check (property_type in ('land', 'house')),
  description text not null,
  amount numeric(14, 2) not null check (amount > 0),
  sold_on date not null default current_date,
  recorded_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);
create index sales_seller_id_idx on public.sales (seller_id);

create table public.commissions (
  id bigint generated always as identity primary key,
  sale_id bigint not null unique references public.sales (id),
  beneficiary_id uuid not null references public.profiles (id),
  seller_id uuid not null references public.profiles (id),
  rate_percent numeric(5, 2) not null,
  amount numeric(14, 2) not null,
  created_at timestamptz not null default now()
);
create index commissions_beneficiary_id_idx on public.commissions (beneficiary_id);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select is_admin from profiles where id = auth.uid()), false);
$$;

-- Name behind a referral code, shown on the sign-up page.
create function public.ref_owner(code text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select full_name from profiles where ref_code = code;
$$;

create function public.my_premium_star()
returns table (full_name text, email text, phone text)
language sql
stable
security definer
set search_path = public
as $$
  select s.full_name, s.email, s.phone
  from profiles me
  join profiles s on s.id = me.premium_star_id
  where me.id = auth.uid();
$$;

create function public.my_premium_lines()
returns table (id uuid, full_name text, email text, phone text, city text, created_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.full_name, p.email, p.phone, p.city, p.created_at
  from profiles p
  where p.premium_star_id = auth.uid()
  order by p.created_at desc;
$$;

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

-- Creates the profile from sign-up metadata, links the premium-star and notifies them.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  star_id uuid;
  code text;
begin
  select id into star_id from profiles where ref_code = nullif(meta ->> 'ref', '');

  loop
    code := (100000 + floor(random() * 900000))::int::text;
    exit when not exists (select 1 from profiles where ref_code = code);
  end loop;

  insert into profiles (
    id, full_name, email, phone, city, date_of_birth, state_of_origin, gender, country,
    bank_name, account_name, account_number, ref_code, premium_star_id
  ) values (
    new.id,
    coalesce(nullif(meta ->> 'full_name', ''), new.email),
    new.email,
    nullif(meta ->> 'phone', ''),
    nullif(meta ->> 'city', ''),
    nullif(meta ->> 'date_of_birth', '')::date,
    nullif(meta ->> 'state_of_origin', ''),
    nullif(meta ->> 'gender', ''),
    nullif(meta ->> 'country', ''),
    nullif(meta ->> 'bank_name', ''),
    nullif(meta ->> 'account_name', ''),
    nullif(meta ->> 'account_number', ''),
    code,
    star_id
  );

  if star_id is not null then
    insert into notifications (user_id, body)
    values (
      star_id,
      coalesce(nullif(meta ->> 'full_name', ''), new.email) || ' joined with your link and is now your premium-line.'
    );
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Credits the seller's premium-star when a sale is recorded.
create function public.handle_new_sale()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  star_id uuid;
  seller_name text;
  rate numeric(5, 2);
  earned numeric(14, 2);
begin
  select premium_star_id, full_name into star_id, seller_name from profiles where id = new.seller_id;
  if star_id is null then
    return new;
  end if;

  select commission_percent into rate from settings;
  earned := round(new.amount * rate / 100, 2);

  insert into commissions (sale_id, beneficiary_id, seller_id, rate_percent, amount)
  values (new.id, star_id, new.seller_id, rate, earned);

  insert into notifications (user_id, body)
  values (
    star_id,
    seller_name || ' sold a ' || new.property_type || ' for ' || to_char(new.amount, 'FM999,999,999,990.00')
      || '. Your commission: ' || to_char(earned, 'FM999,999,999,990.00') || ' (' || rate || '%).'
  );

  return new;
end;
$$;

create trigger on_sale_recorded
  after insert on public.sales
  for each row execute function public.handle_new_sale();

-- ---------------------------------------------------------------------------
-- Access
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.settings enable row level security;
alter table public.notifications enable row level security;
alter table public.sales enable row level security;
alter table public.commissions enable row level security;

revoke all on public.profiles, public.settings, public.notifications, public.sales, public.commissions
  from anon, authenticated;
grant select on public.profiles, public.settings, public.notifications, public.sales, public.commissions
  to authenticated;
grant insert on public.sales to authenticated;
grant update (commission_percent) on public.settings to authenticated;

create policy "own profile or admin" on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_admin());

create policy "members read rate" on public.settings
  for select to authenticated using (true);
create policy "admin sets rate" on public.settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "own notifications" on public.notifications
  for select to authenticated using (user_id = auth.uid());

create policy "own sales or admin" on public.sales
  for select to authenticated using (seller_id = auth.uid() or public.is_admin());
create policy "admin records sales" on public.sales
  for insert to authenticated with check (public.is_admin() and recorded_by = auth.uid());

create policy "own commissions or admin" on public.commissions
  for select to authenticated using (beneficiary_id = auth.uid() or public.is_admin());

revoke execute on function public.handle_new_user(), public.handle_new_sale() from public, anon, authenticated;
revoke execute on function public.is_admin(), public.my_premium_star(), public.my_premium_lines() from public, anon;
grant execute on function public.is_admin(), public.my_premium_star(), public.my_premium_lines() to authenticated;
grant execute on function public.ref_owner(text) to anon, authenticated;
