-- Create settlements table
CREATE TABLE public.settlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  from_user_id uuid REFERENCES public.users(id) NOT NULL,
  to_user_id uuid REFERENCES public.users(id) NOT NULL,
  amount numeric(10,2) NOT NULL,
  date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  note text
);

-- Create notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  to_user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  trip_id uuid REFERENCES public.trips(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  read boolean DEFAULT false NOT NULL,
  meta jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create delete_proposals table
CREATE TABLE public.delete_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  trip_id uuid REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  target_id uuid NOT NULL,
  requested_by uuid REFERENCES public.users(id) NOT NULL,
  status text DEFAULT 'pending' NOT NULL,
  member_ids jsonb NOT NULL,
  approvals jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add basic Row Level Security (RLS)
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delete_proposals ENABLE ROW LEVEL SECURITY;

-- Note: Policies will be tightened in later steps once Clerk integration is complete.
-- For local MVP development, allowing public access to get the UI wired up.
CREATE POLICY "Enable all for development" ON public.settlements FOR ALL USING (true);
CREATE POLICY "Enable all for development" ON public.notifications FOR ALL USING (true);
CREATE POLICY "Enable all for development" ON public.delete_proposals FOR ALL USING (true);

-- Enable Realtime for all tables
-- The supabase_realtime publication is created by default in Supabase.
-- We add our tables to it to enable real-time replication.
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trips;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.expense_splits;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.settlements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.delete_proposals;
