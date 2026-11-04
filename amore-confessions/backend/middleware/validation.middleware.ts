// ============================================================================
// Amore Anonymous College Confession Platform - Validation Middleware
// ============================================================================

/**
 * Sanitize a string to prevent XSS and malicious script/HTML injection.
 * Removes HTML tags, strips null bytes, and trims whitespace.
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    // Remove null bytes
    .replace(/\0/g, '')
    // Strip HTML script tags and content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Strip general HTML tags
    .replace(/<[^>]*>/g, '')
    // Replace common dangerous HTML entities
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    // Trim leading/trailing whitespace
    .trim();
}

/**
 * Validate that an object has no dangerous keys (prototype pollution prevention).
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const clean = {} as Record<string, unknown>;
  const forbiddenKeys = ['__proto__', 'constructor', 'prototype'];

  for (const [key, value] of Object.entries(obj)) {
    if (forbiddenKeys.includes(key)) {
      continue;
    }
    if (typeof value === 'string') {
      clean[key] = sanitizeInput(value);
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      clean[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      clean[key] = value;
    }
  }

  return clean as T;
}

