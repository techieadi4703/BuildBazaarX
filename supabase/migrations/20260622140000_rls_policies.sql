-- 1. Rename payments table to orders
ALTER TABLE IF EXISTS public.payments RENAME TO orders;

-- 2. Rename columns to match requirements
ALTER TABLE public.orders RENAME COLUMN amount TO total;
ALTER TABLE public.orders RENAME COLUMN razorpay_payment_id TO payment_id;

-- Rename trigger for consistency
ALTER TRIGGER payments_updated_at ON public.orders RENAME TO orders_updated_at;

-- 3. Update RLS policies for orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Drop the old policy
DROP POLICY IF EXISTS "Users can view own payments" ON public.orders;

-- "Users can only view their own orders."
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

-- 4. Set up RLS for profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- "Users can only view their own profile."
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- "Users can only update their own profile."
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);
