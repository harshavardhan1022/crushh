import { describe, it, expect, beforeEach } from 'vitest';
import {
  checkRateLimit,
  resetRateLimit,
  clearAllRateLimits,
} from '../../backend/middleware/rateLimit.middleware';

describe('Rate Limiter Middleware', () => {
  beforeEach(() => {
    clearAllRateLimits();
  });

  it('should allow requests within the limit', () => {
    const ip = '192.168.1.100';
    for (let i = 0; i < 5; i++) {
      const res = checkRateLimit(ip, 5, 60_000);
      expect(res.allowed).toBe(true);
    }
  });

  it('should block the request when limit is exceeded', () => {
    const ip = '192.168.1.101';
    for (let i = 0; i < 5; i++) {
      checkRateLimit(ip, 5, 60_000);
    }
    const blocked = checkRateLimit(ip, 5, 60_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it('should track different IPs independently', () => {
    const ip1 = '10.0.0.1';
    const ip2 = '10.0.0.2';

    // Exhaust ip1 limit
    for (let i = 0; i < 5; i++) {
      checkRateLimit(ip1, 5, 60_000);
    }
    expect(checkRateLimit(ip1, 5, 60_000).allowed).toBe(false);

    // ip2 should still be allowed
    expect(checkRateLimit(ip2, 5, 60_000).allowed).toBe(true);
  });

  it('should allow resetting an IP limit', () => {
    const ip = '172.16.0.5';
    for (let i = 0; i < 5; i++) {
      checkRateLimit(ip, 5, 60_000);
    }
    expect(checkRateLimit(ip, 5, 60_000).allowed).toBe(false);

    resetRateLimit(ip);
    expect(checkRateLimit(ip, 5, 60_000).allowed).toBe(true);
  });
});

