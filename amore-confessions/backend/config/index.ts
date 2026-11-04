// ============================================================================
// Amore Anonymous College Confession Platform - Configuration
// ============================================================================

/** All available departments */
export const DEPARTMENTS = [
  'B.Tech',
  'MBA',
  'MCA',
  'Pharm B',
  'Pharm D',
] as const;

/** Valid academic years per department */
export const DEPARTMENT_YEARS: Record<(typeof DEPARTMENTS)[number], string[]> = {
  'B.Tech': ['1st', '2nd', '3rd', '4th', 'Graduated'],
  'MBA': ['1st', '2nd'],
  'MCA': ['1st', '2nd'],
  'Pharm B': ['1st', '2nd', '3rd', '4th'],
  'Pharm D': ['1st', '2nd', '3rd', '4th', '5th'],
};

/** All possible academic year values (union of all department years) */
export const ACADEMIC_YEARS = [
  '1st',
  '2nd',
  '3rd',
  '4th',
  '5th',
  'Graduated',
] as const;

/** Allowed confession statuses */
export const CONFESSION_STATUSES = ['pending', 'approved', 'rejected'] as const;

/** Maximum allowed confession message length */
export const MAX_CONFESSION_LENGTH = 2000;

/** Minimum allowed confession message length */
export const MIN_CONFESSION_LENGTH = 10;

/** Rate limiting configuration */
export const RATE_LIMIT = {
  /** Time window in milliseconds (1 minute) */
  windowMs: 60_000,
  /** Maximum requests per window */
  maxRequests: 5,
} as const;

/** Type helpers */
export type Department = (typeof DEPARTMENTS)[number];
export type AcademicYear = (typeof ACADEMIC_YEARS)[number];
export type ConfessionStatus = (typeof CONFESSION_STATUSES)[number];
