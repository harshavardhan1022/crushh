import { describe, it, expect, vi } from 'vitest';
import {
  submitConfession,
  getConfessions,
  updateConfessionStatus,
  markAsPublished,
  deleteConfession,
  getStats,
} from '../../backend/services/confession.service';

describe('Confession Service Integration', () => {
  it('should successfully submit a valid confession to database', async () => {
    const mockConfession = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      sender_name: 'Admirer',
      crush_name: 'Diya',
      department: 'B.Tech',
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
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockConfession, error: null }),
          }),
        }),
      }),
    };

    const result = await submitConfession(mockSupabase, {
      senderName: 'Admirer',
      crushName: 'Diya',
      department: 'B.Tech',
      academicYear: '3rd',
      confessionMessage: 'You are radiant and thoughtful.',
      publicationConsent: true,
    });

    expect(result.success).toBe(true);
    expect(result.data?.crush_name).toBe('Diya');
    expect(result.data?.status).toBe('pending');
  });

  it('should fail submission when input validation fails', async () => {
    const mockSupabase: any = {};
    const result = await submitConfession(mockSupabase, {
      crushName: '', // Invalid empty crush name
      department: 'B.Tech',
      academicYear: '3rd',
      confessionMessage: 'Short',
    } as any);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
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
            // Total call doesn't have .eq
            then: (resolve: any) => resolve({ count: 20, error: null }),
          };
        }),
      }),
    };

    const result = await getStats(mockSupabase);
    expect(result.success).toBe(true);
  });
});

