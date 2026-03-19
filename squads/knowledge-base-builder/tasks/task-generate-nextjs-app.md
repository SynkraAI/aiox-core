# Task: Generate Next.js App

**Task ID:** knowledge-base-builder/generate-nextjs-app
**Version:** 1.0.0
**Status:** Production Ready
**Created:** 2026-02-13
**Category:** Phase 2 - App Generation

---

## Executive Summary

This task generates a complete, deployable Next.js web application from the Phase 1 knowledge base data. The app includes advanced search, concept graph visualization, progress tracking, quizzes, personal notes, learning paths, and full source linking.

**Workflow Position:** Step 2.1a of Phase 2 (parallel with Obsidian generation)
**Success Definition:** App builds successfully, all features functional
**Output Quality Gate:** KB-APP-001 to KB-APP-007

---

## Executor Type

**Agent (100%)**
- Agent generates all code, components, and configuration

---

## Inputs

```yaml
knowledge_base_path:
  field: "Path to Phase 1 knowledge base"
  format: "Absolute file path"
  required: true

options:
  deployment: "local"
  theme: "default"
  features:
    search: true
    graph_view: true
    progress_tracking: true
    quizzes: true
    personal_notes: true
    learning_paths: true
    export: true
    source_linking: true
```

---

## Action Items

### Step 1: Project Scaffolding
1. Create Next.js project with TypeScript, Tailwind CSS v4, App Router
2. Install dependencies:
   - fuse.js (search)
   - d3 or vis-network (graph)
   - gray-matter (markdown parsing)
   - zustand (state management)
   - lucide-react (icons)
3. Configure TypeScript paths and module aliases

### Step 2: Data Layer Setup
1. Copy JSON data files to `public/data/`
2. Create data loading utilities in `lib/data.ts`
3. Create TypeScript types from JSON schemas in `lib/types.ts`
4. Create search configuration in `lib/search.ts`
5. Create progress tracking in `lib/progress.ts` (localStorage-based)

### Step 3: Layout and Navigation
1. Create app layout with:
   - Responsive sidebar with taxonomy hierarchy
   - Top header with search bar
   - Breadcrumb navigation
   - Mobile hamburger menu
2. Configure routes matching taxonomy structure

### Step 4: Core Pages
1. **Dashboard** (`/`): Overview with stats, recent activity, progress
2. **Concepts Browse** (`/concepts`): Filterable grid of concept cards
3. **Concept Detail** (`/concepts/[slug]`): Full concept view with all sections
4. **Topics Browse** (`/topics`): Taxonomy tree navigation
5. **Topic Detail** (`/topics/[slug]`): Topic overview with concept list
6. **Search** (`/search`): Full search interface with faceted filters
7. **Graph** (`/graph`): Interactive concept graph
8. **Learning Paths** (`/paths`): Path selection and progress
9. **Quiz** (`/quiz`): Quiz selection and interactive questions
10. **Sources** (`/sources`): Browse original materials

### Step 5: Feature Components
1. **ConceptCard**: Preview card with name, category, difficulty badge
2. **ConceptDetail**: Definition, relationships panel, sources, notes
3. **KnowledgeGraph**: D3.js force-directed graph with filters
4. **SearchBar + Results**: Fuzzy search with highlighted matches
5. **FacetFilters**: Category, difficulty, type filter panels
6. **LearningPath**: Sequential navigation with progress checkmarks
7. **QuizQuestion**: Interactive question with instant feedback
8. **PersonalNote**: Per-concept text area (localStorage)
9. **SourceCitation**: Clickable source link with context

### Step 6: Build and Verify
1. Run `npm run build` -- must exit with 0
2. Run `npm run lint` -- must have zero errors
3. Verify: app starts with `npm run dev`
4. Spot-check: search returns results, graph renders, links work

---

## Output

```yaml
output:
  app_directory:
    path: "{output_path}/app/"
    contains:
      - "package.json"
      - "tsconfig.json"
      - "tailwind.config.ts"
      - "next.config.ts"
      - "src/app/ (all pages)"
      - "src/components/ (all components)"
      - "src/lib/ (data layer)"
      - "public/data/ (JSON data files)"
```

---

## Acceptance Criteria

- [ ] `npm run build` exits 0 (no errors)
- [ ] Zero TypeScript errors
- [ ] Search returns relevant results for sample queries
- [ ] Graph renders with correct number of nodes and edges
- [ ] Source links navigate to source detail pages
- [ ] Progress tracking persists across page refreshes
- [ ] Mobile-responsive (375px viewport test)
- [ ] All routes resolve without 404
