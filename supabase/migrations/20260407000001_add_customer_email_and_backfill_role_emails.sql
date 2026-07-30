ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS email text;

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

UPDATE public.profiles AS p
SET email = COALESCE(p.email, c.email, pr.email, au.email)
FROM auth.users AS au
LEFT JOIN public.customers AS c ON c.id = au.id
LEFT JOIN public.professionals AS pr ON pr.id = au.id
WHERE p.id = au.id
  AND (p.email IS NULL OR btrim(p.email) = '');
