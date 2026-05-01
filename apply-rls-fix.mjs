#!/usr/bin/env node
/**
 * Run this script ONCE to apply the RLS policy fix to your Supabase database.
 * Usage: node apply-rls-fix.mjs
 *
 * Requires: VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envFile = readFileSync(join(__dirname, ".env"), "utf-8");
const env = Object.fromEntries(
  envFile
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    })
);

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in .env");
  process.exit(1);
}

console.log("🔗 Connecting to:", SUPABASE_URL);

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// We'll use supabase's rpc or direct REST to run SQL
// Since anon key can't run arbitrary SQL, we print the SQL for manual execution.
const sql = `
-- ============================================================
-- Fix RLS + add wishlist column
-- ============================================================

-- 1. Add wishlist column to profiles if not already there
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS wishlist jsonb DEFAULT '[]'::jsonb;

-- 2. Drop any old conflicting policies on profiles
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

-- 3. Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create fresh clean policies for profiles
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 5. Fix orders table RLS
DROP POLICY IF EXISTS "orders_insert_own" ON public.orders;
DROP POLICY IF EXISTS "orders_select_own" ON public.orders;
DROP POLICY IF EXISTS "orders_update_own" ON public.orders;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_insert_own"
  ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders_select_own"
  ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "orders_update_own"
  ON public.orders FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
`;

console.log("\n⚡ Copy and run this SQL in your Supabase Dashboard SQL Editor:");
console.log("   https://supabase.com/dashboard/project/iymwxolcoemdayahabou/sql/new\n");
console.log("─".repeat(70));
console.log(sql);
console.log("─".repeat(70));
console.log("\n✅ After running the SQL, refresh your app and the cart/wishlist/orders will work correctly.");
