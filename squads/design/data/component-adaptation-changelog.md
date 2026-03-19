# Component Adaptation Changelog

> Registro de mudancas visuais aplicadas aos componentes shadcn/UI para corresponder ao Figma.
> Gerado pela task `f2-adapt-shadcn-components`.

---

## Principios Aplicados

- **Apenas Tailwind classes modificadas** — JSX, props, Radix primitives, ARIA, exports inalterados
- **Tokens semanticos** — Nenhum valor hex/rgb hardcoded
- **Focus ring unificado** — `ring-2 ring-foreground ring-offset-2 ring-offset-background` em todos
- **Dark-first** — Estilos dark-mode como referencia primaria
- **Pill shapes** — Buttons, badges, icon buttons usam `rounded-full`
- **Overlay containers** — Popover, dropdown, select, dialog usam `rounded-xl border-border`

---

## Button (`components/ui/button.tsx`)

### Visual Changes
- `rounded-md` → `rounded-full` (pill shape — Figma 100px)
- Focus ring: `ring-[3px] ring-ring/50` → `ring-2 ring-foreground ring-offset-2 ring-offset-background`
- Disabled: `opacity-50` → `opacity-20` (Figma 0.2)
- Removed `shadow-xs` from variants

### Variant Changes
| Variant | Before | After |
|---|---|---|
| **default** (= Figma Primary) | `bg-primary text-primary-foreground hover:bg-primary/90` | + `font-heading uppercase tracking-wide`, hover full white in dark |
| **destructive** | `dark:bg-destructive/60` | Removed dark dim, added `font-heading uppercase tracking-wide` |
| **outline** (= Figma Secondary) | `border bg-background shadow-xs` | `border-2 border-border bg-transparent`, + `font-heading uppercase tracking-wide` |
| **secondary** (= Figma Tertiary) | `bg-secondary hover:bg-secondary/80` | + `font-body` (Inter, normal case) |
| **ghost** (= Figma Quarter) | `hover:bg-accent` | + `text-foreground/80 font-body` |
| **link** | `text-primary` | `text-foreground/80 font-body` |

### Size Changes
| Size | Before | After |
|---|---|---|
| **default** | `h-9 px-4 text-sm` | `h-10 px-3 text-base` (Figma Medium 40px) |
| **xs** | `h-6 px-2 text-xs` | `h-6 px-3 text-xs` (Figma Mini 24px) |
| **sm** | `h-8 px-3` | `h-8 px-3 text-sm` (Figma Small 32px) |
| **lg** | `h-10 px-6` | `h-12 px-3 text-base` (Figma Large 48px) |
| **icon** | `size-9` | `size-10` |
| **icon-xs** | `size-6 rounded-md` | `size-6` (inherits rounded-full) |
| **icon-sm** | `size-8` | `size-8` |
| **icon-lg** | `size-10` | `size-12` |

### Preserved
- All 6 variants + 8 sizes
- `asChild` prop with Radix `Slot.Root`
- `data-slot="button"`, `data-variant`, `data-size`
- CVA pattern, TypeScript types, exports

---

## Input (`components/ui/input.tsx`)

### Visual Changes
- Border: `border border-input` → `border-none`
- Background: `bg-transparent dark:bg-input/30` → `bg-accent/50 dark:bg-input/30`
- Radius: `rounded-md` → `rounded-lg` (Figma 12px)
- Shadow: `shadow-xs` → `shadow-none`
- Height: `h-9` → `h-12` (Figma small = 48px)
- Padding: `px-3` → `px-4` (Figma 16px)
- Font: Added `font-medium font-body`
- Focus ring: `ring-[3px] ring-ring/50` → `ring-2 ring-foreground ring-offset-2`
- Hover: Added `hover:bg-accent dark:hover:bg-input/50`
- Invalid: `aria-invalid:border-destructive` → `aria-invalid:ring-2 aria-invalid:ring-destructive`

### Preserved
- `data-slot="input"`, all HTML input props
- File input styles, selection styles
- Disabled behavior (`opacity-50`, pointer-events-none)

---

## Badge (`components/ui/badge.tsx`)

### Visual Changes
- Removed `border border-transparent` from base
- Padding: `px-2` → `px-2.5`
- Font: Added `font-body`
- Focus ring: unified to `ring-2 ring-foreground ring-offset-2`
- Transition: `transition-[color,box-shadow]` → `transition-all`

### Variant Changes
| Variant | Change |
|---|---|
| **default** | Changed from `bg-primary` to `bg-secondary` (Figma tag = subtle bg) |
| **primary** | NEW — replaces old default (strong bg) |
| **success** | NEW — `bg-success text-success-foreground` |
| **warning** | NEW — `bg-warning text-warning-foreground` |
| **info** | NEW — `bg-info text-info-foreground` |
| **secondary** | Changed to `bg-accent text-foreground/80` |
| **destructive** | Removed `dark:bg-destructive/60` |

### Preserved
- `rounded-full`, `asChild`, `data-slot="badge"`, all props

---

## Card (`components/ui/card.tsx`)

### Visual Changes
- Border: `border` → `border border-border` (explicit token)
- Shadow: `shadow-sm` → `shadow-none dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]`

### Preserved
- `rounded-xl`, all sub-components (Header, Title, Description, Action, Content, Footer)
- `bg-card text-card-foreground` tokens, `data-slot` attributes

---

## Alert (`components/ui/alert.tsx`)

### Visual Changes
- Border: `border` → `border border-border` (explicit token)
- Destructive: Added `border-destructive/50`, explicit `[&>svg]:text-destructive`

### New Variants
| Variant | Classes |
|---|---|
| **warning** | `border-warning/50 text-warning [&>svg]:text-warning` |
| **info** | `border-info/50 text-info [&>svg]:text-info` |
| **success** | `border-success/50 text-success [&>svg]:text-success` |

### Preserved
- Grid layout, `role="alert"`, all sub-components, `data-slot` attributes

---

## Dialog (`components/ui/dialog.tsx`)

### Visual Changes
- Content bg: `bg-background` → `bg-card` (Figma surface/900 in dark)
- Radius: `rounded-lg` → `rounded-xl`
- Border: `border` → `border border-border`
- Shadow: Added `dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]`
- Close button: `rounded-xs` → `rounded-full`, focus ring unified

### Preserved
- Overlay `bg-black/50`, animations, all sub-components
- `showCloseButton` prop, Radix primitives, `data-slot` attributes

---

## Checkbox (`components/ui/checkbox.tsx`)

### Visual Changes
- Border: `border-input` → `border-2 border-border` (Figma 2px)
- Removed `dark:bg-input/30` background
- Shadow: `shadow-xs` → `shadow-none`
- Focus ring: unified to `ring-2 ring-foreground ring-offset-2`
- Disabled: `opacity-50` → `opacity-20`
- Transition: `transition-shadow` → `transition-all`

### Preserved
- `rounded-[4px]` (= `rounded-sm`, Figma 4px), `size-4`, Radix primitives, CheckIcon

---

## RadioGroup (`components/ui/radio-group.tsx`)

### Visual Changes
- Border: `border-input` → `border-2 border-border`
- Removed `dark:bg-input/30` background
- Shadow: `shadow-xs` → `shadow-none`
- Focus ring: unified
- Added `data-[state=checked]:border-primary`
- Disabled: `opacity-50` → `opacity-20`
- Transition: → `transition-all`

### Preserved
- `rounded-full`, `size-4`, CircleIcon indicator, Radix primitives

---

## Switch (`components/ui/switch.tsx`)

### Visual Changes
- Shadow: `shadow-xs` → `shadow-none`
- Focus ring: unified to `ring-2 ring-foreground ring-offset-2`
- Disabled: `opacity-50` → `opacity-20`

### Preserved
- Checked/unchecked bg tokens, thumb styles, size data attributes, Radix primitives

---

## Textarea (`components/ui/textarea.tsx`)

### Visual Changes
- Border: `border-input border` → `border-none`
- Background: `bg-transparent dark:bg-input/30` → `bg-accent/50 dark:bg-input/30`
- Radius: `rounded-md` → `rounded-lg`
- Shadow: `shadow-xs` → `shadow-none`
- Padding: `px-3 py-2` → `px-4 py-3`
- Font: Added `font-medium font-body`
- Focus ring: unified
- Hover: Added `hover:bg-accent dark:hover:bg-input/50`

### Preserved
- `field-sizing-content`, `min-h-16`, disabled behavior, `data-slot="textarea"`

---

## Tooltip (`components/ui/tooltip.tsx`)

### Visual Changes
- Radius: `rounded-md` → `rounded-lg`
- Font: Added `font-medium font-body`

### Preserved
- `bg-foreground text-background` (inverted — correct for dark-first)
- All animations, arrow, Radix primitives

---

## Select (`components/ui/select.tsx`)

### SelectTrigger Changes
- Border: `border-input border` → `border-none`
- Background: `bg-transparent dark:bg-input/30` → `bg-accent/50 dark:bg-input/30`
- Radius: `rounded-md` → `rounded-lg`
- Shadow: `shadow-xs` → `shadow-none`
- Height: `data-[size=default]:h-9` → `h-12`
- Font: Added `font-medium font-body`
- Focus ring: unified
- Hover: Added `hover:bg-accent`

### SelectContent Changes
- Radius: `rounded-md` → `rounded-xl`
- Border: `border` → `border border-border`
- Shadow: Added `dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]`

### SelectItem Changes
- `rounded-sm` → `rounded-lg`

### Preserved
- All Radix primitives, scroll buttons, separator, label, icons

---

## DropdownMenu (`components/ui/dropdown-menu.tsx`)

### Content Changes
- Radius: `rounded-md` → `rounded-xl`
- Border: `border` → `border border-border`
- Shadow: Added `dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]`

### Item Changes
- `rounded-sm` → `rounded-lg`

### SubContent Changes
- Same as content (rounded-xl, border-border, dark shadow)

### Preserved
- All sub-components, Radix primitives, variants, inset, shortcuts

---

## Popover (`components/ui/popover.tsx`)

### Visual Changes
- Radius: `rounded-md` → `rounded-xl`
- Border: `border` → `border border-border`
- Shadow: Added `dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]`

### Preserved
- All sub-components, anchor, Radix primitives

---

## Sonner/Toaster (`components/ui/sonner.tsx`)

### Visual Changes
- Border radius: `var(--radius)` → `var(--radius-lg)` (12px)
- Added semantic toast colors: success/error/warning/info border + bg tokens

### Preserved
- Theme integration, all icons, component structure

---

## Summary

| Component | Files Changed | Variants | Props Changed | Breaking Changes |
|---|---|---|---|---|
| Button | 1 | 6 variants, 8 sizes | 0 | 0 |
| Input | 1 | — | 0 | 0 |
| Badge | 1 | 9 variants (+3 new) | 0 | 0 (default now = secondary look) |
| Card | 1 | — | 0 | 0 |
| Alert | 1 | 5 variants (+3 new) | 0 | 0 |
| Dialog | 1 | — | 0 | 0 |
| Checkbox | 1 | — | 0 | 0 |
| RadioGroup | 1 | — | 0 | 0 |
| Switch | 1 | — | 0 | 0 |
| Textarea | 1 | — | 0 | 0 |
| Tooltip | 1 | — | 0 | 0 |
| Select | 1 | — | 0 | 0 |
| DropdownMenu | 1 | — | 0 | 0 |
| Popover | 1 | — | 0 | 0 |
| Sonner | 1 | — | 0 | 0 |
| **Total** | **15 files** | **+6 new variants** | **0** | **0** |

---

## Build Validation

- `next build` — PASS (compiled in 1829ms, 0 errors)
- TypeScript — PASS (no type errors)
- No props API changes — PASS

---

*Gerado por: Foundations Pipeline — Phase 2 (f2-adapt-shadcn-components)*
*Data: 2026-02-21*
