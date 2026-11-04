// ============================================================================
// Amore Anonymous College Confession Platform - Confession Validator
// ============================================================================

import { z } from 'zod';
import {
  DEPARTMENTS,
  DEPARTMENT_YEARS,
  ACADEMIC_YEARS,
  MAX_CONFESSION_LENGTH,
  MIN_CONFESSION_LENGTH,
  type Department,
} from '../config';

/**
 * Zod schema for validating a confession submission.
 * Includes cross-field validation for department/year combinations.
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
  .refine(
    (data) => {
      const validYears = DEPARTMENT_YEARS[data.department as Department];
      return validYears ? validYears.includes(data.academicYear) : false;
    },
    {
      message: 'Invalid academic year for the selected department',
      path: ['academicYear'],
    }
  );

/** Inferred TypeScript type from the confession schema */
export type ConfessionInput = z.infer<typeof confessionSchema>;

/** Raw input type (before Zod parsing) */
export type ConfessionRawInput = z.input<typeof confessionSchema>;
