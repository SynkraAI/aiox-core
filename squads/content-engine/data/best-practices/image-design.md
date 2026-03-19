---
id: image-design
name: "Visual Design & Image Creation"
whenToUse: |
  Creating agents that design graphics, carousel slides, social media visuals,
  or HTML/CSS templates for rendering.
  NOT for: copywriting, research, data analysis, publishing.
version: "1.0.0"
---

# Visual Design & Image Creation — Best Practices

## Core Principles

1. **Design system before individual pieces.** Before creating any visual, define the design system: primary and secondary colors, font family and scale, spacing unit, border radius, shadow style, and grid structure. Every element in the design draws from this system. No ad-hoc styling decisions.

2. **Platform-aware viewport and typography.** Every design targets a specific platform viewport. Respect the minimum font sizes enforced by the rendering engine:

   | Platform / Format         | Hero   | Heading | Body  | Caption |
   |--------------------------|--------|---------|-------|---------|
   | Instagram Post/Carousel  | 58px   | 43px    | 34px  | 24px    |
   | Instagram Story/Reel     | 56px   | 42px    | 32px  | 20px    |

   No text element meant to be read may use a font size smaller than 20px on any platform. Never include slide number counters (e.g., "7/8", "1/7") in carousel images. Instagram shows native carousel navigation. Font weight for body text and above must be 500 or higher.

3. **Visual hierarchy through contrast and scale.** Every design must have a clear reading order: hero text first, supporting text second, details third. Achieve hierarchy through font size contrast (minimum 1.5x ratio between levels), weight contrast (bold vs. medium), and spatial separation. Never rely on color alone for hierarchy.

4. **Self-contained HTML is non-negotiable.** Every HTML file must be completely self-contained: inline CSS only, no external stylesheets, no CDN links, no JavaScript, no external font files. Use web-safe fonts or Google Fonts via CSS @import (the only allowed external resource). All images must be referenced as absolute paths or base64 data URIs. Body must set exact pixel dimensions matching the target viewport with margin: 0, padding: 0, overflow: hidden.

5. **Accessibility and contrast.** All text must meet WCAG AA minimum contrast ratio of 4.5:1 against its background. White text (#FFFFFF) on dark backgrounds needs the background to be darker than #767676. Dark text on light backgrounds follows the inverse rule. Never place text directly on complex images without a solid or gradient overlay.

6. **Batch consistency for multi-slide content.** When creating carousels or multi-slide content, generate one HTML file per slide. All slides must share the exact same design system. Slide numbering uses zero-padded format: slide-01.html, slide-02.html. First slide is always the hook/cover. Last slide is always the CTA.

7. **CSS Grid and Flexbox for layout.** Use CSS Grid or Flexbox for all layout composition. Never use absolute positioning for primary content layout (reserved only for decorative overlays). Grid and Flexbox render consistently across Playwright and are the most reliable layout methods.

8. **Brand alignment from company context.** Before designing, read the company context file for brand colors, fonts, visual style guidelines, and tone. If no brand guidelines exist, ask the user for color preferences and visual direction before generating any HTML. Never default to generic blue/white corporate aesthetics without explicit brand input.

9. **Verify before batch.** Always render and visually verify the first slide of any multi-slide content before proceeding with the rest. Catching typography, spacing, or color issues on slide 1 prevents rework across all slides.

## Design Methodology

### 1. Load context and brief
Read the company context file, any upstream agent output (copywriter text, strategist direction), and the squad configuration. Identify the target platform, content format (single image, carousel, story), and the text content to be visualized.

### 2. Confirm design direction
Before designing, clarify: target platform and viewport, visual mood (bold/minimal/playful/corporate), color preferences (brand colors or custom), and the number of slides or images needed. If the brief is ambiguous, ask.

### 3. Define the design system
Based on the brief and brand context, define:
- **Colors**: Primary, secondary, accent, background, text colors with hex values
- **Typography**: Font family, size scale (hero/heading/body/caption), weight scale
- **Spacing**: Base unit (e.g., 24px), multiples for margins and padding
- **Grid**: Column structure, gutter width, content margins
- **Visual elements**: Border radius, shadow style, decorative patterns

### 4. Create the HTML/CSS
Write complete, self-contained HTML files. Each file is one slide or image. Follow the design system strictly. Use semantic class names. Set body dimensions to match the target viewport exactly. Verify all text meets minimum font size requirements for the target platform.

### 5. Render and verify
Save HTML to the output folder, start the HTTP server, navigate the browser to the file, resize to the target viewport, take the screenshot. Read the rendered image to verify quality. Check: text is readable, colors render correctly, no content is clipped, layout is balanced.

### 6. Iterate if needed
If the rendered image has issues (text too small, clipped content, color mismatch), adjust the HTML and re-render. Do not proceed to the next slide until the current one passes visual verification.

### 7. Batch render remaining slides
After the first slide is verified, generate and render all remaining slides using the same design system. Keep the HTTP server running for the entire batch. Stop the server only after all slides are rendered.

### 8. Deliver the output
Present all rendered images to the user or downstream agent. Include the design system documentation alongside the images so the visual identity can be reused in future content.

## Platform Specifications

### Instagram Post / Carousel
- **Viewport**: 1080 x 1440 (3:4 portrait)
- **Min font sizes**: Hero 58px, Heading 43px, Body 34px, Caption 24px
- **Optimal slide count**: 5-10 slides. Under 5 feels incomplete, over 10 causes drop-off.
- **Structure**: Hook on slide 1, CTA on last slide, value in between.
- **No slide counters**: Instagram displays native carousel navigation indicators.

### Instagram Story / Reel
- **Viewport**: 1080 x 1920 (9:16 portrait)
- **Min font sizes**: Hero 56px, Heading 42px, Body 32px, Caption 20px

### LinkedIn Post
- **Viewport**: 1200 x 627 (1.91:1 horizontal)
- **Min font sizes**: Hero 40px+, Body 24px+, Caption 20px+

### General
- **Absolute minimum**: 20px for any readable text on any platform.
- **Font weight floor**: 500 or higher for body text and above.

## Decision Criteria

- **Font family selection**: Sans-serif for social media (Inter, Montserrat, Open Sans, Poppins). Serif only for editorial or luxury brands. Monospace only for technical content.
- **Color palette size**: 3-5 colors maximum per design system. Primary + secondary + accent + background + text. More colors create visual noise.
- **Slide count for carousels**: Instagram carousels perform best at 5-10 slides. Under 5 feels incomplete, over 10 causes drop-off. Hook on slide 1, CTA on last slide, value in between.
- **When to use gradients**: For background overlays on images, for hero sections, for CTAs. Never for body text backgrounds. Linear gradients only (radial gradients render inconsistently).
- **When to use images vs. solid colors**: Solid colors for text-heavy slides (better readability). Images for cover slides, mood-setting slides, and when the visual tells the story better than text.

## Quality Criteria

- [ ] Design system is documented before individual slides are created (colors, fonts, spacing, grid)
- [ ] All HTML files are self-contained: inline CSS, no external dependencies except Google Fonts @import
- [ ] All text meets minimum font size requirements for the target platform (checked against platform specifications table)
- [ ] All text meets WCAG AA contrast ratio of 4.5:1 against its background
- [ ] Body dimensions match target viewport exactly (width and height in px)
- [ ] CSS uses Grid or Flexbox for layout (no absolute positioning for primary structure)
- [ ] Multi-slide content uses consistent design system across all slides (same colors, fonts, spacing)
- [ ] First slide was rendered and visually verified before batch rendering
- [ ] No placeholder text (Lorem ipsum, "Text here", etc.) in any deliverable
- [ ] Design rationale is documented alongside the output

## Output Examples

### Example 1: Instagram Carousel Design System + Slide 1

```
DESIGN SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Platform: Instagram Carousel
Viewport: 1080 x 1440
Slides: 7 (hook + 5 content + CTA)

Colors:
  Primary:    #1A1A2E (deep navy — background)
  Secondary:  #E94560 (coral red — accent, CTAs)
  Text:       #FFFFFF (white — all body text)
  Muted:      #A0A0B8 (gray-blue — captions, slide numbers)
  Highlight:  #FFD93D (gold — emphasis, icons)

Typography:
  Family:     'Inter', sans-serif (via Google Fonts @import)
  Hero:       67px / 700 weight (slide 1 hook only)
  Heading:    48px / 700 weight
  Body:       34px / 500 weight
  Caption:    24px / 500 weight

Spacing:
  Base unit:  24px
  Content margin: 72px (3x base) from edges
  Section gap: 48px (2x base)

Grid:
  Single column, centered content
  Max content width: 936px (1080 - 2*72)

Visual elements:
  Border radius: 16px (cards, buttons)
  CTA button: #E94560 background, #FFFFFF text, 16px radius, 20px 40px padding
  Slide number: bottom-right, caption size, muted color
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SLIDE 1 (Hook):

File: slide-01.html
```

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1080px; height: 1440px; overflow: hidden;
      background: #1A1A2E;
      font-family: 'Inter', sans-serif;
      display: flex; flex-direction: column;
      justify-content: center; align-items: center;
      padding: 72px;
    }
    .hook {
      font-size: 67px; font-weight: 700; color: #FFFFFF;
      text-align: center; line-height: 1.25;
      max-width: 936px;
    }
    .hook .accent { color: #E94560; }
    .subtitle {
      font-size: 34px; font-weight: 500; color: #A0A0B8;
      text-align: center; margin-top: 32px;
      max-width: 800px; line-height: 1.5;
    }
    .swipe-cta {
      position: absolute; bottom: 48px; right: 72px;
      font-size: 24px; font-weight: 500; color: #A0A0B8;
      display: flex; align-items: center; gap: 8px;
    }
  </style>
</head>
<body>
  <h1 class="hook">
    You are doing <span class="accent">100 things</span> to grow on Instagram.<br>
    And ignoring the <span class="accent">ONE</span> that actually works.
  </h1>
  <p class="subtitle">Swipe to learn the strategy that grew 3 accounts from 0 to 50K in 90 days.</p>
  <span class="swipe-cta">Swipe →</span>
</body>
</html>
```

Design rationale: Deep navy background with white text creates strong contrast (ratio 15.3:1). Coral accent draws attention to key numbers. The hook uses 67px hero weight for maximum impact on mobile. Subtitle at 34px body weight provides context without competing with the hook. Swipe CTA uses muted gray-blue at caption size to stay visible but secondary.

---

### Example 2: LinkedIn Post Single Image

```
DESIGN SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Platform: LinkedIn Post
Viewport: 1200 x 627

Colors:
  Primary:    #FFFFFF (white — background)
  Secondary:  #0A66C2 (LinkedIn blue — accent)
  Text:       #191919 (near-black — headings, body)
  Muted:      #666666 (gray — captions)
  Card BG:    #F3F6F8 (light gray — content cards)

Typography:
  Family:     'Inter', sans-serif
  Hero:       44px / 700 weight
  Body:       24px / 500 weight
  Caption:    20px / 500 weight

Spacing:
  Base unit:  20px
  Content margin: 60px from edges
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

File: linkedin-post.html
```

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1200px; height: 627px; overflow: hidden;
      background: #FFFFFF;
      font-family: 'Inter', sans-serif;
      display: flex; align-items: center;
      padding: 60px;
      gap: 60px;
    }
    .left {
      flex: 1; display: flex; flex-direction: column; gap: 20px;
    }
    .tag {
      font-size: 20px; font-weight: 700; color: #0A66C2;
      text-transform: uppercase; letter-spacing: 2px;
    }
    h1 {
      font-size: 44px; font-weight: 700; color: #191919;
      line-height: 1.2;
    }
    .body-text {
      font-size: 24px; font-weight: 500; color: #666666;
      line-height: 1.5;
    }
    .right {
      width: 340px; height: 340px;
      background: #F3F6F8;
      border-radius: 20px;
      display: flex; flex-direction: column;
      justify-content: center; align-items: center;
      gap: 12px;
    }
    .metric {
      font-size: 60px; font-weight: 700; color: #0A66C2;
    }
    .metric-label {
      font-size: 20px; font-weight: 500; color: #666666;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="left">
    <span class="tag">Case Study</span>
    <h1>How we reduced churn by 34% without changing the product</h1>
    <p class="body-text">The fix was in the onboarding flow. Three changes, two weeks, measurable results.</p>
  </div>
  <div class="right">
    <span class="metric">-34%</span>
    <span class="metric-label">Customer Churn<br>in 60 days</span>
  </div>
</body>
</html>
```

Design rationale: Clean white background matches LinkedIn's professional aesthetic. Two-column layout with text left and metric card right creates visual balance. LinkedIn blue as accent ties the graphic to the platform. The 44px hero exceeds the LinkedIn minimum of 40px. The metric card uses a large 60px number as a visual anchor that draws the eye immediately.

## Anti-Patterns

### Never Do

1. **Never use external dependencies in HTML.** No CDN links for CSS frameworks (Bootstrap, Tailwind), no external JavaScript, no externally hosted images. The only allowed external resource is Google Fonts via @import. Everything else must be inline. External dependencies break rendering in Playwright.

2. **Never design without defining the design system first.** Jumping straight into individual slide HTML leads to inconsistency across slides. Colors drift, spacing varies, fonts change. Define the system, document it, then apply it uniformly.

3. **Never use font sizes below platform minimums.** The rendering engine enforces hard minimums: 20px is the absolute floor for any readable text. 58px for hero text on Instagram carousels. 40px for hero on LinkedIn. These are not suggestions. Designs with undersized text fail quality review.

4. **Never use absolute positioning for primary layout.** CSS absolute positioning is fragile and breaks when content length varies. Use CSS Grid or Flexbox for all structural layout. Reserve absolute positioning only for decorative overlays (slide numbers, watermarks, swipe indicators).

5. **Never skip rendering verification.** The HTML may look correct in theory, but browser rendering can differ: fonts may fall back, spacing may collapse, colors may shift. Always take the screenshot and visually inspect the result before proceeding to the next slide.

6. **Never place text on images without contrast protection.** Readable text over a photograph or complex image requires either: (a) a solid-color overlay at 60%+ opacity, (b) a gradient overlay from solid to transparent, or (c) a text shadow/backdrop-filter blur. Unprotected text on images fails the 4.5:1 contrast requirement.

7. **Never use more than 5 colors in a design system.** More colors create visual noise and make the design feel uncoordinated. Five is enough: primary, secondary, accent, background, text. Variations (muted, highlight) should be derived from these five.

8. **Never include slide number counters in carousel images.** Text elements like "7/8" or "1/7" must not appear in the rendered HTML for carousels. Instagram displays its own native slide navigation indicators. Adding a counter creates redundant UI noise and clutters the design. If slide order context is needed, communicate it through the design structure (visual hierarchy, headers), not a footer counter.

### Always Do

1. **Start every design with the design system documentation.** Before writing any HTML, document colors, fonts, spacing, grid, and visual elements. This document is both your guide and the deliverable for brand consistency.

2. **Verify the first slide before batch rendering.** Render slide 1, inspect the screenshot, confirm quality. Only then proceed to slides 2 through N. This prevents rework across an entire carousel.

3. **Document design rationale.** After each completed design, briefly explain why you made the key visual choices: color rationale, font selection, layout strategy. This helps the user understand the design thinking and makes iteration faster.

4. **Match viewport exactly.** Body width and height in CSS must match the browser viewport resize dimensions exactly. A 1080x1440 carousel slide means body { width: 1080px; height: 1440px; }.

## Vocabulary Guidance

### Use

- **"Design system"**: The foundational term for consistent visual identity across pieces. Always define it before creating individual assets.
- **"Visual hierarchy"**: How the eye moves through the design. Use this when explaining font size, weight, and positioning choices.
- **"Viewport: WxH"**: Always state the target dimensions explicitly. "Instagram carousel at 1080x1440" not "standard Instagram size."
- **"Contrast ratio"**: Reference WCAG contrast standards when justifying color combinations. "4.5:1 minimum for body text."
- **"Self-contained HTML"**: The non-negotiable constraint. Reinforce that every file must render independently without external dependencies.
- **"Rendering verification"**: The step where you visually confirm the screenshot matches the intended design before proceeding.
- **"Brand palette"**: Reference the brand's color system by name when applying colors. "Using the primary brand color (#2D5BFF) for headings."

### Avoid

- **"Placeholder"** or **"Lorem ipsum"**: Every text element must contain real content from the brief. No placeholder text in deliverables.
- **"Approximately"** or **"around"** for sizes: All dimensions, font sizes, and spacing must be exact pixel values. "About 36px" is not a design decision.
- **"Generic"** or **"standard"** for design choices: Every choice must be justified. "Standard blue" is not a color rationale; "brand primary #2D5BFF for trust and authority" is.
- **"It should look something like..."**: Deliver finished HTML, not descriptions of what designs should look like.
- **Em dashes**: Use periods, colons, or line breaks instead. Em dashes slow reading rhythm.
