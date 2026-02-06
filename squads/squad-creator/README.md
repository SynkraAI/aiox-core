# Squad Creator

## Overview

The Squad Creator is a meta-squad that automates the creation of new AIOS-FULLSTACK squads. It provides specialized agents, interactive tasks, and comprehensive templates to transform any domain expertise into a structured AIOS squad.

## Purpose

This squad democratizes the creation of AIOS squads by:

- Providing interactive workflows for gathering squad requirements
- Automating the generation of all necessary components (agents, tasks, templates)
- Ensuring consistency and quality across all created squads
- Validating squads against AIOS standards
- Generating comprehensive documentation automatically

## When to Use This Pack

Use the Squad Architect when you want to:

- Create a new domain-specific squad (e.g., Legal, Healthcare, Education)
- Transform specialized knowledge into AI-accessible formats
- Build custom agent teams for specific industries or workflows
- Extend AIOS-FULLSTACK capabilities to new domains

## What's Included

### Agents

- `squad-architect.md` - Expert Squad Architect agent
- `sop-extractor.md` - SOP extraction and automation analysis agent

### Tasks

**Creation**
- `create-squad.md` - Complete squad creation workflow (854 lines)
- `create-agent.md` - Individual agent creation for squads (756 lines)
- `create-task.md` - Task creation for squad workflows
- `create-template.md` - Template creation for squad outputs
- `extract-sop.md` - Extract SOPs from meeting transcripts (AIOS-ready)

**Validation**
- `validate-squad.md` - Granular squad validation (795 lines, 9 phases)

### Templates

- `config-tmpl.yaml` - Squad configuration template
- `readme-tmpl.md` - Squad README template
- `agent-tmpl.md` - Agent definition template
- `task-tmpl.md` - Task workflow template
- `template-tmpl.yaml` - Output template template
- `pop-extractor-prompt.md` - SOP extraction template (SC-PE-001)

### Checklists

- `squad-checklist.md` - Comprehensive quality validation checklist
- `sop-validation.md` - SOP extraction validation checklist (SC-CK-001)

### Config

- `squad-config.yaml` - Squad configuration with data sources

### Data

- `squad-kb.md` - Knowledge base for squad best practices

## Installation

To install this squad, run:

```bash
npm run install:squad squad-architect
```

Or manually:

```bash
node tools/install-squad.js squad-architect
```

---

## SOP Extractor System

The SOP Extractor transforms meeting transcripts into structured, automation-ready Standard Operating Procedures (SOPs).

### Purpose

Extract SOPs from recorded meetings where someone explained a business process, producing:
1. Complete SOP following SC-PE-001 pattern (11 parts)
2. Automation analysis using PV_PM_001 heuristic
3. AIOS Squad blueprint ready for immediate creation
4. Gap report with clarifying questions

### Data Sources

Configure transcript sources in `config/squad-config.yaml`:

| Source | Type | Description |
|--------|------|-------------|
| `supabase` | database | Query `transcripts` table (default) |
| `local_file` | file | Read from `inputs/transcripts/` |
| `api` | http | Fetch from external API |
| `direct` | inline | Pass transcript as parameter |

To change source:
```yaml
# config/squad-config.yaml
data_sources:
  transcripts:
    active_source: supabase  # ← change here
```

### SOP Extraction Workflow

```bash
# Activate the SOP extractor agent
@sop-extractor

# Run extraction (main workflow)
*extract-sop

# The agent will:
# 1. Fetch transcript from configured source
# 2. Extract process structure (steps, roles, tools)
# 3. Map each step to Task Anatomy (HO-TP-001)
# 4. Classify cognitive types (what's automatable vs human-only)
# 5. Apply PV_PM_001 automation analysis
# 6. Generate Squad blueprint
# 7. Document gaps and clarifying questions
```

### Key Features

| Feature | Description |
|---------|-------------|
| **Cognitive Taxonomy** | Classifies each step: Perception, Analysis, Judgment, Empathy, etc. |
| **Executor Types** | Assigns Human/Agent/Hybrid/Worker per step |
| **Automation Analysis** | Applies PV_PM_001 (frequency × impact × guardrails) |
| **META-AXIOMAS** | Scores process on 10 quality dimensions |
| **Squad Blueprint** | Generates agents, tasks, checkpoints, workflow YAML |

### Patterns Used

- **SC-PE-001** - SOP Extraction Standard (11 parts)
- **HO-TP-001** - Task Anatomy (8 required fields)
- **HO-EP-001-004** - Executor Types (Human/Agent/Hybrid/Worker)
- **PV_PM_001** - Automation Tipping Point heuristic
- **SC-CK-001** - SOP Validation Checklist

### Pipeline: Transcript → Squad

```
Meeting Recording
      ↓
  Transcript (Supabase/File/API)
      ↓
  @sop-extractor (*extract-sop)
      ↓
  SOP Document (SC-PE-001)
      ↓
  Validation (SC-CK-001)
      ↓
  @squad-architect (*create-squad)
      ↓
  Working Squad
```

📖 **Full Documentation:** See `docs/sop-extraction-process.md` for complete process details.

---

## Usage Examples

### 1. Create a Complete Squad

```bash
# Activate the squad architect agent
@squad-architect

# Start the interactive squad creation workflow
*create-squad

# Follow the guided elicitation process
# The agent will help you define:
# - Domain and purpose
# - Required agents and their personas
# - Tasks and workflows
# - Output templates
# - Documentation
```

### 2. Create Individual Components

```bash
# Create a standalone agent for an existing squad
*create-agent

# Create a task workflow
*create-task

# Create an output template
*create-template
```

### 3. Validate an Squad

```bash
# Run comprehensive validation
*validate-squad
```

## Created Squad Structure

The Squad Architect generates the following structure:

```
squads/your-squad-name/
├── agents/                          # Domain-specific agents
│   └── your-agent.md
├── checklists/                      # Validation checklists
│   └── your-checklist.md
├── config.yaml                      # Pack configuration
├── data/                           # Knowledge bases
│   └── your-kb.md
├── README.md                       # Pack documentation
├── tasks/                          # Workflow tasks
│   └── your-task.md
└── templates/                      # Output templates
    └── your-template.yaml
```

## Key Features

### Interactive Elicitation

- Structured questioning to gather domain requirements
- Flexible elicitation modes (incremental vs. rapid)
- Advanced refinement options for each component

### Template-Driven Generation

- Pre-built templates ensure consistency
- Customizable placeholders for domain-specific content
- Best practices embedded in every template

### Quality Validation

- Comprehensive checklist covering all quality dimensions
- Security validation for all generated code
- AIOS standards compliance checking

### Documentation Automation

- Auto-generated README files
- Usage examples and integration guides
- Best practices documentation

## Integration with Core AIOS

The Squad Architect integrates seamlessly with:

1. **AIOS Developer Agent** - Can use aios-developer for advanced component modifications
2. **Core Workflows** - Generated squads integrate with greenfield and brownfield workflows
3. **Memory Layer** - Tracks all created squads and components
4. **Installer** - Generated squads can be installed via standard installer

## Creating Your First Squad

1. **Define Your Domain**
   - What expertise are you capturing?
   - What problems will it solve?
   - Who is the target user?

2. **Identify Required Agents**
   - What roles/personas are needed?
   - What specialized knowledge does each have?
   - How do they collaborate?

3. **Design Workflows**
   - What are the common tasks?
   - What are the inputs and outputs?
   - What validations are needed?

4. **Create Templates**
   - What documents/artifacts are produced?
   - What structure should they follow?
   - What guidance is embedded?

5. **Let the Creator Guide You**
   - The squad architect will elicit all details
   - It will generate all components automatically
   - It will validate everything against standards

## Example Squads Created

This creator can generate squads for any domain:

**Professional Services**
- Legal Assistant Pack
- Accounting & Finance Pack
- Real Estate Pack
- Healthcare Practice Pack

**Creative & Content**
- Content Marketing Pack
- Video Production Pack
- Podcast Creation Pack
- Creative Writing Pack

**Education & Training**
- Curriculum Design Pack
- Corporate Training Pack
- Online Course Creation Pack

**Personal & Lifestyle**
- Personal Development Pack
- Fitness & Nutrition Pack
- Home Organization Pack
- Travel Planning Pack

## Best Practices

1. **Start Small** - Begin with one agent and a few tasks
2. **Test Thoroughly** - Validate with real-world scenarios
3. **Iterate** - Refine based on user feedback
4. **Document Well** - Clear documentation ensures adoption
5. **Share** - Contribute your squad to the community

## Customization

You can customize generated squads by:

1. Modifying the generated agent personas
2. Adding custom tasks for specific workflows
3. Creating domain-specific templates
4. Adding validation checklists for your industry
5. Extending with specialized knowledge bases

## Dependencies

This squad requires:

- Core AIOS-FULLSTACK framework
- AIOS Developer agent (optional, for advanced modifications)
- Basic understanding of your domain expertise

## Support & Community

- **Documentation**: See `docs/squads.md` for detailed guides
- **Examples**: Browse `squads/` for reference implementations
- **Issues**: Report problems via GitHub issues
- **Contributions**: Submit PRs with improvements

## Troubleshooting

### Common Issues

#### Agent Won't Activate

**Symptom:** `@squad-architect` doesn't respond or shows error

**Solutions:**
1. Verify the agent file exists: `ls squads/squad-creator/agents/squad-architect.md`
2. Check YAML syntax: Ensure the YAML block is properly formatted
3. Verify squad is synced: Check `.claude/commands/squad-creator/` exists

---

#### Research Loop Not Starting

**Symptom:** When requesting a squad, agent asks questions instead of researching

**Expected Behavior:** Agent should IMMEDIATELY start research when domain is mentioned.

**Solution:**
1. Say explicitly: "Start the mind-research-loop now"
2. Or restart: `*exit` then reactivate `@squad-architect`

---

#### Agent Quality Gate Fails (SC_AGT_001)

**Symptom:** Created agent fails quality validation

**Common Causes:**
| Issue | Fix |
|-------|-----|
| Lines < 300 | Expand voice_dna, add more output_examples |
| Missing voice_dna | Add vocabulary.always_use (8+) and never_use (5+) |
| output_examples < 3 | Add realistic input→output examples |
| Missing completion_criteria | Define criteria for each task type |
| Missing handoff_to | Define 3+ handoff scenarios |

**Reference:** `checklists/agent-quality-gate.md`

---

#### Task Files Not Found

**Symptom:** Agent can't find task file when executing command

**Solutions:**
1. Verify file exists: `ls squads/squad-creator/tasks/`
2. Check filename matches dependency reference in agent YAML
3. Ensure file extension is `.md`

---

#### SOP Extraction Incomplete

**Symptom:** Extracted SOP missing parts

**Solution:** Validate against SC-PE-001 (11 parts required):
1. Purpose
2. Scope
3. Preconditions
4. Steps
5. Decision Rules
6. Exceptions
7. Outputs
8. Validation
9. Escalation
10. Audit
11. Revision History

**Reference:** `checklists/sop-validation.md`

---

### Getting Help

1. Run `*help` to see available commands
2. Check `docs/` folder for detailed documentation
3. Review `checklists/` for validation criteria
4. Consult `data/squad-kb.md` for best practices

## Version History

- **v1.1.0** - Added granular validation system (`*validate-squad`, `*validate-agent`, etc.)
- **v1.0.0** - Initial release with complete squad creation workflow

See `CHANGELOG.md` for detailed version history.

## Notes

- Generated squads follow AIOS-FULLSTACK standards automatically
- All components include embedded validation and security checks
- The creator uses interactive elicitation to ensure quality
- Generated documentation includes usage examples and integration guides

---

**Ready to democratize your expertise? Let's create an squad! 🚀**

_Version: 1.1.1_
_Compatible with: AIOS-FULLSTACK v4+_
