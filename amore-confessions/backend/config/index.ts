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

/** Allowed branches for B.Tech */
export const BTECH_BRANCHES = [
  'CSE',
  'CSD',
  'ECE',
  'Civil',
  'Mech',
] as const;

/** Full display labels for B.Tech branches */
export const BTECH_BRANCH_LABELS: Record<(typeof BTECH_BRANCHES)[number], string> = {
  CSE: 'CSE – Computer Science and Engineering',
  CSD: 'CSD – Computer Science and Data Science',
  ECE: 'ECE – Electronics and Communication Engineering',
  Civil: 'Civil – Civil Engineering',
  Mech: 'Mech – Mechanical Engineering',
};

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
export type BTechBranch = (typeof BTECH_BRANCHES)[number];
export type AcademicYear = (typeof ACADEMIC_YEARS)[number];
export type ConfessionStatus = (typeof CONFESSION_STATUSES)[number];

/** Check if a department requires branch selection */
export function hasBranches(department: string): boolean {
  return department === 'B.Tech';
}

/** Get list of available branches for a department */
export function getBranchesForDepartment(department: string): readonly BTechBranch[] {
  if (department === 'B.Tech') {
    return BTECH_BRANCHES;
  }
  return [];
}

/** Get available academic years for a department */
export function getYearsForDepartment(department: string): string[] {
  return DEPARTMENT_YEARS[department as Department] || [];
}

/** Validate whether a department, branch, and academic year combination is valid */
export function isValidCombination(
  department: string,
  branch: string | null | undefined,
  academicYear: string
): boolean {
  if (!DEPARTMENTS.includes(department as Department)) {
    return false;
  }

  // B.Tech requires a valid branch
  if (department === 'B.Tech') {
    if (!branch || !BTECH_BRANCHES.includes(branch as BTechBranch)) {
      return false;
    }
  } else {
    // Non-B.Tech MUST NOT have a branch
    if (branch !== null && branch !== undefined && branch !== '') {
      return false;
    }
  }

  const validYears = DEPARTMENT_YEARS[department as Department];
  return validYears ? validYears.includes(academicYear) : false;
}
