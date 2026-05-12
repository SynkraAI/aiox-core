# Task: Load CSV Data Safely

**Purpose**: Import CSV data using PostgreSQL COPY with staging table and validation

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
task: dbLoadCsv()
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

**Strategy:** retry

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


## Inputs

- `table` (string): Target table name
- `csv_file` (string): Path to CSV file

---

## Process

### 1. Validate Inputs

Check file exists and table exists:

```bash
echo "Validating inputs..."

# Check CSV file exists
[ -f "{csv_file}" ] || {
  echo "❌ File not found: {csv_file}"
  exit 1
}

# Check table exists
psql "$SUPABASE_DB_URL" -c \
"SELECT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = '{table}'
);" | grep -q t || {
  echo "❌ Table '{table}' not found"
  exit 1
}

# Count CSV rows
ROW_COUNT=$(wc -l < "{csv_file}" | tr -d ' ')
echo "✓ CSV file: {csv_file} ($ROW_COUNT rows)"
echo "✓ Target table: {table}"
```

### 2. Preview CSV Structure

Show first few rows:

```bash
echo "CSV Preview (first 5 rows):"
head -n 5 "{csv_file}"
echo ""
echo "Continue with import? (yes/no)"
read CONFIRM
[ "$CONFIRM" = "yes" ] || { echo "Aborted"; exit 0; }
```

### 3. Create Staging Table

Import to staging first for validation:

```bash
echo "Creating staging table..."

psql "$SUPABASE_DB_URL" << 'EOF'
-- Create staging table with same structure as target
CREATE TEMP TABLE {table}_staging (LIKE {table} INCLUDING ALL);

-- Or if you need to define structure manually:
-- CREATE TEMP TABLE {table}_staging (
--   id TEXT,
--   name TEXT,
--   created_at TEXT
--   -- Define all columns as TEXT initially for flexible parsing
-- );

SELECT 'Staging table created' AS status;
EOF

echo "✓ Staging table ready"
```

### 4. COPY Data to Staging

Use PostgreSQL COPY command (fastest method):

```bash
echo "Loading CSV into staging table..."

# Method 1: Using psql \copy (client-side file)
psql "$SUPABASE_DB_URL" << 'EOF'
\copy {table}_staging FROM '{csv_file}' WITH (
  FORMAT csv,
  HEADER true,
  DELIMITER ',',
  QUOTE '"',
  ESCAPE '"',
  NULL 'NULL'
);
EOF

# Method 2: Server-side COPY (if file is on server)
# COPY {table}_staging FROM '/path/to/file.csv' WITH (FORMAT csv, HEADER true);

echo "✓ Data loaded to staging"
```

### 5. Validate Data

Run validation checks before merging:

```bash
echo "Validating staged data..."

psql "$SUPABASE_DB_URL" << 'EOF'
-- Check row count
SELECT COUNT(*) AS staged_rows FROM {table}_staging;

-- Check for NULL in required columns (example)
SELECT COUNT(*) AS null_ids
FROM {table}_staging
WHERE id IS NULL;

-- Check for duplicates (example)
SELECT id, COUNT(*) AS duplicates
FROM {table}_staging
GROUP BY id
HAVING COUNT(*) > 1;

-- Check data types can be converted (example)
SELECT
  COUNT(*) FILTER (WHERE created_at::timestamptz IS NULL) AS invalid_dates
FROM {table}_staging;

-- Any validation failures?
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM {table}_staging WHERE id IS NULL) THEN
      'FAIL: NULL ids found'
    WHEN EXISTS (SELECT 1 FROM {table}_staging GROUP BY id HAVING COUNT(*) > 1) THEN
      'FAIL: Duplicate ids found'
    ELSE
      'PASS: All validations passed'
  END AS validation_status;
EOF

echo ""
echo "Review validation results above."
echo "Continue with merge? (yes/no)"
read CONFIRM
[ "$CONFIRM" = "yes" ] || { echo "Aborted - data in staging table for review"; exit 1; }
```

### 6. Merge to Target Table

Use UPSERT pattern for idempotency:

```bash
echo "Merging to target table..."

psql "$SUPABASE_DB_URL" << 'EOF'
BEGIN;

-- Insert new rows or update existing (idempotent)
INSERT INTO {table} (id, name, created_at, ...)
SELECT
  id::uuid,                  -- Cast to proper types
  name,
  created_at::timestamptz,
  ...
FROM {table}_staging
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  created_at = EXCLUDED.created_at,
  updated_at = NOW();  -- Update timestamp

-- Get counts
SELECT
  (SELECT COUNT(*) FROM {table}) AS final_count,
  (SELECT COUNT(*) FROM {table}_staging) AS imported_count;

COMMIT;

SELECT 'Import complete' AS status;
EOF

echo "✓ Data merged successfully"
```

### 7. Cleanup

Drop staging table:

```bash
echo "Cleaning up..."

psql "$SUPABASE_DB_URL" << 'EOF'
DROP TABLE IF EXISTS {table}_staging;
EOF

echo "✓ Cleanup complete"
```

---

## Output

Display import summary:

```
✅ CSV IMPORT COMPLETE

CSV File:       {csv_file}
Target Table:   {table}
Rows Imported:  {count}
Duration:       {duration}s

Validation:
✓ No NULL in required columns
✓ No duplicate keys
✓ All data types valid

Next steps:
- Verify data in database
- Run smoke tests if needed
- Update statistics: ANALYZE {table};
```

---

## Best Practices

### CSV Format Requirements

**Required:**
- UTF-8 encoding
- Consistent delimiters (comma recommended)
- Header row with column names
- Quoted strings if they contain delimiters

**Example:**
```csv
id,name,email,created_at
"user-1","John Doe","john@example.com","2024-01-01 00:00:00"
"user-2","Jane Smith","jane@example.com","2024-01-02 00:00:00"
```

### Handling Large Files

For CSV files > 100MB or > 1M rows:

1. **Split the file:**
```bash
split -l 100000 large.csv chunk_
```

2. **Import in batches:**
```bash
for file in chunk_*; do
  *load-csv {table} $file
done
```

3. **Or use streaming COPY:**
```bash
cat large.csv | psql "$SUPABASE_DB_URL" -c \
  "COPY {table} FROM STDIN WITH (FORMAT csv, HEADER true);"
```

### Data Type Conversion

Always cast from TEXT to proper types in SELECT:

```sql
SELECT
  id::uuid,                    -- UUID
  amount::numeric(10,2),       -- Decimal
  created_at::timestamptz,     -- Timestamp
  is_active::boolean,          -- Boolean
  metadata::jsonb             -- JSON
FROM {table}_staging
```

---

## Common Issues

### Issue 1: Character Encoding

**Error:** `invalid byte sequence for encoding "UTF8"`

**Fix:**
```bash
# Convert to UTF-8
iconv -f ISO-8859-1 -t UTF-8 input.csv > output.csv
```

### Issue 2: Quote/Delimiter Conflicts

**Error:** `unterminated CSV quoted field`

**Fix:** Adjust COPY parameters:
```sql
COPY table FROM 'file.csv' WITH (
  DELIMITER ';',    -- Change delimiter
  QUOTE '''',       -- Change quote character
  ESCAPE '\'       -- Change escape character
);
```

### Issue 3: NULL Values

**Error:** `null value in column "id" violates not-null constraint`

**Fix:** Define NULL representation:
```sql
COPY table FROM 'file.csv' WITH (
  NULL 'NULL',      -- Treat literal "NULL" as NULL
  -- Or NULL ''     -- Treat empty strings as NULL
);
```

---

## Security Notes

- **Never** COPY from untrusted sources without validation
- Always use staging table first
- Validate data types and constraints before merging
- Check for SQL injection in CSV content (though COPY is safe)
- Consider row-level security (RLS) when loading to Supabase

---

## Performance Tips

1. **Disable triggers during bulk load:**
```sql
ALTER TABLE {table} DISABLE TRIGGER ALL;
-- Load data
ALTER TABLE {table} ENABLE TRIGGER ALL;
```

2. **Drop indexes, load, recreate:**
```sql
-- Only for initial loads, not updates!
DROP INDEX idx_name;
-- Load data
CREATE INDEX CONCURRENTLY idx_name ON {table}(column);
```

3. **Use UNLOGGED tables for staging:**
```sql
CREATE UNLOGGED TABLE {table}_staging (...);
-- Faster writes, but not crash-safe
```

4. **Batch commits:**
```sql
-- For very large loads
BEGIN;
COPY ... -- Load 100k rows
COMMIT;
BEGIN;
COPY ... -- Load next 100k rows
COMMIT;
```

---

## Alternative: INSERT from Application

For small datasets (<1000 rows), can use regular INSERT:

```javascript
// Supabase client example
const { data, error } = await supabase
  .from('table')
  .upsert(csvData, { onConflict: 'id' })
```

But COPY is **10-100x faster** for bulk loads!

---

## References

- [PostgreSQL COPY Documentation](https://www.postgresql.org/docs/current/sql-copy.html)
- [psql \copy Command](https://www.postgresql.org/docs/current/app-psql.html)
