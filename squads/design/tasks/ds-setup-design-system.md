# Setup Design System Structure

> Task ID: atlas-setup-design-system
> Agent: Brad (Design System Architect)
> Version: 1.1.0
> v4.0-compatible: true
> **Execution Type:** `Hybrid`
> **Human Checkpoint:** Review and approve the directory structure, token configuration, and framework setup before component generation begins
> **Dependencies:** depends_on: `[]` · enables: `[ds-build-component]` · workflow: `greenfield`

## Description

Initialize design system structure for greenfield or brownfield projects. Loads tokens from Brad's .state.yaml or prompts for manual setup. Creates directory structure, validates tokens, prepares for component generation. **v4.0: Supports agentic-ready setup (machine-readable infrastructure for AI consumption) and W3C DTCG v1.0 token format by default.**

## Output Schema
- **produces:** `outputs/design-system/{project}/setup/`
- **format:** Directory structure with token config, framework scaffolding, and .state.yaml
- **consumed_by:** ds-build-component

## Prerequisites

- Node.js and npm installed (for React/TypeScript components)
- Either: Brad's .state.yaml with tokens OR manual token files
- Project has package.json (or Merovingian will create one)
- Reference: Read data/agentic-ds-principles.md for agentic-ready setup options
- Reference: Read data/w3c-dtcg-spec-reference.md for default token format
- Reference: Read data/fluent2-design-principles.md if targeting Microsoft Fluent 2 patterns

## Workflow

### Interactive Elicitation

This task uses interactive elicitation to configure setup.

1. **Detect Starting Point**
   - Check for Brad's .state.yaml (brownfield from audit)
   - If not found, ask for greenfield setup
   - Confirm which approach to use

2. **Load or Create Tokens**
   - Brownfield: Load tokens from Brad's state
   - Greenfield: Ask for tokens.yaml location or create template
   - Validate token schema

3. **Configure Project Structure**
   - Ask for component output directory (default: src/design-system)
   - CSS approach (CSS Modules, styled-components, Tailwind)
   - Test framework (Jest default)
   - Storybook (yes/no)

### Steps

1. **Detect Brad's State**
   - Search for .state.yaml in outputs/design-system/
   - If found, validate tokenization phase completed
   - If not found, prepare greenfield setup
   - Check: starting_point is "brownfield" (state file found) or "greenfield" (no state) — log "Starting point: {type}"

2. **Load Token Data**
   - Brownfield: Read token locations from .state.yaml
   - Greenfield: Prompt for tokens.yaml location
   - Parse and validate token schema
   - Check for required token categories (color, spacing, typography)
   - Check: token file parses without errors AND contains color + spacing + typography categories — abort with "Invalid tokens: {parse error or missing category}"

3. **Create Directory Structure**
   - Create design-system/ root directory
   - Create subdirectories: atoms/, molecules/, organisms/, templates/
   - Create tokens/ directory for token files
   - Create docs/ for pattern library documentation
   - Create __tests__/ for test files
   - Check: `test -d atoms/` AND `test -d molecules/` AND `test -d organisms/` AND `test -d tokens/` — abort with "Directory creation failed: {missing dir}"

4. **Copy Token Files**
   - Copy tokens.yaml to design-system/tokens/
   - Copy token exports (JSON, CSS, Tailwind, SCSS)
   - Generate index files for easy imports
   - Check: `test -f design-system/tokens/tokens.yaml` AND index files exist — abort with "Token copy failed: {missing file}"

5. **Initialize Package Dependencies**
   - Check for React and TypeScript in package.json
   - Add missing dependencies (if needed)
   - Add testing library dependencies
   - Add Storybook dependencies (if requested)
   - Check: `npm ls` exits with 0 for required packages (react, typescript, testing-library) — abort with "Missing dependencies: {list}"

6. **Create Configuration Files**
   - Generate tsconfig.json for design system (if needed)
   - Create jest.config.js for tests
   - Create .storybook/ config (if Storybook enabled)
   - Create design-system.config.yaml for Merovingian settings
   - Check: config files parse without errors (tsconfig.json, jest.config.js, design-system.config.yaml) — abort with "Invalid config: {file}: {error}"

7. **Generate Token Index**
   - Create tokens/index.ts for centralized token imports
   - Export all token categories
   - Add TypeScript types for tokens
   - Check: `test -f tokens/index.ts` AND TypeScript compiles index without errors — abort with "Token index generation failed"

8. **Create Base Styles**
   - Generate global.css with token CSS variables
   - Create reset/normalize styles
   - Add base typography styles using tokens
   - Check: global.css contains `var(--` references AND zero hardcoded color/spacing values — log "Base styles: {N} token references, 0 hardcoded values"

9. **Initialize State Tracking**
   - Create or update .state.yaml for Merovingian
   - Record setup configuration
   - Set phase to "setup_complete"
   - Check: `test -f .state.yaml` AND contains `phase: "setup_complete"` — abort with "State file creation failed"

10. **Generate Setup Report**
    - Create setup-summary.md
    - List all created files and directories
    - Document next steps (build components)
    - Check: `test -f setup-summary.md` AND file size > 0 — abort with "Setup documentation generation failed"

## Output

- **design-system/** directory structure
- **tokens/** with all token files and index
- **docs/** for documentation
- **global.css** with base styles
- **setup-summary.md** with configuration details
- **.state.yaml** updated with Merovingian setup data

### Output Format

```yaml
# .state.yaml Merovingian setup section
atlas_setup:
  completed_at: "2025-10-27T15:00:00Z"
  starting_point: "brownfield"  # or "greenfield"

  configuration:
    component_directory: "src/design-system"
    css_approach: "css_modules"
    test_framework: "jest"
    storybook_enabled: true

  tokens_loaded:
    source: "Brad tokenization"
    categories:
      - color (12 tokens)
      - spacing (7 tokens)
      - typography (10 tokens)
      - radius (4 tokens)
      - shadow (3 tokens)
    total_tokens: 36
    validation: "passed"

  directory_structure:
    - design-system/atoms/
    - design-system/molecules/
    - design-system/organisms/
    - design-system/templates/
    - design-system/tokens/
    - design-system/docs/
    - design-system/__tests__/

  dependencies_added:
    - "@testing-library/react"
    - "@testing-library/jest-dom"
    - "@storybook/react"

  phase: "setup_complete"
  ready_for: "component_building"
```

## Failure Handling

- **Token validation fails due to missing required categories:** Create placeholder tokens for missing categories (color/spacing/typography), flag for manual completion, proceed with partial setup
- **npm install fails due to version conflicts:** Document conflicting dependencies, provide lockfile diff, suggest resolution strategies (peer dependency overrides, version bumps), allow manual resolution before proceeding
- **Target directory already exists with conflicting structure:** Prompt user to archive existing directory, merge intelligently (preserve custom files, replace standard scaffolding), or abort with comparison report
- **TypeScript compilation errors in generated token index:** Fall back to JavaScript token exports, generate .d.ts manually from schema, log type generation failure for follow-up fix

## Success Criteria

- [ ] Directory structure follows Atomic Design principles
- [ ] Tokens loaded and validated successfully
- [ ] All token exports accessible (JSON, CSS, etc)
- [ ] Package dependencies installed
- [ ] Configuration files valid and working
- [ ] Base styles generated using tokens
- [ ] State tracking initialized
- [ ] Setup documented clearly

## Error Handling

- **No tokens found**: Offer to create token template or prompt for manual input
- **Invalid token schema**: Report specific errors, suggest fixes
- **Missing dependencies**: Auto-install with npm or prompt user
- **Directory exists**: Ask to overwrite or use different location
- **Invalid project structure**: Warn user, continue with compatible setup

## Security Considerations

- Validate token file paths (no directory traversal)
- Sanitize directory names
- Don't execute code during setup
- Validate package.json before modifying

## Examples

### Example 1: Brownfield Setup (From Brad)

```bash
*setup
```

Output:
```
🏗️ Merovingian: Setting up design system structure...

✓ Detected Brad's state: outputs/design-system/my-app/.state.yaml
✓ Loading tokens from Brad's tokenization...
  - 12 color tokens
  - 7 spacing tokens
  - 10 typography tokens
  - Total: 36 tokens validated

📁 Creating directory structure...
  ✓ src/design-system/
  ✓ src/design-system/atoms/
  ✓ src/design-system/molecules/
  ✓ src/design-system/organisms/
  ✓ src/design-system/tokens/

📦 Installing dependencies...
  ✓ @testing-library/react
  ✓ @testing-library/jest-dom
  ✓ @storybook/react (optional)

⚙️ Generating configuration...
  ✓ tokens/index.ts (centralized exports)
  ✓ global.css (base styles)
  ✓ jest.config.js
  ✓ .storybook/main.js

✅ Setup complete!

Next steps:
  1. Build components: *build button
  2. Generate docs: *document
  3. See component list: *help

Merovingian says: "Foundation is solid. Ready to build."
```

### Example 2: Greenfield Setup

```bash
*setup
```

Output:
```
🏗️ Merovingian: No Brad state found. Starting greenfield setup...

? Token source:
  1. I have tokens.yaml
  2. Create token template
  3. Manual input

User selects 1

? Path to tokens.yaml: ./tokens/tokens.yaml

✓ Tokens loaded and validated (24 tokens)

? Component directory: src/design-system
? CSS approach: CSS Modules
? Enable Storybook? Yes

[...setup continues...]
```

## Notes

- Brownfield setup is faster (tokens from Brad)
- Greenfield requires manual token creation or import
- Atomic Design structure (atoms → molecules → organisms → templates)
- All styling must use tokens (enforced in component generation)
- Storybook is optional but recommended for component showcase
- Merovingian automatically creates TypeScript types for tokens
- Base styles include CSS reset and token variables
- Setup can be re-run safely (asks before overwriting)
- Next step after setup: *build {pattern} to generate components


## Related Checklists

- `squads/design/checklists/ds-component-quality-checklist.md`
- `squads/design/checklists/ds-pattern-audit-checklist.md`

## Process Guards
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.
