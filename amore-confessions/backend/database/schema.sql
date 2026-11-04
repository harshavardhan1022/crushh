-- ============================================================================
-- Amore Anonymous College Confession Platform - Database Schema
-- ============================================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- Function: Auto-update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Table: confessions
-- ============================================================================
CREATE TABLE confessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_name     TEXT,
    crush_name      TEXT NOT NULL,
    department      TEXT NOT NULL,
    academic_year   TEXT NOT NULL,
    confession_message TEXT NOT NULL,
    publication_consent BOOLEAN NOT NULL DEFAULT false,
    status          TEXT NOT NULL DEFAULT 'pending',
    instagram_published BOOLEAN NOT NULL DEFAULT false,
    published_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Status must be one of the allowed values
    CONSTRAINT confessions_status_check
        CHECK (status IN ('pending', 'approved', 'rejected')),

    -- Department must be one of the allowed values
    CONSTRAINT confessions_department_check
        CHECK (department IN ('B.Tech', 'MBA', 'MCA', 'Pharm B', 'Pharm D')),

    -- Academic year must be one of the allowed values
    CONSTRAINT confessions_academic_year_check
        CHECK (academic_year IN ('1st', '2nd', '3rd', '4th', '5th', 'Graduated'))
);

-- Trigger to auto-update updated_at on confessions
CREATE TRIGGER set_confessions_updated_at
    BEFORE UPDATE ON confessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Table: admin_profiles
-- ============================================================================
CREATE TABLE admin_profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role        TEXT NOT NULL DEFAULT 'admin',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Table: moderation_logs
-- ============================================================================
CREATE TABLE moderation_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    confession_id   UUID REFERENCES confessions(id) ON DELETE SET NULL,
    admin_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action          TEXT NOT NULL,
    previous_status TEXT,
    new_status      TEXT,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Indexes
-- ============================================================================
CREATE INDEX idx_confessions_status ON confessions(status);
CREATE INDEX idx_confessions_department ON confessions(department);
CREATE INDEX idx_confessions_created_at ON confessions(created_at DESC);
CREATE INDEX idx_confessions_crush_name ON confessions(crush_name);
CREATE INDEX idx_moderation_logs_confession_id ON moderation_logs(confession_id);
