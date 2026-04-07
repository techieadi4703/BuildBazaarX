UPDATE public.profiles AS p
SET email = au.email
FROM auth.users AS au
WHERE p.id = au.id
  AND (p.email IS NULL OR btrim(p.email) = '')
  AND au.email IS NOT NULL;
