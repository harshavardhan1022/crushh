// ============================================================================
// Anonymous College Confession Platform - Confession Details & Actions
// GET, PATCH, DELETE /api/admin/confessions/[id]
// ============================================================================

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import { extractAuthToken, verifyAdmin } from '@backend/middleware/auth.middleware';
import {
  getConfessionById,
  updateConfessionStatus,
  deleteConfession,
  markAsPublished,
} from '@backend/services/confession.service';
import type { ConfessionStatus } from '@backend/config';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET: Fetch a single confession by ID with complete details
 */
export async function GET(req: Request, { params }: RouteParams) {
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

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Confession ID is required' },
        { status: 400 }
      );
    }

    const result = await getConfessionById(supabase, id);
    if (!result.success || !result.data) {
      return NextResponse.json(
        { success: false, error: result.error || 'Confession not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error: any) {
    console.error('[API /api/admin/confessions/[id]] GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH: Update confession status (approve/reject/publish)
 */
export async function PATCH(req: Request, { params }: RouteParams) {
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

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Confession ID is required' },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request body' },
        { status: 400 }
      );
    }

    const { action, status } = body as { action?: string; status?: ConfessionStatus };

    // Action 1: Mark as published on Instagram
    if (action === 'publish' || action === 'instagram_publish') {
      // Check if publication consent was given
      const current = await getConfessionById(supabase, id);
      if (!current.success || !current.data) {
        return NextResponse.json(
          { success: false, error: 'Confession not found' },
          { status: 404 }
        );
      }

      if (!current.data.publication_consent) {
        return NextResponse.json(
          {
            success: false,
            error: 'Cannot publish to Instagram: Student did not provide publication consent.',
          },
          { status: 400 }
        );
      }

      const publishResult = await markAsPublished(supabase, id, auth.userId);
      if (!publishResult.success) {
        return NextResponse.json(
          { success: false, error: publishResult.error || 'Failed to mark as published' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: publishResult.data,
        message: 'Confession marked as published on Instagram',
      });
    }

    // Action 2: Change moderation status
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      const current = await getConfessionById(supabase, id);
      if (!current.success || !current.data) {
        return NextResponse.json(
          { success: false, error: 'Confession not found' },
          { status: 404 }
        );
      }

      const updateResult = await updateConfessionStatus(
        supabase,
        id,
        auth.userId,
        status,
        current.data.status
      );

      if (!updateResult.success) {
        return NextResponse.json(
          { success: false, error: updateResult.error || 'Failed to update confession status' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: updateResult.data,
        message: `Confession status updated to ${status}`,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid update action or status' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('[API /api/admin/confessions/[id]] PATCH error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Delete a confession record
 */
export async function DELETE(req: Request, { params }: RouteParams) {
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

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Confession ID is required' },
        { status: 400 }
      );
    }

    const deleteResult = await deleteConfession(supabase, id, auth.userId);
    if (!deleteResult.success) {
      return NextResponse.json(
        { success: false, error: deleteResult.error || 'Failed to delete confession' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Confession deleted successfully',
    });
  } catch (error: any) {
    console.error('[API /api/admin/confessions/[id]] DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

