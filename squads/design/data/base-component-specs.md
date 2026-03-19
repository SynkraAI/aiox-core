# Base Component Specs

> Especificacoes visuais dos componentes base extraidas do Figma Dev Mode + screenshots.
> Gerado pela task `f2-ingest-base-components`. Usado na Phase 2 para adaptar componentes shadcn.

---

## Design Patterns Globais

### Temas e Contexto

| Propriedade | Valor |
|---|---|
| **Tema primario** | Dark-first (componentes desenhados sobre `surface/950` #101010) |
| **Paleta** | Monocromatica — branco/preto para primary, sem brand colors em estados default |
| **Feedback colors** | Khewra=destructive, Midori=success, Sahara=warning, Atmos=info |

### Size Scale (consistente em todos os componentes)

| Size | Height | Icon Size | Font Size | Figma Token |
|---|---|---|---|---|
| **Tiny** | 24px | 16px | 12px | `spacing/24`, `font/size/4xs` |
| **Mini** | 32px (btn 24px) | 20px | 12px | `spacing/32`, `font/size/4xs` |
| **Small** | 32px (btn) / 48px (input) | 24px | 14px | `spacing/32`/`spacing/48`, `font/size/2xs` |
| **Medium** | 40px (btn) / 64px (input) | 32px | 16px | `spacing/40`/`spacing/64`, `font/size/3xs` |
| **Large** | 48px (btn) / 80px (input) | 32px | 16px | `spacing/48`/`spacing/80`, `font/size/3xs` |

### State Pattern (consistente em todos os componentes)

| State | Visual Change |
|---|---|
| **Default** | Base appearance |
| **Hover** | Background alpha increases (e.g. 10% → 20%), cursor pointer |
| **Focus** | White outline ring, `border: 2px solid white`, `inset: -4px`, `border-radius: radius/max` (buttons) or `radius/md` (inputs) |
| **Pressed** | Background alpha decreases slightly or darkens |
| **Filled** | (Inputs only) White text, clear icon appears |
| **Disabled** | `opacity: 0.2` (buttons) or `opacity: 0.5` (inputs), `pointer-events: none` |

### Focus Ring Pattern

```css
/* Buttons (pill shape) */
position: absolute;
border: 2px solid var(--color/surface/white, white);
inset: -4px;
border-radius: var(--radius/max, 9999px);

/* Inputs (rounded rect) */
position: absolute;
border: 2px solid var(--color/surface/white, white);
inset: -4px;
border-radius: var(--radius/md, 16px);
```

---

## 1. Button

> **Prioridade: 1** — Componente mais usado, define padrao visual.
> **shadcn mapping:** `Button`

### Variants

| Variant | Figma Name | Background | Text Color | Border | Font |
|---|---|---|---|---|---|
| **Primary** | `type=primary` | `rgba(255,255,255,0.9)` | `var(--color/surface/950, #101010)` | none | Outfit Medium, uppercase, tracking 0.5px |
| **Secondary** | `type=secondary` | transparent | `rgba(255,255,255,0.9)` | `2px solid rgba(255,255,255,0.3)` | Outfit Medium, uppercase, tracking 0.5px |
| **Tertiary** | `type=tertiary` | `rgba(255,255,255,0.1)` | `rgba(255,255,255,0.8)` | none | Inter Medium, normal case |
| **Quarter** (Ghost) | `type=quarter` | transparent | `rgba(255,255,255,0.8)` | none | Inter Medium, normal case |

### Sizes

| Size | Height | Padding | Font Size | Icon Size | Line Height |
|---|---|---|---|---|---|
| **Mini** | 24px | `px-[12px]` | 12px (`font/size/4xs`) | 20px | 16px |
| **Small** | 32px | `px-[12px]` | 14px (`font/size/2xs`) | 24px | 16px |
| **Medium** | 40px | `px-[12px]` | 16px (`font/size/3xs`) | 32px | 16px |
| **Large** | 48px | `px-[12px]` | 16px (`font/size/3xs`) | 32px | 16px |

### States (Primary variant)

```yaml
default:
  background: "rgba(255,255,255,0.9)"
  color: "var(--color/surface/950, #101010)"
  border-radius: "100px"  # pill shape (radius/max)
  padding: "0 12px"
  font-family: "Outfit"
  font-weight: 500
  text-transform: "uppercase"
  letter-spacing: "0.5px"

hover:
  background: "var(--color/surface/white, #FFFFFF)"  # full white
  cursor: "pointer"

focus:
  background: "rgba(255,255,255,0.9)"
  ring: "2px solid var(--color/surface/white, white)"
  ring-offset: "-4px"
  ring-radius: "var(--radius/max, 9999px)"

pressed:
  background: "rgba(255,255,255,0.7)"  # slightly dimmer

disabled:
  background: "rgba(255,255,255,0.9)"
  opacity: 0.2
  pointer-events: "none"
```

### States (Secondary variant)

```yaml
default:
  background: "transparent"
  color: "rgba(255,255,255,0.9)"
  border: "2px solid rgba(255,255,255,0.3)"
  border-radius: "100px"

hover:
  border-color: "rgba(255,255,255,0.5)"
  cursor: "pointer"

focus:
  ring: "2px solid var(--color/surface/white, white)"
  ring-offset: "-4px"

disabled:
  opacity: 0.2
  pointer-events: "none"
```

### States (Tertiary variant)

```yaml
default:
  background: "rgba(255,255,255,0.1)"
  color: "rgba(255,255,255,0.8)"
  border-radius: "100px"
  font-family: "Inter"
  text-transform: "none"

hover:
  background: "rgba(255,255,255,0.2)"
  cursor: "pointer"

focus:
  ring: "2px solid white"
  ring-offset: "-4px"

disabled:
  opacity: 0.2
  pointer-events: "none"
```

### States (Quarter/Ghost variant)

```yaml
default:
  background: "transparent"
  color: "rgba(255,255,255,0.8)"
  border-radius: "100px"
  font-family: "Inter"
  text-transform: "none"

hover:
  background: "rgba(255,255,255,0.1)"
  cursor: "pointer"

focus:
  ring: "2px solid white"
  ring-offset: "-4px"

disabled:
  opacity: 0.2
  pointer-events: "none"
```

### Token Mapping

| Figma Value | CSS Variable | Notes |
|---|---|---|
| `rgba(255,255,255,0.9)` | `--primary` (dark mode) | Primary button bg |
| `var(--color/surface/950)` | `--primary-foreground` (dark mode) | Primary button text |
| `rgba(255,255,255,0.3)` border | `--border` | Secondary button outline |
| `rgba(255,255,255,0.1)` | `--accent` / `--secondary` | Tertiary button bg |
| `rgba(255,255,255,0.8)` | `--foreground` at 80% | Tertiary/Quarter text |
| `100px` radius | `--radius` with `rounded-full` | Pill shape |
| `opacity: 0.2` | — | Disabled state |
| Focus ring | `--ring` / white border | 2px white outline, -4px offset |

### Layout

- Icons: left (arrow_back) and/or right (arrow_forward), both optional
- Text container: `px-[8px]` inner padding
- Icon + text in flex row, items-center

---

## 2. Text Input

> **Prioridade: 2** — Define padrao de formularios.
> **shadcn mapping:** `Input`

### Sizes

| Size | Height | Width | Padding | Font Size | Icon Size | Border Radius |
|---|---|---|---|---|---|---|
| **Tiny** | 32px | 260px | `pl-[12px] pr-[16px]` | 12px | 16px | `var(--radius/sm, 12px)` |
| **Mini** | 40px | 260px | `pl-[14px] pr-[18px]` | 14px | 20px | `var(--radius/sm, 12px)` |
| **Small** | 48px | 320px | `pl-[16px] pr-[20px]` | 16px | 24px | `var(--radius/sm, 12px)` |
| **Medium** | 64px | 320px | `pl-[20px] pr-[24px]` | 16px | 24px | `var(--radius/sm, 12px)` |
| **Large** | 80px | 320px | `pl-[24px] pr-[28px]` | 16px | 24px | `var(--radius/sm, 12px)` |

### States

```yaml
default:
  background: "rgba(255,255,255,0.1)"
  color: "rgba(255,255,255,0.5)"  # placeholder
  border: "none"
  border-radius: "var(--radius/sm, 12px)"
  font-family: "Inter"
  font-weight: 500
  overflow: "clip"

hover:
  background: "rgba(255,255,255,0.2)"
  cursor: "pointer"

focus:
  background: "rgba(255,255,255,0.1)"
  ring: "2px solid var(--color/surface/white, white)"
  ring-offset: "-4px"
  ring-radius: "var(--radius/md, 16px)"

pressed:
  background: "rgba(255,255,255,0.1)"
  color: "rgba(255,255,255,1)"  # text becomes full white

filled:
  background: "rgba(255,255,255,0.1)"
  color: "rgba(255,255,255,1)"  # user text full white
  # clear/X icon may appear on right

disabled:
  background: "rgba(255,255,255,0.1)"
  opacity: "var(--opacity/50, 0.5)"
  pointer-events: "none"
  color: "rgba(255,255,255,0.6)"
```

### Token Mapping

| Figma Value | CSS Variable | Notes |
|---|---|---|
| `rgba(255,255,255,0.1)` | `--input` (dark) / `--accent` | Input background |
| `rgba(255,255,255,0.5)` | `--muted-foreground` | Placeholder text |
| `rgba(255,255,255,1)` | `--foreground` | Filled/active text |
| `var(--radius/sm, 12px)` | `--radius-lg` | Input border radius |
| Focus ring 16px radius | `--radius-md` mapped to ring | Slightly larger than input radius |
| `opacity: 0.5` | — | Disabled state |

### Layout

- Left icon: optional (contextual — profile, search, lock, calendar, etc.)
- Right icon: optional (info, clear X, eye toggle, etc.)
- Gap between icon and text: `14px`
- Placeholder and value text: Inter Medium

### Input Variants (shared pattern)

All input types share the same base structure with different left/right icons:

| Input Type | Left Icon | Right Icon | Special |
|---|---|---|---|
| **Text Input** | profile | info | — |
| **Search Input** | search | kbd badge (CTRL+F) | — |
| **Password Input** | lock | eye (toggle visibility) | Dots for hidden text |
| **Date Input** | calendar | — | Placeholder: dd/mm/aaaa |
| **Time Input** | clock | — | Placeholder: 00:00 |
| **URL Input** | link | — | — |
| **Email Input** | mail | clear X (on filled) | — |
| **Number Input** | — | +/- stepper buttons | Stepper is unique |
| **Upload Input** | upload | — | File list below, feedback states |
| **Option Input** | number badge | — | Numbered choices, selected state |

---

## 3. Tag (Badge)

> **Prioridade: 3** — Componente simples, valida tokens.
> **shadcn mapping:** `Badge`

### Sizes

| Size | Height | Padding | Font Size |
|---|---|---|---|
| **Tiny** | 20px | `px-[8px]` | 10px |
| **Mini** | 24px | `px-[10px]` | 12px |

### States

```yaml
default:
  background: "rgba(255,255,255,0.1)"
  color: "rgba(255,255,255,0.8)"
  border-radius: "100px"  # pill
  font-family: "Inter"
  font-weight: 500

hover:
  background: "rgba(255,255,255,0.2)"

disabled:
  opacity: 0.5
```

### Layout

- Optional close X button on right
- Text + optional X icon in flex row

### Token Mapping

| Figma Value | CSS Variable |
|---|---|
| `rgba(255,255,255,0.1)` bg | `--secondary` |
| `rgba(255,255,255,0.8)` text | `--secondary-foreground` at 80% |
| `100px` radius | `rounded-full` |

---

## 4. Checkbox

> **shadcn mapping:** `Checkbox`

### Sizes

| Size | Box Size | Icon Size |
|---|---|---|
| **Tiny** | 16px | 12px |
| **Mini** | 20px | 16px |
| **Small** | 24px | 20px |

### States

```yaml
unchecked:
  background: "transparent"
  border: "2px solid rgba(255,255,255,0.3)"
  border-radius: "var(--radius/min, 4px)"

checked:
  background: "rgba(255,255,255,0.9)"
  border: "none"
  icon-color: "var(--color/surface/950, #101010)"  # dark checkmark

indeterminate:
  background: "rgba(255,255,255,0.9)"
  border: "none"
  icon-color: "var(--color/surface/950, #101010)"  # dark dash

hover:
  border-color: "rgba(255,255,255,0.5)"  # unchecked
  background: "var(--color/surface/white)"  # checked

focus:
  ring: "2px solid white"
  ring-offset: "-4px"

disabled:
  opacity: 0.2
```

### Token Mapping

| Figma Value | CSS Variable |
|---|---|
| `rgba(255,255,255,0.3)` border | `--border` |
| `rgba(255,255,255,0.9)` checked bg | `--primary` (dark) |
| `#101010` checkmark | `--primary-foreground` (dark) |
| `4px` radius | `--radius-sm` |

---

## 5. Radio Button

> **shadcn mapping:** `RadioGroup` + `RadioGroupItem`

### Sizes

| Size | Outer Size | Inner Dot Size |
|---|---|---|
| **Tiny** | 16px | 8px |
| **Mini** | 20px | 10px |
| **Small** | 24px | 12px |

### States

```yaml
unselected:
  background: "transparent"
  border: "2px solid rgba(255,255,255,0.3)"
  border-radius: "50%"

selected:
  background: "transparent"
  border: "2px solid rgba(255,255,255,0.9)"
  inner-dot: "rgba(255,255,255,0.9)"

hover:
  border-color: "rgba(255,255,255,0.5)"

focus:
  ring: "2px solid white"
  ring-offset: "-4px"
  ring-radius: "50%"

disabled:
  opacity: 0.2
```

---

## 6. Toggle (Switch)

> **shadcn mapping:** `Switch`

### Sizes

| Size | Track Width | Track Height | Thumb Size |
|---|---|---|---|
| **Tiny** | 28px | 16px | 12px |
| **Mini** | 36px | 20px | 16px |
| **Small** | 44px | 24px | 20px |

### States

```yaml
off:
  track-background: "rgba(255,255,255,0.1)"
  thumb-background: "rgba(255,255,255,0.5)"
  border-radius: "100px"

on:
  track-background: "rgba(255,255,255,0.9)"
  thumb-background: "var(--color/surface/950, #101010)"
  thumb-position: "right"

hover:
  track-background: "rgba(255,255,255,0.2)"  # off
  # or full white for on

focus:
  ring: "2px solid white"

disabled:
  opacity: 0.2
```

### Token Mapping

| Figma Value | CSS Variable |
|---|---|
| `rgba(255,255,255,0.9)` on track | `--primary` (dark) |
| `#101010` on thumb | `--primary-foreground` (dark) |
| `rgba(255,255,255,0.1)` off track | `--input` |

---

## 7. Icon Button

> **shadcn mapping:** `Button` variant=icon

### Sizes

| Size | Dimensions | Icon Size | Border Radius |
|---|---|---|---|
| **Tiny** | 24x24 | 16px | `100px` (pill) |
| **Mini** | 32x32 | 20px | `100px` |
| **Small** | 40x40 | 24px | `100px` |
| **Medium** | 48x48 | 32px | `100px` |
| **Large** | 56x56 | 32px | `100px` |

### Variants (same as Button)

- **Primary**: `bg-[rgba(255,255,255,0.9)]`, dark icon
- **Secondary**: `border-2 border-[rgba(255,255,255,0.3)]`, white icon
- **Tertiary**: `bg-[rgba(255,255,255,0.1)]`, white icon at 80%
- **Quarter** (Ghost): transparent, white icon at 80%

### States

Same pattern as Button: hover brightens, focus adds white ring, disabled opacity 0.2.

---

## 8. Link

> **shadcn mapping:** Custom (no direct shadcn equivalent, use `<a>` with utility classes)

### Sizes

| Size | Font Size | Icon Size |
|---|---|---|
| **Mini** | 12px | 16px |
| **Small** | 14px | 20px |

### States

```yaml
default:
  color: "rgba(255,255,255,0.8)"
  text-decoration: "underline"
  font-family: "Inter"
  font-weight: 500

hover:
  color: "rgba(255,255,255,1)"

focus:
  ring: "2px solid white"
  ring-offset: "-2px"

pressed:
  color: "rgba(255,255,255,0.6)"

disabled:
  opacity: 0.3
```

---

## 9. Avatar

> **shadcn mapping:** `Avatar` + `AvatarImage` + `AvatarFallback`

### Features

- Circular image with colored ring (brand colors)
- Avatar groups with overlapping layout
- Fallback: initials on colored background

### Sizes (estimated from screenshots)

| Size | Dimensions | Ring Width |
|---|---|---|
| **Small** | 32px | 2px |
| **Medium** | 40px | 2px |
| **Large** | 48px | 3px |

### Ring Colors (brand palette)

Various brand colors used: Atmos, Midori, Sahara, Khewra, Boreal, etc.

---

## 10. Tooltip

> **shadcn mapping:** `Tooltip` + `TooltipTrigger` + `TooltipContent`

### Spec

```yaml
background: "var(--color/surface/white, white)"  # light tooltip on dark UI
color: "var(--color/surface/950, #101010)"
border-radius: "var(--radius/xs, 8px)"
padding: "4px 8px"
font-family: "Inter"
font-size: "12px"
font-weight: 500
# Optional keyboard shortcut badge inside
```

---

## 11. Popover

> **shadcn mapping:** `Popover` + `PopoverTrigger` + `PopoverContent`

### Spec

```yaml
background: "var(--color/surface/900, #202020)"
border: "1px solid rgba(255,255,255,0.1)"
border-radius: "var(--radius/sm, 12px)"
padding: "16px"
box-shadow: "0 4px 24px rgba(0,0,0,0.3)"
```

### Variants

- **Default**: Simple content
- **With Form**: Contains inputs and action buttons

---

## 12. Dropdown (Select)

> **shadcn mapping:** `Select` + `SelectTrigger` + `SelectContent` + `SelectItem`

### Trigger

Same structure as Text Input — same sizes, same states, with chevron-down icon on right and optional clear X.

### Content (dropdown menu)

```yaml
background: "var(--color/surface/900, #202020)"
border: "1px solid rgba(255,255,255,0.1)"
border-radius: "var(--radius/sm, 12px)"
padding: "4px"
box-shadow: "0 4px 24px rgba(0,0,0,0.3)"
```

---

## 13. Item Menu

> **shadcn mapping:** `DropdownMenuItem` / `CommandItem`

### Sizes

| Size | Height | Padding | Font Size |
|---|---|---|---|
| **Small** | 32px | `px-[12px]` | 14px |
| **Medium** | 40px | `px-[16px]` | 14px |
| **Large** | 48px | `px-[16px]` | 16px |

### States

```yaml
default:
  background: "transparent"
  color: "rgba(255,255,255,0.8)"
  border-radius: "var(--radius/xs, 8px)"

hover:
  background: "rgba(255,255,255,0.1)"

focus:
  background: "rgba(255,255,255,0.1)"
  ring: "2px solid white"

pressed:
  background: "rgba(255,255,255,0.05)"

disabled:
  opacity: 0.3
```

### Layout

- Left: optional icon (24px)
- Center: label text
- Right: optional shortcut text or chevron-right icon
- Gap: 8px between elements

---

## 14. Textarea

> **shadcn mapping:** `Textarea`

### Sizes

| Size | Min Height | Padding | Font Size |
|---|---|---|---|
| **Tiny** | 64px | `p-[12px]` | 12px |
| **Mini** | 80px | `p-[14px]` | 14px |
| **Default** | 120px | `p-[16px]` | 16px |

### States

Same as Text Input: `rgba(255,255,255,0.1)` bg, focus ring, disabled opacity 0.5.

```yaml
default:
  background: "rgba(255,255,255,0.1)"
  border-radius: "var(--radius/sm, 12px)"
  font-family: "Inter"
  font-weight: 500
  resize: "vertical"
```

---

## 15. Dropdown Menu

> **shadcn mapping:** `DropdownMenu` + `DropdownMenuContent` + `DropdownMenuItem` + `DropdownMenuSeparator`

### Variants

- **Simple**: Plain text items
- **With Search**: Search input at top, filtered items below
- **Complete**: Sections with headers, icons, descriptions, and separators

### Container

```yaml
background: "var(--color/surface/900, #202020)"
border: "1px solid rgba(255,255,255,0.1)"
border-radius: "var(--radius/sm, 12px)"
padding: "4px"
min-width: "200px"
box-shadow: "0 4px 24px rgba(0,0,0,0.3)"
```

---

## 16. Toasts

> **shadcn mapping:** `Sonner` (toast library)
> **Nota do usuario:** "Animations sao apenas visualizacao, nao esta funcionando direito, fazer do jeito certo"

### Variants

| Type | Icon Color | Icon | Token |
|---|---|---|---|
| **Success** | `--success` (Midori #3A913F) | Checkmark circle | `oklch(0.585 0.145 144.414)` |
| **Error** | `--destructive` (Khewra #DC625E) | X circle | `oklch(0.646 0.154 24.222)` |
| **Warning** | `--warning` (Sahara #D6A461) | Warning triangle | `oklch(0.751 0.103 73.232)` |
| **Info** | `--info` (Atmos #77C5D5) | Info circle | `oklch(0.779 0.08 212.201)` |

### Spec

```yaml
background: "var(--color/surface/900, #202020)"
border: "1px solid rgba(255,255,255,0.1)"
border-radius: "var(--radius/sm, 12px)"
padding: "16px"
color: "rgba(255,255,255,0.9)"
font-family: "Inter"
font-size: "14px"
# Action buttons: "Confirmar" / "Desfazer" text links
```

### Layout

- Left: colored status icon
- Center: title (bold) + description
- Right: optional action buttons (text links)

---

## 17. Basic Dialog

> **shadcn mapping:** `Dialog` + `DialogContent` + `DialogHeader` + `DialogFooter`

### Spec

```yaml
overlay:
  background: "rgba(0,0,0,0.5)"

content:
  background: "var(--color/surface/900, #202020)"
  border: "1px solid rgba(255,255,255,0.1)"
  border-radius: "var(--radius/sm, 12px)"
  padding: "24px"
  max-width: "400px"
  box-shadow: "0 8px 32px rgba(0,0,0,0.5)"

header:
  icon: "warning triangle (colored)"
  title: "Inter Bold, 18px, white"
  description: "Inter Regular, 14px, rgba(255,255,255,0.6)"

body:
  # Optional input field
  margin-top: "16px"

footer:
  display: "flex"
  gap: "8px"
  justify-content: "flex-end"
  margin-top: "24px"
  # Primary + Secondary buttons
```

---

## 18. Input Feedback

> **shadcn mapping:** Custom validation states on Input

### Feedback Types

| Type | Border Color | Icon Color | Token |
|---|---|---|---|
| **User Error** | `--destructive` (Khewra) | Khewra | Red border + error icon |
| **System Error** | `--warning` (Sahara) | Sahara | Orange border + warning icon |
| **Success** | `--success` (Midori) | Midori | Green border + check icon |

### Spec

```yaml
error:
  border: "2px solid var(--destructive)"
  # Error message below input
  message-color: "var(--destructive)"
  message-font-size: "12px"

warning:
  border: "2px solid var(--warning)"
  message-color: "var(--warning)"

success:
  border: "2px solid var(--success)"
  message-color: "var(--success)"

multiple:
  # Multiple validation messages stacked below input
  # Each with its own icon and color
```

---

## 19. Notification Bar

> **shadcn mapping:** Custom component (Card-based)

### Spec

```yaml
background: "var(--color/surface/900, #202020)"
border: "1px solid rgba(255,255,255,0.1)"
border-radius: "var(--radius/sm, 12px)"
padding: "16px"
# Layout: image left, content center, actions right
# Content: title (bold), time (muted), description
# Actions: Accept (primary button) / Decline (ghost button)
```

---

## 20. Chat Notification

> **shadcn mapping:** Custom component

### Spec

```yaml
background: "var(--color/surface/900, #202020)"
border-radius: "var(--radius/sm, 12px)"
padding: "12px 16px"
# Layout: avatar left, content center, badge right
# Content: name (bold white), message (muted), time
# Badge: unread count (white bg, dark text, circular)
```

---

## 21. Comment Area

> **shadcn mapping:** Custom (Textarea + action buttons)

### Spec

```yaml
textarea:
  # Same as Textarea component base
  background: "rgba(255,255,255,0.1)"
  border-radius: "var(--radius/sm, 12px)"

actions:
  # Bottom bar with + (attach), star (favorite), send icons
  # Icon buttons: ghost variant (quarter)
  padding: "8px"
  border-top: "1px solid rgba(255,255,255,0.1)"
```

---

## 22. Prompt Area

> **shadcn mapping:** Custom (AI prompt input)
> **Nota do usuario:** "Incompleto, precisa ser planejado"

### Spec (partial)

```yaml
container:
  background: "rgba(255,255,255,0.1)"
  border-radius: "var(--radius/sm, 12px)"
  padding: "12px 16px"

input:
  # Textarea-like input area
  font-family: "Inter"
  placeholder: "AI prompt text"

actions:
  # Bottom: + (attach), mic (voice), send icon button
  # Model selector dropdown
```

---

## 23. Profile Header

> **shadcn mapping:** Custom component

### Variants

- **Default**: Avatar + name + role
- **With Badges**: Avatar + name + role + badge tags

---

## Componentes Prontos para Adaptacao

### Prioridade Alta (core — adaptar primeiro)

| # | Component | shadcn Base | Complexity |
|---|---|---|---|
| 1 | **Button** | `Button` | Alta — 4 variants, 4 sizes, 5 states |
| 2 | **Text Input** | `Input` | Media — 5 sizes, 6 states, 10 sub-types |
| 3 | **Tag** | `Badge` | Baixa — 2 sizes, pill shape |
| 4 | **Checkbox** | `Checkbox` | Baixa — 3 sizes, 3 check states |
| 5 | **Radio Button** | `RadioGroup` | Baixa — 3 sizes |
| 6 | **Toggle** | `Switch` | Baixa — 3 sizes |

### Prioridade Media (compostos)

| # | Component | shadcn Base | Complexity |
|---|---|---|---|
| 7 | **Icon Button** | `Button` variant=icon | Media — reusa Button |
| 8 | **Dropdown** | `Select` | Media — trigger = Input |
| 9 | **Item Menu** | `DropdownMenuItem` | Baixa |
| 10 | **Textarea** | `Textarea` | Baixa — segue Input |
| 11 | **Dropdown Menu** | `DropdownMenu` | Media — 3 variants |
| 12 | **Tooltip** | `Tooltip` | Baixa |
| 13 | **Popover** | `Popover` | Baixa |

### Prioridade Baixa (feedback + compostos complexos)

| # | Component | shadcn Base | Complexity |
|---|---|---|---|
| 14 | **Toasts** | `Sonner` | Media — 4 types |
| 15 | **Basic Dialog** | `Dialog` | Media |
| 16 | **Input Feedback** | Custom on Input | Baixa — adds borders |
| 17 | **Link** | Custom `<a>` | Baixa |
| 18 | **Avatar** | `Avatar` | Baixa |

### Fora de Escopo (precisa planejamento)

| # | Component | Motivo |
|---|---|---|
| 19 | **Notification Bar** | Componente custom, sem shadcn base |
| 20 | **Chat Notification** | Componente custom, sem shadcn base |
| 21 | **Comment Area** | Componente composto (textarea + actions) |
| 22 | **Prompt Area** | Incompleto no Figma, precisa ser planejado |
| 23 | **Profile Header** | Componente custom layout |

---

## Validacao

- [x] Button especificado (4 variants, 4 sizes, 5 states)
- [x] Input especificado (5 sizes, 6 states, 10 sub-types)
- [x] Todos os estados basicos cobertos (default, hover, focus, pressed, disabled)
- [x] Valores mapeados para tokens existentes da Phase 1
- [x] Screenshots confirmam CSS do Figma Dev Mode (validacao cruzada OK)

---

*Gerado por: Foundations Pipeline — Phase 2 (f2-ingest-base-components)*
*Fonte: Figma Dev Mode + components-ref/ screenshots + Figma MCP design context*
*Data: 2026-02-21*
