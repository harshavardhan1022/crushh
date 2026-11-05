# Anonymous College Confessions Platform

> "Some feelings deserve to be heard."

**College Confessions** is a modern, romantic, production-ready anonymous confession platform created for college students. Students can share their feelings for campus crushes safely and completely anonymously without creating an account. Submissions are reviewed by an authorized administrator who moderates content and generates 1080×1920 Instagram Story cards for the college Instagram page.

---

## Table of Contents

1. [Features](#features)
2. [Technology Stack](#technology-stack)
3. [Folder Structure](#folder-structure)
4. [Prerequisites & Environment Setup](#prerequisites--environment-setup)
5. [Supabase Database Configuration](#supabase-database-configuration)
6. [Administrator Provisioning](#administrator-provisioning)
7. [Installation & Local Development](#installation--local-development)
8. [Testing & Verification](#testing--verification)
9. [Deployment Guide (Vercel + Supabase)](#deployment-guide-vercel--supabase)
10. [Security Implementation Audit](#security-implementation-audit)
11. [Troubleshooting Guide](#troubleshooting-guide)
12. [Deployment Checklist](#deployment-checklist)

---

## Features

### Student Experience
- **100% Anonymous Submissions**: No student accounts, no passwords, no email tracking.
- **Dynamic Academic Year Selection**: Dynamic dropdown populated strictly according to the selected department (`B.Tech`, `MBA`, `MCA`, `Pharm B`, `Pharm D`).
- **Live Character Counter & Validation**: Instant feedback, minimum 10 characters, maximum 2,000 characters.
- **Publication Consent Control**: Explicit checkbox granting or withholding permission for Instagram publication.
- **Interactive Signature Pixel Heart**: Custom pixel-style trailing heart cursor on desktop and responsive heart bursts on mobile touch devices.
- **Dark Mode & Light Mode**: Complete romantic aesthetic with CSS variables and zero flash on load.

### Single-Administrator Portal
- **Strict Role-Based Access Control**: Only authenticated users with an `admin` role in `admin_profiles` can access dashboard endpoints.
- **Real-Time Statistics**: Total, Pending, Approved, Rejected, and Instagram Published counts directly aggregated from PostgreSQL.
- **Advanced Filtering & Search**: Instant filtering by department, academic year, moderation status, and search by crush name, sender name, or confession ID.
- **Detailed Confession Reports**: Audit view with full text, timestamp, consent verification, and moderation controls.
- **Instagram Story Generator**: In-browser 1080×1920 story card rendering with one-click PNG download.
- **Admin Password Management**: In-app secure password updates with strength enforcement via Supabase Auth Admin API.

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | Next.js (App Router) with React 18 |
| **Language** | TypeScript (Strict Mode) |
| **Styling** | Tailwind CSS (Romantic Pink & Deep Purple glassmorphism) |
| **Icons** | Lucide React |
| **Animations** | Framer Motion |
| **Form Handling & Validation** | React Hook Form + Zod |
| **Backend & APIs** | Next.js Server-Side Route Handlers |
| **Database & Auth** | Supabase PostgreSQL + Supabase Auth + Row Level Security (RLS) |
| **Testing** | Vitest + React Testing Library + JSDOM |
| **Hosting & Deployment** | Vercel |

---

## Folder Structure

```text
amore-confessions/
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx                    # Landing page
│   │   ├── layout.tsx                  # Root HTML shell, fonts, theme provider
│   │   ├── globals.css                 # Tailwind layers, glassmorphism styles
│   │   │
│   │   ├── confess/
│   │   │   └── page.tsx                # Confession submission page
│   │   │
│   │   ├── admin/
│   │   │   ├── login/
│   │   │   │   └── page.tsx            # Admin authentication portal
│   │   │   └── dashboard/
│   │   │       └── page.tsx            # Full admin moderation dashboard
│   │   │
│   │   └── api/
│   │       ├── confessions/
│   │       │   └── route.ts            # Public rate-limited submission endpoint
│   │       └── admin/
│   │           ├── login/route.ts      # Admin login handler
│   │           ├── logout/route.ts     # Admin session termination
│   │           ├── confessions/        # Confession query & moderation routes
│   │           │   ├── route.ts        # Paginated listing with filters
│   │           │   └── [id]/route.ts   # Details, PATCH status, DELETE
│   │           ├── stats/route.ts      # Real-time counter metrics
│   │           ├── change-password/    # Password change route
│   │           └── provision/route.ts  # Protected admin setup route
│   │
│   ├── components/
│   │   ├── Navbar.tsx                  # Responsive navigation header
│   │   ├── Hero.tsx                    # Romantic hero section
│   │   ├── ConfessionForm.tsx          # Dynamic submission form
│   │   ├── HeartCursor.tsx             # Pixel heart cursor & touch ripple
│   │   ├── LoadingAnimation.tsx        # Pulsing pixel heart loader
│   │   ├── ThemeProvider.tsx           # Context for light/dark theme
│   │   ├── ThemeToggle.tsx             # Sun/Moon mode toggle button
│   │   ├── AdminSidebar.tsx            # Dashboard navigation sidebar
│   │   ├── AdminSettings.tsx           # Password change panel
│   │   ├── ConfessionDetailsModal.tsx  # Detailed audit report modal
│   │   └── InstagramStoryModal.tsx     # 1080x1920 story generator
│   │
│   ├── lib/
│   │   ├── supabase-client.ts          # Browser Supabase client
│   │   └── supabase-server.ts          # Server-side service-role client
│   │
│   ├── types/
│   │   └── index.ts                    # Shared TypeScript interfaces
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.mjs
│   ├── tailwind.config.ts
│   └── vitest.config.ts
│
├── backend/
│   ├── services/
│   │   ├── confession.service.ts       # Database CRUD & business logic
│   │   ├── admin.service.ts            # Auth & admin profile validation
│   │   └── instagram.service.ts        # Instagram story layout generator
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts          # Admin session verification
│   │   ├── rateLimit.middleware.ts     # Sliding window rate limiter
│   │   └── validation.middleware.ts    # XSS sanitization
│   │
│   ├── database/
│   │   ├── schema.sql                  # Core PostgreSQL schema
│   │   ├── policies.sql                # Row Level Security policies
│   │   └── migrations/
│   │       └── 001_initial_schema.sql  # Complete migration script
│   │
│   ├── validators/
│   │   └── confession.validator.ts     # Zod validation schema
│   └── config/
│       └── index.ts                    # Constants & department mappings
│
├── tests/
│   ├── unit/
│   │   ├── validation.test.ts          # Form, department/year, XSS tests
│   │   ├── rateLimit.test.ts           # Sliding window rate limit tests
│   │   └── frontendComponents.test.tsx # UI component unit tests
│   ├── integration/
│   │   └── confessionService.test.ts   # Service layer integration tests
│   └── security/
│       └── authAndRls.test.ts          # RBAC & RLS policy audit tests
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## Prerequisites & Environment Setup

- **Node.js**: v18.18+ or v20+ (tested with Node v24)
- **Package Manager**: npm or pnpm
- **Supabase Account**: A free Supabase project from [supabase.com](https://supabase.com)

### Environment Variables

Copy `.env.example` to `frontend/.env.local` (and set in your hosting provider):

```bash
cp .env.example frontend/.env.local
```

Fill in the credentials from your Supabase Project Settings:

```env
# Supabase Project URL and Public Anon Key
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Service Role Key (Keep secret! Used strictly on the server)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Initial Administrator Credentials
ADMIN_EMAIL=admin@college.edu
INITIAL_ADMIN_PASSWORD=YourStrongSecretPassword123!

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Supabase Database Configuration

1. Log into your Supabase Dashboard at [supabase.com](https://supabase.com).
2. Navigate to **SQL Editor** in your project.
3. Open `backend/database/migrations/001_initial_schema.sql`.
4. Copy the entire file contents and click **Run**.
5. This creates:
   - `confessions` table with department and year validation constraints
   - `admin_profiles` table for authorized administrators
   - `moderation_logs` table for administrative audit tracking
   - Automated timestamp trigger functions and indexes
   - Row Level Security (RLS) policies ensuring **anonymous users cannot read confessions**.

---

## Administrator Provisioning

Once the database migration has run and environment variables are in place, provision your first administrator:

Send a `POST` request to `/api/admin/provision` with the `x-admin-provision-secret` header set to your `SUPABASE_SERVICE_ROLE_KEY`:

```bash
curl -X POST http://localhost:3000/api/admin/provision \
  -H "x-admin-provision-secret: YOUR_SUPABASE_SERVICE_ROLE_KEY"
```

The response confirms:
```json
{
  "success": true,
  "message": "Admin user provisioned successfully",
  "email": "admin@college.edu"
}
```

Now you can log into the Admin Portal at `/admin/login`.

---

## Installation & Local Development

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the student landing page, or [http://localhost:3000/admin/login](http://localhost:3000/admin/login) for the admin portal.

---

## Testing & Verification

Run the comprehensive test suite (unit, integration, and security tests):

```bash
cd frontend
npm run test
```

Build production bundle and verify TypeScript types:

```bash
npm run build
```

---

## Deployment Guide (Vercel + Supabase)

### 1. Push Repository to GitHub
```bash
git init
git add .
git commit -m "feat: complete production-ready amore confession platform"
git remote add origin https://github.com/your-username/amore-confessions.git
git push -u origin main
```

### 2. Configure Project on Vercel
1. Go to [vercel.com](https://vercel.com) and click **Add New Project**.
2. Select your GitHub repository.
3. In **Root Directory**, set: `frontend`.
4. In **Environment Variables**, configure:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_EMAIL`
   - `INITIAL_ADMIN_PASSWORD`
   - `NEXT_PUBLIC_APP_URL` (your Vercel URL e.g. `https://amore-confessions.vercel.app`)
5. Click **Deploy**.

---

## Security Implementation Audit

1. **Row Level Security (RLS)**: Enforced on all tables. Anonymous users cannot execute `SELECT`, `UPDATE`, or `DELETE` on confessions.
2. **Server-Side Authorization**: Administrative routes verify user identity via Supabase Auth and cross-check the `admin_profiles` table.
3. **HTTP-Only Cookies**: Admin sessions are persisted using HTTP-only, secure, `SameSite=Lax` cookies.
4. **Input Sanitization**: Strip malicious scripts, event handlers, and null bytes before saving.
5. **Rate Limiting**: Sliding window rate limiter prevents submission spam (5 requests/min per IP) and protects login endpoints from brute-force attacks.
6. **No Leaked Keys**: The privileged `SUPABASE_SERVICE_ROLE_KEY` is only used in server-side API routes and is never bundled in frontend client code.
7. **Security Headers**: Production headers include HSTS, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, and Permissions-Policy.

---

## Deployment Checklist

- [x] Database migration applied (`001_initial_schema.sql`)
- [x] RLS policies enabled and verified
- [x] Environment variables configured
- [x] Admin user provisioned
- [x] Rate limiting active on submission and login
- [x] Character limits and live counter enforced
- [x] Dynamic department/year validation enforced
- [x] Instagram Story generator tested at 1080×1920
- [x] Light and dark modes verified
- [x] Unit, integration, and security test suites passing
- [x] Production build passes cleanly with zero TypeScript errors

