-- =============================================================================
-- BuildBazaarX — Admin role management
-- Builds on 20260725_multi_role_identity.sql (user_roles + my_roles/has_role/
-- grant_self_role). Adds the ability for ADMINS to read every user's roles and
-- to grant/revoke roles on OTHER users (grant_self_role is self-only and refuses
-- 'admin', so admin tooling needs these).
--
-- SAFE TO RUN ON PRODUCTION: purely additive. Apply BEFORE deploying the admin
-- frontend changes, otherwise the admin pages call functions that don't exist yet.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. Admins may READ every user's roles.
--    has_role() is SECURITY DEFINER, so it bypasses RLS internally and this
--    policy does NOT recurse. Non-admins keep the existing "read own roles" policy.
-- -----------------------------------------------------------------------------
drop policy if exists "Admins can read all roles" on public.user_roles;
create policy "Admins can read all roles"
  on public.user_roles for select
  to authenticated
  using ( public.has_role('admin') );


-- -----------------------------------------------------------------------------
-- 2. admin_grant_role() — grant any role to any user. Caller must ALREADY be an
--    admin. Unlike grant_self_role (self-only, refuses 'admin'), this permits
--    granting 'admin' precisely because the caller is already trusted.
-- -----------------------------------------------------------------------------
create or replace function public.admin_grant_role(p_user_id uuid, p_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_role('admin') then
    raise exception 'Only admins may grant roles' using errcode = '42501';
  end if;
  if p_role not in ('customer','professional','designer','supplier','admin') then
    raise exception 'Invalid role: %', p_role using errcode = '22023';
  end if;
  insert into public.user_roles (user_id, role)
  values (p_user_id, p_role)
  on conflict (user_id, role) do nothing;
end;
$$;


-- -----------------------------------------------------------------------------
-- 3. admin_revoke_role() — revoke a role. Caller must be an admin, and may not
--    strip their OWN admin role (prevents accidental self-lockout).
-- -----------------------------------------------------------------------------
create or replace function public.admin_revoke_role(p_user_id uuid, p_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_role('admin') then
    raise exception 'Only admins may revoke roles' using errcode = '42501';
  end if;
  if p_role = 'admin' and p_user_id = auth.uid() then
    raise exception 'You cannot revoke your own admin role';
  end if;
  delete from public.user_roles
  where user_id = p_user_id and role = p_role;
end;
$$;


revoke all on function public.admin_grant_role(uuid, text)  from public, anon;
revoke all on function public.admin_revoke_role(uuid, text) from public, anon;
grant execute on function public.admin_grant_role(uuid, text)  to authenticated;
grant execute on function public.admin_revoke_role(uuid, text) to authenticated;


-- -----------------------------------------------------------------------------
-- Verification (run as an admin session, then a non-admin):
--   select public.admin_grant_role('<user-uuid>', 'supplier');
--   select role from public.user_roles where user_id = '<user-uuid>';   -- has supplier
--   select public.admin_revoke_role('<user-uuid>', 'supplier');
--   -- non-admin: both raise 'Only admins may grant/revoke roles'
-- -----------------------------------------------------------------------------
