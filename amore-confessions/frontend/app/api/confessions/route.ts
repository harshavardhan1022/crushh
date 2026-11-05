// ============================================================================
// Anonymous College Confession Platform - Confession Submission Route
// POST /api/confessions
// ============================================================================

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import { submitConfession } from '@backend/services/confession.service';
import { checkRateLimit } from '@backend/middleware/rateLimit.middleware';
import { RATE_LIMIT } from '@backend/config';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // 1. Extract IP for rate limiting
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : realIp || '127.0.0.1';

    // 2. Check rate limit (5 submissions per minute)
    const rateLimit = checkRateLimit(ip, RATE_LIMIT.maxRequests, RATE_LIMIT.windowMs);
    if (!rateLimit.allowed) {
      console.warn(`[API /api/confessions] Rate limit exceeded for IP: ${ip.substring(0, 7)}...`);
      return NextResponse.json(
        {
          success: false,
          error: `Too many submissions. Please wait ${rateLimit.retryAfter || 60} seconds before trying again.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfter || 60),
          },
        }
      );
    }

    // 3. Parse JSON payload with size limit guard
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request body' },
        { status: 400 }
      );
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Request body must be a valid object' },
        { status: 400 }
      );
    }

    const payload = body as Record<string, unknown>;
    console.log(
      `[API /api/confessions] Submission received: department=${payload.department}, branch=${payload.branch ?? 'N/A'}, year=${payload.academicYear}`
    );

    // 4. Submit via backend confession service
    const supabase = createAdminClient();
    const result = await submitConfession(supabase, payload as any);

    if (!result.success) {
      console.warn(`[API /api/confessions] Validation/Storage failed: ${result.error}`);
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to submit confession' },
        { status: 400 }
      );
    }

    console.log(`[API /api/confessions] Successfully stored confession record (id=${result.data?.id})`);

    // 5. Safe acknowledgement response: Do not leak submission details or database ID
    return NextResponse.json(
      {
        success: true,
        message: 'Your confession has been sent!',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[API /api/confessions] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected server error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}

