import { describe, it, expect } from 'vitest';
import { confessionSchema } from '../../backend/validators/confession.validator';
import { sanitizeInput, sanitizeObject } from '../../backend/middleware/validation.middleware';
import { DEPARTMENT_YEARS, DEPARTMENTS } from '../../backend/config';

describe('Confession Validation & Department/Year Combinations', () => {
  it('should accept valid confessions for all valid department and year combinations', () => {
    for (const dept of DEPARTMENTS) {
      const years = DEPARTMENT_YEARS[dept];
      for (const year of years) {
        const input = {
          crushName: 'Ananya',
          department: dept,
          academicYear: year,
          confessionMessage: 'I really admire your kindness and dedication in class.',
          publicationConsent: true,
        };
        const result = confessionSchema.safeParse(input);
        expect(result.success).toBe(true);
      }
    }
  });

  it('should reject invalid department/year combinations', () => {
    // MBA is only 1st and 2nd year
    const invalidMBA = confessionSchema.safeParse({
      crushName: 'Rahul',
      department: 'MBA',
      academicYear: '4th',
      confessionMessage: 'Great presentation in seminar yesterday!',
    });
    expect(invalidMBA.success).toBe(false);

    // MCA is only 1st and 2nd year
    const invalidMCA = confessionSchema.safeParse({
      crushName: 'Priya',
      department: 'MCA',
      academicYear: '3rd',
      confessionMessage: 'You are an awesome programmer and teammate.',
    });
    expect(invalidMCA.success).toBe(false);

    // Pharm B is 1st-4th
    const invalidPharmB = confessionSchema.safeParse({
      crushName: 'Kavya',
      department: 'Pharm B',
      academicYear: '5th',
      confessionMessage: 'Hope you had a wonderful lab session today.',
    });
    expect(invalidPharmB.success).toBe(false);
  });

  it('should allow optional sender name or empty string', () => {
    const withSender = confessionSchema.safeParse({
      senderName: 'Secret Admirer',
      crushName: 'Simran',
      department: 'B.Tech',
      academicYear: '2nd',
      confessionMessage: 'I love seeing your bright smile every morning!',
    });
    expect(withSender.success).toBe(true);

    const withoutSender = confessionSchema.safeParse({
      senderName: '',
      crushName: 'Simran',
      department: 'B.Tech',
      academicYear: '2nd',
      confessionMessage: 'I love seeing your bright smile every morning!',
    });
    expect(withoutSender.success).toBe(true);
  });

  it('should reject empty or whitespace-only confessions', () => {
    const empty = confessionSchema.safeParse({
      crushName: 'Simran',
      department: 'B.Tech',
      academicYear: '2nd',
      confessionMessage: '         ',
    });
    expect(empty.success).toBe(false);
  });

  it('should reject confessions that are too short (under 10 chars)', () => {
    const tooShort = confessionSchema.safeParse({
      crushName: 'Simran',
      department: 'B.Tech',
      academicYear: '2nd',
      confessionMessage: 'Hi crush',
    });
    expect(tooShort.success).toBe(false);
  });

  it('should reject confessions that exceed the maximum length (over 2000 chars)', () => {
    const tooLong = confessionSchema.safeParse({
      crushName: 'Simran',
      department: 'B.Tech',
      academicYear: '2nd',
      confessionMessage: 'A'.repeat(2001),
    });
    expect(tooLong.success).toBe(false);
  });
});

describe('Sanitization & XSS Prevention', () => {
  it('should strip script tags and HTML injection from input', () => {
    const raw = '<script>alert("xss")</script>Hello, <b>beautiful</b> world!';
    const sanitized = sanitizeInput(raw);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('</script>');
    expect(sanitized).not.toContain('<b>');
    expect(sanitized).toBe('Hello, beautiful world!');
  });

  it('should strip javascript: pseudoprotocol and inline event handlers', () => {
    const raw = 'Check this out <img src="x" onerror="stealCookies()">';
    const sanitized = sanitizeInput(raw);
    expect(sanitized).not.toContain('onerror');
    expect(sanitized).not.toContain('<img');
  });

  it('should sanitize nested objects and prevent prototype pollution', () => {
    const maliciousObj = {
      crushName: '<b>Rohan</b>',
      __proto__: { isAdmin: true },
    } as any;
    const clean = sanitizeObject(maliciousObj);
    expect(clean.crushName).toBe('Rohan');
    expect((clean as any).isAdmin).toBeUndefined();
  });
});

