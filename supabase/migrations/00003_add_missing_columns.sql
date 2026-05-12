-- Add missing columns to users
ALTER TABLE public.users ADD COLUMN username text;
ALTER TABLE public.users ADD COLUMN phone text;
ALTER TABLE public.users ADD COLUMN avatar_seed integer DEFAULT 0;
ALTER TABLE public.users ADD COLUMN preferred_currency text DEFAULT 'USD';

-- Add missing columns to trips
ALTER TABLE public.trips ADD COLUMN destination text;
ALTER TABLE public.trips ADD COLUMN start_date text;
ALTER TABLE public.trips ADD COLUMN end_date text;
ALTER TABLE public.trips ADD COLUMN cover_doodle text;

-- Add missing columns to expenses
ALTER TABLE public.expenses ADD COLUMN notes text;
ALTER TABLE public.expenses ADD COLUMN split_type text DEFAULT 'equal';
