# Task: Setup Database

**Purpose**: Interactive database project setup (Supabase, PostgreSQL, MongoDB, MySQL, SQLite)

**Elicit**: true

**Renamed From (Story 6.1.2.3):**
- `db-supabase-setup.md` - Now database-agnostic (supports 5+ DB types)

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
task: setupDatabase()
responsável: Dara (Sage)
responsavel_type: Agente
atomic_layer: Config

**Entrada:**
- campo: project_path
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Valid directory path

- campo: options
  tipo: object
  origem: User Input
  obrigatório: false
  validação: Initialization options

**Saída:**
- campo: initialized_project
  tipo: string
  destino: File system
  persistido: true

- campo: config_created
  tipo: boolean
  destino: Return value
  persistido: false
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Directory is empty or force flag set; config valid
    tipo: pre-condition
    blocker: true
    validação: |
      Check directory is empty or force flag set; config valid
    error_message: "Pre-condition failed: Directory is empty or force flag set; config valid"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Project initialized; config files created; structure valid
    tipo: post-condition
    blocker: true
    validação: |
      Verify project initialized; config files created; structure valid
    error_message: "Post-condition failed: Project initialized; config files created; structure valid"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Project structure correct; all config files valid
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert project structure correct; all config files valid
    error_message: "Acceptance criterion not met: Project structure correct; all config files valid"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** project-scaffolder
  - **Purpose:** Generate project structure and config
  - **Source:** .aiox-core/scripts/project-scaffolder.js

- **Tool:** config-manager
  - **Purpose:** Initialize configuration files
  - **Source:** .aiox-core/utils/config-manager.js

---

## Scripts

**Agent-specific code for this task:**

- **Script:** init-project.js
  - **Purpose:** Project initialization workflow
  - **Language:** JavaScript
  - **Location:** .aiox-core/scripts/init-project.js

---

## Error Handling

**Strategy:** retry

**Common Errors:**

1. **Error:** Directory Not Empty
   - **Cause:** Target directory already contains files
   - **Resolution:** Use force flag or choose empty directory
   - **Recovery:** Prompt for confirmation, merge or abort

2. **Error:** Initialization Failed
   - **Cause:** Error creating project structure
   - **Resolution:** Check permissions and disk space
   - **Recovery:** Cleanup partial initialization, log error

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


## Elicitation

**Step 1: Detect or prompt for database type**

```bash
# Auto-detect from PRD or tech stack if available
if grep -qiE "supabase|postgres" docs/prd/*.yaml docs/architecture/*.yaml 2>/dev/null; then
  DETECTED_DB="postgresql"
  echo "📊 Detected database: PostgreSQL/Supabase"
elif grep -qiE "mongodb|mongo" docs/prd/*.yaml docs/architecture/*.yaml 2>/dev/null; then
  DETECTED_DB="mongodb"
  echo "📊 Detected database: MongoDB"
elif grep -qiE "mysql|mariadb" docs/prd/*.yaml docs/architecture/*.yaml 2>/dev/null; then
  DETECTED_DB="mysql"
  echo "📊 Detected database: MySQL"
elif grep -qiE "sqlite" docs/prd/*.yaml docs/architecture/*.yaml 2>/dev/null; then
  DETECTED_DB="sqlite"
  echo "📊 Detected database: SQLite"
else
  DETECTED_DB=""
fi
```

**Prompt user:**

```
Select database type:

1. **supabase** - PostgreSQL + RLS + Realtime + Edge Functions
2. **postgresql** - Standard PostgreSQL (self-hosted or managed)
3. **mongodb** - NoSQL document database
4. **mysql** - MySQL or MariaDB relational database
5. **sqlite** - Embedded SQLite database

Which database? [supabase/postgresql/mongodb/mysql/sqlite]:
```

**Capture:** `{db_type}` (default: $DETECTED_DB if available)

---

## Process by Database Type

### Type: Supabase

**When:** User selects `supabase`

#### Step 1: Install Supabase CLI

```bash
\echo '=== Installing Supabase CLI ==='

# Check if already installed
if command -v supabase &> /dev/null; then
  echo "✓ Supabase CLI already installed: $(supabase --version)"
else
  echo "Installing Supabase CLI..."

  # macOS/Linux
  if [[ "$OSTYPE" == "darwin"* ]]; then
    brew install supabase/tap/supabase
  else
    # Linux
    curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar -xz
    sudo mv supabase /usr/local/bin/
  fi

  echo "✓ Supabase CLI installed"
fi
```

#### Step 2: Initialize Supabase Project

```bash
\echo ''
\echo '=== Initializing Supabase Project ==='

# Initialize local project
supabase init

echo "✓ Created supabase/ directory structure"
```

#### Step 3: Create Standard Directories

```bash
mkdir -p supabase/migrations
mkdir -p supabase/seed.sql
mkdir -p supabase/tests
mkdir -p supabase/functions

echo "✓ Created standard Supabase directories"
```

####Step 4: Create Starter Migration

```bash
cat > supabase/migrations/$(date +%Y%m%d%H%M%S)_initial_schema.sql <<'SQL'
-- Initial Schema Migration
-- Generated by AIOX data-engineer

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Example: Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Example RLS policy
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
SQL

echo "✓ Created initial migration"
```

#### Step 5: Create Starter Seed Data

```bash
cat > supabase/seed.sql <<'SQL'
-- Seed Data
-- Generated by AIOX data-engineer

-- Example seed user (for local development only)
INSERT INTO users (id, email)
VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'test@example.com')
ON CONFLICT (email) DO NOTHING;
SQL

echo "✓ Created seed data file"
```

#### Step 6: Start Local Development

```bash
\echo ''
\echo '=== Starting Local Supabase ==='

supabase start

echo ""
echo "✓ Supabase is running locally"
echo ""
echo "📋 Next steps:"
echo "  1. supabase migration new {name} - Create new migration"
echo "  2. supabase db push - Push migrations to remote"
echo "  3. supabase db reset - Reset local database"
echo "  4. supabase status - View local services"
```

---

### Type: PostgreSQL (Standard)

**When:** User selects `postgresql`

#### Step 1: Create Project Structure

```bash
\echo '=== Setting Up PostgreSQL Project ==='

mkdir -p database/migrations
mkdir -p database/seeds
mkdir -p database/scripts

echo "✓ Created PostgreSQL project structure"
```

#### Step 2: Create Connection Config

```bash
cat > database/.env.example <<'ENV'
# PostgreSQL Connection
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=myapp_development
POSTGRES_USER=postgres
POSTGRES_PASSWORD=changeme

# Connection URL
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}
ENV

cp database/.env.example database/.env

echo "✓ Created .env configuration"
```

#### Step 3: Create Initial Migration

```bash
cat > database/migrations/001_initial_schema.sql <<'SQL'
-- Initial Schema Migration
-- Generated by AIOX data-engineer

BEGIN;

-- Example: Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMIT;
SQL

echo "✓ Created initial migration"
```

#### Step 4: Create Migration Runner Script

```bash
cat > database/scripts/migrate.sh <<'BASH'
#!/bin/bash
set -e

# Load environment
source database/.env

echo "Running migrations..."

for migration in database/migrations/*.sql; do
  echo "Applying: $migration"
  psql "$DATABASE_URL" -f "$migration"
done

echo "✓ All migrations applied"
BASH

chmod +x database/scripts/migrate.sh

echo "✓ Created migration runner"
```

---

### Type: MongoDB

**When:** User selects `mongodb`

#### Step 1: Create Project Structure

```bash
\echo '=== Setting Up MongoDB Project ==='

mkdir -p database/migrations
mkdir -p database/seeds
mkdir -p database/schemas

echo "✓ Created MongoDB project structure"
```

#### Step 2: Create Connection Config

```bash
cat > database/.env.example <<'ENV'
# MongoDB Connection
MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_DB=myapp_development
MONGO_USER=admin
MONGO_PASSWORD=changeme

# Connection URL
MONGO_URL=mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}?authSource=admin
ENV

cp database/.env.example database/.env

echo "✓ Created .env configuration"
```

#### Step 3: Create Initial Schema

```bash
cat > database/schemas/users.js <<'JS'
// User Schema
// Generated by AIOX data-engineer

module.exports = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "createdAt"],
      properties: {
        email: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        createdAt: {
          bsonType: "date",
          description: "must be a date and is required"
        },
        updatedAt: {
          bsonType: "date"
        }
      }
    }
  }
};
JS

echo "✓ Created user schema"
```

#### Step 4: Create Seed Data

```bash
cat > database/seeds/users.json <<'JSON'
[
  {
    "email": "test@example.com",
    "createdAt": {"$date": "2025-01-01T00:00:00.000Z"},
    "updatedAt": {"$date": "2025-01-01T00:00:00.000Z"}
  }
]
JSON

echo "✓ Created seed data"
```

---

### Type: MySQL

**When:** User selects `mysql`

#### Step 1: Create Project Structure

```bash
\echo '=== Setting Up MySQL Project ==='

mkdir -p database/migrations
mkdir -p database/seeds
mkdir -p database/scripts

echo "✓ Created MySQL project structure"
```

#### Step 2: Create Connection Config

```bash
cat > database/.env.example <<'ENV'
# MySQL Connection
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DB=myapp_development
MYSQL_USER=root
MYSQL_PASSWORD=changeme

# Connection URL
DATABASE_URL=mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DB}
ENV

cp database/.env.example database/.env

echo "✓ Created .env configuration"
```

#### Step 3: Create Initial Migration

```bash
cat > database/migrations/001_initial_schema.sql <<'SQL'
-- Initial Schema Migration
-- Generated by AIOX data-engineer

-- Example: Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
SQL

echo "✓ Created initial migration"
```

---

### Type: SQLite

**When:** User selects `sqlite`

#### Step 1: Create Project Structure

```bash
\echo '=== Setting Up SQLite Project ==='

mkdir -p database/migrations
mkdir -p database/seeds

echo "✓ Created SQLite project structure"
```

#### Step 2: Create Initial Migration

```bash
cat > database/migrations/001_initial_schema.sql <<'SQL'
-- Initial Schema Migration
-- Generated by AIOX data-engineer

-- Example: Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for updated_at
CREATE TRIGGER IF NOT EXISTS update_users_updated_at
AFTER UPDATE ON users
BEGIN
  UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
SQL

echo "✓ Created initial migration"
```

#### Step 3: Create Database

```bash
sqlite3 database/myapp_development.db < database/migrations/001_initial_schema.sql

echo "✓ Created SQLite database"
```

---

## Common Next Steps (All Databases)

```
📋 Database setup complete!

Next steps:
  1. Configure environment variables (.env file)
  2. Create your schema design (*create-schema)
  3. Generate migrations (*create-migration-plan)
  4. Apply migrations (*apply-migration)
  5. Set up RLS policies (Supabase/PostgreSQL only: *policy-apply)
  6. Add seed data (*seed)

Related commands:
  - *create-schema - Design database schema
  - *apply-migration {path} - Run migrations
  - *security-audit - Check RLS coverage (PostgreSQL)
  - *analyze-performance - Optimize queries
```

---

## Output Examples

### Supabase Output

```
=== Installing Supabase CLI ===
✓ Supabase CLI already installed: 1.27.7

=== Initializing Supabase Project ===
✓ Created supabase/ directory structure
✓ Created standard Supabase directories
✓ Created initial migration
✓ Created seed data file

=== Starting Local Supabase ===
Started supabase local development setup.

         API URL: http://localhost:54321
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323

✓ Supabase is running locally
```

### PostgreSQL Output

```
=== Setting Up PostgreSQL Project ===
✓ Created PostgreSQL project structure
✓ Created .env configuration
✓ Created initial migration
✓ Created migration runner

📋 Database setup complete!
```

---

## Related Commands

- `*env-check` - Validate database environment variables
- `*bootstrap` - Alternative setup command with more options
- `*create-schema` - Design database schema
- `*apply-migration` - Run migrations
- `*setup-supabase` - Legacy command (deprecated, use `*setup-database supabase`)

---

**Note:** This task replaces `db-supabase-setup.md` with database-agnostic version (renamed in Story 6.1.2.3)
