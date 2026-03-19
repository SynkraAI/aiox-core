---
title: "Page Type Patterns"
purpose: "Define 6 reusable page templates with section structure, shadcn/ui component mapping, ASCII wireframes, and layout references for the Page Composer agent"
version: "1.0.0"
source: "Research: docs/research/2026-03-06-page-composition-ai-agents/"
created: "2026-03-06"
---

# Page Type Patterns

## How to Use This KB

Each page type below includes:

1. **Section breakdown** -- ordered list of page sections
2. **Component map** -- shadcn/ui components used per section
3. **ASCII wireframe** -- visual structure reference
4. **Layout pattern** -- reference to the layout from [page-layout-framework.md](page-layout-framework.md) (KB1)
5. **Spacing strategy** -- reference to whitespace approach from [spacing-rhythm-system.md](spacing-rhythm-system.md) (KB4)
6. **Copy framework** -- reference to copy structure from [copy-to-layout-bridge.md](copy-to-layout-bridge.md) (KB5)

---

## 0. Design Tone Vocabulary (Buzzwords → Decisoes Concretas)

Palavras de tom visual no inicio do prompt influenciam fortemente o output (validado pela Lovable "Prompting Bible"). Use esta tabela para traduzir buzzwords em decisoes de design system:

| Buzzword | Spacing (KB4) | Typography | Colors | Layout | Componentes |
|----------|---------------|------------|--------|--------|-------------|
| **minimal** | Generous | Light weights (300-400), large scale | Monocromatico, muito branco | Centrado, narrow max-w | Poucos, sem bordas, sombras sutis |
| **premium** | Generous | Serif ou display fonts, tracking wide | Dark backgrounds, gold/accent | Full-bleed hero, large images | Cards elevados, glass morphism |
| **bold** | Balanced | Heavy weights (700-900), uppercase headings | Alto contraste, cores vibrantes | Grid assimetrico, overlaps | Badges, CTAs grandes, gradients |
| **cinematic** | Generous | Display fonts, dramatic scale (1.5+ ratio) | Dark mode, spotlight accents | Full-screen sections, parallax | Hero video/image, overlay text |
| **playful** | Balanced | Rounded fonts, varied sizes | Paleta colorida, pasteis | Grid organico, cards rotacionados | Ilustracoes, badges coloridos, tooltips |
| **developer-focused** | Compact | Monospace, code-like | Dark mode, terminal greens | Sidebar-main, data-dense | Code blocks, badges tech, tables |
| **corporate** | Balanced | Sans-serif clean, regular weights | Azul/cinza, conservador | Grid simetrico, whitespace controlado | Forms, tables, breadcrumbs |
| **editorial** | Generous | Serif body, large line-height | Preto/branco com accent unico | Centered-narrow, prose | Blockquotes, pull quotes, dropcaps |

**Uso:** Quando o usuario fornecer um buzzword no brief (Constraints → visual tone), aplicar as decisoes correspondentes nas fases 3-6 do workflow. Multiplos buzzwords podem ser combinados (ex: "premium + minimal" = generous spacing + serif fonts + monocromatico).

---

## 1. Landing Page (AIDA / StoryBrand)

**Layout pattern:** hero-content (KB1 Section 5.2)
**Spacing strategy:** Generous (KB4 Section 4.1)
**Copy framework:** AIDA or StoryBrand (KB5 Section 1)
**Eye pattern:** Z-pattern (KB5 Section 2)

### Section Breakdown

| # | Section        | AIDA Phase   | StoryBrand Phase | Purpose                              |
|---|----------------|--------------|------------------|--------------------------------------|
| 1 | Hero           | Attention    | Character+Problem| Hook visitor, state value proposition|
| 2 | Social Proof   | Attention    | Guide            | Build trust with logos/testimonials  |
| 3 | Features       | Interest     | Plan             | Show capabilities and benefits       |
| 4 | Benefits/Stats | Interest     | Success          | Quantify value                       |
| 5 | Testimonials   | Desire       | Success          | Social proof with real stories       |
| 6 | Pricing        | Desire       | Plan             | Present plans and pricing            |
| 7 | FAQ            | Desire       | --               | Handle objections                    |
| 8 | Final CTA      | Action       | CTA              | Drive conversion                     |
| 9 | Footer         | --           | --               | Navigation, legal, social links      |

### Component Map

| Section        | shadcn/ui Components                                        |
|----------------|-------------------------------------------------------------|
| Hero           | Button (primary CTA, secondary), Badge (new/featured)       |
| Social Proof   | Avatar, AvatarGroup (custom), Badge                         |
| Features       | Card, CardHeader, CardTitle, CardDescription, CardContent   |
| Benefits/Stats | Card, Badge, Progress (if animated counters)                |
| Testimonials   | Card, Avatar, Separator                                     |
| Pricing        | Card, Button, Badge (popular), Separator, Tabs (toggle)     |
| FAQ            | Accordion, AccordionItem, AccordionTrigger, AccordionContent|
| Final CTA      | Button (primary), Input (email capture if relevant)         |
| Footer         | Separator, NavigationMenu (or link groups)                  |

### ASCII Wireframe

```
+================================================================+
|  [Logo]                            [Nav] [Nav] [Nav] [CTA btn] |
+================================================================+
|                                                                 |
|                        HERO SECTION                             |
|                                                                 |
|               [Badge: "New Feature"]                            |
|                                                                 |
|              Large Headline Text Here                           |
|              That Grabs Attention Fast                          |
|                                                                 |
|           Supporting subheadline with value prop                |
|                                                                 |
|          [ Primary CTA ]    [ Secondary CTA ]                   |
|                                                                 |
+-----------------------------------------------------------------+
|                     SOCIAL PROOF BAR                            |
|  [Logo] [Logo] [Logo] [Logo] [Logo]   "Trusted by 10k+ teams" |
+-----------------------------------------------------------------+
|                                                                 |
|                        FEATURES                                 |
|                                                                 |
|   +------------------+ +------------------+ +----------------+  |
|   |  [icon]          | |  [icon]          | |  [icon]        |  |
|   |  Feature Title   | |  Feature Title   | |  Feature Title |  |
|   |  Description of  | |  Description of  | |  Description   |  |
|   |  this feature    | |  this feature    | |  of feature    |  |
|   +------------------+ +------------------+ +----------------+  |
|                                                                 |
+-----------------------------------------------------------------+
|                    BENEFITS / STATS                              |
|                                                                 |
|       [99%]            [10x]           [24/7]                   |
|     Uptime           Faster         Support                     |
|                                                                 |
+-----------------------------------------------------------------+
|                     TESTIMONIALS                                |
|                                                                 |
|   +------------------------------------------------------+      |
|   | "Quote text from satisfied customer about product"   |      |
|   |                                                      |      |
|   | [Avatar] Name, Title @ Company                       |      |
|   +------------------------------------------------------+      |
|                                                                 |
+-----------------------------------------------------------------+
|                       PRICING                                   |
|              [Monthly]  /  [Annual]                              |
|                                                                 |
|   +----------------+ +------------------+ +----------------+    |
|   |  Starter       | |  Pro [Popular]   | |  Enterprise    |    |
|   |  $19/mo        | |  $49/mo          | |  Custom        |    |
|   |                | |                  | |                |    |
|   |  - Feature     | |  - Feature       | |  - Feature     |    |
|   |  - Feature     | |  - Feature       | |  - Feature     |    |
|   |  - Feature     | |  - Feature       | |  - Feature     |    |
|   |                | |                  | |                |    |
|   | [Choose Plan]  | | [Choose Plan]    | | [Contact Us]   |    |
|   +----------------+ +------------------+ +----------------+    |
|                                                                 |
+-----------------------------------------------------------------+
|                         FAQ                                     |
|                                                                 |
|   [v] What is included in the free plan?                        |
|       Answer text expanded here...                              |
|   [>] How does billing work?                                    |
|   [>] Can I cancel anytime?                                     |
|   [>] Do you offer refunds?                                     |
|                                                                 |
+-----------------------------------------------------------------+
|                      FINAL CTA                                  |
|                                                                 |
|              Ready to get started?                               |
|              Start your free trial today.                        |
|                                                                 |
|              [ Start Free Trial ]                               |
|                                                                 |
+-----------------------------------------------------------------+
|  FOOTER                                                         |
|  [Product]  [Company]  [Resources]  [Legal]                     |
|  - Link     - Link     - Link       - Link                     |
|  - Link     - Link     - Link       - Link                     |
|                                                                 |
|  (c) 2026 Company   [Twitter] [GitHub] [LinkedIn]               |
+-----------------------------------------------------------------+
```

### Key Tailwind Classes

```html
<!-- Hero -->
<section class="flex min-h-[70vh] items-center justify-center px-4 py-20 lg:min-h-[80vh]">
  <div class="mx-auto max-w-4xl text-center">...</div>
</section>

<!-- Features grid -->
<section class="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
  <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">...</div>
</section>

<!-- Pricing grid -->
<section class="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
  <div class="grid grid-cols-1 gap-8 md:grid-cols-3">...</div>
</section>
```

---

## 2. Product / Offer Page

**Layout pattern:** hero-content (KB1 Section 5.2)
**Spacing strategy:** Generous (KB4 Section 4.1)
**Copy framework:** PAS or AIDA (KB5 Section 1)
**Eye pattern:** Z-pattern (KB5 Section 2)

### Section Breakdown

| # | Section         | PAS Phase  | Purpose                               |
|---|-----------------|------------|---------------------------------------|
| 1 | Hero            | Problem    | State the problem, introduce solution |
| 2 | Benefits        | Agitation  | Deepen pain points, show benefits     |
| 3 | Demo/Screenshots| Solution   | Visual proof of the product           |
| 4 | How It Works    | Solution   | Step-by-step process explanation      |
| 5 | Pricing         | Solution   | Plans and pricing comparison          |
| 6 | FAQ             | --         | Handle objections                     |
| 7 | Final CTA       | Solution   | Drive conversion                      |
| 8 | Footer          | --         | Standard footer                       |

### Component Map

| Section          | shadcn/ui Components                                     |
|------------------|----------------------------------------------------------|
| Hero             | Button, Badge, Dialog (video modal)                      |
| Benefits         | Card, CardContent, Badge                                 |
| Demo/Screenshots | Tabs, TabsList, TabsTrigger, TabsContent, Dialog         |
| How It Works     | Card (step cards), Badge (step numbers), Separator       |
| Pricing          | Card, Button, Badge, Tabs (billing toggle), Separator    |
| FAQ              | Accordion, AccordionItem, AccordionTrigger, AccordionContent |
| Final CTA        | Button, Input (if email capture)                         |
| Footer           | Separator, NavigationMenu                                |

### ASCII Wireframe

```
+================================================================+
|  [Logo]                           [Features] [Pricing] [Login] |
+================================================================+
|                                                                 |
|                         HERO                                    |
|                                                                 |
|     [Badge: "New"]                                              |
|                                                                 |
|     Product Name - Solve [Problem]                              |
|     Supporting description text                                 |
|                                                                 |
|     [ Get Started ]    [ Watch Demo ]                           |
|                                                                 |
|     +---------------------------------------------------+       |
|     |                                                   |       |
|     |          Product Screenshot / Video               |       |
|     |                                                   |       |
|     +---------------------------------------------------+       |
|                                                                 |
+-----------------------------------------------------------------+
|                        BENEFITS                                 |
|                                                                 |
|   [icon] Benefit 1       [icon] Benefit 2      [icon] Benefit 3|
|   Description text       Description text      Description text|
|                                                                 |
+-----------------------------------------------------------------+
|                    DEMO / SCREENSHOTS                           |
|                                                                 |
|   [Tab: Feature A] [Tab: Feature B] [Tab: Feature C]           |
|   +-------------------------------------------------------+    |
|   |                                                       |    |
|   |              Screenshot of Feature A                  |    |
|   |                                                       |    |
|   +-------------------------------------------------------+    |
|                                                                 |
+-----------------------------------------------------------------+
|                     HOW IT WORKS                                |
|                                                                 |
|      (1)                 (2)                 (3)                 |
|   Sign Up    --->    Configure    --->    Launch                |
|   Create your        Set up your         Go live in             |
|   account            preferences         minutes                |
|                                                                 |
+-----------------------------------------------------------------+
|                       PRICING                                   |
|   (Same structure as Landing Page pricing)                      |
+-----------------------------------------------------------------+
|                         FAQ                                     |
|   (Same structure as Landing Page FAQ)                          |
+-----------------------------------------------------------------+
|                      FINAL CTA                                  |
|              [ Start Your Free Trial ]                          |
+-----------------------------------------------------------------+
|                       FOOTER                                    |
+-----------------------------------------------------------------+
```

### Key Tailwind Classes

```html
<!-- Hero with product screenshot -->
<section class="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
  <div class="mx-auto max-w-screen-xl">
    <div class="mx-auto max-w-3xl text-center">...</div>
    <div class="mt-12 rounded-lg border border-border shadow-2xl">
      <!-- Screenshot -->
    </div>
  </div>
</section>

<!-- How it works steps -->
<section class="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
  <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
    <!-- Step cards with connecting lines -->
  </div>
</section>
```

---

## 3. Dashboard

**Layout pattern:** dashboard (KB1 Section 5.5)
**Spacing strategy:** Compact (KB4 Section 4.2)
**Copy framework:** N/A (functional, not persuasive)
**Eye pattern:** F-pattern for scanning data (KB5 Section 2)

### Section Breakdown

| # | Section         | Purpose                                    |
|---|-----------------|-------------------------------------------|
| 1 | Sidebar Nav     | Primary navigation between dashboard views|
| 2 | Top Bar         | Search, notifications, user menu          |
| 3 | Page Header     | Title, breadcrumbs, primary action        |
| 4 | KPI Cards       | Key metrics at a glance                   |
| 5 | Charts/Graphs   | Data visualization                        |
| 6 | Data Table      | Detailed tabular data                     |
| 7 | Activity Feed   | Recent events and updates                 |

### Component Map

| Section         | shadcn/ui Components                                          |
|-----------------|---------------------------------------------------------------|
| Sidebar Nav     | NavigationMenu, Button (collapse), Separator, Badge (counts)  |
| Top Bar         | Input (search), Button, DropdownMenu, Avatar, Sheet (mobile)  |
| Page Header     | Breadcrumb, Button (primary action), Badge                    |
| KPI Cards       | Card, CardHeader, CardTitle, CardContent, Badge, Progress     |
| Charts/Graphs   | Card (wrapper), Tabs (time range selector)                    |
| Data Table      | Table, TableHeader, TableBody, TableRow, TableCell, Badge, Button, DropdownMenu, Pagination |
| Activity Feed   | Card, Avatar, Badge, ScrollArea, Separator                    |

### ASCII Wireframe

```
+------------------+----------------------------------------------+
| [Logo]           | [Search............] [Bell] [Avatar v]       |
|                  +----------------------------------------------+
|  [x] Dashboard   | Dashboard > Overview                [+ New] |
|  [ ] Analytics   +----------------------------------------------+
|  [ ] Users       |                                              |
|  [ ] Products    | +----------+ +----------+ +----------+ +-+  |
|  [ ] Orders      | | Revenue  | | Users    | | Orders   | |C|  |
|                  | | $24,500  | | 1,234    | | 456      | |o|  |
|  ----------      | | +12.5%   | | +8.2%    | | -2.1%    | |n|  |
|  [ ] Settings    | +----------+ +----------+ +----------+ +-+  |
|                  |                                              |
|                  | +---------------------------+ +-----------+  |
|                  | |  Revenue Chart            | | Activity  |  |
|                  | |                           | |           |  |
|                  | |    /\      /\             | | * User A  |  |
|                  | |   /  \    /  \   /\       | |   signed  |  |
|                  | |  /    \  /    \ /  \      | | * Order   |  |
|                  | | /      \/      v    \     | |   #1234   |  |
|                  | +---------------------------+ | * Config  |  |
|                  |                               |   updated |  |
|                  | +---------------------------+ +-----------+  |
|                  | | Name  | Email   |Status|A|               |  |
|                  | |-------|---------|------|--|               |  |
|                  | | Alice | a@co.io |Active| v|               |  |
|                  | | Bob   | b@co.io |Pend. | v|               |  |
|                  | | Carol | c@co.io |Active| v|               |  |
|                  | |       [< 1 2 3 >]      |  |               |  |
|                  | +---------------------------+               |  |
|                  |                                              |
+------------------+----------------------------------------------+
```

### Key Tailwind Classes

```html
<!-- KPI grid -->
<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  <div class="rounded-lg border border-border bg-card p-4 shadow-sm">
    <p class="text-sm font-medium text-muted-foreground">Revenue</p>
    <p class="mt-1 text-2xl font-semibold">$24,500</p>
    <p class="mt-1 text-xs text-green-600">+12.5%</p>
  </div>
</div>

<!-- Chart + Activity split -->
<div class="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
  <div class="rounded-lg border border-border bg-card p-4 shadow-sm lg:col-span-2">
    <!-- Chart -->
  </div>
  <div class="rounded-lg border border-border bg-card p-4 shadow-sm">
    <!-- Activity -->
  </div>
</div>

<!-- Data table -->
<div class="mt-6 rounded-lg border border-border bg-card shadow-sm">
  <div class="overflow-x-auto">
    <!-- Table component -->
  </div>
</div>
```

---

## 4. Auth Flow (Login / Signup / Reset / OTP)

**Layout pattern:** split-screen (KB1 Section 5.3) or centered-narrow (KB1 Section 5.4)
**Spacing strategy:** Balanced (KB4 Section 4.3)
**Copy framework:** Minimal -- functional microcopy
**Eye pattern:** Centered focal point

### Section Breakdown

| # | Section         | Purpose                             |
|---|-----------------|-------------------------------------|
| 1 | Brand Panel     | Logo, illustration, tagline (left)  |
| 2 | Logo            | Brand identity at top of form       |
| 3 | Form Header     | Title ("Sign In") + description     |
| 4 | Form Fields     | Email, password, etc.               |
| 5 | Social Auth     | OAuth buttons (Google, GitHub, etc.)|
| 6 | Form Footer     | Links to other auth pages           |

### Component Map

| Section         | shadcn/ui Components                                      |
|-----------------|-----------------------------------------------------------|
| Brand Panel     | (custom -- not a shadcn component)                        |
| Logo            | (custom image/SVG)                                        |
| Form Header     | CardHeader, CardTitle, CardDescription                    |
| Form Fields     | Card, CardContent, Input, Label, Checkbox, Button         |
| Social Auth     | Button (variant="outline"), Separator ("or continue with")|
| Form Footer     | CardFooter, Button (variant="link")                       |

### Auth Page Variants

| Variant      | Fields                           | Extra Elements              |
|--------------|----------------------------------|-----------------------------|
| Login        | Email, Password                  | "Forgot password?" link     |
| Signup       | Name, Email, Password, Confirm   | Terms checkbox              |
| Reset        | Email                            | "Back to login" link        |
| OTP/Verify   | 6-digit code input               | "Resend code" link + timer  |

### ASCII Wireframe (Split-Screen Variant)

```
+-----------------------------+-----------------------------+
|                             |                             |
|                             |     [Logo]                  |
|     +-------------------+   |                             |
|     |                   |   |     Sign in to your         |
|     |   Brand           |   |     account                 |
|     |   Illustration    |   |                             |
|     |                   |   |     Email                   |
|     |                   |   |     [__________________]    |
|     +-------------------+   |                             |
|                             |     Password                |
|     "Build faster with      |     [__________________]    |
|      AI-powered tools"      |                             |
|                             |     [x] Remember me         |
|                             |               Forgot pass?  |
|                             |                             |
|                             |     [ Sign In            ]  |
|                             |                             |
|                             |     ---- or continue ----   |
|                             |                             |
|                             |     [ G  Google          ]  |
|                             |     [ GH GitHub          ]  |
|                             |                             |
|                             |     Don't have an account?  |
|                             |     Sign up                 |
|                             |                             |
+-----------------------------+-----------------------------+
```

### ASCII Wireframe (Centered Variant)

```
+-------------------------------------------------------------+
|                          [Logo]                              |
+-------------------------------------------------------------+
|                                                             |
|              +-------------------------------+              |
|              |                               |              |
|              |  Sign in to your account      |              |
|              |  Enter your credentials below |              |
|              |                               |              |
|              |  Email                        |              |
|              |  [________________________]   |              |
|              |                               |              |
|              |  Password                     |              |
|              |  [________________________]   |              |
|              |                               |              |
|              |  [x] Remember me   Forgot?    |              |
|              |                               |              |
|              |  [ Sign In                 ]  |              |
|              |                               |              |
|              |  ---- or continue with ----   |              |
|              |                               |              |
|              |  [ G  Google               ]  |              |
|              |  [ GH GitHub               ]  |              |
|              |                               |              |
|              |  No account? Sign up          |              |
|              |                               |              |
|              +-------------------------------+              |
|                                                             |
+-------------------------------------------------------------+
```

### Key Tailwind Classes

```html
<!-- Split-screen auth -->
<div class="flex min-h-screen">
  <!-- Brand panel -->
  <div class="hidden bg-muted lg:flex lg:w-1/2 lg:flex-col lg:items-center lg:justify-center lg:p-12">
    <div class="max-w-md">...</div>
  </div>
  <!-- Form panel -->
  <div class="flex w-full items-center justify-center px-4 py-12 lg:w-1/2">
    <div class="mx-auto w-full max-w-sm space-y-6">
      <!-- Card with form -->
    </div>
  </div>
</div>

<!-- Centered auth (alternative) -->
<div class="flex min-h-screen items-center justify-center px-4 py-12">
  <div class="w-full max-w-sm space-y-6">
    <!-- Card with form -->
  </div>
</div>

<!-- Social auth separator -->
<div class="relative my-6">
  <div class="absolute inset-0 flex items-center">
    <span class="w-full border-t border-border"></span>
  </div>
  <div class="relative flex justify-center text-xs uppercase">
    <span class="bg-background px-2 text-muted-foreground">or continue with</span>
  </div>
</div>
```

---

## 5. Content / Blog

**Layout pattern:** centered-narrow (KB1 Section 5.4)
**Spacing strategy:** Balanced (KB4 Section 4.3)
**Copy framework:** Editorial structure (KB5)
**Eye pattern:** F-pattern for scanning content (KB5 Section 2)

### Section Breakdown

| # | Section         | Purpose                                |
|---|-----------------|----------------------------------------|
| 1 | Site Header     | Navigation, search, theme toggle       |
| 2 | Article Header  | Title, metadata, featured image        |
| 3 | Article Body    | Long-form content (prose)              |
| 4 | Author Bio      | Author card with social links          |
| 5 | Related Posts   | Cards linking to related content       |
| 6 | Footer          | Standard site footer                   |

### Component Map

| Section         | shadcn/ui Components                                     |
|-----------------|----------------------------------------------------------|
| Site Header     | NavigationMenu, Button, DropdownMenu (theme)             |
| Article Header  | Badge (category), Avatar (author), Separator             |
| Article Body    | (Prose/MDX -- uses Tailwind Typography plugin)           |
| Author Bio      | Card, Avatar, Button (social links), Separator           |
| Related Posts   | Card, CardHeader, CardTitle, CardDescription, Badge      |
| Footer          | Separator, NavigationMenu                                |

### ASCII Wireframe

```
+================================================================+
|  [Logo]                     [Blog] [About] [Contact] [Theme]  |
+================================================================+
|                                                                 |
|            +---------------------------------------+            |
|            |                                       |            |
|            |     [Badge: Category]                 |            |
|            |                                       |            |
|            |     Article Title That Spans          |            |
|            |     Multiple Lines If Needed          |            |
|            |                                       |            |
|            |     [Avatar] Author Name              |            |
|            |     Mar 6, 2026  *  8 min read        |            |
|            |                                       |            |
|            +---------------------------------------+            |
|                                                                 |
|     +---------------------------------------------------+       |
|     |           Featured Image (breakout)               |       |
|     +---------------------------------------------------+       |
|                                                                 |
|            +---------------------------------------+            |
|            |                                       |            |
|            |  Introduction paragraph text that     |            |
|            |  flows naturally at 65-75 chars per   |            |
|            |  line for optimal readability.        |            |
|            |                                       |            |
|            |  ## Heading 2                         |            |
|            |                                       |            |
|            |  More body text with **bold** and     |            |
|            |  *italic* formatting. Links are       |            |
|            |  underlined and accessible.           |            |
|            |                                       |            |
|            |  > Blockquote for emphasis            |            |
|            |                                       |            |
|            |  ```                                  |            |
|            |  code block example                   |            |
|            |  ```                                  |            |
|            |                                       |            |
|            +---------------------------------------+            |
|                                                                 |
|            +---------------------------------------+            |
|            | AUTHOR BIO                            |            |
|            | [Avatar]  Author Name                 |            |
|            |           Short bio text here         |            |
|            |           [Twitter] [GitHub]          |            |
|            +---------------------------------------+            |
|                                                                 |
|  +-----------------------------------------------------------------+
|  |                     RELATED POSTS                           |
|  |                                                             |
|  |  +------------------+ +------------------+ +------------+   |
|  |  | [Image]          | | [Image]          | | [Image]    |   |
|  |  | Title of related | | Title of related | | Title of   |   |
|  |  | post one         | | post two         | | post three |   |
|  |  | Mar 1 * 5 min    | | Feb 28 * 3 min   | | Feb 25     |   |
|  |  +------------------+ +------------------+ +------------+   |
|  +-----------------------------------------------------------------+
|                                                                 |
+-----------------------------------------------------------------+
|  FOOTER                                                         |
+-----------------------------------------------------------------+
```

### Key Tailwind Classes

```html
<!-- Article header (narrow) -->
<header class="mx-auto max-w-prose px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
  <div class="space-y-4">
    <!-- Badge, Title, Author, Date -->
  </div>
</header>

<!-- Featured image (breakout) -->
<figure class="mx-auto max-w-4xl px-4 sm:px-6">
  <img class="w-full rounded-lg object-cover" />
</figure>

<!-- Article body (narrow, prose) -->
<article class="prose prose-lg dark:prose-invert mx-auto max-w-prose px-4 py-8 sm:px-6">
  <!-- MDX/HTML content -->
</article>

<!-- Related posts (wider) -->
<section class="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
  <h2 class="text-2xl font-bold">Related Posts</h2>
  <div class="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
    <!-- Post cards -->
  </div>
</section>
```

---

## 6. Settings / Profile

**Layout pattern:** sidebar-main (KB1 Section 5.1)
**Spacing strategy:** Balanced (KB4 Section 4.3)
**Copy framework:** Functional microcopy
**Eye pattern:** F-pattern (KB5 Section 2)

### Section Breakdown

| # | Section         | Purpose                                   |
|---|-----------------|-------------------------------------------|
| 1 | Settings Nav    | Sidebar or tab navigation for sections    |
| 2 | Section Header  | Title + description of current section    |
| 3 | Form Groups     | Organized input groups with labels        |
| 4 | Danger Zone     | Destructive actions (delete, deactivate)  |
| 5 | Action Bar      | Save/Cancel buttons (sticky or at bottom) |

### Component Map

| Section         | shadcn/ui Components                                          |
|-----------------|---------------------------------------------------------------|
| Settings Nav    | Tabs (horizontal) or NavigationMenu (sidebar), Separator      |
| Section Header  | CardHeader, CardTitle, CardDescription                        |
| Form Groups     | Card, CardContent, Input, Label, Select, Switch, Textarea, Separator |
| Danger Zone     | Card (destructive border), Button (variant="destructive"), AlertDialog |
| Action Bar      | Button (primary="Save"), Button (variant="outline"="Cancel") |

### ASCII Wireframe

```
+================================================================+
|  [Logo]                            [Nav] [Nav] [Avatar v]      |
+================================================================+
|                                                                 |
|  +---------------+  +--------------------------------------+   |
|  | SETTINGS NAV  |  | SECTION: Profile                     |   |
|  |               |  | Manage your public profile info      |   |
|  | [x] Profile   |  +--------------------------------------+   |
|  | [ ] Account   |  |                                      |   |
|  | [ ] Appearance|  |  Avatar                              |   |
|  | [ ] Notifs    |  |  [Current Avatar]  [ Change ]        |   |
|  | [ ] Billing   |  |                                      |   |
|  | [ ] Security  |  |  Display Name                        |   |
|  | [ ] API Keys  |  |  [________________________]          |   |
|  |               |  |                                      |   |
|  |               |  |  Email                               |   |
|  |               |  |  [________________________]          |   |
|  |               |  |                                      |   |
|  |               |  |  Bio                                 |   |
|  |               |  |  [________________________]          |   |
|  |               |  |  [________________________]          |   |
|  |               |  |                                      |   |
|  |               |  |  Theme Preference                    |   |
|  |               |  |  ( ) Light  (x) Dark  ( ) System     |   |
|  |               |  |                                      |   |
|  |               |  |  Email Notifications                 |   |
|  |               |  |  Marketing    [====o ]               |   |
|  |               |  |  Updates      [ o====]               |   |
|  |               |  |                                      |   |
|  |               |  +--------------------------------------+   |
|  |               |  |                                      |   |
|  |               |  |  DANGER ZONE                         |   |
|  |               |  |  --------------------------------    |   |
|  |               |  |  [ Delete Account ]                  |   |
|  |               |  |                                      |   |
|  |               |  +--------------------------------------+   |
|  |               |  |                                      |   |
|  |               |  |       [ Cancel ]    [ Save Changes ] |   |
|  |               |  |                                      |   |
|  +---------------+  +--------------------------------------+   |
|                                                                 |
+-----------------------------------------------------------------+

Mobile: Settings Nav becomes horizontal Tabs at top (Re-architect)
```

### Key Tailwind Classes

```html
<!-- Settings layout -->
<div class="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8">
  <div class="flex flex-col gap-8 lg:flex-row">
    <!-- Sidebar nav (horizontal tabs on mobile) -->
    <nav class="w-full lg:w-56 lg:flex-shrink-0">
      <!-- Tabs (mobile) or vertical nav (desktop) -->
    </nav>

    <!-- Settings content -->
    <div class="flex-1 space-y-6">
      <!-- Section card -->
      <div class="rounded-lg border border-border bg-card p-6">
        <h2 class="text-lg font-semibold">Profile</h2>
        <p class="text-sm text-muted-foreground">Manage your public profile</p>

        <div class="mt-6 space-y-4">
          <!-- Form fields -->
          <div class="space-y-2">
            <label class="text-sm font-medium">Display Name</label>
            <input class="..." />
          </div>
        </div>
      </div>

      <!-- Danger zone -->
      <div class="rounded-lg border border-destructive/50 bg-card p-6">
        <h3 class="text-lg font-semibold text-destructive">Danger Zone</h3>
        <!-- Destructive actions -->
      </div>

      <!-- Action bar -->
      <div class="flex justify-end gap-4">
        <button class="...">Cancel</button>
        <button class="...">Save Changes</button>
      </div>
    </div>
  </div>
</div>
```

---

## 7. Page Type Selection Guide

Use this decision matrix when the Page Composer agent needs to select a template:

| Signal in Brief                            | Recommended Page Type | Layout Pattern   |
|--------------------------------------------|-----------------------|------------------|
| Marketing, conversion, value proposition   | Landing Page          | hero-content     |
| Specific product/service showcase          | Product/Offer         | hero-content     |
| Data, metrics, analytics, admin            | Dashboard             | dashboard        |
| Login, signup, password, verification      | Auth Flow             | split-screen     |
| Article, blog post, documentation          | Content/Blog          | centered-narrow  |
| User preferences, account management       | Settings/Profile      | sidebar-main     |

---

## 8. Cross-References

- **Layout patterns and grid system:** See [page-layout-framework.md](page-layout-framework.md) (KB1)
- **Copy framework to section mapping:** See [copy-to-layout-bridge.md](copy-to-layout-bridge.md) (KB5)
- **Typography for each page type:** See [typography-hierarchy-rules.md](typography-hierarchy-rules.md) (KB3)
- **Spacing strategies per page type:** See [spacing-rhythm-system.md](spacing-rhythm-system.md) (KB4)
