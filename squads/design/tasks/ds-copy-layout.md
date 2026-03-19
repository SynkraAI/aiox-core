# Map Copy Structure to Visual Hierarchy

> Task ID: ds-copy-layout
> Agent: Page Composer (Page Composition & Layout Specialist)
> Version: 1.0.0
> **Execution Type:** `Agent`
> **Dependencies:** depends_on: `[]` · enables: `[ds-compose-page]` · workflow: `page-composition`

## Description

Map copy structure to visual hierarchy and component selection. Detects the copy framework in use (AIDA, PAS, or StoryBrand), maps copy sections to page zones, assigns visual weights, and suggests components from the component index. Bridges the gap between written content and visual layout.

## Input Schema

- **command:** `*copy-layout [--framework AIDA|PAS|StoryBrand] --copy {text|file}`
- **--framework:** Optional explicit framework specification. If omitted, auto-detected from copy structure.
- **--copy:** Copy text (inline string) or path to copy briefing file (YAML/text)
- **format:** Framework enum + copy text or file path

## Prerequisites

- Copy text or briefing file provided
- Knowledge bases loaded:
  - `squads/design/data/copy-to-layout-bridge.md`
  - `squads/design/data/page-type-patterns.md`
  - `squads/design/data/component-index.json`

## Workflow

### Steps

1. **Detect Copy Framework** — Analyze copy structure to determine framework: AIDA (Attention → Interest → Desire → Action), PAS (Problem → Agitation → Solution), or StoryBrand (Character → Problem → Guide → Plan → CTA → Success → Failure). If `--framework` provided, use it directly.
   - KB: `copy-to-layout-bridge.md`
   - Check: framework detected or confirmed with confidence level

2. **Map Sections to Page Zones** — Map each copy section to a page zone (hero, features, social proof, steps, CTA, etc.) based on the detected framework's section-to-zone mapping.
   - KB: `copy-to-layout-bridge.md`, `page-type-patterns.md`
   - Check: every copy section assigned to a page zone

3. **Assign Visual Weights** — Assign visual weight (high/medium/low) to each section based on its role in the framework. Primary message/CTA = high, supporting content = medium, supplementary = low.
   - KB: `copy-to-layout-bridge.md`
   - Check: visual weights assigned to all sections

4. **Suggest Components** — Match each section to shadcn/ui components from the component index based on content type and visual weight.
   - KB: `component-index.json`
   - Check: component suggestion per section with rationale

5. **Generate Mapping** — Produce the complete copy-to-layout mapping showing section → zone → weight → component for each piece of copy.
   - Check: complete mapping generated

6. **Generate Report** — Format output with mapping table, missing copy sections (needs copy), and component suggestions. Update `.state.yaml`.
   - Check: report generated with actionable output

## Output

- Copy framework identification
- Section-to-zone mapping
- Visual weight assignments
- Component suggestions from index
- Missing copy section flags
- `.state.yaml` updated

## Output Format

```
Mapping StoryBrand framework to page sections...

**Framework Detected:** StoryBrand (confidence: 92%)

**Copy-to-Layout Mapping:**
| Copy Section     | Page Zone      | Visual Weight | Component Suggestion    |
|------------------|----------------|---------------|-------------------------|
| Character        | Hero           | high          | hero-section            |
| Problem          | Stakes         | medium        | stats-banner            |
| Guide            | Authority      | medium        | logo-cloud + testimonial|
| Plan             | Steps          | medium        | stepper                 |
| CTA              | Action         | high          | cta-section             |
| Success          | Transformation | medium        | before-after / carousel |
| Failure          | Stakes (alt)   | low           | callout-box             |

**Missing Copy:**
- Problem section: [needs copy]
- Guide section: [needs copy]
- Plan section: [needs copy]
- Success section: [needs copy]

**Component Selection:** 7 components mapped from index.

.state.yaml updated.
```

## Failure Handling

- **No copy provided:** Abort with "No copy text or file provided. Use `--copy` flag with text or file path."
- **Copy file not found:** Abort with "Copy file '{path}' not found. Verify the path and try again."
- **Framework detection fails:** If copy doesn't match any known framework, warn "Could not detect copy framework. Defaulting to generic content mapping. Specify `--framework` for better results."
- **KB file not found:** Abort with "KB file {name} not found at squads/design/data/. Cannot perform copy-layout mapping."
- **Component not in index:** If a section needs a component not in component-index.json, flag "Component '{name}' not in index — handoff to @brad-frost or use closest match '{alternative}'."
- **Minimal copy provided:** If only 1-2 sections have actual copy, map what exists and flag remaining sections as "[needs copy]" with suggested content direction.

## Success Criteria

- [ ] Copy framework correctly detected (or user-specified framework applied)
- [ ] Every copy section mapped to a page zone
- [ ] Visual weights assigned to all sections (high/medium/low)
- [ ] Components suggested from component-index.json (no freestyle selection)
- [ ] Missing copy sections flagged with "[needs copy]"
- [ ] Output is actionable — can be fed directly into *compose-page
- [ ] `.state.yaml` updated with copy-layout mapping

## Anti-Patterns

- Assigning layout before analyzing copy structure
- Using the same visual weight for all sections
- Selecting components not in the component index
- Ignoring the copy framework's natural section hierarchy
- Not flagging missing copy sections
- Forcing a framework that doesn't match the copy structure

## Examples

### Example 1: StoryBrand with Partial Copy

```
User: *copy-layout --framework StoryBrand --copy "Join 10,000 founders..."
Composer: Mapping StoryBrand framework to page sections...
Composer: Character → Hero: "Join 10,000 founders..." (visual_weight: high)
Composer: Problem → Stakes: [needs copy]
Composer: Guide → Authority: [needs copy]
Composer: Plan → Steps: [needs copy]
Composer: CTA → Action: [needs copy]
Composer: Success → Transformation: [needs copy]
Composer: Components mapped: Hero → hero-section, Stakes → stats-banner,
          Authority → logo-cloud + testimonial, Steps → stepper,
          CTA → cta-section
Composer: .state.yaml updated.
```

### Example 2: AIDA with Full Copy Briefing

```
User: *copy-layout --copy briefing.yaml
Composer: Auto-detecting framework from copy structure...
Composer: Framework detected: AIDA (confidence: 88%)
Composer: Attention → Hero (high), Interest → Features (medium),
          Desire → Social Proof (medium), Action → CTA (high)
Composer: All 4 sections have copy. No missing sections.
Composer: 6 components mapped from index.
```

## Notes

- Uses 3 KBs: copy-to-layout-bridge.md, page-type-patterns.md, component-index.json
- Three supported frameworks: AIDA (4 sections), PAS (3 sections), StoryBrand (7 sections)
- Visual weight directly influences typography scale and spacing strategy in downstream composition
- Output can be fed into *compose-page as Phase 6 input
- Content determines layout — this task enforces that principle by mapping copy first
- If copy is minimal, the mapping still provides the structural blueprint for content creation

## Related Checklists

- `squads/design/checklists/page-composition-checklist.md`

## Process Guards

- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.
