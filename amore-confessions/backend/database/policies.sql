-- ============================================================================
-- Amore Anonymous College Confession Platform - Row Level Security Policies
-- ============================================================================

-- ============================================================================
-- Enable RLS on all tables
-- ============================================================================
ALTER TABLE confessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Helper Function: Check if user is an admin
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Policies for: confessions
-- ============================================================================

-- 1. Anonymous users CANNOT read any confession records.
-- Confessions are strictly private to admin review until manually posted to Instagram.
-- (No public SELECT policy for anon).

-- 2. Only authenticated admins can read confessions
CREATE POLICY "admin_can_read_confessions"
    ON confessions
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- 3. Only authenticated admins can update confessions (moderation status, publish flag)
CREATE POLICY "admin_can_update_confessions"
    ON confessions
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 4. Only authenticated admins can delete confessions
CREATE POLICY "admin_can_delete_confessions"
    ON confessions
    FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- 5. Submissions through service_role (server-side API routes) have full access
CREATE POLICY "service_role_full_access_confessions"
    ON confessions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Optional: If direct client-side insert is allowed for anon, it is strictly restricted:
CREATE POLICY "anon_can_submit_confessions"
    ON confessions
    FOR INSERT
    TO anon
    WITH CHECK (
        status = 'pending'
        AND instagram_published = false
    );

-- ============================================================================
-- Policies for: admin_profiles
-- ============================================================================

-- Authenticated admins can read admin profiles
CREATE POLICY "admin_can_read_admin_profiles"
    ON admin_profiles
    FOR SELECT
    TO authenticated
    USING (id = auth.uid());

-- Prevent non-service_role from inserting, updating, or deleting admin profiles
-- (Users cannot self-assign admin privileges)
CREATE POLICY "service_role_full_access_admin_profiles"
    ON admin_profiles
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- Policies for: moderation_logs
-- ============================================================================

-- Only authenticated admins can view moderation logs
CREATE POLICY "admin_can_read_moderation_logs"
    ON moderation_logs
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- Service role has full access to moderation logs
CREATE POLICY "service_role_full_access_moderation_logs"
    ON moderation_logs
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
