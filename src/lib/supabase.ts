import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Please check your .env.local file.');
}

// Default anon client (used before user is authenticated)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

/**
 * Creates a Supabase client that attaches the Clerk JWT on every request.
 * This allows Supabase RLS policies to use auth.uid() / auth.jwt()
 * to identify the current user.
 *
 * Usage: call this once after the user signs in and use the returned
 * client for all authenticated DB operations.
 */
export function createAuthenticatedSupabaseClient(
  getToken: () => Promise<string | null>
) {
  return createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder',
    {
      // `accessToken` is supported in supabase-js ≥ 2.39
      // It is called before every request; returning null falls back to anon.
      accessToken: async () => (await getToken()) ?? '',
    }
  );
}
