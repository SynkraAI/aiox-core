# Generate Visual Shock Report

> Task ID: brad-generate-shock-report
> Agent: Brad (Design System Architect)
> Version: 1.1.0
> v4.0-compatible: true
> **Execution Type:** `Agent`
> **Dependencies:** depends_on: `[ds-calculate-roi]` · enables: `[]` · workflow: `brownfield-audit`

## Description

Generate self-contained HTML report showing visual evidence of UI chaos with side-by-side comparisons, cost analysis, and "horror show" presentation designed to drive stakeholder action.

## Input Schema
- **requires:** Output from `ds-calculate-roi`
- **format:** Markdown report
- **location:** `outputs/design-system/{project}/roi/roi-analysis.md`

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
   - Check: .state.yaml contains audit data with pattern count > 0 — abort with "Insufficient data: run *audit first"

2. **Extract Visual Examples**
   - Scan codebase for actual button implementations
   - Extract CSS for representative examples
   - Find most egregious duplicates
   - Capture top 10 worst offenders
   - Check: extracted example count >= 1 AND top 10 worst offenders identified — log "Extracted {N} visual examples from codebase"

3. **Generate HTML Structure**
   - Create self-contained HTML (no external dependencies)
   - Embed CSS and minimal JavaScript
   - Responsive design (mobile to desktop)
   - Check: HTML contains <!DOCTYPE html> AND no external resource links (self-contained) — abort with "HTML structure invalid: {error}"

4. **Create "Horror Show" Section**
   - Display all button variations side-by-side
   - Show color palette explosion (89 colors in grid)
   - Visualize spacing inconsistencies
   - Make it visually overwhelming (intentional)
   - Check: horror section contains button grid + color grid + spacing visualization — abort with "Horror show section missing: {missing element}"

5. **Add Metrics Dashboard**
   - Pattern count cards (before/after)
   - Reduction percentages with progress bars
   - Redundancy factors highlighted
   - Check: metrics section contains pattern count cards + reduction percentages + progress bars — abort with "Metrics dashboard incomplete: {missing element}"

6. **Generate Cost Analysis Section**
   - If ROI calculated, embed cost breakdown
   - Show monthly/annual waste
   - Display ROI metrics prominently
   - Include savings calculator widget
   - Check: cost section contains before/after costs AND savings figure — log "Cost analysis: ${before}/yr -> ${after}/yr, saving ${savings}/yr"

7. **Create Before/After Preview**
   - Show consolidated future state
   - Side-by-side comparison (47 buttons → 3)
   - Highlight simplicity and consistency
   - Check: before/after section shows consolidated variants side-by-side — abort with "Before/after preview section missing"

8. **Add Executive Summary**
   - Top-of-page key findings
   - One-sentence problem statement
   - Three bullet point solution
   - Clear call-to-action
   - Check: executive summary contains problem statement + 3 bullet points + call-to-action — abort with "Executive summary incomplete: {missing element}"

9. **Embed Interactive Elements**
   - Savings calculator (input team size, see ROI)
   - Pattern filter (show/hide categories)
   - Export to PDF button
   - Check: savings calculator accepts input AND pattern filter toggles work AND export button present — abort with "Interactive elements broken: {element}"

10. **Generate Report File**
    - Save as shock-report.html
    - Self-contained (works offline)
    - Optimized file size (<1MB)
    - Check: `test -f shock-report.html` AND file size < 1MB AND no external resource links — abort with "Report file generation failed: {error}"

11. **Optional: Export to PDF**
    - If requested, generate PDF version
    - Preserve visual layout
    - Check: `test -f shock-report.pdf` AND file size > 0 — abort with "PDF export failed"

12. **Update State File**
    - Add shock_report section to .state.yaml
    - Record report location and generation time
    - Check: .state.yaml contains shock_report section with file location + generation timestamp — abort with "State update failed"

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

## Failure Handling

- **No visual examples extracted from codebase:** Fall back to synthetic examples generated from pattern metrics, annotate as "representative" rather than "actual"
- **HTML file exceeds 1MB size limit:** Reduce grid density (show top 20 worst offenders instead of all variations), compress embedded CSS/JS, remove redundant styling
- **ROI data incomplete or missing cost breakdowns:** Generate report without cost section, add prominent banner noting ROI analysis skipped with link to run *calculate-roi
- **Browser rendering breaks for interactive elements:** Disable JavaScript features (calculator, filters), convert to static report with all content visible, log degraded mode in console

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


## Related Checklists

- `squads/design/checklists/ds-component-quality-checklist.md`
- `squads/design/checklists/ds-pattern-audit-checklist.md`

## Process Guards
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.
