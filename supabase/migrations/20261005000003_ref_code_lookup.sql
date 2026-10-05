-- Referral code of a freshly created member, so the welcome mail can quote it.
-- The code is public by design: it is the ?ref= value in every referral link.

create function public.ref_code_for_user(uid uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select ref_code from profiles where id = uid;
$$;

revoke execute on function public.ref_code_for_user(uuid) from public;
grant execute on function public.ref_code_for_user(uuid) to anon, authenticated;
