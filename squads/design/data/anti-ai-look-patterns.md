---
title: "Anti-AI-Look Patterns"
purpose: "Catalog of patterns that make AI-generated pages look generic, and how to avoid them"
version: "1.1.0"
source: "Research: docs/research/2026-03-08-ai-design-tools-prompts/ + page-composition-checklist.md Section 8"
created: "2026-03-08"
---

# Anti-AI-Look Patterns

## Philosophy

AI-generated pages share recognizable aesthetic fingerprints. Pages that look "AI-generated" erode brand trust. This KB documents what NOT to do and provides concrete alternatives.

---

## Pattern Catalog

### 1. Gradient Overuse

**AI Default:** Purple-to-blue gradient on hero backgrounds, gradient text on headings, gradient borders on cards.

**Fix:**
- Use solid brand colors from design tokens
- Gradients max 1 per page, only if part of brand identity
- Prefer subtle gradients (5-10% opacity shift) over dramatic ones
- Never gradient text unless explicitly in brand guidelines

### 2. Uniform Card Grid

**AI Default:** 3 identical cards in a row, same height, same padding, same icon style, same text length.

**Fix:**
- Vary card content length naturally (some 2 lines, some 4)
- Use 2-column or asymmetric layouts alongside 3-column
- Mix card variants: some with images, some icon-only, some stat-focused
- Stagger visual weight (one card larger/featured)

### 3. Generic Icon Usage

**AI Default:** Lucide/Heroicons with no customization — Shield, Zap, Rocket, Globe, Star for every feature section.

**Fix:**
- Select icons that specifically match the feature described
- Consider custom illustrations or brand-specific iconography
- Limit to 1 icon style/weight across the page
- If icons feel generic, remove them — text-only features can be stronger

### 4. Default Color Palette

**AI Default:** Indigo/blue primary, gray neutrals, green for success, red for error. The "shadcn default" look.

**Fix:**
- Use brand-specific primary color from design tokens
- Customize neutral scale (warm grays, cool grays, or tinted)
- Apply the Design Tone Vocabulary (`squads/design/data/page-type-patterns.md` Section 0) for palette direction
- v0 explicitly bans indigo/blue unless user specifies — follow this rule

### 5. Placeholder Content

**AI Default:** "Lorem ipsum", "Feature 1", "John Doe", "user@example.com", stock photo URLs.

**Fix:**
- ALWAYS use real copy from the brief or brand
- Real names, real metrics, real testimonials
- If copy isn't available, use realistic placeholder: "Sarah Chen, Head of Product at Acme"
- Never leave `placeholder.jpg` or `https://via.placeholder.com` in delivered code

### 6. One-Size Typography

**AI Default:** Same `text-lg` for all body text, same `text-2xl` for all headings, no variation.

**Fix:**
- Follow the modular type scale (1.25 ratio) from `squads/design/data/typography-hierarchy-rules.md`
- Hero H1 should be dramatically larger than section H2s
- Use display sizes for hero, heading sizes for sections, body for content
- Vary line-height per context (tight for headings, relaxed for body)

### 7. Uniform Section Spacing

**AI Default:** Same `py-16` for every section, creating monotonous rhythm.

**Fix:**
- Apply the whitespace strategy from `squads/design/data/spacing-rhythm-system.md` (generous/balanced/compact)
- Hero section gets MORE space than content sections
- CTA sections get LESS top padding (urgency)
- Use the proximity law: tighter within groups, wider between sections

### 8. Component Assembly Without Customization

**AI Default:** shadcn components used exactly as documented, no props customized, no variants applied.

**Fix:**
- Always apply size variants appropriate to context (sm for dense UIs, lg for marketing)
- Customize colors via CSS variables, not hardcoded classes
- Add hover/focus/active states beyond defaults
- Combine components in non-obvious ways (Badge inside Button, Avatar in Card header)

### 9. Missing States

**AI Default:** Only the "happy path" — full data, successful actions, populated lists.

**Fix:**
- ALWAYS generate: loading skeleton, error state, empty state for data-dependent sections
- Loading: use shadcn Skeleton components, not spinners
- Empty: illustration + helpful message + CTA ("No orders yet. Create your first order.")
- Error: specific message + retry action

### 10. Cookie-Cutter Hero

**AI Default:** Centered text, badge on top, two buttons (primary + secondary), gradient background.

**Fix:**
- Match hero to brand tone (split-screen for product, full-image for editorial, minimal for developer tools)
- Asymmetric layouts (text left, visual right) create more interest
- Consider: video hero, animated hero, illustration hero, stat-driven hero
- Hero CTA count: 1 is often stronger than 2

---

## Quick Scan Protocol

When reviewing a composed page for AI-look, check all 10 signals (one per pattern):

1. **Gradients:** Any purple-to-blue gradients, gradient text, or gradient borders? (Pattern 1)
2. **Card grid:** Are all sections identical 3-column grids with same-height cards? (Pattern 2)
3. **Icons:** Using Shield/Zap/Rocket/Globe/Star generically? (Pattern 3)
4. **Color:** Is the primary color indigo/blue with no brand reasoning? (Pattern 4)
5. **Content:** Any lorem ipsum, "Feature 1", or placeholder images? (Pattern 5)
6. **Typography:** Same text size for all body/headings with no variation? (Pattern 6)
7. **Spacing:** Is every section the same height/padding (e.g. uniform `py-16`)? (Pattern 7)
8. **Components:** Are shadcn components used exactly as default, no variants/colors applied? (Pattern 8)
9. **States:** Only happy-path shown — no loading skeletons, empty states, or error states? (Pattern 9)
10. **Hero:** Centered text + badge + 2 buttons + gradient background cookie-cutter? (Pattern 10)

If >= 3 signals fire → page needs revision before delivery.

---

## Cross-References

- Design Tone Vocabulary: `squads/design/data/page-type-patterns.md` Section 0
- Typography Scale: `squads/design/data/typography-hierarchy-rules.md`
- Spacing Strategies: `squads/design/data/spacing-rhythm-system.md`
- Component States: `squads/design/tasks/compose-component-states.md`
- Quality Gate: `squads/design/checklists/page-composition-checklist.md` Section 8
