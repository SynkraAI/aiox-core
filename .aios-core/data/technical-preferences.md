# User-Defined Preferred Patterns and Preferences

## Tech Presets

AIOS provides pre-defined architecture presets for common technology stacks.
Location: `.aios-core/data/tech-presets/`

### Available Presets

| Preset         | Technologies                                                   | Best For                                         |
| -------------- | -------------------------------------------------------------- | ------------------------------------------------ |
| `nextjs-react` | Next.js 14+, React, TypeScript, Tailwind, Zustand, React Query | Fullstack web apps, SaaS, E-commerce, Dashboards |

### How to Use Presets

1. **During Architecture Creation:**
   - When using `@architect *create-doc architecture`, the template will prompt for preset selection
   - Load the preset file to get detailed patterns, standards, and templates

2. **During Development:**
   - Reference the preset when asking `@dev` to implement features
   - Example: "Follow the nextjs-react preset patterns for this service"

3. **Creating New Presets:**
   - Copy `_template.md` and fill in technology-specific details
   - Add to the table above when complete

### Preset Contents

Each preset includes:

- **Design Patterns:** Recommended patterns with examples
- **Project Structure:** Folder organization
- **Tech Stack:** Libraries and versions
- **Coding Standards:** Naming conventions, critical rules
- **Testing Strategy:** What to test, coverage goals
- **File Templates:** Ready-to-use code templates

## Active Preset

> **Current:** `nextjs-react` (Next.js 16+, React, TypeScript, Tailwind, Zustand)

The active preset is automatically loaded when @dev is activated. To change:

```yaml
# .aios-core/core-config.yaml
techPreset:
  active: nextjs-react # Change to another preset name
```

---

## User Preferences

> Add your personal/team preferences below. These will be used by agents during development.

### Preferred Technologies

<!-- Uncomment and fill in your preferences
| Category | Preference | Notes |
|----------|------------|-------|
| Frontend Framework | Next.js | Using App Router |
| Styling | Tailwind CSS | With shadcn/ui |
| State Management | Zustand | For global state |
| Database | PostgreSQL | Via Supabase |
| ORM | Prisma | Type-safe queries |
-->

### Coding Style Preferences

<!-- Uncomment and fill in your preferences
- Prefer functional components over class components
- Use named exports over default exports
- Prefer explicit error handling over try/catch wrapping
-->

### Project-Specific Rules

<!-- Add any project-specific rules that agents should follow -->

---

_Updated: 2025-01-27_
