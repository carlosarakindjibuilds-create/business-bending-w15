create table if not exists public.waitlist_leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  company_name text not null,
  rfc text not null,
  route_count integer not null,
  whatsapp text not null,
  created_at timestamptz not null default now(),
  constraint waitlist_company_name_length
    check (char_length(btrim(company_name)) between 2 and 80),
  constraint waitlist_rfc_format
    check (rfc = upper(rfc) and rfc ~ '^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$'),
  constraint waitlist_route_count_range
    check (route_count between 1 and 500),
  constraint waitlist_whatsapp_format
    check (whatsapp ~ '^[0-9]{10}$')
);

alter table public.waitlist_leads enable row level security;

revoke all on table public.waitlist_leads from public, anon, authenticated;
grant select, insert on table public.waitlist_leads to authenticated;

drop policy if exists "Google users read their own waitlist lead"
  on public.waitlist_leads;
create policy "Google users read their own waitlist lead"
  on public.waitlist_leads
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    and (select auth.jwt() -> 'app_metadata' ->> 'provider') = 'google'
  );

drop policy if exists "Google users insert their own waitlist lead"
  on public.waitlist_leads;
create policy "Google users insert their own waitlist lead"
  on public.waitlist_leads
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and (select auth.jwt() -> 'app_metadata' ->> 'provider') = 'google'
  );
