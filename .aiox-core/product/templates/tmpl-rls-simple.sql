-- Simple RLS Policy Template
-- Table: :table_name
-- Security Model: Simple owner-based access
-- Created: :created_date
--
-- This template creates a simple RLS policy where users can only
-- access rows they own (based on user_id column)

-- Enable RLS on table
ALTER TABLE :table_name ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- SIMPLE OWNER-BASED POLICY
-- =============================================================================

-- Drop existing policies if re-running
DROP POLICY IF EXISTS ":table_name_owner_policy" ON :table_name;

-- Single policy for all operations (SELECT, INSERT, UPDATE, DELETE)
-- Users can only access rows where user_id matches their auth.uid()
CREATE POLICY ":table_name_owner_policy"
ON :table_name
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- OPTIONAL: Allow service role to bypass RLS
-- =============================================================================
-- Note: This is enabled by default in Supabase
-- The service_role can access all rows regardless of RLS policies
-- Be careful with service_role key exposure

-- =============================================================================
-- OPTIONAL: Public read access (if needed)
-- =============================================================================
-- Uncomment if you want anonymous users to read data
--
-- DROP POLICY IF EXISTS ":table_name_public_read" ON :table_name;
-- CREATE POLICY ":table_name_public_read"
-- ON :table_name
-- FOR SELECT
-- TO anon
-- USING (is_public = true);

-- =============================================================================
-- VERIFICATION
-- =============================================================================
-- Test the policy:
--
-- 1. As authenticated user (should see only their rows):
--    SET LOCAL ROLE authenticated;
--    SET LOCAL request.jwt.claims = '{"sub": "user-uuid-here"}';
--    SELECT * FROM :table_name;
--
-- 2. As service role (should see all rows):
--    SET LOCAL ROLE service_role;
--    SELECT * FROM :table_name;
--
-- 3. As anonymous (should see nothing unless public_read enabled):
--    SET LOCAL ROLE anon;
--    SELECT * FROM :table_name;

-- =============================================================================
-- TABLE REQUIREMENTS
-- =============================================================================
-- This template assumes :table_name has a user_id column:
--
-- CREATE TABLE :table_name (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
--     -- other columns...
--     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
-- );
--
-- CREATE INDEX idx_:table_name_user_id ON :table_name(user_id);
