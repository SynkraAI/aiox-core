# Workflow: Phase 2 - Interactive App Builder

**Workflow ID:** knowledge-base-builder/phase2-app-builder
**Version:** 1.0.0
**Status:** Production Ready
**Created:** 2026-02-13
**Total Lines:** 450+

---

## Executive Summary

Phase 2 transforms the validated Phase 1 knowledge base into two deployable interactive applications: a Next.js web app and an Obsidian vault. This phase can ONLY execute after Phase 1 is validated and approved by the user.

**Timeline:** 2-4 hours
**Agents Involved:** 3 (app-architect, quality-validator, kb-chief)
**Prerequisite:** Phase 1 knowledge base validated and approved

---

## Preconditions

```yaml
preconditions:
  phase_1_complete: true
  phase_1_quality_score: ">= 7.0"
  phase_1_user_approved: true
  required_data:
    - "data/concepts.json"
    - "data/taxonomy.json"
    - "data/graph.json"
    - "data/sources.json"
    - "data/link-database.json"
    - "data/cross-references.json"
```

---

## Input Specification

```yaml
input:
  knowledge_base_path:
    title: "Path to Phase 1 knowledge base output"
    format: "Absolute file path"
    required: true

  options:
    nextjs:
      enabled: true
      deployment: "local"          # local | vercel | static | docker
      theme: "default"             # default | dark | light
      features:
        search: true
        graph_view: true
        progress_tracking: true
        quizzes: true
        personal_notes: true
        learning_paths: true
        export: true
        source_linking: true

    obsidian:
      enabled: true
      plugins:
        dataview: true
        templater: true
        graph_analysis: false      # Optional, enhances graph
        spaced_repetition: false   # Optional, for quiz-like review
      publish: false               # Generate Obsidian Publish config
```

---

## Pipeline Stages

### Stage 1: Shared Data Layer Generation

**Agent:** app-architect
**Duration:** 10-15 minutes

```
[Load Phase 1 Data]
  concepts.json + taxonomy.json + graph.json + sources.json + link-database.json
  |
  v
[Generate Search Index]
  Fuse.js-compatible index with weighted fields
  Fields: name (0.4), definition (0.3), keywords (0.2), tags (0.1)
  Output: search-index.json
  |
  v
[Generate Graph Data]
  D3.js/vis-network compatible format
  Nodes: concepts (id, name, category, difficulty, size)
  Edges: relationships (source, target, type, weight)
  Output: graph-visualization.json
  |
  v
[Generate Learning Paths Data]
  Ordered concept sequences following prerequisite chains
  Multiple paths: by difficulty, by topic, by use case
  Output: learning-paths.json
  |
  v
[Generate Quiz Data]
  Auto-generated questions from concept definitions + relationships
  Types: multiple choice, true/false, fill-in-the-blank
  Output: quizzes.json
  |
  v
OUTPUT: Shared data layer ready for both stacks
```

---

### Stage 2: Next.js Application Generation

**Agent:** app-architect
**Duration:** 45-90 minutes
**Condition:** nextjs.enabled == true

```
[Scaffold Next.js Project]
  npx create-next-app@latest with:
  - TypeScript
  - Tailwind CSS v4
  - App Router
  - ESLint
  |
  v
[Generate Core Pages]
  app/
    page.tsx                    # Landing/dashboard
    concepts/page.tsx           # Browse all concepts (filterable grid)
    concepts/[slug]/page.tsx    # Concept detail view
    topics/page.tsx             # Browse by topic hierarchy
    topics/[slug]/page.tsx      # Topic detail with concepts
    search/page.tsx             # Full search with facets
    graph/page.tsx              # Interactive concept graph
    paths/page.tsx              # Learning paths index
    paths/[slug]/page.tsx       # Step-by-step learning path
    quiz/page.tsx               # Quiz selection
    quiz/[slug]/page.tsx        # Interactive quiz
    sources/page.tsx            # Browse source materials
    sources/[slug]/page.tsx     # Source detail (linked concepts)
  |
  v
[Generate Components]
  components/
    layout/
      Sidebar.tsx               # Navigation sidebar with taxonomy
      Header.tsx                # Search bar + user menu
      Breadcrumb.tsx            # Category breadcrumb
    concept/
      ConceptCard.tsx           # Concept preview card
      ConceptDetail.tsx         # Full concept view
      DefinitionBlock.tsx       # Definition with source citation
      RelationshipPanel.tsx     # Mini-graph of connected concepts
      SourceCitation.tsx        # Clickable source reference
    graph/
      KnowledgeGraph.tsx        # D3.js interactive graph
      GraphControls.tsx         # Filters, zoom, layout controls
    search/
      SearchBar.tsx             # Full-text search input
      SearchResults.tsx         # Results with highlights
      FacetFilters.tsx          # Category, difficulty, type filters
    learning/
      ProgressBar.tsx           # Learning progress indicator
      LearningPath.tsx          # Sequential path navigation
      QuizQuestion.tsx          # Interactive quiz component
    notes/
      PersonalNote.tsx          # Per-concept note editor
  |
  v
[Generate Data Layer]
  lib/
    data.ts                     # JSON data loading utilities
    search.ts                   # Fuse.js search configuration
    progress.ts                 # localStorage progress tracking
    graph.ts                    # Graph data transformation
  |
  v
[Copy Data Files]
  public/data/
    concepts.json
    taxonomy.json
    graph-visualization.json
    search-index.json
    learning-paths.json
    quizzes.json
  |
  v
[Build Verification]
  npm install && npm run build
  Verify: zero errors, zero TypeScript issues
  |
  v
OUTPUT: Deployable Next.js application
```

**Components Detail:**

| Component | Functionality |
|-----------|--------------|
| ConceptDetail | Definition, key points, relationships, sources, notes |
| KnowledgeGraph | Force-directed graph, click to navigate, filter by category |
| SearchBar + Results | Fuzzy search, faceted filtering, highlighted matches |
| LearningPath | Step-by-step progression, checkmark completed concepts |
| QuizQuestion | Multiple choice with immediate feedback + source link |
| PersonalNote | Textarea per concept, saved in localStorage |
| SourceCitation | Clickable link showing file name, page/timestamp |

---

### Stage 3: Obsidian Vault Generation

**Agent:** app-architect
**Duration:** 20-40 minutes
**Condition:** obsidian.enabled == true

```
[Generate Vault Structure]
  vault/
    Concepts/                   # One note per concept
    Topics/                     # Topic overview notes (MOC)
    Sources/                    # Source reference notes
    Learning Paths/             # Sequential guides
    Quizzes/                    # Practice questions
    Templates/                  # Note templates
  |
  v
[Generate Concept Notes]
  For each concept:
    - YAML frontmatter (id, aliases, tags, category, difficulty, status)
    - Definition section
    - Key points
    - Related concepts as wikilinks ([[Concept Name]])
    - Examples with source citations
    - Source references as wikilinks ([[Sources/source-name|page]])
    - Personal notes section
  |
  v
[Generate Topic Notes (Maps of Content)]
  For each taxonomy category:
    - Overview of the topic
    - List of concepts as wikilinks
    - Sub-topics as nested sections
    - Difficulty progression within topic
  |
  v
[Generate Source Notes]
  For each source document:
    - File metadata (format, pages/duration, path)
    - List of concepts extracted from this source
    - Key passages with block references
  |
  v
[Generate Special Notes]
  - Index.md: Master MOC with links to all topics
  - Glossary.md: A-Z with concept wikilinks
  - Dashboard.md: Dataview queries for stats and progress
  - Learning paths as sequential notes
  - Quiz notes with checkboxes
  |
  v
[Generate Templates]
  Templates/
    concept-template.md         # For adding new concepts
    topic-template.md           # For adding new topics
    source-template.md          # For adding new sources
  |
  v
[Generate Obsidian Config]
  .obsidian/
    app.json                    # Core settings (live preview, tabs)
    appearance.json             # Theme settings
    graph.json                  # Graph view color groups
    community-plugins.json      # Recommended plugins list
  |
  v
OUTPUT: Ready-to-use Obsidian vault
```

**Obsidian-Specific Features:**

| Feature | Implementation |
|---------|---------------|
| Graph View | Tags as color groups, folder groups, depth control |
| Search | Native Obsidian search + Dataview TABLE queries |
| Progress | Checkbox properties (`completed: true/false`) + Dataview count |
| Quizzes | Callout blocks with hidden answers (toggle) |
| Notes | Direct editing in any note |
| Learning Paths | Sequential notes with next/previous links |
| Source Links | Wikilinks: `[[Sources/textbook-ch3\|p.12]]` |
| Export | Native Obsidian export (PDF, MD) |

---

### Stage 4: Validation & Delivery

**Agent:** quality-validator -> kb-chief
**Duration:** 10-15 minutes

```
[Quality Validator: Phase 2 Checks]
  Next.js checks (KB-APP-001 to KB-APP-007):
    - Build succeeds
    - Search returns relevant results
    - Source links resolve
    - Graph renders correctly
    - Progress tracking works

  Obsidian checks (KB-OBS-001 to KB-OBS-006):
    - Vault opens without errors
    - Wikilinks resolve (>= 95%)
    - Frontmatter valid
    - Graph shows connections
    - Dataview queries work
  |
  v
[Score Calculation]
  Phase 2 score = 0.6 * Phase1_score + 0.2 * NextJS_score + 0.2 * Obsidian_score
  |
  v
[KB Chief: Final Delivery]
  Present to user:
  - Complete quality report
  - Instructions for both stacks
  - Known limitations
  - Improvement suggestions
```

---

## Deployment Instructions (Generated in Output)

### Next.js Local Development
```bash
cd {output_path}/app
npm install
npm run dev
# Open http://localhost:3000
```

### Next.js Production Build
```bash
cd {output_path}/app
npm run build
npm start
```

### Next.js Vercel Deploy
```bash
cd {output_path}/app
npx vercel
```

### Obsidian Local
```
1. Open Obsidian
2. "Open folder as vault"
3. Select: {output_path}/obsidian-vault/
4. Install recommended community plugins when prompted
```

---

## Quality Gates

| Gate | Criteria | Severity |
|------|----------|----------|
| QG-BUILD | Next.js `npm run build` exits 0 | BLOCKING |
| QG-SEARCH | 5 sample queries return relevant results | BLOCKING |
| QG-GRAPH | Graph renders with correct node count | BLOCKING |
| QG-LINKS | 100% source links resolve | BLOCKING |
| QG-VAULT | Obsidian opens vault without errors | BLOCKING |
| QG-WIKI | >= 95% wikilinks resolve | BLOCKING |
| QG-RESPONSIVE | Core pages pass 375px viewport | WARNING |
| QG-DATAVIEW | Dashboard queries return data | WARNING |

---

## Error Recovery

| Failure | Recovery |
|---------|----------|
| Build fails | Check TypeScript errors, fix and rebuild |
| Missing data files | Re-copy from Phase 1 data directory |
| Graph empty | Verify graph-visualization.json has nodes/edges |
| Search broken | Rebuild search index, verify Fuse.js config |
| Wikilinks broken | Re-run vault generation from link-database.json |
| Plugin errors | Remove problematic plugin, use core features only |
