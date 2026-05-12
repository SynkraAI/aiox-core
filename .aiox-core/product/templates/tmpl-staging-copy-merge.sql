-- Staging Copy Merge Template
-- Purpose: Safely load external data through staging table and merge to target
-- Created: :created_date
-- Author: :author
--
-- This pattern prevents data corruption by validating in staging before merge

-- =============================================================================
-- STEP 1: CREATE STAGING TABLE (temporary)
-- =============================================================================

-- Create staging table mirroring target structure
CREATE TEMP TABLE IF NOT EXISTS :staging_table (
    -- Match target table columns
    id UUID,
    :column1 :type1,
    :column2 :type2,
    -- Metadata for import tracking
    _row_number INTEGER,
    _import_status TEXT DEFAULT 'pending',
    _import_error TEXT
);

-- =============================================================================
-- STEP 2: COPY DATA TO STAGING
-- =============================================================================

-- Option A: From CSV file
-- COPY :staging_table (id, :column1, :column2)
-- FROM '/path/to/file.csv'
-- WITH (FORMAT csv, HEADER true);

-- Option B: From STDIN (programmatic)
-- COPY :staging_table (id, :column1, :column2) FROM STDIN;

-- Option C: Insert from another query
-- INSERT INTO :staging_table (id, :column1, :column2)
-- SELECT id, col1, col2 FROM external_source;

-- =============================================================================
-- STEP 3: VALIDATE STAGING DATA
-- =============================================================================

-- Mark rows with validation errors
UPDATE :staging_table
SET
    _import_status = 'error',
    _import_error = 'Missing required field'
WHERE :column1 IS NULL;

-- Check for duplicates
UPDATE :staging_table s
SET
    _import_status = 'duplicate',
    _import_error = 'Duplicate ID found'
WHERE EXISTS (
    SELECT 1 FROM :staging_table s2
    WHERE s2.id = s.id
    AND s2._row_number < s._row_number
);

-- Check for existing records (will update instead of insert)
UPDATE :staging_table s
SET _import_status = 'update'
WHERE EXISTS (
    SELECT 1 FROM :target_table t
    WHERE t.id = s.id
)
AND s._import_status = 'pending';

-- Mark remaining as new inserts
UPDATE :staging_table
SET _import_status = 'insert'
WHERE _import_status = 'pending';

-- =============================================================================
-- STEP 4: REPORT VALIDATION RESULTS
-- =============================================================================

-- Get summary of staging data
SELECT
    _import_status,
    COUNT(*) as count,
    STRING_AGG(DISTINCT _import_error, ', ') as errors
FROM :staging_table
GROUP BY _import_status
ORDER BY _import_status;

-- =============================================================================
-- STEP 5: MERGE TO TARGET (UPSERT)
-- =============================================================================

BEGIN;

-- Insert new records
INSERT INTO :target_table (id, :column1, :column2, created_at)
SELECT id, :column1, :column2, NOW()
FROM :staging_table
WHERE _import_status = 'insert';

-- Update existing records
UPDATE :target_table t
SET
    :column1 = s.:column1,
    :column2 = s.:column2,
    updated_at = NOW()
FROM :staging_table s
WHERE t.id = s.id
AND s._import_status = 'update';

COMMIT;

-- =============================================================================
-- STEP 6: VERIFY AND CLEANUP
-- =============================================================================

-- Verify merge results
SELECT
    'inserted' as operation,
    COUNT(*) as count
FROM :staging_table WHERE _import_status = 'insert'
UNION ALL
SELECT
    'updated' as operation,
    COUNT(*) as count
FROM :staging_table WHERE _import_status = 'update'
UNION ALL
SELECT
    'errors' as operation,
    COUNT(*) as count
FROM :staging_table WHERE _import_status = 'error';

-- Get error details for review
SELECT id, :column1, _import_error
FROM :staging_table
WHERE _import_status = 'error';

-- Drop staging table (automatic for TEMP, but explicit is clearer)
DROP TABLE IF EXISTS :staging_table;
