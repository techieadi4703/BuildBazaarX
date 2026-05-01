-- ============================================================
-- Fix RLS policies so users can update their own profile rows
-- (cart snapshot, wishlist, address, etc.) and insert orders.
-- ============================================================

-- 1. Add wishlist column to profiles if not already there
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS wishlist jsonb DEFAULT '[]'::jsonb;

-- 2. Drop any restrictive policies on profiles that block self-update
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;

-- 3. Enable RLS on profiles (if not already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Recreate clean, permissive policies for profiles
-- Allow authenticated users to SELECT their own profile
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Allow authenticated users to INSERT their own profile row
CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow authenticated users to UPDATE their own profile row (all columns)
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 5. Fix orders table RLS
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "orders_insert_policy" ON public.orders;
DROP POLICY IF EXISTS "orders_select_policy" ON public.orders;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own orders
CREATE POLICY "orders_insert_own"
  ON public.orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own orders
CREATE POLICY "orders_select_own"
  ON public.orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to update their own orders (e.g. payment status)
CREATE POLICY "orders_update_own"
  ON public.orders
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
