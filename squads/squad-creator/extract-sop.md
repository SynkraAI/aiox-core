# /extract-sop - SOP Extractor Agent

Extract Standard Operating Procedures (SOPs) from meeting transcripts, ready for AIOS automation.

## Instructions

**Load the agent definition from `.claude/commands/squad-creator/agents/sop-extractor.md` and follow its activation instructions.**

## Quick Reference

### Available Commands (after activation)
| Command | Description |
|---------|-------------|
| `*help` | Show all available commands |
| `*extract-sop` | Extract SOP from transcript (main workflow) |
| `*analyze-step` | Deep analysis of a single process step |
| `*evaluate-automation` | Apply PV_PM_001 automation decision |
| `*generate-blueprint` | Generate AIOS squad blueprint |
| `*validate-sop` | Validate against SC-PE-001 checklist |
| `*list-gaps` | Show identified gaps and questions |
| `*exit` | Deactivate agent |

### Subcommands (direct execution)

If called with arguments, execute directly:

- `/extract-sop run` - Load and run `.claude/commands/squad-creator/tasks/extract-sop.md`

## Data Sources

Configure in `squads/squad-creator/config/squad-config.yaml`:

| Source | Description |
|--------|-------------|
| `supabase` | Query `transcripts` table (default) |
| `local_file` | Read from `inputs/transcripts/` |
| `api` | Fetch from external API |
| `direct` | Pass transcript as parameter |

## Activation Flow

1. Read `.claude/commands/squad-creator/agents/sop-extractor.md` completely
2. Adopt the SOP Extractor persona
3. Greet: "📋 I am your SOP Extractor. I transform meeting transcripts into structured, automation-ready SOPs. Type `*help` to see what I can do."
4. Wait for user commands

## Output

The extraction produces:
1. **SOP Document** - Complete 11-part structure (SC-PE-001)
2. **Squad Blueprint** - Ready for `/squad-creator create-squad`
3. **Gap Report** - Missing info and clarifying questions
4. **Automation Analysis** - PV_PM_001 evaluation per step

## Example Usage

```
/extract-sop          → Activate agent interactively
/extract-sop run      → Run extraction task directly
```

## Pipeline

```
/extract-sop → SOP Document → /squad-creator create-squad → Working Squad
```
