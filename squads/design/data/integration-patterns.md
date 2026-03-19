# Integration Patterns with Squads

**Purpose:** How design system integrates with MMOS, CreatorOS, InnerLens
**Agent:** Design System (Builder Mode)

---

## Integration Architecture

```typescript
// Design system provides hooks
interface DesignSystemHook {
    getTokens(context: Context): Tokens;
    getComponents(): ComponentLibrary;
    applyTheme(theme: Theme): void;
}

// Expansion packs consume
const designSystem = useDesignSystem();
const tokens = designSystem.getTokens({ personality: 'formal' });
```

---

## MMOS Integration

### Use Case: Cognitive Clone Interfaces

**Problem:** Each clone needs consistent UI that matches personality.

**Solution:** Personality-based token variations.

```typescript
// Personality token mapping
const personalityTokens = {
    formal: {
        fontFamily: 'var(--font-serif)',
        fontSize: 'var(--font-size-base)',
        spacing: 'var(--space-formal)',      // Generous
        colorPrimary: 'var(--color-corporate)',
        colorBackground: 'var(--color-neutral-50)',
    },

    casual: {
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--font-size-lg)',
        spacing: 'var(--space-relaxed)',
        colorPrimary: 'var(--color-friendly)',
        colorBackground: 'var(--color-warm)',
    },

    technical: {
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--font-size-sm)',
        spacing: 'var(--space-compact)',
        colorPrimary: 'var(--color-technical)',
        colorBackground: 'var(--color-dark)',
    },
};

// Usage in MMOS
<CloneChatInterface
    personality="formal"
    tokens={personalityTokens.formal}
/>
```

### Components Generated

- `CloneChatInterface` (Input + MessageBubble + Avatar)
- `CloneAvatar` (with personality-based styling)
- `CloneSettings` (form fields for clone config)

---

## CreatorOS Integration

### Use Case: Course Platform UIs

**Problem:** Educational interfaces need readability and accessibility.

**Solution:** Learning-optimized tokens.

```typescript
// Educational tokens
const educationalTokens = {
    fontSize: '18px',              // Larger for readability
    lineHeight: 1.6,               // Comprehension
    spacing: 'var(--space-generous)',
    colorFocus: 'var(--color-highlight)',
    colorProgress: 'var(--color-success)',
    colorError: 'var(--color-error)',
};

// Usage in CreatorOS
<CourseVideoPlayer
    tokens={educationalTokens}
    accessibility="WCAG AAA"
/>
```

### Components Generated

- `CourseVideoPlayer` (with controls, transcript, progress)
- `QuizQuestion` (with validation UI)
- `ProgressBar` (visual reinforcement)
- `ChapterNavigation` (clear structure)

---

## InnerLens Integration

### Use Case: Psychometric Assessment Forms

**Problem:** Tests need minimal distractions, neutral design.

**Solution:** Minimal distraction tokens.

```typescript
// Minimal tokens
const minimalTokens = {
    colorPrimary: 'var(--color-neutral-700)',
    colorBackground: 'var(--color-neutral-50)',
    colorBorder: 'var(--color-neutral-200)',
    spacing: 'var(--space-balanced)',
    fontSize: 'var(--font-size-base)',
    // No decorative elements
};

// Usage in InnerLens
<AssessmentForm
    tokens={minimalTokens}
    questionUI={<QuestionPrompt />}
    inputUI={<RadioGroup />}
/>
```

### Components Generated

- `QuestionPrompt` (clear, minimal)
- `RadioGroup` (clean radio buttons)
- `ScaleInput` (Likert scale UI)
- `ProgressIndicator` (non-distracting)

---

## Integration Workflow

### Step 1: Define Pack-Specific Tokens

```yaml
# squads/mmos/.design-system/tokens/
formal-personality.yaml
casual-personality.yaml
technical-personality.yaml
```

### Step 2: Generate Pack Components

```bash
*agent design-system
*integrate mmos

# Generates MMOS-specific components
# Uses personality tokens
# Creates integration docs
```

### Step 3: Test Integration

```typescript
// Test that MMOS can use design system
import { CloneChatInterface } from '@design-system/mmos';
import { personalityTokens } from '@design-system/tokens';

test('formal clone uses correct tokens', () => {
    const { container } = render(
        <CloneChatInterface personality="formal" />
    );

    expect(container).toHaveStyle({
        fontFamily: personalityTokens.formal.fontFamily,
    });
});
```

---

## Integration Checklist

- [ ] Token variations defined for pack
- [ ] Pack-specific components generated
- [ ] Integration tests pass
- [ ] Documentation created
- [ ] No regressions in pack functionality
- [ ] Pack can import and use components
- [ ] Token changes propagate to pack

---

## Copy-Design Handoff Protocol (Copy Squad → Design Squad)

**Purpose:** Content-first page composition — copy determines layout, not the other way around.
**Agent:** Page Composer (page-composer)
**Cross-ref:** `squads/design/data/copy-to-layout-bridge.md` (KB5)

### Briefing Template

The Copy Squad delivers a standardized briefing to the Design Squad. The Page Composer agent consumes this via the `*compose-page` command.

```yaml
# Copy-to-Design Briefing Template
# Generated by: Copy Squad
# Consumed by: Page Composer agent (*compose-page command)
# Version: 1.0.0

briefing:
  # === REQUIRED FIELDS ===
  page_type: "landing | product | dashboard | auth | content | settings"
  audience: "string - target audience description"
  framework: "AIDA | PAS | StoryBrand | none"

  sections:
    - name: "hero | features | benefits | social-proof | pricing | cta | faq | footer | navigation | sidebar | content-body | auth-form | settings-form | dashboard-kpis"
      content: "string - actual copy text for this section"
      intent: "attention | interest | desire | action | problem | agitation | solution | character | guide | plan | success"
      visual_weight: "low | medium | high"

  # === OPTIONAL FIELDS ===
  brand_voice: "string - tone description (e.g., 'professional but approachable')"
  cta_primary: "string - main call to action text"
  cta_secondary: "string - secondary action text"
  constraints:
    max_sections: "number - limit sections count"
    mobile_priority: "boolean - mobile-first emphasis"
    above_fold: "string[] - sections that must appear above fold"
```

**Field Requirements:**

| Field | Required | Description |
|-------|----------|-------------|
| `page_type` | REQUIRED | One of 6 supported types: landing, product, dashboard, auth, content, settings |
| `audience` | REQUIRED | Target audience description for tone and complexity calibration |
| `framework` | REQUIRED | Copywriting framework used (AIDA, PAS, StoryBrand, none) |
| `sections` | REQUIRED | Array of content sections with name, content, intent, and visual_weight |
| `sections[].name` | REQUIRED | Section identifier from supported vocabulary |
| `sections[].content` | REQUIRED | Actual copy text for this section |
| `sections[].intent` | REQUIRED | Content intent aligned to selected framework |
| `sections[].visual_weight` | REQUIRED | Layout emphasis: low, medium, or high |
| `brand_voice` | OPTIONAL | Tone description for consistent styling |
| `cta_primary` | OPTIONAL | Main call-to-action text |
| `cta_secondary` | OPTIONAL | Secondary action text |
| `constraints.max_sections` | OPTIONAL | Limit on number of sections |
| `constraints.mobile_priority` | OPTIONAL | Whether to prioritize mobile layout |
| `constraints.above_fold` | OPTIONAL | Sections that must appear above the fold |

### Handoff Flow

```
Copy Squad                     Page Composer
-----------                    ----------------
1. Write copy with intent  →
2. Structure into sections →
3. Assign visual weights   →
4. Select framework        →
5. Generate briefing YAML  →   6. Receive briefing
                                7. Validate briefing format
                                8. Map intent to layout (KB5)
                                9. Apply visual weight rules
                               10. Select page template (KB2)
                               11. Select components (component-index.json)
                               12. Generate page code
```

**Responsibilities:**

- **Copy Squad (Steps 1-5):** Owns all content decisions. Produces the briefing YAML as the single handoff artifact.
- **Page Composer (Steps 6-12):** Owns all layout and component decisions. Never rewrites copy, only arranges it.

### Example: SaaS B2B Landing Page (AIDA Framework)

```yaml
briefing:
  page_type: landing
  audience: "SaaS B2B decision makers, CTOs and VP Engineering, 35-55 years old"
  framework: AIDA
  brand_voice: "Professional, data-driven, confident but not aggressive"
  cta_primary: "Start Free Trial"
  cta_secondary: "Book a Demo"

  sections:
    - name: hero
      content: "Transform Your Sales Pipeline with AI-Powered Insights. Stop guessing. Start knowing. Join 10,000+ B2B companies using predictive analytics to close 40% more deals."
      intent: attention
      visual_weight: high

    - name: features
      content: |
        Real-time Pipeline Analytics — See every deal's health score instantly.
        Predictive Forecasting — Know which deals will close before your team does.
        Automated Reporting — Weekly insights delivered to your inbox, zero effort.
      intent: interest
      visual_weight: medium

    - name: social-proof
      content: |
        "We increased close rates by 43% in the first quarter." — Sarah Chen, VP Sales, TechCorp
        "Finally, forecasting I can trust." — Marcus Rivera, CTO, ScaleUp Inc.
        Trusted by 500+ B2B companies. $2.1B in pipeline managed.
      intent: desire
      visual_weight: medium

    - name: pricing
      content: |
        Starter: $49/mo — Up to 5 users, basic analytics
        Growth: $149/mo — Up to 25 users, predictive AI, integrations
        Enterprise: Custom — Unlimited users, dedicated support, SSO
      intent: desire
      visual_weight: medium

    - name: cta
      content: "Start your free 14-day trial. No credit card required. Cancel anytime."
      intent: action
      visual_weight: high

    - name: footer
      content: "Product | Pricing | Blog | Docs | Support | Privacy | Terms"
      intent: action
      visual_weight: low

  constraints:
    above_fold: ["hero"]
    mobile_priority: true
```

**How the Page Composer processes this briefing:**

1. `page_type: landing` selects the landing page template from KB2
2. `framework: AIDA` validates that section intents follow attention → interest → desire → action
3. `visual_weight: high` on hero and cta triggers full-width, bold typography, prominent CTA button
4. `visual_weight: medium` on features, social-proof, and pricing triggers standard card/grid layouts
5. `visual_weight: low` on footer triggers compact, subdued styling
6. `above_fold: ["hero"]` ensures hero section is fully visible without scrolling
7. `mobile_priority: true` generates mobile-first responsive breakpoints

### Decision Tree: Requests Without Copy Briefing

```
Request received WITHOUT copy briefing
    |
    v
Step 1: Identify page type via elicitation
    "What type of page do you need? (landing / dashboard / auth / content / settings / product)"
    |
    v
Step 2: Select template from page-type-patterns.md (KB2)
    |
    v
Step 3: Suggest copy structure based on template
    "Based on the landing page template, you'll need copy for these sections:
     1. Hero — attention-grabbing headline + value prop
     2. Features — 3-4 key benefits
     3. Social Proof — testimonials or stats
     4. Pricing — tier comparison
     5. CTA — clear call to action"
    |
    v
Step 4: Offer 3 options:
    A) Redirect to Copy Squad → Generate full briefing → Return to compose (Recommended)
    B) User provides rough copy → Page Composer structures it
    C) Use placeholder content → Compose with lorem-structured sections
    |
    v
Step 5: Proceed with composition using selected option
```

**Option details:**

- **Option A (Recommended):** Highest quality. Copy Squad generates complete briefing with framework-aligned intents. Best for production.
- **Option B (Quick iteration):** Page Composer infers intent and visual weight from rough copy. Good for prototyping.
- **Option C (Wireframe mode):** Structured placeholders matching template sections. Requires copy pass before production.

### Briefing Validation Checklist

Before composition, Page Composer validates:

- [ ] `page_type` is one of the 6 supported types
- [ ] `framework` is valid (AIDA / PAS / StoryBrand / none)
- [ ] At least 2 sections provided
- [ ] Each section has `name`, `content`, `intent`, `visual_weight`
- [ ] At least 1 section has `visual_weight: high`
- [ ] Section names match supported section vocabulary
- [ ] Intent values match framework (AIDA uses attention/interest/desire/action; PAS uses problem/agitation/solution; StoryBrand uses character/guide/plan/success)

**Validation failure:** If any REQUIRED field is missing, Page Composer halts and reports errors. It does not guess missing fields.

### Cross-References

- **copy-to-layout-bridge.md** (KB5): Framework-to-section mapping tables, eye pattern rules, visual weight rules
- **page-type-patterns.md** (KB2): Page templates with section structures and layout grids
- **component-index.json**: Component selection based on section type and visual weight
- **page-layout-framework.md** (KB1): Layout patterns for the selected page type

---

## Notes

- Each pack has unique requirements
- Token variations maintain consistency
- Components extend base system (don't replace)
- Integration is bidirectional (pack ↔ design system)
- Document in both pack README and design system docs
