# Task: Run SQL

**Purpose**: Execute SQL file or inline SQL with transaction safety and timing

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
task: dbRunSql()
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

- `sql` (string): Either a file path or inline SQL statement

---

## Process

### 1. Determine Input Type

Check if input is file or inline SQL:

```bash
if [ -f "{sql}" ]; then
  echo "Mode: File"
  SQL_FILE="{sql}"
  SQL_MODE="file"
else
  echo "Mode: Inline SQL"
  SQL_MODE="inline"
  SQL_CONTENT="{sql}"
fi
```

### 2. Preview SQL

Show what will be executed:

```bash
echo "=========================================="
echo "SQL TO BE EXECUTED:"
echo "=========================================="

if [ "$SQL_MODE" = "file" ]; then
  cat "$SQL_FILE"
else
  echo "$SQL_CONTENT"
fi

echo ""
echo "=========================================="
```

### 3. Safety Checks

Warn about dangerous operations:

```bash
# Check for destructive operations
DANGEROUS_PATTERNS="DROP TABLE|TRUNCATE|DELETE FROM.*WHERE.*1=1|UPDATE.*WHERE.*1=1"

if echo "$SQL_CONTENT" | grep -Eiq "$DANGEROUS_PATTERNS"; then
  echo "⚠️  WARNING: Potentially destructive operation detected!"
  echo ""
  echo "Detected patterns:"
  echo "$SQL_CONTENT" | grep -Ei "$DANGEROUS_PATTERNS"
  echo ""
  echo "Database: $SUPABASE_DB_URL (redacted)"
  echo ""
  echo "Continue? Type 'I UNDERSTAND THE RISKS' to proceed:"
  read CONFIRM
  [ "$CONFIRM" = "I UNDERSTAND THE RISKS" ] || { echo "Aborted"; exit 1; }
fi
```

### 4. Transaction Mode Selection

Ask user about transaction handling:

```
Transaction mode:
1. auto   - Wrap in BEGIN/COMMIT (safe, rolls back on error)
2. manual - Execute as-is (file may have own transaction control)
3. read   - Read-only transaction (safe for queries)

Select mode (1/2/3):
```

### 5. Execute SQL

Run with selected transaction mode and timing:

```bash
echo "Executing SQL..."

if [ "$TRANSACTION_MODE" = "auto" ]; then
  # Wrapped transaction
  (
    echo "BEGIN;"
    if [ "$SQL_MODE" = "file" ]; then
      cat "$SQL_FILE"
    else
      echo "$SQL_CONTENT"
    fi
    echo "COMMIT;"
  ) | psql "$SUPABASE_DB_URL" \
      -v ON_ERROR_STOP=1 \
      --echo-errors \
      2>&1 | tee /tmp/dbsage_sql_output.txt

elif [ "$TRANSACTION_MODE" = "read" ]; then
  # Read-only transaction
  (
    echo "BEGIN TRANSACTION READ ONLY;"
    if [ "$SQL_MODE" = "file" ]; then
      cat "$SQL_FILE"
    else
      echo "$SQL_CONTENT"
    fi
    echo "COMMIT;"
  ) | psql "$SUPABASE_DB_URL" \
      -v ON_ERROR_STOP=1 \
      2>&1 | tee /tmp/dbsage_sql_output.txt

else
  # Manual mode (no wrapper)
  if [ "$SQL_MODE" = "file" ]; then
    psql "$SUPABASE_DB_URL" \
      -v ON_ERROR_STOP=1 \
      -f "$SQL_FILE" \
      2>&1 | tee /tmp/dbsage_sql_output.txt
  else
    psql "$SUPABASE_DB_URL" \
      -v ON_ERROR_STOP=1 \
      -c "$SQL_CONTENT" \
      2>&1 | tee /tmp/dbsage_sql_output.txt
  fi
fi

EXIT_CODE=$?
```

### 6. Check Results

Display execution summary:

```bash
echo ""
echo "=========================================="
echo "EXECUTION SUMMARY"
echo "=========================================="

if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ SUCCESS"
else
  echo "❌ FAILED (Exit code: $EXIT_CODE)"
  echo ""
  echo "Error output saved to: /tmp/dbsage_sql_output.txt"
  exit $EXIT_CODE
fi

# Count affected rows (if available in output)
ROWS_AFFECTED=$(grep -oP 'INSERT 0 \K\d+|UPDATE \K\d+|DELETE \K\d+' /tmp/dbsage_sql_output.txt | head -1)
if [ -n "$ROWS_AFFECTED" ]; then
  echo "Rows affected: $ROWS_AFFECTED"
fi

# Execution time (if using \timing in psql)
EXEC_TIME=$(grep -oP 'Time: \K[\d.]+' /tmp/dbsage_sql_output.txt | tail -1)
if [ -n "$EXEC_TIME" ]; then
  echo "Execution time: ${EXEC_TIME}ms"
fi
```

---

## Output

Display final summary:

```
✅ SQL EXECUTED SUCCESSFULLY

Mode:           {file|inline}
Transaction:    {auto|manual|read}
Rows affected:  {count}
Duration:       {time}ms

Output saved to: /tmp/dbsage_sql_output.txt

Next steps:
- Verify results in database
- Check for expected side effects
- Update application if schema changed
```

---

## Usage Examples

### Example 1: Run SQL File

```bash
*run-sql supabase/migrations/20240101_add_users.sql
```

### Example 2: Inline Query

```bash
*run-sql "SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '7 days'"
```

### Example 3: Multi-Line Inline

```bash
*run-sql "
  UPDATE users
  SET last_login = NOW()
  WHERE id = 'user-123'
  RETURNING *;
"
```

### Example 4: Complex Script

```bash
*run-sql "
  DO $$
  DECLARE
    user_count INTEGER;
  BEGIN
    SELECT COUNT(*) INTO user_count FROM users;
    RAISE NOTICE 'Total users: %', user_count;
  END $$;
"
```

---

## Safety Features

### 1. Destructive Operation Detection

Automatically warns for:
- `DROP TABLE`
- `TRUNCATE`
- `DELETE FROM ... WHERE 1=1`
- `UPDATE ... WHERE 1=1`

### 2. Transaction Modes

**Auto Mode (Recommended):**
- Wraps SQL in BEGIN/COMMIT
- Automatic rollback on error
- Safe for modifications

**Manual Mode:**
- For files with own transaction control
- Use when script has multiple transactions
- More control, less safety

**Read Mode:**
- Read-only transaction
- Cannot modify data
- Safe for queries/exploration

### 3. Error Handling

- `ON_ERROR_STOP=1` stops on first error
- Transaction rolls back on error (auto mode)
- Full error output preserved

---

## Advanced Options

### Enable Timing

```bash
# Add timing to all queries
psql "$SUPABASE_DB_URL" << 'EOF'
\timing on
{your_sql_here}
EOF
```

### Verbose Output

```bash
# Show all SQL commands
psql "$SUPABASE_DB_URL" --echo-all -f script.sql
```

### Save Output to File

```bash
# Redirect output
psql "$SUPABASE_DB_URL" -f script.sql > output.txt 2>&1
```

### Interactive Mode

```bash
# Drop into psql shell
psql "$SUPABASE_DB_URL"
```

---

## Common SQL Operations

### 1. Query Data

```sql
SELECT
  id,
  email,
  created_at
FROM users
WHERE created_at > NOW() - INTERVAL '1 day'
ORDER BY created_at DESC
LIMIT 10;
```

### 2. Update Records

```sql
UPDATE users
SET
  last_login = NOW(),
  login_count = login_count + 1
WHERE id = 'user-123'
RETURNING *;
```

### 3. Bulk Operations

```sql
-- Update all inactive users
UPDATE users
SET status = 'archived'
WHERE last_login < NOW() - INTERVAL '1 year'
  AND status = 'active';
```

### 4. Data Analysis

```sql
-- Aggregation query
SELECT
  DATE_TRUNC('day', created_at) AS day,
  COUNT(*) AS new_users,
  COUNT(*) FILTER (WHERE email_verified) AS verified
FROM users
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY day
ORDER BY day DESC;
```

---

## psql Meta-Commands

Useful commands when in psql interactive mode:

```
\dt              -- List tables
\d table_name    -- Describe table
\df              -- List functions
\dv              -- List views
\l               -- List databases
\c database      -- Connect to database
\timing on       -- Enable query timing
\x on            -- Expanded display mode
\q               -- Quit
\?               -- Help
```

---

## Error Handling

If execution fails:

1. Check error message in output
2. Review SQL syntax
3. Verify table/column names exist
4. Check permissions
5. For transaction errors, check constraints

Common errors:

- **Syntax error:** Review SQL syntax
- **Relation does not exist:** Table/view not found
- **Column does not exist:** Typo in column name
- **Permission denied:** Need appropriate role/permissions

---

## Security Notes

- **Never** run untrusted SQL
- Always review SQL before executing
- Use read-only mode for untrusted queries
- Be careful with dynamic SQL
- Consider using prepared statements for user input

---

## References

- [PostgreSQL psql Documentation](https://www.postgresql.org/docs/current/app-psql.html)
- [PostgreSQL SQL Commands](https://www.postgresql.org/docs/current/sql-commands.html)
