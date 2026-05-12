-- Multi-Tenant RLS Policy Template
-- Table: :table_name
-- Security Model: Tenant isolation with user permissions
-- Created: :created_date
--
-- This template creates RLS policies for multi-tenant applications
-- where data is isolated by organization/tenant

-- =============================================================================
-- PREREQUISITES: Tenant Infrastructure
-- =============================================================================

-- Tenants/Organizations table (if not exists)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    settings JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tenant memberships (which users belong to which tenants)
CREATE TABLE IF NOT EXISTS tenant_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(tenant_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_tenant_members_user ON tenant_members(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_members_tenant ON tenant_members(tenant_id);

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Get current user's tenant IDs
CREATE OR REPLACE FUNCTION get_user_tenant_ids()
RETURNS UUID[] AS $$
BEGIN
    RETURN ARRAY(
        SELECT tenant_id
        FROM tenant_members
        WHERE user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user is member of tenant
CREATE OR REPLACE FUNCTION is_tenant_member(check_tenant_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM tenant_members
        WHERE tenant_id = check_tenant_id
        AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check user's role in tenant
CREATE OR REPLACE FUNCTION get_tenant_role(check_tenant_id UUID)
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT role
        FROM tenant_members
        WHERE tenant_id = check_tenant_id
        AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =============================================================================
-- TABLE WITH TENANT COLUMN
-- =============================================================================
-- Your table should have a tenant_id column:
--
-- ALTER TABLE :table_name ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
-- CREATE INDEX IF NOT EXISTS idx_:table_name_tenant ON :table_name(tenant_id);

-- =============================================================================
-- RLS POLICIES FOR TENANT ISOLATION
-- =============================================================================

ALTER TABLE :table_name ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can only see rows from their tenants
DROP POLICY IF EXISTS ":table_name_tenant_select" ON :table_name;
CREATE POLICY ":table_name_tenant_select"
ON :table_name
FOR SELECT
TO authenticated
USING (
    tenant_id = ANY(get_user_tenant_ids())
);

-- INSERT: Users can only insert into tenants they belong to
DROP POLICY IF EXISTS ":table_name_tenant_insert" ON :table_name;
CREATE POLICY ":table_name_tenant_insert"
ON :table_name
FOR INSERT
TO authenticated
WITH CHECK (
    is_tenant_member(tenant_id)
);

-- UPDATE: Only admins/owners can update
DROP POLICY IF EXISTS ":table_name_tenant_update" ON :table_name;
CREATE POLICY ":table_name_tenant_update"
ON :table_name
FOR UPDATE
TO authenticated
USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND get_tenant_role(tenant_id) IN ('owner', 'admin')
)
WITH CHECK (
    tenant_id = ANY(get_user_tenant_ids())
);

-- DELETE: Only owners can delete
DROP POLICY IF EXISTS ":table_name_tenant_delete" ON :table_name;
CREATE POLICY ":table_name_tenant_delete"
ON :table_name
FOR DELETE
TO authenticated
USING (
    get_tenant_role(tenant_id) = 'owner'
);

-- =============================================================================
-- RLS ON TENANT TABLES THEMSELVES
-- =============================================================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_members ENABLE ROW LEVEL SECURITY;

-- Tenants: Members can see their tenants
CREATE POLICY "tenants_member_select" ON tenants
FOR SELECT TO authenticated
USING (id = ANY(get_user_tenant_ids()));

-- Tenant members: Members can see their tenant's members
CREATE POLICY "tenant_members_select" ON tenant_members
FOR SELECT TO authenticated
USING (tenant_id = ANY(get_user_tenant_ids()));
