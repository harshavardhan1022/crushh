// ============================================================================
// Anonymous College Confession Platform - Confession Service
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
  branch: string | null;
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
  branch?: string;
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
  code?: string;
  details?: string;
  hint?: string;
}

export interface ConfessionStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  published: number;
}

// ---------------------------------------------------------------------------
// In-Memory Dev Store (Active only when Supabase is in placeholder/mock mode)
// Uses globalThis to ensure shared state across independent Next.js API route bundles
// ---------------------------------------------------------------------------
const GLOBAL_DEV_STORE_KEY = '__collegeConfessionsDevStore__';

export const isPlaceholderMode = () =>
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

const initialSeedConfessions: Confession[] = [
  {
    id: 'confession-001',
    sender_name: 'Library Regular',
    crush_name: 'Ananya Sharma',
    department: 'B.Tech',
    branch: 'CSE',
    academic_year: '3rd',
    confession_message:
      'Every time you sit by the quiet corner in the central library with your coffee and sketchbook, you brighten up the whole room. I have never had the courage to say hi in person, but your smile is genuinely unforgettable.',
    publication_consent: true,
    status: 'pending',
    instagram_published: false,
    published_at: null,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'confession-002',
    sender_name: null,
    crush_name: 'Rohan Verma',
    department: 'MBA',
    branch: null,
    academic_year: '1st',
    confession_message:
      'Your presentation on campus entrepreneurship was so inspiring! The confidence and humor you brought to the stage made everyone take notice. Hope you know how talented you are.',
    publication_consent: true,
    status: 'approved',
    instagram_published: true,
    published_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'confession-003',
    sender_name: 'A Shy Classmate',
    crush_name: 'Pooja Reddy',
    department: 'Pharm B',
    branch: null,
    academic_year: '2nd',
    confession_message:
      'To the girl in the lab coat who always helps others when experiments get tricky: you have the kindest heart on this entire campus.',
    publication_consent: true,
    status: 'approved',
    instagram_published: false,
    published_at: null,
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: 'confession-004',
    sender_name: null,
    crush_name: 'Karthik Nair',
    department: 'MCA',
    branch: null,
    academic_year: '2nd',
    confession_message:
      'Watching you code during the hackathon was like watching an artist paint. Best of luck on final year placements!',
    publication_consent: false,
    status: 'rejected',
    instagram_published: false,
    published_at: null,
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 72).toISOString(),
  },
  {
    id: 'confession-005',
    sender_name: 'Data Science Lab Peer',
    crush_name: 'Sneha Patel',
    department: 'B.Tech',
    branch: 'CSD',
    academic_year: '2nd',
    confession_message:
      'Your deep learning project explanation blew me away. You are brilliant, humble, and effortlessly graceful.',
    publication_consent: true,
    status: 'approved',
    instagram_published: false,
    published_at: null,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'confession-006',
    sender_name: null,
    crush_name: 'Aditya Rao',
    department: 'B.Tech',
    branch: 'ECE',
    academic_year: '4th',
    confession_message:
      'Always see you in the robotics lab working late hours on microcontroller circuits. Rooting for you!',
    publication_consent: true,
    status: 'pending',
    instagram_published: false,
    published_at: null,
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'confession-007',
    sender_name: 'Survey Camp Friend',
    crush_name: 'Meera Krishnan',
    department: 'B.Tech',
    branch: 'Civil',
    academic_year: '3rd',
    confession_message:
      'Survey camp would have been completely boring without your laughter and jokes. You made the whole batch smile.',
    publication_consent: true,
    status: 'approved',
    instagram_published: false,
    published_at: null,
    created_at: new Date(Date.now() - 3600000 * 10).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 10).toISOString(),
  },
  {
    id: 'confession-008',
    sender_name: null,
    crush_name: 'Vikram Singh',
    department: 'B.Tech',
    branch: 'Mech',
    academic_year: '4th',
    confession_message:
      'To the Mech lead of the college BAJA racing team: the whole college cheered for you at the competition!',
    publication_consent: true,
    status: 'approved',
    instagram_published: false,
    published_at: null,
    created_at: new Date(Date.now() - 3600000 * 14).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 14).toISOString(),
  },
];

export function getDevStore(): Confession[] {
  const g = globalThis as unknown as { [GLOBAL_DEV_STORE_KEY]?: Confession[] };
  if (!g[GLOBAL_DEV_STORE_KEY]) {
    // Clone initial seeds so mutations don't alter base template
    g[GLOBAL_DEV_STORE_KEY] = JSON.parse(JSON.stringify(initialSeedConfessions));
  }
  return g[GLOBAL_DEV_STORE_KEY]!;
}

export function setDevStore(newList: Confession[]) {
  const g = globalThis as unknown as { [GLOBAL_DEV_STORE_KEY]?: Confession[] };
  g[GLOBAL_DEV_STORE_KEY] = newList;
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

  // Sanitize text inputs & set branch based on department
  const sanitized = {
    sender_name: data.senderName ? sanitizeInput(data.senderName) : null,
    crush_name: sanitizeInput(data.crushName),
    department: data.department,
    branch: data.department === 'B.Tech' && data.branch ? data.branch : null,
    academic_year: data.academicYear,
    confession_message: sanitizeInput(data.confessionMessage),
    publication_consent: data.publicationConsent,
    status: 'pending' as const,
    instagram_published: false,
  };

  // Dev fallback using process-wide globalThis store
  if (isPlaceholderMode()) {
    const newConfession: Confession = {
      ...sanitized,
      id: `confession-${Date.now()}`,
      published_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    getDevStore().unshift(newConfession);
    return { success: true, data: newConfession };
  }

  // Attempt insert
  const { data: confession, error } = await supabase
    .from('confessions')
    .insert(sanitized)
    .select()
    .single();

  if (error) {
    console.error('[confession.service] submitConfession database error:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });

    // If SELECT was denied under strict anon INSERT policy, fall back to pure insert without select
    if (
      error.code === 'PGRST116' ||
      error.code === '42501' ||
      error.message?.includes('permission denied') ||
      error.message?.includes('0 rows')
    ) {
      const fallbackInsert = await supabase.from('confessions').insert(sanitized);
      if (!fallbackInsert.error) {
        return {
          success: true,
          data: {
            ...sanitized,
            id: `confession-${Date.now()}`,
            published_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as Confession,
        };
      }
      return {
        success: false,
        error: fallbackInsert.error.message,
        code: fallbackInsert.error.code,
        details: fallbackInsert.error.details,
        hint: fallbackInsert.error.hint,
      };
    }

    return {
      success: false,
      error: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    };
  }

  return {
    success: true,
    data: (confession || {
      ...sanitized,
      id: `confession-${Date.now()}`,
      published_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }) as Confession,
  };
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
    branch,
    year,
    search,
    dateRange,
    sortBy = 'created_at',
    sortOrder = 'desc',
    page = 1,
    limit = 20,
  } = filters;

  if (isPlaceholderMode()) {
    let list = [...getDevStore()];

    if (status) {
      list = list.filter((c) => c.status === status);
    }
    if (department) {
      list = list.filter((c) => c.department === department);
    }
    if (branch) {
      list = list.filter((c) => c.branch === branch);
    }
    if (year) {
      list = list.filter((c) => c.academic_year === year);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.crush_name.toLowerCase().includes(q) ||
          c.confession_message.toLowerCase().includes(q) ||
          (c.sender_name && c.sender_name.toLowerCase().includes(q)) ||
          (c.branch && c.branch.toLowerCase().includes(q)) ||
          c.id.toLowerCase().includes(q)
      );
    }

    // Sort
    list.sort((a, b) => {
      const aVal = a[sortBy] || '';
      const bVal = b[sortBy] || '';
      if (sortOrder === 'asc') return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });

    const totalCount = list.length;
    const from = (page - 1) * limit;
    const paginated = list.slice(from, from + limit);

    return {
      success: true,
      data: paginated,
      count: totalCount,
    };
  }

  let query = supabase.from('confessions').select('*', { count: 'exact' });

  // Apply filters
  if (status) {
    query = query.eq('status', status);
  }

  if (department) {
    query = query.eq('department', department);
  }

  if (branch) {
    query = query.eq('branch', branch);
  }

  if (year) {
    query = query.eq('academic_year', year);
  }

  if (search) {
    query = query.or(
      `crush_name.ilike.%${search}%,confession_message.ilike.%${search}%,sender_name.ilike.%${search}%,branch.ilike.%${search}%`
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
  if (isPlaceholderMode()) {
    const item = getDevStore().find((c) => c.id === id);
    if (!item) return { success: false, error: 'Confession not found' };
    return { success: true, data: item };
  }

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
  if (isPlaceholderMode()) {
    const item = getDevStore().find((c) => c.id === id);
    if (!item) return { success: false, error: 'Confession not found' };
    item.status = newStatus;
    item.updated_at = new Date().toISOString();
    return { success: true, data: item };
  }

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
  if (isPlaceholderMode()) {
    setDevStore(getDevStore().filter((c) => c.id !== id));
    return { success: true };
  }

  const { data: existing } = await supabase
    .from('confessions')
    .select('status')
    .eq('id', id)
    .single();

  const { error } = await supabase.from('confessions').delete().eq('id', id);

  if (error) {
    console.error('[confession.service] deleteConfession error:', error);
    return { success: false, error: error.message };
  }

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
  if (isPlaceholderMode()) {
    const item = getDevStore().find((c) => c.id === id);
    if (!item) return { success: false, error: 'Confession not found' };
    item.instagram_published = true;
    item.published_at = new Date().toISOString();
    return { success: true, data: item };
  }

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
  if (isPlaceholderMode()) {
    const store = getDevStore();
    return {
      success: true,
      data: {
        total: store.length,
        pending: store.filter((c) => c.status === 'pending').length,
        approved: store.filter((c) => c.status === 'approved').length,
        rejected: store.filter((c) => c.status === 'rejected').length,
        published: store.filter((c) => c.instagram_published).length,
      },
    };
  }

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
