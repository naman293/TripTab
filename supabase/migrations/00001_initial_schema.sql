-- Create users table
CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id text UNIQUE NOT NULL,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create trips table
CREATE TABLE public.trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  created_by uuid REFERENCES public.users(id) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create trip_members table
CREATE TABLE public.trip_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'member' NOT NULL,
  UNIQUE(trip_id, user_id)
);

-- Create expenses table
CREATE TABLE public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  paid_by uuid REFERENCES public.users(id) NOT NULL,
  amount numeric(10,2) NOT NULL,
  title text NOT NULL,
  category text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create expense_splits table
CREATE TABLE public.expense_splits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id uuid REFERENCES public.expenses(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.users(id) NOT NULL,
  amount numeric(10,2) NOT NULL
);

-- Create activities table
CREATE TABLE public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.users(id) NOT NULL,
  action text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add basic Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Note: Policies will be tightened in later steps once Clerk integration is complete.
-- For local MVP development, allowing public access to get the UI wired up.
CREATE POLICY "Enable all for development" ON public.users FOR ALL USING (true);
CREATE POLICY "Enable all for development" ON public.trips FOR ALL USING (true);
CREATE POLICY "Enable all for development" ON public.trip_members FOR ALL USING (true);
CREATE POLICY "Enable all for development" ON public.expenses FOR ALL USING (true);
CREATE POLICY "Enable all for development" ON public.expense_splits FOR ALL USING (true);
CREATE POLICY "Enable all for development" ON public.activities FOR ALL USING (true);
