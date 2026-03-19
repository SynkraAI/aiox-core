---
task-id: generate-inventory
name: Generate Source Inventory - sources_master.yaml
agent: mind-content-updater
version: 1.0.0
purpose: Scan all source files and generate/update sources_master.yaml with complete metadata

workflow-mode: automatic
elicit: false

inputs:
  - name: mind_slug
    type: string
    description: Snake_case identifier for the mind
    required: true

  - name: mode
    type: enum
    description: Generate from scratch or update existing
    required: false
    options: ["generate", "update"]
    default: "generate"

outputs:
  - path: "squads/mmos-squad/minds/{mind_slug}/sources/sources_master.yaml"
    description: Complete source inventory with metadata for all collected sources
    format: yaml

prerequisites:
  - "Sources directory exists with at least 1 collected source"

validation:
  success-criteria:
    - "sources_master.yaml generated with all discovered files"
    - "Each entry has: slug, title, type, tier, path, word_count"
    - "Summary statistics accurate"
  failure-conditions:
    - "No source files found to inventory"

estimated-duration: "2-5 minutes"
---

# Generate Source Inventory Task

## Purpose

Scan all files in the sources directory of a mind and generate (or update) the `sources_master.yaml` file. This file is the single source of truth for what sources are available for MMOS cognitive analysis.

## Execution Steps

### Step 1: Scan Sources Directory

```
1. Base path: squads/mmos-squad/minds/{mind_slug}/sources/
2. Scan each subdirectory:
   - blogs/*.md
   - articles/*.md
   - interviews/*.md
   - youtube/*/  (look for source.md or transcription_clean.md)
   - social/*.md
   - manual/*  (any file type)
3. For each file:
   a. Read YAML frontmatter (if present)
   b. Extract metadata: title, type, tier, url, word_count, slug, collection_method
   c. If no frontmatter, infer from filename and content:
      - slug: filename without extension
      - type: inferred from parent directory
      - tier: T3 (unknown)
      - title: first heading or filename
      - word_count: count words in content
   d. Calculate file hash (first 16 chars of SHA-256)
   e. Get file size in bytes
```

### Step 2: Build Inventory Data

```yaml
# For each source file, build an entry:
source_entry:
  slug: "{semantic-slug}"
  title: "{from frontmatter or inferred}"
  type: "{blog/article/interview/youtube/social/manual}"
  tier: "{T1/T2/T3}"
  path: "{relative path from sources/ directory}"
  url: "{original URL if available}"
  word_count: {count}
  file_size_bytes: {size}
  hash: "sha256:{first 16 chars}"
  collected_at: "{from frontmatter or file modification date}"
  collection_method: "{web_fetch/video_transcriber/manual}"
  language: "{from frontmatter or 'unknown'}"
```

### Step 3: Calculate Summary Statistics

```yaml
summary:
  total_sources: {count}
  total_word_count: {sum}
  total_size_bytes: {sum}
  total_size_mb: {calculated}

  by_type:
    blogs: {count}
    articles: {count}
    interviews: {count}
    youtube: {count}
    social: {count}
    manual: {count}

  by_tier:
    T1: {count}
    T2: {count}
    T3: {count}

  by_collection_method:
    web_fetch: {count}
    video_transcriber: {count}
    manual: {count}
    unknown: {count}

  content_languages:
    en: {count}
    pt: {count}
    # etc.
```

### Step 4: Generate sources_master.yaml

Write the complete file:

```yaml
# MMOS Sources Master Catalog
# Mind: {mind_name}
# Generated: {ISO timestamp}
# Generator: mind-content-updater squad v1.0.0

mind: "{mind_name}"
slug: "{mind_slug}"
generated_at: "{ISO timestamp}"
generator: "mind-content-updater"
schema_version: "2.0"

summary:
  total_sources: {count}
  total_word_count: {sum}
  total_size_bytes: {sum}
  total_size_mb: {calculated}
  collection_method: "automated"
  quality_assessment: "{high/medium/low based on tier distribution}"

source_breakdown:
  blogs: {count}
  articles: {count}
  interviews: {count}
  youtube: {count}
  social: {count}
  manual: {count}

tier_breakdown:
  T1_authoritative: {count}
  T2_valuable: {count}
  T3_supplementary: {count}

content_profile:
  primary_languages: ["{lang1}", "{lang2}"]
  collection_methods: ["{method1}", "{method2}"]
  date_range:
    earliest: "{date or 'unknown'}"
    latest: "{date}"

sources:
  # --- T1: Authoritative Sources ---
  - slug: "{slug}"
    title: "{title}"
    type: "{type}"
    tier: "T1"
    path: "{relative path}"
    url: "{url}"
    word_count: {count}
    file_size_bytes: {size}
    hash: "sha256:{hash}"
    collected_at: "{date}"
    collection_method: "{method}"
    language: "{lang}"

  # --- T2: Valuable Sources ---
  - slug: "{slug}"
    # ...

  # --- T3: Supplementary Sources ---
  - slug: "{slug}"
    # ...

# Analysis readiness assessment
mmos_readiness:
  status: "{ready/needs_more/insufficient}"
  total_sources: "{count} (minimum: 15)"
  tier_1_count: "{count} (minimum: 5)"
  type_diversity: "{count} types (minimum: 3)"
  word_count: "{count} (minimum: 50000 recommended)"
  gaps: ["{identified gaps}"]
```

### Step 5: Handle Update Mode

If mode=update:

```
1. Read existing sources_master.yaml
2. Compare with current file scan
3. Add new sources not in existing inventory
4. Update metadata for existing sources (word_count, hash)
5. Flag removed sources (file deleted but entry exists)
6. Preserve any manually-added metadata (notes, quality ratings)
7. Update summary statistics
8. Write updated file with changelog comment
```

### Step 6: Present Summary

```
INVENTORY GENERATED - {mind_name}
====================================

sources_master.yaml {created/updated}

Total sources: {count}
  T1 (Authoritative):   {count}
  T2 (Valuable):        {count}
  T3 (Supplementary):   {count}

By type:
  Blogs:      {count} ({words} words)
  Articles:   {count} ({words} words)
  Interviews: {count} ({words} words)
  YouTube:    {count} ({words} words)
  Social:     {count} ({words} words)
  Manual:     {count} ({words} words)

Total word count: {total_words}
Total size: {size_mb} MB

MMOS Readiness: {status}
{If gaps:}
  Gaps: {list}
  Suggestion: {how to fill}

File: squads/mmos-squad/minds/{slug}/sources/sources_master.yaml
```

## Notes

- This task is idempotent - safe to run multiple times
- Update mode preserves manually-added metadata
- Sources are sorted by tier (T1 first) then alphabetically by slug
- The schema_version "2.0" distinguishes from legacy MMOS format
- Files without frontmatter get best-effort metadata from filename/content
- The mmos_readiness section helps users know if they have enough sources
- This task runs automatically at the end of the harvest pipeline
