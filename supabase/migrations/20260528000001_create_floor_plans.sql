CREATE TABLE public.floor_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  plan_data jsonb not null default '{}'::jsonb,
  thumbnail_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
ALTER TABLE public.floor_plans ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can select their own plans" 
ON public.floor_plans 
FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own plans" 
ON public.floor_plans 
FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own plans" 
ON public.floor_plans 
FOR UPDATE 
TO authenticated 
USING (user_id = auth.uid()) 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own plans" 
ON public.floor_plans 
FOR DELETE 
TO authenticated 
USING (user_id = auth.uid());
