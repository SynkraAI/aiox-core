# PRD Generator

Generates professional Product Requirements Documents from app ideas.

## Usage

```bash
/gerar-prd              # Interactive mode
/gerar-prd --complete   # Detailed mode with market analysis
```

## Implementation

1. Collect information via structured questions (8 quick / 14 complete)
2. Analyze and expand the idea
3. Generate 20-section PRD (executive summary, personas, requirements, architecture, risks, timeline)
4. Validate and return formatted Markdown

Entry point: `generator.js` | Template: `templates/prd-template.md`

See `README.md` for full documentation, examples, and PRD structure.
