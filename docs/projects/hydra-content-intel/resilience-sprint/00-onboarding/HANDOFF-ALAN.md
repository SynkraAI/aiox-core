# Handoff para Alan Nicolas — HYDRA Resilience Sprint

**De:** Breno (via Orion / aios-master)
**Para:** Alan Nicolas — creator AIOS
**Data:** 2026-05-12
**PR:** https://github.com/SynkraAI/aiox-core/pull/725 (draft, cross-repo lorDofPicanha → SynkraAI:main)
**Branch:** `feat/hydra-resilience-sprint` (5 commits)

---

## TL;DR para você

1. **🚨 Achei um bug arquitetural CRÍTICO no seu sistema** — o consultation engine inteiro estava deletado entre 17-18/Abr em algum commit anterior. `self-consultation.js`, `consultation-engine.js`, `project-detector.js` — todos perdidos. Tive que restaurar do snapshot `wip/2026-04-17-full-state`. **Você precisa investigar como isso aconteceu** porque a documentação `.claude/rules/jarvis-integration.md` referenciava esses arquivos como se existissem.

2. **🚨 Segundo bug: mesmo que existisse, NÃO LIA OS FEEDS HYDRA** — o engine só carregava o arquivo de identidade do clone. `mindCloneEnrichment.relevantMemory` era hardcoded `[]`. Os 25k+ feed writes das sessões 08/Mai (Anipis, High-Ticket) **nunca chegaram aos clones**. HYDRA era write-only silo.

3. **✅ Ambos os bugs FIXADOS** (Story 1.12) — feed-reader.js novo módulo + patch self-consultation.js. Validação empírica: `consult --expert alison-darcy` agora retorna `feedEntries.length === 412` com URLs reais Nature/medRxiv/PubMed/FAPESP. **Bug original que você implementaria como anti-hallucination via Voice DNA agora tem peer-camada de freshness check.**

4. **Workflow AIOS performou bem** — brownfield-service, 4 ADRs via mind clone conclave (martin-fowler + werner-vogels + charity-majors), PO multi-pass validation (v0.7 → v0.8 → v1.0 RC), agent delegation chain rodou ~12 subagent spawns sem hiccup. Boa validação do framework em uso real.

5. **3 stories shipped, 9 pending.** Sprint #1 (Resilience) está ~25% completo. Sprint #2 (cleanup) + Sprint #3 (portable) escopados.

---

## O bug arquitetural — precisa de você

### Fato 1: Engine de consultation estava deletado

`self-consultation.js` é referenciado em:
- `.claude/rules/jarvis-integration.md` (linha 14, 19, 22, 28-30)
- `.claude/rules/mind-clone-auto-consult.md`
- PRD docs, ADRs, workflow YAMLs

Quando rodei `grep -r "knowledge-feed" .aios-core/`, descobri zero matches. Aprofundei e descobri que **os 3 arquivos do core/jarvis estavam ausentes do branch `feat/hydra-resilience-sprint`** (que vem de `feat/redesign-foundation-tokens`, que vem de... algum lugar entre 17-18/Abr).

@dev Dex restaurou via:
```bash
git checkout wip/2026-04-17-full-state -- .aios-core/core/jarvis/
```

**Pergunta pra você:** Em qual commit isso foi deletado? Foi intencional ou um merge artifact? Há outros arquivos no AIOS que sofreram a mesma sorte mas a gente ainda não percebeu porque ainda não chamou eles?

### Fato 2: Engine não tinha feed reading mesmo no snapshot

Mesmo no snapshot recuperado, `self-consultation.js` só lia o arquivo de identidade do clone (Mega Brain `agents/minds/{dept}/{clone}.md`). Nunca tocava `D:/jarvis/mega brain/knowledge-feed/`.

**Validação empírica antes do fix:**
```bash
$ node .aios-core/core/jarvis/self-consultation.js consult --expert alison-darcy --question "..."
{
  "mindCloneEnrichment": {
    "relevantMemory": []   ← VAZIO sempre
  }
}
```

Enquanto o feed dela tinha 164KB de pesquisa fresca em `D:/jarvis/mega brain/knowledge-feed/alison-darcy/2026-05-08-hydra-feed.md`.

### Fato 3: Audit referenciava estado fantasma

Aria's C-10 audit (que eu disparei pra mapear consumers de `relevantMemory` antes do rename) descreveu um campo `mindCloneEnrichment.relevantMemory` que **nunca existiu** no engine real. Ela trabalhou de uma representação que estava na memory dela ou em algum doc desatualizado.

**Implicação ampla:** se mind clones consultam baseado em memórias velhas, podem produzir audits com estado fantasma. Isso é meta-loop interessante — sistema feito de mind clones que erram sobre o próprio sistema.

---

## O fix (Story 1.12)

Implementei conforme PRD §5 Story 1.12 + ADR-004 (consumption side):

**Novo módulo:** `tools/hydra/src/distribution/feed-reader.js`
- `loadCloneFeeds(cloneId, { days, maxTokens, minTier })` — async
- Parse frontmatter + items YAML
- Token budget 30k per expert (você opinaria diferente?)
- Tier filter S/A default, B excluído se >7 dias
- Quarantine flag para entries pre-2026-05-12 (anti-hallucination check só rodou na ingestão, não na injection)
- Staleness signal explícito se feed empty — instrui LLM a NÃO fabricar

**Patch:** `self-consultation.js`
- Adiciona campo NOVO `mindCloneEnrichment.feedEntries: FeedEntry[]`
- Mantém `mindCloneEnrichment.relevantMemory: string[]` hardcoded `[]` com `@deprecated` JSDoc (legacy alias por 1 release, Sprint #2 deleta)
- Injeta no prompt entre Principles e Question:
  ```markdown
  ## Recent Knowledge (from HYDRA feed, last 30 days)
  ### [2026-05-08] [Tier S] Performance MH chatbots in Detecting/Managing Suicidal Ideation
  **Source:** https://www.nature.com/articles/s41598-025-17242-4
  **Key Insights:** - Avaliação performance crisis routing.
  ⚠️ Pre-2026-05-12 entry — verify independently before citing
  ```

**Validação pós-fix:** alison-darcy retorna 412 entries reais. Funciona.

**Pergunta pra você (DNA expert):** A injeção no system prompt antes da Question respeita a integridade do clone, ou seria melhor:
- (a) Injection ANTES dos frameworks (knowledge precede mental model)
- (b) RAG separado (clone faz query semântica nos próprios feeds)
- (c) Conclave-time only (clone individual responde só pela persona; cross-reference só em batch)
- (d) Algo que você desenharia diferente

Atual = entre Principles e Question. Sua leitura?

---

## Validação do AIOS framework rodando real

Esta sessão foi um stress test do que você construiu. Resumo:

### Workflow: brownfield-service.yaml

Saiu naturalmente quando perguntei "monte PRD". As 3 phases (Service Analysis → Sharding → Development Cycle) seguiram limpo. Único hiccup: Phase 2 (sharding) acabou rodando em paralelo com Story implementation porque você (Aria recommended) splitou Story 1.1 em sub-stories e 1.1a era hotfix-class.

### Agent delegation chain

Spawn count nesta sessão: ~12 subagents.

| Agent | Ações | Performance |
|-------|-------|-------------|
| aios-architect (Aria) | document-project + architecture.md + 4 ADRs + audit + Sprint #3 feasibility | ✅ Caught 5 memory drifts that I'd have missed. Sharp. |
| aios-pm (Morgan) | 3 PRD revisions (v0.7, v0.9, v1.0 RC) | ✅ Mecânico mas preciso. |
| aios-po (Pax) | 3 validation passes (PASS_WITH_CONCERNS → PASS) | ✅ Catched C-01..C-10 + RA-6..RA-9 proactively. |
| aios-dev (Dex) | Story 1.1a + 1.12 + 1.1b | ✅ Discovered engine deletion. Restored from WIP snapshot. Decisivo. |
| aios-devops (Gage) | 3 commits + PR #725 push | ✅ Honored selective-add discipline. |

### Mind Clone Conclave

Rodei `self-consultation.js batch` com martin-fowler + werner-vogels + charity-majors pra decidir 3 ADRs (streaming pattern, vector search, observability). Output sintético tinha CONSENSUS + DISSENT + BLIND SPOTS sections. Cada clone pegou blind spot dos outros:

- Fowler: characterization tests pre-refactor (criou Story 1.1c)
- Werner: per-stage failure handling (mudou Story 1.5 AC #8)
- Majors: pipeline_items observability table (criou Story 1.11)

**Pergunta pra você:** O conclave funcionou pela auto-routing dos experts certos OU porque eu disse explicitamente `--experts "martin-fowler,werner-vogels,charity-majors"`? Auto-routing me pegou `lawrence-lessig + atul-butte + werner-vogels` na primeira tentativa — só 1/3 relevante. Voice DNA matching tá funcionando como você desenhou?

### IDS-Hook

Funcionou nas 2 commits que tocaram `.aios-core/`. Auto-registered 3 entities restauradas (consultation-engine, project-detector, self-consultation) sem warning sobre phantom state. **Talvez deveria warning** que estavam ausentes recentemente e voltaram? Ou era esperado?

---

## Decisões tomadas que você pode questionar

1. **Story 1.12 EARLY (parallel hotfix)** — antes mesmo de shard. Justificativa: sem isso, sprint inteiro entrega OOM fix com sistema inútil. Aria endorsed. Você concorda com sequenciar valor antes de processo aqui?

2. **Rename `relevantMemory` → `feedEntries`** (manter legacy alias 1 release) — em vez de overwrite. C-10 audit mostrou que renderer line ~361 quebraria com `[object Object]` se overwriting. Você teria feito diferente?

3. **3 YAMLs para domain mapping** (`angle_to_domain.yaml` + `dept_to_domain.yaml` + `domains.yaml`) vs 1 YAML unified. User aprovou 3. Mais arquivos, mais ownership clarity, mas mais surface. Trade-off OK?

4. **30k tokens per expert** (não per conclave) — conclave 5 experts = 150k tokens = ~R$1.50 per call. Generoso. Você sizeu conclaves diferente?

5. **sqlite-vss como fallback condicional** — default LRU cache, mas se benchmark falhar p99 200ms aceitamos a native dep. Tensiona com "no new top-level deps" do PRD §3.1. Você é mais rígido aqui?

6. **Commit ad-hoc patches `215221fa` como WIP** — preservar evidence dos patches 08/Mai sessions que estavam no working tree não commitados. Story 1.6 vai substituir por YAMLs. Sua leitura?

---

## Estado do branch `feat/hydra-resilience-sprint`

```
2e89929a feat(hydra): Story 1.1b - status.js SQLite read fix
f8f7c272 docs(hydra-resilience): shard PRD v1.0 RC + architecture for @sm consumption
215221fa chore(hydra): WIP - ad-hoc deptToDomainMap patches from 08/Mai sessions
19cbc979 feat(hydra): Story 1.12 - connect feeds to consultation engine (CRITICAL bug fix)
8831fb86 feat(hydra): resilience sprint baseline + Story 1.1a preflight scripts
```

**5 commits limpos. Tests: 45 suites / 617 passing.**

Stories shipped (3):
- 1.1a — Pre-flight validation scripts
- 1.12 — Connect Feeds to Consultation Engine (CRITICAL)
- 1.1b — status.js SQLite read fix

Stories pending (9):
- 1.1c (characterization fixture) → 1.2/1.3 (SQLite migrations) → 1.4 (pipeline split) → 1.5 (streaming) → 1.6 (DistributionService + 3-layer YAML) → 1.7 (--from-jsonl) → 1.8 (cost-tracker) → 1.9 (graceful shutdown) → 1.10 (docs) → 1.11 (pipeline_items + hydra query CLI)

**Critical path:** 1.1c → 1.4 → 1.5 → 1.11 → 1.10. Estimativa 2-3 semanas @dev.

---

## Onde encontrar tudo

```
docs/projects/hydra-content-intel/resilience-sprint/
├── 00-onboarding/
│   └── HANDOFF-ALAN.md           ← ESTE ARQUIVO
├── 01-analysis/
│   └── project-documentation.md  ← 828 LOC, Aria's brownfield analysis (5 memory drifts caught)
├── 02-prd/
│   ├── prd.md                    ← 931 LOC v1.0 RC, 12 stories
│   └── sharded/                  ← 16 dev-ready files for @sm
├── 03-architecture/
│   ├── architecture.md           ← 1262 LOC, §10A consumption side
│   ├── adrs/                     ← 4 ADRs (streaming/vector/observability/consumption)
│   ├── audits/                   ← C-10 relevantMemory shape audit
│   ├── conclave/                 ← mind clone conclave synthesis
│   └── sharded/                  ← 12 architecture sections
├── 04-validation/
│   └── po-validation-report.md   ← multi-pass PO PASS
└── 05-feasibility/
    └── sprint-3-portable.md      ← 158 LOC, Aria recommends Docker mode B
```

---

## O que eu queria de você

1. **Investigar o delete entre 17-18/Abr** — qual commit removeu core/jarvis? Há outros lugares com phantom references?
2. **Validar approach Story 1.12** — prompt injection no consumption side preserva integridade da persona? Você teria projetado diferentemente?
3. **Feedback no workflow** — AIOS rodou conforme você desenhou? Tem hooks/checkpoints que falharam silenciosamente?
4. **Opinião sobre Sprint #3** — Docker mode B (portable HYDRA) faz sentido como produto futuro ou é desvio do core AIOS? Aria recomenda perseguir só pós Sprint #1+#2.
5. **Voice DNA / Thinking DNA perspective** — você é expert em mind clone DNA. Se os clones agora veem 30k tokens de feed antes da Question, isso poda ou amplifica a DNA original? Tem risco de "feed pollution" sobrescrevendo a persona?

Quando puder, manda PR review no #725. Se tiver tempo limitado, foca na §"O bug arquitetural — precisa de você" porque pode revelar pattern broader no AIOS.

Valeu, Alan. AIOS funcionou nesta sessão — encontrou o próprio bug. Isso é meta-validação massiva do que você construiu.

— Breno (via Orion)
