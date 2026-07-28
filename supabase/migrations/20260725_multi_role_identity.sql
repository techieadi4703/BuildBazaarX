-- =============================================================================
-- BuildBazaarX — Multi-Role Identity Migration
-- Goal: one auth user may hold several portal roles simultaneously
--       (customer + supplier + designer + professional).
--
-- SAFE TO RUN ON PRODUCTION: this migration is purely additive.
-- It does NOT drop profiles.role. Nothing breaks until you deploy the
-- frontend changes in step 2 of the rollout.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. Role membership table
-- -----------------------------------------------------------------------------
create table if not exists public.user_roles (
  user_id     uuid        not null references auth.users(id) on delete cascade,
  role        text        not null,
  created_at  timestamptz not null default now(),
  primary key (user_id, role),
  constraint user_roles_role_valid
    check (role in ('customer','professional','designer','supplier','admin'))
);

create index if not exists user_roles_user_id_idx on public.user_roles (user_id);

alter table public.user_roles enable row level security;

-- Users may read their own roles. Nobody may write via the API —
-- all writes go through the SECURITY DEFINER functions below or service_role.
drop policy if exists "Users can read own roles" on public.user_roles;
create policy "Users can read own roles"
  on public.user_roles for select
  using (auth.uid() = user_id);


-- -----------------------------------------------------------------------------
-- 2. Backfill from existing data
--    Order matters: profiles.role first, then the specialised tables, so a
--    user who is (say) both customer and designer ends up with both rows.
-- -----------------------------------------------------------------------------

-- 2a. From profiles.role. Legacy value 'user' maps to 'customer'.
insert into public.user_roles (user_id, role)
select p.id,
       case when p.role in ('customer','professional','designer','supplier','admin')
            then p.role
            else 'customer'
       end
from public.profiles p
where p.role is not null
on conflict (user_id, role) do nothing;

-- 2b. From the specialised identity tables (authoritative signal).
insert into public.user_roles (user_id, role)
select id, 'designer' from public.designers
on conflict (user_id, role) do nothing;

insert into public.user_roles (user_id, role)
select id, 'supplier' from public.suppliers
on conflict (user_id, role) do nothing;

insert into public.user_roles (user_id, role)
select id, 'professional' from public.professionals
on conflict (user_id, role) do nothing;

insert into public.user_roles (user_id, role)
select id, 'customer' from public.customers
on conflict (user_id, role) do nothing;

-- 2c. OPTIONAL — grant every existing account the 'customer' role so any
--     supplier/designer can immediately shop on the main site.
--     This is a PRODUCT decision, not a technical one. Uncomment if you
--     want it; otherwise the role is granted lazily on first main-site visit.
--
-- insert into public.user_roles (user_id, role)
-- select id, 'customer' from auth.users
-- on conflict (user_id, role) do nothing;


-- -----------------------------------------------------------------------------
-- 3. has_role() — the single predicate every portal and RLS policy uses.
--    SECURITY DEFINER so RLS policies on user_roles don't recurse.
-- -----------------------------------------------------------------------------
create or replace function public.has_role(
  p_role    text,
  p_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = p_user_id and role = p_role
  );
$$;

grant execute on function public.has_role(text, uuid) to authenticated, anon;


-- -----------------------------------------------------------------------------
-- 4. grant_self_role() — lets a logged-in user attach a new portal role.
--    This is what the seller/designer/professional onboarding calls when an
--    EXISTING account (e.g. a customer) signs up on a second portal.
--    'admin' is deliberately not self-assignable.
-- -----------------------------------------------------------------------------
create or replace function public.grant_self_role(p_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if p_role not in ('customer','professional','designer','supplier') then
    raise exception 'Role % cannot be self-assigned', p_role
      using errcode = '42501';
  end if;

  insert into public.user_roles (user_id, role)
  values (auth.uid(), p_role)
  on conflict (user_id, role) do nothing;
end;
$$;

revoke all on function public.grant_self_role(text) from public, anon;
grant execute on function public.grant_self_role(text) to authenticated;


-- -----------------------------------------------------------------------------
-- 5. my_roles() — one round-trip role fetch for AuthContext.
-- -----------------------------------------------------------------------------
create or replace function public.my_roles()
returns text[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(array_agg(role order by role), array[]::text[])
  from public.user_roles
  where user_id = auth.uid();
$$;

grant execute on function public.my_roles() to authenticated;


-- -----------------------------------------------------------------------------
-- 6. Replace the auth trigger.
--    KEY CHANGE: it no longer overwrites profiles.role. It appends to
--    user_roles instead, so signing up on a second portal is additive.
-- -----------------------------------------------------------------------------
create or replace function public.sync_profile_from_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  resolved_role      text;
  resolved_full_name text;
  resolved_phone     text;
begin
  resolved_role      := lower(coalesce(new.raw_user_meta_data ->> 'role', 'customer'));
  resolved_full_name := nullif(new.raw_user_meta_data ->> 'full_name', '');
  resolved_phone     := nullif(new.raw_user_meta_data ->> 'phone', '');

  if resolved_role not in ('customer','professional','designer','supplier') then
    resolved_role := 'customer';
  end if;

  -- profiles is now pure identity: name, phone, email. No role authority.
  insert into public.profiles (id, full_name, phone, email)
  values (new.id, resolved_full_name, resolved_phone, new.email)
  on conflict (id) do update
  set full_name = coalesce(excluded.full_name, public.profiles.full_name),
      phone     = coalesce(excluded.phone,     public.profiles.phone),
      email     = coalesce(excluded.email,     public.profiles.email);
      -- role intentionally NOT touched

  -- Role membership is append-only.
  insert into public.user_roles (user_id, role)
  values (new.id, resolved_role)
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

-- Trigger definition is unchanged; recreated for idempotency.
drop trigger if exists zzz_sync_profile_from_auth_user on auth.users;
create trigger zzz_sync_profile_from_auth_user
after insert or update of email, raw_user_meta_data
on auth.users
for each row
execute function public.sync_profile_from_auth_user();
