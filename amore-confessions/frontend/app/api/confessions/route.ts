// ============================================================================
// Anonymous College Confession Platform - Confession Submission Route
// POST /api/confessions
// ============================================================================

import { NextResponse } from 'next/server';
import { getSubmissionSupabaseClient } from '@/lib/supabase-server';
import { submitConfession } from '@backend/services/confession.service';
import { checkRateLimit } from '@backend/middleware/rateLimit.middleware';
import { RATE_LIMIT } from '@backend/config';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  try {
    // 1. Extract IP for rate limiting
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : realIp || '127.0.0.1';

    // 2. Check rate limit (5 submissions per minute)
    const rateLimit = checkRateLimit(ip, RATE_LIMIT.maxRequests, RATE_LIMIT.windowMs);
    if (!rateLimit.allowed) {
      console.warn(`[API /api/confessions] [${requestId}] Rate limit exceeded for IP: ${ip.substring(0, 7)}...`);
      return NextResponse.json(
        {
          success: false,
          error: `Too many submissions. Please wait ${rateLimit.retryAfter || 60} seconds before trying again.`,
          requestId,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfter || 60),
          },
        }
      );
    }

    // 3. Parse JSON payload
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request body', requestId },
        { status: 400 }
      );
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Request body must be a valid object', requestId },
        { status: 400 }
      );
    }

    const payload = body as Record<string, unknown>;
    console.log(
      `[API /api/confessions] [${requestId}] Submission received: department=${payload.department}, branch=${payload.branch ?? 'N/A'}, year=${payload.academicYear}`
    );

    // 4. Submit via backend confession service using safe submission client
    const supabase = getSubmissionSupabaseClient();
    const result = await submitConfession(supabase, payload as any);

    if (!result.success) {
      console.error(`[API /api/confessions] [${requestId}] Submission failed:`, {
        error: result.error,
        code: result.code,
        details: result.details,
        hint: result.hint,
      });

      // Distinguish client-side validation errors from database server errors
      if (result.code === 'PGRST205' || result.error?.includes('schema cache')) {
        console.error(
          `[API /api/confessions] [${requestId}] CRITICAL: Database table 'public.confessions' does not exist in Supabase! Run production_schema.sql in Supabase SQL editor.`
        );
        return NextResponse.json(
          {
            success: false,
            error: 'Database table configuration in progress. Please contact the administrator or try again shortly.',
            requestId,
          },
          { status: 503 }
        );
      }

      // Check for validation error (no database error code)
      if (!result.code) {
        return NextResponse.json(
          { success: false, error: result.error || 'Invalid submission payload', requestId },
          { status: 400 }
        );
      }

      // Database error
      return NextResponse.json(
        {
          success: false,
          error: 'Unable to submit your confession at this time. Please try again later.',
          requestId,
        },
        { status: 500 }
      );
    }

    console.log(`[API /api/confessions] [${requestId}] Successfully stored confession record`);

    // 5. Safe acknowledgement response: Do not leak submission details or database ID
    return NextResponse.json(
      {
        success: true,
        message: 'Your confession has been sent!',
        requestId,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error(`[API /api/confessions] [${requestId}] Unexpected error:`, error?.message || error);
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected server error occurred. Please try again later.',
        requestId,
      },
      { status: 500 }
    );
  }
}
