-- Migration Script Template
-- Migration: :migration_name
-- Created: :created_date
-- Author: :author
-- Description: :description
--
-- IMPORTANT: Run in transaction, test with dry-run first
-- ROLLBACK: See tmpl-rollback-script.sql for corresponding rollback

BEGIN;

-- =============================================================================
-- PRE-MIGRATION CHECKS
-- =============================================================================

-- Verify prerequisites are met
DO $$
BEGIN
    -- Add any precondition checks here
    -- Example: ASSERT (SELECT EXISTS (SELECT 1 FROM :prerequisite_table));
    RAISE NOTICE 'Pre-migration checks passed';
END $$;

-- =============================================================================
-- SCHEMA CHANGES
-- =============================================================================

-- Create new table (if needed)
CREATE TABLE IF NOT EXISTS :table_name (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Add columns here
    :column_name :column_type :constraints,

    -- Standard audit columns
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add column to existing table (if needed)
-- ALTER TABLE :existing_table ADD COLUMN IF NOT EXISTS :new_column :column_type;

-- Create index (if needed)
-- CREATE INDEX IF NOT EXISTS idx_:table_:column ON :table_name (:column_name);

-- =============================================================================
-- DATA MIGRATION (if needed)
-- =============================================================================

-- Migrate data from old structure to new
-- INSERT INTO :new_table (col1, col2)
-- SELECT old_col1, old_col2 FROM :old_table;

-- =============================================================================
-- POST-MIGRATION SETUP
-- =============================================================================

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_:table_name_updated_at ON :table_name;
CREATE TRIGGER trigger_update_:table_name_updated_at
    BEFORE UPDATE ON :table_name
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add table comments
COMMENT ON TABLE :table_name IS ':table_description';
COMMENT ON COLUMN :table_name.:column_name IS ':column_description';

-- =============================================================================
-- VERIFICATION
-- =============================================================================

DO $$
BEGIN
    -- Verify migration was successful
    ASSERT (SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = ':table_name'
    )), 'Table :table_name was not created';

    RAISE NOTICE 'Migration completed successfully';
END $$;

COMMIT;
