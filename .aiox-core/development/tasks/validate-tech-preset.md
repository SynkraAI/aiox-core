---
task: Validate Tech Preset
responsável: @architect
responsável_type: agent
atomic_layer: task
Entrada: |
  - preset_path: Path to the tech preset file (default: .aiox-core/data/tech-presets/)
  - name: Preset name without extension (e.g., "nextjs-react")
  - strict: If true, warnings become errors (default: false)
  - fix: If true, create story for fixes (default: false)
Saída: |
  - validation_result: Object with { valid, errors, warnings, suggestions }
  - report: Formatted report for display
  - story_path: Path to created story (if --fix and errors found)
Checklist:
  - [ ] Resolve preset path
  - [ ] Parse and validate metadata YAML block
  - [ ] Validate required sections
  - [ ] Check content quality
  - [ ] Format result for output
  - [ ] Create fix story if requested
---

# \*validate-tech-preset

Validates a tech preset file against required structure and metadata fields.

## Usage

```
@architect
*validate-tech-preset nextjs-react
*validate-tech-preset nextjs-react --strict
*validate-tech-preset nextjs-react --fix
*validate-tech-preset --all
```

## Parameters

| Parameter     | Type   | Default | Description                             |
| ------------- | ------ | ------- | --------------------------------------- |
| `preset_path` | string | -       | Full path to preset file                |
| `name`        | string | -       | Preset name (resolves to tech-presets/) |
| `--strict`    | flag   | false   | Treat warnings as errors                |
| `--fix`       | flag   | false   | Create story to fix found issues        |
| `--all`       | flag   | false   | Validate all presets in directory       |

## Validation Checks

### 1. Metadata Validation

Checks the YAML metadata block for required fields:

```yaml
preset:
  id: string          # Required - kebab-case identifier
  name: string        # Required - display name
  version: string     # Required - semver format (X.Y.Z)
  description: string # Required - when to use
  technologies: []    # Required - list of technologies
  suitable_for: []    # Required - project types
  not_suitable_for: []# Warning if missing
```

### 2. Required Sections Validation

| Section                | Required | Description                  |
| ---------------------- | -------- | ---------------------------- |
| Design Patterns        | Yes      | Must have at least 1 pattern |
| Project Structure      | Yes      | Must have folder structure   |
| Tech Stack             | Yes      | Must have technology table   |
| Coding Standards       | Yes      | Must have naming conventions |
| Testing Strategy       | Yes      | Must have test approach      |
| File Templates         | No       | Warning if missing           |
| Error Handling         | No       | Warning if missing           |
| Performance Guidelines | No       | Warning if missing           |

### 3. Content Quality Checks

- **Design Patterns**: Must have Purpose, Scores, Code Example
- **Tech Stack**: Table must have Category, Technology, Version, Purpose
- **Coding Standards**: Must have Good/Bad examples

## Flow

````
1. Resolve preset path
   ├── If full path provided → use directly
   ├── If name provided → resolve via .aiox-core/data/tech-presets/{name}.md
   └── If --all → scan all .md files except _template.md

2. Parse preset file
   ├── Extract YAML metadata block (between ```yaml and ```)
   ├── Parse markdown sections (## headers)
   └── Build validation context

3. Execute validations
   ├── validateMetadata() → Required fields check
   ├── validateSections() → Required sections check
   └── validateContent() → Content quality check

4. Format and display result
   ├── Show errors (if any)
   ├── Show warnings (if any)
   └── Show final result (VALID/INVALID)

5. If --fix and errors found
   ├── Prompt user to confirm story creation
   ├── Generate story with fix tasks
   └── Save to docs/stories/
````

## Output Example

```
Validating tech preset: nextjs-react.md

Metadata:
  ✓ id: nextjs-react
  ✓ name: Next.js + React Preset
  ✓ version: 1.0.0
  ✓ technologies: [next, react, typescript]
  ✓ suitable_for: defined
  ⚠ not_suitable_for: missing

Sections:
  ✓ Design Patterns (3 patterns)
  ✓ Project Structure
  ✓ Tech Stack
  ✓ Coding Standards
  ✓ Testing Strategy
  ⚠ Error Handling: missing
  ⚠ Performance Guidelines: missing

Errors: 0
Warnings: 3

Result: VALID (with warnings)
```

## Error Codes

| Code                   | Severity | Description                            |
| ---------------------- | -------- | -------------------------------------- |
| `PRESET_NOT_FOUND`     | Error    | Preset file not found                  |
| `METADATA_MISSING`     | Error    | No YAML metadata block found           |
| `METADATA_PARSE_ERROR` | Error    | YAML parse error                       |
| `FIELD_MISSING`        | Error    | Required metadata field missing        |
| `FIELD_INVALID`        | Error    | Field value invalid (e.g., bad semver) |
| `SECTION_MISSING`      | Error    | Required section not found             |
| `PATTERN_INCOMPLETE`   | Error    | Design pattern missing required fields |
| `NOT_SUITABLE_MISSING` | Warning  | not_suitable_for not defined           |
| `SECTION_RECOMMENDED`  | Warning  | Recommended section missing            |
| `EXAMPLE_MISSING`      | Warning  | Good/Bad example missing               |

## Fix Story Generation

When `--fix` is used and issues are found:

```markdown
# Story: Fix Tech Preset - {name}

## Status: Draft

## Objective

Fix validation issues in tech preset {name}.md

## Acceptance Criteria

{generated from errors/warnings}

## Tasks

- [ ] {task per error}

## Related

- Preset: .aiox-core/data/tech-presets/{name}.md
```

## Related

- **Agent:** @architect (Aria)
- **Location:** .aiox-core/data/tech-presets/
- **Similar:** validate-squad (validation pattern reference)
