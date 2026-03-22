# Obsidian App Filler

Fills Obsidian app notes automatically based on a PRD.

## Usage

```bash
/preencher-app
```

Provide the path to the `.md` file. The skill reads the PRD section, analyzes it, and fills all remaining sections (metadata, description, stack, requirements, architecture, roadmap).

## Implementation

1. Read file and validate template structure
2. Extract PRD from demarcated section
3. Analyze PRD for metadata (priority, complexity, stack)
4. Generate content for each section
5. Save updated file preserving original PRD

Entry point: `skill.js`

See `README.md` for full documentation.
