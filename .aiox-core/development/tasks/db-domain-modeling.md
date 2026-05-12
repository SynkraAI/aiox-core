# Task: Domain Modeling Session

**Purpose**: Interactive session to model business domain into database schema

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
task: dbDomainModeling()
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

This task guides you through domain-driven database design, helping you translate business requirements into a well-structured database schema.

---

## Process

### 1. Understand the Domain

Ask the user comprehensive questions:

```
Let's model your domain!

1. What is the business domain? (e.g., e-commerce, social media, SaaS)

2. Who are the main actors? (e.g., users, admins, customers)

3. What are the core entities? (e.g., products, orders, posts)

4. What are the key relationships? (e.g., users have orders, posts belong to users)

5. What are the critical business rules? (e.g., orders cannot be deleted, users must verify email)

6. What are the main use cases? (e.g., user creates post, admin approves content)

7. What is the expected scale? (e.g., 1K users, 100K orders/month)

8. Are there any compliance requirements? (e.g., GDPR, HIPAA)
```

### 2. Identify Core Entities

For each entity mentioned, gather details:

```
Entity: {entity_name}

1. Description: What is it?

2. Attributes: What properties does it have?
   - Required fields?
   - Optional fields?
   - Computed fields?

3. Identifier: How is it uniquely identified?
   - UUID (recommended for distributed systems)
   - Serial integer
   - Natural key (email, SKU, etc.)

4. Lifecycle: How does it change over time?
   - Immutable (never changes)
   - Mutable (can be updated)
   - Soft-deletable (archived, not deleted)

5. Access patterns: How will it be queried?
   - By ID (primary key lookup)
   - By user (filtered by user_id)
   - By date range
   - Full-text search
   - Aggregations
```

### 3. Map Relationships

Identify relationships between entities:

```
Relationship Analysis:

For each pair of entities, determine:

1. Relationship type:
   - One-to-One (1:1)
   - One-to-Many (1:N)
   - Many-to-Many (M:N)

2. Ownership:
   - Who owns the relationship?
   - Can it exist independently?

3. Cardinality:
   - Optional or required?
   - Min/max constraints?

4. Cascade behavior:
   - What happens on delete?
   - What happens on update?

Examples:
- User → Posts (1:N, user owns, CASCADE delete)
- Post ← Tags (M:N, junction table, no cascade)
- User → Profile (1:1, user owns, CASCADE delete)
```

### 4. Design Tables

For each entity, design the table:

```sql
-- Template for each table

CREATE TABLE {entity_name} (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Keys (relationships)
  {parent}_id UUID REFERENCES {parent}(id) ON DELETE CASCADE,

  -- Required Attributes
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Optional Attributes
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Audit Fields
  updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,  -- For soft deletes

  -- Constraints
  CONSTRAINT valid_name CHECK (LENGTH(name) > 0),
  CONSTRAINT valid_dates CHECK (created_at <= COALESCE(updated_at, NOW()))
);

-- Indexes (based on access patterns)
CREATE INDEX idx_{entity}_parent ON {entity}({parent}_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_{entity}_created ON {entity}(created_at DESC);

-- Comments (documentation)
COMMENT ON TABLE {entity} IS 'Stores {business description}';
COMMENT ON COLUMN {entity}.metadata IS 'Flexible JSONB field for extensibility';
```

### 5. Handle Many-to-Many Relationships

Create junction tables for M:N relationships:

```sql
-- Junction table pattern
CREATE TABLE {entity1}_{entity2} (
  {entity1}_id UUID NOT NULL REFERENCES {entity1}(id) ON DELETE CASCADE,
  {entity2}_id UUID NOT NULL REFERENCES {entity2}(id) ON DELETE CASCADE,

  -- Optional attributes (e.g., role, priority)
  role TEXT DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Composite primary key
  PRIMARY KEY ({entity1}_id, {entity2}_id)
);

-- Indexes for both directions
CREATE INDEX idx_{entity1}_{entity2}_1 ON {entity1}_{entity2}({entity1}_id);
CREATE INDEX idx_{entity1}_{entity2}_2 ON {entity1}_{entity2}({entity2}_id);
```

### 6. Apply Business Rules

Translate business rules into database constraints:

```sql
-- Example business rules

-- Rule: Email must be unique
ALTER TABLE users ADD CONSTRAINT unique_email UNIQUE (email);

-- Rule: Orders cannot be negative
ALTER TABLE orders ADD CONSTRAINT positive_total CHECK (total >= 0);

-- Rule: Published posts must have title
ALTER TABLE posts ADD CONSTRAINT published_has_title
  CHECK (status != 'published' OR (title IS NOT NULL AND LENGTH(title) > 0));

-- Rule: Soft-deleted records are read-only
CREATE OR REPLACE FUNCTION prevent_update_deleted()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.deleted_at IS NOT NULL THEN
    RAISE EXCEPTION 'Cannot update deleted record';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_update_deleted
  BEFORE UPDATE ON {table}
  FOR EACH ROW
  EXECUTE FUNCTION prevent_update_deleted();
```

### 7. Design for Access Patterns

Create indexes based on how data will be queried:

```sql
-- Pattern 1: User-specific data (multi-tenant)
CREATE INDEX idx_posts_user ON posts(user_id) WHERE deleted_at IS NULL;

-- Pattern 2: Time-based queries
CREATE INDEX idx_posts_created ON posts(created_at DESC) WHERE deleted_at IS NULL;

-- Pattern 3: Status filtering
CREATE INDEX idx_posts_status ON posts(status, created_at DESC);

-- Pattern 4: Full-text search
CREATE INDEX idx_posts_search ON posts USING gin(to_tsvector('english', title || ' ' || content));

-- Pattern 5: JSONB queries
CREATE INDEX idx_posts_metadata ON posts USING gin(metadata jsonb_path_ops);

-- Pattern 6: Composite (multiple filters)
CREATE INDEX idx_posts_user_status ON posts(user_id, status, created_at DESC);
```

### 8. Add RLS Policies

Implement Row Level Security for Supabase:

```sql
-- Enable RLS
ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;

-- Policy: Users see only their own data
CREATE POLICY "{table}_users_own"
  ON {table}
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Admins see everything
CREATE POLICY "{table}_admins_all"
  ON {table}
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'role') = 'admin'
  );

-- Policy: Public read, authenticated write
CREATE POLICY "{table}_public_read"
  ON {table}
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "{table}_auth_write"
  ON {table}
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
```

### 9. Generate Schema Document

Create schema design document using template:

```
Use template: schema-design-tmpl.yaml

Fill in:
- domain_context
- entities (all identified entities)
- relationships (all relationships)
- access_patterns (from step 7)
- constraints (from step 6)
- indexes (from step 7)
- rls_policies (from step 8)
```

### 10. Generate Migration

Create initial migration file:

```bash
TS=$(date +%Y%m%d%H%M%S)
MIGRATION_FILE="supabase/migrations/${TS}_initial_schema.sql"

cat > "$MIGRATION_FILE" << 'EOF'
-- Initial Schema Migration
-- Domain: {domain_name}
-- Generated: {timestamp}

BEGIN;

-- Create all tables
{table_definitions}

-- Create all indexes
{index_definitions}

-- Create all constraints
{constraint_definitions}

-- Enable RLS and create policies
{rls_policies}

-- Add comments
{comment_statements}

COMMIT;
EOF

echo "✓ Migration created: $MIGRATION_FILE"
```

---

## Output

Provide comprehensive domain model:

```
✅ DOMAIN MODEL COMPLETE

Domain: {domain_name}

Entities: {count}
- {entity1}
- {entity2}
...

Relationships:
- {entity1} → {entity2} (1:N)
- {entity3} ← {entity4} (M:N via junction)
...

Files Generated:
1. docs/schema-design.yaml - Complete schema documentation
2. supabase/migrations/{TS}_initial_schema.sql - Migration file
3. docs/erd.md - Entity relationship diagram (markdown)

Next Steps:
1. Review schema design document
2. Validate with stakeholders
3. Run dry-run: *dry-run {migration_file}
4. Apply migration: *apply-migration {migration_file}
5. Add seed data if needed: *seed {seed_file}
```

---

## Best Practices

### 1. Start Simple

- Begin with core entities
- Add complexity incrementally
- Avoid premature optimization

### 2. Use Standard Patterns

- id (UUID primary key)
- created_at, updated_at (timestamps)
- deleted_at (soft deletes)
- user_id (ownership)

### 3. Document Everything

- Table comments
- Column comments
- Constraint names that explain purpose

### 4. Think About Scale

- How will tables grow?
- What queries will be most common?
- Where are the hot paths?

### 5. Design for Change

- Use JSONB for flexible attributes
- Soft deletes preserve history
- Migrations are additive when possible

### 6. Security First

- RLS by default
- Constraints enforce data integrity
- Foreign keys prevent orphans

---

## Common Domain Patterns

### 1. Multi-Tenancy

```sql
-- Tenant isolation
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  email TEXT NOT NULL UNIQUE,
  UNIQUE (organization_id, email)
);

-- RLS for tenant isolation
CREATE POLICY "org_isolation" ON users
  FOR ALL TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id
      FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );
```

### 2. Audit Trail

```sql
-- Immutable audit log
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  operation TEXT NOT NULL, -- INSERT, UPDATE, DELETE
  old_data JSONB,
  new_data JSONB,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for automatic auditing
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (table_name, record_id, operation, old_data, new_data, user_id)
  VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) END,
    auth.uid()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3. Hierarchical Data

```sql
-- Adjacency list pattern
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES categories(id),
  name TEXT NOT NULL,
  path TEXT[] -- Materialized path for fast queries
);

-- Update path on insert/update
CREATE OR REPLACE FUNCTION update_category_path()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.parent_id IS NULL THEN
    NEW.path := ARRAY[NEW.id];
  ELSE
    SELECT path || NEW.id INTO NEW.path
    FROM categories
    WHERE id = NEW.parent_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## References

- [Domain-Driven Design](https://en.wikipedia.org/wiki/Domain-driven_design)
- [PostgreSQL Data Types](https://www.postgresql.org/docs/current/datatype.html)
- [Supabase RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
