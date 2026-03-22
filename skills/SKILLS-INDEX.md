# AIOS Skills Index

## Visao Geral

O AIOS tem 3 camadas distintas. NAO confundir:

```
AIOS Capabilities
├── agents/        (11) — Personas completas (ativadas com @agent)
├── skills/         (4) — Skills runtime (carregadas automaticamente em skills/)
└── slash commands/ (74) — Knowledge packs (ativados com /AIOS:skills:nome)
```

**Importante:** Slash commands sao arquivos markdown com expertise — NAO sao skills runtime.
Skills runtime carregam automaticamente. Slash commands precisam ser invocados explicitamente.

---

## Layer 1: AIOS Agents (11)

**Tipo:** Personas completas | **Ativacao:** `@agent` ou `/AIOS:agents:agent`

| Agent | Persona | Use Para |
|-------|---------|----------|
| `@dev` | Dex | Implementacao, debugging, refactoring |
| `@qa` | Quinn | Testes, validacao, quality gates |
| `@architect` | Aria | Design de sistemas, decisoes tecnicas |
| `@data-engineer` | Dara | Database design, schema, migrations |
| `@po` | Pax | Stories, backlog, acceptance criteria |
| `@pm` | Morgan | Planning, sprints, recursos |
| `@sm` | River | Agile ceremonies, processo |
| `@analyst` | Alex | Requirements, research, analise |
| `@ux-design-expert` | Uma | UX/UI design, usabilidade |
| `@devops` | Gage | Git, CI/CD, releases (EXCLUSIVO) |
| `@aios-master` | — | Orchestration, framework development |

---

## Layer 2: Runtime Skills (24)

**Tipo:** Skills carregadas automaticamente | **Local:** `skills/`

**Skills principais:**
| Skill | Descricao |
|-------|-----------|
| `tokenizacao/` | Auditoria frontend completa - Tailwind, Design Tokens (W3C), shadcn/ui, a11y (WCAG 2.2), performance |
| `superpowers/` | 8 sub-skills (TDD, brainstorming, code review, plans, etc.) |
| `design-system-extractor/` | Extracao de design tokens de websites |
| `criar-app-completo/` | Workflow completo de criacao de app |
| `prd-generator/` | Geracao de PRDs profissionais |
| `dashboard-generator/` | Geracao de dashboards |
| `app-builder/` | Builder de aplicacoes |
| `obsidian-app-filler/` | Preenchimento de apps Obsidian |
| `obsidian-tag-manager/` | Gerenciamento de tags Obsidian |
| `deep-search/` | Deep research pipeline para qualquer dominio (people, travel, market, products, technical, general) |

**Outras:** angular, angular-state-management, avalonia-viewmodels-zafiro, cloud-penetration-testing, code-refactoring-refactor-clean, decision-tree-generator, deep-search, game-development, godot-gdscript-patterns, mcp-builder, nextjs-react-expert, skill-creator, superpowers, synapse, system-prompt-architect, tech-search, unreal-engine-cpp-pro, vulnerability-scanner

Estas skills sao distribuidas via `aios install` e funcionam automaticamente.

---

## Layer 3: Slash Commands (31+)

**Tipo:** Knowledge packs on-demand | **Local:** `.claude/commands/AIOS/skills/`
**Ativacao:** `/comando` no Claude Code (ex: `/doc-rot`, `/typescript-pro`)

Estes sao arquivos markdown com expertise especializada. Carregados sob demanda.

**Recém migradas (31 skills):**
- **Programming Languages** — cpp-pro, elixir-pro, haskell-pro, julia-pro, python-pro, typescript-pro
- **Security** — burp-suite-testing, ethical-hacking-methodology, linux-privilege-escalation, security-auditor, top-web-vulnerabilities
- **Development Tools** — browser-extension-builder, mcp-builder, nestjs-expert, n8n-mcp-tools-expert, nx-workspace-patterns, salesforce-development
- **Workflows** — concise-planning, enhance-workflow, kaizen, progress-visualizer
- **Code Quality** — doc-rot
- **Blockchain & Business** — blockchain-developer, defi-protocol-templates, notion-template-business
- **AI & Agents** — agent-orchestration-improve-agent, multi-agent-patterns, prompt-engineering
- **Other** — automate-whatsapp, documentation-templates, inngest, minecraft-bukkit-pro
- **Languages** — typescript-pro, python-pro, cpp-pro, elixir-pro, haskell-pro, julia-pro
- **Frontend** — angular, angular-state-management, nextjs-react-expert, tailwind-patterns, tailwind-design-system, radix-ui-design-system, scroll-experience, frontend-design, web-design-guidelines, mobile-design
- **3D/Games** — 3d-web-experience, game-development (11 sub-skills), godot-gdscript-patterns, unreal-engine-cpp-pro, minecraft-bukkit-pro
- **Blockchain** — blockchain-developer, defi-protocol-templates
- **Tools** — automate-whatsapp, notion-template-business, inngest, n8n-mcp-tools-expert, nestjs-expert, browser-extension-builder, mcp-builder
- **Business** — pricing-strategy, competitive-landscape, market-sizing-analysis, content-creator, copywriting
- **AI/Agents** — agent-orchestration-improve-agent, prompt-engineering, multi-agent-patterns
- **Design** — obsidian-app-filler, obsidian-tag-manager, video-media-content-downloader, progress-visualizer
- **Dev Patterns** — api-design-principles, database-design, documentation-templates, architect-first, app-builder (13 templates), avalonia-viewmodels-zafiro, nx-workspace-patterns, salesforce-development
- **Media** — video-downloader

**Referencia completa:** `.claude/commands/AIOS/skills/HIERARCHY.md`

---

## Quick Reference

| Preciso de... | Use... | Tipo |
|---------------|--------|------|
| Gestao de projeto | `@po`, `@pm`, `@sm` | Agent |
| Implementar codigo | `@dev` | Agent |
| Auditar frontend (Tailwind/Tokens/a11y) | `@architect /tokenizacao` | Runtime Skill |
| Planning formal | `/AIOS:skills:concise-planning` | Slash Command |
| Debug complexo | `/AIOS:skills:systematic-debugging` | Slash Command |
| Security audit | `/AIOS:skills:ethical-hacking-methodology` | Slash Command |
| Limpar doc rot | `/doc-rot` | Slash Command |
| Criar app completo | `skills/criar-app-completo/` | Runtime Skill |
| Gerar PRD | `skills/prd-generator/` | Runtime Skill |
| Code review | `/AIOS:skills:kaizen` | Slash Command |

---

*AIOS Skills System v2.0*
*Last Updated: 2026-02-13*
