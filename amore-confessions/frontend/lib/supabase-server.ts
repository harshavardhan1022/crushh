// ============================================================================
// Anonymous College Confession Platform - Server-Side Supabase Client
// ============================================================================

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase admin client using the service-role key.
 * This client bypasses Row Level Security and should ONLY be used
 * in server-side code (API routes, server components, server actions).
 *
 * Never import this in client-side code.
 */
export function createAdminClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    if (process.env.NODE_ENV === 'test') {
      return createClient(
        supabaseUrl || 'https://mock.supabase.co',
        serviceRoleKey || 'mock-service-role-key',
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );
    }
    throw new Error(
      'Missing required Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
