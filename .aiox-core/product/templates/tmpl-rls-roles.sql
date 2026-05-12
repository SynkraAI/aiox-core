-- RLS Roles Template
-- Role-Based Access Control (RBAC) foundation for RLS policies
-- Created: :created_date
--
-- This template sets up the foundation for role-based RLS policies

-- =============================================================================
-- ROLES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default roles
INSERT INTO roles (name, description, permissions) VALUES
    ('admin', 'Full system access', '["*"]'::JSONB),
    ('editor', 'Can read and modify content', '["read", "write", "update"]'::JSONB),
    ('viewer', 'Read-only access', '["read"]'::JSONB),
    ('creator', 'Can create new content', '["read", "write"]'::JSONB)
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- USER ROLES TABLE (Many-to-Many)
-- =============================================================================
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ, -- NULL means never expires

    UNIQUE(user_id, role_id)
);

-- Index for fast role lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);

-- =============================================================================
-- HELPER FUNCTIONS FOR RLS
-- =============================================================================

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION has_role(role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.name = role_name
        AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user has any of the specified roles
CREATE OR REPLACE FUNCTION has_any_role(role_names TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.name = ANY(role_names)
        AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user has a specific permission
CREATE OR REPLACE FUNCTION has_permission(permission TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND (
            r.permissions @> '["*"]'::JSONB
            OR r.permissions @> to_jsonb(permission)
        )
        AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =============================================================================
-- RLS ON ROLES TABLES
-- =============================================================================

-- Roles table: Admins can manage, everyone can read
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "roles_select" ON roles
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "roles_admin" ON roles
FOR ALL TO authenticated
USING (has_role('admin'))
WITH CHECK (has_role('admin'));

-- User roles: Users see their own, admins see all
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_roles_select" ON user_roles
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR has_role('admin'));

CREATE POLICY "user_roles_admin" ON user_roles
FOR ALL TO authenticated
USING (has_role('admin'))
WITH CHECK (has_role('admin'));

-- =============================================================================
-- USAGE EXAMPLE IN OTHER POLICIES
-- =============================================================================
--
-- CREATE POLICY "my_table_select" ON my_table
-- FOR SELECT TO authenticated
-- USING (
--     user_id = auth.uid()
--     OR has_any_role(ARRAY['admin', 'viewer'])
-- );
--
