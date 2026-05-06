# Coding Standards - LPage Genesis Squad

## Naming Conventions

- **Files:** kebab-case (`hero-section.tsx`, `design-tokens.yaml`)
- **Components:** PascalCase (`HeroSection`, `CtaButton`)
- **CSS classes:** Tailwind utilities only, no custom CSS unless necessary
- **Tokens:** kebab-case, semantic naming (`color-primary`, not `color-blue-500`)
- **Animations:** kebab-case (`fade-in-up`, `scroll-reveal`)

## Component Architecture

- **Atomic Design:** Atoms → Molecules → Organisms → Templates → Pages
- **CVA pattern:** All variants via `cva()` function
- **Radix primitives:** For accessible base components
- **forwardRef:** All components use React.forwardRef
- **TypeScript:** Strict mode, all props typed

## Design Token Rules

- **ZERO hardcoded values** - All colors, fonts, spacing from tokens
- **YAML source of truth** - `design-tokens.yaml` drives everything
- **Semantic naming** - `color-primary` not `#dbbf8a`
- **Multi-format export** - YAML → Tailwind config, CSS variables, JSON

## Styling Rules

- **Tailwind-first** - Use utility classes, avoid custom CSS
- **Mobile-first** - Default styles for 375px, scale up with breakpoints
- **No !important** - Ever
- **No inline styles** - Use Tailwind or CVA variants
- **Dark mode ready** - Use CSS custom properties for theme switching

## Performance Standards

- **Images:** WebP/AVIF format, lazy loading, explicit width/height
- **Fonts:** System font stack + 1-2 custom fonts max, font-display: swap
- **Animations:** Use will-change sparingly, respect prefers-reduced-motion
- **Bundle:** Tree-shake unused components, code-split routes

## Accessibility (WCAG AA)

- **Contrast:** 4.5:1 normal text, 3:1 large text
- **Semantics:** Correct heading hierarchy (H1 > H2 > H3)
- **ARIA:** Landmarks, labels, roles where needed
- **Keyboard:** Full tab navigation, visible focus states
- **Touch:** Minimum 44x44px touch targets

## File Structure

```
src/
  components/
    atoms/       (Button, Input, Badge, Text, Heading)
    molecules/   (FormField, CardHeader, NavLink)
    organisms/   (Hero, Testimonials, Pricing, FAQ)
    templates/   (SalesLong, Webinar, LeadMagnet)
  tokens/
    design-tokens.yaml
    tailwind-theme.ts
  animations/
    presets.ts
    scroll-triggers.ts
  utils/
    cn.ts        (tailwind-merge helper)
```
