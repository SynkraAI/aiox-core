# Story NOG-9: UAP & SYNAPSE Deep Research — Context Architecture Optimization

## Metadata

| Field | Value |
|-------|-------|
| **Story ID** | NOG-9 |
| **Epic** | NOGIC — Code Intelligence Integration |
| **Type** | Research / Investigation |
| **Status** | Ready |
| **Priority** | P0 |
| **Points** | 5 |
| **Agent** | @analyst (Alex) — primary + @architect (Aria) — support |
| **Quality Gate** | @pm (Morgan) |
| **Quality Gate Tools** | review-research-output, comparative-matrix-review |
| **Blocked By** | NOG-7 (Done) |
| **Branch** | `feat/epic-nogic-code-intelligence` |

---

## Story

As a **framework architect**, I want a comprehensive tech research of each component of the UnifiedActivationPipeline and SYNAPSE engine, benchmarked against real-world open-source projects (Claude Code internals, Codex CLI, Cursor, Gemini CLI, Antigravity, and similar AI-assisted dev tools), so that I can identify the optimal cost-benefit ratio between **loading time** (cost) and **context richness** (benefit) and create an incremental improvement roadmap that avoids over-engineering.

---

## Problem Statement

### Current Pain Points

1. **UAP Output Bloat**: O `enrichedContext` retorna ~20-25KB incluindo `_coreConfig` (15-20KB) que e despejado inteiro no output — causando latencia variavel entre terminais
2. **ProjectStatus Timeout**: O loader `projectStatus` frequentemente atinge timeout (44-77ms) resultando em `quality: "partial"` em vez de `full`
3. **SYNAPSE Bracket Calculation**: Formula `contextPercent = 100 - ((promptCount * avgTokensPerPrompt) / maxContext * 100)` usa estimativa fixa de 1500 tokens/prompt — impreciso
4. **Agent Memory Silos**: Cada agente perde contexto entre sessoes — nao ha memoria persistente de dominio do projeto
5. **IDE Divergence**: Cada IDE (Claude Code, Codex, Cursor, Gemini CLI, Antigravity) tem abordagem diferente para context injection — nao sabemos o que funciona melhor
6. **No Output Presets**: Nao existe taxonomia de output (compact/standard/full/debug) — o modelo decide ad-hoc como formatar

### Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| UAP p50 (warm) | ~260ms | <150ms |
| UAP p95 (cold) | ~400ms | <250ms |
| Output size (greeting-only) | 8 lines | 8 lines |
| Output size (full context) | ~800 lines | <50 lines |
| ProjectStatus timeout rate | ~60% | <10% |
| Quality "full" rate | ~40% | >85% |

---

## Research Taxonomy

### Category A: UAP Loaders (Cost = Loading Time)

Each loader is an independent research target. For each, we need to find:
- Similar implementations in open-source AI dev tools
- Best practices for the specific concern (config loading, git detection, session mgmt)
- Performance benchmarks and optimization patterns

#### A1: CoreConfig Loader (Tier 0)
| Aspect | Details |
|--------|---------|
| **What** | Loads `.aios-core/core-config.yaml` — framework-wide settings |
| **Current** | Full YAML parse on every activation (~15-20KB) |
| **Research Q** | How do Cursor/Codex/Gemini handle project config? Lazy loading? Schema validation? Partial reads? |
| **File** | `unified-activation-pipeline.js:430-439` (`_loadCoreConfig`) |
| **Search Terms** | `AI CLI project config loading`, `YAML config lazy loading`, `IDE workspace settings architecture` |

#### A2: AgentConfig Loader (Tier 1 — Critical)
| Aspect | Details |
|--------|---------|
| **What** | Loads agent YAML (persona, commands, dependencies) — greeting breaks without this |
| **Current** | 80ms budget, reads full agent file + resolves commands |
| **Research Q** | How do multi-agent frameworks load agent definitions? Precompiled configs? Binary formats? |
| **File** | `agent-config-loader.js` |
| **Search Terms** | `AI agent config loading`, `multi-agent persona management`, `agent definition precompile` |

#### A3: PermissionMode Loader (Tier 2)
| Aspect | Details |
|--------|---------|
| **What** | Detects permission mode (ask/auto/explore) + generates badge |
| **Current** | 120ms budget, reads settings files |
| **Research Q** | How do other AI CLIs handle permission tiers? Static config vs runtime detection? |
| **File** | `.aios-core/core/permissions/` |
| **Search Terms** | `AI CLI permission modes`, `Claude Code permission architecture`, `LLM tool authorization` |

#### A4: GitConfig Detector (Tier 2)
| Aspect | Details |
|--------|---------|
| **What** | Detects git provider (github/gitlab), branch name, configured state |
| **Current** | 120ms budget, runs `git` commands |
| **Research Q** | How fast can git info be cached? What do Codex/Cursor do for git context? |
| **File** | `.aios-core/infrastructure/scripts/git-config-detector.js` |
| **Search Terms** | `git status caching CLI`, `IDE git integration performance`, `fast git branch detection` |

#### A5: Memory Loader (Tier 2.5 — Pro)
| Aspect | Details |
|--------|---------|
| **What** | Loads agent-specific memories from progressive retrieval system |
| **Current** | 500ms budget, Pro-only, feature-gated |
| **Research Q** | How do Cursor/Codex implement persistent memory? RAG vs file-based? Token budget strategies? |
| **File** | Pro module: `pro/memory/memory-loader.js` |
| **Search Terms** | `AI coding assistant memory`, `LLM persistent context`, `developer tool memory architecture` |

#### A6: SessionContext Loader (Tier 3)
| Aspect | Details |
|--------|---------|
| **What** | Previous agent, last commands, workflow state, current story |
| **Current** | 180ms budget, file-based session detection |
| **Research Q** | How do multi-session AI tools maintain state? Process-level vs file-level? |
| **File** | `.aios-core/core/session/context-loader.js` |
| **Search Terms** | `AI CLI session persistence`, `IDE session state management`, `multi-agent session context` |

#### A7: ProjectStatus Loader (Tier 3)
| Aspect | Details |
|--------|---------|
| **What** | Branch, modified files, recent commits, current epic/story |
| **Current** | 180ms budget, **frequently timeouts** (~60% partial quality) |
| **Research Q** | How do IDEs cache project status? Debouncing? File watchers? Git index parsing? |
| **File** | `.aios-core/infrastructure/scripts/project-status-loader.js` |
| **Search Terms** | `IDE project status caching`, `fast git status alternatives`, `project state detection performance` |

---

### Category B: UAP Sequential Steps (Cost = Processing Time)

#### B1: GreetingPreferenceManager (Step 6)
| Aspect | Details |
|--------|---------|
| **What** | Resolves greeting level (auto/minimal/named/archetypal) based on user profile |
| **Current** | Sync, fast |
| **Research Q** | How do other tools adapt verbosity to user expertise? Adaptive UX patterns? |
| **File** | `greeting-preference-manager.js` |
| **Search Terms** | `adaptive CLI greeting`, `user profile verbosity`, `developer tool onboarding levels` |

#### B2: ContextDetector (Step 7)
| Aspect | Details |
|--------|---------|
| **What** | Detects session type: new/existing/workflow |
| **Current** | Uses conversation history or file-based detection |
| **Research Q** | How do AI assistants detect conversation continuity? Hash-based? Time-based? |
| **File** | `.aios-core/core/session/context-detector.js` |
| **Search Terms** | `AI conversation continuity detection`, `session type inference`, `chat context detection` |

#### B3: WorkflowNavigator (Step 8)
| Aspect | Details |
|--------|---------|
| **What** | Detects active workflow and suggests next step |
| **Current** | Command history pattern matching |
| **Research Q** | How do AI dev tools suggest next actions? State machines? ML-based? |
| **File** | `workflow-navigator.js` |
| **Search Terms** | `AI workflow suggestion`, `developer workflow state machine`, `next action prediction CLI` |

---

### Category C: SYNAPSE Engine (Cost = Hook Latency per Prompt)

#### C1: 8-Layer Pipeline Architecture
| Aspect | Details |
|--------|---------|
| **What** | L0-L7 layered rule injection (Constitution > Global > Agent > Workflow > Task > Squad > Keyword > Star-Command) |
| **Current** | 100ms hard pipeline timeout, ~45ms average |
| **Research Q** | How do other context engines layer rules? Priority systems? Cursor rules? Codex instructions? |
| **Files** | `.aios-core/core/synapse/engine.js`, `layers/l0-l7` |
| **Search Terms** | `AI context injection architecture`, `layered rule systems LLM`, `Cursor rules system`, `Codex instructions architecture` |

#### C2: Context Bracket System
| Aspect | Details |
|--------|---------|
| **What** | FRESH/MODERATE/DEPLETED/CRITICAL brackets based on estimated context usage |
| **Current** | Fixed 1500 tokens/prompt estimate — inaccurate |
| **Research Q** | How do other tools track context window usage? Token counting strategies? Adaptive budgets? |
| **Files** | `.aios-core/core/synapse/context/context-tracker.js` |
| **Search Terms** | `LLM context window tracking`, `token counting strategies`, `adaptive context budget`, `Claude Code context management` |

#### C3: Domain & Manifest System
| Aspect | Details |
|--------|---------|
| **What** | KEY=VALUE manifest + domain files for rule storage |
| **Current** | Custom format, parsed per-prompt |
| **Research Q** | Standard formats for rule/config systems? TOML? JSON Schema? How do Cursor .cursorrules work internally? |
| **Files** | `.aios-core/core/synapse/domain/domain-loader.js`, `.synapse/manifest` |
| **Search Terms** | `AI IDE rule system format`, `.cursorrules architecture`, `Codex AGENTS.md format`, `dotfile config standards` |

#### C4: Session Bridge (SYN-2)
| Aspect | Details |
|--------|---------|
| **What** | File-based session state at `.synapse/sessions/{uuid}.json` |
| **Current** | JSON file per session, 24h stale cleanup |
| **Research Q** | How do other AI CLIs persist session state? SQLite? In-memory? Process IPC? |
| **Files** | `.aios-core/core/synapse/session/session-manager.js` |
| **Search Terms** | `AI CLI session persistence`, `Claude Code session management`, `developer tool state persistence` |

#### C5: Memory Bridge (SYN-10)
| Aspect | Details |
|--------|---------|
| **What** | Feature-gated memory hints injected at DEPLETED+ brackets |
| **Current** | 15ms timeout, Pro-only, retrieves from MIS |
| **Research Q** | How do Cursor/Copilot/Codex implement long-term memory? What's the state of the art? |
| **Files** | `.aios-core/core/synapse/memory/memory-bridge.js` |
| **Search Terms** | `AI coding assistant long-term memory`, `LLM memory systems 2025 2026`, `persistent developer context` |

#### C6: Output Formatter & Token Budget
| Aspect | Details |
|--------|---------|
| **What** | Assembles `<synapse-rules>` XML, truncates by token budget per bracket |
| **Current** | FRESH=800, MODERATE=1500, DEPLETED=2000, CRITICAL=2500 tokens |
| **Research Q** | Optimal system prompt sizes? How do other tools balance instruction tokens vs user context? |
| **Files** | `.aios-core/core/synapse/output/formatter.js` |
| **Search Terms** | `LLM system prompt optimization`, `AI context injection token budget`, `system instructions size impact` |

---

### Category D: Cross-IDE Context Architecture

#### D1: Claude Code Native Architecture
| Aspect | Details |
|--------|---------|
| **What** | How Claude Code itself handles context: CLAUDE.md, rules/, hooks, settings |
| **Research Q** | What's the internal architecture? How does it merge CLAUDE.md + rules + hooks? Priority system? |
| **Search Terms** | `Claude Code architecture internals`, `CLAUDE.md processing`, `Claude Code hooks system 2026` |

#### D2: Cursor Rules System
| Aspect | Details |
|--------|---------|
| **What** | `.cursorrules`, `.cursor/rules/`, project-level instructions |
| **Research Q** | How does Cursor process rules? Layering? Token limits? Performance? |
| **Search Terms** | `Cursor rules system architecture`, `.cursorrules best practices 2026`, `Cursor context injection` |

#### D3: Codex CLI (OpenAI)
| Aspect | Details |
|--------|---------|
| **What** | `AGENTS.md`, instructions, sandboxed execution |
| **Research Q** | How does Codex handle agent instructions? Context management? Memory? |
| **Search Terms** | `OpenAI Codex CLI architecture`, `AGENTS.md format`, `Codex CLI context management 2026` |

#### D4: Gemini CLI
| Aspect | Details |
|--------|---------|
| **What** | `.gemini/rules/`, project instructions |
| **Research Q** | How does Gemini CLI inject context? Rule system? Performance? |
| **Search Terms** | `Gemini CLI rules system`, `Google Gemini CLI context injection`, `Gemini CLI architecture 2026` |

#### D5: Antigravity
| Aspect | Details |
|--------|---------|
| **What** | `.antigravity/rules/`, cursor-style format |
| **Research Q** | Architecture differences from Cursor? Rule processing? |
| **Search Terms** | `Antigravity IDE rules`, `Antigravity AI coding assistant`, `Antigravity context system` |

---

## Acceptance Criteria

### AC1: Research Completeness
- [ ] Cada um dos 21 research targets (A1-A7, B1-B3, C1-C6, D1-D5) tem um `/tech-search` executado
- [ ] Resultados salvos em `docs/research/2026-02-21-uap-synapse-research/`
- [ ] Cada resultado contem: projetos encontrados, code examples, patterns identificados, relevancia para AIOS

### AC2: Comparative Analysis
- [ ] Matriz comparativa: AIOS vs Claude Code vs Cursor vs Codex vs Gemini CLI para cada concern
- [ ] Identificacao de gaps (onde AIOS esta atras) e advantages (onde AIOS esta a frente)
- [ ] Documentacao de patterns que podemos REUSE (IDS principle) de projetos open-source

### AC3: Output Taxonomy
- [ ] Definicao formal de output presets para UAP:
  - `compact`: greeting + quality + duration (~8 lines)
  - `standard`: greeting + quality + duration + metrics (~20 lines)
  - `full`: greeting + context (sem _coreConfig) + metrics (~50 lines)
  - `debug`: tudo incluindo _coreConfig + loader details (~200+ lines)
- [ ] Benchmark de cada preset (tempo de serializacao, tamanho em bytes)

### AC4: Optimization Roadmap
- [ ] Lista priorizada de melhorias incrementais com custo-beneficio estimado
- [ ] Cada melhoria referencia o research que a fundamenta (Article IV — No Invention)
- [ ] Melhorias classificadas: Quick Win (<1h), Medium (1-3h), Strategic (1+ stories)

### AC5: Code Intelligence Integration
- [ ] Research results consumiveis pelo sistema `tests/code-intel/` existente
- [ ] Identificacao de novos helpers potenciais (ex: `synapse-helper.js`, `activation-helper.js`)
- [ ] Mapeamento de como code-intel pode otimizar cada loader do UAP

---

## Scope

### IN Scope
- Research e analise comparativa de cada componente UAP e SYNAPSE
- Benchmarking de alternativas encontradas
- Criacao de output taxonomy com presets
- Roadmap de melhorias incrementais
- Documentacao em `docs/research/`

### OUT of Scope
- Implementacao de melhorias (serao stories separadas derivadas do roadmap)
- Mudancas em codigo de producao
- Criacao de novos helpers (apenas identificacao)
- Migracao para outras arquiteturas

---

## Research Execution Plan

### Wave 1: UAP Loaders (7 searches)
| Search | Target | Priority |
|--------|--------|----------|
| `/tech-search` A1 | CoreConfig loading patterns | HIGH |
| `/tech-search` A2 | Agent config architecture | HIGH |
| `/tech-search` A4 | Git detection performance | HIGH |
| `/tech-search` A7 | Project status caching | CRITICAL (biggest pain point) |
| `/tech-search` A3 | Permission mode patterns | MEDIUM |
| `/tech-search` A5 | AI memory architecture | HIGH |
| `/tech-search` A6 | Session persistence | MEDIUM |

### Wave 2: UAP Steps (3 searches)
| Search | Target | Priority |
|--------|--------|----------|
| `/tech-search` B1 | Adaptive greeting/verbosity | LOW |
| `/tech-search` B2 | Session continuity detection | MEDIUM |
| `/tech-search` B3 | Workflow suggestion systems | MEDIUM |

### Wave 3: SYNAPSE Core (6 searches)
| Search | Target | Priority |
|--------|--------|----------|
| `/tech-search` C1 | Layered rule injection | CRITICAL |
| `/tech-search` C2 | Context window tracking | HIGH |
| `/tech-search` C3 | Rule/manifest formats | HIGH |
| `/tech-search` C4 | Session state persistence | MEDIUM |
| `/tech-search` C5 | Long-term memory systems | HIGH |
| `/tech-search` C6 | Token budget optimization | HIGH |

### Wave 4: Cross-IDE (5 searches)
| Search | Target | Priority |
|--------|--------|----------|
| `/tech-search` D1 | Claude Code internals | CRITICAL |
| `/tech-search` D2 | Cursor rules architecture | HIGH |
| `/tech-search` D3 | Codex CLI architecture | HIGH |
| `/tech-search` D4 | Gemini CLI architecture | MEDIUM |
| `/tech-search` D5 | Antigravity architecture | LOW |

**Total: 21 `/tech-search` executions across 4 waves**

---

## Dependencies

| Dependency | Type | Status |
|-----------|------|--------|
| NOG-1 (Infrastructure) | Code | Done |
| NOG-7 (DevOps Impact) | Code | Done |
| `/tech-search` skill | Tool | Available |
| `tests/code-intel/` | Test Suite | 156+ tests passing |
| `.synapse/` | System | Active |
| UAP pipeline | System | Active (~260ms p50) |

---

## Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Research overload (21 searches) | HIGH | MEDIUM | Execute in waves, prioritize CRITICAL first |
| Irrelevant results for niche topics | MEDIUM | LOW | Refine search terms iteratively |
| Over-engineering from too many patterns | HIGH | HIGH | Apply IDS REUSE > ADAPT > CREATE strictly |
| Claude Code internals not public | HIGH | MEDIUM | Focus on observable behavior + community docs |
| Results obsolete quickly (fast-moving space) | MEDIUM | LOW | Date-stamp all findings, review quarterly |

---

## Tasks/Subtasks

- [x] 1. Criar diretorio `docs/research/2026-02-21-uap-synapse-research/`
- [x] 2. **Wave 1**: Executar 7 `/tech-search` para UAP Loaders (A1-A7)
  - [x] 2.1 A7: Project status caching (CRITICAL)
  - [x] 2.2 A1: CoreConfig loading patterns
  - [x] 2.3 A2: Agent config architecture
  - [x] 2.4 A4: Git detection performance
  - [x] 2.5 A5: AI memory architecture
  - [x] 2.6 A3: Permission mode patterns
  - [x] 2.7 A6: Session persistence
- [x] 3. **Wave 2**: Executar 3 `/tech-search` para UAP Steps (B1-B3)
  - [x] 3.1 B2: Session continuity detection
  - [x] 3.2 B3: Workflow suggestion systems
  - [x] 3.3 B1: Adaptive greeting/verbosity
- [x] 4. **Wave 3**: Executar 6 `/tech-search` para SYNAPSE Core (C1-C6)
  - [x] 4.1 C1: Layered rule injection (CRITICAL)
  - [x] 4.2 C2: Context window tracking
  - [x] 4.3 C3: Rule/manifest formats
  - [x] 4.4 C5: Long-term memory systems
  - [x] 4.5 C6: Token budget optimization
  - [x] 4.6 C4: Session state persistence
- [x] 5. **Wave 4**: Executar 5 `/tech-search` para Cross-IDE (D1-D5)
  - [x] 5.1 D1: Claude Code internals (CRITICAL)
  - [x] 5.2 D2: Cursor rules architecture
  - [x] 5.3 D3: Codex CLI architecture
  - [x] 5.4 D4: Gemini CLI architecture
  - [x] 5.5 D5: Antigravity architecture
- [x] 6. Compilar matriz comparativa (AIOS vs competitors)
- [x] 7. Definir output taxonomy com benchmarks
- [x] 8. Criar roadmap de melhorias incrementais priorizado
- [x] 9. Identificar novos helpers para code-intel
- [x] 10. Review final e consolidacao em `RESEARCH-SUMMARY.md`

---

## Dev Notes

### Research Output Structure
```
docs/research/2026-02-21-uap-synapse-research/
├── RESEARCH-SUMMARY.md           # Executive summary + roadmap
├── comparative-matrix.md          # AIOS vs competitors grid
├── output-taxonomy.md             # UAP output presets definition
├── wave-1-uap-loaders/
│   ├── A1-coreconfig-loading.md
│   ├── A2-agent-config.md
│   ├── A3-permission-modes.md
│   ├── A4-git-detection.md
│   ├── A5-memory-architecture.md
│   ├── A6-session-persistence.md
│   └── A7-project-status-caching.md
├── wave-2-uap-steps/
│   ├── B1-adaptive-greeting.md
│   ├── B2-session-continuity.md
│   └── B3-workflow-suggestion.md
├── wave-3-synapse-core/
│   ├── C1-layered-rule-injection.md
│   ├── C2-context-window-tracking.md
│   ├── C3-rule-manifest-formats.md
│   ├── C4-session-state.md
│   ├── C5-long-term-memory.md
│   └── C6-token-budget.md
└── wave-4-cross-ide/
    ├── D1-claude-code-internals.md
    ├── D2-cursor-rules.md
    ├── D3-codex-cli.md
    ├── D4-gemini-cli.md
    └── D5-antigravity.md
```

### Key Principle: No Invention (Article IV)
Toda melhoria proposta no roadmap DEVE referenciar evidence do research.
Nenhuma feature pode ser inventada sem fundamentacao em projetos existentes ou best practices documentadas.

### IDS Decision Hierarchy
Para cada melhoria identificada: REUSE > ADAPT > CREATE
- **REUSE**: Podemos usar diretamente um pattern encontrado?
- **ADAPT**: Podemos adaptar com <30% de mudanca?
- **CREATE**: Justificativa obrigatoria com `evaluated_patterns` e `rejection_reasons`

---

## Testing

### Validation Criteria
- Cada `/tech-search` retorna resultados acionaveis (nao apenas links)
- Matriz comparativa cobre pelo menos 4 dos 5 competitors
- Roadmap tem pelo menos 5 Quick Wins identificados
- Output taxonomy testada com benchmark real (node script)

---

---

## CodeRabbit Integration

> **N/A — Research story.** No production code changes. No PR expected from this story.
> Manual review by @pm applies. CodeRabbit scan not applicable.

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-21 | @architect (Aria) + @po (Pax) | Story created — Draft |
| 2026-02-21 | @po (Pax) | Validation: GO. Applied 4 fixes (AC1 count, executor assignment, CodeRabbit section). Status → Ready |
