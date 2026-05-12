# Generate Visual Shock Report

> Task ID: brad-generate-shock-report
> Agent: Brad (Design System Architect)
> Version: 1.0.0

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
task: generateShockReport()
responsável: Atlas (Decoder)
responsavel_type: Agente
atomic_layer: Template

**Entrada:**
- campo: name
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Must be non-empty, lowercase, kebab-case

- campo: options
  tipo: object
  origem: User Input
  obrigatório: false
  validação: Valid JSON object with allowed keys

- campo: force
  tipo: boolean
  origem: User Input
  obrigatório: false
  validação: Default: false

**Saída:**
- campo: created_file
  tipo: string
  destino: File system
  persistido: true

- campo: validation_report
  tipo: object
  destino: Memory
  persistido: false

- campo: success
  tipo: boolean
  destino: Return value
  persistido: false
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Target does not already exist; required inputs provided; permissions granted
    tipo: pre-condition
    blocker: true
    validação: |
      Check target does not already exist; required inputs provided; permissions granted
    error_message: "Pre-condition failed: Target does not already exist; required inputs provided; permissions granted"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Resource created successfully; validation passed; no errors logged
    tipo: post-condition
    blocker: true
    validação: |
      Verify resource created successfully; validation passed; no errors logged
    error_message: "Post-condition failed: Resource created successfully; validation passed; no errors logged"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Resource exists and is valid; no duplicate resources created
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert resource exists and is valid; no duplicate resources created
    error_message: "Acceptance criterion not met: Resource exists and is valid; no duplicate resources created"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** component-generator
  - **Purpose:** Generate new components from templates
  - **Source:** .aiox-core/scripts/component-generator.js

- **Tool:** file-system
  - **Purpose:** File creation and validation
  - **Source:** Node.js fs module

---

## Scripts

**Agent-specific code for this task:**

- **Script:** create-component.js
  - **Purpose:** Component creation workflow
  - **Language:** JavaScript
  - **Location:** .aiox-core/scripts/create-component.js

---

## Error Handling

**Strategy:** retry

**Common Errors:**

1. **Error:** Resource Already Exists
   - **Cause:** Target file/resource already exists in system
   - **Resolution:** Use force flag or choose different name
   - **Recovery:** Prompt user for alternative name or force overwrite

2. **Error:** Invalid Input
   - **Cause:** Input name contains invalid characters or format
   - **Resolution:** Validate input against naming rules (kebab-case, lowercase, no special chars)
   - **Recovery:** Sanitize input or reject with clear error message

3. **Error:** Permission Denied
   - **Cause:** Insufficient permissions to create resource
   - **Resolution:** Check file system permissions, run with elevated privileges if needed
   - **Recovery:** Log error, notify user, suggest permission fix

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 3-8 min (estimated)
cost_estimated: $0.002-0.005
token_usage: ~1,500-5,000 tokens
```

**Optimization Notes:**
- Cache template compilation; minimize data transformations; lazy load resources

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
   - Side-by-side comparison (47 buttons → 3)
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
  </style>
</head>
<body>
  <header>
    <h1>🚨 UI Pattern Chaos Report</h1>
    <p class="subtitle">Generated by Brad | 2025-10-27</p>
  </header>

  <section class="executive-summary">
    <h2>Executive Summary</h2>
    <p><strong>Problem:</strong> 176 redundant UI patterns cost $457,200/year in maintenance.</p>
    <ul>
      <li>81.8% pattern reduction possible (176 → 32)</li>
      <li>$374,400/year savings potential</li>
      <li>ROI breakeven in 10 days</li>
    </ul>
    <p><strong>Action:</strong> Approve design system implementation immediately.</p>
  </section>

  <section class="metrics">
    <h2>The Damage</h2>
    <div class="metric-cards">
      <div class="metric-card">
        <div class="metric-value">47</div>
        <div class="metric-label">Button Variations</div>
        <div class="metric-target">Target: 3</div>
      </div>
      <!-- More metric cards -->
    </div>
  </section>

  <section class="horror-show">
    <h2>The Horror Show</h2>
    <h3>All 47 Button Variations</h3>
    <div class="horror-grid">
      <!-- Actual button examples rendered -->
      <button class="btn-primary">Primary</button>
      <button class="button-primary">Primary Alt</button>
      <button class="btn-main">Main</button>
      <!-- ...44 more variations... -->
    </div>
    <p class="caption">This is madness. It should be 3 variants, not 47.</p>
  </section>

  <section class="cost-analysis">
    <h2>The Cost</h2>
    <table>
      <tr>
        <th>Before</th>
        <td>$457,200/year</td>
      </tr>
      <tr>
        <th>After</th>
        <td>$82,800/year</td>
      </tr>
      <tr>
        <th>Savings</th>
        <td class="highlight">$374,400/year</td>
      </tr>
    </table>
  </section>

  <section class="future-state">
    <h2>The Solution</h2>
    <h3>Consolidated: 3 Button Variants</h3>
    <div class="clean-grid">
      <button class="btn-primary-new">Primary</button>
      <button class="btn-secondary-new">Secondary</button>
      <button class="btn-destructive-new">Destructive</button>
    </div>
    <p class="caption">Clean. Consistent. Maintainable.</p>
  </section>

  <footer>
    <p>Generated by Brad (Design System Architect)</p>
    <p>Powered by SuperAgentes</p>
  </footer>
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
🔍 Brad: Generating visual shock report...

📸 Extracting pattern examples...
  - Captured 47 button variations
  - Captured 89 color swatches
  - Captured spacing inconsistencies

📊 Building metrics dashboard...
  - Pattern counts: ✓
  - Reduction percentages: ✓
  - ROI analysis: ✓ ($374,400/year savings)

🎨 Creating horror show visualization...
  - Button grid: 47 variations displayed
  - Color explosion: 89 colors in grid
  - Spacing chaos: Visualized

✅ Shock report generated: outputs/design-system/my-app/audit/shock-report.html

👀 Open in browser to see the horror show.
📧 Share with stakeholders to drive action.

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
- Cost table: $457k → $83k = $374k savings
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
