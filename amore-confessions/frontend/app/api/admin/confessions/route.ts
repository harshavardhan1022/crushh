// ============================================================================
// Anonymous College Confession Platform - Admin Confessions Listing
// GET /api/admin/confessions
// ============================================================================

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import { extractAuthToken, verifyAdmin } from '@backend/middleware/auth.middleware';
import { getConfessions } from '@backend/services/confession.service';
import type { ConfessionStatus } from '@backend/config';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const supabase = createAdminClient();

    // 1. Verify admin authorization
    const token = extractAuthToken(req);
    const auth = await verifyAdmin(supabase, token);
    if (!auth.authorized) {
      console.warn(`[API /api/admin/confessions] Unauthorized attempt: ${auth.error}`);
      return NextResponse.json(
        { success: false, error: auth.error || 'Unauthorized access' },
        { status: 401 }
      );
    }

    // 2. Parse query parameters
    const url = new URL(req.url);
    const status = url.searchParams.get('status') as ConfessionStatus | null;
    const department = url.searchParams.get('department') || undefined;
    const branch = url.searchParams.get('branch') || undefined;
    const year = url.searchParams.get('year') || undefined;
    const search = url.searchParams.get('search') || undefined;
    const sortByParam = url.searchParams.get('sortBy');
    const sortOrderParam = url.searchParams.get('sortOrder');
    const pageParam = url.searchParams.get('page');
    const limitParam = url.searchParams.get('limit');
    const dateFrom = url.searchParams.get('dateFrom') || undefined;
    const dateTo = url.searchParams.get('dateTo') || undefined;

    const sortBy =
      sortByParam === 'updated_at' || sortByParam === 'crush_name'
        ? sortByParam
        : 'created_at';
    const sortOrder = sortOrderParam === 'asc' ? 'asc' : 'desc';
    const page = pageParam ? Math.max(1, parseInt(pageParam, 10)) : 1;
    const limit = limitParam ? Math.min(100, Math.max(1, parseInt(limitParam, 10))) : 20;

    console.log(
      `[API /api/admin/confessions] Admin query: status=${status ?? 'all'}, dept=${department ?? 'all'}, branch=${branch ?? 'all'}, page=${page}`
    );

    // 3. Fetch confessions
    const result = await getConfessions(supabase, {
      status: status || undefined,
      department,
      branch,
      year,
      search,
      sortBy,
      sortOrder,
      page,
      limit,
      dateRange: dateFrom || dateTo ? { from: dateFrom, to: dateTo } : undefined,
    });

    if (!result.success) {
      console.error(`[API /api/admin/confessions] Service error: ${result.error}`);
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to fetch confessions' },
        { status: 500 }
      );
    }

    console.log(
      `[API /api/admin/confessions] Returning ${result.data?.length ?? 0} confessions (total matching: ${result.count ?? 0})`
    );

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        count: result.count,
        page,
        limit,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (error: any) {
    console.error('[API /api/admin/confessions] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

