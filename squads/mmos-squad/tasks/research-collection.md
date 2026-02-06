---
task-id: research-collection
name: Source Discovery & Parallel Collection
agent: research-specialist
version: 1.0.0
purpose: Execute systematic source discovery and parallel collection workflow for cognitive analysis

workflow-mode: interactive
elicit: true
elicitation-type: custom

prerequisites:
  - Viability assessment completed with GO decision
  - PRD file generated and available
  - ETL Data Collector pack installed and configured
  - API keys configured (AssemblyAI for transcription, social media credentials if needed)

inputs:
  - name: mind_name
    type: string
    description: Subject being mapped
    required: true

  - name: mode
    type: enum
    description: Research workflow mode
    required: true
    options: ["discovery", "collection", "master_compilation", "full"]
    default: "full"
    user_friendly: "Just discover sources / Just collect / Just compile / Full workflow"

  - name: prd_path
    type: file_path
    description: Path to PRD file
    required: true
    default: "squads/mmos-squad/minds/{mind_name}/viability/prd.md"

  - name: viability_report_path
    type: file_path
    description: Path to viability assessment output
    required: true
    default: "squads/mmos-squad/minds/{mind_name}/viability/viability-output.yaml"

  - name: known_sources
    type: array
    description: User-provided high-quality sources to prioritize
    required: false

  - name: time_constraints
    type: object
    description: Time-boxing parameters
    required: false
    fields:
      - max_hours
      - priority_tiers_only

outputs:
  - path: "squads/mmos-squad/minds/{mind_name}/sources/sources_master.yaml"
    description: Master inventory of all discovered and collected sources
    format: "yaml"

  - path: "squads/mmos-squad/minds/{mind_name}/sources/{type}/"
    description: Raw downloaded data organized by type (blogs/, youtube/, pdf/, etc.)
    format: "directory"

  - path: "squads/mmos-squad/minds/{mind_name}/docs/logs/{timestamp}-collection-report.yaml"
    description: Collection statistics and quality report (timestamped, in logs/)
    format: "yaml"

  - path: "squads/mmos-squad/minds/{mind_name}/docs/logs/{timestamp}-discovery-report.yaml"
    description: Source discovery report (timestamped, in logs/)
    format: "yaml"

dependencies:
  agents:
    - data-collector (from etl-data-collector pack)
  tasks:
    - collect-all-sources.md (from etl-data-collector pack)
  templates:
    - sources-master.yaml
  checklists:
    - research-quality-checklist.md
  external_packs:
    - etl-data-collector

validation:
  success-criteria:
    - "sources_master.yaml generated with 20+ high-quality sources"
    - "All Tier 1 sources successfully collected"
    - "At least 3 independent sources per DNA Mental Layer (8 layers)"
    - "Collection quality score >= 85%"

  warning-conditions:
    - "15-19 sources total (borderline)"
    - "Missing sources for 1-2 DNA Mental layers"
    - "Collection quality score 75-84%"

  failure-conditions:
    - "<15 total sources"
    - "Missing sources for 3+ DNA Mental layers"
    - "Collection quality score < 75%"

integration:
  etl_pack:
    trigger: "Delegates to @data-collector for parallel collection"
    handoff: "sources_master.yaml → etl-data-collector *collect command"
    completion: "Receives COLLECTION_SUMMARY.yaml back from ETL pack"

estimated-duration: "2-4 hours for full workflow (discovery + collection + compilation)"
performance-benefit: "60% faster than sequential collection via parallel ETL workflow"

service_integration:
  source_adapter:
    usage: "Document parsing, YouTube extraction, blog collection"
    methods:
      - parseDocument
      - extractYouTube
      - collectBlog
      - chunkContent
      - batchExtract

mcp_integration:
  exa:
    usage: "Web content discovery for additional sources"
    tool: mcp__docker-gateway__web_search_exa
---

# Research Collection Task

## Service Integration: Source Adapter

**Use source-adapter.js for all content extraction:**

### Document Processing

```javascript
const { createSourceAdapter } = require('../adapters/source-adapter');
const adapter = createSourceAdapter({ traceId: 'mmos-research' });

// Parse documents (PDF, Word, Excel, CSV)
const content = await adapter.parseDocument(filePath);
```

### YouTube Extraction

```javascript
// Extract YouTube transcript via ETL service
const transcript = await adapter.extractYouTube(videoId, { lang: 'en' });
```

### Blog Collection

```javascript
// Collect blog content via ETL service
const article = await adapter.collectBlog(url);
```

### Batch Extraction

```javascript
// Process multiple sources in parallel
const results = await adapter.batchExtract([
  { type: 'youtube', id: 'abc123' },
  { type: 'blog', url: 'https://example.com/article' },
  { type: 'document', path: './sources/book.pdf' }
], { concurrency: 3 });
```

## MCP Integration: EXA for Web Discovery

**Use EXA MCP to discover additional sources:**

```
mcp__docker-gateway__web_search_exa
Query: "{mind_name} {source_type}"
numResults: 10
```

---

## Purpose

Execute systematic source discovery and parallel collection workflow for MMOS Mind Mapper. This task orchestrates the Research phase (Phase 2) of the pipeline, discovering available sources across multiple content types, prioritizing by quality/relevance, executing parallel collection, and compiling the sources_master.yaml inventory that drives all subsequent analysis phases.

**Performance Benefit:** Parallel collection workflow reduces research phase time by 60% compared to sequential collection.

## When to Use This Task

**Use this task when:**
- Beginning Phase 2 (Research) after viability GO decision
- Need to discover and collect sources for cognitive analysis
- Building initial source corpus for a new mind (greenfield)
- Executing research phase from execute-mmos-pipeline orchestration

**Do NOT use this task when:**
- Viability assessment not yet completed (use viability-assessment first)
- Updating existing mind (use brownfield-update instead)
- Sources already collected (proceed to cognitive-analysis)

## File Organization Standard

**CRITICAL:** The MMOS system enforces strict file organization for logs and reports:

### Directory Structure Rules

```
{mind}/
├── sources/
│   ├── sources_master.yaml        ← ONLY metadata file here
│   ├── blogs/{slug}.md            ← Collected blog content (semantic slugs)
│   ├── youtube/{slug}/            ← YouTube transcripts (semantic slugs)
│   ├── pdf/{slug}/                ← PDF extractions (semantic slugs)
│   └── manual/                    ← Templates for manual collection
│
└── docs/
    └── logs/                      ← ALL logs, reports, configs here
        ├── {timestamp}-collection-report.yaml
        ├── {timestamp}-import-log.yaml
        ├── VERIFIED_TRANSCRIPT_SOURCES.md
        └── QUICK_LINKS.md
```

### What Goes Where

**✅ sources/ directory:**
- `sources_master.yaml` - Master source inventory (ONLY metadata file)
- `blogs/{slug}.md` - Collected blog post content (semantic slugs)
- `youtube/{slug}/` - YouTube transcripts and metadata (semantic slugs)
- `pdf/{slug}/` - PDF extractions: text.md, text.txt, metadata.json (semantic slugs)
- `manual/` - Templates for manual collection workflow

**Semantic Slug Examples:**
- Blog: `how-to-be-successful.md` (not `T1-001.md`)
- YouTube: `lex-fridman-367-gpt4-future-of-ai/` (not `T1-005/`)
- PDF: `congressional-testimony-2023-05-16/` (not `T1-004/`)

**✅ docs/logs/ directory:**
- Collection reports (YAML, JSON, MD)
- Import logs and status files
- Search guides and quick links
- Configuration files (tier batches, priorities)
- ETL task state files
- Any temporary or diagnostic files

**❌ NEVER put in sources/:**
- Collection reports
- Import logs
- Search guides
- Configuration files
- Priority matrices
- Task state files

### Validation

Use the validation script to check compliance:

```bash
cd expansion-packs/etl-data-collector
node validate-log-locations.js ../../squads/mmos-squad/minds/{mind_name}
```

The script will report violations and suggest fixes.

### Why This Matters

1. **Clean structure**: Makes it easy to find actual content vs operational files
2. **Git management**: Logs can be gitignored without losing content
3. **Automation**: ETL scripts know exactly where to write logs
4. **Consistency**: All minds follow the same standard

---

## Key Activities & Instructions

### Mode: Discovery

#### Step 1: Source Type Matrix

Build comprehensive map of available sources across types:

```yaml
source_types:
  books:
    priority: 1  # Highest - most authoritative
    search_queries:
      - "{mind_name} books"
      - "{mind_name} author"
      - "books by {mind_name}"
    platforms: [Amazon, Goodreads, Google Books]

  long_form_writing:
    priority: 2
    search_queries:
      - "{mind_name} blog"
      - "{mind_name} articles"
      - "{mind_name} essays"
    platforms: [Personal website, Medium, Substack]
    collection_rules:
      - "If site highlights featured/top posts, collect those first"
      - "If no highlights, gather all posts from the last 3 years"
      - "If total post count ≤ 50, collect the entire archive"
      - "Persist each article as sources/blogs/{slug}.md and set id to the slug"
      - "Capture metadata in frontmatter (published_at, tags, canonical_url)"

  interviews:
    priority: 2
    search_queries:
      - "{mind_name} interview"
      - "{mind_name} podcast"
      - "conversation with {mind_name}"
    platforms: [YouTube, Podcast platforms, Blogs]

  video_content:
    priority: 3
    search_queries:
      - "{mind_name} YouTube"
      - "{mind_name} talks"
      - "{mind_name} conference"
    platforms: [YouTube, Vimeo, Conference archives]

  social_media:
    priority: 3
    search_queries:
      - "@{handle} Twitter"
      - "{mind_name} LinkedIn"
    platforms: [Twitter/X, LinkedIn, others]

  courses_workshops:
    priority: 2
    search_queries:
      - "{mind_name} course"
      - "{mind_name} workshop"
      - "{mind_name} masterclass"
    platforms: [Course platforms, Personal site]
```

#### Step 2: Execute Discovery Sweep

**For each source type:**

1. **Run search queries** across identified platforms
2. **Catalog findings**:
   ```yaml
   source_id: {{unique_id}}
   title: "{{source_title}}"
   type: {{books/interviews/etc}}
   url: "{{if_available}}"
   publication_date: "{{date}}"
   length: "{{pages/minutes/words}}"
   confidence_tier: {{1/2/3}}
   ```

3. **Assess confidence tier**:
   - **Tier 1 (High Confidence)**: Published books, official content, authoritative interviews
   - **Tier 2 (Medium Confidence)**: Podcasts, video talks, curated articles
   - **Tier 3 (Validation Needed)**: Social media, secondary sources, commentary

#### Step 3: Temporal Mapping

Map sources across time periods to understand evolution:

```yaml
temporal_context:
  career_phases:
    - phase: "{{early_career}}"
      years: "{{YYYY-YYYY}}"
      sources: [{{source_ids}}]
      themes: ["{{key_themes}}"]

    - phase: "{{middle_career}}"
      years: "{{YYYY-YYYY}}"
      sources: [{{source_ids}}]
      themes: ["{{key_themes}}"]

    - phase: "{{current}}"
      years: "{{YYYY-present}}"
      sources: [{{source_ids}}]
      themes: ["{{key_themes}}"]

  evolution_notes: "{{how_thinking_evolved}}"
```

#### Step 4: Priority Matrix

Build collection priority based on multiple factors:

```yaml
priority_calculation:
  factors:
    confidence_tier:
      weight: 40%
      score: "Tier 1=10, Tier 2=7, Tier 3=4"

    content_depth:
      weight: 30%
      score: "Deep (book/course)=10, Medium (long interview)=7, Light (social)=4"

    recency:
      weight: 15%
      score: "Last 2 years=10, 2-5 years=7, >5 years=5, historical=3"

    accessibility:
      weight: 15%
      score: "Free/easy=10, Purchase required=7, Hard to access=4"

source_rankings:
  - source_id: {{id}}
    priority_score: {{calculated_score}}
    rank: {{1-N}}
    rationale: "{{why_this_priority}}"
```

#### Step 5: Generate Discovery Report

**Output:** `minds/{mind}/docs/logs/{timestamp}-discovery-report.yaml`

(Note: Discovery reports go to docs/logs/, NOT sources/)

```yaml
discovery_report:
  mind_name: "{{name}}"
  discovery_date: "{{timestamp}}"

  summary:
    total_sources_identified: {{count}}
    tier_1_sources: {{count}}
    tier_2_sources: {{count}}
    tier_3_sources: {{count}}

  source_type_breakdown:
    books: {{count}}
    interviews: {{count}}
    articles: {{count}}
    videos: {{count}}
    social: {{count}}
    courses: {{count}}

  temporal_coverage:
    earliest_source: "{{date}}"
    latest_source: "{{date}}"
    span_years: {{years}}

  minimum_requirements_status:
    total_sources: "{{met/not_met}} (need 15, have {{count}})"
    high_confidence: "{{met/not_met}} (need 5, have {{count}})"
    type_diversity: "{{met/not_met}} (need 3 types, have {{count}})"

  priority_queue:
    batch_1_critical: [{{source_ids}}]
    batch_2_important: [{{source_ids}}]
    batch_3_nice_to_have: [{{source_ids}}]

  recommendations:
    proceed_to_collection: {{yes/no}}
    concerns: [{{if_any}}]
    suggested_focus: "{{guidance}}"
```

### Mode: Collection

#### Step 1: Initialize Collection Structure

Create organized directory structure:

```
minds/{mind}/sources/
├── books/
├── articles/
├── interviews/
├── videos/
├── social/
├── courses/
└── _raw/  # Temporary processing area
```

#### Step 2: Parallel Collection Batches

**Integração com ETL Data Collector**

- O MMOS delega a coleta paralela para o pack `etl-data-collector`.
- Arquivo de integração: `expansion-packs/etl-data-collector/config/integration-mm.yaml`.
- Execute via `ParallelCollector` para aproveitar checkpoint/resume, métricas e relatórios.
- Comando base (ETL adiciona subdiretórios automaticamente: blogs/, youtube/, pdf/):
  ```bash
  cd expansion-packs/etl-data-collector
  node run-collection.js \
    ../../squads/mmos-squad/minds/{mind}/sources/tier1_batch.yaml \
    ../../squads/mmos-squad/minds/{mind}/sources \
    ./config/download-rules.yaml
  ```
  **IMPORTANTE:** O outputDir deve ser `sources/`, NÃO `sources/downloads/`
  Os collectors adicionam subdirectórios automaticamente (blogs/, youtube/, pdf/)
- Certifique-se de exportar as variáveis sensíveis (AssemblyAI, Twitter, Reddit).
- Após a execução, gera relatório em `docs/logs/{timestamp}-collection-report.json`

**Execute collection em lotes com paralelização:**

**Batch 1 (Critical - Tier 1 sources):**
```yaml
batch_1:
  sources: [{{priority_rank_1-5}}]
  parallelization: yes
  max_concurrent: 3

  collection_methods:
    books:
      - Download if digital
      - OCR if physical scan available
      - Extract key excerpts at minimum

    official_content:
      - Download full text/transcript
      - Preserve metadata
      - Note publication context
```

**Execute:** Collect all Batch 1 sources in parallel.

**Batch 2 (Important - High Tier 2 sources):**
```yaml
batch_2:
  sources: [{{priority_rank_6-15}}]
  parallelization: yes
  max_concurrent: 5

  collection_methods:
    interviews:
      - Get transcript if available
      - Note video/audio timestamps
      - Extract key quotes

    long_form_articles:
      - Save full text
      - Capture publication date/context
      - Note author credibility
```

**Execute:** Collect all Batch 2 sources in parallel.

**Batch 3 (Nice-to-have - Tier 2/3 sources):**
```yaml
batch_3:
  sources: [{{priority_rank_16+}}]
  parallelization: yes
  max_concurrent: 10

  collection_methods:
    social_media:
      - Collect curated threads/posts
      - Focus on substantive content
      - Skip low-signal noise

    secondary_sources:
      - Collect if time permits
      - Use for triangulation only
```

**Execute:** Collect Batch 3 sources in parallel.

#### Step 3: Quality Control During Collection

For each collected source:

```yaml
source_validation:
  completeness_check:
    - Full text captured: {{yes/no}}
    - Metadata complete: {{yes/no}}
    - Attribution clear: {{yes/no}}

  authenticity_verification:
    - Confirmed author: {{yes/no}}
    - Publication verified: {{yes/no}}
    - Unmodified content: {{yes/no}}

  processing_status:
    - Cleaned and formatted: {{yes/no}}
    - Organized into correct directory: {{yes/no}}
    - Ready for analysis: {{yes/no}}
```

#### Step 4: Progress Tracking

**Live progress indicator:**

```
COLLECTION PROGRESS
===================
Batch 1 (Critical): [████████████████████] 5/5 complete ✓
Batch 2 (Important): [████████████░░░░░░░░] 8/10 in progress...
Batch 3 (Nice-to-have): [░░░░░░░░░░░░░░░░░░░░] 0/15 queued

Current: Collecting "Interview with {mind} on {topic}" (45% done)
Total Progress: 13/30 sources (43%)
```

#### Step 5: Validate Minimum Requirements

After collection complete:

```yaml
minimum_requirements_validation:
  total_sources_collected: {{count}}
  target: 15
  status: {{PASS/FAIL}}

  high_confidence_sources: {{count}}
  target: 5
  status: {{PASS/FAIL}}

  source_type_diversity: {{count}} types
  target: 3
  status: {{PASS/FAIL}}

  temporal_coverage: {{years}} years
  target: "2+ time periods"
  status: {{PASS/FAIL}}
```

**If FAIL on critical requirements:**
Present to user:
```
⚠️ MINIMUM REQUIREMENTS NOT MET

Current Status:
- Total sources: {{count}}/15 {{status}}
- High confidence: {{count}}/5 {{status}}
- Type diversity: {{count}}/3 {{status}}

Options:
1. CONTINUE ANYWAY - Proceed with limited sources (may impact fidelity)
2. PAUSE FOR MANUAL COLLECTION - Stop for user to gather more sources
3. REVISE VIABILITY - Reconsider if mind is truly viable

Type 1, 2, or 3:
```

### Mode: Master Compilation

#### Step 1: Generate Comprehensive Inventory

Create `sources_master.yaml`:

```yaml
sources_master:
  mind_name: "{{name}}"
  compilation_date: "{{timestamp}}"

  metadata:
    total_sources: {{count}}
    sources_by_tier:
      tier_1: {{count}}
      tier_2: {{count}}
      tier_3: {{count}}
    sources_by_type:
      books: {{count}}
      interviews: {{count}}
      articles: {{count}}
      videos: {{count}}
      social: {{count}}
      courses: {{count}}
    temporal_span: "{{earliest}} to {{latest}}"

  sources:
    - id: source_001
      title: "{{title}}"
      type: {{type}}
      tier: {{1/2/3}}
      path: "minds/{mind}/sources/{type}/{filename}"
      url: "{{if_available}}"
      publication_date: "{{date}}"
      word_count: {{approximate}}
      key_topics: [{{topics}}]
      notes: "{{any_important_context}}"

    - id: source_002
      [... repeat for all sources ...]

  analysis_readiness:
    layer_1_behavioral: "{{adequate/limited}}"
    layer_2_communication: "{{adequate/limited}}"
    layer_3_routine: "{{adequate/limited}}"
    layer_4_recognition: "{{adequate/limited}}"
    layer_5_mental_models: "{{adequate/limited}}"
    layer_6_values: "{{adequate/limited}}"
    layer_7_obsessions: "{{adequate/limited}}"
    layer_8_paradoxes: "{{adequate/limited}}"

  recommendations_for_analysis:
    strongest_sources_for_deep_layers: [{{source_ids}}]
    triangulation_opportunities: "{{where_multiple_sources_cover_same_topic}}"
    gap_areas: [{{if_any}}]

  collection_statistics:
    total_collection_time: "{{hours}} hours"
    parallel_efficiency: "{{percentage}}% time saved vs sequential"
    issues_encountered: [{{if_any}}]
```

#### Step 2: Generate ETL Q&A Dataset (Optional)

If specified in PRD, generate Q&A dataset for fine-tuning:

```yaml
qa_dataset_generation:
  mode: etl
  sources: [{{all_sources}}]
  output_format: jsonl

  extraction_strategy:
    - Extract explicit Q&A (if interviews)
    - Generate Q&A from key passages
    - Create Q&A from frameworks

  output: "minds/{mind}/kb/qa_dataset.jsonl"

  sample_format:
    - question: "{{derived_question}}"
      answer: "{{extracted_answer}}"
      source: "{{source_id}}"
      confidence: {{high/medium/low}}
```

#### Step 3: Validate Analysis Readiness

**Checklist:**

```yaml
analysis_readiness_checklist:
  - item: "Minimum 15 sources collected"
    status: {{pass/fail}}

  - item: "At least 5 Tier 1 (high-confidence) sources"
    status: {{pass/fail}}

  - item: "At least 3 different source types"
    status: {{pass/fail}}

  - item: "Temporal coverage spans 2+ time periods"
    status: {{pass/fail}}

  - item: "Sources organized and accessible"
    status: {{pass/fail}}

  - item: "sources_master.yaml complete and valid"
    status: {{pass/fail}}

  - item: "Adequate coverage for all 8 layers"
    status: {{pass/fail}}

  overall_status: {{READY / NOT_READY / PROCEED_WITH_CAUTION}}
```

**If READY:** Proceed to Phase 3 (Cognitive Analysis)

**If NOT_READY:** Present issues and options to user

**If PROCEED_WITH_CAUTION:** Flag limitations for consideration

### Mode: Full (Discovery → Collection → Master Compilation)

**Execute complete research phase:**

1. Run Discovery mode
2. Present discovery report to user (optional human checkpoint)
3. Run Collection mode with parallel batches
4. Run Master Compilation mode
5. Present final sources_master.yaml summary
6. Confirm readiness for Phase 3 (Analysis)

## Outputs

### Discovery Mode Output
- `minds/{mind}/docs/logs/{timestamp}-discovery-report.yaml`

### Collection Mode Outputs
- `minds/{mind}/sources/{type}/*` - All collected source files
- `minds/{mind}/docs/logs/{timestamp}-temporal-context.yaml`
- `minds/{mind}/docs/logs/{timestamp}-priority-matrix.yaml`
- `minds/{mind}/docs/logs/{timestamp}-collection-report.yaml`

### Master Compilation Mode Outputs
- `minds/{mind}/sources/sources_master.yaml`
- `minds/{mind}/kb/qa_dataset.jsonl` (if ETL Q&A enabled)

### Full Mode Outputs
All of the above outputs

## Validation Criteria

Research collection is successful when:

- [ ] **Discovery complete**: All available sources identified and cataloged
- [ ] **Priority matrix generated**: Sources ranked by confidence, depth, recency, accessibility
- [ ] **Parallel collection executed**: Batches collected efficiently with progress tracking
- [ ] **Minimum requirements met**: ≥15 sources, ≥5 Tier 1, ≥3 types, 2+ time periods
- [ ] **Quality validation passed**: All sources authenticated and properly formatted
- [ ] **Organization complete**: Sources in correct directories with clear structure
- [ ] **sources_master.yaml generated**: Complete inventory with metadata
- [ ] **Analysis readiness confirmed**: Coverage adequate for all 8 DNA Mental layers
- [ ] **Ready for Phase 3**: User approval to proceed to cognitive analysis

## Integration with AIOS

### Memory Layer Integration

```typescript
memory.store({
  collection: 'mmos_research',
  document: {
    mind_name: '{{mind}}',
    sources_collected: {{count}},
    collection_date: '{{timestamp}}',
    tier_1_count: {{count}},
    analysis_ready: {{boolean}}
  }
});
```

### Agent Coordination
- **@analyst**: Executes discovery and collection
- **@research-specialist**: Handles specialized source types
- **@mind-pm**: Validates requirements, updates TODO

### Performance Optimization

**Parallelization benefits:**
- Sequential collection: ~8-12 hours
- Parallel collection: ~3-5 hours (60% faster)
- Token efficiency: Batch processing reduces redundant context loading

**Resource estimates:**
- Discovery phase: 30-45 minutes, 20K tokens
- Collection phase: 3-5 hours, 200K tokens
- Master compilation: 30 minutes, 30K tokens
- Total: 4-6 hours, 250K tokens

### Error Handling

```yaml
error_scenarios:
  source_unavailable:
    action: "Flag as missing, note in sources_master, continue"

  authentication_required:
    action: "Document access requirement, alert user"

  quality_insufficient:
    action: "Flag as Tier 3, use only for triangulation"

  minimum_not_met:
    action: "Present options: continue/pause/revise"
```

## Notes

- **Parallel collection is key efficiency**: 60% time savings over sequential
- **Tier 1 sources are critical**: Quality over quantity for deep layers
- **Temporal coverage matters**: Need evolution over time for authentic cloning
- **Don't skip validation**: Poor source quality = poor clone fidelity
- **sources_master.yaml is the source of truth**: All analysis phases reference this
- **Gap documentation is important**: Knowing what's missing guides analysis
- **ETL Q&A is optional**: Only generate if fine-tuning is the deployment strategy

---

**Task Version:** 3.0
**Last Updated:** 2025-10-06
