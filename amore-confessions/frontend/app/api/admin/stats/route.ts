// ============================================================================
// Anonymous College Confession Platform - Admin Dashboard Statistics
// GET /api/admin/stats
// ============================================================================

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import { extractAuthToken, verifyAdmin } from '@backend/middleware/auth.middleware';
import { getStats } from '@backend/services/confession.service';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const supabase = createAdminClient();
    const token = extractAuthToken(req);
    const auth = await verifyAdmin(supabase, token);

    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await getStats(supabase);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to fetch statistics' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error: any) {
    console.error('[API /api/admin/stats] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

