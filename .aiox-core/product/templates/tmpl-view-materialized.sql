-- Materialized View Template
-- View: :view_name
-- Created: :created_date
-- Author: :author
-- Description: :description
--
-- Materialized views cache query results for performance
-- IMPORTANT: Data is not live - must be refreshed periodically

-- =============================================================================
-- BASIC MATERIALIZED VIEW
-- =============================================================================

-- Drop existing view if exists
DROP MATERIALIZED VIEW IF EXISTS :view_name CASCADE;

-- Create materialized view
CREATE MATERIALIZED VIEW :view_name AS
SELECT
    t.id,
    t.name,
    t.category,
    t.created_at,
    -- Aggregations
    COUNT(r.id) AS related_count,
    SUM(r.amount) AS total_amount,
    AVG(r.rating) AS avg_rating,
    -- Computed columns
    CASE
        WHEN t.status = 'active' THEN true
        ELSE false
    END AS is_active
FROM :base_table t
LEFT JOIN :related_table r ON r.parent_id = t.id
WHERE t.deleted_at IS NULL
GROUP BY t.id, t.name, t.category, t.created_at, t.status
-- Store data sorted for efficient access
WITH DATA;

-- =============================================================================
-- INDEXES ON MATERIALIZED VIEW
-- =============================================================================

-- Unique index (required for CONCURRENT refresh)
CREATE UNIQUE INDEX IF NOT EXISTS idx_:view_name_id
ON :view_name (id);

-- Additional indexes for common queries
CREATE INDEX IF NOT EXISTS idx_:view_name_category
ON :view_name (category);

CREATE INDEX IF NOT EXISTS idx_:view_name_created_at
ON :view_name (created_at DESC);

-- =============================================================================
-- REFRESH FUNCTION
-- =============================================================================

-- Function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_:view_name()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- CONCURRENTLY allows queries during refresh (requires unique index)
    REFRESH MATERIALIZED VIEW CONCURRENTLY :view_name;

    -- Log refresh
    RAISE NOTICE 'Materialized view :view_name refreshed at %', NOW();
END;
$$;

-- Grant execute to service role (for scheduled refresh)
GRANT EXECUTE ON FUNCTION refresh_:view_name() TO service_role;

-- =============================================================================
-- SCHEDULED REFRESH (pg_cron)
-- =============================================================================
--
-- If using pg_cron extension (available in Supabase):
--
-- Enable extension (one-time, requires superuser)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
--
-- Schedule refresh every hour
-- SELECT cron.schedule(
--     'refresh-:view_name',
--     '0 * * * *',  -- Every hour at minute 0
--     $$SELECT refresh_:view_name()$$
-- );
--
-- To remove schedule:
-- SELECT cron.unschedule('refresh-:view_name');

-- =============================================================================
-- TRIGGER-BASED REFRESH (Alternative)
-- =============================================================================

-- Refresh when base table changes (use with caution - can be slow)
-- CREATE OR REPLACE FUNCTION refresh_:view_name_trigger()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     REFRESH MATERIALIZED VIEW CONCURRENTLY :view_name;
--     RETURN NULL;
-- END;
-- $$ LANGUAGE plpgsql;
--
-- CREATE TRIGGER trigger_refresh_:view_name
-- AFTER INSERT OR UPDATE OR DELETE ON :base_table
-- FOR EACH STATEMENT
-- EXECUTE FUNCTION refresh_:view_name_trigger();

-- =============================================================================
-- VIEW METADATA
-- =============================================================================

COMMENT ON MATERIALIZED VIEW :view_name IS ':description. Refresh: hourly or on-demand.';

-- =============================================================================
-- USAGE
-- =============================================================================
--
-- Query the view (cached data, very fast):
-- SELECT * FROM :view_name WHERE category = 'example';
--
-- Manual refresh (use during low-traffic periods):
-- REFRESH MATERIALIZED VIEW CONCURRENTLY :view_name;
-- OR
-- SELECT refresh_:view_name();
--
-- Check last refresh time (approximate):
-- SELECT pg_stat_get_last_analyze_time(':view_name'::regclass);
