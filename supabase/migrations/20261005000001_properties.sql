-- Estates on offer, listed on every member's dashboard.

create table public.properties (
  id bigint generated always as identity primary key,
  name text not null,
  status text not null default 'Selling' check (status in ('Selling', 'Sold Out', 'Coming Soon')),
  price numeric(14, 2) not null check (price > 0),
  location text not null,
  created_at timestamptz not null default now()
);
create index properties_created_at_idx on public.properties (created_at desc);

alter table public.properties enable row level security;

revoke all on public.properties from anon, authenticated;
grant select, insert, update, delete on public.properties to authenticated;

create policy "members read properties" on public.properties
  for select to authenticated using (true);
create policy "admin writes properties" on public.properties
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
