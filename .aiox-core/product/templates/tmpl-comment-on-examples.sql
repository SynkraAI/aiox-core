-- COMMENT ON Examples Template
-- Purpose: Document database objects inline using PostgreSQL COMMENT ON
-- Created: :created_date
-- Author: :author
--
-- IMPORTANT: Comments are metadata that help future developers understand the schema

-- =============================================================================
-- TABLE COMMENTS
-- =============================================================================

-- Basic table comment
COMMENT ON TABLE :table_name IS 'Description of what this table stores and its purpose';

-- Detailed table comment with usage notes
COMMENT ON TABLE users IS
'User accounts for the application.
Primary user data is stored here, with profile details in user_profiles.
RLS policies ensure users can only access their own data.
Related tables: user_profiles, user_roles, user_sessions';

-- =============================================================================
-- COLUMN COMMENTS
-- =============================================================================

-- Standard audit columns
COMMENT ON COLUMN :table_name.id IS 'Unique identifier (UUID v4)';
COMMENT ON COLUMN :table_name.created_at IS 'Timestamp when record was created';
COMMENT ON COLUMN :table_name.updated_at IS 'Timestamp of last modification';
COMMENT ON COLUMN :table_name.deleted_at IS 'Soft delete timestamp (NULL if active)';

-- Business columns with context
COMMENT ON COLUMN users.email IS 'Primary email for login and notifications. Must be unique.';
COMMENT ON COLUMN users.status IS 'Account status: active, pending, suspended, deleted';

-- Columns with constraints explained
COMMENT ON COLUMN orders.total_amount IS
'Order total in cents (not dollars). Calculated from line items.
Constraint: Must be >= 0';

-- Foreign key columns
COMMENT ON COLUMN orders.user_id IS
'References users.id. Owner of this order.
CASCADE on delete (user deletion removes orders).';

-- JSONB columns with structure
COMMENT ON COLUMN users.preferences IS
'User preferences as JSONB. Structure:
{
  "theme": "dark" | "light",
  "notifications": { "email": boolean, "push": boolean },
  "language": "en" | "pt" | "es"
}';

-- =============================================================================
-- INDEX COMMENTS
-- =============================================================================

COMMENT ON INDEX idx_users_email IS 'Unique index for email lookups and login';
COMMENT ON INDEX idx_orders_user_id IS 'Foreign key index for user order queries';
COMMENT ON INDEX idx_orders_created_at IS 'Date range queries on order creation';

-- Composite index explanation
COMMENT ON INDEX idx_orders_user_status IS
'Composite index for filtering user orders by status.
Covers queries: WHERE user_id = ? AND status = ?';

-- =============================================================================
-- CONSTRAINT COMMENTS
-- =============================================================================

-- Check constraints
COMMENT ON CONSTRAINT orders_total_positive ON orders IS
'Ensures total_amount is never negative';

COMMENT ON CONSTRAINT users_email_format ON users IS
'Validates email format using regex pattern';

-- Foreign key constraints
COMMENT ON CONSTRAINT orders_user_id_fkey ON orders IS
'Links order to user. ON DELETE CASCADE removes orphan orders.';

-- =============================================================================
-- FUNCTION COMMENTS
-- =============================================================================

COMMENT ON FUNCTION update_updated_at_column() IS
'Trigger function to auto-update updated_at column.
Used by: All tables with updated_at column.
Trigger timing: BEFORE UPDATE FOR EACH ROW';

COMMENT ON FUNCTION calculate_order_total(UUID) IS
'Calculates order total from line items.
Parameters: order_id UUID
Returns: NUMERIC(10,2) total in cents
Usage: SELECT calculate_order_total(order_id) FROM orders';

-- =============================================================================
-- TRIGGER COMMENTS
-- =============================================================================

COMMENT ON TRIGGER trigger_orders_updated_at ON orders IS
'Auto-updates updated_at on row modification';

COMMENT ON TRIGGER trigger_orders_audit ON orders IS
'Logs all changes to audit_log table';

-- =============================================================================
-- VIEW COMMENTS
-- =============================================================================

COMMENT ON VIEW user_dashboard IS
'Aggregated user data for dashboard display.
Includes: user info, order counts, recent activity.
Performance: Uses materialized subqueries for counts.
Refresh: Live data (not materialized)';

-- =============================================================================
-- TYPE COMMENTS (for custom types)
-- =============================================================================

-- COMMENT ON TYPE order_status IS
-- 'Enum for order lifecycle: pending, processing, shipped, delivered, cancelled';

-- =============================================================================
-- SCHEMA COMMENTS
-- =============================================================================

COMMENT ON SCHEMA public IS 'Main application schema with user-facing tables';
-- COMMENT ON SCHEMA audit IS 'Audit logging and compliance tracking';
-- COMMENT ON SCHEMA analytics IS 'Aggregated data for reporting';

-- =============================================================================
-- VIEWING COMMENTS
-- =============================================================================

-- View table comments
SELECT
    t.table_name,
    pg_catalog.obj_description(
        (quote_ident(t.table_schema) || '.' || quote_ident(t.table_name))::regclass,
        'pg_class'
    ) AS comment
FROM information_schema.tables t
WHERE t.table_schema = 'public'
AND t.table_type = 'BASE TABLE';

-- View column comments
SELECT
    c.table_name,
    c.column_name,
    pg_catalog.col_description(
        (quote_ident(c.table_schema) || '.' || quote_ident(c.table_name))::regclass,
        c.ordinal_position
    ) AS comment
FROM information_schema.columns c
WHERE c.table_schema = 'public'
ORDER BY c.table_name, c.ordinal_position;
