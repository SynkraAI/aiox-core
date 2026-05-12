-- Granular RLS Policies Template
-- Table: :table_name
-- Security Model: Granular (separate policies per operation)
-- Created: :created_date
--
-- This template creates separate policies for SELECT, INSERT, UPDATE, DELETE
-- Useful when different users have different permissions per operation

-- Enable RLS on table
ALTER TABLE :table_name ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owner too (recommended for security)
ALTER TABLE :table_name FORCE ROW LEVEL SECURITY;

-- =============================================================================
-- SELECT POLICY - Who can read rows
-- =============================================================================
DROP POLICY IF EXISTS ":table_name_select" ON :table_name;
CREATE POLICY ":table_name_select"
ON :table_name
FOR SELECT
TO authenticated
USING (
    -- Owner can read their own rows
    auth.uid() = user_id
    -- OR user has read permission via role
    OR EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'reader')
    )
);

-- =============================================================================
-- INSERT POLICY - Who can create rows
-- =============================================================================
DROP POLICY IF EXISTS ":table_name_insert" ON :table_name;
CREATE POLICY ":table_name_insert"
ON :table_name
FOR INSERT
TO authenticated
WITH CHECK (
    -- User can only insert rows they will own
    auth.uid() = user_id
    -- OR user has creator permission
    OR EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'creator')
    )
);

-- =============================================================================
-- UPDATE POLICY - Who can modify rows
-- =============================================================================
DROP POLICY IF EXISTS ":table_name_update" ON :table_name;
CREATE POLICY ":table_name_update"
ON :table_name
FOR UPDATE
TO authenticated
USING (
    -- Can only see rows to update if owner
    auth.uid() = user_id
    OR EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'editor')
    )
)
WITH CHECK (
    -- Can only update to valid state
    auth.uid() = user_id
    OR EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'editor')
    )
);

-- =============================================================================
-- DELETE POLICY - Who can delete rows
-- =============================================================================
DROP POLICY IF EXISTS ":table_name_delete" ON :table_name;
CREATE POLICY ":table_name_delete"
ON :table_name
FOR DELETE
TO authenticated
USING (
    -- Only owner or admin can delete
    auth.uid() = user_id
    OR EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid()
        AND role = 'admin'
    )
);

-- =============================================================================
-- VERIFICATION
-- =============================================================================
-- Test these policies with:
-- SET LOCAL ROLE authenticated;
-- SET LOCAL request.jwt.claims = '{"sub": "user-uuid-here"}';
-- SELECT * FROM :table_name; -- Should only return authorized rows
