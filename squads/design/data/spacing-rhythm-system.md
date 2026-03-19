---
title: "Spacing & Rhythm System"
purpose: "Define the 4px baseline grid, spacing tokens, whitespace strategies, vertical rhythm, and section spacing for the Page Composer agent"
version: "1.0.0"
source: "Research: docs/research/2026-03-06-page-composition-ai-agents/"
created: "2026-03-06"
---

# Spacing & Rhythm System

## 1. Base Unit: 4px Hybrid Grid

All spacing derives from a **4px base unit** operating in two modes:

| Mode       | Base   | Multiplier | Use Case                                        |
|------------|--------|------------|--------------------------------------------------|
| **Fine**   | 4px    | 1x         | Icon gaps, border radius, tight component internals |
| **Coarse** | 8px    | 2x         | Layout margins, paddings, gaps, section spacing  |

**Rule:** Layout-level spacing MUST use coarse (8px multiples). Fine (4px) is reserved for internal component adjustments only.

---

## 2. Complete Spacing Token Table

| Token     | px Value | rem Value | Tailwind Class | Grid Units | Use Case                           |
|-----------|----------|-----------|----------------|------------|------------------------------------|
| space-0   | 0px      | 0rem      | `p-0` `m-0` `gap-0` | 0       | Reset, collapse                    |
| space-px  | 1px      | 1px       | `p-px` `m-px`  | --         | Hairline borders, dividers         |
| space-0.5 | 2px      | 0.125rem  | `p-0.5` `m-0.5`| 0.5       | Micro adjustments                  |
| space-1   | 4px      | 0.25rem   | `p-1` `m-1` `gap-1` | 1 fine  | Icon padding, tight gaps           |
| space-1.5 | 6px      | 0.375rem  | `p-1.5` `m-1.5`| 1.5       | Small component padding            |
| space-2   | 8px      | 0.5rem    | `p-2` `m-2` `gap-2` | 1 coarse| Input padding, small gaps          |
| space-2.5 | 10px     | 0.625rem  | `p-2.5` `m-2.5`| 2.5       | Button padding (fine tune)         |
| space-3   | 12px     | 0.75rem   | `p-3` `m-3` `gap-3` | 3 fine  | Card internal padding              |
| space-3.5 | 14px     | 0.875rem  | `p-3.5` `m-3.5`| 3.5       | Fine-tuned spacing                 |
| space-4   | 16px     | 1rem      | `p-4` `m-4` `gap-4` | 2 coarse| Standard component padding, gaps   |
| space-5   | 20px     | 1.25rem   | `p-5` `m-5` `gap-5` | 5 fine  | Generous component padding         |
| space-6   | 24px     | 1.5rem    | `p-6` `m-6` `gap-6` | 3 coarse| Standard section padding, card body|
| space-7   | 28px     | 1.75rem   | `p-7` `m-7`   | 7 fine     | Transitional spacing               |
| space-8   | 32px     | 2rem      | `p-8` `m-8` `gap-8` | 4 coarse| Large padding, section gaps        |
| space-9   | 36px     | 2.25rem   | `p-9` `m-9`   | 9 fine     | Subsection breaks                  |
| space-10  | 40px     | 2.5rem    | `p-10` `m-10`  | 5 coarse   | Large component spacing            |
| space-11  | 44px     | 2.75rem   | `p-11` `m-11`  | 11 fine    | Transitional                       |
| space-12  | 48px     | 3rem      | `p-12` `m-12`  | 6 coarse   | Section padding, major gaps        |
| space-14  | 56px     | 3.5rem    | `p-14` `m-14`  | 7 coarse   | Large section gaps                 |
| space-16  | 64px     | 4rem      | `p-16` `m-16`  | 8 coarse   | Page-level section spacing         |
| space-20  | 80px     | 5rem      | `p-20` `m-20`  | 10 coarse  | Hero padding, generous sections    |
| space-24  | 96px     | 6rem      | `p-24` `m-24`  | 12 coarse  | Maximum section spacing            |

### Quick Reference: Most Used Values

| Context               | Tailwind | px  | Why                                          |
|-----------------------|----------|-----|----------------------------------------------|
| Icon gap              | `gap-1`  | 4px | Tight pairing of icon + text                 |
| Input padding         | `p-2`   | 8px | Standard form field internal padding         |
| Card padding          | `p-4`   | 16px| Comfortable card internal spacing            |
| Card body padding     | `p-6`   | 24px| Generous card sections                       |
| Grid gap (cards)      | `gap-4`  | 16px| Standard grid gutter                         |
| Grid gap (sections)   | `gap-6`  | 24px| Wider section-level grid gutter              |
| Section vertical pad  | `py-16`  | 64px| Standard section vertical rhythm             |
| Hero vertical pad     | `py-20`  | 80px| Generous hero section padding                |
| Page horizontal pad   | `px-4`   | 16px| Mobile page margin                           |
| Page horizontal pad   | `lg:px-8`| 32px| Desktop page margin                         |

---

## 3. Law of Proximity

**Principle:** Elements that are related should be closer together; elements that are unrelated should be farther apart. Spacing communicates grouping.

### Proximity Hierarchy

| Relationship            | Spacing      | Tailwind   | Example                              |
|-------------------------|-------------|------------|--------------------------------------|
| **Intimate** (same item)| 4-8px       | `gap-1` to `gap-2` | Label + input, icon + text     |
| **Close** (same group)  | 8-16px      | `gap-2` to `gap-4` | Form fields in a group, list items |
| **Related** (same section)| 16-24px   | `gap-4` to `gap-6` | Cards in a grid, paragraph spacing |
| **Separate** (different sections)| 32-64px | `gap-8` to `gap-16` | Section to section           |
| **Distinct** (major breaks)| 64-96px  | `gap-16` to `gap-24`| Page-level section breaks       |

### Visual Example

```
+------------------------------------------+
| SECTION A                                |
|                                          |
| [Label]          <-- 4px gap (intimate)  |
| [Input Field]                            |
|                  <-- 16px gap (close)     |
| [Label]                                  |
| [Input Field]                            |
|                                          |
+------------------------------------------+
                   <-- 48px gap (separate)
+------------------------------------------+
| SECTION B                                |
|                                          |
| [Card 1] [Card 2] [Card 3]              |
|     ^-- 16px gap between cards (related) |
|                                          |
+------------------------------------------+
                   <-- 64px gap (distinct)
+------------------------------------------+
| SECTION C                                |
+------------------------------------------+
```

---

## 4. Three Whitespace Strategies

### 4.1 Generous (Landing Pages, Marketing)

Prioritizes breathing room, visual elegance, and scanability. Large gaps between sections create a sense of premium quality.

| Element                | Tailwind Classes                                       |
|------------------------|--------------------------------------------------------|
| Section padding        | `py-20 sm:py-24 lg:py-32`                             |
| Section gap            | `mt-20 sm:mt-24 lg:mt-32`                             |
| Hero padding           | `py-24 sm:py-32 lg:py-40`                             |
| Content max-width      | `max-w-4xl` or `max-w-screen-xl`                      |
| Card padding           | `p-6 sm:p-8`                                          |
| Card grid gap          | `gap-6 sm:gap-8 lg:gap-10`                            |
| Heading margin bottom  | `mb-6 sm:mb-8`                                         |
| Paragraph margin       | `mb-6`                                                 |
| CTA button padding     | `px-8 py-4` or `px-10 py-5`                           |
| Feature grid gap       | `gap-8 lg:gap-12`                                      |

**Template application:** Landing Page (KB2), Product/Offer (KB2)

```html
<!-- Generous section example -->
<section class="py-20 sm:py-24 lg:py-32">
  <div class="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-3xl text-center">
      <h2 class="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
        Section Title
      </h2>
      <p class="mt-6 text-lg leading-relaxed text-muted-foreground sm:mt-8 sm:text-xl">
        Supporting description text
      </p>
    </div>
    <div class="mt-12 grid grid-cols-1 gap-8 sm:mt-16 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
      <!-- Cards with p-6 sm:p-8 -->
    </div>
  </div>
</section>
```

### 4.2 Compact (Dashboards, Data-Dense)

Prioritizes information density. Tighter spacing maximizes visible data without sacrificing usability.

| Element                | Tailwind Classes                                       |
|------------------------|--------------------------------------------------------|
| Section padding        | `py-4 lg:py-6`                                         |
| Content gap            | `gap-4`                                                |
| Page padding           | `p-4 lg:p-6`                                           |
| Card padding           | `p-3` or `p-4`                                         |
| Card grid gap          | `gap-3` or `gap-4`                                     |
| KPI card padding       | `p-4`                                                  |
| Table cell padding     | `px-3 py-2` or `px-4 py-3`                            |
| Heading margin bottom  | `mb-2` or `mb-3`                                       |
| Paragraph margin       | `mb-2`                                                 |
| Button padding         | `px-3 py-2` (default size)                             |
| Sidebar item padding   | `px-3 py-2`                                            |
| Between widgets        | `mt-4` or `mt-6`                                       |

**Template application:** Dashboard (KB2)

```html
<!-- Compact dashboard section -->
<main class="flex-1 overflow-y-auto p-4 lg:p-6">
  <!-- KPI row: tight gaps -->
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <div class="rounded-lg border border-border p-4">
      <p class="text-sm text-muted-foreground">Revenue</p>
      <p class="mt-1 text-2xl font-semibold">$24,500</p>
    </div>
  </div>

  <!-- Chart section: moderate gap -->
  <div class="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
    <div class="rounded-lg border border-border p-4 lg:col-span-2">
      <!-- Chart -->
    </div>
    <div class="rounded-lg border border-border p-4">
      <!-- Sidebar widget -->
    </div>
  </div>

  <!-- Table: tight cell padding -->
  <div class="mt-4 rounded-lg border border-border">
    <table class="w-full">
      <thead>
        <tr class="border-b border-border">
          <th class="px-4 py-3 text-left text-sm font-medium">Name</th>
        </tr>
      </thead>
      <tbody>
        <tr class="border-b border-border">
          <td class="px-4 py-3 text-sm">Data</td>
        </tr>
      </tbody>
    </table>
  </div>
</main>
```

### 4.3 Balanced (Blog, Content, Settings)

Moderate spacing that supports readability without feeling sparse or cramped. Optimized for mixed content types.

| Element                | Tailwind Classes                                       |
|------------------------|--------------------------------------------------------|
| Section padding        | `py-12 sm:py-16 lg:py-20`                             |
| Content gap            | `gap-6`                                                |
| Page padding           | `px-4 sm:px-6 lg:px-8`                                |
| Card padding           | `p-6`                                                  |
| Card grid gap          | `gap-6` or `gap-8`                                     |
| Heading margin bottom  | `mb-4` or `mb-6`                                       |
| Paragraph margin       | `mb-4`                                                 |
| Form field gap         | `space-y-4`                                            |
| Form group gap         | `space-y-6`                                            |
| Button padding         | `px-4 py-2` (default) or `px-6 py-3` (large)          |
| Section title to content| `mt-8`                                                |

**Template application:** Content/Blog (KB2), Auth Flow (KB2), Settings/Profile (KB2)

```html
<!-- Balanced blog section -->
<section class="py-12 sm:py-16 lg:py-20">
  <div class="mx-auto max-w-prose px-4 sm:px-6">
    <h2 class="text-2xl font-semibold tracking-tight sm:text-3xl">
      Section Title
    </h2>
    <div class="mt-8 space-y-6">
      <p class="text-base leading-relaxed text-foreground">
        Body text paragraph
      </p>
    </div>
  </div>
</section>

<!-- Balanced settings form -->
<div class="space-y-6">
  <div class="rounded-lg border border-border p-6">
    <h3 class="text-lg font-semibold">Profile</h3>
    <p class="mt-1 text-sm text-muted-foreground">Manage your profile</p>
    <div class="mt-6 space-y-4">
      <div class="space-y-2">
        <label class="text-sm font-medium">Name</label>
        <input class="..." />
      </div>
      <div class="space-y-2">
        <label class="text-sm font-medium">Email</label>
        <input class="..." />
      </div>
    </div>
  </div>
</div>
```

### Strategy Selection Guide

| Page Type          | Strategy     | Density | Section py        | Card p     | Grid gap   |
|--------------------|-------------|---------|-------------------|------------|------------|
| Landing Page       | Generous    | Low     | `py-20 lg:py-32`  | `p-6 sm:p-8`| `gap-8 lg:gap-12` |
| Product/Offer      | Generous    | Low     | `py-20 lg:py-32`  | `p-6 sm:p-8`| `gap-8`    |
| Dashboard          | Compact     | High    | `py-4 lg:py-6`    | `p-3`/`p-4` | `gap-3`/`gap-4` |
| Auth Flow          | Balanced    | Medium  | `py-12`            | `p-6`      | `gap-4`    |
| Blog/Content       | Balanced    | Medium  | `py-12 lg:py-20`  | `p-6`      | `gap-6`    |
| Settings/Profile   | Balanced    | Medium  | `py-8 lg:py-12`   | `p-6`      | `gap-6`    |

---

## 5. Vertical Rhythm

### Baseline: 24px

The vertical rhythm baseline is **24px** (derived from 16px base font at 1.5 line-height). All vertical spacing should align to multiples of this baseline.

| Rhythm Unit | px  | Tailwind   | Application                                  |
|-------------|-----|------------|----------------------------------------------|
| 0.5x        | 12px| `mb-3`, `mt-3`, `py-3`  | Tight internal spacing            |
| 1x          | 24px| `mb-6`, `mt-6`, `py-6`  | Standard paragraph gap            |
| 1.5x        | 36px| `mb-9`, `mt-9`          | Subsection spacing                |
| 2x          | 48px| `mb-12`, `mt-12`, `py-12`| Section breaks                   |
| 3x          | 72px| `py-18`, `mt-18`        | Major section spacing             |
| 4x          | 96px| `py-24`, `mt-24`        | Page-level gaps                   |

### Rhythm in Practice

```
24px  |  Body text line 1
24px  |  Body text line 2
24px  |  Body text line 3
      |
24px  |  (paragraph gap: 1x baseline = mb-6)
      |
24px  |  Body text line 4
24px  |  Body text line 5
      |
48px  |  (section gap: 2x baseline = mt-12)
      |
24px  |  H2 Section Title
24px  |  (gap below heading: 1x baseline = mb-6)
24px  |  Body text line 6
```

---

## 6. Section Spacing Guidelines

### Landing Page / Marketing Sections

| Between                        | Tailwind            | px   | Notes                       |
|-------------------------------|---------------------|------|-----------------------------|
| Nav to Hero                    | `pt-0` (hero has own padding) | 0 | Hero handles its own top spacing |
| Hero internal padding          | `py-20 lg:py-32`   | 80-128 | Generous breathing room   |
| Hero to Social Proof           | `py-12 lg:py-16`   | 48-64 | Moderate gap               |
| Social Proof to Features       | `py-16 lg:py-24`   | 64-96 | Full section break         |
| Features to Testimonials       | `py-16 lg:py-24`   | 64-96 | Full section break         |
| Testimonials to Pricing        | `py-16 lg:py-24`   | 64-96 | Full section break         |
| Pricing to FAQ                 | `py-16 lg:py-24`   | 64-96 | Full section break         |
| FAQ to Final CTA               | `py-16 lg:py-24`   | 64-96 | Full section break         |
| Final CTA to Footer            | `py-16 lg:py-20`   | 64-80 | Slightly tighter           |

### Dashboard Sections

| Between                        | Tailwind            | px   | Notes                       |
|-------------------------------|---------------------|------|-----------------------------|
| Top bar to content             | `pt-4 lg:pt-6`     | 16-24| Compact                     |
| Page header to KPIs            | `mt-4`              | 16   | Tight                       |
| KPIs to charts                 | `mt-4` or `mt-6`   | 16-24| Moderate compact            |
| Charts to table                | `mt-4` or `mt-6`   | 16-24| Moderate compact            |
| Table to pagination            | `mt-4`              | 16   | Tight                       |

### Blog / Content Sections

| Between                        | Tailwind            | px   | Notes                       |
|-------------------------------|---------------------|------|-----------------------------|
| Header to article title        | `pt-12 lg:pt-20`   | 48-80| Generous for readability    |
| Title to meta (date, author)   | `mt-4`              | 16   | Close association           |
| Meta to featured image         | `mt-8`              | 32   | Clear break                 |
| Featured image to body         | `mt-8`              | 32   | Clear break                 |
| Between paragraphs             | `mb-4` or `mb-6`   | 16-24| Standard rhythm             |
| Body to author bio             | `mt-12`             | 48   | Section break               |
| Author bio to related posts    | `mt-12 lg:mt-16`   | 48-64| Section break               |

---

## 7. Negative Space Patterns

### When to Add More Space

| Signal                        | Action                          | Tailwind Change            |
|-------------------------------|--------------------------------|----------------------------|
| Page feels cramped            | Increase section padding       | `py-12` to `py-16` or `py-20` |
| Cards feel cluttered          | Increase card padding          | `p-4` to `p-6`             |
| Headings crowd content        | Increase heading bottom margin | `mb-4` to `mb-6` or `mb-8` |
| Grid feels packed             | Increase grid gap              | `gap-4` to `gap-6` or `gap-8` |

### When to Reduce Space

| Signal                        | Action                          | Tailwind Change            |
|-------------------------------|--------------------------------|----------------------------|
| Too much scrolling            | Reduce section padding         | `py-20` to `py-12`         |
| Data needs density            | Tighten grid gaps              | `gap-8` to `gap-4`         |
| Related items feel separated  | Reduce gap within groups       | `gap-4` to `gap-2`         |
| Page feels disjointed         | Reduce between-section gaps    | Section `py-16` to `py-12` |

---

## 8. Cross-References

- **Grid system and layout patterns:** See [page-layout-framework.md](page-layout-framework.md) (KB1)
- **Typography vertical rhythm and heading spacing:** See [typography-hierarchy-rules.md](typography-hierarchy-rules.md) (KB3)
- **Page type spacing strategy mapping:** See [page-type-patterns.md](page-type-patterns.md) (KB2)
- **Visual weight and spacing for conversion:** See [copy-to-layout-bridge.md](copy-to-layout-bridge.md) (KB5)

---

## 9. References

- Atlassian Design System: Spacing guidelines
- Fluent 2 (Microsoft): Spacing and layout tokens
- Material Design 3 (Google): Spacing system
- 8-Point Grid System (Spec.fm / Bryn Jackson)
- Tailwind CSS v4: Spacing scale documentation
