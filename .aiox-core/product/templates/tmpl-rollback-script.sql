-- Rollback Script Template
-- Rollback for Migration: :migration_name
-- Created: :created_date
-- Author: :author
-- Description: Reverses the changes made by :migration_name
--
-- IMPORTANT: Test this rollback in development before using in production
-- WARNING: Data migrations may not be fully reversible

BEGIN;

-- =============================================================================
-- PRE-ROLLBACK VERIFICATION
-- =============================================================================

DO $$
BEGIN
    -- Verify we're rolling back the correct migration
    RAISE NOTICE 'Starting rollback of migration: :migration_name';

    -- Add any safety checks here
    -- Example: Check if dependent objects exist
END $$;

-- =============================================================================
-- REVERSE DATA MIGRATION (if applicable)
-- =============================================================================

-- If data was migrated, restore from backup or reverse transformation
-- WARNING: This may result in data loss if no backup exists
-- INSERT INTO :old_table (old_col1, old_col2)
-- SELECT col1, col2 FROM :new_table;

-- =============================================================================
-- REVERSE SCHEMA CHANGES
-- =============================================================================

-- Remove triggers
DROP TRIGGER IF EXISTS trigger_update_:table_name_updated_at ON :table_name;

-- Remove indexes
-- DROP INDEX IF EXISTS idx_:table_:column;

-- Remove columns from existing tables
-- ALTER TABLE :existing_table DROP COLUMN IF EXISTS :new_column;

-- Drop tables (DANGEROUS - ensure data is backed up)
-- DROP TABLE IF EXISTS :table_name CASCADE;

-- =============================================================================
-- POST-ROLLBACK VERIFICATION
-- =============================================================================

DO $$
BEGIN
    -- Verify rollback was successful
    -- Example: Verify table no longer exists
    -- ASSERT NOT (SELECT EXISTS (
    --     SELECT 1 FROM information_schema.tables
    --     WHERE table_name = ':table_name'
    -- )), 'Table :table_name still exists after rollback';

    RAISE NOTICE 'Rollback completed successfully';
END $$;

COMMIT;

-- =============================================================================
-- POST-ROLLBACK NOTES
-- =============================================================================
--
-- After running this rollback:
-- 1. Verify application still functions correctly
-- 2. Check for any orphaned data
-- 3. Update migration tracking if applicable
-- 4. Document reason for rollback
--
