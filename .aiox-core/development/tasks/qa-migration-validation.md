# Migration Validation Task

Validate database migrations are properly created and applied for schema changes.

**Absorbed from:** Auto-Claude PR Review Phase 5

---

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)

- Autonomous validation with logging
- Minimal user interaction
- **Best for:** CI/CD integration

### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**

- Explains migration requirements
- Educational context about database changes
- **Best for:** Learning, understanding migrations

### 3. Pre-Flight Planning - Comprehensive Upfront Planning

- Full migration audit
- Zero ambiguity execution
- **Best for:** Production deployments

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOX Task Format V1.0)

```yaml
task: qaMigrationValidation()
responsavel: Quinn (Guardian)
responsavel_type: Agente
atomic_layer: Molecule

**Entrada:**
- campo: story_id
  tipo: string
  origem: User Input
  obrigatorio: true
  validacao: Must be valid story ID format (e.g., "6.3")

- campo: framework
  tipo: string
  origem: Auto-detect or explicit
  obrigatorio: false
  validacao: "supabase" | "prisma" | "drizzle" | "django" | "rails" | "sequelize"

**Saida:**
- campo: migration_report
  tipo: object
  destino: Return value
  persistido: false

- campo: issues_found
  tipo: number
  destino: Memory
  persistido: false

- campo: report_file
  tipo: file
  destino: docs/stories/{story-id}/qa/migration_validation.json
  persistido: true
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Database framework detected
    tipo: pre-condition
    blocker: true
    validacao: |
      One of: supabase/, prisma/, drizzle/, migrations/, db/
    error_message: "Pre-condition failed: No database framework detected."

  - [ ] Schema changes detected in diff
    tipo: pre-condition
    blocker: false
    validacao: |
      Changes in schema files, models, or migration directories
    error_message: "Info: No schema changes detected, validation may be skipped."
```

---

## Supported Frameworks

### 1. Supabase

**Detection:**

```
supabase/
├── migrations/
│   └── *.sql
└── config.toml
```

**Validation Commands:**

```bash
supabase db diff          # Check for pending schema changes
supabase migration list   # List migrations status
supabase db lint          # Lint SQL migrations
```

**Checks:**

- [ ] Migration SQL file exists for schema changes
- [ ] Migration applied locally (supabase db reset)
- [ ] No pending schema diff
- [ ] RLS policies included if new tables
- [ ] Rollback migration exists (down.sql or reversible)

### 2. Prisma

**Detection:**

```
prisma/
├── schema.prisma
└── migrations/
    └── */migration.sql
```

**Validation Commands:**

```bash
npx prisma migrate status     # Check migration status
npx prisma validate           # Validate schema
npx prisma db pull --preview  # Compare with DB
```

**Checks:**

- [ ] schema.prisma updated with new models/fields
- [ ] Migration generated (prisma migrate dev)
- [ ] Migration applied locally
- [ ] No drift between schema and DB
- [ ] Indexes defined for foreign keys

### 3. Drizzle

**Detection:**

```
drizzle/
├── schema.ts
└── migrations/
    └── *.sql
```

**Validation Commands:**

```bash
npx drizzle-kit generate  # Generate migrations
npx drizzle-kit check     # Check schema
```

**Checks:**

- [ ] Schema file updated
- [ ] Migration SQL generated
- [ ] Types exported correctly

### 4. Django

**Detection:**

```
*/models.py
*/migrations/
manage.py
```

**Validation Commands:**

```bash
python manage.py makemigrations --dry-run  # Check pending
python manage.py showmigrations            # List status
python manage.py migrate --plan            # Show plan
```

**Checks:**

- [ ] Migration files created for model changes
- [ ] Migrations apply without errors
- [ ] No unapplied migrations
- [ ] Reversible migrations (has reverse operations)

### 5. Rails (ActiveRecord)

**Detection:**

```
db/
├── schema.rb
└── migrate/
    └── *.rb
```

**Validation Commands:**

```bash
rails db:migrate:status   # Check status
rails db:migrate:redo     # Test reversibility
```

**Checks:**

- [ ] Migration file exists
- [ ] Migration runs forward
- [ ] Migration runs backward (reversible)
- [ ] schema.rb updated

### 6. Sequelize

**Detection:**

```
migrations/
├── *.js
models/
├── index.js
```

**Validation Commands:**

```bash
npx sequelize-cli db:migrate:status  # Check status
```

**Checks:**

- [ ] Migration file created
- [ ] Up and down methods defined
- [ ] Migration applies successfully

---

## Command

```
*validate-migrations {story-id} [--framework supabase|prisma|drizzle|django|rails|sequelize]
```

**Parameters:**

- `story-id` (required): Story identifier (e.g., "6.3")
- `--framework` (optional): Force specific framework (default: auto-detect)

**Examples:**

```bash
*validate-migrations 6.3
*validate-migrations 6.3 --framework prisma
```

---

## Workflow

### Phase 1: Detect Framework

1. Check for framework indicators:

   ```javascript
   const frameworks = {
     supabase: ['supabase/config.toml', 'supabase/migrations'],
     prisma: ['prisma/schema.prisma'],
     drizzle: ['drizzle.config.ts', 'drizzle/schema.ts'],
     django: ['manage.py', '*/models.py'],
     rails: ['db/schema.rb', 'Gemfile'],
     sequelize: ['.sequelizerc', 'migrations/*.js'],
   };
   ```

2. Select detected framework (or use `--framework`)

3. If multiple detected, prefer:
   - Explicit `--framework` flag
   - Most recent migration timestamp
   - Prompt user for selection

### Phase 2: Detect Schema Changes

1. Get modified files:

   ```bash
   git diff --name-only HEAD~1
   ```

2. Identify schema-related changes:

   ```javascript
   const schemaPatterns = {
     supabase: ['supabase/migrations/*.sql', '*.sql'],
     prisma: ['prisma/schema.prisma'],
     drizzle: ['drizzle/schema.ts', 'src/db/schema.ts'],
     django: ['*/models.py'],
     rails: ['db/migrate/*.rb', 'app/models/*.rb'],
     sequelize: ['models/*.js', 'migrations/*.js'],
   };
   ```

3. Categorize changes:
   - New tables/models
   - Modified columns
   - New indexes
   - New constraints
   - RLS policies (Supabase)

### Phase 3: Validate Migrations

For each detected schema change:

1. **Check migration exists:**
   - Is there a corresponding migration file?
   - Does migration timestamp match schema change?

2. **Validate migration content:**
   - Does migration match schema change?
   - Are all columns/types correct?
   - Are indexes included?
   - Are constraints defined?

3. **Check reversibility:**
   - Down migration exists?
   - Reversible operations used?
   - Data preservation considered?

4. **Test locally:**
   - Run migration forward
   - Run migration backward (if reversible)
   - Check for errors

### Phase 4: Additional Checks

**For Supabase specifically:**

- [ ] RLS policies for new tables
- [ ] Grant statements for roles
- [ ] Edge function permissions

**For all frameworks:**

- [ ] Foreign key indexes
- [ ] NOT NULL constraints with defaults
- [ ] Data migration for existing rows
- [ ] Enum type handling

### Phase 5: Generate Report

```json
{
  "timestamp": "2026-01-29T10:00:00Z",
  "story_id": "6.3",
  "framework": "prisma",
  "summary": {
    "schema_changes": 3,
    "migrations_found": 2,
    "missing_migrations": 1,
    "issues": 2
  },
  "validation": {...},
  "issues": [...],
  "recommendations": [...]
}
```

---

## Issue Format

```json
{
  "id": "MIG-001",
  "type": "MISSING_MIGRATION",
  "severity": "CRITICAL",
  "schema_change": {
    "file": "prisma/schema.prisma",
    "line": 45,
    "change": "Added field 'email_verified' to User model"
  },
  "expected": "Migration file adding email_verified column",
  "found": null,
  "fix": {
    "description": "Generate migration for schema change",
    "command": "npx prisma migrate dev --name add_email_verified"
  }
}
```

---

## Severity Mapping

| Issue Type                           | Severity | Blocking    |
| ------------------------------------ | -------- | ----------- |
| Missing migration for schema change  | CRITICAL | Yes         |
| Migration doesn't match schema       | CRITICAL | Yes         |
| Non-reversible destructive migration | HIGH     | Recommended |
| Missing index on foreign key         | MEDIUM   | No          |
| Missing RLS policy (Supabase)        | HIGH     | Recommended |
| Migration not tested locally         | HIGH     | Recommended |
| No down migration                    | MEDIUM   | No          |

---

## Integration with QA Review

This task integrates into the QA review pipeline:

```
*review-build {story}
├── Phase 1-5: Standard checks
├── Phase 6.0: Library Validation
├── Phase 6.1: Security Checklist
├── Phase 6.2: Migration Validation ← THIS TASK
└── Phase 7-10: Continue review
```

**Trigger:** Automatically called during `*review-build` if schema changes detected
**Manual:** Can be run standalone via `*validate-migrations`

---

## Example Output

```json
{
  "timestamp": "2026-01-29T10:30:00Z",
  "story_id": "6.3",
  "framework": "supabase",
  "framework_version": "1.142.0",
  "summary": {
    "schema_changes_detected": 2,
    "migrations_found": 1,
    "migrations_missing": 1,
    "migrations_applied": 1,
    "issues_found": 2,
    "blocking": true
  },
  "schema_changes": [
    {
      "type": "NEW_TABLE",
      "name": "user_preferences",
      "file": "supabase/migrations/20260129_create_user_preferences.sql",
      "migration_exists": true,
      "migration_applied": true
    },
    {
      "type": "NEW_COLUMN",
      "table": "users",
      "column": "last_login_at",
      "file": null,
      "migration_exists": false,
      "migration_applied": false
    }
  ],
  "issues": [
    {
      "id": "MIG-001",
      "type": "MISSING_MIGRATION",
      "severity": "CRITICAL",
      "description": "New column 'last_login_at' on 'users' table has no migration",
      "schema_location": "Code references users.last_login_at",
      "fix": {
        "description": "Create migration for new column",
        "command": "supabase migration new add_last_login_to_users",
        "sql": "ALTER TABLE users ADD COLUMN last_login_at TIMESTAMPTZ;"
      }
    },
    {
      "id": "MIG-002",
      "type": "MISSING_RLS",
      "severity": "HIGH",
      "description": "New table 'user_preferences' has no RLS policies",
      "migration_file": "20260129_create_user_preferences.sql",
      "fix": {
        "description": "Add RLS policies for user_preferences",
        "sql": [
          "ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;",
          "CREATE POLICY \"Users can view own preferences\" ON user_preferences FOR SELECT USING (auth.uid() = user_id);",
          "CREATE POLICY \"Users can update own preferences\" ON user_preferences FOR UPDATE USING (auth.uid() = user_id);"
        ]
      }
    }
  ],
  "passed_checks": [
    {
      "check": "migration_format",
      "status": "PASS",
      "details": "Migration SQL syntax is valid"
    },
    {
      "check": "migration_applied",
      "status": "PASS",
      "details": "Migration 20260129_create_user_preferences applied successfully"
    },
    {
      "check": "foreign_key_indexes",
      "status": "PASS",
      "details": "All foreign keys have indexes"
    }
  ],
  "recommendation": "BLOCK - 1 CRITICAL issue (missing migration) must be fixed before merge"
}
```

---

## Checklist Template

For each migration review:

```yaml
migration_checklist:
  existence:
    - [ ] Migration file exists for each schema change
    - [ ] Migration timestamp is recent
    - [ ] Migration naming follows convention

  content:
    - [ ] SQL/code matches intended schema change
    - [ ] Column types are correct
    - [ ] Constraints are defined (NOT NULL, UNIQUE, etc.)
    - [ ] Default values specified where needed

  indexes:
    - [ ] Primary keys defined
    - [ ] Foreign key indexes created
    - [ ] Query-pattern indexes added

  security:
    - [ ] RLS policies for new tables (Supabase)
    - [ ] Grants/permissions configured
    - [ ] Sensitive columns protected

  reversibility:
    - [ ] Down migration exists
    - [ ] Down migration tested
    - [ ] Data preservation considered

  testing:
    - [ ] Migration runs locally
    - [ ] Migration is idempotent (can run twice)
    - [ ] Existing data preserved/migrated
```

---

## Exit Criteria

This task is complete when:

- Database framework detected
- All schema changes identified
- Migration files validated against changes
- Missing migrations reported
- RLS policies checked (if Supabase)
- Reversibility assessed
- Report generated with severity classification
- Blocking recommendation provided

---

_Absorbed from Auto-Claude PR Review System - Phase 5_
_AIOX QA Enhancement v1.0_
