// ============================================================================
// Amore Anonymous College Confession Platform - Confession Service
// ============================================================================

import { SupabaseClient } from '@supabase/supabase-js';
import { confessionSchema, type ConfessionRawInput } from '../validators/confession.validator';
import { sanitizeInput } from '../middleware/validation.middleware';
import type { ConfessionStatus } from '../config';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Confession {
  id: string;
  sender_name: string | null;
  crush_name: string;
  department: string;
  academic_year: string;
  confession_message: string;
  publication_consent: boolean;
  status: ConfessionStatus;
  instagram_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConfessionFilters {
  status?: ConfessionStatus;
  department?: string;
  year?: string;
  search?: string;
  dateRange?: { from?: string; to?: string };
  sortBy?: 'created_at' | 'updated_at' | 'crush_name';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ServiceResult<T = unknown> {
  success: boolean;
  data?: T;
  count?: number;
  error?: string;
}

export interface ConfessionStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  published: number;
}

// ---------------------------------------------------------------------------
// Service Functions
// ---------------------------------------------------------------------------

/**
 * Submit a new confession. Validates input with Zod and sanitizes text fields.
 */
export async function submitConfession(
  supabase: SupabaseClient,
  rawData: ConfessionRawInput
): Promise<ServiceResult<Confession>> {
  // Validate
  const parsed = confessionSchema.safeParse(rawData);
  if (!parsed.success) {
    const errorMessages = parsed.error.errors.map((e) => e.message).join(', ');
    return { success: false, error: errorMessages };
  }

  const data = parsed.data;

  // Sanitize text inputs
  const sanitized = {
    sender_name: data.senderName ? sanitizeInput(data.senderName) : null,
    crush_name: sanitizeInput(data.crushName),
    department: data.department,
    academic_year: data.academicYear,
    confession_message: sanitizeInput(data.confessionMessage),
    publication_consent: data.publicationConsent,
    status: 'pending' as const,
    instagram_published: false,
  };

  const { data: confession, error } = await supabase
    .from('confessions')
    .insert(sanitized)
    .select()
    .single();

  if (error) {
    console.error('[confession.service] submitConfession error:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data: confession as Confession };
}

/**
 * Get confessions with filtering, searching, sorting, and pagination.
 */
export async function getConfessions(
  supabase: SupabaseClient,
  filters: ConfessionFilters = {}
): Promise<ServiceResult<Confession[]>> {
  const {
    status,
    department,
    year,
    search,
    dateRange,
    sortBy = 'created_at',
    sortOrder = 'desc',
    page = 1,
    limit = 20,
  } = filters;

  let query = supabase
    .from('confessions')
    .select('*', { count: 'exact' });

  // Apply filters
  if (status) {
    query = query.eq('status', status);
  }

  if (department) {
    query = query.eq('department', department);
  }

  if (year) {
    query = query.eq('academic_year', year);
  }

  if (search) {
    query = query.or(
      `crush_name.ilike.%${search}%,confession_message.ilike.%${search}%,sender_name.ilike.%${search}%`
    );
  }

  if (dateRange?.from) {
    query = query.gte('created_at', dateRange.from);
  }

  if (dateRange?.to) {
    query = query.lte('created_at', dateRange.to);
  }

  // Apply sorting
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });

  // Apply pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) {
    console.error('[confession.service] getConfessions error:', error);
    return { success: false, error: error.message };
  }

  return {
    success: true,
    data: (data as Confession[]) ?? [],
    count: count ?? 0,
  };
}

/**
 * Get a single confession by ID.
 */
export async function getConfessionById(
  supabase: SupabaseClient,
  id: string
): Promise<ServiceResult<Confession>> {
  const { data, error } = await supabase
    .from('confessions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('[confession.service] getConfessionById error:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data: data as Confession };
}

/**
 * Update the status of a confession and create a moderation log entry.
 */
export async function updateConfessionStatus(
  supabase: SupabaseClient,
  id: string,
  adminId: string,
  newStatus: ConfessionStatus,
  previousStatus: string
): Promise<ServiceResult<Confession>> {
  // Update the confession status
  const { data: confession, error: updateError } = await supabase
    .from('confessions')
    .update({ status: newStatus })
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    console.error('[confession.service] updateConfessionStatus error:', updateError);
    return { success: false, error: updateError.message };
  }

  // Create moderation log
  const { error: logError } = await supabase.from('moderation_logs').insert({
    confession_id: id,
    admin_id: adminId,
    action: `status_change_${newStatus}`,
    previous_status: previousStatus,
    new_status: newStatus,
    notes: `Status changed from "${previousStatus}" to "${newStatus}"`,
  });

  if (logError) {
    console.error('[confession.service] moderation log error:', logError);
    // Don't fail the whole operation if logging fails
  }

  return { success: true, data: confession as Confession };
}

/**
 * Delete a confession and log the action.
 */
export async function deleteConfession(
  supabase: SupabaseClient,
  id: string,
  adminId: string
): Promise<ServiceResult<void>> {
  // Fetch confession before deleting for the log
  const { data: existing } = await supabase
    .from('confessions')
    .select('status')
    .eq('id', id)
    .single();

  const { error } = await supabase
    .from('confessions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[confession.service] deleteConfession error:', error);
    return { success: false, error: error.message };
  }

  // Create moderation log (confession_id will be SET NULL due to ON DELETE SET NULL)
  const { error: logError } = await supabase.from('moderation_logs').insert({
    confession_id: null,
    admin_id: adminId,
    action: 'delete',
    previous_status: existing?.status ?? 'unknown',
    new_status: null,
    notes: `Confession ${id} deleted`,
  });

  if (logError) {
    console.error('[confession.service] moderation log error:', logError);
  }

  return { success: true };
}

/**
 * Mark a confession as published to Instagram.
 */
export async function markAsPublished(
  supabase: SupabaseClient,
  id: string,
  adminId: string
): Promise<ServiceResult<Confession>> {
  const { data: confession, error } = await supabase
    .from('confessions')
    .update({
      instagram_published: true,
      published_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[confession.service] markAsPublished error:', error);
    return { success: false, error: error.message };
  }

  // Create moderation log
  const { error: logError } = await supabase.from('moderation_logs').insert({
    confession_id: id,
    admin_id: adminId,
    action: 'instagram_publish',
    previous_status: confession?.status,
    new_status: confession?.status,
    notes: 'Marked as published to Instagram',
  });

  if (logError) {
    console.error('[confession.service] moderation log error:', logError);
  }

  return { success: true, data: confession as Confession };
}

/**
 * Get aggregate statistics for confessions.
 */
export async function getStats(
  supabase: SupabaseClient
): Promise<ServiceResult<ConfessionStats>> {
  // Fetch all counts in parallel
  const [totalRes, pendingRes, approvedRes, rejectedRes, publishedRes] =
    await Promise.all([
      supabase.from('confessions').select('*', { count: 'exact', head: true }),
      supabase.from('confessions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('confessions').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from('confessions').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
      supabase.from('confessions').select('*', { count: 'exact', head: true }).eq('instagram_published', true),
    ]);

  const error =
    totalRes.error || pendingRes.error || approvedRes.error || rejectedRes.error || publishedRes.error;

  if (error) {
    console.error('[confession.service] getStats error:', error);
    return { success: false, error: error.message };
  }

  return {
    success: true,
    data: {
      total: totalRes.count ?? 0,
      pending: pendingRes.count ?? 0,
      approved: approvedRes.count ?? 0,
      rejected: rejectedRes.count ?? 0,
      published: publishedRes.count ?? 0,
    },
  };
}
