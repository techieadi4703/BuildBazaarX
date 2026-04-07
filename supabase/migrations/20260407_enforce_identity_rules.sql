-- Enforce Unique Phone Numbers across all identity tables

-- 1. Ensure phone column exists and is unique in profiles (the central table)
ALTER TABLE public.profiles ADD CONSTRAINT profiles_phone_unique UNIQUE (phone);

-- 2. Ensure phone is unique in Designers
ALTER TABLE public.designers ADD CONSTRAINT designers_phone_unique UNIQUE (phone);

-- 3. Ensure phone is unique in Suppliers
ALTER TABLE public.suppliers ADD CONSTRAINT suppliers_phone_unique UNIQUE (phone);

-- 4. Ensure phone is unique in Professionals
ALTER TABLE public.professionals ADD CONSTRAINT professionals_phone_unique UNIQUE (phone);

-- 5. Set Email as optional for Pros in Designers table
ALTER TABLE public.designers ALTER COLUMN email DROP NOT NULL;

-- 6. Set Email as optional for Suppliers
ALTER TABLE public.suppliers ALTER COLUMN email DROP NOT NULL;

-- 7. Set Email as optional for Professionals
ALTER TABLE public.professionals ALTER COLUMN email DROP NOT NULL;
