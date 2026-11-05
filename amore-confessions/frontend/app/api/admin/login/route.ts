// ============================================================================
// Anonymous College Confession Platform - Admin Login Route
// POST /api/admin/login
// ============================================================================

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase-server';
import { checkRateLimit } from '@backend/middleware/rateLimit.middleware';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // 1. IP rate limiting for brute-force protection (5 attempts / min)
    const forwardedFor = req.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    const rateLimit = checkRateLimit(`login_${ip}`, 5, 60_000);
    if (!rateLimit.allowed) {
      console.warn(`[API /api/admin/login] Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json(
        {
          success: false,
          error: `Too many login attempts. Please wait ${rateLimit.retryAfter || 60} seconds before retrying.`,
        },
        { status: 429 }
      );
    }

    // 2. Parse credentials
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { email, password } = body as { email?: string; password?: string };

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    console.log(`[API /api/admin/login] Admin login attempt for: ${cleanEmail}`);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Local development mode when Supabase is still configured with placeholder
    const isPlaceholder = !supabaseUrl || supabaseUrl.includes('placeholder');
    if (isPlaceholder) {
      const configuredEmail = (process.env.ADMIN_EMAIL || 'admin@college.edu').toLowerCase();
      const configuredPassword = process.env.INITIAL_ADMIN_PASSWORD || 'AdminSecret123!';

      const emailMatches =
        cleanEmail === configuredEmail ||
        cleanEmail === 'admin@amore.college' ||
        cleanEmail === 'admin@college.edu';

      if (emailMatches && password === configuredPassword) {
        const token = 'admin-dev-session-token';
        console.log(`[API /api/admin/login] Successful dev login for: ${cleanEmail}`);
        const response = NextResponse.json({
          success: true,
          user: { id: 'dev-admin-001', email: cleanEmail },
          token,
        });

        const cookieOpts = {
          httpOnly: true,
          secure: false,
          sameSite: 'lax' as const,
          path: '/',
          maxAge: 3600 * 24,
        };

        response.cookies.set('admin-token', token, cookieOpts);
        response.cookies.set('amore-admin-token', token, cookieOpts);
        return response;
      } else {
        console.warn(`[API /api/admin/login] Invalid credentials for: ${cleanEmail}`);
        return NextResponse.json(
          { success: false, error: 'Invalid email or password' },
          { status: 401 }
        );
      }
    }

    if (!supabaseUrl || !anonKey) {
      return NextResponse.json(
        { success: false, error: 'Server authentication configuration is missing' },
        { status: 500 }
      );
    }

    // 3. Authenticate with Supabase Auth
    const client = createClient(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: authData, error: authError } = await client.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (authError || !authData?.user || !authData.session) {
      console.warn(`[API /api/admin/login] Supabase Auth rejected login for: ${cleanEmail}`);
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // 4. Verify admin role in admin_profiles
    const adminClient = createAdminClient();
    const { data: profile, error: profileError } = await adminClient
      .from('admin_profiles')
      .select('role')
      .eq('id', authData.user.id)
      .eq('role', 'admin')
      .single();

    if (profileError || !profile) {
      console.warn(`[API /api/admin/login] Access denied (not an admin) for user ID: ${authData.user.id}`);
      return NextResponse.json(
        { success: false, error: 'Access denied: User is not an authorized administrator' },
        { status: 403 }
      );
    }

    // 5. Build response and set HTTP-only secure session cookies
    const token = authData.session.access_token;
    console.log(`[API /api/admin/login] Successful Supabase admin login for: ${cleanEmail}`);
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
        },
        token,
      },
      { status: 200 }
    );

    const prodCookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: authData.session.expires_in || 3600 * 24,
    };

    response.cookies.set('admin-token', token, prodCookieOpts);
    response.cookies.set('amore-admin-token', token, prodCookieOpts);

    return response;
  } catch (error: any) {
    console.error('[API /api/admin/login] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed due to an unexpected error' },
      { status: 500 }
    );
  }
}

