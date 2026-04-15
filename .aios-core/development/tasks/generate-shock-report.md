# Generate Visual Shock Report

> Task ID: brad-generate-shock-report
> Agent: Brad (Design System Architect)
> Version: 2.0.0

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

## Task Definition (AIOS Task Format V1.0)

```yaml
task: generateShockReport()
responsavel: Brad (Design System Architect)
responsavel_type: Agente
atomic_layer: Strategy

**Entrada:**
- campo: audit_data
  tipo: object
  origem: File (pattern-inventory.json)
  obrigatorio: true
  validacao: Valid JSON with pattern counts and redundancy factors

- campo: consolidation_data
  tipo: object
  origem: File (consolidation-report.md)
  obrigatorio: false
  validacao: Consolidation metrics (optional, enriches report with before/after)

- campo: roi_data
  tipo: object
  origem: File (roi-analysis.md)
  obrigatorio: false
  validacao: ROI metrics (optional, adds cost analysis section)

- campo: template
  tipo: string
  origem: File (shock-report-tmpl.html)
  obrigatorio: false
  validacao: HTML template file. Falls back to built-in template if missing

**Saida:**
- campo: shock_report
  tipo: string
  destino: File (shock-report.html)
  persistido: true

- campo: metrics_summary
  tipo: object
  destino: Console output
  persistido: false
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Audit data (pattern-inventory.json) exists with valid pattern counts
    tipo: pre-condition
    blocker: true
    validacao: |
      Check pattern-inventory.json exists and contains patterns object with at least buttons or colors category
    error_message: "Pre-condition failed: Run *audit first to generate pattern data"

  - [ ] Output directory exists or is creatable
    tipo: pre-condition
    blocker: true
    validacao: |
      Check output directory exists or can be created with write permissions
    error_message: "Pre-condition failed: Cannot write to output directory"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Self-contained HTML report generated with all metric sections
    tipo: post-condition
    blocker: true
    validacao: |
      Verify shock-report.html exists, is valid HTML5, and contains no external resource links (self-contained)
    error_message: "Post-condition failed: Shock report not generated or has external dependencies"

  - [ ] Report contains pattern metrics with severity indicators
    tipo: post-condition
    blocker: true
    validacao: |
      Verify report contains metric cards with red/yellow/green severity for each pattern category
    error_message: "Post-condition failed: Report missing severity-coded metrics"

  - [ ] Top offenders section present with file-level data
    tipo: post-condition
    blocker: true
    validacao: |
      Verify report contains worst offenders table with file paths and duplicate counts
    error_message: "Post-condition failed: Worst offenders section missing"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Report is viewable in any modern browser without network access
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Assert HTML file has inline CSS/JS, no CDN links, no external font imports
    error_message: "Acceptance criterion not met: Report requires network access"

  - [ ] Consolidation potential percentage displayed prominently
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Assert consolidation potential metric exists as a percentage value in the executive summary
    error_message: "Acceptance criterion not met: Consolidation potential not displayed"

  - [ ] Visual horror show section renders pattern explosion
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Assert report contains a grid visualization showing actual pattern duplicates side-by-side
    error_message: "Acceptance criterion not met: Horror show section missing or empty"

  - [ ] File size under 1MB for easy sharing
    tipo: acceptance-criterion
    blocker: false
    validacao: |
      Assert generated HTML file is under 1MB
    error_message: "Warning: Report exceeds 1MB, may be difficult to share via email"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** file-system
  - **Purpose:** Read audit/consolidation/ROI data and write HTML report
  - **Source:** Node.js fs module

- **Tool:** code-analyzer
  - **Purpose:** Extract actual CSS examples from codebase for visual rendering
  - **Source:** .aios-core/utils/code-analyzer.js

---

## Scripts

**Agent-specific code for this task:**

- **Script:** generate-shock-report.js
  - **Purpose:** Metric calculation, severity assessment, and HTML report generation
  - **Language:** JavaScript
  - **Location:** .aios-core/scripts/generate-shock-report.js

---

## Error Handling

**Strategy:** fallback

**Common Errors:**

1. **Error:** Missing Audit Data
   - **Cause:** *audit was not run or output was deleted
   - **Resolution:** Run *audit to generate pattern-inventory.json
   - **Recovery:** Exit with instruction to run audit first

2. **Error:** Template Not Found
   - **Cause:** shock-report-tmpl.html missing from templates directory
   - **Resolution:** Use built-in default template (inline HTML generation)
   - **Recovery:** Generate report with fallback template, log warning

3. **Error:** No Visual Examples Extractable
   - **Cause:** Codebase uses non-standard patterns that cannot be rendered in HTML
   - **Resolution:** Use text descriptions and metric cards instead of visual previews
   - **Recovery:** Degrade gracefully to metrics-only report

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 3-8 min (estimated)
cost_estimated: $0.002-0.005
token_usage: ~1,500-5,000 tokens
```

**Optimization Notes:**
- Cache template compilation; single-pass metric calculation; lazy load visual examples

---

## Metadata

```yaml
story: N/A
version: 2.0.0
dependencies:
  - audit-codebase
tags:
  - design-system
  - reporting
  - visualization
  - stakeholder-communication
updated_at: 2026-04-10
```

---


## Description

Generate self-contained HTML report showing visual evidence of UI chaos with side-by-side comparisons, cost analysis, and "horror show" presentation designed to drive stakeholder action.

## Prerequisites

- Audit completed (*audit command run successfully)
- Consolidation data available (optional but recommended)
- ROI calculated (optional but recommended for full impact)

## Workflow

### Interactive Elicitation

This task uses interactive elicitation to customize shock report.

1. **Select Report Scope**
   - Full report (all patterns) or focused (top offenders only)
   - Include ROI section (requires *calculate-roi)
   - Include before/after preview
   - Target audience (engineers vs executives)

2. **Review Pattern Data**
   - Show which patterns will be visualized
   - Confirm most shocking examples selected
   - Ask for any patterns to highlight

3. **Configure Output**
   - HTML only or HTML + PDF export
   - Responsive design (mobile-viewable)
   - Color scheme (light/dark mode)

### Steps

1. **Load Audit and Consolidation Data**
   - Read .state.yaml for all pattern metrics
   - Load inventory, consolidation, ROI data if available
   - Validate data completeness
   - Validation: Sufficient data for report generation

2. **Extract Visual Examples**
   - Scan codebase for actual button implementations
   - Extract CSS for representative examples
   - Find most egregious duplicates
   - Capture top 10 worst offenders
   - Validation: Visual examples extracted

3. **Generate HTML Structure**
   - Create self-contained HTML (no external dependencies)
   - Embed CSS and minimal JavaScript
   - Responsive design (mobile to desktop)
   - Validation: Valid HTML5 structure

4. **Create "Horror Show" Section**
   - Display all button variations side-by-side
   - Show color palette explosion (89 colors in grid)
   - Visualize spacing inconsistencies
   - Make it visually overwhelming (intentional)
   - Validation: Visual impact maximized

5. **Add Metrics Dashboard**
   - Pattern count cards (before/after)
   - Reduction percentages with progress bars
   - Redundancy factors highlighted
   - Validation: Metrics clearly presented

6. **Generate Cost Analysis Section**
   - If ROI calculated, embed cost breakdown
   - Show monthly/annual waste
   - Display ROI metrics prominently
   - Include savings calculator widget
   - Validation: Financial impact clear

7. **Create Before/After Preview**
   - Show consolidated future state
   - Side-by-side comparison (47 buttons -> 3)
   - Highlight simplicity and consistency
   - Validation: Future state looks clean

8. **Add Executive Summary**
   - Top-of-page key findings
   - One-sentence problem statement
   - Three bullet point solution
   - Clear call-to-action
   - Validation: Executive-friendly intro

9. **Embed Interactive Elements**
   - Savings calculator (input team size, see ROI)
   - Pattern filter (show/hide categories)
   - Export to PDF button
   - Validation: Interactive elements functional

10. **Generate Report File**
    - Save as shock-report.html
    - Self-contained (works offline)
    - Optimized file size (<1MB)
    - Validation: File opens in all browsers

11. **Optional: Export to PDF**
    - If requested, generate PDF version
    - Preserve visual layout
    - Validation: PDF readable and printable

12. **Update State File**
    - Add shock_report section to .state.yaml
    - Record report location and generation time
    - Validation: State updated

## Output

- **shock-report.html**: Self-contained visual report
- **shock-report.pdf**: PDF version (optional)
- **.state.yaml**: Updated with report location

### Output Format

```html
<!DOCTYPE html>
<html>
<head>
  <title>UI Pattern Chaos Report</title>
  <style>
    /* Embedded CSS for self-contained report */
    body { font-family: system-ui; max-width: 1200px; margin: 0 auto; }
    .horror-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; }
    .metric-card { background: #f0f0f0; padding: 20px; border-radius: 8px; }
    .metric-value { font-size: 3rem; font-weight: bold; color: #dc2626; }
    .severity-red { border-left: 4px solid #dc2626; background: #fef2f2; }
    .severity-yellow { border-left: 4px solid #f59e0b; background: #fffbeb; }
    .severity-green { border-left: 4px solid #10b981; background: #ecfdf5; }
  </style>
</head>
<body>
  <header>
    <h1>UI Pattern Chaos Report</h1>
    <p class="subtitle">Generated by Brad | 2025-10-27</p>
  </header>

  <section class="executive-summary">
    <h2>Executive Summary</h2>
    <p><strong>Problem:</strong> 176 redundant UI patterns cost $457,200/year in maintenance.</p>
    <ul>
      <li>81.8% pattern reduction possible (176 -> 32)</li>
      <li>$374,400/year savings potential</li>
      <li>ROI breakeven in 10 days</li>
    </ul>
    <p><strong>Action:</strong> Approve design system implementation immediately.</p>
  </section>

  <section class="metrics">
    <h2>The Damage</h2>
    <div class="metric-cards">
      <div class="metric-card severity-red">
        <div class="metric-value">47</div>
        <div class="metric-label">Button Variations</div>
        <div class="metric-target">Target: 3</div>
      </div>
    </div>
  </section>

  <section class="horror-show">
    <h2>The Horror Show</h2>
    <div class="horror-grid">
      <!-- Actual pattern examples rendered inline -->
    </div>
  </section>

  <section class="future-state">
    <h2>The Solution</h2>
    <div class="clean-grid">
      <!-- Consolidated patterns shown clean -->
    </div>
  </section>
</body>
</html>
```

## Success Criteria

- [ ] Self-contained HTML (no external dependencies)
- [ ] Visual "horror show" section maximizes impact
- [ ] All pattern types visualized (buttons, colors, spacing)
- [ ] Cost analysis included (if ROI calculated)
- [ ] Before/after comparison shows consolidation benefit
- [ ] Executive summary is stakeholder-ready
- [ ] Report opens in all major browsers
- [ ] File size <1MB for easy sharing

## Error Handling

- **No audit data**: Exit with message to run *audit first
- **Missing visual examples**: Use text descriptions instead
- **Browser compatibility issues**: Fall back to simpler HTML
- **Large file size**: Reduce examples, compress images

## Security Considerations

- No external resources loaded (self-contained)
- Sanitize any user-provided text
- No code execution in report
- Safe to share via email or intranet

## Examples

### Example 1: Generate Shock Report

```bash
*shock-report
```

Output:
```
Brad: Generating visual shock report...

Extracting pattern examples...
  - Captured 47 button variations
  - Captured 89 color swatches
  - Captured spacing inconsistencies

Building metrics dashboard...
  - Pattern counts: done
  - Reduction percentages: done
  - ROI analysis: done ($374,400/year savings)

Creating horror show visualization...
  - Button grid: 47 variations displayed
  - Color explosion: 89 colors in grid
  - Spacing chaos: Visualized

Shock report generated: outputs/design-system/my-app/audit/shock-report.html

Open in browser to see the horror show.
Share with stakeholders to drive action.

Brad says: "Show them the numbers. They can't argue with this."
```

### Example 2: Opening the Report

```bash
open outputs/design-system/my-app/audit/shock-report.html
```

Browser displays:
- Executive summary at top
- Metric cards showing 47, 89, 176 (in red)
- Grid of 47 actual button variations (overwhelming)
- Cost table: $457k -> $83k = $374k savings
- Clean future state: 3 buttons

## Notes

- Visual impact is the goal - make it shocking
- Self-contained HTML for easy sharing (email, Slack, etc)
- Works offline (no CDN dependencies)
- Optimized for executive review (5-minute read)
- Include real code examples when possible
- Color explosion grid is particularly effective
- ROI section is the closer for stakeholder buy-in
- Brad recommends: Send to decision-makers before meetings
- Update report after consolidation to show progress
- Use this to justify design system investment
