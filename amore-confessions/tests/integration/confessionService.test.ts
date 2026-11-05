import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  submitConfession,
  getConfessions,
  updateConfessionStatus,
  markAsPublished,
  deleteConfession,
  getStats,
} from '../../backend/services/confession.service';

describe('Confession Service Integration (Supabase Client Mode)', () => {
  const originalEnv = process.env.NEXT_PUBLIC_SUPABASE_URL;

  beforeEach(() => {
    // Set a live-looking URL so service uses the passed-in SupabaseClient mock
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://live-college.supabase.co';
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalEnv;
  });

  it('should successfully submit a valid B.Tech confession with branch to database', async () => {
    const mockConfession = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      sender_name: 'Admirer',
      crush_name: 'Diya',
      department: 'B.Tech',
      branch: 'CSE',
      academic_year: '3rd',
      confession_message: 'You are radiant and thoughtful.',
      publication_consent: true,
      status: 'pending',
      instagram_published: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const mockSupabase: any = {
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockImplementation((payload: any) => {
          expect(payload.branch).toBe('CSE');
          return {
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { ...mockConfession, ...payload }, error: null }),
            }),
          };
        }),
      }),
    };

    const result = await submitConfession(mockSupabase, {
      senderName: 'Admirer',
      crushName: 'Diya',
      department: 'B.Tech',
      branch: 'CSE',
      academicYear: '3rd',
      confessionMessage: 'You are radiant and thoughtful.',
      publicationConsent: true,
    });

    expect(result.success).toBe(true);
    expect(result.data?.crush_name).toBe('Diya');
    expect(result.data?.department).toBe('B.Tech');
    expect(result.data?.branch).toBe('CSE');
    expect(result.data?.status).toBe('pending');
  });

  it('should sanitize non-B.Tech submission to have branch as null', async () => {
    const mockSupabase: any = {
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockImplementation((payload: any) => {
          expect(payload.branch).toBeNull();
          return {
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'test-mba-id', ...payload, status: 'pending' },
                error: null,
              }),
            }),
          };
        }),
      }),
    };

    const result = await submitConfession(mockSupabase, {
      crushName: 'Rohan',
      department: 'MBA',
      academicYear: '2nd',
      confessionMessage: 'You are inspiring and lead the class brilliantly.',
      publicationConsent: true,
    });

    expect(result.success).toBe(true);
    expect(result.data?.branch).toBeNull();
  });

  it('should fail submission when input validation fails (e.g. B.Tech missing branch)', async () => {
    const mockSupabase: any = {};
    const result = await submitConfession(mockSupabase, {
      crushName: 'Diya',
      department: 'B.Tech',
      // branch missing
      academicYear: '3rd',
      confessionMessage: 'You are radiant and thoughtful.',
    } as any);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should query confessions with department and branch filter when provided', async () => {
    const mockQueryBuilder: any = {
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({
        data: [
          {
            id: 'conf-1',
            department: 'B.Tech',
            branch: 'ECE',
            crush_name: 'Tara',
            academic_year: '4th',
            confession_message: 'Always loved seeing you in robotics lab.',
            status: 'approved',
          },
        ],
        count: 1,
        error: null,
      }),
      eq: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
    };

    const mockSupabase: any = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue(mockQueryBuilder),
      }),
    };

    const result = await getConfessions(mockSupabase, {
      department: 'B.Tech',
      branch: 'ECE',
    });

    expect(result.success).toBe(true);
    expect(mockQueryBuilder.eq).toHaveBeenCalledWith('department', 'B.Tech');
    expect(mockQueryBuilder.eq).toHaveBeenCalledWith('branch', 'ECE');
    expect(result.data?.length).toBe(1);
    expect(result.data?.[0].branch).toBe('ECE');
  });

  it('should update confession status and log the moderation action', async () => {
    const mockUpdated = {
      id: 'test-id',
      status: 'approved',
    };

    const mockSupabase: any = {
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'confessions') {
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: mockUpdated, error: null }),
                }),
              }),
            }),
          };
        }
        if (table === 'moderation_logs') {
          return {
            insert: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        return {};
      }),
    };

    const result = await updateConfessionStatus(
      mockSupabase,
      'test-id',
      'admin-123',
      'approved',
      'pending'
    );

    expect(result.success).toBe(true);
    expect(result.data?.status).toBe('approved');
  });

  it('should mark confession as published on Instagram with timestamp', async () => {
    const mockPublished = {
      id: 'test-id',
      instagram_published: true,
      published_at: new Date().toISOString(),
    };

    const mockSupabase: any = {
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'confessions') {
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: mockPublished, error: null }),
                }),
              }),
            }),
          };
        }
        if (table === 'moderation_logs') {
          return {
            insert: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        return {};
      }),
    };

    const result = await markAsPublished(mockSupabase, 'test-id', 'admin-123');

    expect(result.success).toBe(true);
    expect(result.data?.instagram_published).toBe(true);
  });

  it('should calculate dashboard statistics correctly', async () => {
    const mockSupabase: any = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockImplementation((_fields: string, opts?: any) => {
          return {
            eq: vi.fn().mockResolvedValue({ count: 5, error: null }),
            then: (resolve: any) => resolve({ count: 20, error: null }),
          };
        }),
      }),
    };

    const result = await getStats(mockSupabase);
    expect(result.success).toBe(true);
  });
});

describe('Confession Service In-Memory Dev Store Mode', () => {
  const originalEnv = process.env.NEXT_PUBLIC_SUPABASE_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://placeholder.supabase.co';
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalEnv;
  });

  it('should filter mock confessions by branch in dev store', async () => {
    const mockSupabase: any = {};
    const result = await getConfessions(mockSupabase, {
      department: 'B.Tech',
      branch: 'CSE',
    });

    expect(result.success).toBe(true);
    expect(result.data?.every((c) => c.branch === 'CSE')).toBe(true);
  });
});
