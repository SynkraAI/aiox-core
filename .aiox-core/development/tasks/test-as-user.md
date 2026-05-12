# Task: Test As User (RLS Testing)

**Purpose**: Emulate authenticated user for RLS policy testing

**Elicit**: true

**Renamed From (Story 6.1.2.3):**
- `db-impersonate.md` - Clearer name for RLS testing purpose

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
task: testAsUser()
responsável: Quinn (Guardian)
responsavel_type: Agente
atomic_layer: Config

**Entrada:**
- campo: task
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Must be registered task

- campo: parameters
  tipo: object
  origem: User Input
  obrigatório: false
  validação: Valid task parameters

- campo: mode
  tipo: string
  origem: User Input
  obrigatório: false
  validação: yolo|interactive|pre-flight

**Saída:**
- campo: execution_result
  tipo: object
  destino: Memory
  persistido: false

- campo: logs
  tipo: array
  destino: File (.ai/logs/*)
  persistido: true

- campo: state
  tipo: object
  destino: State management
  persistido: true
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Task is registered; required parameters provided; dependencies met
    tipo: pre-condition
    blocker: true
    validação: |
      Check task is registered; required parameters provided; dependencies met
    error_message: "Pre-condition failed: Task is registered; required parameters provided; dependencies met"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Task completed; exit code 0; expected outputs created
    tipo: post-condition
    blocker: true
    validação: |
      Verify task completed; exit code 0; expected outputs created
    error_message: "Post-condition failed: Task completed; exit code 0; expected outputs created"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Task completed as expected; side effects documented
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert task completed as expected; side effects documented
    error_message: "Acceptance criterion not met: Task completed as expected; side effects documented"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** task-runner
  - **Purpose:** Task execution and orchestration
  - **Source:** .aiox-core/core/task-runner.js

- **Tool:** logger
  - **Purpose:** Execution logging and error tracking
  - **Source:** .aiox-core/utils/logger.js

---

## Scripts

**Agent-specific code for this task:**

- **Script:** execute-task.js
  - **Purpose:** Generic task execution wrapper
  - **Language:** JavaScript
  - **Location:** .aiox-core/scripts/execute-task.js

---

## Error Handling

**Strategy:** retry

**Common Errors:**

1. **Error:** Task Not Found
   - **Cause:** Specified task not registered in system
   - **Resolution:** Verify task name and registration
   - **Recovery:** List available tasks, suggest similar

2. **Error:** Invalid Parameters
   - **Cause:** Task parameters do not match expected schema
   - **Resolution:** Validate parameters against task definition
   - **Recovery:** Provide parameter template, reject execution

3. **Error:** Execution Timeout
   - **Cause:** Task exceeds maximum execution time
   - **Resolution:** Optimize task or increase timeout
   - **Recovery:** Kill task, cleanup resources, log state

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
  - automation
  - workflow
updated_at: 2025-11-17
```

---


## Inputs

**Required:**
- `user_id` (uuid): User ID to emulate

**Optional:**
- `role` (text): Role to test (default: 'authenticated')

---

## Elicitation

**Prompt user:**

```
=== RLS Policy Testing ===

Enter user ID to emulate:
```

**Capture:** `{user_id}`

```
Enter role (default: authenticated):
Options: authenticated, anon, service_role
```

**Capture:** `{role}` (default: 'authenticated')

```
What are you testing?
(e.g., "User can only read own posts", "Admin can see all data")
```

**Capture:** `{test_purpose}`

**CRITICAL WARNING:** Display warning:
```
⚠️  WARNING: This is for RLS testing only!
   - Never use in production application code
   - Session claims are temporary (current session only)
   - Use service_role key with extreme caution
```

**Confirm:** User acknowledges warning (y/n)

---

## Process

### Step 1: Set Session Claims

```bash
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 <<SQL
\echo '=== Setting Session Claims ==='
\echo ''
\echo 'User ID: {user_id}'
\echo 'Role: {role}'
\echo 'Purpose: {test_purpose}'
\echo ''

-- Set JWT claims for current session
SELECT
  set_config('request.jwt.claims',
    jsonb_build_object(
      'sub', '{user_id}',
      'role', '{role}',
      'email', 'test-user@example.com'
    )::text,
    true
  ) AS jwt_claims_set;

-- Set individual claim for auth.uid() function
SELECT
  set_config('request.jwt.claim.sub', '{user_id}', true) AS user_id_set,
  set_config('role', '{role}', true) AS role_set;

\echo ''
\echo '=== Verification ==='

-- Verify settings
SELECT
  current_setting('request.jwt.claims', true) AS jwt_claims,
  current_setting('request.jwt.claim.sub', true) AS user_id,
  current_setting('role', true) AS role,
  auth.uid() AS auth_uid_function;

\echo ''
\echo '✓ Session configured for user: {user_id}'
\echo ''

SQL
```

### Step 2: Test Query Examples

**Provide user with test query templates:**

```sql
-- Example 1: Test SELECT access (users table)
SELECT id, email, created_at
FROM users
WHERE id = auth.uid();
-- Expected: Should return 1 row (current user only)

-- Example 2: Test SELECT access (posts table)
SELECT id, title, user_id, created_at
FROM posts
WHERE user_id = auth.uid();
-- Expected: Should return only posts created by this user

-- Example 3: Test INSERT access
INSERT INTO posts (title, content, user_id)
VALUES ('Test Post', 'Test Content', auth.uid());
-- Expected: Should succeed if RLS allows INSERT

-- Example 4: Test UPDATE access (own data)
UPDATE posts
SET title = 'Updated Title'
WHERE id = '...' AND user_id = auth.uid();
-- Expected: Should succeed only if post belongs to user

-- Example 5: Test UPDATE access (other user's data)
UPDATE posts
SET title = 'Hacked!'
WHERE user_id != auth.uid();
-- Expected: Should fail or affect 0 rows (RLS blocks)

-- Example 6: Test DELETE access
DELETE FROM posts
WHERE id = '...' AND user_id = auth.uid();
-- Expected: Should succeed only if post belongs to user
```

### Step 3: Interactive Testing Session

```bash
\echo ''
\echo '=== Interactive Testing ==='
\echo ''
\echo 'Entering interactive psql session...'
\echo 'You are now emulating user: {user_id}'
\echo ''
\echo 'Available commands:'
\echo '  - Run any SQL query to test RLS'
\echo '  - \d tablename - Show table structure'
\echo '  - \dp tablename - Show RLS policies'
\echo '  - SELECT auth.uid(); - Verify current user'
\echo '  - RESET ALL; - Exit emulation'
\echo '  - \q - Quit psql'
\echo ''

psql "$SUPABASE_DB_URL"
```

---

## Common Testing Scenarios

### Scenario 1: User Can Read Own Data Only

**Test:** Verify user can only SELECT their own rows

```sql
-- Should return only rows where user_id = auth.uid()
SELECT * FROM posts;

-- Verify auth.uid() is set correctly
SELECT auth.uid() AS current_user;

-- Check policy
\dp posts
```

**Expected Result:**
- Only rows with `user_id = '{user_id}'` returned
- Policy `users_read_own_posts` should be active

### Scenario 2: User Cannot Read Other Users' Data

**Test:** Verify RLS blocks access to other users' data

```sql
-- Attempt to read specific post from another user
SELECT * FROM posts WHERE user_id != auth.uid();
```

**Expected Result:**
- 0 rows returned (RLS blocks access)
- No error (just filtered out by RLS)

### Scenario 3: User Can Insert Own Data

**Test:** Verify user can INSERT with correct user_id

```sql
-- Should succeed (user_id matches auth.uid())
INSERT INTO posts (title, content, user_id)
VALUES ('My Post', 'Content', auth.uid());

-- Should fail (user_id does not match auth.uid())
INSERT INTO posts (title, content, user_id)
VALUES ('Hacked Post', 'Content', 'another-user-id');
```

**Expected Result:**
- First INSERT succeeds
- Second INSERT fails or is blocked by RLS `WITH CHECK` policy

### Scenario 4: User Cannot Update Other Users' Data

**Test:** Verify user cannot UPDATE rows they don't own

```sql
-- Should succeed (own post)
UPDATE posts SET title = 'Updated' WHERE id = 'my-post-id';

-- Should affect 0 rows (RLS filters out)
UPDATE posts SET title = 'Hacked' WHERE user_id != auth.uid();
```

**Expected Result:**
- First UPDATE succeeds
- Second UPDATE returns `UPDATE 0` (no rows modified)

### Scenario 5: Admin Can See All Data

**Test:** Verify admin/service role bypasses RLS

```sql
-- Re-run test with role = 'service_role'
-- (requires restarting test-as-user with different role)

SELECT * FROM posts;  -- Should see ALL posts
```

**Expected Result:**
- All rows returned (service_role bypasses RLS)
- **WARNING:** Never use service_role in client code!

---

## Troubleshooting

### Issue: auth.uid() returns NULL

**Cause:** Session claims not set correctly

**Fix:**
```sql
-- Check current settings
SELECT
  current_setting('request.jwt.claim.sub', true) AS sub,
  auth.uid() AS auth_uid;

-- If sub is set but auth_uid is NULL, restart session
RESET ALL;
-- Re-run test-as-user command
```

### Issue: RLS policy not applying

**Cause:** RLS not enabled on table

**Fix:**
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Enable RLS
ALTER TABLE {tablename} ENABLE ROW LEVEL SECURITY;
```

### Issue: "Permission denied" error

**Cause:** Role doesn't have table permissions

**Fix:**
```sql
-- Grant table permissions to role
GRANT SELECT, INSERT, UPDATE, DELETE ON {tablename} TO authenticated;
```

### Issue: Can see other users' data

**Cause:** Missing or incorrect RLS policy

**Fix:**
```sql
-- Check existing policies
\dp {tablename}

-- Create missing policy (example)
CREATE POLICY users_read_own_data ON {tablename}
  FOR SELECT
  USING (user_id = auth.uid());
```

---

## Best Practices

### Before Testing

1. **Know your policies:** Review RLS policies before testing
   ```sql
   \dp tablename
   ```

2. **Have test data:** Ensure test user has data to query
   ```sql
   SELECT * FROM posts WHERE user_id = '{user_id}';
   ```

3. **Document test cases:** Write down what you expect to happen

### During Testing

1. **Test positive cases:** Verify user CAN access their own data
2. **Test negative cases:** Verify user CANNOT access others' data
3. **Test all operations:** SELECT, INSERT, UPDATE, DELETE
4. **Test edge cases:** NULL values, empty results, concurrent access

### After Testing

1. **Reset session:** Always run `RESET ALL;` or close session
2. **Document results:** Note any policy gaps or issues
3. **Fix policies:** Update RLS policies based on test results
4. **Re-test:** Verify fixes with another test run

---

## Security Notes

**NEVER do this in production:**

```javascript
// ❌ BAD: Setting JWT claims in application code
supabase.rpc('set_claims', { user_id: userId })

// ❌ BAD: Using service_role key in client
const supabase = createClient(url, SERVICE_ROLE_KEY)
```

**Testing workflow:**

```
Development DB → test-as-user command → Verify RLS
                                      ↓
                              Fix policies if needed
                                      ↓
                         Deploy to staging → Test with real auth
                                      ↓
                              Production (real JWT tokens)
```

---

## Related Commands

- `*security-audit rls` - Audit RLS coverage before testing
- `*policy-apply {table}` - Install RLS policies
- `*create-migration-plan` - Plan RLS policy migrations
- `*impersonate` - Legacy command (deprecated, use `*test-as-user`)

---

## Output Example

```
=== Setting Session Claims ===

User ID: 123e4567-e89b-12d3-a456-426614174000
Role: authenticated
Purpose: Test user can only read own posts

 jwt_claims_set
----------------
 t

 user_id_set | role_set
-------------+----------
 t           | t

=== Verification ===

 jwt_claims                                      | user_id                              | role          | auth_uid_function
-------------------------------------------------+--------------------------------------+---------------+----------------------------------
 {"sub":"123e4567-e89b-12d3-a456-426614174000"...| 123e4567-e89b-12d3-a456-426614174000 | authenticated | 123e4567-e89b-12d3-a456-426614174000

✓ Session configured for user: 123e4567-e89b-12d3-a456-426614174000

=== Interactive Testing ===

Entering interactive psql session...
You are now emulating user: 123e4567-e89b-12d3-a456-426614174000

psql (14.5)
Type "help" for help.

database=>
```

---

**Note:** This task replaces `db-impersonate.md` with clearer naming (renamed in Story 6.1.2.3)
