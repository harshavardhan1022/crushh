-- ============================================================================
-- Complete Production Database Schema & Security Migration
-- Anonymous College Confession Platform
-- Project: pngpxlzvkndmwgwjpirr
-- ============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Trigger Function for Updated-At Timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Table: confessions
CREATE TABLE IF NOT EXISTS confessions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_name         TEXT,
    crush_name          TEXT NOT NULL,
    department          TEXT NOT NULL,
    branch              TEXT NULL,
    academic_year       TEXT NOT NULL,
    confession_message  TEXT NOT NULL,
    publication_consent BOOLEAN NOT NULL DEFAULT false,
    status              TEXT NOT NULL DEFAULT 'pending',
    instagram_published BOOLEAN NOT NULL DEFAULT false,
    published_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Status constraint: pending, approved, rejected
    CONSTRAINT confessions_status_check
        CHECK (status IN ('pending', 'approved', 'rejected')),

    -- Department constraint
    CONSTRAINT confessions_department_check
        CHECK (department IN ('B.Tech', 'MBA', 'MCA', 'Pharm B', 'Pharm D')),

    -- Branch constraint:
    -- B.Tech requires one of: CSE, CSD, ECE, Civil, Mech
    -- Other departments must have branch = NULL
    CONSTRAINT confessions_branch_check
        CHECK (
            (department = 'B.Tech' AND branch IN ('CSE', 'CSD', 'ECE', 'Civil', 'Mech'))
            OR (department <> 'B.Tech' AND branch IS NULL)
        ),

    -- Academic year constraint
    CONSTRAINT confessions_academic_year_check
        CHECK (academic_year IN ('1st', '2nd', '3rd', '4th', '5th', 'Graduated'))
);

-- Ensure branch column exists if table was created previously without it
ALTER TABLE confessions ADD COLUMN IF NOT EXISTS branch TEXT NULL;

-- Trigger for auto-updating confessions.updated_at
DROP TRIGGER IF EXISTS set_confessions_updated_at ON confessions;
CREATE TRIGGER set_confessions_updated_at
    BEFORE UPDATE ON confessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Table: admin_profiles (linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS admin_profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role        TEXT NOT NULL DEFAULT 'admin',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Table: moderation_logs
CREATE TABLE IF NOT EXISTS moderation_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    confession_id   UUID REFERENCES confessions(id) ON DELETE SET NULL,
    admin_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action          TEXT NOT NULL,
    previous_status TEXT,
    new_status      TEXT,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Indexes for High-Performance Querying & Filtering
CREATE INDEX IF NOT EXISTS idx_confessions_status ON confessions(status);
CREATE INDEX IF NOT EXISTS idx_confessions_department ON confessions(department);
CREATE INDEX IF NOT EXISTS idx_confessions_branch ON confessions(branch);
CREATE INDEX IF NOT EXISTS idx_confessions_created_at ON confessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_confessions_crush_name ON confessions(crush_name);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_confession_id ON moderation_logs(confession_id);

-- 7. Enable Row Level Security (RLS)
ALTER TABLE confessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;

-- 8. Helper Function: Check Admin Privilege
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. RLS Policies: confessions
-- Policy A: Anonymous submission (INSERT only)
DROP POLICY IF EXISTS "anon_can_submit_confessions" ON confessions;
CREATE POLICY "anon_can_submit_confessions"
    ON confessions
    FOR INSERT
    TO anon
    WITH CHECK (
        status = 'pending'
        AND instagram_published = false
    );

-- Policy B: Authenticated Admins can read confessions
DROP POLICY IF EXISTS "admin_can_read_confessions" ON confessions;
CREATE POLICY "admin_can_read_confessions"
    ON confessions
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- Policy C: Authenticated Admins can update confessions
DROP POLICY IF EXISTS "admin_can_update_confessions" ON confessions;
CREATE POLICY "admin_can_update_confessions"
    ON confessions
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Policy D: Authenticated Admins can delete confessions
DROP POLICY IF EXISTS "admin_can_delete_confessions" ON confessions;
CREATE POLICY "admin_can_delete_confessions"
    ON confessions
    FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- Policy E: Privileged server-side service_role full access
DROP POLICY IF EXISTS "service_role_full_access_confessions" ON confessions;
CREATE POLICY "service_role_full_access_confessions"
    ON confessions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 10. RLS Policies: admin_profiles
DROP POLICY IF EXISTS "admin_can_read_admin_profiles" ON admin_profiles;
CREATE POLICY "admin_can_read_admin_profiles"
    ON admin_profiles
    FOR SELECT
    TO authenticated
    USING (id = auth.uid());

DROP POLICY IF EXISTS "service_role_full_access_admin_profiles" ON admin_profiles;
CREATE POLICY "service_role_full_access_admin_profiles"
    ON admin_profiles
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 11. RLS Policies: moderation_logs
DROP POLICY IF EXISTS "admin_can_read_moderation_logs" ON moderation_logs;
CREATE POLICY "admin_can_read_moderation_logs"
    ON moderation_logs
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "service_role_full_access_moderation_logs" ON moderation_logs;
CREATE POLICY "service_role_full_access_moderation_logs"
    ON moderation_logs
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 12. Reload PostgREST Schema Cache Immediately
NOTIFY pgrst, 'reload schema';
