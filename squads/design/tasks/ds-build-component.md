# Build Production-Ready Component

> Task ID: atlas-build-component
> Agent: Brad (Design System Architect)
> Version: 1.1.0
> v4.0-compatible: true
> **Execution Type:** `Agent`
> **Dependencies:** depends_on: `[]` · enables: `[ds-compose-molecule, ds-extend-pattern]` · workflow: `greenfield`

## Description

Generate production-ready React TypeScript component from design tokens. Includes component file, styles (CSS Modules), tests, optional Storybook stories, and documentation. All styling uses tokens (zero hardcoded values). **v4.0: Supports Fluent 2 patterns as component blueprint option. Generates Storybook stories with Chromatic-ready visual test states.**

## Output Schema
- **produces:** `outputs/design-system/{project}/components/{Component}/`
- **format:** TypeScript source (TSX, CSS Module, tests, stories, docs)
- **consumed_by:** ds-compose-molecule, ds-extend-pattern

## Prerequisites

- Setup completed (*setup command run successfully)
- Tokens loaded and accessible
- React and TypeScript configured
- Reference: Read data/fluent2-design-principles.md for Fluent 2 component patterns
- Reference: Read data/ds-reference-architectures.md for cross-system component patterns

## Workflow

### Interactive Elicitation

This task uses interactive elicitation to configure component.

1. **Select Component Type**
   - Atomic level (atom, molecule, organism)
   - Component name (Button, Input, Card, etc)
   - Confirm token availability for this component

2. **Configure Component Features**
   - Variants needed (primary, secondary, destructive)
   - Sizes needed (sm, md, lg)
   - States needed (hover, disabled, loading, error)
   - Additional props

3. **Review Generation Plan**
   - Show files to be generated
   - Confirm test coverage requirements
   - Ask for Storybook stories (if enabled)

### Steps

1. **Validate Prerequisites**
   - Run `test -f tokens.yaml` (or tokens.json) to confirm tokens file exists; abort with "Tokens not found — run *setup first" if missing
   - Search for existing `{Component}.tsx` in the design-system directory; if found, prompt user to confirm overwrite
   - Validate component name matches PascalCase regex `/^[A-Z][a-zA-Z]+$/`
   - Check: tokens file exists AND component name is PascalCase (`/^[A-Z][a-zA-Z]+$/`) — abort if either fails

2. **Load Token References**
   - Identify which tokens this component needs
   - Validate token availability
   - Generate token import statements
   - Check: grep each required token name in tokens file — list missing tokens if any

3. **Generate Component File**
   - Create TypeScript React component
   - Add prop type definitions (strict typing)
   - Implement variants, sizes, states
   - Add accessibility attributes (ARIA)
   - Use semantic HTML elements
   - Check: `tsc --noEmit {component}.tsx` returns exit code 0 — fix type errors before proceeding

4. **Generate Component Styles**
   - Create CSS Module file ({Component}.module.css)
   - Use CSS custom properties from tokens
   - Implement all variants and states
   - Add responsive styles if needed
   - Zero hardcoded values (all from tokens)
   - Check: zero hardcoded color/spacing values in CSS module — grep for `#[0-9a-f]` and `[0-9]+px` (excluding 0px)

5. **Generate Unit Tests**
   - Create test file ({Component}.test.tsx)
   - Test all variants render correctly
   - Test all sizes work
   - Test disabled state
   - Test onClick/events
   - Aim for >80% coverage
   - Check: `npm test -- --coverage {Component}.test.tsx` exits 0 AND coverage >= 80% — fix failing tests before proceeding

6. **Generate Storybook Stories (Optional)**
   - If Storybook enabled, create {Component}.stories.tsx
   - Story for each variant
   - Story for each size
   - Interactive controls for props
   - Check: stories file exports at least one named story AND `tsc --noEmit {Component}.stories.tsx` exits 0

7. **Run Accessibility Checks**
   - Confirm all interactive elements have `aria-label` or visible text by searching component source for button/a/input tags without labels
   - Measure color contrast ratio for all foreground/background token pairs and confirm each >= 4.5:1 (use WCAG contrast formula)
   - Tab through all interactive elements in render order and confirm focus moves logically without traps
   - Add `:focus-visible` outline styles using `var(--color-focus)` token
   - Check: all interactive elements have ARIA labels AND color contrast ratio >= 4.5:1 AND focus-visible styles present

8. **Generate Component Documentation**
   - Create {Component}.md in docs/
   - Document props and types
   - Show usage examples
   - List variants and sizes
   - Include accessibility notes
   - Check: {Component}.md exists AND contains sections: Props, Usage Examples, Variants, Accessibility

9. **Update Component Index**
   - Add to design-system/index.ts
   - Export component for easy import
   - Update barrel exports
   - Check: `grep -q "{Component}" index.ts` — abort with "{Component} not found in index.ts exports"

10. **Update State File**
    - Add component to patterns_built in .state.yaml
    - Record atomic level, variants, test coverage
    - Increment component count
    - Check: .state.yaml contains component name in patterns_built array AND component_count incremented

## Output

- **{Component}.tsx**: React TypeScript component
- **{Component}.module.css**: Styles using tokens
- **{Component}.test.tsx**: Unit tests
- **{Component}.stories.tsx**: Storybook stories (optional)
- **{Component}.md**: Component documentation
- **Updated index.ts**: Component exported
- **.state.yaml**: Updated with component metadata

### Output Format

```typescript
// Button.tsx
import React from 'react';
import styles from './Button.module.css';

export interface ButtonProps {
  /** Visual style variant */
  variant?: 'primary' | 'secondary' | 'destructive';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Button content */
  children: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** HTML type attribute */
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
  type = 'button',
}) => {
  const className = `${styles.btn} ${styles[`btn-${variant}`]} ${styles[`btn-${size}`]}`;

  return (
    <button
      type={type}
      className={className}
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
    >
      {children}
    </button>
  );
};
```

```css
/* Button.module.css */
.btn {
  font-family: var(--font-base);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-base);
  padding: var(--space-md) var(--space-lg);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.btn-secondary {
  background: var(--color-secondary);
  color: white;
}

.btn-destructive {
  background: var(--color-error);
  color: white;
}

.btn-sm {
  font-size: var(--font-size-sm);
  padding: var(--space-sm) var(--space-md);
}

.btn-lg {
  font-size: var(--font-size-lg);
  padding: var(--space-lg) var(--space-xl);
}
```

## Failure Handling

- **Missing required tokens:** If grep fails to find token name in tokens file, abort with "Required token {name} not found. Available tokens: {list}. Run *setup or add missing tokens before building component."
- **TypeScript compilation errors:** If `tsc --noEmit {component}.tsx` returns non-zero exit code, abort with "TypeScript errors in {Component}.tsx: {errors}. Fix type errors before proceeding."
- **Hardcoded design values detected:** If CSS module contains hardcoded colors (#hex) or spacing values (e.g., 16px except 0px), abort with "{N} hardcoded values detected. Replace with tokens: {list}."
- **Test coverage below threshold:** If `npm test --coverage` shows coverage <80%, abort with "Test coverage {actual}% below required 80%. Add tests for: {uncovered paths}."

## Success Criteria

- [ ] Component compiles without TypeScript errors
- [ ] All styling uses tokens (zero hardcoded values)
- [ ] Props fully typed with TSDoc comments
- [ ] All variants and sizes implemented
- [ ] Disabled state handled correctly
- [ ] WCAG AA accessibility standards met
- [ ] Unit tests pass with >80% coverage
- [ ] Component documented with examples
- [ ] Storybook stories work (if enabled)

## Anti-Patterns

- **"Div soup"** — Using `<div>` for everything instead of semantic HTML. A clickable element MUST be `<button>`, a navigation link MUST be `<a>`. Never add `role="button"` to a `<div>` when `<button>` exists
- **"Hardcoded magic numbers"** — Writing `padding: 16px` instead of `padding: var(--spacing-4)`. Zero hardcoded values means ZERO — including border-radius, font-size, line-height, and box-shadow values
- **"any-driven development"** — Using TypeScript `any` to make the compiler happy. Every prop must have a specific type. Use discriminated unions for variants: `type ButtonVariant = 'primary' | 'secondary' | 'destructive'`
- **"Testing the framework, not the component"** — Writing tests like "renders without crashing" that test React, not your component. Test: variants render correct classes, disabled prevents onClick, keyboard events fire handlers
- **"Accessibility as afterthought"** — Adding ARIA after the component is "done". Build accessible from step 1: semantic HTML first, then ARIA only where HTML semantics are insufficient

## Error Handling

- **Token not found**: Report which token is missing, suggest alternatives
- **Component exists**: Ask to overwrite or use different name
- **TypeScript errors**: Display errors, suggest fixes
- **Test failures**: Show failing tests, don't complete until fixed
- **Accessibility violations**: Warn and suggest improvements

## Security Considerations

- Sanitize component name (prevent injection)
- Validate token references
- Escape user content in examples
- No eval() or dynamic code execution

## Examples

### Example 1: Build Button Component

```bash
*build button
```

Output:
```
🏗️ Merovingian: Building Button component...

📋 Configuration:
  - Type: Atom
  - Variants: primary, secondary, destructive
  - Sizes: sm, md, lg
  - Tests: Yes (>80% coverage)
  - Storybook: Yes

✓ Generated Button.tsx (142 lines)
✓ Generated Button.module.css (89 lines, 0 hardcoded values)
✓ Generated Button.test.tsx (18 tests)
✓ Generated Button.stories.tsx (6 stories)
✓ Generated Button.md (documentation)

🧪 Running tests...
  ✓ renders with default props
  ✓ renders all variants correctly
  ✓ renders all sizes correctly
  ✓ handles disabled state
  ✓ calls onClick handler
  ... 13 more tests
  Coverage: 94.2%

♿ Accessibility check:
  ✓ ARIA attributes present
  ✓ Color contrast: 4.8:1 (WCAG AA ✓)
  ✓ Keyboard navigable
  ✓ Focus indicators visible

✅ Button component ready!

Import: import { Button } from '@/design-system';
Usage: <Button variant="primary">Click me</Button>

Merovingian says: "Built right. Built once."
```

### Example 2: Build Input Component

```bash
*build input
```

Output includes additional features:
- Validation states (error, success)
- Helper text prop
- Label integration
- Icon slots

## Notes

- All components strictly typed with TypeScript
- Zero hardcoded values enforced (tokens only)
- Accessibility is non-negotiable (WCAG AA minimum)
- Test coverage >80% required
- CSS Modules scope styles automatically
- Variants and sizes are extensible
- Components are tree-shakeable
- Storybook stories enable visual testing
- Documentation auto-generated from types
- Components follow Atomic Design principles
- Merovingian ensures quality at every step


## Related Checklists

- `squads/design/checklists/ds-component-quality-checklist.md`
- `squads/design/checklists/ds-pattern-audit-checklist.md`

## Process Guards
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.
