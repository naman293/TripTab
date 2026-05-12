-- ============================================================
-- Migration: 00004_harden_rls.sql
-- Purpose: Replace wide-open development policies with
--          fine-grained Row Level Security backed by the
--          Clerk JWT (auth.jwt()->>'sub' = users.clerk_id).
-- ============================================================

-- ─── Helper function ────────────────────────────────────────
-- Returns the Supabase users.id that matches the Clerk user
-- currently making the request (identified via JWT sub claim).
-- Used by all RLS policies below.
CREATE OR REPLACE FUNCTION public.current_app_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM public.users
  WHERE clerk_id = (auth.jwt() ->> 'sub')
  LIMIT 1;
$$;

-- ─── Drop old open-access development policies ───────────────
DROP POLICY IF EXISTS "Enable all for development" ON public.users;
DROP POLICY IF EXISTS "Enable all for development" ON public.trips;
DROP POLICY IF EXISTS "Enable all for development" ON public.trip_members;
DROP POLICY IF EXISTS "Enable all for development" ON public.expenses;
DROP POLICY IF EXISTS "Enable all for development" ON public.expense_splits;
DROP POLICY IF EXISTS "Enable all for development" ON public.activities;
DROP POLICY IF EXISTS "Enable all for development" ON public.settlements;
DROP POLICY IF EXISTS "Enable all for development" ON public.notifications;
DROP POLICY IF EXISTS "Enable all for development" ON public.delete_proposals;

-- ─── users ───────────────────────────────────────────────────
-- Anyone authenticated can read any user (needed to show member names/avatars).
-- Only the user themselves can update their own row.
CREATE POLICY "users_select" ON public.users
  FOR SELECT USING (auth.jwt() IS NOT NULL);

CREATE POLICY "users_insert" ON public.users
  FOR INSERT WITH CHECK (clerk_id = (auth.jwt() ->> 'sub'));

CREATE POLICY "users_update" ON public.users
  FOR UPDATE USING (id = public.current_app_user_id());

-- ─── trips ───────────────────────────────────────────────────
-- A user can see / modify a trip only if they are a member.
CREATE POLICY "trips_select" ON public.trips
  FOR SELECT USING (
    id IN (
      SELECT trip_id FROM public.trip_members
      WHERE user_id = public.current_app_user_id()
    )
  );

CREATE POLICY "trips_insert" ON public.trips
  FOR INSERT WITH CHECK (created_by = public.current_app_user_id());

CREATE POLICY "trips_update" ON public.trips
  FOR UPDATE USING (
    id IN (
      SELECT trip_id FROM public.trip_members
      WHERE user_id = public.current_app_user_id()
    )
  );

CREATE POLICY "trips_delete" ON public.trips
  FOR DELETE USING (created_by = public.current_app_user_id());

-- ─── trip_members ─────────────────────────────────────────────
-- Members can read/add members to trips they already belong to.
CREATE POLICY "trip_members_select" ON public.trip_members
  FOR SELECT USING (
    trip_id IN (
      SELECT trip_id FROM public.trip_members
      WHERE user_id = public.current_app_user_id()
    )
  );

CREATE POLICY "trip_members_insert" ON public.trip_members
  FOR INSERT WITH CHECK (
    trip_id IN (
      SELECT trip_id FROM public.trip_members
      WHERE user_id = public.current_app_user_id()
    )
    OR user_id = public.current_app_user_id() -- allow self-join
  );

CREATE POLICY "trip_members_delete" ON public.trip_members
  FOR DELETE USING (
    trip_id IN (
      SELECT trip_id FROM public.trip_members
      WHERE user_id = public.current_app_user_id()
    )
  );

-- ─── expenses ─────────────────────────────────────────────────
CREATE POLICY "expenses_select" ON public.expenses
  FOR SELECT USING (
    trip_id IN (
      SELECT trip_id FROM public.trip_members
      WHERE user_id = public.current_app_user_id()
    )
  );

CREATE POLICY "expenses_insert" ON public.expenses
  FOR INSERT WITH CHECK (
    trip_id IN (
      SELECT trip_id FROM public.trip_members
      WHERE user_id = public.current_app_user_id()
    )
  );

CREATE POLICY "expenses_update" ON public.expenses
  FOR UPDATE USING (
    trip_id IN (
      SELECT trip_id FROM public.trip_members
      WHERE user_id = public.current_app_user_id()
    )
  );

CREATE POLICY "expenses_delete" ON public.expenses
  FOR DELETE USING (
    trip_id IN (
      SELECT trip_id FROM public.trip_members
      WHERE user_id = public.current_app_user_id()
    )
  );

-- ─── expense_splits ───────────────────────────────────────────
CREATE POLICY "expense_splits_select" ON public.expense_splits
  FOR SELECT USING (
    expense_id IN (
      SELECT e.id FROM public.expenses e
      JOIN public.trip_members tm ON tm.trip_id = e.trip_id
      WHERE tm.user_id = public.current_app_user_id()
    )
  );

CREATE POLICY "expense_splits_insert" ON public.expense_splits
  FOR INSERT WITH CHECK (
    expense_id IN (
      SELECT e.id FROM public.expenses e
      JOIN public.trip_members tm ON tm.trip_id = e.trip_id
      WHERE tm.user_id = public.current_app_user_id()
    )
  );

CREATE POLICY "expense_splits_delete" ON public.expense_splits
  FOR DELETE USING (
    expense_id IN (
      SELECT e.id FROM public.expenses e
      JOIN public.trip_members tm ON tm.trip_id = e.trip_id
      WHERE tm.user_id = public.current_app_user_id()
    )
  );

-- ─── activities ───────────────────────────────────────────────
CREATE POLICY "activities_select" ON public.activities
  FOR SELECT USING (
    trip_id IN (
      SELECT trip_id FROM public.trip_members
      WHERE user_id = public.current_app_user_id()
    )
  );

CREATE POLICY "activities_insert" ON public.activities
  FOR INSERT WITH CHECK (
    trip_id IN (
      SELECT trip_id FROM public.trip_members
      WHERE user_id = public.current_app_user_id()
    )
  );

-- ─── settlements ──────────────────────────────────────────────
CREATE POLICY "settlements_select" ON public.settlements
  FOR SELECT USING (
    trip_id IN (
      SELECT trip_id FROM public.trip_members
      WHERE user_id = public.current_app_user_id()
    )
  );

CREATE POLICY "settlements_insert" ON public.settlements
  FOR INSERT WITH CHECK (
    trip_id IN (
      SELECT trip_id FROM public.trip_members
      WHERE user_id = public.current_app_user_id()
    )
  );

-- ─── notifications ────────────────────────────────────────────
-- Users can only read/update their own notifications.
-- Trip members can insert notifications for other members.
CREATE POLICY "notifications_select" ON public.notifications
  FOR SELECT USING (to_user_id = public.current_app_user_id());

CREATE POLICY "notifications_insert" ON public.notifications
  FOR INSERT WITH CHECK (
    -- sender must be a member of the trip (or trip_id is null for system notifs)
    trip_id IS NULL
    OR trip_id IN (
      SELECT trip_id FROM public.trip_members
      WHERE user_id = public.current_app_user_id()
    )
  );

CREATE POLICY "notifications_update" ON public.notifications
  FOR UPDATE USING (to_user_id = public.current_app_user_id());

-- ─── delete_proposals ─────────────────────────────────────────
CREATE POLICY "delete_proposals_select" ON public.delete_proposals
  FOR SELECT USING (
    trip_id IN (
      SELECT trip_id FROM public.trip_members
      WHERE user_id = public.current_app_user_id()
    )
  );

CREATE POLICY "delete_proposals_insert" ON public.delete_proposals
  FOR INSERT WITH CHECK (
    requested_by = public.current_app_user_id()
  );

CREATE POLICY "delete_proposals_update" ON public.delete_proposals
  FOR UPDATE USING (
    trip_id IN (
      SELECT trip_id FROM public.trip_members
      WHERE user_id = public.current_app_user_id()
    )
  );
