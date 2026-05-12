# Task: Impersonate User (RLS Testing)

**Purpose**: Set session claims to emulate authenticated user for RLS testing

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
task: dbImpersonate()
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

- `user_id` (uuid): User ID to impersonate

---

## Process

### 1. Confirm Impersonation

Ask user:
- User ID to impersonate: `{user_id}`
- Purpose of impersonation (testing what?)
- Queries you plan to run

**CRITICAL WARNING**: This is for testing only. Never use in production application code.

### 2. Set Session Claims

```bash
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 <<SQL
-- Set JWT claims for current session
SELECT
  set_config('request.jwt.claims', 
    jsonb_build_object(
      'sub', '{user_id}',
      'role', 'authenticated'
    )::text, 
    true
  ) AS jwt_claims,
  set_config('request.jwt.claim.sub', '{user_id}', true) AS sub,
  set_config('role', 'authenticated', true) AS role;

-- Verify settings
SELECT 
  current_setting('request.jwt.claims', true) AS jwt_claims,
  current_setting('request.jwt.claim.sub', true) AS user_id,
  current_setting('role', true) AS role;

\echo ''
\echo '✓ Impersonating user: {user_id}'
\echo 'Run your test queries now.'
\echo 'To exit, close this session or run: RESET ALL;'
SQL
```

### 3. Interactive SQL Session

Open interactive psql for testing:

```bash
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1
```

User can now run queries as this user:

```sql
-- Test queries
SELECT * FROM my_table;  -- Should respect RLS for this user

-- Check current context
SELECT 
  auth.uid() AS current_user_id,
  current_setting('role') AS current_role;

-- Exit impersonation
RESET ALL;
```

---

## Testing Scenarios

### Positive Test (Should Succeed)

Test that user CAN access their own data:

```sql
-- User should see their own records
SELECT * FROM users WHERE id = auth.uid();

-- User should see their own fragments
SELECT * FROM fragments WHERE user_id = auth.uid();
```

### Negative Test (Should Fail or Return Empty)

Test that user CANNOT access others' data:

```sql
-- Should return empty (not their data)
SELECT * FROM fragments WHERE user_id != auth.uid();

-- Should fail if trying to insert as another user
INSERT INTO fragments (user_id, content) 
VALUES ('00000000-0000-0000-0000-000000000000', 'test');
-- Expected: RLS policy violation
```

### Multi-Tenant Test

If using org-based isolation:

```sql
-- Set org_id in JWT
SELECT set_config('request.jwt.claims', 
  jsonb_build_object(
    'sub', '{user_id}',
    'role', 'authenticated',
    'org_id', '{org_id}'
  )::text, 
  true
);

-- Test org isolation
SELECT * FROM projects;  -- Should only see org's projects
```

---

## Common Use Cases

### Test New RLS Policy

```sql
-- 1. Apply new policy
CREATE POLICY "new_policy" ON table_name ...;

-- 2. Impersonate user
*impersonate {user_id}

-- 3. Test access
SELECT * FROM table_name;

-- 4. Reset and test as different user
RESET ALL;
*impersonate {other_user_id}
SELECT * FROM table_name;
```

### Debug Access Issues

User reports "can't see their data":

```sql
-- 1. Impersonate the user
*impersonate {user_id}

-- 2. Try their query
SELECT * FROM table_name WHERE ...;

-- 3. Check what RLS policies are active
SELECT * FROM pg_policies 
WHERE tablename = 'table_name';

-- 4. Verify user_id matches
SELECT auth.uid(), user_id FROM table_name LIMIT 5;
```

### Validate Multi-User Scenario

```sql
-- User A
*impersonate {user_a_id}
SELECT COUNT(*) FROM fragments;  -- Returns A's count

-- User B
*impersonate {user_b_id}
SELECT COUNT(*) FROM fragments;  -- Returns B's count

-- Verify isolation
SELECT user_id, COUNT(*) FROM fragments GROUP BY user_id;
-- Should only show current user in impersonation
```

---

## Important Notes

### Session-Local Only

Settings are session-local and reset when:
- Session closes
- `RESET ALL;` is executed
- New connection is established

### Not for Production

**Never use this in application code:**
- ❌ Setting claims manually in app
- ❌ Bypassing Supabase Auth
- ✅ Only for testing and debugging

### Service Role Bypasses RLS

If using service role key, RLS is bypassed completely:
- Cannot test RLS with service role
- Must use authenticated role
- Service role sees ALL data

### Works with Functions

RLS policies respect these settings even in functions:

```sql
CREATE FUNCTION get_user_data() 
RETURNS TABLE(...)
LANGUAGE sql
SECURITY DEFINER  -- Function runs as owner
AS $$
  SELECT * FROM table_name;  -- Still respects RLS
$$;
```

---

## Exit Impersonation

To stop impersonating:

```sql
-- Reset all session variables
RESET ALL;

-- Or just close the psql session
\q
```

---

## Troubleshooting

### "auth.uid() returns NULL"

**Problem**: Claims not set correctly  
**Fix**: Verify claim format and role setting

```sql
-- Check current settings
SELECT 
  current_setting('request.jwt.claims', true),
  current_setting('role', true);
```

### "Still seeing all data"

**Problem**: Using service role or RLS not enabled  
**Fix**: 
1. Check connection string (should not be service role)
2. Verify RLS enabled: `*rls-audit`
3. Confirm policies exist

### "Permission denied"

**Problem**: Role not set to authenticated  
**Fix**: Ensure role is set:

```sql
SELECT set_config('role', 'authenticated', true);
```

---

## Integration with Workflow

Typical testing workflow:

1. Create/modify RLS policy
2. `*dry-run migration.sql` - Syntax check
3. `*apply-migration migration.sql` - Apply changes
4. `*impersonate {test_user_id}` - Test as user
5. Run test queries
6. `*impersonate {other_user_id}` - Test isolation
7. `*rls-audit` - Verify coverage

---

## Security Reminder

🔒 **This is a testing tool only**  

Never bypass Supabase Auth in production. Always use:
- Supabase client with user authentication
- Proper JWT tokens from auth.users
- Real user sessions with valid credentials
