---
title: "Copy-to-Layout Bridge"
purpose: "Map persuasive copy frameworks to page sections, define eye-tracking patterns, visual weight rules, and provide the Copy Squad to Design Squad handoff format for the Page Composer agent"
version: "1.0.0"
source: "Research: docs/research/2026-03-06-page-composition-ai-agents/"
created: "2026-03-06"
---

# Copy-to-Layout Bridge

## 1. Copy Framework to Section Mapping

### 1.1 AIDA (Attention - Interest - Desire - Action)

Best for: Landing pages, product pages, email capture pages.

| Phase      | Letter | Section(s)                    | Purpose                         | KB2 Page Type    |
|------------|--------|-------------------------------|---------------------------------|------------------|
| Attention  | A      | Hero                          | Hook with headline + visual     | Landing Page     |
| Interest   | I      | Features, Benefits, Demo      | Build curiosity with details    | Landing Page     |
| Desire     | D      | Testimonials, Social Proof, Pricing | Create want through proof | Landing Page     |
| Action     | A      | Final CTA, Pricing CTA        | Drive the conversion            | Landing Page     |

**Section flow:**

```
ATTENTION:  Hero (headline + subhead + primary CTA)
            |
INTEREST:   Social Proof Bar (logos, trust signals)
            |
            Features (3-column grid, benefit-oriented)
            |
            Benefits / Stats (quantified value)
            |
DESIRE:     Testimonials (customer stories)
            |
            Pricing (plans comparison)
            |
ACTION:     Final CTA (reiterate value + action button)
```

### 1.2 PAS (Problem - Agitation - Solution)

Best for: Product pages, offer pages, problem-aware audiences.

| Phase      | Letter | Section(s)                    | Purpose                         | KB2 Page Type    |
|------------|--------|-------------------------------|---------------------------------|------------------|
| Problem    | P      | Hero                          | Name the pain clearly           | Product/Offer    |
| Agitation  | A      | Benefits (framed as pain)     | Deepen the urgency              | Product/Offer    |
| Solution   | S      | Demo, How It Works, Pricing   | Present the fix with proof      | Product/Offer    |

**Section flow:**

```
PROBLEM:    Hero (state the problem the audience faces)
            |
AGITATE:    Pain Points (what happens if unsolved)
            |
            Benefits (framed as relief from pain)
            |
SOLUTION:   Demo / Screenshots (visual proof it works)
            |
            How It Works (3-step process)
            |
            Pricing (clear path to solution)
            |
            FAQ (remove remaining objections)
            |
            Final CTA (take action now)
```

### 1.3 StoryBrand (Donald Miller Framework)

Best for: Brand-focused landing pages, narrative-driven product pages.

| SB Element   | Section(s)                    | Copy Focus                             | KB2 Page Type    |
|--------------|-------------------------------|----------------------------------------|------------------|
| Character    | Hero                          | Position the visitor as the hero       | Landing Page     |
| Problem      | Hero / Problem Section        | External, internal, philosophical      | Landing Page     |
| Guide        | Social Proof, About           | Brand as guide (empathy + authority)   | Landing Page     |
| Plan         | Features, How It Works        | Clear 3-step plan                      | Landing Page     |
| CTA          | CTA sections                  | Direct ("Start Free") + transitional ("Learn More") | Landing Page |
| Success      | Benefits, Testimonials        | Show transformation and outcome        | Landing Page     |
| Failure      | Stakes section (optional)     | What happens without action            | Landing Page     |

**Section flow:**

```
CHARACTER:  Hero (visitor is the hero, state their desire)
            |
PROBLEM:    Problem Section (name external + internal + philosophical problem)
            |
GUIDE:      Social Proof (show empathy + authority)
            |
PLAN:       Features / How It Works (clear 3-step plan)
            |
CTA:        Primary CTA (direct) + Secondary CTA (transitional)
            |
SUCCESS:    Testimonials + Benefits (transformation achieved)
            |
FAILURE:    Stakes (optional: what happens if they don't act)
            |
CTA:        Final CTA (repeat the direct call to action)
```

### Framework Selection Guide

| Audience State           | Best Framework | Reasoning                                 |
|--------------------------|----------------|-------------------------------------------|
| Unaware of problem       | StoryBrand     | Narrative arc builds awareness             |
| Problem-aware            | PAS            | Directly agitates known pain               |
| Solution-aware           | AIDA           | Focuses on your specific solution          |
| Product-aware            | AIDA           | Builds desire and drives action            |
| Most aware (repeat/referral) | PAS (short) | Quick reminder of value, skip awareness  |

---

## 2. Eye-Tracking Patterns

### 2.1 Z-Pattern (Landing Pages, Marketing)

Used when the page has minimal text and relies on visual hierarchy to guide the eye.

```
+-------------------------------------------------------------+
|                                                             |
|  (1) START ---------> scan across ---------> (2) LOGO/NAV  |
|       Logo, nav                               CTA, menu    |
|         \                                       /           |
|          \                                     /            |
|           \         DIAGONAL SCAN             /             |
|            \          (content)              /              |
|             \                               /               |
|              \                             /                |
|  (3) LEFT ------> scan across -------> (4) CTA             |
|       Image, text                        Button, action    |
|                                                             |
+-------------------------------------------------------------+
```

**Design rules for Z-pattern:**

| Position | Content to Place           | Tailwind Alignment          |
|----------|----------------------------|-----------------------------|
| (1) Top-left   | Logo, brand mark    | `justify-start`             |
| (2) Top-right  | Primary nav, CTA    | `justify-end`, `ml-auto`    |
| Diagonal       | Hero content, image | `text-center` or `text-left`|
| (3) Bottom-left| Supporting text     | `justify-start`             |
| (4) Bottom-right| Primary CTA button | `justify-end` or `justify-center` |

**Apply Z-pattern to these page types:**
- Landing Page (KB2 Section 1)
- Product/Offer (KB2 Section 2)

**Tailwind implementation:**

```html
<!-- Z-pattern hero layout -->
<section class="min-h-[80vh] px-4 py-20 sm:px-6 lg:px-8">
  <!-- Top bar: Z points 1 and 2 -->
  <nav class="flex items-center justify-between">
    <div><!-- (1) Logo --></div>
    <div class="flex items-center gap-4"><!-- (2) Nav + CTA --></div>
  </nav>

  <!-- Diagonal: center content draws eye down -->
  <div class="mx-auto mt-20 max-w-4xl text-center">
    <h1 class="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
      <!-- Headline -->
    </h1>
  </div>

  <!-- Bottom: Z points 3 and 4 -->
  <div class="mx-auto mt-12 flex max-w-2xl items-center justify-center gap-4">
    <span><!-- (3) Supporting text --></span>
    <button><!-- (4) Primary CTA --></button>
  </div>
</section>
```

### 2.2 F-Pattern (Content Pages, Dashboards)

Used for text-heavy pages where users scan content top-to-bottom, reading more on the left.

```
+-------------------------------------------------------------+
|                                                             |
|  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX  (1st scan line)  |
|  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                   |
|                                                             |
|  XXXXXXXXXXXXXXXXXXXXXXXXXX                (2nd scan line)  |
|  XXXXXXXXXXXXXXXXXXXXXXXXXX                                 |
|                                                             |
|  XXXXXXXXXXXX                              (diminishing)    |
|  XXXXXXXXXXXX                                               |
|                                                             |
|  XXXXXXX                                   (left column    |
|  XXXXXXX                                    scanning)      |
|  XXXXXXX                                                   |
|                                                             |
+-------------------------------------------------------------+

Reading pattern:  -------->
                  -------->
                  ----->
                  --->
                  -->
                  |
                  | (vertical scan down left edge)
                  |
```

**Design rules for F-pattern:**

| Area              | Content to Place                      | Tailwind Strategy             |
|-------------------|---------------------------------------|-------------------------------|
| Top (1st bar)     | Most important info, page title       | Full-width, bold heading      |
| 2nd bar           | Subheading, key summary               | Slightly shorter line         |
| Left column       | Headings, labels, navigation          | `text-left`, strong font-weight|
| Right column      | Supporting details, secondary info    | `text-muted-foreground`       |

**Apply F-pattern to these page types:**
- Content/Blog (KB2 Section 5)
- Dashboard (KB2 Section 3)
- Settings/Profile (KB2 Section 6)

**Tailwind implementation:**

```html
<!-- F-pattern content layout -->
<article class="prose prose-lg dark:prose-invert mx-auto max-w-prose">
  <!-- 1st scan bar: bold headline, full attention -->
  <h1 class="text-4xl font-bold tracking-tight">
    Article Title Gets Full Attention
  </h1>

  <!-- 2nd scan bar: lead paragraph, key info -->
  <p class="text-lg font-medium leading-relaxed text-muted-foreground">
    Lead paragraph summarizes the key point of the article.
  </p>

  <!-- Content follows F diminishing pattern -->
  <h2>Section Heading</h2>
  <p>Body content scanned left-to-right, diminishing...</p>

  <h2>Another Section</h2>
  <p>Users scan left edge for headings, dip into content...</p>
</article>
```

### Pattern Selection Matrix

| Page Type         | Primary Pattern | Secondary Pattern | Reasoning                          |
|-------------------|-----------------|-------------------|------------------------------------|
| Landing Page      | Z-pattern       | --                | Visual, scannable, conversion-focused |
| Product/Offer     | Z-pattern       | F-pattern (FAQ)   | Visual hero, F-pattern for details |
| Dashboard         | F-pattern       | --                | Data scanning, left-nav anchor     |
| Auth Flow         | Center-focus    | --                | Single focal point (the form)      |
| Blog/Article      | F-pattern       | --                | Text-heavy, sequential reading     |
| Settings/Profile  | F-pattern       | --                | Form scanning, left-nav labels     |

---

## 3. Content-First Design Principles

### Principle 1: Content Shapes Layout, Not the Reverse

The copy brief determines section count, section order, and relative emphasis. Layout adapts to content needs.

| Content Signal                      | Layout Response                                     |
|-------------------------------------|-----------------------------------------------------|
| Long headline (10+ words)           | Use `max-w-4xl` or `max-w-3xl` to contain          |
| Short headline (3-5 words)          | Can use larger `text-7xl` or `text-8xl`             |
| Many features (6+)                  | Use 3-column grid or tabbed interface               |
| Few features (3)                    | Use 3-column grid with generous spacing             |
| Long testimonials                   | Use carousel/slider or single-column layout         |
| Short testimonials                  | Use 3-column card grid                              |
| Complex pricing (4+ tiers)          | Use horizontal scroll table or Tabs                 |
| Simple pricing (2-3 tiers)          | Use card grid side by side                          |

### Principle 2: Hierarchy Follows Content Priority

The most important message gets the most visual weight (size, position, contrast).

| Content Priority | Visual Treatment                                     |
|------------------|------------------------------------------------------|
| Primary (headline, CTA) | Largest size, highest contrast, prime position |
| Secondary (subheadline, features) | Medium size, standard contrast        |
| Tertiary (metadata, footer) | Smallest size, `text-muted-foreground`       |

### Principle 3: Every Section Has One Job

Each page section should communicate exactly one message or accomplish one goal.

| Section Type   | The One Job                           | Failure Signal                     |
|----------------|---------------------------------------|------------------------------------|
| Hero           | State value proposition               | Multiple competing messages        |
| Features       | Show capabilities                     | Mixing features with testimonials  |
| Social Proof   | Build trust                           | Asking for action too early        |
| Pricing        | Enable comparison and decision        | Too much marketing copy            |
| CTA            | Drive single action                   | Multiple competing buttons         |
| FAQ            | Handle objections                     | Introducing new features           |

---

## 4. Visual Weight Rules

Visual weight determines where the eye goes first. Use these rules to guide attention.

### The Four Forces of Visual Weight

| Force         | Definition                            | High Weight                    | Low Weight                    |
|---------------|---------------------------------------|--------------------------------|-------------------------------|
| **Size**      | Larger elements attract first         | `text-7xl`, large images       | `text-sm`, small icons        |
| **Contrast**  | High contrast stands out              | `text-foreground` on `bg-background` | `text-muted-foreground`  |
| **Proximity** | Isolated elements get attention       | Element with generous `m-12`   | Dense group of items          |
| **Repetition**| Patterns create rhythm, breaks get focus | Breaking the grid pattern   | Uniform grid of cards         |

### Visual Weight in Tailwind

| Weight Level | Size               | Color                       | Spacing              | Font               |
|-------------|--------------------|-----------------------------|----------------------|--------------------|
| Heavy       | `text-5xl`+        | `text-foreground`           | `my-12`+ (isolated)  | `font-bold`+       |
| Medium      | `text-xl`-`text-3xl`| `text-foreground`          | `my-6`-`my-8`        | `font-semibold`    |
| Light       | `text-base`        | `text-muted-foreground`     | `my-4`               | `font-normal`      |
| Feather     | `text-xs`-`text-sm`| `text-muted-foreground`     | `my-2`               | `font-normal`      |

### CTA Button Visual Weight

| Priority  | Tailwind Variant                              | Use Case                     |
|-----------|-----------------------------------------------|------------------------------|
| Primary   | `bg-primary text-primary-foreground px-8 py-4 text-lg font-semibold` | Main conversion action |
| Secondary | `border border-border bg-background text-foreground px-6 py-3` | Alternative action    |
| Tertiary  | `text-primary underline font-medium`          | Soft action (learn more)     |
| Ghost     | `text-muted-foreground text-sm`               | Minor action (skip, dismiss) |

### Visual Hierarchy Checklist

For any page section, verify:

1. **Is the most important element the largest?** (Size)
2. **Does the primary CTA have the highest contrast?** (Contrast)
3. **Is the CTA isolated enough to stand out?** (Proximity)
4. **Does breaking the pattern draw attention where needed?** (Repetition)

---

## 5. Handoff Template: Copy Squad to Design Squad

When the Copy Squad delivers content to the Design Squad for page composition, use this structured briefing format.

### Page Brief Template

```yaml
page_brief:
  id: "brief-{page-type}-{date}"
  page_type: "landing | product | dashboard | auth | blog | settings"
  copy_framework: "AIDA | PAS | StoryBrand"

  target_audience:
    awareness_level: "unaware | problem-aware | solution-aware | product-aware | most-aware"
    primary_persona: "description of target user"

  sections:
    - id: "hero"
      framework_phase: "Attention | Problem | Character"
      headline: "The actual headline copy"
      subheadline: "The actual subheadline copy"
      cta_primary:
        text: "CTA button text"
        action: "URL or action"
      cta_secondary:
        text: "Secondary button text"
        action: "URL or action"
      visual_note: "Hero image description or requirement"
      priority: 1

    - id: "features"
      framework_phase: "Interest | Solution | Plan"
      section_title: "Section heading"
      items:
        - title: "Feature 1 title"
          description: "Feature 1 description"
          icon: "icon-name or description"
        - title: "Feature 2 title"
          description: "Feature 2 description"
          icon: "icon-name or description"
      layout_hint: "3-column grid"
      priority: 2

    - id: "social-proof"
      framework_phase: "Desire | Guide"
      testimonials:
        - quote: "Testimonial text"
          author: "Name"
          role: "Title, Company"
          avatar: "path or placeholder"
      logos:
        - name: "Company 1"
        - name: "Company 2"
      priority: 3

    - id: "pricing"
      framework_phase: "Action | Solution"
      plans:
        - name: "Starter"
          price: "$19/mo"
          features: ["Feature 1", "Feature 2"]
          cta: "Get Started"
          highlighted: false
        - name: "Pro"
          price: "$49/mo"
          features: ["Feature 1", "Feature 2", "Feature 3"]
          cta: "Get Started"
          highlighted: true
      priority: 4

    - id: "cta-final"
      framework_phase: "Action | CTA"
      headline: "Final CTA headline"
      cta_text: "CTA button text"
      priority: 5

  design_constraints:
    layout_pattern: "hero-content"  # Reference KB1
    spacing_strategy: "generous"     # Reference KB4
    eye_pattern: "z-pattern"         # Reference this KB (KB5)
    max_width: "max-w-screen-xl"
    color_scheme: "light | dark | auto"

  notes: "Any additional context for the design squad"
```

### Brief Validation Checklist

Before handoff, verify the brief contains:

| Check                                    | Required |
|------------------------------------------|----------|
| Page type identified                     | Yes      |
| Copy framework specified                 | Yes      |
| All sections have headline + body copy   | Yes      |
| All CTAs have button text + action       | Yes      |
| Section priority order defined           | Yes      |
| Layout pattern referenced (KB1)          | Yes      |
| Spacing strategy referenced (KB4)        | Yes      |
| Target audience awareness level set      | Yes      |
| Visual notes for image-dependent sections| Yes      |

---

## 6. Section to Component Quick Map

Combining KB2 component maps with copy framework phases for rapid composition.

### AIDA Sections to shadcn/ui Components

| AIDA Phase | Section          | Primary Components                           | Visual Weight |
|------------|------------------|----------------------------------------------|---------------|
| Attention  | Hero             | Button, Badge                                | Heavy         |
| Interest   | Features         | Card, CardHeader, CardTitle, CardDescription | Medium        |
| Interest   | Benefits/Stats   | Card, Badge, Progress                        | Medium        |
| Desire     | Testimonials     | Card, Avatar, Separator                      | Medium        |
| Desire     | Pricing          | Card, Button, Badge, Tabs, Separator         | Medium-Heavy  |
| Action     | Final CTA        | Button (large), Input (optional)             | Heavy         |

### PAS Sections to shadcn/ui Components

| PAS Phase  | Section          | Primary Components                           | Visual Weight |
|------------|------------------|----------------------------------------------|---------------|
| Problem    | Hero             | Button, Badge                                | Heavy         |
| Agitate    | Pain Points      | Card, Badge (warning style)                  | Medium        |
| Agitate    | Benefits         | Card, CardContent                            | Medium        |
| Solution   | Demo             | Tabs, TabsContent, Dialog                    | Medium-Heavy  |
| Solution   | How It Works     | Card (step), Badge (numbers), Separator      | Medium        |
| Solution   | Pricing          | Card, Button, Badge, Tabs                    | Medium-Heavy  |
| Solution   | Final CTA        | Button (large)                               | Heavy         |

### StoryBrand Sections to shadcn/ui Components

| SB Element | Section          | Primary Components                           | Visual Weight |
|------------|------------------|----------------------------------------------|---------------|
| Character  | Hero             | Button, Badge                                | Heavy         |
| Problem    | Problem          | Card (with contrast border)                  | Medium-Heavy  |
| Guide      | Social Proof     | Avatar, Badge, Card                          | Medium        |
| Plan       | How It Works     | Card (step), Badge (numbered), Separator     | Medium        |
| CTA        | CTA sections     | Button (primary + transitional)              | Heavy         |
| Success    | Testimonials     | Card, Avatar, Separator                      | Medium        |
| Failure    | Stakes (optional)| Card (muted/warning), Badge                  | Light-Medium  |

---

## 7. Cross-References

- **Page templates and section details:** See [page-type-patterns.md](page-type-patterns.md) (KB2)
- **Typography for headlines and body:** See [typography-hierarchy-rules.md](typography-hierarchy-rules.md) (KB3)
- **Spacing strategies per page type:** See [spacing-rhythm-system.md](spacing-rhythm-system.md) (KB4)
- **Layout patterns for section arrangement:** See [page-layout-framework.md](page-layout-framework.md) (KB1)

---

## 8. References

- CXL Institute: Visual Hierarchy and Eye-Tracking Research
- StoryBrand Web Design Guide (Donald Miller / Building a StoryBrand)
- Nielsen Norman Group: F-Shaped Pattern of Reading on the Web
- Copyhackers: Conversion Copywriting Frameworks
- Joanna Wiebe (Copyhackers): AIDA, PAS, and page structure
- Tailwind CSS v4: Layout and typography utilities
