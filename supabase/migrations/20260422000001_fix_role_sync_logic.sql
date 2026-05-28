-- Relax role update logic in the sync trigger to allow updating 'customer' to specialized roles
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
      -- Allow update if current role is NULL/user OR if upgrading from customer to a specialized role
      WHEN public.profiles.role IS NULL 
           OR public.profiles.role = 'user' 
           OR (public.profiles.role = 'customer' AND EXCLUDED.role IN ('professional', 'designer', 'supplier')) 
      THEN EXCLUDED.role
      ELSE public.profiles.role
    END;

  RETURN NEW;
END;
$$;
