# Task: Security Audit

**Purpose**: Comprehensive database security and quality audit (RLS coverage, schema design, full system)

**Elicit**: true

**Consolidated From (Story 6.1.2.3):**
- `db-rls-audit.md` - RLS policy coverage checking
- `schema-audit.md` - Schema design quality validation

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
task: securityAudit()
responsável: Quinn (Guardian)
responsavel_type: Agente
atomic_layer: Strategy

**Entrada:**
- campo: target
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Valid path or resource

- campo: scan_depth
  tipo: number
  origem: config
  obrigatório: false
  validação: Default: 2 (1-5)

- campo: rules
  tipo: array
  origem: config
  obrigatório: true
  validação: Security rule set

**Saída:**
- campo: scan_report
  tipo: object
  destino: File (.ai/security/*)
  persistido: true

- campo: vulnerabilities
  tipo: array
  destino: Memory
  persistido: false

- campo: risk_score
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
  - [ ] Scanner available; target accessible; rules configured
    tipo: pre-condition
    blocker: true
    validação: |
      Check scanner available; target accessible; rules configured
    error_message: "Pre-condition failed: Scanner available; target accessible; rules configured"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Scan completed; vulnerabilities reported; no scan errors
    tipo: post-condition
    blocker: true
    validação: |
      Verify scan completed; vulnerabilities reported; no scan errors
    error_message: "Post-condition failed: Scan completed; vulnerabilities reported; no scan errors"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] No critical vulnerabilities; all checks passed
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert no critical vulnerabilities; all checks passed
    error_message: "Acceptance criterion not met: No critical vulnerabilities; all checks passed"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** security-scanner
  - **Purpose:** Static security analysis and vulnerability detection
  - **Source:** npm: eslint-plugin-security or similar

- **Tool:** dependency-checker
  - **Purpose:** Check for vulnerable dependencies
  - **Source:** npm audit or snyk

---

## Scripts

**Agent-specific code for this task:**

- **Script:** security-scan.js
  - **Purpose:** Run security scans and generate reports
  - **Language:** JavaScript
  - **Location:** .aiox-core/scripts/security-scan.js

---

## Error Handling

**Strategy:** retry

**Common Errors:**

1. **Error:** Scanner Unavailable
   - **Cause:** Security scanner not installed or failed
   - **Resolution:** Install scanner or check configuration
   - **Recovery:** Skip scan with high-risk warning

2. **Error:** Critical Vulnerability Detected
   - **Cause:** High-severity security issue found
   - **Resolution:** Review vulnerability report, apply patches
   - **Recovery:** Block deployment, alert team

3. **Error:** Scan Timeout
   - **Cause:** Large codebase exceeds scan time limit
   - **Resolution:** Reduce scope or increase timeout
   - **Recovery:** Partial scan results with warning

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
  - security
  - audit
updated_at: 2025-11-17
```

---


## Elicitation

**Prompt user to select audit scope:**

```
Select security audit scope:

1. **rls** - RLS policy coverage only (quick)
2. **schema** - Schema design quality only (quick)
3. **full** - Complete security audit (comprehensive)

Which scope? [rls/schema/full]:
```

**Capture:** `{scope}`

---

## Process

### Scope: RLS Audit

**When:** User selects `rls` or `full`

**Purpose:** Report tables with/without RLS and list all policies

```bash
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo '=== RLS Coverage Audit ==='
\echo ''

-- Tables with/without RLS
WITH t AS (
  SELECT tablename, rowsecurity
  FROM pg_tables WHERE schemaname='public'
)
SELECT
  tablename,
  CASE WHEN rowsecurity THEN '✓ ENABLED' ELSE '❌ DISABLED' END AS rls_status,
  (SELECT json_agg(json_build_object(
    'policy', policyname,
    'cmd', cmd,
    'roles', roles,
    'qual', qual,
    'with_check', with_check
  ))
   FROM pg_policies p
   WHERE p.tablename=t.tablename
   AND p.schemaname='public') AS policies
FROM t
ORDER BY rowsecurity DESC, tablename;

\echo ''
\echo '=== RLS Summary ==='

SELECT
  COUNT(*) AS total_tables,
  COUNT(*) FILTER (WHERE rowsecurity) AS rls_enabled,
  COUNT(*) FILTER (WHERE NOT rowsecurity) AS rls_disabled
FROM pg_tables
WHERE schemaname='public';

\echo ''
\echo '=== Tables Without RLS (Security Risk) ==='

SELECT tablename
FROM pg_tables
WHERE schemaname='public'
AND rowsecurity = false
ORDER BY tablename;

\echo ''
\echo '=== Policy Coverage by Command ==='

SELECT
  tablename,
  COUNT(*) FILTER (WHERE cmd='SELECT') AS select_policies,
  COUNT(*) FILTER (WHERE cmd='INSERT') AS insert_policies,
  COUNT(*) FILTER (WHERE cmd='UPDATE') AS update_policies,
  COUNT(*) FILTER (WHERE cmd='DELETE') AS delete_policies
FROM pg_policies
WHERE schemaname='public'
GROUP BY tablename
ORDER BY tablename;

SQL
```

---

### Scope: Schema Audit

**When:** User selects `schema` or `full`

**Purpose:** Validate schema design quality and best practices

```bash
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo '=== Schema Design Quality Audit ==='
\echo ''

-- Missing Primary Keys
\echo '1. Tables Without Primary Keys (CRITICAL):'
SELECT t.tablename
FROM pg_tables t
LEFT JOIN pg_constraint c ON c.conrelid = (t.schemaname||'.'||t.tablename)::regclass
  AND c.contype = 'p'
WHERE t.schemaname = 'public'
  AND c.conname IS NULL
ORDER BY t.tablename;

\echo ''
\echo '2. Missing NOT NULL on Required Fields:'
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND is_nullable = 'YES'
  AND column_name IN ('email', 'user_id', 'created_at', 'updated_at', 'status')
ORDER BY table_name, column_name;

\echo ''
\echo '3. Missing Foreign Key Constraints:'
-- Tables with _id columns but no FK
SELECT
  c.table_name,
  c.column_name,
  'Missing FK to ' || REPLACE(c.column_name, '_id', 's') AS suggestion
FROM information_schema.columns c
LEFT JOIN information_schema.table_constraints tc
  ON tc.table_name = c.table_name
  AND tc.constraint_type = 'FOREIGN KEY'
LEFT JOIN information_schema.key_column_usage kcu
  ON kcu.constraint_name = tc.constraint_name
  AND kcu.column_name = c.column_name
WHERE c.table_schema = 'public'
  AND c.column_name LIKE '%_id'
  AND c.column_name != 'id'
  AND kcu.column_name IS NULL
ORDER BY c.table_name, c.column_name;

\echo ''
\echo '4. Missing Audit Timestamps (created_at, updated_at):'
SELECT
  t.tablename,
  CASE WHEN created_col.column_name IS NULL THEN '❌ No created_at' ELSE '✓' END AS created,
  CASE WHEN updated_col.column_name IS NULL THEN '❌ No updated_at' ELSE '✓' END AS updated
FROM pg_tables t
LEFT JOIN information_schema.columns created_col
  ON created_col.table_name = t.tablename
  AND created_col.column_name = 'created_at'
  AND created_col.table_schema = 'public'
LEFT JOIN information_schema.columns updated_col
  ON updated_col.table_name = t.tablename
  AND updated_col.column_name = 'updated_at'
  AND updated_col.table_schema = 'public'
WHERE t.schemaname = 'public'
  AND (created_col.column_name IS NULL OR updated_col.column_name IS NULL)
ORDER BY t.tablename;

\echo ''
\echo '5. Missing Indexes on Foreign Keys:'
SELECT
  t.tablename,
  c.column_name,
  'CREATE INDEX idx_' || t.tablename || '_' || c.column_name || ' ON ' || t.tablename || '(' || c.column_name || ');' AS suggested_index
FROM pg_tables t
JOIN information_schema.columns c ON c.table_name = t.tablename
LEFT JOIN pg_indexes i ON i.tablename = t.tablename
  AND i.indexdef LIKE '%' || c.column_name || '%'
WHERE t.schemaname = 'public'
  AND c.table_schema = 'public'
  AND c.column_name LIKE '%_id'
  AND c.column_name != 'id'
  AND i.indexname IS NULL
ORDER BY t.tablename, c.column_name;

\echo ''
\echo '=== Schema Audit Summary ==='
SELECT
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname='public') AS total_tables,
  (SELECT COUNT(DISTINCT tablename) FROM pg_policies WHERE schemaname='public') AS tables_with_policies,
  (SELECT COUNT(*) FROM pg_constraint WHERE contype='f') AS foreign_keys,
  (SELECT COUNT(*) FROM pg_indexes WHERE schemaname='public') AS total_indexes;

SQL
```

---

### Scope: Full Audit

**When:** User selects `full`

**Executes:** Both RLS audit + Schema audit sequentially

**Additional Checks:**

```bash
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo ''
\echo '=== Security Best Practices Check ==='
\echo ''

-- Check for sensitive data exposure
\echo '6. Potential PII/Sensitive Columns (Review for RLS):'
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND (
    column_name ILIKE '%password%'
    OR column_name ILIKE '%token%'
    OR column_name ILIKE '%secret%'
    OR column_name ILIKE '%ssn%'
    OR column_name ILIKE '%credit%'
    OR column_name ILIKE '%api_key%'
  )
ORDER BY table_name, column_name;

\echo ''
\echo '7. Public Schema Permissions:'
SELECT
  schemaname,
  tablename,
  tableowner,
  hasindexes,
  hasrules,
  hastriggers
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

SQL
```

---

## Output

### RLS Audit Output

```
=== RLS Coverage Audit ===

 tablename | rls_status |           policies
-----------+------------+-------------------------------
 users     | ✓ ENABLED  | [{"policy":"Users read own",...}]
 posts     | ✓ ENABLED  | [{"policy":"Public read",...}]
 secrets   | ❌ DISABLED| null

=== RLS Summary ===

 total_tables | rls_enabled | rls_disabled
--------------+-------------+--------------
           10 |           8 |            2

=== Tables Without RLS (Security Risk) ===

 tablename
-----------
 secrets
 internal_logs
```

### Schema Audit Output

```
=== Schema Design Quality Audit ===

1. Tables Without Primary Keys (CRITICAL):
 tablename
-----------
 (0 rows) ✓

2. Missing NOT NULL on Required Fields:
 table_name | column_name | data_type
------------+-------------+-----------
 users      | email       | text

3. Missing Foreign Key Constraints:
 table_name | column_name | suggestion
------------+-------------+----------------------
 posts      | user_id     | Missing FK to users

... (additional checks)
```

---

## Interpretation

### Critical Issues (Fix Immediately)

- **RLS Disabled:** Tables without RLS are publicly accessible
- **No Primary Keys:** Data integrity at risk
- **Sensitive Columns Exposed:** PII/secrets without RLS protection

### High Priority Issues (Fix Soon)

- **Missing Foreign Keys:** Data integrity and query performance
- **Missing NOT NULL:** Data quality issues
- **Missing Indexes on FKs:** Query performance degradation

### Medium Priority Issues (Technical Debt)

- **Missing Audit Timestamps:** Tracking challenges
- **Inconsistent Naming:** Maintainability issues

---

## Recommendations

**After RLS Audit:**
1. Enable RLS on all public tables: `ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;`
2. Create policies for all CRUD operations (use `*policy-apply` command)
3. Test with `*test-as-user` command

**After Schema Audit:**
1. Add missing primary keys: `ALTER TABLE {table} ADD PRIMARY KEY (id);`
2. Add missing foreign keys: `ALTER TABLE {table} ADD FOREIGN KEY ({col}) REFERENCES {ref_table}(id);`
3. Add missing NOT NULL: `ALTER TABLE {table} ALTER COLUMN {col} SET NOT NULL;`
4. Create indexes on foreign keys: `CREATE INDEX idx_{table}_{col} ON {table}({col});`

---

## Related Commands

- `*policy-apply {table} {mode}` - Install RLS policies after audit
- `*test-as-user {user_id}` - Test RLS policies
- `*verify-order {migration}` - Validate migration DDL ordering
- `*create-migration-plan` - Plan schema changes

---

**Note:** This consolidated task replaces `db-rls-audit.md` and `schema-audit.md` (deprecated in v3.0)
