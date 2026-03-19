---
title: "Page Layout Framework"
purpose: "Define grid systems, breakpoints, responsive techniques, and reusable layout patterns with concrete Tailwind CSS v4 classes for the Page Composer agent"
version: "1.0.0"
source: "Research: docs/research/2026-03-06-page-composition-ai-agents/"
created: "2026-03-06"
---

# Page Layout Framework

## 1. Baseline Grid System

### 1.1 Hybrid 4px Grid

All spatial values derive from a **4px base unit**. The grid operates in two modes:

| Mode   | Unit | Use Case                                      | Tailwind Multiplier |
|--------|------|-----------------------------------------------|---------------------|
| Fine   | 4px  | Icon padding, border radius, small gaps       | 1 unit = `1` (0.25rem) |
| Coarse | 8px  | Component spacing, margins, padding, gutters  | 2 units = `2` (0.5rem) |

**Rule:** Use fine (4px) for internal component adjustments. Use coarse (8px) for all layout-level spacing.

Valid spacing values (px): 0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128, 160, 192, 256.

### 1.2 12-Column Grid

The page grid uses 12 columns with responsive gutters:

| Breakpoint | Columns | Gutter          | Margin           | Tailwind Grid               |
|------------|---------|-----------------|------------------|------------------------------|
| default    | 4       | `gap-4` (16px)  | `px-4` (16px)    | `grid grid-cols-4 gap-4`    |
| sm (640px) | 4       | `gap-4` (16px)  | `px-6` (24px)    | `sm:grid-cols-4 sm:gap-4`   |
| md (768px) | 8       | `gap-6` (24px)  | `px-6` (24px)    | `md:grid-cols-8 md:gap-6`   |
| lg (1024px)| 12      | `gap-6` (24px)  | `px-8` (32px)    | `lg:grid-cols-12 lg:gap-6`  |
| xl (1280px)| 12      | `gap-8` (32px)  | `px-8` (32px)    | `xl:grid-cols-12 xl:gap-8`  |
| 2xl(1536px)| 12      | `gap-8` (32px)  | `px-12` (48px)   | `2xl:grid-cols-12 2xl:gap-8`|

```html
<!-- Standard 12-column page grid -->
<div class="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
  <div class="grid grid-cols-4 gap-4 md:grid-cols-8 md:gap-6 lg:grid-cols-12 lg:gap-6 xl:gap-8">
    <!-- columns here -->
  </div>
</div>
```

---

## 2. Tailwind CSS v4 Breakpoints

| Name     | Min Width | Prefix | Target Devices            |
|----------|-----------|--------|---------------------------|
| default  | 0px       | (none) | Mobile phones (portrait)  |
| `sm`     | 640px     | `sm:`  | Mobile phones (landscape) |
| `md`     | 768px     | `md:`  | Tablets (portrait)        |
| `lg`     | 1024px    | `lg:`  | Tablets (landscape), small laptops |
| `xl`     | 1280px    | `xl:`  | Laptops, desktops         |
| `2xl`    | 1536px    | `2xl:` | Large desktops, ultra-wide|

**Approach:** Mobile-first. Write base styles for mobile, then layer up with `sm:`, `md:`, `lg:`, `xl:`, `2xl:`.

---

## 3. Five Responsive Techniques (Fluent 2)

| # | Technique      | When to Use                        | Tailwind Implementation                                     |
|---|----------------|------------------------------------|--------------------------------------------------------------|
| 1 | **Reposition** | Move elements to new locations     | `flex-col lg:flex-row`, `order-1 lg:order-2`                |
| 2 | **Resize**     | Scale elements proportionally      | `w-full lg:w-1/2`, `text-base lg:text-xl`                   |
| 3 | **Reflow**     | Change grid column count           | `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`                 |
| 4 | **Show/Hide**  | Toggle visibility per breakpoint   | `hidden lg:block`, `block md:hidden`                         |
| 5 | **Re-architect**| Completely change layout structure | `block lg:hidden` (mobile nav) + `hidden lg:flex` (desktop nav) |

### Technique Decision Matrix

| Content Type   | Mobile          | Tablet            | Desktop           |
|----------------|-----------------|-------------------|-------------------|
| Navigation     | Re-architect    | Reposition        | (full nav)        |
| Hero section   | Resize          | Resize            | (full size)       |
| Card grid      | Reflow (1-col)  | Reflow (2-col)    | Reflow (3-4 col)  |
| Sidebar        | Show/Hide       | Reposition        | (sidebar visible) |
| Data table     | Re-architect    | Resize            | (full table)      |
| Footer columns | Reflow          | Reflow            | (multi-column)    |

---

## 4. Container Widths

| Tailwind Class        | Max Width | Use Case                              |
|-----------------------|-----------|---------------------------------------|
| `max-w-sm`            | 384px     | Compact cards, auth forms             |
| `max-w-md`            | 448px     | Modals, medium cards                  |
| `max-w-lg`            | 512px     | Form containers, dialogs              |
| `max-w-xl`            | 576px     | Wide forms, content cards             |
| `max-w-2xl`           | 672px     | Blog content, article body            |
| `max-w-3xl`           | 768px     | Wide content, reading pages           |
| `max-w-4xl`           | 896px     | Feature sections                      |
| `max-w-5xl`           | 1024px    | Standard page container               |
| `max-w-6xl`           | 1152px    | Wide page layouts                     |
| `max-w-7xl`           | 1280px    | Full-width sections                   |
| `max-w-screen-sm`     | 640px     | Narrow page layouts                   |
| `max-w-screen-md`     | 768px     | Tablet-optimized layouts              |
| `max-w-screen-lg`     | 1024px    | Standard desktop content              |
| `max-w-screen-xl`     | 1280px    | Default page container (recommended)  |
| `max-w-screen-2xl`    | 1536px    | Ultra-wide layouts                    |
| `max-w-prose`         | 65ch      | Optimal reading width (body text)     |
| `max-w-full`          | 100%      | Full bleed sections                   |

**Default page container:** `mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8`

---

## 5. Layout Patterns

### 5.1 Sidebar-Main

**Description:** Fixed sidebar for navigation + scrollable main content area. Primary pattern for dashboards and settings.

```
+------------------+---------------------------------------------+
|                  |                                             |
|    SIDEBAR       |              MAIN CONTENT                   |
|    (fixed)       |              (scrollable)                   |
|                  |                                             |
|  [Nav Item 1]   |  +---------------------------------------+  |
|  [Nav Item 2]   |  |  Content Area                         |  |
|  [Nav Item 3]   |  |                                       |  |
|  [Nav Item 4]   |  |                                       |  |
|                  |  +---------------------------------------+  |
|                  |                                             |
|                  |                                             |
+------------------+---------------------------------------------+

Mobile: Sidebar collapses to Sheet/Drawer (Re-architect)
```

**Tailwind Implementation:**

```html
<div class="flex h-screen">
  <!-- Sidebar: hidden on mobile, visible on lg+ -->
  <aside class="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-border">
    <nav class="flex-1 overflow-y-auto p-4">
      <!-- NavigationMenu items -->
    </nav>
  </aside>

  <!-- Main content: scrollable -->
  <main class="flex-1 overflow-y-auto">
    <div class="mx-auto max-w-screen-xl px-4 py-6 sm:px-6 lg:px-8">
      <!-- Content here -->
    </div>
  </main>
</div>
```

| Property         | Value                                    |
|------------------|------------------------------------------|
| Sidebar width    | `w-64` (256px)                           |
| Sidebar border   | `border-r border-border`                 |
| Main overflow    | `overflow-y-auto`                        |
| Mobile behavior  | `hidden lg:flex` + Sheet component       |
| Column span      | Sidebar: 2-3 cols, Main: 9-10 cols       |

**Compatible page types:** Dashboard (KB2), Settings/Profile (KB2)

---

### 5.2 Hero-Content

**Description:** Full-width hero section at top followed by stacked content sections below. Standard for marketing and landing pages.

```
+-------------------------------------------------------------+
|                                                             |
|                     HERO SECTION                            |
|                   (full width, tall)                        |
|                                                             |
|              [Headline]                                     |
|              [Subheading]                                   |
|              [CTA Button]                                   |
|                                                             |
+-------------------------------------------------------------+
|                                                             |
|  +------------------+  +------------------+  +----------+   |
|  |    Feature 1     |  |    Feature 2     |  | Feature 3|   |
|  +------------------+  +------------------+  +----------+   |
|                                                             |
+-------------------------------------------------------------+
|                                                             |
|                    CONTENT SECTION                           |
|                  (contained width)                           |
|                                                             |
+-------------------------------------------------------------+
|                       FOOTER                                |
+-------------------------------------------------------------+
```

**Tailwind Implementation:**

```html
<div class="flex min-h-screen flex-col">
  <!-- Hero: full bleed -->
  <section class="flex min-h-[60vh] items-center justify-center bg-background px-4 py-20 sm:px-6 lg:min-h-[80vh] lg:px-8">
    <div class="mx-auto max-w-4xl text-center">
      <h1 class="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
        <!-- Headline -->
      </h1>
      <p class="mt-6 text-lg text-muted-foreground sm:text-xl">
        <!-- Subheading -->
      </p>
      <div class="mt-10 flex items-center justify-center gap-4">
        <!-- CTA Buttons -->
      </div>
    </div>
  </section>

  <!-- Features: contained -->
  <section class="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
    <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      <!-- Feature Cards -->
    </div>
  </section>

  <!-- Additional sections follow same container pattern -->
</div>
```

| Property         | Value                                         |
|------------------|-----------------------------------------------|
| Hero height      | `min-h-[60vh] lg:min-h-[80vh]`               |
| Hero width       | Full bleed (no max-width on section)          |
| Content container| `max-w-screen-xl` or `max-w-4xl` for text    |
| Section spacing  | `py-16 sm:py-20 lg:py-24`                    |
| Feature grid     | `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`  |

**Compatible page types:** Landing Page (KB2), Product/Offer (KB2)

---

### 5.3 Split-Screen

**Description:** Two equal columns side by side. Used for auth flows, comparison layouts, and visual/text pairings.

```
+-----------------------------+-----------------------------+
|                             |                             |
|         LEFT PANEL          |        RIGHT PANEL          |
|                             |                             |
|     [Image / Branding]      |     [Form / Content]        |
|                             |                             |
|                             |     [Input Field]           |
|                             |     [Input Field]           |
|                             |     [Submit Button]         |
|                             |                             |
+-----------------------------+-----------------------------+

Mobile: Stacks vertically (Reposition), left panel may hide (Show/Hide)
```

**Tailwind Implementation:**

```html
<div class="flex min-h-screen flex-col lg:flex-row">
  <!-- Left panel: hidden on mobile or shown as header -->
  <div class="hidden bg-muted lg:flex lg:w-1/2 lg:items-center lg:justify-center">
    <div class="max-w-md p-8">
      <!-- Branding / Image / Illustration -->
    </div>
  </div>

  <!-- Right panel: full width on mobile, half on desktop -->
  <div class="flex w-full items-center justify-center px-4 py-12 lg:w-1/2 lg:px-8">
    <div class="mx-auto w-full max-w-sm">
      <!-- Form / Content -->
    </div>
  </div>
</div>
```

| Property         | Value                                         |
|------------------|-----------------------------------------------|
| Column split     | `lg:w-1/2` each                               |
| Mobile behavior  | `flex-col lg:flex-row` (Reposition)           |
| Left panel       | `hidden lg:flex` (Show/Hide on mobile)        |
| Content max-w    | `max-w-sm` to `max-w-md` per panel           |
| Min height       | `min-h-screen`                                |

**Compatible page types:** Auth Flow (KB2)

---

### 5.4 Centered-Narrow (Manuscript)

**Description:** Single centered column optimized for reading. Content-focused layout with generous whitespace.

```
+-------------------------------------------------------------+
|                         HEADER/NAV                          |
+-------------------------------------------------------------+
|                                                             |
|            +-------------------------------+                |
|            |                               |                |
|            |         ARTICLE TITLE         |                |
|            |                               |                |
|            |    Body text flows here in    |                |
|            |    a narrow column optimized  |                |
|            |    for reading at 65-75       |                |
|            |    characters per line.       |                |
|            |                               |                |
|            |    Images can break out to    |                |
|            |    wider width if needed.     |                |
|            |                               |                |
|            +-------------------------------+                |
|                                                             |
+-------------------------------------------------------------+
|                          FOOTER                             |
+-------------------------------------------------------------+
```

**Tailwind Implementation:**

```html
<div class="min-h-screen">
  <!-- Header -->
  <header class="border-b border-border">
    <div class="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
      <!-- Nav -->
    </div>
  </header>

  <!-- Article content: narrow centered -->
  <main class="mx-auto max-w-prose px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
    <article class="prose prose-lg dark:prose-invert">
      <h1><!-- Title --></h1>
      <p><!-- Body text at optimal reading width --></p>
    </article>
  </main>

  <!-- Breakout image (wider than prose) -->
  <figure class="mx-auto max-w-4xl px-4 py-8 sm:px-6">
    <img class="w-full rounded-lg" />
  </figure>

  <!-- Back to narrow -->
  <div class="mx-auto max-w-prose px-4 sm:px-6">
    <!-- More content -->
  </div>
</div>
```

| Property         | Value                                         |
|------------------|-----------------------------------------------|
| Content width    | `max-w-prose` (65ch) or `max-w-2xl` (672px)  |
| Breakout width   | `max-w-4xl` or `max-w-screen-lg`             |
| Typography       | `prose prose-lg dark:prose-invert`            |
| Vertical padding | `py-12 sm:py-16 lg:py-20`                    |
| Line length      | 65-75 characters (enforced by max-w-prose)    |

**Compatible page types:** Content/Blog (KB2)

---

### 5.5 Dashboard

**Description:** Three-region layout with sidebar navigation, top bar, and main content area containing grid of widgets.

```
+------------------+---------------------------------------------+
|                  |              TOP BAR                        |
|                  |  [Search]            [Notifications] [User] |
|                  +---------------------------------------------+
|                  |                                             |
|    SIDEBAR       |  +----------+  +----------+  +----------+  |
|                  |  |  KPI 1   |  |  KPI 2   |  |  KPI 3   |  |
|  [Dashboard]     |  +----------+  +----------+  +----------+  |
|  [Analytics]     |                                             |
|  [Users]         |  +----------------------+  +------------+  |
|  [Settings]      |  |                      |  |            |  |
|                  |  |    CHART / TABLE      |  |  ACTIVITY  |  |
|                  |  |                      |  |    FEED    |  |
|                  |  |                      |  |            |  |
|                  |  +----------------------+  +------------+  |
|                  |                                             |
+------------------+---------------------------------------------+

Mobile: Sidebar = Sheet, Top bar = simplified, KPIs stack, Grid = 1 col
```

**Tailwind Implementation:**

```html
<div class="flex h-screen overflow-hidden">
  <!-- Sidebar -->
  <aside class="hidden w-64 flex-shrink-0 border-r border-border lg:block">
    <div class="flex h-full flex-col">
      <div class="flex h-16 items-center border-b border-border px-6">
        <!-- Logo -->
      </div>
      <nav class="flex-1 overflow-y-auto p-4">
        <!-- NavigationMenu -->
      </nav>
    </div>
  </aside>

  <!-- Main area -->
  <div class="flex flex-1 flex-col overflow-hidden">
    <!-- Top bar -->
    <header class="flex h-16 items-center justify-between border-b border-border px-4 lg:px-6">
      <div class="flex items-center gap-4">
        <!-- Mobile menu trigger (Sheet) -->
        <!-- Search -->
      </div>
      <div class="flex items-center gap-4">
        <!-- Notifications, User menu -->
      </div>
    </header>

    <!-- Dashboard content -->
    <main class="flex-1 overflow-y-auto p-4 lg:p-6">
      <!-- KPI row -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <!-- KPI Cards -->
      </div>

      <!-- Charts + Activity -->
      <div class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div class="lg:col-span-2">
          <!-- Chart / Table -->
        </div>
        <div>
          <!-- Activity Feed -->
        </div>
      </div>
    </main>
  </div>
</div>
```

| Property         | Value                                         |
|------------------|-----------------------------------------------|
| Sidebar width    | `w-64` (256px)                                |
| Top bar height   | `h-16` (64px)                                 |
| KPI grid         | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` |
| Main grid        | `lg:grid-cols-3` with `lg:col-span-2`        |
| Content padding  | `p-4 lg:p-6`                                  |
| Mobile sidebar   | Sheet component triggered by hamburger        |
| Overflow         | `h-screen overflow-hidden` on root, `overflow-y-auto` on main |

**Compatible page types:** Dashboard (KB2)

---

## 6. Layout Selection Guide

| Page Type          | Primary Pattern      | Fallback Pattern   | KB2 Reference     |
|--------------------|----------------------|--------------------|--------------------|
| Landing Page       | hero-content         | --                 | Landing Page       |
| Product/Offer      | hero-content         | --                 | Product/Offer      |
| Dashboard          | dashboard            | sidebar-main       | Dashboard          |
| Auth (Login/Signup)| split-screen         | centered-narrow    | Auth Flow          |
| Blog/Article       | centered-narrow      | hero-content       | Content/Blog       |
| Settings/Profile   | sidebar-main         | --                 | Settings/Profile   |
| Documentation      | sidebar-main         | centered-narrow    | --                 |
| Error (404/500)    | centered-narrow      | --                 | --                 |

---

## 7. Cross-References

- **Spacing values and vertical rhythm:** See [spacing-rhythm-system.md](spacing-rhythm-system.md) (KB4)
- **Page type implementations:** See [page-type-patterns.md](page-type-patterns.md) (KB2)
- **Typography within layouts:** See [typography-hierarchy-rules.md](typography-hierarchy-rules.md) (KB3)
- **Copy-driven layout selection:** See [copy-to-layout-bridge.md](copy-to-layout-bridge.md) (KB5)

---

## 8. References

- Fluent 2 Layout System (Microsoft): responsive techniques, grid fundamentals
- CSS Grid Layout Module Level 2 (W3C)
- Tailwind CSS v4 documentation: grid, flexbox, responsive design
- Every Layout (Heydon Pickering & Andy Bell): intrinsic layout patterns
