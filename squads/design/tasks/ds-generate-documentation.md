# Generate Pattern Library Documentation

> Task ID: atlas-generate-documentation
> Agent: Merovingian (Design System Builder)
> Version: 1.1.0
> v4.0-compatible: true
> **Execution Type:** `Agent`
> **Dependencies:** depends_on: `[]` · enables: `[]` · workflow: `documentation`

## Description

Generate comprehensive pattern library documentation from built components. Creates searchable, navigable docs with usage examples, prop tables, accessibility notes, and live previews.

## Prerequisites

- At least 1 component built
- Design system setup complete
- Component .md files exist

## Workflow

### Steps

1. **Scan Built Components** - Find all atoms, molecules, organisms
2. **Parse Component Metadata** - Extract props, types, variants
3. **Generate Pattern Library Index** - Main navigation page
4. **Generate Component Pages** - Detailed pages per component
5. **Generate Usage Examples** - Code snippets and live previews
6. **Generate Accessibility Guide** - WCAG compliance notes
7. **Generate Token Reference** - Token usage documentation
8. **Create Search Index** - Searchable component library

## Output

- **index.md**: Pattern library homepage
- **components/{Component}.md**: Per-component pages
- **tokens.md**: Token reference guide
- **accessibility.md**: Accessibility guidelines
- **getting-started.md**: Setup and usage guide

## Failure Handling

- **No components found:** If scan finds zero component files in design-system directory, abort with "No components found. Run *build to create components before generating documentation."
- **Component metadata extraction failed:** If TypeScript parser fails to extract prop types from component file, abort with "Cannot parse {ComponentName}.tsx: {error}. Ensure valid TypeScript and exported interfaces."
- **Missing component documentation files:** If component exists but {ComponentName}.md does not exist or is empty, warn user "{N} components missing .md files. Generate basic docs or skip incomplete components?"
- **Broken usage examples:** If code snippets in generated documentation contain syntax errors or reference non-existent props, abort with "{N} documentation examples have errors: {list}. Fix component APIs or example code before publishing docs."

## Success Criteria

- [ ] All components documented
- [ ] Props documented with types
- [ ] Usage examples for each variant
- [ ] Accessibility notes included
- [ ] Searchable and navigable
- [ ] Up-to-date with latest components

## Example

```bash
*document
```

Output:
```
📚 Merovingian: Generating pattern library documentation...

Scanning components:
  ✓ 8 atoms found
  ✓ 5 molecules found
  ✓ 2 organisms found

Generating documentation:
  ✓ index.md (pattern library home)
  ✓ components/Button.md
  ✓ components/Input.md
  ✓ components/FormField.md
  ...
  ✓ tokens.md (token reference)
  ✓ accessibility.md (WCAG guide)
  ✓ getting-started.md

✅ Pattern library: design-system/docs/

Merovingian says: "Documentation is code. Keep it fresh."
```

## Notes

- Auto-generates from TypeScript types
- Updates when components change
- Includes live Storybook links (if enabled)
- Searchable by component name, prop, or token


## Related Checklists

- `squads/design/checklists/ds-component-quality-checklist.md`
- `squads/design/checklists/ds-pattern-audit-checklist.md`

## Process Guards
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.
