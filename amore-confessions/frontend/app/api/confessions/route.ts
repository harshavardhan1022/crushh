// ============================================================================
// Amore Anonymous College Confession Platform - Confession Submission Route
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

    // 4. Submit via backend confession service
    const supabase = createAdminClient();
    const result = await submitConfession(supabase, body as any);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to submit confession' },
        { status: 400 }
      );
    }

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

