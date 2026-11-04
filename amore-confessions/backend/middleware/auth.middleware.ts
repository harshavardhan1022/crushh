// ============================================================================
// Amore Anonymous College Confession Platform - Auth Middleware
// ============================================================================

import { SupabaseClient } from '@supabase/supabase-js';

export interface AuthResult {
  authorized: boolean;
  userId?: string;
  error?: string;
}

/**
 * Verify that the current session belongs to an admin user.
 *
 * Checks user identity using JWT token or active session,
 * then verifies the 'admin' role in the `admin_profiles` table.
 *
 * @param supabase - Supabase server client (admin client or session client)
 * @param token - Optional JWT Bearer token extracted from request
 */
export async function verifyAdmin(
  supabase: SupabaseClient,
  token?: string | null
): Promise<AuthResult> {
  let user: { id: string } | null = null;

  if (token) {
    const { data, error: authError } = await supabase.auth.getUser(token);
    if (authError || !data?.user) {
      return {
        authorized: false,
        error: 'Not authenticated',
      };
    }
    user = data.user;
  } else {
    const {
      data: { user: sessionUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !sessionUser) {
      return {
        authorized: false,
        error: 'Not authenticated',
      };
    }
    user = sessionUser;
  }

  // Check admin_profiles table for admin role
  const { data: adminProfile, error: profileError } = await supabase
    .from('admin_profiles')
    .select('id, role')
    .eq('id', user.id)
    .eq('role', 'admin')
    .single();

  if (profileError || !adminProfile) {
    return {
      authorized: false,
      error: 'Not authorized as administrator',
    };
  }

  return {
    authorized: true,
    userId: user.id,
  };
}

/**
 * Extract Bearer token from Request Authorization header or cookie.
 */
export function extractAuthToken(req: Request): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  // Check cookies for sb-access-token or amore-admin-token
  const cookieHeader = req.headers.get('cookie');
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map((c) => {
        const [k, ...v] = c.trim().split('=');
        return [k, decodeURIComponent(v.join('='))];
      })
    );

    if (cookies['amore-admin-token']) {
      return cookies['amore-admin-token'];
    }
    if (cookies['sb-access-token']) {
      return cookies['sb-access-token'];
    }
  }

  return null;
}
