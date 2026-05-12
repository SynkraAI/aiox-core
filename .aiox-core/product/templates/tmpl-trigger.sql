-- Trigger Template
-- Table: :table_name
-- Created: :created_date
-- Author: :author
-- Description: :description
--
-- IMPORTANT: Triggers run automatically - test thoroughly before deployment

-- =============================================================================
-- UPDATED_AT TRIGGER (Most Common)
-- =============================================================================

-- Trigger function: Updates updated_at column on row modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to table
DROP TRIGGER IF EXISTS trigger_:table_name_updated_at ON :table_name;
CREATE TRIGGER trigger_:table_name_updated_at
    BEFORE UPDATE ON :table_name
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- AUDIT LOG TRIGGER
-- =============================================================================

-- Audit log table (if not exists)
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_table_record ON audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_changed_at ON audit_log(changed_at);

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (table_name, record_id, action, new_data, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (table_name, record_id, action, old_data, new_data, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (table_name, record_id, action, old_data, changed_by)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD), auth.uid());
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit trigger to table
DROP TRIGGER IF EXISTS trigger_:table_name_audit ON :table_name;
CREATE TRIGGER trigger_:table_name_audit
    AFTER INSERT OR UPDATE OR DELETE ON :table_name
    FOR EACH ROW
    EXECUTE FUNCTION audit_trigger_function();

-- =============================================================================
-- VALIDATION TRIGGER
-- =============================================================================

-- Custom validation trigger function
CREATE OR REPLACE FUNCTION :table_name_validation_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Example: Validate email format
    IF NEW.email IS NOT NULL AND NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
        RAISE EXCEPTION 'Invalid email format: %', NEW.email;
    END IF;

    -- Example: Validate status transitions
    IF TG_OP = 'UPDATE' AND OLD.status = 'completed' AND NEW.status != 'completed' THEN
        RAISE EXCEPTION 'Cannot change status from completed';
    END IF;

    -- Example: Auto-set values
    IF TG_OP = 'INSERT' THEN
        NEW.created_by = COALESCE(NEW.created_by, auth.uid());
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_:table_name_validation ON :table_name;
CREATE TRIGGER trigger_:table_name_validation
    BEFORE INSERT OR UPDATE ON :table_name
    FOR EACH ROW
    EXECUTE FUNCTION :table_name_validation_trigger();

-- =============================================================================
-- SOFT DELETE TRIGGER
-- =============================================================================

-- Instead of deleting, set deleted_at timestamp
CREATE OR REPLACE FUNCTION soft_delete_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Instead of DELETE, UPDATE with deleted_at
    UPDATE :table_name
    SET deleted_at = NOW()
    WHERE id = OLD.id;

    -- Return NULL to cancel the actual DELETE
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_:table_name_soft_delete ON :table_name;
CREATE TRIGGER trigger_:table_name_soft_delete
    BEFORE DELETE ON :table_name
    FOR EACH ROW
    EXECUTE FUNCTION soft_delete_trigger();

-- =============================================================================
-- NOTIFICATION TRIGGER (for Supabase Realtime)
-- =============================================================================

-- Notify on changes (Supabase handles this automatically for enabled tables)
-- Manual implementation if needed:

CREATE OR REPLACE FUNCTION notify_changes()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify(
        TG_TABLE_NAME || '_changes',
        json_build_object(
            'operation', TG_OP,
            'record', CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END
        )::TEXT
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
