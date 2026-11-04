// ============================================================================
// Amore Anonymous College Confession Platform - Admin Service
// ============================================================================

import { SupabaseClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AdminProfile {
  id: string;
  role: string;
  created_at: string;
}

export interface AdminServiceResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ---------------------------------------------------------------------------
// Service Functions
// ---------------------------------------------------------------------------

/**
 * Verify that a user has the 'admin' role in the admin_profiles table.
 */
export async function verifyAdminRole(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('admin_profiles')
    .select('role')
    .eq('id', userId)
    .eq('role', 'admin')
    .single();

  if (error || !data) {
    return false;
  }

  return data.role === 'admin';
}

/**
 * Change the authenticated user's password.
 */
export async function changePassword(
  supabase: SupabaseClient,
  newPassword: string
): Promise<AdminServiceResult<void>> {
  if (!newPassword || newPassword.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters' };
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    console.error('[admin.service] changePassword error:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Get the admin profile for a given user ID.
 */
export async function getAdminProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<AdminServiceResult<AdminProfile>> {
  const { data, error } = await supabase
    .from('admin_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('[admin.service] getAdminProfile error:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data: data as AdminProfile };
}
