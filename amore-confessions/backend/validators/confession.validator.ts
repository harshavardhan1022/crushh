// ============================================================================
// Anonymous College Confession Platform - Confession Validator
// ============================================================================

import { z } from 'zod';
import {
  DEPARTMENTS,
  BTECH_BRANCHES,
  DEPARTMENT_YEARS,
  ACADEMIC_YEARS,
  MAX_CONFESSION_LENGTH,
  MIN_CONFESSION_LENGTH,
  type Department,
  type BTechBranch,
} from '../config';

/**
 * Zod schema for validating a confession submission.
 * Enforces cross-field rules for departments, branches, and academic years:
 * - B.Tech: Branch is mandatory and must be one of ('CSE', 'CSD', 'ECE', 'Civil', 'Mech')
 * - Other departments: Branch must be null/empty
 * - Academic year: Must match department allowed years
 */
export const confessionSchema = z
  .object({
    senderName: z
      .string()
      .trim()
      .max(100, 'Sender name must be at most 100 characters')
      .optional()
      .nullable(),

    crushName: z
      .string()
      .trim()
      .min(1, 'Crush name is required')
      .max(100, 'Crush name must be at most 100 characters'),

    department: z.enum(DEPARTMENTS, {
      errorMap: () => ({ message: `Department must be one of: ${DEPARTMENTS.join(', ')}` }),
    }),

    branch: z
      .string()
      .trim()
      .optional()
      .nullable(),

    academicYear: z.enum(ACADEMIC_YEARS, {
      errorMap: () => ({ message: `Academic year must be one of: ${ACADEMIC_YEARS.join(', ')}` }),
    }),

    confessionMessage: z
      .string()
      .trim()
      .min(MIN_CONFESSION_LENGTH, `Confession must be at least ${MIN_CONFESSION_LENGTH} characters`)
      .max(MAX_CONFESSION_LENGTH, `Confession must be at most ${MAX_CONFESSION_LENGTH} characters`),

    publicationConsent: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    // 1. Branch validation
    if (data.department === 'B.Tech') {
      if (!data.branch || !BTECH_BRANCHES.includes(data.branch as BTechBranch)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Branch is required for B.Tech and must be one of: ${BTECH_BRANCHES.join(', ')}`,
          path: ['branch'],
        });
      }
    } else {
      if (data.branch !== null && data.branch !== undefined && data.branch !== '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Branch selection is not applicable for this department',
          path: ['branch'],
        });
      }
    }

    // 2. Academic year validation
    const validYears = DEPARTMENT_YEARS[data.department as Department];
    if (!validYears || !validYears.includes(data.academicYear)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid academic year for the selected department',
        path: ['academicYear'],
      });
    }
  });

/** Inferred TypeScript type from the confession schema */
export type ConfessionInput = z.infer<typeof confessionSchema>;

/** Raw input type (before Zod parsing) */
export type ConfessionRawInput = z.input<typeof confessionSchema>;
