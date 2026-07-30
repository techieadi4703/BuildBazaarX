ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS last_cart_snapshot jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS last_cart_updated_at timestamptz;
