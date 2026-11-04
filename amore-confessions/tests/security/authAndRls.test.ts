import { describe, it, expect, vi } from 'vitest';
import {
  verifyAdmin,
  extractAuthToken,
} from '../../backend/middleware/auth.middleware';
import fs from 'fs';
import path from 'path';

describe('Admin Authentication & Authorization Security', () => {
  it('should extract Bearer token from authorization header', () => {
    const req = new Request('http://localhost:3000/api/admin/confessions', {
      headers: {
        authorization: 'Bearer secret-jwt-token-12345',
      },
    });

    const token = extractAuthToken(req);
    expect(token).toBe('secret-jwt-token-12345');
  });

  it('should extract token from cookie when header is absent', () => {
    const req = new Request('http://localhost:3000/api/admin/confessions', {
      headers: {
        cookie: 'amore-admin-token=cookie-jwt-token-67890; other=val',
      },
    });

    const token = extractAuthToken(req);
    expect(token).toBe('cookie-jwt-token-67890');
  });

  it('should reject authentication when token is invalid or missing', async () => {
    const mockSupabase: any = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: new Error('Invalid JWT'),
        }),
      },
    };

    const result = await verifyAdmin(mockSupabase, 'invalid-token');
    expect(result.authorized).toBe(false);
    expect(result.error).toBe('Not authenticated');
  });

  it('should reject authorization if user is authenticated but not an admin in admin_profiles', async () => {
    const mockSupabase: any = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'regular-user-id' } },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null, // No admin profile found
                error: new Error('Record not found'),
              }),
            }),
          }),
        }),
      }),
    };

    const result = await verifyAdmin(mockSupabase, 'valid-user-token');
    expect(result.authorized).toBe(false);
    expect(result.error).toContain('Not authorized');
  });

  it('should authorize user when identity and admin profile are verified', async () => {
    const mockSupabase: any = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'admin-user-id' } },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'admin-user-id', role: 'admin' },
                error: null,
              }),
            }),
          }),
        }),
      }),
    };

    const result = await verifyAdmin(mockSupabase, 'admin-token');
    expect(result.authorized).toBe(true);
    expect(result.userId).toBe('admin-user-id');
  });
});

describe('Database RLS Policy Security Verification', () => {
  it('should verify that policies.sql contains no public SELECT policy for confessions', () => {
    const policiesPath = path.resolve(__dirname, '../../backend/database/policies.sql');
    const policiesSql = fs.readFileSync(policiesPath, 'utf8');

    // Verify RLS is enabled on all tables
    expect(policiesSql).toContain('ALTER TABLE confessions ENABLE ROW LEVEL SECURITY;');
    expect(policiesSql).toContain('ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;');
    expect(policiesSql).toContain('ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;');

    // Verify there is NO public SELECT policy for confessions
    expect(policiesSql).not.toContain('anon_can_read_approved_confessions');
    expect(policiesSql).not.toContain('anon_can_read_confessions');

    // Verify admin read policy exists
    expect(policiesSql).toContain('admin_can_read_confessions');

    // Verify admin update & delete policies exist
    expect(policiesSql).toContain('admin_can_update_confessions');
    expect(policiesSql).toContain('admin_can_delete_confessions');
  });

  it('should verify that admin self-assignment is prevented in policies', () => {
    const policiesPath = path.resolve(__dirname, '../../backend/database/policies.sql');
    const policiesSql = fs.readFileSync(policiesPath, 'utf8');

    // Verify non-service_role cannot insert into admin_profiles
    expect(policiesSql).toContain('service_role_full_access_admin_profiles');
  });
});

