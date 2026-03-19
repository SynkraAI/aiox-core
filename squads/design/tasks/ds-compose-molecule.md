# Compose Molecule from Atoms

> Task ID: atlas-compose-molecule
> Agent: Merovingian (Design System Builder)
> Version: 1.1.0
> v4.0-compatible: true
> **Execution Type:** `Agent`
> **Dependencies:** depends_on: `[ds-build-component]` · enables: `[]` · workflow: `greenfield`

## Description

Build molecule component by composing existing atoms following Atomic Design methodology. Examples: FormField (Label + Input), Card (Heading + Text + Button), SearchBar (Input + Button).

## Input Schema
- **requires:** Output from `ds-build-component`
- **format:** TypeScript source (atom components)
- **location:** `outputs/design-system/{project}/components/{Atom}/`

## Prerequisites

- Setup completed
- Atom components exist (dependencies)
- Tokens loaded

## Workflow

### Steps

1. **Validate Atom Dependencies** - Check required atoms exist
2. **Generate Molecule Component** - Compose atoms with molecule logic
3. **Generate Molecule Styles** - Molecule-specific layout and spacing
4. **Generate Tests** - Test molecule composition and interactions
5. **Generate Stories** - Show molecule with different atom combinations
6. **Generate Documentation** - Document composed structure
7. **Update Index** - Export molecule
8. **Update State** - Track molecule built

## Output

- Molecule component (TypeScript)
- Molecule styles (CSS Modules)
- Tests (>80% coverage)
- Stories (optional)
- Documentation

## Failure Handling

- **Missing atom dependency:** If required atom component file does not exist in design-system directory, abort with "Atom {AtomName} not found. Run *build {AtomName} first to generate required dependency."
- **Atom API incompatibility:** If atom props interface does not accept required props for molecule composition, abort with "{AtomName} API incompatible: missing props {list}. Extend atom or use different atom."
- **Molecule reimplements atom logic:** If molecule code duplicates atom styling or behavior (e.g., duplicate button styles), warn user "Molecule should compose atoms, not reimplement. Remove duplicate logic and use {AtomName} props instead."
- **Atom interaction tests missing:** If test suite does not include tests for interactions between composed atoms (e.g., Label clicking focuses Input), abort with "Tests incomplete: add tests for atom interactions ({missing scenarios})."

## Success Criteria

- [ ] All atom dependencies imported correctly
- [ ] Molecule composes atoms (not reimplements)
- [ ] Molecule-specific logic isolated
- [ ] Tests cover atom interactions
- [ ] Accessible (WCAG AA)

## Example

```typescript
// FormField.tsx (molecule)
import { Label } from '../atoms/Label';
import { Input, InputProps } from '../atoms/Input';
import { HelperText } from '../atoms/HelperText';

export interface FormFieldProps extends InputProps {
  label: string;
  helperText?: string;
  error?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  helperText,
  error,
  ...inputProps
}) => {
  return (
    <div className={styles.formField}>
      <Label htmlFor={inputProps.id}>{label}</Label>
      <Input {...inputProps} error={!!error} />
      {error && <HelperText variant="error">{error}</HelperText>}
      {!error && helperText && <HelperText>{helperText}</HelperText>}
    </div>
  );
};
```

## Notes

- Molecules compose atoms, don't reimplement
- Molecule adds composition logic only
- Atoms remain independent and reusable
- Test atom interactions in molecule context


## Related Checklists

- `squads/design/checklists/ds-component-quality-checklist.md`
- `squads/design/checklists/ds-pattern-audit-checklist.md`

## Process Guards
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.
