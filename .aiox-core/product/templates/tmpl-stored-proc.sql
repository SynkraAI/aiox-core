-- Stored Procedure Template
-- Function: :function_name
-- Created: :created_date
-- Author: :author
-- Description: :description
--
-- IMPORTANT: Consider security implications of SECURITY DEFINER vs SECURITY INVOKER

-- =============================================================================
-- BASIC FUNCTION TEMPLATE
-- =============================================================================

CREATE OR REPLACE FUNCTION :function_name(
    -- Input parameters
    p_param1 :param1_type,
    p_param2 :param2_type DEFAULT NULL
)
RETURNS :return_type
LANGUAGE plpgsql
-- SECURITY DEFINER: Runs with function owner's privileges (use carefully)
-- SECURITY INVOKER: Runs with caller's privileges (default, safer)
SECURITY INVOKER
-- STABLE: Doesn't modify database, same result for same inputs within transaction
-- VOLATILE: May modify database or return different results (default)
-- IMMUTABLE: Always returns same result for same inputs (for indexing)
STABLE
AS $$
DECLARE
    v_result :return_type;
    v_variable :variable_type;
BEGIN
    -- Input validation
    IF p_param1 IS NULL THEN
        RAISE EXCEPTION 'p_param1 cannot be null';
    END IF;

    -- Main logic
    SELECT column_name
    INTO v_result
    FROM :table_name
    WHERE id = p_param1;

    -- Return result
    RETURN v_result;

EXCEPTION
    WHEN no_data_found THEN
        RAISE EXCEPTION 'No data found for id: %', p_param1;
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error in :function_name: %', SQLERRM;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION :function_name(:param1_type, :param2_type) TO authenticated;

-- Add function comment
COMMENT ON FUNCTION :function_name IS ':description';

-- =============================================================================
-- FUNCTION RETURNING TABLE (for complex queries)
-- =============================================================================

CREATE OR REPLACE FUNCTION :function_name_table(
    p_filter_param :filter_type DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY INVOKER
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.id,
        t.name,
        t.created_at
    FROM :table_name t
    WHERE
        (p_filter_param IS NULL OR t.filter_column = p_filter_param)
        AND t.user_id = auth.uid()  -- RLS-aware
    ORDER BY t.created_at DESC;
END;
$$;

-- =============================================================================
-- FUNCTION WITH TRANSACTION (for mutations)
-- =============================================================================

CREATE OR REPLACE FUNCTION :function_name_mutation(
    p_input_data JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
VOLATILE
AS $$
DECLARE
    v_new_id UUID;
BEGIN
    -- Validate input
    IF NOT (p_input_data ? 'required_field') THEN
        RAISE EXCEPTION 'required_field is missing from input';
    END IF;

    -- Insert new record
    INSERT INTO :table_name (
        name,
        data,
        user_id,
        created_at
    ) VALUES (
        p_input_data->>'name',
        p_input_data->'data',
        auth.uid(),
        NOW()
    )
    RETURNING id INTO v_new_id;

    -- Audit log (optional)
    INSERT INTO audit_log (action, table_name, record_id, user_id)
    VALUES ('INSERT', ':table_name', v_new_id, auth.uid());

    RETURN v_new_id;
END;
$$;

-- =============================================================================
-- RPC ENDPOINT (Supabase-style)
-- =============================================================================
-- Call from client: supabase.rpc(':function_name', { p_param1: value })
--
-- For Supabase, ensure:
-- 1. Function is in public schema
-- 2. GRANT EXECUTE to appropriate roles
-- 3. Consider using SECURITY DEFINER for bypassing RLS when needed
