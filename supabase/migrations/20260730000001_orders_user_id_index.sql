-- =============================================================================
-- BuildBazaarX — Performance Optimization Migration
-- Goal: Add an index to orders.user_id to prevent sequential scans during 
--       Row Level Security (RLS) checks and when fetching user order history.
-- =============================================================================

CREATE INDEX IF NOT EXISTS orders_user_id_idx ON public.orders(user_id);
