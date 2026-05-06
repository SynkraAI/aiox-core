# Source Tree - LPage Genesis Squad

```
squads/lpage-genesis/
├── squad.yaml                    # Squad manifest (AIOS 4.0+)
├── README.md                     # Documentation & quick start
│
├── config/
│   ├── tech-stack.md             # Technology choices
│   ├── coding-standards.md       # Code conventions & rules
│   └── source-tree.md            # This file
│
├── agents/                       # 8 Agent definitions
│   ├── genesis-director.md       # Tier 0: Orchestration
│   ├── design-architect.md       # Tier 1: Foundation
│   ├── visual-crafter.md         # Tier 1: Foundation
│   ├── page-assembler.md         # Tier 2: Production
│   ├── template-engineer.md      # Tier 2: Production
│   ├── animation-designer.md     # Tier 2: Production
│   ├── visual-reviewer.md        # Tier 3: Quality
│   └── deploy-pilot.md           # Tier 4: Delivery
│
├── tasks/                        # 15 Task definitions (task-first!)
│   ├── setup-design-system.md        # Foundation
│   ├── create-design-tokens.md       # Foundation
│   ├── build-component.md            # Foundation
│   ├── generate-visual-concept.md    # Foundation
│   ├── create-lp-template.md         # Production
│   ├── assemble-landing-page.md      # Production (MAIN)
│   ├── assemble-quick-lp.md          # Production (FAST)
│   ├── create-animation-set.md       # Production
│   ├── create-responsive-styles.md   # Production
│   ├── visual-qa-review.md           # Quality
│   ├── audit-design-consistency.md   # Quality
│   ├── performance-audit.md          # Quality
│   ├── deploy-to-netlify.md          # Delivery
│   ├── configure-mcp-servers.md      # Delivery
│   └── extract-design-reference.md   # Foundation
│
├── workflows/                    # 5 Workflows
│   ├── design-genesis-full.yaml      # Complete pipeline (15-25 min)
│   ├── quick-lp.yaml                 # Fast track (5-10 min)
│   ├── design-system-setup.yaml      # One-time setup (4-6 hours)
│   ├── template-creation.yaml        # New template (30-60 min)
│   └── visual-qa-loop.yaml           # QA feedback loop (5-15 min)
│
├── checklists/                   # 6 Quality checklists
│   ├── design-quality.md             # Visual design standards
│   ├── performance-standards.md      # Lighthouse & CWV targets
│   ├── accessibility-wcag.md         # WCAG AA compliance
│   ├── responsive-mobile.md          # Mobile-first validation
│   ├── seo-technical.md              # Technical SEO checks
│   └── deploy-readiness.md           # Pre-deploy validation
│
├── templates/                    # 5 LP template blueprints
│   ├── lp-sales-long.md              # High-value sales (15+ sections)
│   ├── lp-webinar.md                 # Event/webinar registration
│   ├── lp-lead-magnet.md             # Lead capture (ebook/checklist)
│   ├── lp-mini-sales.md              # Low-ticket product
│   └── lp-waitlist.md                # Coming soon / waiting list
│
├── data/                         # Static data & references
│   └── .gitkeep
│
├── scripts/                      # Utility scripts
│   └── .gitkeep
│
└── tools/                        # Custom tools
    └── .gitkeep
```

## Agent Tier Architecture

```
Tier 0 - Orchestration
  └── @genesis-director (receives briefs, coordinates all)

Tier 1 - Foundation
  ├── @design-architect (design system, tokens, components)
  └── @visual-crafter (visual concepts, references, moodboards)

Tier 2 - Production
  ├── @page-assembler (core builder, assembles LPs)
  ├── @template-engineer (template factory, reusable structures)
  └── @animation-designer (Framer Motion, micro-interactions)

Tier 3 - Quality
  └── @visual-reviewer (Playwright screenshots, design evaluation)

Tier 4 - Delivery
  └── @deploy-pilot (Netlify MCP deploy, Lighthouse audit)
```

## Integration Map

```
[Marketing Growth Squad] → brief → @genesis-director
[Copy Squad] → copy → @page-assembler
[AIOS UX Expert Uma] → methodology → @design-architect
[Playwright MCP] ↔ @visual-reviewer (screenshots)
[Netlify MCP] ↔ @deploy-pilot (deploy)
[Google Stitch] → concepts → @visual-crafter
[Nano Banana Pro] → images → @visual-crafter
[Lighthouse CLI] → scores → @deploy-pilot
```
