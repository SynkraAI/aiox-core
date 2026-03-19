# Design Squad - Coding Standards

## Design Token Naming

### Token Hierarchy
```
{category}.{property}.{variant}.{state}
```

### Examples
```css
/* Colors */
--color-primary-500
--color-neutral-100
--color-semantic-error

/* Typography */
--font-family-sans
--font-size-lg
--font-weight-bold
--line-height-tight

/* Spacing */
--spacing-4
--spacing-8
--spacing-16

/* Borders */
--border-radius-sm
--border-width-default

/* Shadows */
--shadow-sm
--shadow-lg
```

### Naming Rules
1. **Use kebab-case** for all token names
2. **Prefix with category** (color, font, spacing, etc.)
3. **Use semantic names** when possible (primary, error, success)
4. **Use numeric scales** for gradients (100-900 for colors, 1-12 for spacing)
5. **Avoid magic numbers** - always reference tokens

## Component Naming

### File Structure
```
ComponentName/
├── ComponentName.tsx      # Main component
├── ComponentName.test.tsx # Tests
├── ComponentName.stories.tsx # Storybook
├── index.ts              # Public exports
└── styles.css            # Scoped styles (if needed)
```

### Naming Convention
```typescript
// PascalCase for components
export function Button() {}
export function CardHeader() {}

// camelCase for hooks
export function useTheme() {}
export function useDesignTokens() {}

// camelCase for utilities
export function formatColor() {}
export function calculateContrast() {}
```

## CSS Standards

### Tailwind Classes Order
```html
<!-- Order: Layout → Sizing → Spacing → Typography → Visual → Interactive -->
<div class="
  flex flex-col           /* Layout */
  w-full h-auto           /* Sizing */
  p-4 mt-2                /* Spacing */
  text-sm font-medium     /* Typography */
  bg-white border rounded /* Visual */
  hover:bg-gray-50        /* Interactive */
">
```

### Custom CSS Rules
```css
/* Use CSS custom properties for tokens */
.component {
  color: var(--color-text-primary);
  padding: var(--spacing-4);
  border-radius: var(--border-radius-md);
}

/* Avoid magic numbers */
/* ❌ Bad */
.component { padding: 16px; }

/* ✅ Good */
.component { padding: var(--spacing-4); }
```

## Accessibility Standards

### WCAG 2.1 AA Compliance
```yaml
required:
  - Color contrast ratio: 4.5:1 (normal text), 3:1 (large text)
  - Focus indicators: visible on all interactive elements
  - Alt text: all images must have descriptive alt
  - Keyboard navigation: all functionality accessible via keyboard
  - ARIA labels: interactive elements without visible text
```

### Code Requirements
```tsx
// ✅ Good - accessible button
<button
  aria-label="Close dialog"
  onClick={onClose}
  className="focus:ring-2 focus:ring-primary-500"
>
  <CloseIcon aria-hidden="true" />
</button>

// ❌ Bad - inaccessible
<div onClick={onClose}>
  <CloseIcon />
</div>
```

## Component API Standards

### Props Interface
```typescript
interface ButtonProps {
  /** Button visual variant */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Button content */
  children: React.ReactNode;
}
```

### Default Props
```typescript
const defaultProps: Partial<ButtonProps> = {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
};
```

## Documentation Standards

### Component Documentation
```tsx
/**
 * Button component for user interactions.
 *
 * @example
 * ```tsx
 * <Button variant="primary" onClick={handleClick}>
 *   Click me
 * </Button>
 * ```
 *
 * @see {@link https://design.example.com/components/button}
 */
export function Button(props: ButtonProps) {}
```

### Storybook Stories
```tsx
export default {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};
```

## Icon Standards

### Icon Naming
```
{category}-{name}[-{variant}]
```

### Examples
```
icon-arrow-right
icon-arrow-left
icon-check
icon-check-circle
icon-user
icon-user-plus
```

### Icon Component API
```typescript
interface IconProps {
  name: IconName;
  size?: 'sm' | 'md' | 'lg' | number;
  color?: string;
  className?: string;
  'aria-label'?: string;
  'aria-hidden'?: boolean;
}
```

## Image Standards

### Thumbnail Specifications
| Platform | Size | Aspect Ratio |
|----------|------|--------------|
| YouTube | 1280x720 | 16:9 |
| Instagram Feed | 1080x1080 | 1:1 |
| Instagram Story | 1080x1920 | 9:16 |
| Twitter | 1200x675 | 16:9 |

### Export Settings
```yaml
web:
  format: webp (with jpg fallback)
  quality: 80-90%
  max_width: 2400px

thumbnails:
  format: jpg
  quality: 90%
  exact_size: true

icons:
  format: svg
  optimized: true (SVGO)
```

## Git Commit Standards

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

### Types
```
feat:     New feature
fix:      Bug fix
docs:     Documentation
style:    Formatting, styling
refactor: Code refactoring
test:     Tests
chore:    Maintenance
```

### Examples
```
feat(tokens): add semantic color tokens
fix(button): correct focus ring color
docs(readme): update component API
style(card): adjust padding for mobile
```

---

*Design Squad Coding Standards v1.0*
*Last Updated: 2026-02-13*
