// ============================================================================
// Amore Anonymous College Confession Platform - Secure Admin Provisioning
// POST /api/admin/provision
//
// Protected endpoint: Only callable with the secret SUPABASE_SERVICE_ROLE_KEY
// in the 'x-admin-provision-secret' header.
// Never accessible to unauthenticated public requests.
// ============================================================================

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const authHeader = req.headers.get('x-admin-provision-secret');

    // Strict security check: Caller must present the service role secret
    if (!serviceRoleKey || !authHeader || authHeader !== serviceRoleKey) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid provisioning secret' },
        { status: 401 }
      );
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const initialPassword = process.env.INITIAL_ADMIN_PASSWORD;

    if (!adminEmail || !initialPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD must be configured in environment',
        },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Check if admin user already exists
    const { data: userList } = await supabase.auth.admin.listUsers();
    let existingUser = userList?.users?.find((u) => u.email === adminEmail);

    let userId: string;

    if (!existingUser) {
      // Create admin user in Supabase Auth
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: initialPassword,
        email_confirm: true,
      });

      if (createError || !newUser?.user) {
        return NextResponse.json(
          { success: false, error: createError?.message || 'Failed to create admin user' },
          { status: 500 }
        );
      }

      userId = newUser.user.id;
    } else {
      userId = existingUser.id;
      // Update password to match configured initial password
      await supabase.auth.admin.updateUserById(userId, {
        password: initialPassword,
      });
    }

    // Ensure record in admin_profiles table
    const { error: profileError } = await supabase.from('admin_profiles').upsert(
      {
        id: userId,
        role: 'admin',
      },
      { onConflict: 'id' }
    );

    if (profileError) {
      return NextResponse.json(
        { success: false, error: profileError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Admin user provisioned successfully',
      email: adminEmail,
    });
  } catch (error: any) {
    console.error('[API /api/admin/provision] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error during admin provisioning' },
      { status: 500 }
    );
  }
}

