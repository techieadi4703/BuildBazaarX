ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email text;

ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS email text;

ALTER TABLE public.professionals
ADD COLUMN IF NOT EXISTS email text;

CREATE OR REPLACE FUNCTION public.sync_profile_from_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  resolved_role text;
  resolved_full_name text;
  resolved_phone text;
BEGIN
  resolved_role := lower(COALESCE(NEW.raw_user_meta_data ->> 'role', 'customer'));
  resolved_full_name := NULLIF(NEW.raw_user_meta_data ->> 'full_name', '');
  resolved_phone := NULLIF(NEW.raw_user_meta_data ->> 'phone', '');

  IF resolved_role = 'user' OR resolved_role IS NULL OR resolved_role = '' THEN
    resolved_role := 'customer';
  END IF;

  IF resolved_role NOT IN ('customer', 'professional', 'designer', 'supplier', 'admin') THEN
    resolved_role := 'customer';
  END IF;

  INSERT INTO public.profiles (id, full_name, phone, email, role)
  VALUES (NEW.id, resolved_full_name, resolved_phone, NEW.email, resolved_role)
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    email = COALESCE(EXCLUDED.email, public.profiles.email),
    role = CASE
      WHEN public.profiles.role IS NULL OR public.profiles.role = 'user' THEN EXCLUDED.role
      ELSE public.profiles.role
    END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS zzz_sync_profile_from_auth_user ON auth.users;

CREATE TRIGGER zzz_sync_profile_from_auth_user
AFTER INSERT OR UPDATE OF email, raw_user_meta_data
ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.sync_profile_from_auth_user();

UPDATE public.profiles AS p
SET
  full_name = COALESCE(p.full_name, c.full_name),
  phone = COALESCE(p.phone, c.phone),
  email = COALESCE(p.email, c.email, au.email),
  role = 'customer'
FROM public.customers AS c
LEFT JOIN auth.users AS au ON au.id = c.id
WHERE p.id = c.id
  AND NOT EXISTS (SELECT 1 FROM public.professionals pr WHERE pr.id = p.id)
  AND NOT EXISTS (SELECT 1 FROM public.designers d WHERE d.id = p.id)
  AND NOT EXISTS (SELECT 1 FROM public.suppliers s WHERE s.id = p.id)
  AND (p.role IS NULL OR p.role = 'user' OR p.role = 'customer');

UPDATE public.profiles AS p
SET
  full_name = COALESCE(p.full_name, pr.full_name),
  phone = COALESCE(p.phone, pr.phone),
  email = COALESCE(p.email, pr.email, au.email),
  role = 'professional'
FROM public.professionals AS pr
LEFT JOIN auth.users AS au ON au.id = pr.id
WHERE p.id = pr.id;

UPDATE public.profiles AS p
SET
  full_name = COALESCE(p.full_name, d.full_name),
  phone = COALESCE(p.phone, d.phone),
  email = COALESCE(p.email, d.email, au.email),
  role = 'designer'
FROM public.designers AS d
LEFT JOIN auth.users AS au ON au.id = d.id
WHERE p.id = d.id;

UPDATE public.profiles AS p
SET
  full_name = COALESCE(p.full_name, s.owner_name),
  phone = COALESCE(p.phone, s.phone),
  email = COALESCE(p.email, s.email, au.email),
  role = 'supplier'
FROM public.suppliers AS s
LEFT JOIN auth.users AS au ON au.id = s.id
WHERE p.id = s.id;

UPDATE public.customers AS c
SET email = COALESCE(c.email, p.email, au.email)
FROM public.profiles AS p
LEFT JOIN auth.users AS au ON au.id = p.id
WHERE c.id = p.id
  AND (c.email IS NULL OR btrim(c.email) = '');

UPDATE public.professionals AS pr
SET email = COALESCE(pr.email, p.email, au.email)
FROM public.profiles AS p
LEFT JOIN auth.users AS au ON au.id = p.id
WHERE pr.id = p.id
  AND (pr.email IS NULL OR btrim(pr.email) = '');
