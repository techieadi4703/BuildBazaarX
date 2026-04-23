-- Set the default value for the role column in profiles to 'customer'
-- This ensures that even if metadata sync fails initially, we don't end up with 'user'
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'customer';

-- Update all future inserts to use this default if role is NULL
ALTER TABLE public.profiles ALTER COLUMN role SET NOT NULL;
ALTER TABLE public.profiles ADD CONSTRAINT check_valid_role CHECK (role IN ('customer', 'professional', 'designer', 'supplier', 'admin'));

-- Note: No backfill performed as per user request.
