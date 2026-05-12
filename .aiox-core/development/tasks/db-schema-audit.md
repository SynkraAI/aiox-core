# Task: Schema Audit

**Purpose**: Comprehensive audit of database schema quality and best practices

**Elicit**: false

---

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)
- Autonomous decision making with logging
- Minimal user interaction
- **Best for:** Simple, deterministic tasks

### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**
- Explicit decision checkpoints
- Educational explanations
- **Best for:** Learning, complex decisions

### 3. Pre-Flight Planning - Comprehensive Upfront Planning
- Task analysis phase (identify all ambiguities)
- Zero ambiguity execution
- **Best for:** Ambiguous requirements, critical work

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOX Task Format V1.0)

```yaml
task: dbSchemaAudit()
responsável: Dara (Sage)
responsavel_type: Agente
atomic_layer: Strategy

**Entrada:**
- campo: query
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Valid SQL query

- campo: params
  tipo: object
  origem: User Input
  obrigatório: false
  validação: Query parameters

- campo: connection
  tipo: object
  origem: config
  obrigatório: true
  validação: Valid PostgreSQL connection via Supabase

**Saída:**
- campo: query_result
  tipo: array
  destino: Memory
  persistido: false

- campo: records_affected
  tipo: number
  destino: Return value
  persistido: false

- campo: execution_time
  tipo: number
  destino: Memory
  persistido: false
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Database connection established; query syntax valid
    tipo: pre-condition
    blocker: true
    validação: |
      Check database connection established; query syntax valid
    error_message: "Pre-condition failed: Database connection established; query syntax valid"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Query executed; results returned; transaction committed
    tipo: post-condition
    blocker: true
    validação: |
      Verify query executed; results returned; transaction committed
    error_message: "Post-condition failed: Query executed; results returned; transaction committed"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Data persisted correctly; constraints respected; no orphaned data
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert data persisted correctly; constraints respected; no orphaned data
    error_message: "Acceptance criterion not met: Data persisted correctly; constraints respected; no orphaned data"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** neo4j-driver
  - **Purpose:** Neo4j database connection and query execution
  - **Source:** npm: neo4j-driver

- **Tool:** query-validator
  - **Purpose:** Cypher query syntax validation
  - **Source:** .aiox-core/utils/db-query-validator.js

---

## Scripts

**Agent-specific code for this task:**

- **Script:** db-query.js
  - **Purpose:** Execute Neo4j queries with error handling
  - **Language:** JavaScript
  - **Location:** .aiox-core/scripts/db-query.js

---

## Error Handling

**Strategy:** fallback

**Common Errors:**

1. **Error:** Connection Failed
   - **Cause:** Unable to connect to Neo4j database
   - **Resolution:** Check connection string, credentials, network
   - **Recovery:** Retry with exponential backoff (max 3 attempts)

2. **Error:** Query Syntax Error
   - **Cause:** Invalid Cypher query syntax
   - **Resolution:** Validate query syntax before execution
   - **Recovery:** Return detailed syntax error, suggest fix

3. **Error:** Transaction Rollback
   - **Cause:** Query violates constraints or timeout
   - **Resolution:** Review query logic and constraints
   - **Recovery:** Automatic rollback, preserve data integrity

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 5-20 min (estimated)
cost_estimated: $0.003-0.015
token_usage: ~2,000-8,000 tokens
```

**Optimization Notes:**
- Iterative analysis with depth limits; cache intermediate results; batch similar operations

---

## Metadata

```yaml
story: N/A
version: 1.0.0
dependencies:
  - N/A
tags:
  - database
  - infrastructure
updated_at: 2025-11-17
```

---


## Overview

This task performs a thorough audit of your database schema, checking for:
- Design best practices
- Performance issues
- Security gaps
- Data integrity risks
- Missing indexes
- Naming conventions

---

## Process

### 1. Collect Schema Metadata

Gather comprehensive schema information:

```bash
echo "Collecting schema metadata..."

psql "$SUPABASE_DB_URL" << 'EOF'
-- Save to temp tables for analysis

-- Tables
CREATE TEMP TABLE audit_tables AS
SELECT
  schemaname,
  tablename,
  pg_total_relation_size(schemaname||'.'||tablename) AS total_size
FROM pg_tables
WHERE schemaname = 'public';

-- Columns
CREATE TEMP TABLE audit_columns AS
SELECT
  table_schema,
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public';

-- Indexes
CREATE TEMP TABLE audit_indexes AS
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef,
  pg_relation_size(indexrelid) AS index_size
FROM pg_indexes
WHERE schemaname = 'public';

-- Foreign Keys
CREATE TEMP TABLE audit_fks AS
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table,
  ccu.column_name AS foreign_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public';

SELECT '✓ Metadata collected' AS status;
EOF
```

### 2. Check Design Best Practices

Run design checks:

```bash
psql "$SUPABASE_DB_URL" << 'EOF'
\echo '=========================================='
\echo '🔍 DESIGN BEST PRACTICES AUDIT'
\echo '=========================================='
\echo ''

-- Check 1: Tables without primary keys
\echo '1. Tables without PRIMARY KEY:'
SELECT table_name
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema = t.table_schema
      AND table_name = t.table_name
      AND constraint_type = 'PRIMARY KEY'
  );
\echo ''

-- Check 2: Tables without created_at
\echo '2. Tables without created_at timestamp:'
SELECT table_name
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = t.table_schema
      AND table_name = t.table_name
      AND column_name IN ('created_at', 'createdat')
  );
\echo ''

-- Check 3: Tables without updated_at
\echo '3. Tables without updated_at timestamp:'
SELECT table_name
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = t.table_schema
      AND table_name = t.table_name
      AND column_name IN ('updated_at', 'updatedat')
  );
\echo ''

-- Check 4: Foreign keys without indexes
\echo '4. Foreign keys without indexes (performance issue):'
SELECT
  fk.table_name,
  fk.column_name,
  fk.foreign_table
FROM audit_fks fk
WHERE NOT EXISTS (
  SELECT 1
  FROM pg_indexes idx
  WHERE idx.tablename = fk.table_name
    AND idx.indexdef LIKE '%' || fk.column_name || '%'
);
\echo ''

-- Check 5: Nullable columns that should be NOT NULL
\echo '5. Suspicious nullable columns (id, *_id, email, created_at):'
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND is_nullable = 'YES'
  AND (
    column_name = 'id'
    OR column_name = 'email'
    OR column_name = 'created_at'
    OR column_name LIKE '%_id'
  );
\echo ''

EOF
```

### 3. Check Performance Issues

Identify performance problems:

```bash
psql "$SUPABASE_DB_URL" << 'EOF'
\echo '=========================================='
\echo '⚡ PERFORMANCE ISSUES AUDIT'
\echo '=========================================='
\echo ''

-- Check 1: Missing indexes on foreign keys
\echo '1. Foreign keys without indexes:'
[Same as Check 4 above]
\echo ''

-- Check 2: Tables without indexes (except very small tables)
\echo '2. Tables without any indexes (excluding tiny tables):'
SELECT
  t.tablename,
  pg_size_pretty(pg_total_relation_size('public.' || t.tablename)) AS size
FROM pg_tables t
WHERE t.schemaname = 'public'
  AND NOT EXISTS (
    SELECT 1
    FROM pg_indexes idx
    WHERE idx.tablename = t.tablename
      AND idx.schemaname = t.schemaname
  )
  AND pg_total_relation_size('public.' || t.tablename) > 8192;  -- > 8KB
\echo ''

-- Check 3: Unused indexes
\echo '3. Unused indexes (0 scans, size > 1MB):'
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) AS size,
  idx_scan
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan = 0
  AND indexname NOT LIKE '%_pkey'  -- Exclude primary keys
  AND pg_relation_size(indexrelid) > 1024*1024;  -- > 1MB
\echo ''

-- Check 4: Duplicate indexes
\echo '4. Potential duplicate indexes:'
SELECT
  a.tablename,
  a.indexname AS index1,
  b.indexname AS index2
FROM pg_indexes a
JOIN pg_indexes b
  ON a.tablename = b.tablename
  AND a.indexname < b.indexname
  AND a.indexdef = b.indexdef
WHERE a.schemaname = 'public';
\echo ''

-- Check 5: Large tables without partitioning
\echo '5. Large tables (>1GB) that might benefit from partitioning:'
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size('public.' || tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
  AND pg_total_relation_size('public.' || tablename) > 1024*1024*1024
ORDER BY pg_total_relation_size('public.' || tablename) DESC;
\echo ''

EOF
```

### 4. Check Security

Audit security configuration:

```bash
psql "$SUPABASE_DB_URL" << 'EOF'
\echo '=========================================='
\echo '🔒 SECURITY AUDIT'
\echo '=========================================='
\echo ''

-- Check 1: Tables without RLS
\echo '1. Tables without Row Level Security enabled:'
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = false;
\echo ''

-- Check 2: Tables with RLS but no policies
\echo '2. Tables with RLS enabled but no policies:'
SELECT
  t.schemaname,
  t.tablename
FROM pg_tables t
WHERE t.schemaname = 'public'
  AND t.rowsecurity = true
  AND NOT EXISTS (
    SELECT 1
    FROM pg_policies p
    WHERE p.schemaname = t.schemaname
      AND p.tablename = t.tablename
  );
\echo ''

-- Check 3: RLS policy coverage
\echo '3. RLS policy coverage by table:'
SELECT
  t.tablename,
  t.rowsecurity AS rls_enabled,
  COUNT(p.policyname) AS policy_count,
  STRING_AGG(DISTINCT p.cmd, ', ') AS operations
FROM pg_tables t
LEFT JOIN pg_policies p
  ON t.tablename = p.tablename
  AND t.schemaname = p.schemaname
WHERE t.schemaname = 'public'
GROUP BY t.tablename, t.rowsecurity
ORDER BY t.tablename;
\echo ''

-- Check 4: Columns that might contain PII without encryption
\echo '4. Potential PII columns (consider encryption/hashing):'
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND (
    column_name ILIKE '%ssn%'
    OR column_name ILIKE '%tax_id%'
    OR column_name ILIKE '%passport%'
    OR column_name ILIKE '%credit_card%'
    OR column_name ILIKE '%password%'
  );
\echo ''

EOF
```

### 5. Check Data Integrity

Verify constraints and relationships:

```bash
psql "$SUPABASE_DB_URL" << 'EOF'
\echo '=========================================='
\echo '✅ DATA INTEGRITY AUDIT'
\echo '=========================================='
\echo ''

-- Check 1: Foreign key relationships count
\echo '1. Foreign key relationship summary:'
SELECT
  COUNT(*) AS total_fk_constraints,
  COUNT(DISTINCT table_name) AS tables_with_fks
FROM audit_fks;
\echo ''

-- Check 2: Check constraints count
\echo '2. CHECK constraints summary:'
SELECT
  COUNT(*) AS total_check_constraints
FROM information_schema.check_constraints
WHERE constraint_schema = 'public';
\echo ''

-- Check 3: Unique constraints count
\echo '3. UNIQUE constraints summary:'
SELECT
  COUNT(*) AS total_unique_constraints
FROM information_schema.table_constraints
WHERE constraint_schema = 'public'
  AND constraint_type = 'UNIQUE';
\echo ''

-- Check 4: Tables without any constraints (red flag)
\echo '4. Tables without constraints (potential issues):'
SELECT table_name
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema = t.table_schema
      AND table_name = t.table_name
  );
\echo ''

-- Check 5: Orphaned records (FK points to non-existent record)
\echo '5. Checking for orphaned records...'
\echo '   (This check requires custom queries per table)'
\echo '   Example:'
\echo '   SELECT COUNT(*) FROM posts p'
\echo '   WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = p.user_id);'
\echo ''

EOF
```

### 6. Generate Audit Report

Create comprehensive report:

```bash
REPORT_FILE="supabase/docs/schema-audit-$(date +%Y%m%d%H%M%S).md"
mkdir -p supabase/docs

cat > "$REPORT_FILE" << 'MDEOF'
# Database Schema Audit Report

**Date**: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
**Database**: [redacted]
**Auditor**: DB Sage

---

## Executive Summary

- Tables audited: {count}
- Total database size: {size}
- Critical issues: {critical_count}
- Warnings: {warning_count}
- Recommendations: {rec_count}

**Overall Score**: {score}/100

---

## Critical Issues 🔴

### 1. Tables without Primary Keys
{list_of_tables}

**Impact**: Cannot uniquely identify rows, replication issues
**Fix**: Add UUID or SERIAL primary key

---

### 2. Foreign Keys without Indexes
{list_of_fks}

**Impact**: Slow JOIN queries, slow ON DELETE CASCADE
**Fix**: Create indexes on FK columns

---

## Warnings ⚠️

### 3. Missing Timestamps
{list_of_tables_without_timestamps}

**Impact**: No audit trail, cannot track record creation/modification
**Fix**: Add created_at, updated_at columns

---

### 4. Tables without RLS
{list_of_tables_without_rls}

**Impact**: Security risk in multi-tenant applications
**Fix**: Enable RLS and create policies

---

## Recommendations 💡

### 5. Performance Optimizations
- Add indexes on frequently queried columns
- Consider partitioning for tables > 1GB
- Remove unused indexes (saves space, improves write performance)

### 6. Security Hardening
- Encrypt PII columns
- Implement RLS on all user-facing tables
- Add check constraints for data validation

### 7. Naming Conventions
- Use snake_case consistently
- Prefix foreign keys with table name (e.g., user_id not uid)
- Use plural for table names (e.g., users not user)

---

## Detailed Findings

[Include full output from all checks above]

---

## Action Items

Priority | Action | Estimated Effort
---------|--------|------------------
P0 | Add primary keys to {tables} | 1 hour
P0 | Index foreign keys | 2 hours
P1 | Enable RLS on {tables} | 4 hours
P1 | Add timestamps | 2 hours
P2 | Optimize indexes | 4 hours

---

## SQL Fixes

```sql
-- Fix 1: Add primary keys
ALTER TABLE {table} ADD COLUMN id UUID PRIMARY KEY DEFAULT gen_random_uuid();

-- Fix 2: Index foreign keys
CREATE INDEX CONCURRENTLY idx_{table}_{fk} ON {table}({fk_column});

-- Fix 3: Enable RLS
ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;
CREATE POLICY "{table}_policy" ON {table} FOR ALL TO authenticated
  USING (auth.uid() = user_id);

-- Fix 4: Add timestamps
ALTER TABLE {table} ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE {table} ADD COLUMN updated_at TIMESTAMPTZ;
```

MDEOF

echo "✓ Audit report: $REPORT_FILE"
```

---

## Output

Display audit summary:

```
✅ SCHEMA AUDIT COMPLETE

Database: [redacted]
Tables:   {count}
Size:     {size}

Critical Issues: {count} 🔴
Warnings:        {count} ⚠️
Recommendations: {count} 💡

Overall Score: {score}/100

Report: supabase/docs/schema-audit-{timestamp}.md

Top Issues:
1. {issue_1}
2. {issue_2}
3. {issue_3}

Next Steps:
1. Review full report: cat {report_file}
2. Prioritize fixes
3. Create migrations for P0 issues
4. Re-run audit after fixes
```

---

## Scoring Rubric

- **100**: Perfect schema (rare!)
- **90-99**: Excellent, minor improvements
- **80-89**: Good, some best practices missed
- **70-79**: Fair, several issues to address
- **60-69**: Needs work, security or performance risks
- **<60**: Critical issues, not production-ready

---

## Advanced Auditing Tools

### 1. Audit Triggers (Change Tracking)

**Purpose:** Track all changes (INSERT, UPDATE, DELETE) with who, when, what changed

**Implementation:**
```sql
-- Create audit log schema
CREATE SCHEMA IF NOT EXISTS audit;

-- Audit log table
CREATE TABLE audit.logged_actions (
  event_id BIGSERIAL PRIMARY KEY,
  schema_name TEXT NOT NULL,
  table_name TEXT NOT NULL,
  relid OID NOT NULL,
  session_user_name TEXT,
  action_tstamp_tx TIMESTAMPTZ NOT NULL DEFAULT transaction_timestamp(),
  action_tstamp_stm TIMESTAMPTZ NOT NULL DEFAULT statement_timestamp(),
  action_tstamp_clk TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  transaction_id BIGINT,
  application_name TEXT,
  client_addr INET,
  client_port INTEGER,
  client_query TEXT,
  action TEXT NOT NULL CHECK (action IN ('I','D','U', 'T')),
  row_data JSONB,
  changed_fields JSONB,
  statement_only BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_audit_relid ON audit.logged_actions(relid);
CREATE INDEX idx_audit_action_tstamp ON audit.logged_actions(action_tstamp_tx);
CREATE INDEX idx_audit_table_name ON audit.logged_actions(table_name);

-- Generic audit trigger function
CREATE OR REPLACE FUNCTION audit.if_modified_func()
RETURNS TRIGGER AS $$
DECLARE
  audit_row audit.logged_actions;
  excluded_cols TEXT[] = ARRAY[]::TEXT[];
BEGIN
  IF TG_WHEN <> 'AFTER' THEN
    RAISE EXCEPTION 'audit.if_modified_func() may only run as an AFTER trigger';
  END IF;

  audit_row = ROW(
    nextval('audit.logged_actions_event_id_seq'),  -- event_id
    TG_TABLE_SCHEMA::TEXT,                         -- schema_name
    TG_TABLE_NAME::TEXT,                           -- table_name
    TG_RELID,                                      -- relid
    session_user::TEXT,                            -- session_user_name
    current_timestamp,                             -- action_tstamp_tx
    statement_timestamp(),                         -- action_tstamp_stm
    clock_timestamp(),                             -- action_tstamp_clk
    txid_current(),                                -- transaction_id
    current_setting('application_name'),           -- application_name
    inet_client_addr(),                            -- client_addr
    inet_client_port(),                            -- client_port
    current_query(),                               -- client_query
    substring(TG_OP,1,1),                          -- action
    NULL,                                          -- row_data (set below)
    NULL,                                          -- changed_fields (set below)
    false                                          -- statement_only
  );

  IF TG_OP = 'UPDATE' AND TG_LEVEL = 'ROW' THEN
    audit_row.row_data = to_jsonb(OLD);
    audit_row.changed_fields = jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    );
  ELSIF TG_OP = 'DELETE' AND TG_LEVEL = 'ROW' THEN
    audit_row.row_data = to_jsonb(OLD);
  ELSIF TG_OP = 'INSERT' AND TG_LEVEL = 'ROW' THEN
    audit_row.row_data = to_jsonb(NEW);
  ELSE
    RAISE EXCEPTION '[audit.if_modified_func] - Trigger func added as trigger for unhandled case: %, %',TG_OP, TG_LEVEL;
    RETURN NULL;
  END IF;

  INSERT INTO audit.logged_actions VALUES (audit_row.*);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply to tables (example)
CREATE TRIGGER audit_trigger_row
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION audit.if_modified_func();
```

**Benefits:**
- Complete audit trail of all changes
- Forensic analysis capabilities
- Compliance requirements (GDPR, SOX, HIPAA)
- Debugging production issues

### 2. pgAudit Extension (PostgreSQL Auditing)

**Purpose:** Comprehensive session and object audit logging

```sql
-- Install extension
CREATE EXTENSION IF NOT EXISTS pgaudit;

-- Configure (in postgresql.conf or ALTER SYSTEM)
ALTER SYSTEM SET pgaudit.log = 'write';  -- Log all writes
ALTER SYSTEM SET pgaudit.log_catalog = off;  -- Don't log catalog queries
ALTER SYSTEM SET pgaudit.log_parameter = on;  -- Include parameter values
ALTER SYSTEM SET pgaudit.log_relation = on;  -- Include table names
ALTER SYSTEM SET pgaudit.log_statement_once = off;  -- Log each statement

-- Reload configuration
SELECT pg_reload_conf();

-- Example: Audit specific table
CREATE ROLE auditor;
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO auditor;
ALTER ROLE auditor SET pgaudit.log = 'write';
```

**What gets logged:**
- All DDL operations (CREATE, ALTER, DROP)
- All DML operations (INSERT, UPDATE, DELETE) based on config
- Parameter values (for forensics)
- Session information

### 3. pgTAP Extension (Database Testing)

**Purpose:** Unit tests for database schema, constraints, and data

**Installation:**
```sql
CREATE EXTENSION IF NOT EXISTS pgtap;
```

**Example test suite:**
```sql
-- File: tests/schema_tests.sql
BEGIN;
SELECT plan(10);  -- Number of tests

-- Test 1: Check table exists
SELECT has_table('public', 'users', 'users table exists');

-- Test 2: Check primary key
SELECT has_pk('public', 'users', 'users has primary key');

-- Test 3: Check specific columns
SELECT has_column('public', 'users', 'id', 'users.id exists');
SELECT has_column('public', 'users', 'email', 'users.email exists');
SELECT has_column('public', 'users', 'created_at', 'users.created_at exists');

-- Test 4: Check column types
SELECT col_type_is('public', 'users', 'id', 'uuid', 'users.id is UUID');
SELECT col_type_is('public', 'users', 'email', 'text', 'users.email is TEXT');

-- Test 5: Check NOT NULL constraints
SELECT col_not_null('public', 'users', 'email', 'users.email is NOT NULL');

-- Test 6: Check foreign keys
SELECT has_fk('public', 'posts', 'posts has foreign key');

-- Test 7: Check indexes
SELECT has_index('public', 'users', 'idx_users_email', 'email index exists');

SELECT * FROM finish();
ROLLBACK;
```

**Run tests:**
```bash
psql "$DB_URL" -f tests/schema_tests.sql
```

**CI/CD Integration:**
```yaml
# .github/workflows/test.yml
- name: Run pgTAP tests
  run: |
    pg_prove --dbname "$DB_URL" tests/*.sql
```

### 4. Named Constraints (Best Practice)

**Why naming matters:**
- Error messages become informative
- Easier to troubleshoot constraint violations
- Explicit documentation of business rules

**Examples:**
```sql
-- ❌ BAD: Unnamed constraints
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  age INTEGER CHECK (age >= 18)
);
-- Error: "violates check constraint users_age_check" (cryptic!)

-- ✅ GOOD: Named constraints with descriptive names
CREATE TABLE users (
  id UUID CONSTRAINT users_pkey PRIMARY KEY,
  email TEXT CONSTRAINT users_email_unique UNIQUE,
  age INTEGER CONSTRAINT users_age_must_be_adult CHECK (age >= 18),
  created_at TIMESTAMPTZ CONSTRAINT users_created_at_required NOT NULL,
  status TEXT CONSTRAINT users_status_valid CHECK (status IN ('active', 'suspended', 'deleted'))
);
-- Error: "violates check constraint users_age_must_be_adult" (clear!)
```

**Naming conventions:**
```
{table}_{column}_{type}
{table}_{columns}_{type}

Types:
- pkey: Primary key
- fkey: Foreign key
- unique: Unique constraint
- check: Check constraint
- idx: Index
```

**Audit query for unnamed constraints:**
```sql
-- Find constraints without descriptive names
SELECT
  conname AS constraint_name,
  conrelid::regclass AS table_name,
  contype AS constraint_type
FROM pg_constraint
WHERE connamespace = 'public'::regnamespace
  AND (
    -- Auto-generated names (PostgreSQL pattern)
    conname ~ '_pkey$|_key$|_fkey$|_check$|_not_null$'
    AND NOT conname ~ '^[a-z]+_[a-z_]+_(pkey|fkey|unique|check|required|valid)'
  )
ORDER BY conrelid::regclass::TEXT, conname;
```

---

## References

- [PostgreSQL Best Practices](https://wiki.postgresql.org/wiki/Don't_Do_This)
- [Supabase RLS Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Design Best Practices](https://www.postgresql.org/docs/current/ddl.html)
- [PostgreSQL Audit Trigger](https://wiki.postgresql.org/wiki/Audit_trigger)
- [pgAudit Extension](https://www.pgaudit.org/)
- [pgTAP Documentation](https://pgtap.org/)
