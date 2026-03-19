---
task-id: harvest-full-pipeline
name: Full Harvest Pipeline - Discover, Collect, Analyze, Inventory
agent: mind-content-updater
version: 1.0.0
purpose: Run the complete source harvesting pipeline from discovery to inventory generation

workflow-mode: interactive
elicit: true
elicitation-type: custom

inputs:
  - name: mind_name
    type: string
    description: Full name of the person
    required: true

  - name: mind_slug
    type: string
    description: Snake_case identifier
    required: true

  - name: language
    type: string
    description: Primary language
    required: false
    default: "en"

  - name: known_urls
    type: array
    description: URLs the user already knows about
    required: false

  - name: checkpoints
    type: boolean
    description: Pause between phases for user review
    required: false
    default: true

outputs:
  - path: "squads/mmos-squad/minds/{mind_slug}/sources/"
    description: Complete sources directory with all collected materials
    format: directory

  - path: "squads/mmos-squad/minds/{mind_slug}/sources/sources_master.yaml"
    description: Complete source inventory
    format: yaml

  - path: "squads/mmos-squad/minds/{mind_slug}/docs/logs/"
    description: All reports (discovery, collection, analysis)
    format: directory

prerequisites:
  - "Mind directory exists or will be created"
  - "aios-transcriber dependencies installed for YouTube content (yt-dlp)"
  - "Exa MCP available for semantic search"

validation:
  success-criteria:
    - "Discovery found 10+ sources"
    - "Collection succeeded for 80%+ of attempted URLs"
    - "Analysis extracted at least 3 frameworks"
    - "sources_master.yaml generated and valid"
  failure-conditions:
    - "Discovery found <5 sources"
    - "Collection succeeded for <50% of URLs"

estimated-duration: "60-120 minutes for complete pipeline"
---

# Full Harvest Pipeline Task

## Purpose

Orchestrate the complete source harvesting pipeline. This is the one-command solution for new minds: discover all available content, collect it, analyze it, and generate the inventory file. Each phase has an optional checkpoint where the user can review and adjust before continuing.

## Elicitation (Step 0)

```
FULL HARVEST PIPELINE
======================

I will run the complete source harvesting pipeline:
  Phase 1: DISCOVER - Find all available content on the web
  Phase 2: COLLECT  - Download and extract content from URLs
  Phase 3: ANALYZE  - Extract frameworks, phrases, key concepts
  Phase 4: INVENTORY - Generate sources_master.yaml

To get started, I need:

1. Person's full name:
   (e.g., "Sam Altman", "Thiago Finch")

2. Mind slug (snake_case):
   (e.g., "sam_altman", "thiago_finch")
   {Auto-suggest based on name}

3. Primary language of their content: [en/pt/es/multi]
   Default: en

4. Any known URLs to include?
   (Paste URLs, one per line, or "none")

5. Pause between phases for review?
   1. Yes - review each phase before continuing (recommended)
   2. No - run all phases automatically
   Default: 1

Type your answers:
```

## Execution Steps

### Phase 0: Setup

```
1. Verify mind directory exists:
   squads/mmos-squad/minds/{mind_slug}/
   - If not, create it with standard structure

2. Create required subdirectories:
   sources/blogs/
   sources/youtube/
   sources/articles/
   sources/interviews/
   sources/social/
   sources/manual/
   docs/logs/

3. Check tool availability:
   - Exa MCP: available? (warn if not, will use WebSearch only)
   - aios-transcriber: dependencies installed? (warn if not, will skip YouTube)
   - youtube-captions: available for discovery
   - WebFetch: available (built-in)
   - WebSearch: available (built-in)
```

### Phase 1: DISCOVER

```
PHASE 1/4: DISCOVER
=====================
Finding all available content for {mind_name}...

{Execute discover-sources.md task}
```

**Checkpoint (if enabled):**
```
PHASE 1 COMPLETE: DISCOVER
============================
Found {count} sources across {types} content types.

  T1: {count}  |  T2: {count}  |  T3: {count}

Discovery report: minds/{slug}/docs/logs/{timestamp}-discovery-report.yaml

Options:
  1. CONTINUE to Phase 2 (Collection)
  2. ADD more URLs before collecting
  3. SKIP certain sources (edit the report)
  4. ABORT pipeline

Type 1-4:
```

### Phase 2: COLLECT

```
PHASE 2/4: COLLECT
===================
Downloading content from {count} discovered sources...

{Execute collect-content.md task with source=discovery_report, batch=all}
```

**Checkpoint (if enabled):**
```
PHASE 2 COMPLETE: COLLECT
===========================
Collected: {success}/{total} sources ({percentage}%)
Failed: {failed}
Manual needed: {manual}

Total words collected: {word_count}

Collection report: minds/{slug}/docs/logs/{timestamp}-collection-report.yaml

Options:
  1. CONTINUE to Phase 3 (Analysis)
  2. RETRY failed sources
  3. ADD manual sources now (place files in sources/manual/)
  4. ABORT pipeline

Type 1-4:
```

### Phase 3: ANALYZE

```
PHASE 3/4: ANALYZE
====================
Analyzing {count} collected sources...

{Execute analyze-sources.md task with scope=all}
```

**Checkpoint (if enabled):**
```
PHASE 3 COMPLETE: ANALYZE
===========================
Frameworks found: {count}
Signature phrases: {count}
MMOS layer coverage: {X}/8 layers adequate

Top frameworks:
  1. {framework 1}
  2. {framework 2}
  3. {framework 3}

MMOS readiness: {status}

Analysis report: minds/{slug}/docs/logs/{timestamp}-analysis-report.yaml

Options:
  1. CONTINUE to Phase 4 (Inventory)
  2. RE-ANALYZE with different depth
  3. COLLECT more sources to fill gaps
  4. ABORT pipeline

Type 1-4:
```

### Phase 4: INVENTORY

```
PHASE 4/4: INVENTORY
=====================
Generating sources_master.yaml...

{Execute generate-inventory.md task}
```

### Final Summary

```
HARVEST COMPLETE - {mind_name}
=================================

Pipeline Summary:
  Phase 1 (Discover):  {count} sources found
  Phase 2 (Collect):   {success}/{total} sources collected ({percentage}%)
  Phase 3 (Analyze):   {frameworks} frameworks, {phrases} phrases extracted
  Phase 4 (Inventory): sources_master.yaml generated

Source Corpus:
  Total files: {count}
  Total words: {word_count}
  Content types: {list}

MMOS Layer Coverage:
  L1-L4 (Surface): {status}
  L5-L8 (Deep):    {status}

Files created:
  sources/blogs/       {count} files
  sources/articles/    {count} files
  sources/interviews/  {count} files
  sources/youtube/     {count} dirs
  sources/social/      {count} files
  sources_master.yaml  (inventory)

Reports in docs/logs/:
  - {timestamp}-discovery-report.yaml
  - {timestamp}-collection-report.yaml
  - {timestamp}-analysis-report.yaml
  - {timestamp}-frameworks-extracted.yaml
  - {timestamp}-signature-phrases.yaml

Manual collection still needed: {count} items
  {list of books/paywalled content}

Next step: Run MMOS cognitive analysis
  @mind-mapper *map {mind_slug}
```

## Error Recovery

If the pipeline fails at any phase:

```yaml
recovery:
  phase_1_failure:
    condition: "Discovery found <5 sources"
    options:
      - "Add manual URLs and retry discovery"
      - "Broaden search queries (try aliases, translations)"
      - "Abort if person has minimal web presence"

  phase_2_failure:
    condition: "Collection <50% success rate"
    options:
      - "Retry failed URLs individually"
      - "Check network connectivity"
      - "Provide manual content for failed sources"
      - "Continue with partial collection"

  phase_3_failure:
    condition: "Analysis found 0 frameworks"
    options:
      - "Collect more in-depth sources (interviews, books)"
      - "Lower analysis threshold"
      - "Skip pre-analysis and proceed to MMOS directly"

  phase_4_failure:
    condition: "Inventory generation error"
    options:
      - "Fix malformed frontmatter in source files"
      - "Regenerate inventory from scratch"
```

## Resume Support

If the pipeline is interrupted, it can be resumed:

```
1. Check what phases completed (look for report files in docs/logs/)
2. Skip completed phases
3. Resume from the last incomplete phase
4. Use existing reports as input

Example:
  - If discovery report exists but no collection report -> start from Phase 2
  - If collection report exists but no analysis report -> start from Phase 3
```

## Notes

- The full pipeline is the recommended way to harvest sources for new minds
- Checkpoints are recommended for first-time use to understand the process
- After familiarity, disable checkpoints for faster execution
- The pipeline is idempotent - safe to re-run (skips existing files)
- Manual sources (books, PDFs) should be placed in sources/manual/ at any time
- The inventory task can be re-run anytime to pick up manually added sources
