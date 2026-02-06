# Task: Import Mind Sources

**ID:** import-mind-sources
**Type:** data-operation
**Elicit:** true
**Agent:** data-importer

## Purpose

Import all source materials for a mind from filesystem (`outputs/minds/{mind_slug}/sources/`) into Supabase database (`contents` + `content_minds` tables).

## Prerequisites

- Mind exists in `minds` table
- `sources.yaml` exists in `outputs/minds/{mind_slug}/sources/`
- Source files exist at paths specified in `sources.yaml`
- Database connection configured (`SUPABASE_URL` and `SUPABASE_SERVICE_KEY`)
- `supabase` Python package installed

## Inputs

**Required:**
- `mind_slug` - Mind identifier (e.g., "sam_altman")

**Optional:**
- `force` - If true, overwrite existing content (default: false, skip duplicates)

## Outputs

- Content records in `contents` table
- Mind linkages in `content_minds` table
- Import report (YAML format)

## Workflow

### Step 1: Elicit Mind Slug

**Instructions:**
Ask the user which mind to import.

**Elicitation:**
```
What mind do you want to import sources for?

Examples: sam_altman, naval_ravikant, nassim_taleb

Mind slug: ___________
```

Store answer as `mind_slug`.

### Step 2: Validate Before Import

**Instructions:**
Run validation to ensure import can proceed safely.

Execute:
```bash
python squads/mmos-squad/scripts/import_sources_cli.py validate {{mind_slug}}
```

**Validation checks:**
- Mind exists in database
- `sources.yaml` file exists
- Source files exist
- Check for existing content (duplicates)

**If validation fails:**
- Show errors to user
- HALT workflow
- Ask user to fix issues before retrying

**If validation succeeds with warnings:**
- Show warnings to user
- Ask: "Proceed with import? (yes/no)"
- If no: HALT
- If yes: Continue

### Step 3: Preview Import (Optional)

**Instructions:**
Ask user if they want to preview what will be imported.

**Elicitation:**
```
Do you want to preview what will be imported before running live import?

[1] Yes - Show preview (dry run)
[2] No - Proceed directly to import

Choice: ___
```

**If user chooses "1 - Yes":**

Execute:
```bash
python squads/mmos-squad/scripts/import_sources_cli.py preview {{mind_slug}}
```

Show preview report to user.

Ask: "Proceed with import? (yes/no)"
- If no: HALT
- If yes: Continue to Step 4

**If user chooses "2 - No":**
Continue to Step 4.

### Step 4: Execute Import

**Instructions:**
Run the actual import operation.

**Default behavior:** Skip existing content (safe mode)

Execute:
```bash
python squads/mmos-squad/scripts/import_sources_cli.py import {{mind_slug}}
```

**If user wants to force overwrite:**

Ask: "Do you want to FORCE overwrite existing content? (yes/no)"

If yes, execute:
```bash
python squads/mmos-squad/scripts/import_sources_cli.py import {{mind_slug}} --force
```

### Step 5: Review Import Report

**Instructions:**
Parse and present the import results to the user.

**Report format:**
```
Import completed for: {{mind_slug}}

Total sources: {{total}}
✅ Imported: {{imported}}
⏭️  Skipped: {{skipped}} (already existed)
❌ Failed: {{failed}}
```

**If failed > 0:**
- Show details of failed imports
- Ask user if they want to retry failed imports
- Provide troubleshooting guidance

**If all succeeded:**
- Congratulate user
- Show summary statistics
- Suggest next steps (e.g., verify in database, run fidelity tests)

### Step 6: Verify in Database (Optional)

**Instructions:**
Optionally verify that content was imported correctly.

Ask: "Do you want to verify imported content in database? (yes/no)"

**If yes:**

Execute SQL query to show imported content:
```sql
SELECT
  c.slug,
  c.title,
  c.content_type,
  c.status,
  cm.role
FROM contents c
JOIN content_minds cm ON c.id = cm.content_id
JOIN minds m ON cm.mind_id = m.id
WHERE m.slug = '{{mind_slug}}'
ORDER BY c.created_at DESC
LIMIT 10;
```

Show results to user.

### Step 7: Generate Import Report (Optional)

**Instructions:**
Optionally save import report for audit trail.

Ask: "Do you want to save import report? (yes/no)"

**If yes:**

Use template `import-report.yaml` to generate report.

Save to: `outputs/minds/{{mind_slug}}/docs/import-report-{{timestamp}}.yaml`

Inform user of saved location.

## Success Criteria

- All sources from `sources.yaml` processed
- Content inserted into `contents` table
- Mind linkages created in `content_minds` table
- No database errors or transaction rollbacks
- Import report generated

## Error Handling

**Common errors:**

1. **Mind not found in database**
   - Solution: Create mind record first or check slug spelling

2. **sources.yaml not found**
   - Solution: Verify path `outputs/minds/{mind_slug}/sources/sources.yaml`

3. **Source files missing**
   - Solution: Re-run source collection or update `sources.yaml`

4. **Duplicate content (skip mode)**
   - Solution: Use `--force` to overwrite or verify existing content

5. **Database connection failed**
   - Solution: Check `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` env vars

6. **Permission denied (RLS)**
   - Solution: Use `SUPABASE_SERVICE_KEY` (bypasses RLS)

## Rollback

**If import fails mid-operation:**

Since each insert is a separate transaction, rollback is not automatic.

**Manual cleanup:**

Execute SQL to remove imported content:
```sql
DELETE FROM content_minds
WHERE content_id IN (
  SELECT c.id FROM contents c
  JOIN content_minds cm ON c.id = cm.content_id
  JOIN minds m ON cm.mind_id = m.id
  WHERE m.slug = '{{mind_slug}}'
  AND c.created_at > '{{import_start_time}}'
);

DELETE FROM contents
WHERE id IN (
  SELECT c.id FROM contents c
  JOIN content_minds cm ON c.id = cm.content_id
  JOIN minds m ON cm.mind_id = m.id
  WHERE m.slug = '{{mind_slug}}'
  AND c.created_at > '{{import_start_time}}'
);
```

## Post-Import Actions

**Recommended next steps:**

1. **Verify content** - Query database to confirm import
2. **Run fidelity tests** - Test content quality
3. **Update mind metadata** - Mark mind as "sources_imported"
4. **Generate knowledge base** - Chunk content for KB
5. **Run analysis** - Analyze imported content

## Example Usage

**Via agent command:**
```
User: @data-importer
Agent: DataSync activated! Use *import to import mind sources.

User: *import sam_altman
Agent: [Executes this task workflow]
```

**Via CLI:**
```bash
# Validate
python squads/mmos-squad/scripts/import_sources_cli.py validate sam_altman

# Preview
python squads/mmos-squad/scripts/import_sources_cli.py preview sam_altman

# Import
python squads/mmos-squad/scripts/import_sources_cli.py import sam_altman

# Force overwrite
python squads/mmos-squad/scripts/import_sources_cli.py import sam_altman --force
```

## Notes

- **Idempotent**: Safe to run multiple times (skips existing by default)
- **Transaction-safe**: Each insert is atomic
- **Raw content**: Files read completely without AI processing
- **Duplicate detection**: Based on `slug` (unique constraint)
- **Progress tracking**: Real-time console output during import
