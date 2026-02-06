# Task: Preview Sources Import

**ID:** preview-sources-import
**Type:** data-query
**Elicit:** true
**Agent:** data-importer

## Purpose

Preview what will be imported for a mind without actually writing to database (dry run).

## Prerequisites

- Mind exists in `minds` table
- `sources.yaml` exists
- Database connection configured

## Inputs

**Required:**
- `mind_slug` - Mind identifier

## Outputs

- Preview report showing what would be imported
- No database changes

## Workflow

### Step 1: Elicit Mind Slug

**Instructions:**
Ask the user which mind to preview.

**Elicitation:**
```
Which mind do you want to preview import for?

Mind slug: ___________
```

Store answer as `mind_slug`.

### Step 2: Execute Preview

**Instructions:**
Run preview mode (dry run).

Execute:
```bash
python squads/mmos-squad/scripts/import_sources_cli.py preview {{mind_slug}}
```

### Step 3: Present Results

**Instructions:**
Show user what would be imported.

**Format:**
```
Preview Import: {{mind_slug}}

Total sources in sources.yaml: {{total}}

Would import:
  1. sam-altman-how-to-be-successful
     Title: How To Be Successful
     Type: article
     File: outputs/minds/sam_altman/sources/blogs/how-to-be-successful.md
     Size: 12.3 KB
     Status: Will import ✓

  2. sam-altman-startup-playbook
     Title: Startup Playbook
     Type: article
     File: outputs/minds/sam_altman/sources/blogs/startup-playbook.md
     Size: 8.7 KB
     Status: Already exists (will skip) ⏭️

  3. sam-altman-moore-law
     Title: Moore's Law for Everything
     Type: article
     File: outputs/minds/sam_altman/sources/blogs/moores-law.md
     Status: File missing ⚠️

  ...

Summary:
  ✅ Will import: {{new_count}}
  ⏭️  Will skip: {{existing_count}}
  ⚠️  Issues: {{missing_count}}
```

### Step 4: Offer Next Actions

**Instructions:**
Ask user what to do next.

**Options:**
```
What would you like to do?

[1] Proceed with import
[2] Fix issues first
[3] Cancel

Choice: ___
```

**If choice == 1:**
Execute task `import-mind-sources.md` with `mind_slug`

**If choice == 2:**
Show issues list and provide guidance

**If choice == 3:**
HALT

## Success Criteria

- Preview report displayed
- No database modified
- User informed of what would happen

## Notes

- **Read-only**: No database writes
- **Safe**: Can run unlimited times
- **Fast**: Only reads metadata, not full content
