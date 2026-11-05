# Backend Architecture & Services

This directory contains the core business logic, database migrations, security policies, validation schemas, and service functions for **Anonymous College Confessions**.

## Directory Structure

```text
backend/
├── config/
│   └── index.ts                 # Central constants, departments, years, rate limits
├── database/
│   ├── schema.sql               # PostgreSQL tables, triggers, and indexes
│   ├── policies.sql             # Row Level Security (RLS) policies
│   └── migrations/
│       └── 001_initial_schema.sql # Consolidated initial migration
├── middleware/
│   ├── auth.middleware.ts       # Admin verification and token extraction
│   ├── rateLimit.middleware.ts  # In-memory sliding window rate limiter
│   └── validation.middleware.ts # Input sanitization, XSS & prototype pollution prevention
├── services/
│   ├── confession.service.ts    # Confession submission, filtering, moderation, & stats
│   ├── admin.service.ts         # Admin authentication, profile lookup, password updates
│   └── instagram.service.ts     # Instagram story card 1080×1920 layout template
├── validators/
│   └── confession.validator.ts  # Zod schema with cross-field department/year rules
└── README.md
```

## Security & Principles

1. **Strict Server-Side Boundary**: Services in this directory interface directly with the database via `service_role` when called from authenticated API routes. They must never be imported into client components.
2. **Input Sanitization**: All text input is stripped of HTML scripts and dangerous tags using `sanitizeInput` before persistence.
3. **RLS Guarantee**: Public users have zero SELECT access on confessions. Anonymous users can never query submitted records.
4. **Publication Consent**: Confessions cannot be published to Instagram unless `publication_consent` is explicitly `true`.

