// ============================================================================
// Anonymous College Confession Platform - Admin Logout Route
// POST /api/admin/logout
// ============================================================================

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });

  const clearCookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0,
  };

  // Clear admin auth cookies
  response.cookies.set('admin-token', '', clearCookieOpts);
  response.cookies.set('amore-admin-token', '', clearCookieOpts);

  return response;
}

