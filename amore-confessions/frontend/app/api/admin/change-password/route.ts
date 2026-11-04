// ============================================================================
// Amore Anonymous College Confession Platform - Admin Change Password Route
// POST /api/admin/change-password
// ============================================================================

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import { extractAuthToken, verifyAdmin } from '@backend/middleware/auth.middleware';

export const dynamic = 'force-dynamic';

function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (!/[A-Z]/.test(password) && !/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter or digit.' };
  }
  return { valid: true };
}

export async function POST(req: Request) {
  try {
    const supabase = createAdminClient();
    const token = extractAuthToken(req);
    const auth = await verifyAdmin(supabase, token);

    if (!auth.authorized || !auth.userId) {
      return NextResponse.json(
        { success: false, error: auth.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { newPassword, confirmPassword } = body as {
      newPassword?: string;
      confirmPassword?: string;
    };

    if (!newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'New password and confirmation are required' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'New password and confirmation do not match' },
        { status: 400 }
      );
    }

    const strength = validatePasswordStrength(newPassword);
    if (!strength.valid) {
      return NextResponse.json(
        { success: false, error: strength.message },
        { status: 400 }
      );
    }

    // Update password using Supabase Auth Admin API (hashed by Supabase)
    const { error: updateError } = await supabase.auth.admin.updateUserById(auth.userId, {
      password: newPassword,
    });

    if (updateError) {
      console.error('[API /api/admin/change-password] Update error:', updateError);
      return NextResponse.json(
        { success: false, error: updateError.message || 'Failed to update password' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error: any) {
    console.error('[API /api/admin/change-password] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

