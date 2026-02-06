# Task: Validate Sources Import

**ID:** validate-sources-import
**Type:** validation
**Elicit:** true
**Agent:** data-importer

## Purpose

Validate that mind sources are ready for import before executing actual import operation.

## Prerequisites

- Database connection configured
- Mind directory exists in `outputs/minds/{mind_slug}/`

## Inputs

**Required:**
- `mind_slug` - Mind identifier

## Outputs

- Validation report
- Pass/fail status
- List of errors and warnings

## Workflow

### Step 1: Elicit Mind Slug

**Instructions:**
Ask the user which mind to validate.

**Elicitation:**
```
Which mind do you want to validate for import?

Mind slug: ___________
```

Store answer as `mind_slug`.

### Step 2: Execute Validation

**Instructions:**
Run comprehensive validation checks.

Execute:
```bash
python squads/mmos-squad/scripts/import_sources_cli.py validate {{mind_slug}}
```

### Step 3: Parse Validation Results

**Instructions:**
Parse validation output and categorize issues.

**Validation checks performed:**

1. **Database Connection**
   - ✓ Supabase connection successful
   - ✗ Failed to connect to database

2. **Mind Exists**
   - ✓ Mind 'sam_altman' exists in database (ID: uuid...)
   - ✗ Mind 'sam_altman' not found in database

3. **sources.yaml Exists**
   - ✓ sources.yaml loaded (37 sources)
   - ✗ sources.yaml not found: outputs/minds/sam_altman/sources/sources.yaml

4. **Source Files Exist**
   - ✓ All 37 source files exist
   - ⚠ 3/37 source files missing

5. **Duplicate Detection**
   - ✓ No duplicates found
   - ⚠ 12/37 sources already exist (will be skipped)

6. **Schema Validation**
   - ✓ All sources have required fields (id, title, type)
   - ⚠ 2 sources missing file_path
   - ✗ 1 source has invalid type: 'invalid_type'

### Step 4: Present Validation Report

**Instructions:**
Show formatted validation report to user.

**Format:**
```
===============================================
VALIDATION REPORT: {{mind_slug}}
===============================================

CHECKS (passing):
  ✓ Mind 'sam_altman' exists in database
  ✓ sources.yaml loaded (37 sources)
  ✓ All source files exist
  ✓ All sources have required fields

WARNINGS (non-blocking):
  ⚠ 12/37 sources already exist (will be skipped)
  ⚠ 2 sources missing file_path (will import metadata only)

ERRORS (blocking):
  (none)

===============================================
STATUS: ✅ VALID - Ready for import
===============================================
```

**If validation fails (errors present):**
```
===============================================
VALIDATION REPORT: {{mind_slug}}
===============================================

CHECKS:
  ✓ Database connection successful
  ✗ Mind 'invalid_mind' not found in database

ERRORS:
  ✗ Mind 'invalid_mind' not found in database
  ✗ sources.yaml not found

===============================================
STATUS: ❌ INVALID - Cannot proceed with import
===============================================

FIX THESE ISSUES:
  1. Create mind record in database first
  2. Verify sources.yaml path
```

### Step 5: Determine Next Action

**Instructions:**
Based on validation status, guide user on next steps.

**If VALID (no blocking errors):**

Show:
```
✅ Validation passed! Ready to import.

What would you like to do next?

[1] Preview import (dry run)
[2] Import now
[3] Cancel

Choice: ___
```

**If choice == 1:**
Execute task `preview-sources-import.md`

**If choice == 2:**
Execute task `import-mind-sources.md`

**If choice == 3:**
HALT

**If INVALID (has blocking errors):**

Show:
```
❌ Validation failed. Please fix the following issues:

{{list of errors}}

Once fixed, run validation again with:
  *validate {{mind_slug}}

or via CLI:
  python squads/mmos-squad/scripts/import_sources_cli.py validate {{mind_slug}}
```

HALT workflow.

## Success Criteria

- All validation checks completed
- Clear pass/fail status reported
- Errors and warnings clearly listed
- User guided on next steps

## Validation Checklist

**Critical (blocking):**
- [ ] Database connection established
- [ ] Mind exists in `minds` table
- [ ] `sources.yaml` file exists and is valid YAML
- [ ] All sources have required fields (id, title, type)
- [ ] Content types are valid (match TYPE_MAPPING)

**Important (warnings):**
- [ ] Source files exist at specified paths
- [ ] No duplicate slugs in import batch
- [ ] File paths are within allowed directories
- [ ] YAML structure follows expected schema

**Optional (info):**
- [ ] Check for existing content (duplicates in DB)
- [ ] Estimate import size (total MB)
- [ ] Verify mind has required metadata

## Error Messages & Solutions

**Error:** Mind not found in database
**Solution:** Create mind record first:
```sql
INSERT INTO minds (slug, display_name, mind_type)
VALUES ('sam_altman', 'Sam Altman', 'collected');
```

**Error:** sources.yaml not found
**Solution:** Verify path or run source collection first

**Error:** Invalid content type
**Solution:** Update source type to match allowed types or add to TYPE_MAPPING

**Warning:** Source files missing
**Solution:** Re-run source collection or update file_path in sources.yaml

**Warning:** Duplicates exist
**Solution:** Normal behavior - import will skip them (or use --force)

## Notes

- **Pre-import check**: Always run before import
- **Fast**: Validation is quick (no file content read)
- **Non-destructive**: No database writes
- **Comprehensive**: Catches 90% of import issues
