-- 1. Create the payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          text NOT NULL,                        -- Razorpay order_id (rzp_live_...)
  razorpay_order_id text NOT NULL UNIQUE,
  razorpay_payment_id text,                               -- filled after payment capture
  razorpay_signature  text,                               -- filled after payment capture
  user_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cart_snapshot     jsonb NOT NULL,                       -- snapshot of items at time of payment
  amount            integer NOT NULL,                     -- in paise (INR × 100)
  currency          text NOT NULL DEFAULT 'INR',
  status            text NOT NULL DEFAULT 'created'       -- created | paid | failed | refunded
                    CHECK (status IN ('created','paid','failed','refunded')),
  metadata          jsonb DEFAULT '{}',
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

-- RLS: users can read their own payments; service role handles writes via webhook
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

-- Updated_at trigger for payments
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- 2. Create the products table to store catalog for server-side pricing
CREATE TABLE IF NOT EXISTS public.products (
  id                text PRIMARY KEY,
  name              text NOT NULL,
  price             integer NOT NULL, -- price in INR
  stock_quantity    integer DEFAULT 1000,
  is_active         boolean DEFAULT true,
  created_at        timestamptz DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view products"
  ON public.products FOR SELECT
  USING (true);

-- Insert some initial products from rawMaterialsData to test with.
-- (In production, you'll want to sync all items from rawMaterialsData into this table)
INSERT INTO public.products (id, name, price) VALUES
('new1', 'Premium Commercial Plywood 18mm', 2100),
('new2', 'UltraTech Super Cement 50kg', 420),
('new4', 'Tractor Emulsion Paint 20L', 3200),
('new6', 'Polycab FR Wire 1.5 sq mm', 1450),
('new30', 'Jaquar Gold Faucet Basin Mixer', 4200),
('new3', 'Birla Shakti Cement 50kg', 410),
('new5', 'Luxury Interior Emulsion 20L', 3400),
('new7', 'Anchor 6A Switch & Socket', 120),
('new8', 'Stainless Glass Patch Fitting', 1250),
('new9', 'Hafele Concealed Hinge', 250),
('new10', 'Telescopic Drawer Slides 20"', 450),
('new11', 'Astral Aquarius uPVC Pipe', 850),
('new12', 'Finolex PVC Pipe', 780),
('new13', 'Polished Vitrified Floor Tile', 850),
('new14', 'MDF Board 18mm', 1800),
('new15', 'Calacatta Gold Quartz Slab', 8500),
('new16', 'SmartControl Concealed Shower', 45000),
('new17', 'Veil Intelligent Toilet', 120000),
('new18', 'Hue Play Gradient Lightstrip', 18000),
('new19', 'Canadian Pine Wood Logs', 3200),
('new20', 'Estate Emulsion - Hague Blue', 14000),
('new21', 'Duro Lifetime Guarantee Plywood', 2800),
('new22', 'Virgo Premium Wood Laminate', 1250),
('new23', 'JSW Cement GGBS 50kg', 390),
('new24', 'Dalmia Infra Pro Cement 50kg', 430),
('new25', 'Smart Digital Lock', 8500),
('new26', 'Exterior Wall Primer Gold Series', 1500),
('new27', 'Weathercoat Exterior Acrylic', 3600),
('new28', 'Stainless Steel Pull Handle', 1200),
('new29', 'Dorset Euro Profile Cylinder Lock', 850),
('new31', 'RR Kabel FR Wire 1.5 sq mm', 1350),
('new32', 'LED Ground Uplighter 5W', 950),
('new33', 'Ambuja Cement 50kg', 395),
('new34', 'Advance Modular Switches', 180),
('new35', 'Beauty Smooth Emulsion', 2800),
('new36', 'Premium Designer Tiles', 1450),
('new37', 'Luxury Vinyl Flooring', 2100),
('new38', 'Platinum Interior Paint', 4200),
('new39', 'Premium Interior Paint', 1200),
('new40', 'Modular Switch Plate', 450),
('new41', 'Decorative Laminate Sheet', 800),
('new42', 'Portland Cement 50kg', 380),
('new43', 'Ceramic Wall Tiles', 450),
('new44', 'Commercial Plywood 12mm', 1200)
ON CONFLICT (id) DO NOTHING;
