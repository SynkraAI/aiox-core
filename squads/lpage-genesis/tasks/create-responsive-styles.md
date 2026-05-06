# Create Responsive Styles

**Task:** `create-responsive-styles`
**Agent:** @page-assembler
**Type:** Production
**Priority:** 4

---

## Description

Criar estilos responsivos mobile-first para LP. Garantir que todos os breakpoints funcionam, touch targets corretos e sem horizontal scroll.

---

## Input

```yaml
base_layout: 'path para HTML/React da LP'
breakpoints:
  sm: 640
  md: 768
  lg: 1024
  xl: 1280
  2xl: 1536
mobile_priorities:
  - readable font sizes (min 16px body)
  - touch targets (min 44x44px)
  - no horizontal scroll
  - stacked layout (single column)
  - reduced images (lazy load all)
```

---

## Process

### 1. Audit Current Responsiveness

- Screenshot em cada breakpoint via Playwright
- Identificar problemas (overflow, text truncation, overlap)

### 2. Mobile-First Adjustments

- Default styles para 375px
- Stack all grids to single column
- Increase touch targets
- Adjust font sizes

### 3. Tablet Adaptations (768px+)

- 2-column grids where appropriate
- Adjust spacing

### 4. Desktop Optimization (1024px+)

- Full layout with max-width container
- Multi-column grids
- Hover states (desktop only)

### 5. XL Screens (1440px+)

- Max-width constraints
- Comfortable reading width
- Balanced whitespace

---

## Output

```
Entregaveis:
1. responsive-styles.css - Media queries (if needed beyond Tailwind)
2. mobile-preview.md - Screenshots de cada breakpoint
3. responsive-report.md - Issues encontrados e resolucoes
```

---

**Created:** 2026-02-10
**Version:** 1.0
