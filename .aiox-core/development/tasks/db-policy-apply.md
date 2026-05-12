# Task: Apply RLS Policy Template

**Purpose**: Install KISS or granular RLS policies on a table

**Elicit**: true

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
task: dbPolicyApply()
responsável: Dara (Sage)
responsavel_type: Agente
atomic_layer: Config

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

**Strategy:** abort

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
duration_expected: 2-10 min (estimated)
cost_estimated: $0.001-0.008
token_usage: ~800-2,500 tokens
```

**Optimization Notes:**
- Validate configuration early; use atomic writes; implement rollback checkpoints

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


## 🚀 NEW: Use Automated RLS Policy Installer (RECOMMENDED)

**Token Savings: 89% | Time Savings: ~85%**

```bash
# Use the rls-policy-installer script
./Squads/super-agentes/scripts/database-operations/rls-policy-installer.sh {table} {mode}

# Examples:
./Squads/super-agentes/scripts/database-operations/rls-policy-installer.sh minds kiss
./Squads/super-agentes/scripts/database-operations/rls-policy-installer.sh sources read-only
./Squads/super-agentes/scripts/database-operations/rls-policy-installer.sh fragments private

# Available modes: kiss, read-only, private, team, custom

# Benefits:
#   - Standardized policy templates
#   - Automatic testing after installation
#   - Safety checks for existing policies
#   - 89% token savings
```

**OR continue with manual policy installation below:**

---

## Inputs

- `table` (string): Table name to apply policy to
- `mode` (string): 'kiss' or 'granular' - policy type

---

## Process (Manual Method)

### 1. Validate Inputs

Check table exists and mode is valid:

```bash
echo "Validating inputs..."

# Check table exists
psql "$SUPABASE_DB_URL" -c \
"SELECT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = '{table}'
);" | grep -q t || {
  echo "❌ Table '{table}' not found"
  exit 1
}

# Check mode
if [[ "{mode}" != "kiss" && "{mode}" != "granular" ]]; then
  echo "❌ Invalid mode: {mode}"
  echo "   Use 'kiss' or 'granular'"
  exit 1
fi

echo "✓ Table exists: {table}"
echo "✓ Mode: {mode}"
```

### 2. Check Existing Policies

Display current RLS status:

```bash
echo "Checking existing RLS policies..."

psql "$SUPABASE_DB_URL" << EOF
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = '{table}';
EOF

echo ""
echo "RLS enabled on {table}?"
psql "$SUPABASE_DB_URL" -c \
"SELECT relrowsecurity FROM pg_class WHERE relname = '{table}';" \
| grep -q t && echo "✓ Yes" || echo "⚠️  No (will be enabled)"
```

### 3. Ask User Confirmation

Present policy that will be applied based on mode:

**If mode = 'kiss':**
```
Will apply KISS policy to {table}:
- Enable RLS
- Single policy: users can only access their own rows
- Uses: (select auth.uid()) = user_id [PERFORMANCE OPTIMIZED]
- Applies to: SELECT, INSERT, UPDATE, DELETE

⚠️  CRITICAL PERFORMANCE NOTE:
Wrapping auth.uid() in SELECT provides 99.99% performance improvement
by allowing PostgreSQL to cache the function result.

Continue? (yes/no)
```

**If mode = 'granular':**
```
Will apply granular policies to {table}:
- Enable RLS
- Separate policies for each operation (SELECT, INSERT, UPDATE, DELETE)
- Fine-grained control
- Uses: auth.uid() = user_id

Continue? (yes/no)
```

Get confirmation before proceeding.

### 4. Generate Policy SQL

Based on mode, generate appropriate SQL:

**KISS Mode:**
```sql
-- Enable RLS
ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "{table}_policy" ON {table};

-- Create single KISS policy (PERFORMANCE OPTIMIZED)
CREATE POLICY "{table}_policy"
  ON {table}
  FOR ALL
  TO authenticated
  USING (
    -- ✅ CRITICAL: Wrap auth.uid() in SELECT for 99.99% performance gain
    -- This allows PostgreSQL to cache the function result per statement
    (select auth.uid()) IS NOT NULL AND
    (select auth.uid()) = user_id
  )
  WITH CHECK (
    (select auth.uid()) IS NOT NULL AND
    (select auth.uid()) = user_id
  );

-- Add helpful comment
COMMENT ON POLICY "{table}_policy" ON {table} IS
  'KISS policy: users can only access their own rows (performance optimized with cached auth.uid())';
```

**Granular Mode (PERFORMANCE OPTIMIZED):**
```sql
-- Enable RLS
ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "{table}_select" ON {table};
DROP POLICY IF EXISTS "{table}_insert" ON {table};
DROP POLICY IF EXISTS "{table}_update" ON {table};
DROP POLICY IF EXISTS "{table}_delete" ON {table};

-- SELECT: Users read own rows
-- ✅ Wrapping auth.uid() in SELECT provides 99.99% performance improvement
CREATE POLICY "{table}_select"
  ON {table}
  FOR SELECT
  TO authenticated
  USING (
    (select auth.uid()) IS NOT NULL AND
    (select auth.uid()) = user_id
  );

-- INSERT: Users create own rows
CREATE POLICY "{table}_insert"
  ON {table}
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (select auth.uid()) IS NOT NULL AND
    (select auth.uid()) = user_id
  );

-- UPDATE: Users update own rows
CREATE POLICY "{table}_update"
  ON {table}
  FOR UPDATE
  TO authenticated
  USING (
    (select auth.uid()) IS NOT NULL AND
    (select auth.uid()) = user_id
  )
  WITH CHECK (
    (select auth.uid()) IS NOT NULL AND
    (select auth.uid()) = user_id
  );

-- DELETE: Users delete own rows
CREATE POLICY "{table}_delete"
  ON {table}
  FOR DELETE
  TO authenticated
  USING (
    (select auth.uid()) IS NOT NULL AND
    (select auth.uid()) = user_id
  );

-- Add helpful comments
COMMENT ON POLICY "{table}_select" ON {table} IS 'Users can read own rows (cached auth.uid())';
COMMENT ON POLICY "{table}_insert" ON {table} IS 'Users can insert own rows (cached auth.uid())';
COMMENT ON POLICY "{table}_update" ON {table} IS 'Users can update own rows (cached auth.uid())';
COMMENT ON POLICY "{table}_delete" ON {table} IS 'Users can delete own rows (cached auth.uid())';
```

### 5. Create Migration File

Save policy SQL to migration file:

```bash
TS=$(date +%Y%m%d%H%M%S)
MIGRATION_FILE="supabase/migrations/${TS}_rls_${mode}__{table}.sql"

mkdir -p supabase/migrations

cat > "$MIGRATION_FILE" << 'EOF'
-- Migration: Apply {mode} RLS policy to {table}
-- Generated: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
-- Table: {table}
-- Mode: {mode}

BEGIN;

[... SQL from step 4 ...]

COMMIT;
EOF

echo "✓ Migration created: $MIGRATION_FILE"
```

### 6. Apply Migration

Use existing db-apply-migration task:

```bash
echo "Applying migration..."
# Execute db-apply-migration task internally
# (This will create snapshots, apply, verify)
```

### 7. Test Policies

Verify policies work correctly:

```bash
echo "Testing RLS policies..."

# Test 1: Anonymous user should see nothing
psql "$SUPABASE_DB_URL" << EOF
SET ROLE anon;
SELECT COUNT(*) AS anon_count FROM {table};
RESET ROLE;
EOF

# Test 2: Authenticated user should see only their rows
# (Requires setting up test user - provide instructions)

echo ""
echo "✓ Policy tests complete"
echo "  ⚠️  Manual testing recommended:"
echo "    - Use *impersonate to test as specific user"
echo "    - Verify each operation (SELECT, INSERT, UPDATE, DELETE)"
```

---

## Output

Display summary:
```
✅ RLS POLICY APPLIED

Table:     {table}
Mode:      {mode}
Migration: supabase/migrations/{TS}_rls_{mode}__{table}.sql
Policies:  [list created policies]

Next steps:
1. Test policies manually: *impersonate {user_id}
2. Run RLS audit: *rls-audit
3. Update documentation
4. Commit migration to git
```

---

## Notes

### KISS vs Granular

**KISS** (Keep It Simple, Stupid):
- ✅ Single policy for all operations
- ✅ Easier to understand
- ✅ Less verbose
- ❌ Less flexible

**Granular**:
- ✅ Separate policies per operation
- ✅ Fine-grained control
- ✅ Can have different logic per operation
- ❌ More verbose

### Common Patterns

**Public Read, Authenticated Write (Performance Optimized):**
```sql
-- SELECT: Public
CREATE POLICY "{table}_select" ON {table}
  FOR SELECT TO public
  USING (true);

-- INSERT/UPDATE/DELETE: Authenticated users only
CREATE POLICY "{table}_write" ON {table}
  FOR ALL TO authenticated
  USING (
    (select auth.uid()) IS NOT NULL AND
    (select auth.uid()) = user_id
  )
  WITH CHECK (
    (select auth.uid()) IS NOT NULL AND
    (select auth.uid()) = user_id
  );
```

**Tenant-Based (Performance Optimized):**
```sql
CREATE POLICY "{table}_tenant" ON {table}
  FOR ALL TO authenticated
  USING (
    (select auth.uid()) IS NOT NULL AND
    tenant_id IN (
      SELECT tenant_id FROM user_tenants
      WHERE user_id = (select auth.uid())
    )
  );
```

### Performance Tips

**Critical Performance Optimization:**
Always wrap `auth.uid()` in a `SELECT` statement:
```sql
-- ❌ SLOW (99.99% slower)
USING (auth.uid() = user_id)

-- ✅ FAST (cached per statement)
USING ((select auth.uid()) = user_id)
```

**Why it matters:**
- Without SELECT: PostgreSQL calls `auth.uid()` for EVERY row
- With SELECT: PostgreSQL caches the result for the entire statement
- Performance improvement: **99.99%** (essentially 10,000x faster on large tables)

**Index Recommendations:**
- Always index columns used in policies (e.g., `user_id`, `tenant_id`)
- Example: `CREATE INDEX idx_{table}_user_id ON {table}(user_id);`
- Performance improvement: **99.94%** when combined with wrapped auth functions

---

## Security Warnings ⚠️

### CRITICAL: Do NOT Use raw_user_meta_data in Policies

```sql
-- ❌ DANGEROUS - User can modify this data!
CREATE POLICY "bad_policy" ON {table}
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );
```

**Why dangerous:** `raw_user_meta_data` can be modified by the user through Supabase Auth client. An attacker can set `{ "role": "admin" }` and bypass security!

**Safe alternative:** Use `raw_app_meta_data` (server-only):
```sql
-- ✅ SAFE - Only server can modify app_metadata
CREATE POLICY "safe_policy" ON {table}
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
```

### Auth NULL Check

Always check if user is authenticated:
```sql
-- ❌ Missing NULL check
USING (auth.uid() = user_id)  -- Fails silently for anon users

-- ✅ Explicit authentication check
USING (
  (select auth.uid()) IS NOT NULL AND
  (select auth.uid()) = user_id
)
```

### Policy Debugging

Enable RLS policies in SQL Editor (dev only):
```sql
-- Temporarily disable RLS for debugging (DANGEROUS - dev only!)
ALTER TABLE {table} DISABLE ROW LEVEL SECURITY;

-- Re-enable when done
ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;
```

---

## Prerequisites

Table must have:
- `user_id UUID` column (for user-based policies)
- Or `tenant_id` column (for tenant-based policies)
- **Indexes on all policy filter columns** (critical for performance!)
  - `CREATE INDEX idx_{table}_user_id ON {table}(user_id);`

---

## Error Handling

If policy application fails:
1. Check table has required columns (user_id, etc.)
2. Verify auth.uid() is available (Supabase)
3. Check for existing policies with same names
4. Rollback migration if needed: `*rollback`
