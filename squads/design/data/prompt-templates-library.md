---
title: "Prompt Templates Library"
purpose: "Copy-paste ready prompt templates for page composition, extracted from v0/Lovable/Bolt research"
version: "1.1.0"
source: "Research: docs/research/2026-03-08-ai-design-tools-prompts/ Section 3"
created: "2026-03-08"
---

# Prompt Templates Library

> Ready-to-use templates following the 3-Input Framework (Product Surface + Context + Constraints).

---

## 1. Landing Page

```
Build a one-page site for [product] targeted at [audience].
The main CTA should be "[CTA text]."
Focus on a [buzzword] aesthetic with [specific visual traits].

Sections:
1. Hero — headline: "[exact text]", subtext: "[exact text]", CTA: "[button text]"
2. Social proof — [logos/stats/badges]
3. Features — [N] cards, each with icon, headline, description
4. Benefits/Stats — [key metrics with numbers]
5. Testimonials — [N] real quotes with name, title, company
6. Pricing — [N] tiers with feature comparison
7. FAQ — [N] common questions
8. Final CTA — [conversion action]
9. Footer — navigation, legal, social links

Constraints:
- Mobile-first, single column expanding to [N] columns max
- Color palette: [specific colors or "use brand tokens"]
- Font: [font name or "use design system"]
- Tone: [buzzword from Design Tone Vocabulary]
- States: include loading skeletons for dynamic sections
```

---

## 2. Dashboard

```
Build a [type] dashboard for [user role].
Used by [persona] to [decision/outcome] on a [frequency] basis.

Layout:
- Sidebar with navigation: [list nav items]
- Top bar: search, notifications, user menu
- KPI cards: [list metrics with data types and expected ranges]
- Primary data view: [table/chart/kanban] with columns: [list columns]
- Filters: [list filter dimensions]
- Activity feed: [what events to show]

Constraints:
- Desktop-first with responsive collapse to mobile
- Compact spacing (data-dense UI)
- Status indicators: [color system e.g. green=active, yellow=pending, red=error]
- Dark mode support: [yes/no]
- States: loading skeletons for KPIs and table, empty state for no-data
```

---

## 3. Product/Offer Page

```
Build a product page for [product name] solving [problem].
Used by [persona] to [evaluate/purchase/sign up].

Sections:
1. Hero — product name, tagline: "[text]", CTA: "[text]", product screenshot/video
2. Benefits — [N] benefit cards with icon and description
3. Demo/Screenshots — tabbed view showing [N] features
4. How It Works — [N] steps: [step 1] → [step 2] → [step 3]
5. Pricing — [N] tiers: [tier details]
6. FAQ — [N] questions addressing [objections]
7. Final CTA — "[CTA text]"

Constraints:
- [buzzword] aesthetic
- Mobile-first
- Video modal for demo (if applicable)
- States: image loading, pricing toggle animation
```

---

## 4. Auth Flow

```
Build a [login/signup/reset] page for [app name].
Used by [new users / returning users] to [create account / access dashboard].

Layout: [split-screen with brand panel / centered card]

Form fields:
- [list fields: email, password, name, etc.]
- [social auth providers: Google, GitHub, etc.]

Constraints:
- Centered or split-screen layout
- Brand panel: [logo + tagline + illustration description]
- Balanced spacing
- Form validation with inline error messages
- States: submitting state, error state, success redirect
```

---

## 5. Blog/Content

```
Build a blog post page for [blog name / brand].
Used by [readers/developers/marketers] to [learn about topic / stay updated].

Sections:
1. Site header with navigation
2. Article header — category badge, title, author avatar + name, date, read time
3. Featured image (breakout width)
4. Article body — prose with headings, code blocks, images, blockquotes
5. Author bio card with social links
6. Related posts grid — [N] cards
7. Footer

Constraints:
- Centered-narrow layout (max-w-prose for body)
- Editorial tone
- F-pattern eye tracking
- Balanced spacing
- Typography: serif or system font, generous line-height
```

---

## 6. Settings/Profile

```
Build a settings page for [app name].
Used by [user role] to [manage preferences / update profile / configure integrations].

Layout:
- Settings sidebar navigation: [list sections]
- Content area with form groups

Sections per tab:
- [Section name]: [list fields and input types]
- Danger zone: [destructive actions]
- Action bar: Save / Cancel (sticky or bottom)

Constraints:
- Sidebar-main layout (tabs on mobile)
- Balanced spacing
- Destructive actions visually separated (border-destructive)
- Form validation with toast on save
- States: saving state, unsaved changes warning
```

---

## 7. Design Direction (Standalone)

```
Use [buzzword]-inspired design throughout. Visual language:
- Colors: [palette description or specific hex values]
- Shapes: [rounded-lg / sharp / mixed]
- Spacing: [generous / balanced / compact]
- Font: [typeface name or category]
- Tone: [emotional descriptor]

Apply consistently to all sections. No default shadcn colors.
```

---

## 8. Mobile-First Directive (Append to Any Template)

```
Ensure complete responsiveness at every breakpoint using mobile-first strategy.
Breakpoints: default (mobile) → sm (640px) → md (768px) → lg (1024px) → xl (1280px) → 2xl (1536px).
Touch targets minimum 44x44px.
No horizontal overflow at any breakpoint.
Test: single column mobile, expanding to [N] columns desktop.
```

---

## 9. Component States Directive (Append to Any Template)

```
For every data-dependent section, generate three states:
1. LOADING — shadcn Skeleton components matching the content shape
2. EMPTY — illustration (or icon) + helpful message + primary action CTA
3. ERROR — error message + retry button

Do not generate only the happy-path populated state.
```

---

## 10. Component Individual

```
Create a [component type] for [app/page context].
Used by [persona] to [action/interaction].

Core elements:
- [list visual elements: avatar, badge, stat, action button, etc.]
- [interactive states: hover, focus, active, disabled]
- [visual effects: shadow, border, gradient, animation]

Variants:
- Size: [sm / md / lg]
- State: [default / active / disabled / loading]
- Theme: [light / dark]

Constraints:
- Must integrate with [parent component/page layout]
- Follow [design system tokens / brand palette]
- Accessibility: keyboard navigable, ARIA labels, focus-visible
```

---

## 11. Update Delicado (Precision Edit)

> Use when modifying existing pages — avoids breaking changes.

```
This update requires utmost precision.

Current state: [describe what exists now]
Change requested: [specific change — one concern only]
Do NOT modify: [list files/components/sections to preserve]

Steps:
1. Examine dependencies of the target component
2. Identify ripple effects of the change
3. Make the minimal change that achieves the goal
4. Verify: no regressions in [list affected areas]

If uncertain about any step, pause and ask before proceeding.
```

---

## 12. Debugging (Troubleshooting)

> Use when a composed page has visual or functional issues.

```
Take a moment to perform preliminary investigation to uncover root cause.

Problem: [describe the visual/functional issue]
Expected behavior: [what should happen]
Actual behavior: [what is happening]
Affected area: [component/section/page]

Investigation steps:
1. Examine the component's props, state, and CSS classes
2. Check parent layout constraints (grid/flex/container)
3. Inspect responsive breakpoints — does it break at a specific width?
4. Verify design token values (spacing, typography, colors)
5. Check for CSS specificity conflicts or Tailwind class order issues

Do NOT make changes until you fully grasp the root cause.
Report findings before proposing a fix.
```

---

## Usage

These templates can be:
1. Used directly with `*compose-page` by pasting as the brief
2. Combined (e.g., Landing Page template + Mobile-First directive + Component States directive)
3. Customized by replacing bracketed values with real content
4. Referenced by the Page Composer agent during Phase 1 (Identify & Constrain) to suggest the right template
