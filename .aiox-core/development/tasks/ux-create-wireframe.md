# Create Wireframes & Interaction Flows

> **Task ID:** ux-create-wireframe
> **Agent:** UX-Design Expert
> **Phase:** 1 - UX Design
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
task: uxCreateWireframe()
responsável: Uma (Empathizer)
responsavel_type: Agente
atomic_layer: Template

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
  - creation
  - setup
updated_at: 2025-11-17
```

---


## 📋 Description

Design wireframes, prototypes, and interaction flows based on user research insights. Create low-fidelity, mid-fidelity, or high-fidelity wireframes depending on project needs. Document design decisions and prepare developer handoff materials.

---

## 🎯 Objectives

- Translate user needs into visual designs
- Explore multiple design solutions
- Communicate design ideas to stakeholders
- Create interaction flow diagrams
- Prepare assets for development handoff
- Document design decisions and rationale

---

## 📊 Fidelity Levels

### Low-Fidelity (Lo-Fi)
**When to use:** Early exploration, quick iteration
**Tools:** Sketch, whiteboard, ASCII art
**Time:** 30 min - 2 hours
**Detail:** Boxes and labels, no styling

### Mid-Fidelity (Mid-Fi)
**When to use:** Stakeholder review, usability testing
**Tools:** Figma, Sketch, Balsamiq
**Time:** 4-8 hours
**Detail:** Layout, hierarchy, some content

### High-Fidelity (Hi-Fi)
**When to use:** Developer handoff, final approval
**Tools:** Figma, Adobe XD, Sketch
**Time:** 1-3 days
**Detail:** Visual design, real content, interactions

---

## 🔄 Workflow

### Step 1: Define Wireframe Scope
**Interactive Elicitation:**

```
What type of wireframes do you need?

1. Low-Fidelity (Lo-Fi) - Quick sketches for exploration
2. Mid-Fidelity (Mid-Fi) - Layout and structure
3. High-Fidelity (Hi-Fi) - Visual design ready for dev

Your selection: _____

What screens/views do you need? (List all, e.g., "Login, Dashboard, Profile")
Your list: _____

What's the primary use case? (e.g., "User booking a service")
Your use case: _____
```

---

### Step 2: Review Research Insights

**Pull from user research:**
- User personas (who are we designing for?)
- User goals (what do they want to accomplish?)
- Pain points (what frustrates them currently?)
- Behavioral patterns (how do they work?)

**Example:**
```
Designing for: [Persona Name]
Goal: [User goal from research]
Pain Point: [Relevant pain point]
Constraint: [Technical or business constraint]
```

---

### Step 3: Create Information Architecture

**Content Inventory:**
List all content elements needed per screen:
- Headers and titles
- Navigation elements
- Form fields
- Buttons and CTAs
- Images and media
- Data displays
- Helper text

**Example:**
```
Screen: Dashboard
-----
- Page title
- User greeting
- Navigation menu (4 items)
- Quick stats (3 metrics)
- Recent activity list (5 items)
- Primary CTA button
- Secondary action link
```

---

### Step 4: Design Wireframes

#### Low-Fidelity (ASCII/Text-Based)

**Example Lo-Fi Wireframe:**
```
+----------------------------------------------------------+
|  [Logo]                    [Nav1] [Nav2] [Nav3] [Profile]|
+----------------------------------------------------------+
|                                                          |
|  Dashboard                                               |
|  =========                                               |
|                                                          |
|  +----------------+  +----------------+  +---------------+|
|  | Metric 1       |  | Metric 2       |  | Metric 3      ||
|  | [Large Number] |  | [Large Number] |  | [Large Number]||
|  | [Label]        |  | [Label]        |  | [Label]       ||
|  +----------------+  +----------------+  +---------------+|
|                                                          |
|  Recent Activity                          [View All]     |
|  ---------------                                         |
|  [ ] Activity Item 1 - Description       [Action]       |
|  [ ] Activity Item 2 - Description       [Action]       |
|  [ ] Activity Item 3 - Description       [Action]       |
|  [ ] Activity Item 4 - Description       [Action]       |
|  [ ] Activity Item 5 - Description       [Action]       |
|                                                          |
|  [+ New Action Button]                                   |
|                                                          |
+----------------------------------------------------------+
|  Footer Links | Copyright | Privacy                      |
+----------------------------------------------------------+
```

#### Mid-Fidelity Wireframe Components

**Component Checklist:**
- [ ] Navigation (global, contextual)
- [ ] Page title and breadcrumbs
- [ ] Content areas (primary, secondary, sidebar)
- [ ] Forms (labels, fields, validation, buttons)
- [ ] Data displays (tables, cards, lists)
- [ ] Images and media placeholders
- [ ] CTAs and action buttons
- [ ] Loading states
- [ ] Empty states
- [ ] Error states

**Atomic Design Structure:**
Break wireframe into components:
- **Atoms:** Button, Input, Label, Icon
- **Molecules:** Form Field (Label + Input), Card (Image + Title + Text)
- **Organisms:** Header (Logo + Nav + Profile), Form (Multiple Fields + Button)

---

### Step 5: Document Interaction Flows

**Flow Diagram Template:**
```
[Start] → [Screen 1] → [User Action] → [Screen 2] → [Conditional Branch]
                                              ↓
                                        [Success Path]
                                              ↓
                                        [Screen 3] → [End]

                                        [Error Path]
                                              ↓
                                        [Error Screen] → [Retry]
```

**Example: Login Flow**
```
[Landing Page]
      ↓
  [Click Login]
      ↓
[Login Screen]
      ↓
[Enter Email + Password]
      ↓
  [Click Submit]
      ↓
   [Validate]
      ↓
  ┌─────┴─────┐
  ↓           ↓
[Valid]    [Invalid]
  ↓           ↓
[Dashboard] [Error: Show message]
            [Retry]
```

---

### Step 6: Add Annotations

**Annotation Types:**
1. **Functionality** - "Clicking here opens modal"
2. **Content** - "Show user's first name from profile"
3. **State** - "Disabled if form incomplete"
4. **Business Rules** - "Only show if user has premium"
5. **Accessibility** - "Focus trap on modal open"
6. **Performance** - "Lazy load images below fold"

**Example:**
```
[Button: Save Changes]
---
- Disabled state: If form has validation errors
- Loading state: Show spinner during API call
- Success state: Show checkmark + "Saved!" message
- Error state: Show error icon + error message
- Accessibility: aria-label="Save changes to profile"
- Analytics: Track "profile_save_clicked" event
```

---

### Step 7: Create Component Inventory

List all unique components for development:

```markdown
## Component Inventory (Atomic Design)

### Atoms (18 total)
- Button (Primary, Secondary, Destructive, Ghost)
- Input (Text, Email, Password, Number, Search)
- Label
- Icon (Set of 12 common icons)
- Badge
- Avatar
- Divider

### Molecules (8 total)
- Form Field (Label + Input + Helper Text + Error)
- Search Bar (Input + Icon + Button)
- Card Header (Avatar + Title + Subtitle)
- Navigation Item (Icon + Label + Badge)
- Stat Display (Label + Number + Trend Icon)
- Dropdown Menu (Button + Menu Items)
- Toast Notification (Icon + Message + Close)
- Empty State (Icon + Title + Description + CTA)

### Organisms (5 total)
- Header (Logo + Navigation + Search + Profile)
- Form (Multiple Fields + Submit Button)
- Data Table (Headers + Rows + Pagination)
- Card (Header + Content + Footer)
- Modal (Overlay + Header + Body + Footer + Close)
```

---

### Step 8: Prepare Developer Handoff

**Handoff Package Includes:**
1. **Wireframes** - All screens (PNG/PDF export)
2. **Interaction Flows** - Flow diagrams
3. **Component Inventory** - List with specifications
4. **Annotations** - Design decisions document
5. **Assets** - Icons, logos (if available)
6. **Measurements** - Spacing, sizing guidelines

**Spacing System:**
```
Base unit: 4px

Scale:
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px
- 3xl: 64px
```

**Breakpoints:**
```
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px
```

---

## 📤 Outputs

All artifacts saved to: `outputs/wireframes/{project}/`

### Required Files:
1. **wireframes/** - All screen wireframes (PNG/ASCII)
2. **flows.md** - Interaction flow diagrams
3. **component-inventory.md** - List of all components (Atomic Design)
4. **annotations.md** - Design decisions and notes
5. **handoff-package.md** - Developer handoff guide

### Optional Files:
6. **assets/** - Icons, logos, images
7. **measurements.md** - Spacing and sizing specs
8. **responsive-notes.md** - Mobile/tablet/desktop variations

---

## ✅ Success Criteria

- [ ] Wireframes created for all required screens
- [ ] Appropriate fidelity level achieved
- [ ] Interaction flows documented
- [ ] Component inventory complete (Atomic Design structure)
- [ ] Annotations explain all design decisions
- [ ] Developer handoff package prepared
- [ ] Spacing and measurement guidelines defined
- [ ] Responsive behavior documented
- [ ] All outputs saved to `outputs/wireframes/{project}/`
- [ ] `.state.yaml` updated with wireframes completion

---

## 🔄 Integration with Other Tasks

**Previous Steps:**
- `*research` - Use personas and insights to inform design

**Next Steps:**
- `*generate-ui-prompt` - Convert wireframes to AI prompts for v0/Lovable
- `*build` - Implement components from inventory
- `*create-front-end-spec` - Create detailed specifications

**State Management:**
Updates `.state.yaml` with:
- `wireframes_created: [list of screen names]`
- `fidelity_level: "low" | "mid" | "high"`
- `component_inventory: [list of components]`
- `wireframe_date: [ISO date]`

---

## 🎨 AI UI Generation Prompts

After creating wireframes, generate prompts for AI tools:

**v0.dev Prompt Template:**
```
Create a [Component Name] component with:
- [Feature 1]
- [Feature 2]
- [Feature 3]

Style: [Modern/Minimal/Bold]
Colors: [Primary/Secondary colors]
Framework: React + TypeScript + Tailwind CSS
Accessibility: WCAG AA compliant
```

**Lovable Prompt Template:**
```
Build a [Screen Name] page featuring:
- [Section 1 description]
- [Section 2 description]
- [Section 3 description]

Layout: [Grid/Flex/Stack]
Mobile-responsive: Yes
Dark mode: [Yes/No]
```

---

## 📚 Best Practices

### Visual Hierarchy
- Larger = more important
- Bold = action or emphasis
- Color = status or category
- Proximity = related items

### Consistency
- Use same components throughout
- Maintain spacing patterns
- Follow established navigation
- Repeat interaction patterns

### Accessibility
- Sufficient contrast (4.5:1 minimum)
- Clear focus indicators
- Logical tab order
- Alt text for images
- Form labels and error messages

### Mobile-First
- Design for smallest screen first
- Progressive enhancement for larger screens
- Touch targets minimum 44x44px
- Avoid hover-only interactions

---

## ⚠️ Common Pitfalls

1. **Too much detail too early** - Start lo-fi, iterate to hi-fi
2. **Designing in isolation** - Share early, get feedback often
3. **Ignoring edge cases** - Design empty states, errors, loading
4. **Inconsistent patterns** - Reuse components, don't reinvent
5. **No mobile consideration** - Design responsive from start

---

**Created:** 2025-11-12
**Story:** 4.3 - UX-Design-Expert Merge
**Version:** 1.0.0
