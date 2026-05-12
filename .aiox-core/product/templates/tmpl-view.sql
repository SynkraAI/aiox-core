-- View Template
-- View: :view_name
-- Created: :created_date
-- Author: :author
-- Description: :description
--
-- Views are virtual tables that provide a simplified interface
-- Data is always live (not cached like materialized views)

-- =============================================================================
-- BASIC VIEW
-- =============================================================================

-- Drop existing view if exists
DROP VIEW IF EXISTS :view_name CASCADE;

-- Create view
CREATE OR REPLACE VIEW :view_name AS
SELECT
    t.id,
    t.name,
    t.description,
    t.status,
    t.created_at,
    t.updated_at,
    -- Related data
    u.email AS owner_email,
    u.raw_user_meta_data->>'full_name' AS owner_name,
    -- Computed columns
    CASE
        WHEN t.status = 'active' THEN 'Active'
        WHEN t.status = 'pending' THEN 'Pending'
        WHEN t.status = 'archived' THEN 'Archived'
        ELSE 'Unknown'
    END AS status_label,
    -- Age calculation
    EXTRACT(DAY FROM NOW() - t.created_at) AS days_old
FROM :base_table t
LEFT JOIN auth.users u ON u.id = t.user_id
WHERE t.deleted_at IS NULL;

-- =============================================================================
-- VIEW WITH AGGREGATIONS
-- =============================================================================

CREATE OR REPLACE VIEW :view_name_summary AS
SELECT
    t.category,
    COUNT(*) AS total_count,
    COUNT(*) FILTER (WHERE t.status = 'active') AS active_count,
    COUNT(*) FILTER (WHERE t.status = 'pending') AS pending_count,
    MIN(t.created_at) AS earliest,
    MAX(t.created_at) AS latest,
    AVG(t.value)::NUMERIC(10,2) AS avg_value
FROM :base_table t
WHERE t.deleted_at IS NULL
GROUP BY t.category;

-- =============================================================================
-- VIEW WITH RLS CONSIDERATION
-- =============================================================================

-- Views inherit RLS from underlying tables
-- If base table has RLS, view will respect it
--
-- For views that need custom RLS-like behavior,
-- wrap in a SECURITY DEFINER function:

CREATE OR REPLACE FUNCTION get_:view_name_for_user()
RETURNS TABLE (
    id UUID,
    name TEXT,
    status TEXT,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY INVOKER
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT
        v.id,
        v.name,
        v.status,
        v.created_at
    FROM :view_name v
    WHERE v.user_id = auth.uid()
    ORDER BY v.created_at DESC;
END;
$$;

-- =============================================================================
-- VIEW WITH JOINED DATA
-- =============================================================================

CREATE OR REPLACE VIEW :view_name_detailed AS
SELECT
    t.id,
    t.name,
    t.status,
    -- One-to-one relationship
    d.detail_field,
    -- One-to-many aggregation
    (
        SELECT json_agg(json_build_object(
            'id', c.id,
            'name', c.name,
            'created_at', c.created_at
        ))
        FROM :child_table c
        WHERE c.parent_id = t.id
    ) AS children,
    -- Count
    (
        SELECT COUNT(*)
        FROM :child_table c
        WHERE c.parent_id = t.id
    ) AS children_count,
    t.created_at,
    t.updated_at
FROM :base_table t
LEFT JOIN :detail_table d ON d.id = t.detail_id
WHERE t.deleted_at IS NULL;

-- =============================================================================
-- UPDATEABLE VIEW (with INSTEAD OF triggers)
-- =============================================================================

-- Simple updateable view (for basic cases)
CREATE OR REPLACE VIEW :view_name_editable AS
SELECT
    id,
    name,
    description,
    status,
    updated_at
FROM :base_table
WHERE deleted_at IS NULL;

-- Make it updateable via trigger
CREATE OR REPLACE FUNCTION :view_name_editable_update()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE :base_table
    SET
        name = NEW.name,
        description = NEW.description,
        status = NEW.status,
        updated_at = NOW()
    WHERE id = NEW.id
    AND user_id = auth.uid();  -- RLS check

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_:view_name_editable_update
INSTEAD OF UPDATE ON :view_name_editable
FOR EACH ROW
EXECUTE FUNCTION :view_name_editable_update();

-- =============================================================================
-- VIEW METADATA
-- =============================================================================

COMMENT ON VIEW :view_name IS ':description';

-- =============================================================================
-- PERMISSIONS
-- =============================================================================

-- Grant SELECT on view (inherits base table RLS)
GRANT SELECT ON :view_name TO authenticated;

-- For updateable views, also grant UPDATE
-- GRANT UPDATE ON :view_name_editable TO authenticated;
