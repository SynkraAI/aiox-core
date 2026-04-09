# Forge Anatomy — O que faz um Forge ser um Forge

> Padrão extraído dos 3 forges existentes: `/forge`, `/content-forge`, `/design-system-forge`

---

## O Forge Contract (5 Traits Obrigatórios)

Todo forge DEVE ter estes 5 elementos. Um skill que não tem todos os 5 NÃO é um forge — é apenas um skill.

### Trait 1: SKILL.md com Identity Statement

O SKILL.md DEVE conter uma declaração explícita de que é um **orquestrador puro**.

Exemplos dos forges existentes:
- `/forge`: "You are the Forge Pipeline Runner. The user says what they want. You orchestrate all AIOS agents automatically to build it."
- `/content-forge`: "Ele NUNCA cria conteúdo diretamente — sempre delega para o squad/skill que faz aquilo de melhor."
- `/design-system-forge`: "Ela não gera componentes — ela orquestra quem gera."

**Template:** "You are the {Domain} Forge. You orchestrate {domain description}. You NEVER {domain-specific prohibition} — you delegate to {executor types}."

### Trait 2: Intent Classifier

O forge DEVE classificar a intenção do usuário antes de agir. Sem classificação, não há routing.

| Forge | Mecanismo | Complexidade |
|-------|-----------|-------------|
| `/forge` | 13+ modos via prefixo/keyword/regex | Alta |
| `/content-forge` | 10 tipos via keyword matching | Média |
| `/design-system-forge` | Pipeline linear (sem classificação — um caminho só) | Baixa |

**Mínimo viável:** Uma tabela de keywords → intent, mesmo que tenha apenas 3 intents.

### Trait 3: Routing Mechanism

O forge DEVE saber PARA QUEM rotear cada intent. Duas opções:

**Opção A: capability-map.yaml (recomendado para Tier 1)**
```yaml
capabilities:
  analyze:
    description: "Análise de dados e diagnóstico"
    executor: "squads/insight"
    agent: "seo-chief"
    why: "Squad especializado em research e diagnóstico"
```

**Opção B: Tabela inline no SKILL.md (para forges simples)**
```markdown
| Intent | Executor | Agent |
|--------|----------|-------|
| analyze | squads/insight | seo-chief |
| create | squads/content-creator | — |
```

**Opção C: Routing programático (para forges complexos — Tier 2)**
- Lê capability-map.yaml + ecosystem scan + learnings
- Decide em runtime qual executor usar

### Trait 4: Discovery Questions

O forge DEVE perguntar antes de agir. Sem contexto, sem execução.

**Formato padrão (do skill-creator):**
```markdown
## Discovery Questions

1. **[Pergunta]** — (por que importa)
2. **[Pergunta]** — (por que importa)
3. **[Pergunta]** — (por que importa)
```

Mínimo: 3 perguntas. Máximo: 5. Sempre específicas ao domínio — NUNCA genéricas.

### Trait 5: "Never Implements" Clause

O forge DEVE ter uma declaração explícita de que NÃO implementa nada.

Isso é constitucional. Um forge que implementa diretamente é como um gerente que faz o trabalho do estagiário — pode até funcionar, mas perde a escalabilidade.

**Template:**
```markdown
**Constitutional Rule:** This forge NEVER {specific prohibition}. It classifies intent, routes to the right executor, and delegates. All execution is done by {executor types}.
```

---

## Anatomia Comparada

| Elemento | `/forge` | `/content-forge` | `/design-system-forge` |
|----------|----------|-------------------|----------------------|
| **Frontmatter** | name, description, version, category, tags, allowed-tools, argument-hint | name, description, version, category, tags | name, description, version, category, tags, delegates-to, quest-pack |
| **Identity** | "You are the Forge Pipeline Runner" | "Orquestrador Inteligente de Conteúdo" | "Pipeline orquestrador que transforma qualquer site" |
| **Intent Classifier** | 13 modos (prefix + keyword + smart detection) | 10 tipos (keyword matching) | 1 pipeline (linear, sem classificação) |
| **Routing** | Agent mapping table + ecosystem-scanner.md | capability-map.yaml + routing table | delegates-to no frontmatter + command-map.yaml |
| **Discovery** | Phase 0 com AskUserQuestion (formato numbered options) | Fase 1 (brand) + Fase 2 (classify) + Discovery Mode | Steps 1-3 (URL, nome, pasta) |
| **"Never Implements"** | "Forge NEVER implements directly" (Section 8) | "NUNCA cria conteúdo diretamente" | "Não gera componentes — orquestra quem gera" |
| **State** | Full (`forge-runs/state.json`) | Append log (`content-log.jsonl`) | Delega para quest-log |
| **Error Handling** | Full recovery tree (runner.md) | Executor validation + abort | Fallback mode (Premium vs Rápido) |
| **Plugins** | Sim (17 plugins YAML) | Não | Não |
| **Phases** | 6 phases (0-5) | 6 fases inline | 8 steps inline |

---

## Tiers de Complexidade

### Tier 1: Minimal Viable Forge (MVF)

Arquivos:
```
skills/{domain}-forge/
├── SKILL.md              # Intent classifier + routing + constitution
├── capability-map.yaml   # Domain → executor mapping
└── references/
    └── examples.md       # 2-3 exemplos de execução
```

Quando usar: domínio com squads/skills existentes, pipeline simples, poucos modos.

### Tier 2: Full-Featured Forge

Arquivos:
```
skills/{domain}-forge/
├── SKILL.md
├── capability-map.yaml
├── personality.md        # Banner, progress display, tom
├── config.yaml           # Parâmetros tunáveis
├── runner.md             # Engine de execução (state machine)
├── ecosystem-scanner.md  # Scan protocol específico do domínio
├── phases/
│   ├── phase-0-discovery.md
│   └── phase-N-*.md
├── workflows/
│   └── {workflow-name}.md
├── plugins/
│   └── SCHEMA.md
└── references/
    └── examples.md
```

Quando usar: domínio complexo, múltiplos workflows, state tracking, error recovery, extensibilidade.

---

## Anti-Patterns (o que NÃO é um Forge)

| Anti-Pattern | Problema |
|---|---|
| Skill que implementa E orquestra | Quebra Trait 5. Forge é PURO orquestrador. |
| Skill sem intent classifier | Quebra Trait 2. Sem classificação, não há routing inteligente. |
| Skill que roteia para recursos imaginários | Quebra Trait 3. Todos os executors devem existir. |
| Skill que executa sem perguntar | Quebra Trait 4. Discovery é obrigatório. |
| Skill genérico sem identity | Quebra Trait 1. "Eu sou um orquestrador de X" é obrigatório. |
