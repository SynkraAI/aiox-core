# Advisory Board Squad

Personal advisory board with 13 elite minds spanning strategy, execution, thinking, and vision. Each advisor is cloned from documented frameworks with high-fidelity DNA extraction.

## Quick Start

```bash
# Activate the board
@advisor-board

# Start a session
*session "Should I launch a new product or improve the existing one?"

# Convene a decision council
*council "Hire a CTO or outsource development?" --stakes high

# Run a strategic review
*review --period quarterly
```

## Advisors

### Strategy Tier
| Advisor | Framework | Fidelity | When to Consult |
|---------|-----------|----------|-----------------|
| Hamilton Helmer | 7 Powers | 9.0/10 | Competitive advantage, moats, strategy |
| Verne Harnish | Scaling Up | 8.5/10 | Scaling operations, people, cash |
| Clayton Christensen | Disruptive Innovation + JTBD | 8.9/10 | Innovation, market disruption, customer jobs |
| Elon Musk | The Algorithm + First Principles | 8.9/10 | Simplification, first principles, 10x thinking |

### Execution Tier
| Advisor | Framework | Fidelity | When to Consult |
|---------|-----------|----------|-----------------|
| Alex Hormozi | $100M Framework | 9.0/10 | Offers, pricing, growth, marketing |
| Keith Cunningham | Thinking Time | 9.0/10 | Capital allocation, avoiding mistakes |
| Chris Voss | Tactical Empathy | 8.7/10 | Negotiation, stakeholder management |

### Thinking Tier
| Advisor | Framework | Fidelity | When to Consult |
|---------|-----------|----------|-----------------|
| Annie Duke | Thinking in Bets | 8.5/10 | Decision making under uncertainty |
| Nassim Taleb | Antifragility | 8.9/10 | Risk, tail events, skin in the game |
| Shane Parrish | Mental Models | 8.9/10 | Clarity of thinking, second-order effects |
| Naval Ravikant | Leverage + Philosophy | 9.5/10 | Wealth creation, leverage, life philosophy |

### Vision Tier
| Advisor | Framework | Fidelity | When to Consult |
|---------|-----------|----------|-----------------|
| Steve Jobs | Simplicity + Product | 8.9/10 | Product vision, brand, simplicity |
| Walt Disney | Creative Strategy | 8.8/10 | Long-term vision, creativity, experience |

## How It Works

```
User Question
    |
    v
[board-chief] ── Diagnose domain + consult ENTP profile
    |
    v
[Route to 1-6 advisors] ── Each responds with their framework
    |
    v
[board-chief] ── Synthesize: consensus, divergence, recommendation
    |
    v
Action Items + ENTP calibration
```

## Commands

| Command | Description |
|---------|-------------|
| `*session` | Start an advisory session (any question) |
| `*council` | Decision council (multiple advisors debate) |
| `*review` | Strategic business review (all advisors) |
| `*challenge` | Devil's advocate on a decision |
| `*help` | Show available commands |

## Tasks

| Task | Purpose | Duration |
|------|---------|----------|
| `board-session` | Single question advisory | 15-30min |
| `decision-council` | Multi-advisor deliberation | 30-60min |
| `strategic-review` | Periodic business review | 45-90min |

## ENTP Calibration

The board-chief knows the user's ENTP cognitive profile and calibrates every session:
- Leverages Ne (multiple perspectives) and Ti (frameworks)
- Guards against Si blind spots (execution, follow-through)
- Prevents shiny object syndrome
- Forces action items over theoretical discussions

## Architecture

```
squads/advisor-board/
├── config.yaml                 # Squad configuration
├── README.md                   # This file
├── agents/
│   ├── board-chief.md          # Orchestrator (Tier 0)
│   ├── hamilton-helmer.md      # Strategy
│   ├── verne-harnish.md        # Strategy
│   ├── clayton-christensen.md  # Strategy
│   ├── elon-musk.md            # Strategy
│   ├── alex-hormozi.md         # Execution
│   ├── keith-cunningham.md     # Execution
│   ├── chris-voss.md           # Execution
│   ├── annie-duke.md           # Thinking
│   ├── nassim-taleb.md         # Thinking
│   ├── shane-parrish.md        # Thinking
│   ├── naval-ravikant.md       # Thinking
│   ├── steve-jobs.md           # Vision
│   └── walt-disney.md          # Vision
├── tasks/
│   ├── board-session.md        # Advisory session task
│   ├── decision-council.md     # Multi-advisor deliberation
│   └── strategic-review.md     # Periodic review
├── workflows/
│   └── advisory-session.yaml   # Full session workflow
└── data/
    └── luiz-fosc-profile.md    # User profile reference
```

## Mind DNA Sources

All advisor DNAs live in `outputs/minds/{slug}/` (local, .gitignore). Each mind has:
- `voice_dna.yaml` - How they communicate
- `thinking_dna.yaml` - How they decide
- `mind_dna_complete.yaml` - Consolidated DNA

Exceptions:
- Naval Ravikant: `squads/mind-cloning/minds/naval-ravikant/outputs/`
- Alex Hormozi: References existing `squads/hormozi/` squad

Total material processed: **2.6M words** from 21 books + existing DNA.
