# Colaboração Entre Agentes

> **Documento de referência** para entender como os 3 agentes do Squad Creator trabalham juntos.
>
> **Versão:** 3.0.0 | **Atualizado:** 2026-02-11

---

## Visão Geral da Arquitetura v3.0

O Squad Creator opera com **3 agentes especializados** que trabalham em sinergia:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    SQUAD CREATOR v3.0 ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│                        ┌─────────────────────┐                           │
│                        │   @squad-chief      │                           │
│                        │   (Orchestrator)    │                           │
│                        │                     │                           │
│                        │ • Ponto de entrada  │                           │
│                        │ • Triagem/Routing   │                           │
│                        │ • Criação de squads │                           │
│                        │ • Extração de SOPs  │                           │
│                        │ • Validação final   │                           │
│                        └──────────┬──────────┘                           │
│                                   │                                      │
│                    ┌──────────────┼──────────────┐                       │
│                    │              │              │                       │
│                    ▼              │              ▼                       │
│         ┌─────────────────┐      │     ┌─────────────────┐              │
│         │  @oalanicolas   │◄─────┴────►│  @pedro-valerio │              │
│         │   (Tier 1)      │            │    (Tier 1)     │              │
│         │                 │            │                 │              │
│         │ • Mind Cloning  │            │ • Process Design│              │
│         │ • DNA Extraction│  HANDOFF   │ • Veto Conditions│             │
│         │ • Source Curation│◄─────────►│ • Workflow Audit│              │
│         │ • Fidelity Check│            │ • Artifact Build│              │
│         └─────────────────┘            └─────────────────┘              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Os 3 Agentes

### @squad-chief (Orchestrator)

**Papel:** Ponto de entrada, coordenação geral, triagem e criação de squads.

| Aspecto | Descrição |
|---------|-----------|
| **Ativação** | `@squad-creator` ou `@squad-chief` |
| **Funções** | Triagem, routing, criação de squads, extração de SOPs, validação final |
| **Delega para** | @oalanicolas (DNA), @pedro-valerio (processos) |
| **Recebe de** | Usuário, @oalanicolas (DNA pronto), @pedro-valerio (artefatos) |

**Quando o Chief age sozinho:**
- Criar squad completo (orquestra os outros)
- Extrair SOP de transcrição (*extract-sop)
- Pesquisar elite minds (*create-squad)
- Validar squad final (*validate-squad)
- Routing inicial (diagnóstico de necessidade)

**Quando o Chief delega:**
- Precisa extrair DNA de um mind → @oalanicolas
- Precisa validar/criar workflow → @pedro-valerio
- Precisa auditar processo → @pedro-valerio

---

### @oalanicolas (Tier 1 - Mind Cloning Specialist)

**Papel:** Especialista em extração de conhecimento e clonagem de mentes.

| Aspecto | Descrição |
|---------|-----------|
| **Ativação** | `@squad-creator:oalanicolas` |
| **Funções** | Curadoria de fontes, extração de Voice DNA, extração de Thinking DNA |
| **Recebe de** | @squad-chief (mind para clonar) |
| **Entrega para** | @pedro-valerio (insumos prontos) ou @squad-chief (DNA completo) |

**Comandos exclusivos:**
```
*assess-sources      - Avaliar fontes (ouro vs bronze)
*extract-framework   - Extrair framework + Voice + Thinking DNA
*extract-implicit    - Extrair conhecimento tácito
*find-0.8            - Pareto ao Cubo (0,8% genialidade)
*validate-extraction - Self-validation antes do handoff
*fidelity-score      - Calcular score de fidelidade
```

**Filosofia:**
- "Curadoria > Volume"
- "Se entrar cocô, sai cocô"
- "Clone minds, not create bots"

---

### @pedro-valerio (Tier 1 - Process Absolutist)

**Papel:** Especialista em processos, workflows, e validação.

| Aspecto | Descrição |
|---------|-----------|
| **Ativação** | `@squad-creator:pedro-valerio` |
| **Funções** | Design de workflows, veto conditions, automação, criação de artefatos |
| **Recebe de** | @oalanicolas (insumos extraídos), @squad-chief (requests) |
| **Entrega para** | @squad-chief (artefatos prontos) |

**Comandos exclusivos:**
```
*eng-map          - Mapear processo completo
*arq-structure    - Criar estrutura de sistema
*auto-rules       - Regras de bloqueio
*create-task      - Criar task a partir de insumos
*create-workflow  - Criar workflow multi-fase
*create-agent     - Criar agent a partir de DNA
*audit            - Auditar processo/workflow
*veto-check       - Verificar veto conditions
```

**Filosofia:**
- "A melhor coisa é impossibilitar caminhos errados"
- "Nada volta num fluxo. NUNCA."
- "Se repete 3x, tem que automatizar"

---

## Fluxo de Colaboração

### Fluxo Principal: Criar Squad

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    FLUXO: *create-squad {domain}                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  FASE 0: DISCOVERY (squad-chief)                                         │
│  ├── Recebe request do usuário                                          │
│  ├── Verifica squad-registry.yaml (existe similar?)                     │
│  ├── Pergunta modo (YOLO/QUALITY/HYBRID)                                │
│  └── Inicia research loop                                               │
│                                                                          │
│  FASE 1: RESEARCH (squad-chief)                                          │
│  ├── Executa mind-research-loop (3-5 iterações)                         │
│  ├── Devil's advocate em cada iteração                                  │
│  ├── Valida frameworks documentados                                     │
│  └── Apresenta elite minds ao usuário                                   │
│                                                                          │
│  FASE 2: CLONAGEM (squad-chief → @oalanicolas)                          │
│  ├── Para cada mind aprovado:                                           │
│  │   ├── squad-chief invoca @oalanicolas                                │
│  │   ├── @oalanicolas executa /clone-mind                               │
│  │   │   ├── Coleta sources                                             │
│  │   │   ├── Classifica ouro vs bronze                                  │
│  │   │   ├── Extrai Voice DNA                                           │
│  │   │   ├── Extrai Thinking DNA                                        │
│  │   │   └── Gera mind_dna_complete.yaml                                │
│  │   └── @oalanicolas devolve DNA para squad-chief                      │
│  └── Checkpoint: Todos os DNAs extraídos                                │
│                                                                          │
│  FASE 3: CRIAÇÃO (squad-chief → @pedro-valerio)                         │
│  ├── squad-chief passa DNAs para @pedro-valerio                         │
│  ├── @pedro-valerio cria artefatos:                                     │
│  │   ├── Agents baseados nos DNAs                                       │
│  │   ├── Tasks com veto conditions                                      │
│  │   ├── Workflows com checkpoints                                      │
│  │   └── Checklists de validação                                        │
│  └── @pedro-valerio devolve artefatos para squad-chief                  │
│                                                                          │
│  FASE 4: INTEGRAÇÃO (squad-chief)                                        │
│  ├── Gera config.yaml                                                   │
│  ├── Gera README.md                                                     │
│  ├── Organiza estrutura de pastas                                       │
│  └── Wiring de dependências                                             │
│                                                                          │
│  FASE 5: VALIDAÇÃO (squad-chief)                                         │
│  ├── Executa smoke tests (3 testes por agent)                           │
│  ├── Valida quality gates                                               │
│  ├── Gera quality dashboard                                             │
│  └── Apresenta resultado ao usuário                                     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Fluxo: Clonar Mind Individual

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    FLUXO: *clone-mind {name}                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  squad-chief recebe request                                              │
│       │                                                                  │
│       ▼                                                                  │
│  squad-chief delega para @oalanicolas                                    │
│       │                                                                  │
│       ▼                                                                  │
│  @oalanicolas executa pipeline completo:                                 │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ 1. COLLECT SOURCES                                               │    │
│  │    ├── Auto-acquire (YouTube, podcasts, articles)               │    │
│  │    ├── User materials (se fornecidos)                           │    │
│  │    └── Quality Gate: >= 10 sources, >= 5 Tier 1                 │    │
│  │                                                                  │    │
│  │ 2. CURATE SOURCES                                                │    │
│  │    ├── Classificar: OURO (Tier 0-1) vs BRONZE (Tier 2-3)       │    │
│  │    ├── Triangulação (3+ sources por claim)                      │    │
│  │    └── Veto: < 3 sources ouro = BLOCK                           │    │
│  │                                                                  │    │
│  │ 3. EXTRACT VOICE DNA                                             │    │
│  │    ├── Power words, signature phrases                           │    │
│  │    ├── Stories, anecdotes                                       │    │
│  │    ├── Tone dimensions                                          │    │
│  │    ├── Anti-patterns, immune system                             │    │
│  │    └── Quality Gate: score >= 8/10                              │    │
│  │                                                                  │    │
│  │ 4. EXTRACT THINKING DNA                                          │    │
│  │    ├── Primary + secondary frameworks                           │    │
│  │    ├── Heuristics (com QUANDO usar)                             │    │
│  │    ├── Recognition patterns                                     │    │
│  │    ├── Objection handling                                       │    │
│  │    └── Quality Gate: score >= 7/9                               │    │
│  │                                                                  │    │
│  │ 5. SYNTHESIZE                                                    │    │
│  │    ├── Merge Voice + Thinking                                   │    │
│  │    ├── Gerar mind_dna_complete.yaml                             │    │
│  │    └── Self-validation checklist                                │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│       │                                                                  │
│       ▼                                                                  │
│  @oalanicolas retorna DNA para squad-chief                               │
│       │                                                                  │
│       ▼                                                                  │
│  squad-chief apresenta resultado ao usuário                              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Handoffs e Protocolos

### Handoff: squad-chief → @oalanicolas

**Trigger:** Precisa extrair DNA de um mind

**Contexto passado:**
```yaml
handoff_to_oalanicolas:
  mind_name: "Gary Halbert"
  domain: "copywriting"
  sources_path: "docs/research/gary-halbert/"  # opcional
  mode: "quality"  # yolo | quality
  focus: "both"  # voice | thinking | both
```

**Esperado de volta:**
```yaml
return_from_oalanicolas:
  status: "complete"
  output_path: "squads/mind-cloning/minds/gary_halbert/"
  artifacts:
    - sources_inventory.yaml
    - voice_dna.yaml
    - thinking_dna.yaml
    - mind_dna_complete.yaml
  quality_scores:
    voice: 8.5
    thinking: 8.0
    overall: 8.25
```

---

### Handoff: @oalanicolas → @pedro-valerio

**Trigger:** Insumos prontos para virar artefatos (tasks, workflows, agents)

**Formato: INSUMOS_READY**
```yaml
insumos_ready:
  from: "@oalanicolas"
  to: "@pedro-valerio"

  validation_checklist:
    - "15+ citações diretas com [SOURCE: página/minuto]": true
    - "Voice DNA com 5+ signature phrases verificáveis": true
    - "Thinking DNA com decision architecture mapeada": true
    - "Heuristics com contexto de aplicação (QUANDO)": true
    - "Anti-patterns do EXPERT (não genéricos)": true
    - "Zero conceitos marcados como inferido sem fonte": true

  artifacts:
    - voice_dna.yaml
    - thinking_dna.yaml
    - mind_dna_complete.yaml

  request: "Criar agent baseado neste DNA"
```

**Veto Conditions (PV rejeita se):**
- Conceitos sem `[SOURCE:]`
- Inferências não marcadas
- < 15 citações
- < 5 signature phrases

**Se veto:** Devolve para @oalanicolas com lista do que falta.

---

### Handoff: @pedro-valerio → squad-chief

**Trigger:** Artefatos prontos para integração

**Formato: ARTIFACTS_READY**
```yaml
artifacts_ready:
  from: "@pedro-valerio"
  to: "@squad-chief"

  validation:
    smoke_tests: "3/3 PASS"
    veto_conditions: "defined"
    flow: "unidirectional"
    handoffs: "zero gap"

  artifacts:
    - agent.md
    - tasks/*.md
    - workflows/*.yaml
    - checklists/*.md

  quality_score: 8.5
```

---

## Matriz de Responsabilidades

### Quem faz o quê?

| Atividade | squad-chief | @oalanicolas | @pedro-valerio |
|-----------|:-----------:|:------------:|:--------------:|
| **Receber request do usuário** | ✅ | - | - |
| **Triagem/Routing** | ✅ | - | - |
| **Research elite minds** | ✅ | - | - |
| **Coletar sources** | - | ✅ | - |
| **Curar sources (ouro/bronze)** | - | ✅ | - |
| **Extrair Voice DNA** | - | ✅ | - |
| **Extrair Thinking DNA** | - | ✅ | - |
| **Criar agent.md** | - | - | ✅ |
| **Criar task.md** | - | - | ✅ |
| **Criar workflow.yaml** | - | - | ✅ |
| **Definir veto conditions** | - | - | ✅ |
| **Auditar processo** | - | - | ✅ |
| **Gerar config.yaml** | ✅ | - | - |
| **Gerar README.md** | ✅ | - | - |
| **Validação final** | ✅ | - | - |
| **Apresentar resultado** | ✅ | - | - |

---

### Quando chamar quem?

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    DECISION TREE: QUAL AGENTE USAR?                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  "O que você precisa fazer?"                                             │
│       │                                                                  │
│       ├── Criar squad completo ──────────────► @squad-chief             │
│       │                                                                  │
│       ├── Extrair DNA de um expert ──────────► @oalanicolas             │
│       │                                                                  │
│       ├── Avaliar qualidade de fontes ───────► @oalanicolas             │
│       │                                                                  │
│       ├── Clone não está autêntico ──────────► @oalanicolas             │
│       │                                                                  │
│       ├── Criar workflow/task ───────────────► @pedro-valerio           │
│       │                                                                  │
│       ├── Definir veto conditions ───────────► @pedro-valerio           │
│       │                                                                  │
│       ├── Auditar processo existente ────────► @pedro-valerio           │
│       │                                                                  │
│       ├── Extrair SOP de transcrição ────────► @squad-chief             │
│       │                                                                  │
│       ├── Validar squad existente ───────────► @squad-chief             │
│       │                                                                  │
│       └── Não sei qual usar ─────────────────► @squad-chief             │
│                                                (ele roteia)              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Mental Model Integration (v3.0)

Na versão 3.0, cada agente especialista (@oalanicolas e @pedro-valerio) possui **mental models** integrados que são consultados em **decision checkpoints**.

### Como funciona

```yaml
decision_checkpoint:
  trigger: "Antes de decisões importantes"
  action: "Consultar mental model relevante"
  models_available:
    - VALUES (O que importa para o expert)
    - OBSESSIONS (O que os move)
    - MENTAL_MODELS (Como pensam)
    - PARADOXES (Contradições autênticas)
```

### Exemplo: @oalanicolas decidindo classificação de fonte

```
Checkpoint: Classificar fonte como OURO ou BRONZE?

1. Consulta VALUES: "Expert valoriza evidência empírica"
2. Consulta MENTAL_MODEL: "Triangulação requer 3+ sources"
3. Decisão: Fonte única sem corroboração = BRONZE
```

### Tasks com Decision Checkpoints

| Task | Checkpoints | Mental Models Consultados |
|------|-------------|---------------------------|
| `an-assess-sources` | 3 | VALUES, OBSESSIONS |
| `an-extract-framework` | 5 | MODELS, PARADOXES |
| `an-validate-clone` | 4 | VALUES, MODELS |
| `pv-audit` | 6 | MODELS, VALUES |
| `create-workflow` | 4 | OBSESSIONS, MODELS |

---

## Veto Conditions por Agente

### @squad-chief - Vetos

| Condição | Ação |
|----------|------|
| Squad já existe para domínio | WARN + perguntar se quer estender |
| < 3 elite minds encontrados | BLOCK research |
| Nenhum mind com framework documentado | BLOCK creation |
| Quality score < 6.0 | BLOCK release |

### @oalanicolas - Vetos

| Condição | Ação |
|----------|------|
| < 10 sources total | BLOCK extraction |
| < 3 sources ouro (Tier 0-1) | BLOCK synthesis |
| Voice score < 6/10 | WARN + retry |
| Thinking score < 5/9 | WARN + retry |
| Self-validation FAIL | BLOCK handoff |

### @pedro-valerio - Vetos

| Condição | Ação |
|----------|------|
| Insumos sem [SOURCE:] | REJECT + return to AN |
| < 15 citações | REJECT + return to AN |
| Workflow permite path reverso | BLOCK + fix |
| Automação sem guardrails | BLOCK + add guardrails |
| Smoke test FAIL | BLOCK release |

---

## Ativação dos Agentes

### Via linha de comando

```bash
# Ativar squad-chief (ponto de entrada padrão)
@squad-creator

# Ativar oalanicolas diretamente
@squad-creator:oalanicolas

# Ativar pedro-valerio diretamente
@squad-creator:pedro-valerio
```

### Via delegação interna

O squad-chief delega automaticamente baseado no contexto:

```
User: "*clone-mind Gary Halbert"
squad-chief: "Delegando para @oalanicolas..."
@oalanicolas: "Iniciando extração de DNA..."
```

---

## Troubleshooting de Colaboração

### Problema: Handoff travado entre agentes

**Sintoma:** @oalanicolas não consegue entregar para @pedro-valerio

**Causa provável:** Self-validation falhou

**Solução:**
```bash
@oalanicolas
*validate-extraction
# Ver o que está faltando
# Completar antes de tentar handoff novamente
```

### Problema: @pedro-valerio rejeitando insumos

**Sintoma:** "VETO: Insumos incompletos"

**Causa:** Citações insuficientes ou inferências não marcadas

**Solução:**
```bash
@oalanicolas
*assess-sources  # Ver cobertura
*extract-framework --deep  # Extrair mais profundamente
```

### Problema: Squad criado mas agents genéricos

**Sintoma:** Agents não soam como o expert

**Causa:** DNA extraction superficial

**Solução:**
```bash
@oalanicolas
*diagnose-clone {slug}
*fidelity-score {slug}
*update-mind {slug} --sources ./mais-materiais/
```

---

## Resumo Visual

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    SQUAD CREATOR COLLABORATION v3.0                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│                         USER REQUEST                                     │
│                              │                                           │
│                              ▼                                           │
│                    ┌─────────────────┐                                   │
│                    │  @squad-chief   │                                   │
│                    │   (Triage)      │                                   │
│                    └────────┬────────┘                                   │
│                             │                                            │
│              ┌──────────────┼──────────────┐                             │
│              │              │              │                             │
│              ▼              ▼              ▼                             │
│     ┌────────────┐  ┌────────────┐  ┌────────────┐                      │
│     │   Clone    │  │   Create   │  │  Extract   │                      │
│     │   Mind     │  │   Squad    │  │   SOP      │                      │
│     └─────┬──────┘  └─────┬──────┘  └────────────┘                      │
│           │               │                                              │
│           ▼               │                                              │
│  ┌─────────────────┐     │                                              │
│  │  @oalanicolas   │◄────┘                                              │
│  │  (Extract DNA)  │                                                    │
│  └────────┬────────┘                                                    │
│           │                                                              │
│           │ INSUMOS_READY                                               │
│           ▼                                                              │
│  ┌─────────────────┐                                                    │
│  │ @pedro-valerio  │                                                    │
│  │ (Build Artifacts)│                                                   │
│  └────────┬────────┘                                                    │
│           │                                                              │
│           │ ARTIFACTS_READY                                             │
│           ▼                                                              │
│  ┌─────────────────┐                                                    │
│  │  @squad-chief   │                                                    │
│  │  (Integrate)    │                                                    │
│  └────────┬────────┘                                                    │
│           │                                                              │
│           ▼                                                              │
│       SQUAD READY                                                        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Links Relacionados

- [CONCEPTS.md](./CONCEPTS.md) - Conceitos fundamentais
- [COMMANDS.md](./COMMANDS.md) - Referência de comandos
- [ARCHITECTURE-DIAGRAMS.md](./ARCHITECTURE-DIAGRAMS.md) - Diagramas técnicos
- [HITL-FLOW.md](./HITL-FLOW.md) - Human-in-the-Loop checkpoints

---

**Squad Creator | Agent Collaboration v3.0**
*"3 agentes, 1 objetivo: criar squads de elite."*
