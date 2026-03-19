# Component Visual Spec: {ComponentName}

> Version: 1.0.0
> Last Updated: {DATE}
> Status: {Draft|Review|Approved}

---

## Overview

**Component:** {ComponentName}
**Category:** {atom|molecule|organism}
**Location:** `app/components/{domain}/{feature}/{ComponentName}.tsx`

**Purpose:**
{Brief description of what this component does}

---

## Anatomy

```
┌─────────────────────────────────────────┐
│  ┌─────┐                         ┌───┐  │
│  │Icon │  {Label Text}           │ X │  │
│  └─────┘                         └───┘  │
└─────────────────────────────────────────┘
   ^         ^                       ^
   |         |                       |
 Leading   Content               Trailing
  Slot                             Slot
```

**Slots:**
- Leading: Icon, Avatar, Checkbox
- Content: Label, Description
- Trailing: Action, Badge, Close button

---

## Variants

### Size Variants

| Size | Height | Padding | Font Size | Icon Size |
|------|--------|---------|-----------|-----------|
| sm | 32px | py-2 px-3 | text-xs | 16px |
| md | 40px | py-2.5 px-4 | text-sm | 20px |
| lg | 48px | py-3 px-5 | text-base | 24px |

### Style Variants

| Variant | Background | Text | Border | Use Case |
|---------|------------|------|--------|----------|
| primary | studio-primary | studio-bg | none | Primary actions |
| secondary | surface | foreground | border-white/10 | Secondary actions |
| outline | transparent | studio-primary | studio-primary/50 | Tertiary actions |
| ghost | transparent | muted-foreground | none | Subtle actions |
| destructive | red-500 | white | none | Destructive actions |

---

## States

### Interactive States

| State | Visual Change | Transition |
|-------|---------------|------------|
| Default | Base styles | - |
| Hover | brightness +10%, cursor pointer | 200ms ease-out |
| Focus | ring-2 ring-studio-primary/50 | instant |
| Active | scale(0.98), brightness -5% | 100ms |
| Disabled | opacity-50, cursor-not-allowed | - |
| Loading | spinner, text hidden | - |

### State Tokens

```css
/* Default */
--state-bg: var(--surface);
--state-text: var(--foreground);
--state-border: var(--border);

/* Hover */
--state-bg-hover: var(--surface-hover);

/* Focus */
--state-ring: var(--primary-color);
--state-ring-opacity: 0.5;

/* Disabled */
--state-opacity-disabled: 0.5;
```

---

## Spacing

### Internal Spacing

```
┌──────────────────────────────────────────┐
│ padding-y                                │
│  ┌────────────────────────────────────┐  │
│  │ padding-x                          │  │
│  │  ┌──────┐  gap  ┌──────────────┐  │  │
│  │  │ Icon │ ───── │    Label     │  │  │
│  │  └──────┘       └──────────────┘  │  │
│  │                                    │  │
│  └────────────────────────────────────┘  │
│                                          │
└──────────────────────────────────────────┘
```

| Property | sm | md | lg |
|----------|----|----|-----|
| padding-x | 12px (px-3) | 16px (px-4) | 20px (px-5) |
| padding-y | 8px (py-2) | 10px (py-2.5) | 12px (py-3) |
| gap | 8px (gap-2) | 8px (gap-2) | 12px (gap-3) |
| icon-size | 16px | 20px | 24px |

### External Spacing

| Context | Recommended Spacing |
|---------|---------------------|
| In button group | gap-2 |
| In form | mt-4 or space-y-4 |
| In card footer | mt-6 |

---

## Typography

| Element | Font | Size | Weight | Line Height |
|---------|------|------|--------|-------------|
| Label | Inter | text-sm | font-medium (500) | leading-5 |
| Description | Inter | text-xs | font-normal (400) | leading-4 |
| Badge | Inter | text-xs | font-medium (500) | leading-4 |

---

## Colors

### Light Theme (if applicable)

| Element | Token | Value |
|---------|-------|-------|
| Background | bg-white | #FFFFFF |
| Text | text-gray-900 | #111827 |
| Border | border-gray-200 | #E5E7EB |

### Dark Theme (default)

| Element | Token | Value |
|---------|-------|-------|
| Background | studio-card-bg | #111116 |
| Text | foreground | #FFFFFF |
| Border | border-white/10 | rgba(255,255,255,0.1) |
| Primary | studio-primary | #D4AF37 |

### Semantic Colors

| State | Token | Value |
|-------|-------|-------|
| Success | status-success | #22C55E |
| Warning | status-warning | #F59E0B |
| Error | status-error | #EF4444 |
| Info | status-info | #3B82F6 |

---

## Borders & Radius

| Property | Value | Tailwind |
|----------|-------|----------|
| Border width | 1px | border |
| Border radius | 6px | rounded-md |
| Focus ring | 2px | ring-2 |
| Focus offset | 2px | ring-offset-2 |

---

## Shadows

| Variant | Shadow | Use Case |
|---------|--------|----------|
| Flat | none | Default buttons |
| Elevated | shadow-sm | Dropdown triggers |
| Floating | shadow-md | Dropdowns, popovers |

---

## Motion

### Transitions

| Property | Duration | Easing | Tailwind |
|----------|----------|--------|----------|
| Colors | 200ms | ease-out | transition-colors duration-200 |
| Transform | 100ms | ease-out | transition-transform duration-100 |
| All | 200ms | ease-in-out | transition-all duration-200 |

### Animations

| Animation | Duration | Use Case |
|-----------|----------|----------|
| Fade in | 150ms | Appear |
| Scale in | 100ms | Pop in |
| Slide in | 200ms | Panel open |

---

## Accessibility

### WCAG Requirements

| Requirement | Status | Notes |
|-------------|--------|-------|
| Color contrast (AA) | Required | 4.5:1 for text |
| Focus visible | Required | ring-2 ring-primary/50 |
| Keyboard nav | Required | Tab, Enter, Space |
| Screen reader | Required | aria-label if icon-only |

### Keyboard Interactions

| Key | Action |
|-----|--------|
| Tab | Move focus to/from component |
| Enter | Activate component |
| Space | Activate component |
| Escape | Close/cancel (if applicable) |

### ARIA Attributes

```tsx
<button
  role="button"
  aria-label="{label}" // if icon-only
  aria-pressed="{true|false}" // if toggle
  aria-disabled="{true|false}"
  aria-busy="{true|false}" // if loading
>
```

---

## Implementation Reference

### Tailwind Classes

```tsx
// Base classes
const baseClasses = cn(
  // Layout
  "inline-flex items-center justify-center gap-2",
  // Typography
  "text-sm font-medium",
  // Borders
  "rounded-md border",
  // Transitions
  "transition-colors duration-200",
  // Focus
  "focus:outline-none focus:ring-2 focus:ring-studio-primary/50 focus:ring-offset-2",
  // Disabled
  "disabled:opacity-50 disabled:cursor-not-allowed"
);

// Size variants
const sizeClasses = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

// Style variants
const variantClasses = {
  primary: "bg-studio-primary text-studio-bg hover:bg-studio-primary-dark border-transparent",
  secondary: "bg-surface text-foreground hover:bg-surface/80 border-white/10",
  outline: "bg-transparent text-studio-primary hover:bg-studio-primary/10 border-studio-primary/50",
  ghost: "bg-transparent text-muted-foreground hover:bg-white/5 border-transparent",
  destructive: "bg-red-500 text-white hover:bg-red-600 border-transparent",
};
```

### Props Interface

```typescript
interface {ComponentName}Props {
  // Content
  children?: React.ReactNode;
  label?: string;

  // Variants
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';

  // States
  disabled?: boolean;
  loading?: boolean;

  // Slots
  leadingIcon?: IconName;
  trailingIcon?: IconName;

  // Events
  onClick?: () => void;

  // Styling
  className?: string;
}
```

---

## Visual Examples

### Default State
```
┌─────────────────────┐
│   🔵  Button Label  │
└─────────────────────┘
```

### Hover State
```
┌─────────────────────┐
│   🔵  Button Label  │  ← brightness +10%
└─────────────────────┘
```

### Focus State
```
┏━━━━━━━━━━━━━━━━━━━━━┓
┃   🔵  Button Label  ┃  ← ring-2 ring-primary/50
┗━━━━━━━━━━━━━━━━━━━━━┛
```

### Loading State
```
┌─────────────────────┐
│      ⟳ Loading...   │  ← spinner + text
└─────────────────────┘
```

### Disabled State
```
┌─────────────────────┐
│   🔵  Button Label  │  ← opacity-50
└─────────────────────┘
```

---

## Validation Checklist

- [ ] All colors use tokens (no hardcoded hex)
- [ ] All spacing uses scale (no hardcoded px)
- [ ] Contrast ratios meet WCAG AA
- [ ] Focus states visible
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly
- [ ] Transitions are smooth (200ms)
- [ ] Loading state implemented
- [ ] Disabled state implemented
- [ ] All size variants implemented
- [ ] All style variants implemented

---

## Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | {DATE} | Initial spec |

---

*Spec generated by Brad - Design System Architect*
