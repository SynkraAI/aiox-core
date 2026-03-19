# Extend Existing Pattern

> Task ID: atlas-extend-pattern
> Agent: Merovingian (Design System Builder)
> Version: 1.1.0
> v4.0-compatible: true
> **Execution Type:** `Agent`
> **Dependencies:** depends_on: `[ds-build-component]` · enables: `[]` · workflow: `greenfield`

## Description

Add new variant, size, or feature to existing component without breaking compatibility. Maintains consistency with design system patterns.

## Input Schema
- **requires:** Output from `ds-build-component`
- **format:** TypeScript source (existing component)
- **location:** `outputs/design-system/{project}/components/{Component}/`

## Prerequisites

- Component exists
- Design system setup complete
- Tokens available for new variant

## Workflow

### Steps

1. **Load Existing Component** - Read component file and structure
2. **Validate Extension Request** - Check compatibility with existing API
3. **Add New Variant/Size** - Extend props and implementation
4. **Update Styles** - Add new variant styles using tokens
5. **Update Tests** - Add tests for new variant
6. **Update Stories** - Add story for new variant
7. **Update Documentation** - Document new variant
8. **Validate Backward Compatibility** - Ensure existing usage still works

## Output

- Updated component file
- Updated styles
- Updated tests
- Updated documentation

## Failure Handling

- **Component not found:** If target component file does not exist at expected path, abort with "Component {ComponentName} not found at {path}. Verify component name and run *build first if component does not exist."
- **Breaking API change detected:** If new variant requires changing existing prop types (e.g., string to union), abort with "Proposed change breaks backward compatibility: {change}. Add new prop instead of modifying existing."
- **Token missing for new variant:** If new variant requires design token that does not exist in tokens file, abort with "Token {tokenName} not found for {variantName} variant. Add token to tokens.yaml before extending component."
- **Existing variant tests failing:** If adding new variant causes existing tests to fail, abort with "{N} existing tests failing after extension: {list}. Fix regressions before proceeding—new variant must not break existing functionality."

## Success Criteria

- [ ] New variant implemented correctly
- [ ] Backward compatible (existing code works)
- [ ] Tests updated and passing
- [ ] Documentation reflects changes
- [ ] No breaking changes

## Example

```bash
*extend button --variant warning

Merovingian: "Adding 'warning' variant to Button..."
✓ Updated Button.tsx (new variant prop)
✓ Updated Button.module.css (warning styles)
✓ Updated Button.test.tsx (warning tests)
✓ Updated Button.stories.tsx (warning story)
✓ Backward compatibility: ✓

Warning variant uses:
  - color: var(--color-warning)
  - color (hover): var(--color-warning-dark)
```

## Notes

- Maintain prop interface compatibility
- Add, don't replace
- Test existing variants still work
- Document migration if API changes


## Related Checklists

- `squads/design/checklists/ds-component-quality-checklist.md`
- `squads/design/checklists/ds-pattern-audit-checklist.md`

## Process Guards
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.
