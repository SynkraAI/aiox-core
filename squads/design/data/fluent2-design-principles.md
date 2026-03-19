# Microsoft Fluent 2 — Design Principles Reference

**Source:** Microsoft Fluent 2 documentation and team insights
**Purpose:** Reference for evaluating and building components aligned with Fluent 2

---

## Core Principles

### 1. Clarity
- Remove ambiguity. Every element should serve a clear purpose.
- Typography and spacing create visual hierarchy without decoration.
- Information architecture is the design — not the chrome around it.

### 2. System
- Components work together as a coherent system, not isolated pieces.
- Consistent patterns reduce cognitive load across all Microsoft products.
- Cross-platform consistency: same mental model on Web, iOS, Android, Windows.

### 3. Productive
- Optimize for task completion, not aesthetics alone.
- Reduce clicks, reduce decisions, reduce friction.
- Compound components expose exactly the API surface users need.

---

## Component Architecture: Compound Components

Fluent 2 uses compound components pattern extensively:

```tsx
<Menu>
  <MenuTrigger>
    <Button>Options</Button>
  </MenuTrigger>
  <MenuPopover>
    <MenuList>
      <MenuItem>Edit</MenuItem>
      <MenuItem>Delete</MenuItem>
    </MenuList>
  </MenuPopover>
</Menu>
```

**Why compound:** Each sub-component is independently testable, styleable, and replaceable. The parent orchestrates behavior while children handle rendering.

### Key Patterns
- **Slots:** Components accept slot props for customizable sub-parts
- **Controlled/Uncontrolled:** Both patterns supported via hooks
- **Composition over configuration:** Combine simple parts vs. one component with 50 props
- **Forward refs:** All components forward refs for imperative access

---

## Token Structure

Fluent 2 tokens follow a layered architecture:
- **Global tokens:** Brand-agnostic base values (colorNeutralBackground1)
- **Alias tokens:** Semantic mapping (colorBrandBackground = global.brand[80])
- **Component tokens:** Component-specific (buttonPrimaryBackground)

### Naming Convention
```
color + category + variant + state
```
Examples: `colorNeutralForeground1`, `colorBrandBackgroundHover`, `colorPaletteRedBorder1`

---

## Cross-Platform Strategy

| Platform | Package | Approach |
|----------|---------|----------|
| Web | `@fluentui/react-components` | React 18+, compound components |
| iOS | `@fluentui-apple` | Swift, native UIKit/SwiftUI |
| Android | `@fluentui-android` | Kotlin, Jetpack Compose |
| Windows | WinUI 3 | XAML, native controls |

**Shared:** Token values and naming across all platforms. Component APIs are platform-native, not wrapped web views.

---

## Accessibility Approach

Fluent 2's philosophy: **built-in, not bolted-on.**

- Every component ships with ARIA attributes by default
- Keyboard navigation is a first-class concern in component design
- Focus management handled at the system level (FocusZone, Tabster)
- High contrast mode supported via token architecture (not separate CSS)
- Screen reader testing is part of component acceptance criteria

---

## Team Structure Insight

The Fluent 2 design system documentation site was built by a remarkably small team:
- 1 PM (program manager)
- 1 Lead Engineer
- 1 Content Designer
- 1 Principal Designer (Filip Aleksandrow)

Built with **Astro** for the documentation site. Proves that a well-organized small team can ship a world-class DS.

---

## When to Reference Fluent 2

- Building enterprise/productivity applications
- Need cross-platform consistency (Web + mobile + desktop)
- Compound component architecture decisions
- Token naming conventions at scale
- Accessibility-first component design
- Small team building large-scope DS
