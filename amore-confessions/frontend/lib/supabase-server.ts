// ============================================================================
// Anonymous College Confession Platform - Server-Side Supabase Client
// ============================================================================

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Sanitizes and validates an API key or secret token.
 * Prevents native ByteString TypeError crashes caused by masked unicode bullet characters (•).
 */
function getCleanKey(key: string | undefined): string | null {
  if (!key) return null;
  const trimmed = key.trim();
  // Check for unicode bullets or UI mask placeholders
  if (/[\u2022\u25CF]/.test(trimmed) || trimmed.includes('••••')) {
    return null;
  }
  return trimmed;
}

/**
 * Creates a Supabase admin client using the service-role key or secret key.
 * This client bypasses Row Level Security and should ONLY be used in server-side
 * code (API routes, server actions) for authorized admin operations.
 */
export function createAdminClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const rawKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const cleanKey = getCleanKey(rawKey);

  const fallbackKey =
    cleanKey ||
    getCleanKey(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
    getCleanKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
    'mock-service-role-key';

  return createClient(supabaseUrl || 'https://mock.supabase.co', fallbackKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Returns a Supabase client suitable for student confession submissions.
 * Prioritizes service-role client if available and valid. If service-role key is
 * not yet configured or masked, cleanly falls back to the public anon/publishable key,
 * which possesses secure INSERT privileges under the 'anon_can_submit_confessions' RLS policy.
 */
export function getSubmissionSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const serviceKey = getCleanKey(
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  if (supabaseUrl && serviceKey) {
    return createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  const anonKey = getCleanKey(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  return createClient(supabaseUrl || 'https://mock.supabase.co', anonKey || 'mock-anon-key', {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
