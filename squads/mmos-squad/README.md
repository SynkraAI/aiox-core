# MMOS Squad - Mind Mapper OS

> Cognitive Architecture Cloning System - Creates high-fidelity digital clones of thought leaders using DNA Mental 8-layer analysis methodology.

## Overview

The MMOS Squad provides a complete pipeline for creating AI cognitive clones with 94% fidelity. It uses the DNA Mental 8-layer methodology to map and replicate the thinking patterns, frameworks, and communication styles of exceptional minds.

## Installation

### Prerequisites

- Node.js 18+
- Python 3.9+
- AIOS 2.1 Framework

### Setup

```bash
# Install Node.js dependencies (from project root)
npm install

# Install Python dependencies
pip install -r squads/mmos-squad/requirements.txt

# Optional: Install Gemini API for LLM integration
pip install google-generativeai

# Optional: Install Supabase for database persistence
pip install supabase
```

## Agents (10)

| Agent | Icon | Purpose |
|-------|------|---------|
| **mind-mapper** | 🧠 | Core orchestrator, main entry point |
| **cognitive-analyst** | 🔬 | DNA Mental 8-layer analysis |
| **identity-analyst** | 💎 | Values, obsessions, paradoxes (Layers 6-8) |
| **charlie-synthesis-expert** | 🔬 | Framework synthesis, KB chunking |
| **research-specialist** | 📚 | Source discovery & collection |
| **system-prompt-architect** | ⚙️ | AI personality compiler |
| **mind-pm** | 🎯 | Pipeline project manager |
| **debate** | ⚔️ | Clone debate & fidelity testing |
| **emulator** | 🪞 | Mind clone activation |
| **data-importer** | 📥 | Content import to Supabase |

## Usage

### Activate an Agent

```bash
# In Claude Code
@mind-mapper *help

# Or use the slash prefix
/mmos:agents:mind-mapper
```

### Create a Cognitive Clone

```bash
@mind-mapper *map sam_altman
```

### Run a Debate

```bash
# Via Python wrapper
node squads/mmos-squad/scripts/python-wrapper.js debate sam_altman elon_musk "Should AI be open source?"

# Or via agent
@debate *debate sam_altman elon_musk "topic"
```

### Activate a Clone

```bash
@emulator *activate sam_altman
```

## Python Integration

The squad uses Python scripts for complex operations. A Node.js wrapper (`scripts/python-wrapper.js`) provides integration with Claude Code agents.

### Python Wrapper Commands

```bash
# List available minds
node scripts/python-wrapper.js list

# Get mind info
node scripts/python-wrapper.js info sam_altman

# Run debate
node scripts/python-wrapper.js debate sam_altman elon_musk "topic" --framework oxford --rounds 5

# Import sources
node scripts/python-wrapper.js import nassim_taleb --preview
```

## Directory Structure

```
squads/mmos-squad/
├── squad.yaml              # Squad manifest
├── package.json            # Node dependencies
├── requirements.txt        # Python dependencies
├── README.md               # This file
├── agents/                 # 10 MMOS agents (.md format)
├── lib/                    # Python libraries
│   ├── debate_engine.py    # Debate orchestration & fidelity scoring
│   ├── map_mind.py         # Mind mapping orchestration
│   ├── workflow_*.py       # Workflow detection & orchestration
│   └── ...
├── scripts/                # CLI scripts
│   ├── python-wrapper.js   # Node.js wrapper for Python
│   ├── emulator.py         # Clone activation CLI
│   └── import_sources_cli.py
└── config/
    └── debate-frameworks.yaml  # Debate framework definitions
```

## Workflow Pipeline

The MMOS pipeline consists of 6 phases:

1. **VIABILITY** - APEX scoring and GO/NO-GO decision
2. **RESEARCH** - Source collection and organization
3. **ANALYSIS** - DNA Mental 8-layer cognitive analysis
4. **SYNTHESIS** - Knowledge base compilation
5. **PROMPT** - System prompt generation
6. **TESTING** - Fidelity testing and validation

## DNA Mental 8 Layers

| Layer | Name | Description |
|-------|------|-------------|
| L1 | Core Essence | Fundamental identity markers |
| L2 | Signature Phrases | Characteristic vocabulary |
| L3 | Mental Models | Frameworks and heuristics |
| L4 | Communication Templates | Response patterns |
| L5 | Values Hierarchy | Core beliefs and priorities |
| L6 | Obsessions | Recurring themes and fixations |
| L7 | Singularity | Unique differentiators |
| L8 | Productive Paradoxes | Contradictions that define authenticity |

## Infrastructure Integrations

The squad integrates with AIOS infrastructure services:

| Service | Usage |
|---------|-------|
| **clickup** | Project tracking (mind-pm agent) |
| **file-service** | Document parsing (research-specialist) |
| **google-drive** | Source backup and storage |
| **tiktok** | Social content collection |

## Environment Variables

```bash
# Optional - for Gemini LLM integration
GOOGLE_API_KEY=your-gemini-api-key

# Optional - for Supabase persistence
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
```

## Related Stories

- **STORY-10.1**: MMOS Investigation & Architecture (Done)
- **STORY-10.2**: Agent Migration to Squad Format (Done)
- **STORY-10.3**: Task Migration (Pending)
- **STORY-10.4**: Template Migration (Pending)
- **STORY-10.5**: Checklist Migration (Pending)

## License

MIT - See LICENSE file for details.

## Author

oalanicolas (MMOS Original Author)
