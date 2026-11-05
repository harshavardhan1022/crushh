-- ============================================================================
-- Migration 002: Add B.Tech Branch Support to Confessions Table
-- ============================================================================

-- 1. Add branch column (nullable to preserve existing records and non-B.Tech submissions)
ALTER TABLE confessions
ADD COLUMN IF NOT EXISTS branch TEXT NULL;

-- 2. Add constraint for branch validity
-- Rule:
-- - If department is 'B.Tech', branch must be one of: 'CSE', 'CSD', 'ECE', 'Civil', 'Mech'
-- - If department is not 'B.Tech', branch must be NULL
ALTER TABLE confessions
DROP CONSTRAINT IF EXISTS confessions_branch_check;

ALTER TABLE confessions
ADD CONSTRAINT confessions_branch_check
CHECK (
    (department = 'B.Tech' AND branch IN ('CSE', 'CSD', 'ECE', 'Civil', 'Mech'))
    OR (department <> 'B.Tech' AND branch IS NULL)
);

-- 3. Create index for fast branch-level filtering in queries
CREATE INDEX IF NOT EXISTS idx_confessions_branch ON confessions(branch);

