-- Seed Data Template
-- Purpose: Idempotent seed data for development and testing
-- Created: :created_date
-- Author: :author
--
-- IMPORTANT: All seed operations should be idempotent (safe to run multiple times)

-- =============================================================================
-- SEED CONFIGURATION
-- =============================================================================

-- Disable triggers during seeding (optional, speeds up bulk insert)
-- SET session_replication_role = replica;

BEGIN;

-- =============================================================================
-- SEED: REFERENCE DATA (Lookup tables, static data)
-- =============================================================================

-- Example: Status types
INSERT INTO status_types (id, name, description, sort_order)
VALUES
    ('11111111-1111-1111-1111-111111111001', 'draft', 'Initial draft state', 1),
    ('11111111-1111-1111-1111-111111111002', 'pending', 'Awaiting action', 2),
    ('11111111-1111-1111-1111-111111111003', 'active', 'Currently active', 3),
    ('11111111-1111-1111-1111-111111111004', 'completed', 'Work completed', 4),
    ('11111111-1111-1111-1111-111111111005', 'archived', 'No longer active', 5)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order;

-- Example: Categories
INSERT INTO categories (id, name, slug, parent_id)
VALUES
    ('22222222-2222-2222-2222-222222222001', 'General', 'general', NULL),
    ('22222222-2222-2222-2222-222222222002', 'Development', 'development', NULL),
    ('22222222-2222-2222-2222-222222222003', 'Frontend', 'frontend', '22222222-2222-2222-2222-222222222002'),
    ('22222222-2222-2222-2222-222222222004', 'Backend', 'backend', '22222222-2222-2222-2222-222222222002')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    parent_id = EXCLUDED.parent_id;

-- =============================================================================
-- SEED: ROLES AND PERMISSIONS
-- =============================================================================

INSERT INTO roles (id, name, description, permissions)
VALUES
    ('33333333-3333-3333-3333-333333333001', 'admin', 'Full system access', '["*"]'::JSONB),
    ('33333333-3333-3333-3333-333333333002', 'editor', 'Can edit content', '["read", "write", "update"]'::JSONB),
    ('33333333-3333-3333-3333-333333333003', 'viewer', 'Read-only access', '["read"]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
    description = EXCLUDED.description,
    permissions = EXCLUDED.permissions;

-- =============================================================================
-- SEED: TEST USERS (Development only!)
-- =============================================================================

-- NOTE: Only run in development environment
-- These are fake users for testing - DO NOT use in production

-- Check environment before inserting test data
DO $$
BEGIN
    -- Only seed test users if this appears to be a dev environment
    IF current_database() LIKE '%dev%' OR current_database() LIKE '%test%' THEN
        -- Test Admin User
        INSERT INTO auth.users (
            id,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_user_meta_data
        ) VALUES (
            '00000000-0000-0000-0000-000000000001',
            'admin@test.local',
            crypt('testpassword123', gen_salt('bf')),
            NOW(),
            '{"full_name": "Test Admin"}'::JSONB
        ) ON CONFLICT (id) DO NOTHING;

        -- Test Regular User
        INSERT INTO auth.users (
            id,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_user_meta_data
        ) VALUES (
            '00000000-0000-0000-0000-000000000002',
            'user@test.local',
            crypt('testpassword123', gen_salt('bf')),
            NOW(),
            '{"full_name": "Test User"}'::JSONB
        ) ON CONFLICT (id) DO NOTHING;

        RAISE NOTICE 'Test users seeded successfully';
    ELSE
        RAISE NOTICE 'Skipping test user seeding - not a dev/test environment';
    END IF;
END $$;

-- =============================================================================
-- SEED: SAMPLE DATA (Development only!)
-- =============================================================================

-- Example: Sample projects for testing
INSERT INTO :table_name (id, name, description, user_id, status, created_at)
VALUES
    ('44444444-4444-4444-4444-444444444001', 'Sample Project 1', 'First sample project for testing', '00000000-0000-0000-0000-000000000001', 'active', NOW()),
    ('44444444-4444-4444-4444-444444444002', 'Sample Project 2', 'Second sample project for testing', '00000000-0000-0000-0000-000000000002', 'draft', NOW())
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = NOW();

COMMIT;

-- =============================================================================
-- RE-ENABLE TRIGGERS
-- =============================================================================

-- SET session_replication_role = DEFAULT;

-- =============================================================================
-- VERIFICATION
-- =============================================================================

SELECT
    'status_types' as table_name,
    COUNT(*) as row_count
FROM status_types
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'roles', COUNT(*) FROM roles;
