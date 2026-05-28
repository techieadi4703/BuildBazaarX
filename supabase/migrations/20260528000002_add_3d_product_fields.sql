-- Add 3D planner support columns to supplier_products
ALTER TABLE public.supplier_products
ADD COLUMN IF NOT EXISTS hex_color text,
ADD COLUMN IF NOT EXISTS texture_url text,
ADD COLUMN IF NOT EXISTS model_3d_url text;
