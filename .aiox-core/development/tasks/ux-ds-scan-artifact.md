# Design System Artifact Scanner

> **Task ID:** ux-ds-scan-artifact
> **Agent:** UX-Design Expert
> **Phase:** Universal (works with any phase)
> **Interactive:** Yes (elicit=true)

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
task: uxDsScanArtifact()
responsável: Uma (Empathizer)
responsavel_type: Agente
atomic_layer: Strategy

**Entrada:**
- campo: task
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Must be registered task

- campo: parameters
  tipo: object
  origem: User Input
  obrigatório: false
  validação: Valid task parameters

- campo: mode
  tipo: string
  origem: User Input
  obrigatório: false
  validação: yolo|interactive|pre-flight

**Saída:**
- campo: execution_result
  tipo: object
  destino: Memory
  persistido: false

- campo: logs
  tipo: array
  destino: File (.ai/logs/*)
  persistido: true

- campo: state
  tipo: object
  destino: State management
  persistido: true
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Task is registered; required parameters provided; dependencies met
    tipo: pre-condition
    blocker: true
    validação: |
      Check task is registered; required parameters provided; dependencies met
    error_message: "Pre-condition failed: Task is registered; required parameters provided; dependencies met"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Task completed; exit code 0; expected outputs created
    tipo: post-condition
    blocker: true
    validação: |
      Verify task completed; exit code 0; expected outputs created
    error_message: "Post-condition failed: Task completed; exit code 0; expected outputs created"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Task completed as expected; side effects documented
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert task completed as expected; side effects documented
    error_message: "Acceptance criterion not met: Task completed as expected; side effects documented"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** task-runner
  - **Purpose:** Task execution and orchestration
  - **Source:** .aiox-core/core/task-runner.js

- **Tool:** logger
  - **Purpose:** Execution logging and error tracking
  - **Source:** .aiox-core/utils/logger.js

---

## Scripts

**Agent-specific code for this task:**

- **Script:** execute-task.js
  - **Purpose:** Generic task execution wrapper
  - **Language:** JavaScript
  - **Location:** .aiox-core/scripts/execute-task.js

---

## Error Handling

**Strategy:** retry

**Common Errors:**

1. **Error:** Task Not Found
   - **Cause:** Specified task not registered in system
   - **Resolution:** Verify task name and registration
   - **Recovery:** List available tasks, suggest similar

2. **Error:** Invalid Parameters
   - **Cause:** Task parameters do not match expected schema
   - **Resolution:** Validate parameters against task definition
   - **Recovery:** Provide parameter template, reject execution

3. **Error:** Execution Timeout
   - **Cause:** Task exceeds maximum execution time
   - **Resolution:** Optimize task or increase timeout
   - **Recovery:** Kill task, cleanup resources, log state

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
  - automation
  - workflow
updated_at: 2025-11-17
```

---


## 📋 Description

Analyze HTML/React artifacts (files, screenshots, or live URLs) to extract design patterns, components, and design tokens. Automatically detect atoms, molecules, organisms following Atomic Design methodology. Generate component build suggestions and design system recommendations.

---

## 🎯 Objectives

- Scan existing UI artifacts for design patterns
- Extract components at atomic, molecular, and organism levels
- Identify design tokens (colors, typography, spacing, etc.)
- Generate component build recommendations
- Provide design system migration path

---

## 📊 Supported Artifact Types

### Type 1: HTML Files
**Format:** .html, .htm
**Analysis:** Parse DOM, extract styles, identify components
**Speed:** Fast (< 5 seconds)

### Type 2: React Components
**Format:** .jsx, .tsx, .js with JSX
**Analysis:** AST parsing, prop extraction, component structure
**Speed:** Fast (< 10 seconds)

### Type 3: Screenshots
**Format:** .png, .jpg, .jpeg
**Analysis:** Visual pattern recognition (requires AI vision)
**Speed:** Moderate (10-30 seconds)

### Type 4: Live URLs
**Format:** https://example.com
**Analysis:** Fetch + parse, full DOM analysis
**Speed:** Moderate (15-45 seconds depending on page)

---

## 🔄 Workflow

### Step 1: Specify Artifact
**Interactive Elicitation:**

```
What type of artifact do you want to scan?

1. HTML file (local path)
2. React component file (.jsx/.tsx)
3. Screenshot image (.png/.jpg)
4. Live website URL

Your selection: _____

Provide the path or URL:
Your input: _____
```

---

### Step 2: Scan & Parse Artifact

**HTML/React Parsing:**
1. Load file content
2. Parse DOM/AST structure
3. Extract all elements with attributes
4. Identify unique patterns
5. Group similar elements

**Screenshot Analysis:**
1. Load image
2. Detect UI regions (header, content, footer)
3. Identify buttons, inputs, cards, etc.
4. Extract color palette
5. Measure spacing patterns

**Live URL Fetching:**
1. Fetch page HTML
2. Download inline styles
3. Parse external CSS (if accessible)
4. Extract computed styles
5. Identify interactive components

---

### Step 3: Extract Design Tokens

**Color Tokens:**
```
colors:
  primary:
    - "#3B82F6" (used 42 times)
    - "#2563EB" (used 18 times)
  secondary:
    - "#10B981" (used 23 times)
  neutral:
    - "#F3F4F6" (used 67 times - backgrounds)
    - "#6B7280" (used 45 times - text)
    - "#1F2937" (used 38 times - headings)
  accent:
    - "#F59E0B" (used 12 times)
```

**Typography Tokens:**
```
typography:
  fontFamilies:
    - "Inter, sans-serif" (primary)
    - "JetBrains Mono, monospace" (code)
  fontSizes:
    - 12px (labels, captions)
    - 14px (body text) ← most common
    - 16px (default)
    - 20px (h3)
    - 24px (h2)
    - 32px (h1)
  fontWeights:
    - 400 (regular)
    - 500 (medium)
    - 600 (semibold)
    - 700 (bold)
```

**Spacing Tokens:**
```
spacing:
  scale: [4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px]
  common_patterns:
    - Buttons: 8px vertical, 16px horizontal padding
    - Cards: 16px padding, 16px gap between
    - Sections: 32px vertical spacing
    - Page margins: 24px mobile, 48px desktop
```

**Border Radius Tokens:**
```
borderRadius:
  - 0px (sharp edges - 15% of components)
  - 4px (slight rounding - 60% of components) ← default
  - 8px (rounded - 20% of components)
  - 9999px (fully rounded - 5% of components)
```

**Shadow Tokens:**
```
shadows:
  - none (flat design)
  - sm: "0 1px 2px rgba(0,0,0,0.05)"
  - md: "0 4px 6px rgba(0,0,0,0.1)" ← most common
  - lg: "0 10px 15px rgba(0,0,0,0.1)"
```

---

### Step 4: Identify Components (Atomic Design)

**Atoms (Fundamental Building Blocks):**
```
atoms:
  - Button
    variants: [primary, secondary, outline, ghost]
    count: 47 instances
    styles: {padding: 8px 16px, borderRadius: 4px, ...}

  - Input
    types: [text, email, password, number, search]
    count: 23 instances
    styles: {height: 40px, border: 1px solid #D1D5DB, ...}

  - Label
    count: 31 instances
    styles: {fontSize: 14px, fontWeight: 500, ...}

  - Icon
    set: [check, x, chevron-down, search, user, settings]
    count: 89 instances
    size: 16px, 20px, 24px

  - Badge
    count: 12 instances
    variants: [success, warning, error, info]
```

**Molecules (Simple Combinations):**
```
molecules:
  - FormField (Label + Input + Helper Text)
    count: 18 instances
    pattern: Vertical stack with 4px gap

  - SearchBar (Input + Icon + Optional Button)
    count: 3 instances
    pattern: Horizontal flex with icon prefix

  - Card (Border + Padding + Shadow)
    count: 24 instances
    pattern: 16px padding, 8px borderRadius, md shadow

  - NavItem (Icon + Label + Optional Badge)
    count: 8 instances (in navigation)
    pattern: Horizontal flex, 12px gap

  - StatDisplay (Label + Number + Trend Icon)
    count: 6 instances (dashboard)
    pattern: Vertical stack, number emphasized
```

**Organisms (Complex Sections):**
```
organisms:
  - Header (Logo + Navigation + Search + Profile)
    count: 1 instance (global)
    complexity: HIGH

  - ProductCard (Image + Title + Description + Price + CTA)
    count: 16 instances (grid)
    complexity: MEDIUM

  - DataTable (Headers + Rows + Pagination + Actions)
    count: 2 instances
    complexity: HIGH

  - Modal (Overlay + Header + Body + Footer + Close)
    count: 3 instances (login, confirm, settings)
    complexity: MEDIUM

  - Form (Multiple Fields + Validation + Submit)
    count: 4 instances
    complexity: MEDIUM
```

---

### Step 5: Calculate Pattern Redundancy

**Redundancy Analysis:**
```
Pattern: Buttons
----
Total instances: 47
Unique variations: 12 (based on style clustering)
Optimal set: 3 (primary, secondary, outline)
Reduction: 75% (12 → 3)
Maintenance savings: 37.5 hours/month → 9.4 hours/month

Pattern: Colors
----
Total colors: 89 hex values
After clustering (5% HSL threshold): 18 distinct colors
Optimal token set: 12 tokens
Reduction: 86.5% (89 → 12)

Pattern: Spacing Values
----
Total unique values: 47 px values
After normalization to 4px scale: 12 values
Optimal set: 8 tokens (4, 8, 12, 16, 24, 32, 48, 64)
Reduction: 74.5% (47 → 12)
```

---

### Step 6: Generate Build Recommendations

**Component Priority Matrix:**
```
Priority: HIGH (Build First)
- Button (47 instances - most used)
- Input (23 instances - forms critical)
- Card (24 instances - content display)

Priority: MEDIUM (Build Second)
- FormField molecule (18 instances)
- Badge (12 instances - status display)
- Modal (3 instances but high complexity)

Priority: LOW (Build Last or Skip)
- Custom widgets (1-2 instances)
- Page-specific components
- One-off patterns
```

**Build Order Recommendation:**
```
Phase 1: Core Atoms (Week 1)
1. Button (all 4 variants)
2. Input (all 5 types)
3. Label
4. Icon set (12 icons)

Phase 2: Common Molecules (Week 2)
5. FormField (Label + Input + Helper)
6. Card
7. Badge
8. SearchBar

Phase 3: Complex Organisms (Week 3)
9. Header
10. Form (with validation)
11. Modal
12. DataTable

Phase 4: Page Templates (Week 4)
13. Dashboard template
14. Form page template
15. Detail page template
```

---

## 📤 Outputs

All artifacts saved to: `outputs/design-system/{project}/scan/`

### Required Files:
1. **scan-summary.md** - High-level findings
2. **design-tokens.yaml** - Extracted tokens (colors, typography, spacing)
3. **component-inventory.md** - List of components (Atomic Design)
4. **redundancy-analysis.md** - Pattern redundancy calculations
5. **build-recommendations.md** - Priority matrix and build order

### Optional Files:
6. **screenshots/** - Visual comparisons of patterns
7. **extracted-styles.css** - All CSS extracted from artifact
8. **comparison-matrix.xlsx** - Side-by-side pattern comparisons

---

## ✅ Success Criteria

- [ ] Artifact successfully scanned and parsed
- [ ] Design tokens extracted (colors, typography, spacing, etc.)
- [ ] Components identified at atomic, molecular, organism levels
- [ ] Pattern redundancy calculated with reduction percentages
- [ ] Build recommendations prioritized (HIGH/MEDIUM/LOW)
- [ ] Build order phases defined (1-4 weeks)
- [ ] All outputs saved to `outputs/design-system/{project}/scan/`
- [ ] `.state.yaml` updated with scan results

---

## 🔄 Integration with Other Tasks

**Works with any phase:**
- `*research` - Scan competitor sites for UX patterns
- `*wireframe` - Scan existing app to inventory current components
- `*audit` - Complement full codebase audit with specific artifact focus
- `*consolidate` - Use scan to inform consolidation decisions
- `*build` - Use component inventory to guide what to build

**State Management:**
Updates `.state.yaml` with:
- `artifact_scanned: {type, path}`
- `tokens_extracted: {colors, typography, spacing}`
- `components_found: [list of components]`
- `redundancy_metrics: {buttons, colors, spacing}`
- `scan_date: [ISO date]`

---

## 📚 Token Extraction Algorithms

### Color Clustering (HSL-based, 5% threshold)
```
Algorithm:
1. Extract all hex colors from artifact
2. Convert to HSL (Hue, Saturation, Lightness)
3. Cluster colors within 5% HSL distance
4. Select most-used color from each cluster as token
5. Name tokens by category (primary, secondary, neutral, accent)
```

### Spacing Normalization (4px base)
```
Algorithm:
1. Extract all px values from padding, margin, gap
2. Round to nearest 4px multiple
3. Count frequency of each value
4. Select top 8 most-used values as tokens
5. Name tokens: xs, sm, md, lg, xl, 2xl, 3xl
```

### Component Similarity Detection
```
Algorithm:
1. Extract element structure (tag + classes + children)
2. Extract styles (computed CSS)
3. Calculate similarity score (0-100%)
4. Group components with >85% similarity
5. Identify most common variant as base
```

---

## ⚠️ Limitations

### HTML/React Files:
- ✅ Can parse structure and styles
- ✅ Can extract inline and CSS classes
- ❌ Cannot see rendered visual (no browser)
- ❌ Cannot detect dynamic behavior

### Screenshots:
- ✅ Can see visual appearance
- ✅ Can detect colors and spacing
- ❌ Cannot extract code structure
- ❌ Cannot identify interactive states (hover, focus)

### Live URLs:
- ✅ Can fetch full page HTML
- ✅ Can extract all styles
- ❌ May be blocked by CORS/auth
- ❌ Cannot access private pages without login

---

## 🎯 Example Output

**Example: Scan Result for Dashboard**

```markdown
# Scan Summary: Dashboard Page

**Artifact:** https://example.com/dashboard
**Scanned:** 2025-11-12 14:35
**Page Complexity:** MEDIUM (47 components, 3 levels deep)

## Design Tokens Extracted
- **Colors:** 18 distinct colors → 12 tokens recommended
- **Typography:** 6 font sizes, 4 weights → Well-structured
- **Spacing:** 47 values → Normalize to 8 tokens
- **Border Radius:** 3 values (0px, 4px, 8px) → Already optimal

## Components Found (Atomic Design)
### Atoms (8 types, 147 instances)
- Button (47), Input (23), Label (31), Icon (89), Badge (12), ...

### Molecules (5 types, 42 instances)
- FormField (18), Card (24), SearchBar (3), NavItem (8), ...

### Organisms (4 types, 7 instances)
- Header (1), Form (4), Modal (3), DataTable (2)

## Redundancy Analysis
- **Buttons:** 75% reduction possible (12 variants → 3)
- **Colors:** 86.5% reduction possible (89 → 12)
- **Spacing:** 74.5% reduction possible (47 → 12)

## Build Recommendations
**Phase 1 (Week 1):** Button, Input, Label, Icon
**Phase 2 (Week 2):** FormField, Card, Badge
**Phase 3 (Week 3):** Header, Form, Modal
**Phase 4 (Week 4):** DataTable, Templates
```

---

**Created:** 2025-11-12
**Story:** 4.3 - UX-Design-Expert Merge
**Version:** 1.0.0
