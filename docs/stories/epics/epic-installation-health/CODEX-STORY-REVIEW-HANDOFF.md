# CODEX Story Review Handoff — Epic INS-4 (8 Stories)

## Objetivo

Analise critica investigativa das 8 stories drafadas pelo @sm (River) para o Epic INS-4. Cada story deve ser validada contra:

1. **Plano original:** `INDEX.md`, `handoff-architect-to-pm-epic-installation-health.md`
2. **Codex Critical Analysis anterior:** `CODEX-CRITICAL-ANALYSIS.md`
3. **Codigo real do projeto:** arquivos-chave listados abaixo

**Meta:** Identificar gaps, inconsistencias, riscos de implementacao, ACs nao testaveis, e divergencias entre o que a story diz e o que o codigo real permite/exige.

---

## Documentos de Referencia

| Documento | Path | Leia |
|-----------|------|------|
| Epic INDEX | `docs/stories/epics/epic-installation-health/INDEX.md` | Plano geral, waves, sizing, gap analysis |
| Architect Handoff | `docs/stories/handoffs/handoff-architect-to-pm-epic-installation-health.md` | Specs tecnicas detalhadas (secoes 3.1-3.8) |
| Codex Critical Analysis | `docs/stories/epics/epic-installation-health/CODEX-CRITICAL-ANALYSIS.md` | Findings anteriores (C1-C3, A1-A4, M1-M3) |
| Codex Handoff (file paths) | `docs/stories/epics/epic-installation-health/CODEX-HANDOFF.md` | Mapa completo do codebase |

---

## Stories a Revisar

| Story | Path | Pts |
|-------|------|-----|
| INS-4.1 | `story-INS-4.1-aios-doctor.md` | 5 |
| INS-4.2 | `story-INS-4.2-settings-json-generator.md` | 5 |
| INS-4.3 | `story-INS-4.3-installer-settings-rules.md` | 2 |
| INS-4.4 | `story-INS-4.4-claude-md-template-v5.md` | 3 |
| INS-4.5 | `story-INS-4.5-ide-sync-integration.md` | 2 |
| INS-4.6 | `story-INS-4.6-entity-registry-on-install.md` | 2 |
| INS-4.7 | `story-INS-4.7-config-smart-merge.md` | 5 |
| INS-4.8 | `story-INS-4.8-health-check-task.md` | 2 |

---

## Investigacao por Story

### INS-4.1: `aios doctor` Reescrita

**Codigo real a investigar:**
- `bin/aios.js` linhas 350-450 — `runDoctor()` atual. Confirmar: bug de contrato existe como descrito? `options` e realmente ignorado?
- `bin/aios.js` linhas 1090-1110 — dispatch. Confirmar: `doctorOptions` e montado mas nao usado corretamente?
- `bin/aios.js` linhas 670-685 — help text. O help promete features que nao existem?
- `packages/installer/src/installer/post-install-validator.js` — quantos checks tem? Story diz "reuse as subcomponent" — e viavel?
- `.aios-core/core/health-check/index.js` — existe? Qual a relacao com doctor? Story diz "different mechanism" — confirmar
- `.claude/rules/` — quantos arquivos existem REALMENTE? Story diz 7. Confirmar lista exata

**Perguntas especificas:**
1. A story propoe criar `.aios-core/core/doctor/` — isso viola L1 boundary? Story diz "framework-contributor mode" — isso e correto para este repo?
2. Os 12 checks propostos cobrem todos os gaps identificados no INDEX? Ha gaps nao cobertos?
3. O check `graph-dashboard` (3.9) faz sentido? O que exatamente seria validado em `.aios-core/core/graph-dashboard/`?
4. O check `code-intel` (3.10) retorna INFO (nao FAIL) — isso e correto dado que code-intel tem zero providers configurados?
5. Task 5.3 propoe `fix for settings-json: call generate-settings-json.js` — mas INS-4.2 pode nao estar merged quando INS-4.1 roda. O stub call e suficiente?
6. Sizing 5 pts — realista para 12 check modules + formatters + fix handler + tests?

---

### INS-4.2: Settings.json Boundary Generator

**Codigo real a investigar:**
- `.aios-core/core-config.yaml` secao `boundary` (linhas ~358-385) — quantos paths reais? Story diz 9 protected + 2 exceptions
- `.claude/settings.json` — ler TODO o arquivo. Quantos deny rules existem? Qual o schema exato? Quais tools sao bloqueadas (Edit, Write, MultiEdit, Bash, NotebookEdit)?
- `packages/installer/src/wizard/index.js` linhas 100-140, 500-520 — como `settings.json` e escrito atualmente? So `language`?
- Verificar: Claude Code aceita glob patterns (`**`) em deny rules? Ou precisa de paths explicitos?

**Perguntas especificas:**
1. Story propoe path `.aios-core/infrastructure/scripts/generate-settings-json.js` — este path faz sentido dado o pattern do projeto? Existem outros scripts em `infrastructure/scripts/`?
2. A expansao de 9 globs para ~60 deny rules — como funciona? Cada glob expande para quais subdiretorios? O generator precisa scan do filesystem real?
3. Story AC2 diz "deny rule with Edit and Write tools blocked" — mas o settings.json real bloqueia quais tools exatamente? Conferir schema real
4. Story AC4 diz "preserves user sections outside AIOS-managed permissions block" — como delimita secao gerada vs secao manual num JSON? JSON nao tem comentarios
5. A story menciona `MultiEdit` tool — existe essa tool no Claude Code? Confirmar no settings.json real
6. Sizing 5 pts — realista para generator + expansion logic + idempotency + tests?

---

### INS-4.3: Installer Wire Generator

**Codigo real a investigar:**
- `packages/installer/src/wizard/index.js` — onde exatamente inserir a chamada? Qual e o "post-copy hook point"?
- `packages/installer/src/wizard/ide-config-generator.js` linhas 286, 530, 541, 550, 661, 711 — confirmar que rules, hooks, settings.local JA sao copiados
- `packages/installer/src/installer/post-install-validator.js` — qual a estrutura de validacao? Ha um pattern de add check?
- `packages/installer/src/installer/aios-core-installer.js` — como funciona o copy de `.aios-core/`?

**Perguntas especificas:**
1. Story assume que `generate-settings-json.js` e importavel via `require()` — mas o path proposto na INS-4.2 e `.aios-core/infrastructure/scripts/` — o require funciona cross-platform com esse path relativo?
2. O "graceful degradation" (AC1: generator throws → log warning → continue) — o installer tem esse pattern em outros pontos? Ou seria o primeiro?
3. Sizing 2 pts — realista para wiring + validator update + summary update + tests?

---

### INS-4.4: CLAUDE.md Template v5

**Codigo real a investigar:**
- `.aios-core/product/templates/ide-rules/claude-rules.md` — ler INTEIRO. Quais secoes existem? Quais markers?
- `.claude/CLAUDE.md` — ler INTEIRO (ou pelo menos os headings). Confirmar quais 4 secoes faltam no template
- `packages/installer/src/merger/strategies/markdown-merger.js` — como funciona o merge por markers? `<!-- FRAMEWORK-OWNED -->` e realmente respeitado?
- Verificar: o installer realmente usa `markdown-merger` para gerar CLAUDE.md? Ou escreve raw?

**Perguntas especificas:**
1. Story diz "4 secoes novas" — sao exatamente: Framework vs Project Boundary, Rules System, Code Intelligence, Graph Dashboard? A producao tem essas exatas?
2. O template atual tem markers `<!-- FRAMEWORK-OWNED -->` e `<!-- PROJECT-CUSTOMIZED -->`? Ou esses markers precisam ser adicionados ao template INTEIRO (nao so as 4 novas secoes)?
3. A producao CLAUDE.md tem uma secao chamada "Framework vs Project Boundary" ou o heading e diferente?
4. `markdown-merger.js` realmente trata FRAMEWORK-OWNED vs PROJECT-CUSTOMIZED? Ou e uma suposicao da story?
5. Sizing 3 pts — realista para template authoring + merger verification + upgrade safety + tests?

---

### INS-4.5: IDE Sync Integration

**Codigo real a investigar:**
- `.aios-core/infrastructure/scripts/ide-sync/index.js` linhas 530-540 — qual a assinatura real de `commandSync`? Quais parametros aceita?
- `.aios-core/infrastructure/scripts/ide-sync/validator.js` — o que `commandValidate` verifica?
- `packages/installer/src/wizard/ide-config-generator.js` — qual a relacao com ide-sync? Sao complementares como a story diz?
- `.aios-core/core-config.yaml` secao `ide` — qual o schema? `ide.selected` existe? Ou e `ide.configs`?

**Perguntas especificas:**
1. Story AC1 diz `commandSync({ projectRoot, ides: config.ide.selected })` — mas a assinatura REAL aceita esses parametros? Verificar no codigo
2. Story diz "ide-config-generator vs ide-sync are complementary, NOT duplicates" — confirmar no codigo. Ha overlap?
3. O risco de cwd/side-effects citado pelo Codex — `commandSync` usa `process.chdir()` internamente? Verificar
4. Sizing 2 pts — realista para API integration + multi-IDE + error handling + tests?

---

### INS-4.6: Entity Registry Bootstrap

**Codigo real a investigar:**
- `.aios-core/development/scripts/populate-entity-registry.js` — existe? Quantas linhas? Aceita `projectRoot` como argumento? E programaticamente importavel?
- `.husky/pre-push` — confirmar que chama `ids-pre-push.js`
- `.aios-core/hooks/ids-pre-push.js` — confirmar incremental vs full scan
- `.aios-core/data/entity-registry.yaml` — existe? Quantas entidades? Qual o schema?

**Perguntas especificas:**
1. Story propoe medir runtime e decidir sync vs async — mas nao define COMO medir. O script tem modo dry-run ou benchmark?
2. A story diz "call populate-entity-registry.js after .aios-core/ copy" — mas este script esta DENTRO de `.aios-core/`. O installer ja copiou `.aios-core/` nesse ponto?
3. O script depende de dependencias npm? Se sim, `node_modules` ja existe no target?
4. Sizing 2 pts — realista para bootstrap call + async guard + performance measurement + tests?

---

### INS-4.7: YAML Merger Strategy

**Codigo real a investigar:**
- `packages/installer/src/merger/strategies/index.js` linhas 16-24 — como strategies sao registradas? Qual interface?
- `packages/installer/src/merger/strategies/base-merger.js` — qual e o contrato da interface `merge()`?
- `packages/installer/src/merger/strategies/env-merger.js` — como implementa `merge()`? Return type?
- `packages/installer/src/merger/strategies/markdown-merger.js` — mesma investigacao
- `packages/installer/src/merger/index.js` (~71 linhas) — como o entry point seleciona a strategy?
- `packages/installer/src/installer/brownfield-upgrader.js` (~438 linhas) — como trata `core-config.yaml` atualmente? Onde esta o hash-compare?
- `packages/installer/src/installer/file-hasher.js` (~234 linhas) — como hash comparison funciona?
- `.aios-core/core/config/merge-utils.js` (~101 linhas) — pode ser reutilizado?
- `packages/installer/tests/unit/merger/strategies.test.js` — quais testes existem?

**Perguntas especificas:**
1. A story propoe `YamlMerger extends BaseMerger` — mas `BaseMerger` e uma classe real ou uma convencao? Verificar `base-merger.js`
2. O `merge()` do `env-merger.js` retorna `{ merged, warnings }` como a story assume? Ou tem outro return type?
3. Story propoe "swap hash-compare for merge in brownfield-upgrader" — mas o upgrader usa hash-compare para DECIDIR se atualiza (modified=skip, unmodified=replace). Com o merger, essa logica muda completamente. A story captura essa complexidade?
4. `js-yaml` ja e uma dependencia do projeto? Ou precisa ser adicionada?
5. O "deep merge" para nested YAML (ex: `boundary.protected` array) — a story mostra merge superficial (top-level keys). YAML aninhado exige recursive merge. Isso esta coberto?
6. Sizing 5 pts — realista? O Codex anterior sugeriu 5-6. A complexidade do recursive merge pode aumentar

---

### INS-4.8: Unify Health-Check

**Codigo real a investigar:**
- `.aios-core/development/tasks/health-check.yaml` — ler INTEIRO. Tem alias `*doctor`? Quais instructions atuais?
- `.aios-core/core/health-check/index.js` — existe? O que faz? E chamado por `runDoctor()`?
- `bin/aios.js` `runDoctor()` — usa `core/health-check/index.js` internamente? Ou sao totalmente separados?

**Perguntas especificas:**
1. Story diz "remove *doctor alias" — verificar se o alias existe REALMENTE no health-check.yaml
2. A governance interpretation map (Task 3) mapeia checks a Constitution articles — esses mapeamentos sao corretos? (ex: settings-json → Article II, git-hooks → Article V)
3. Story AC5 diz "task works via Bash tool" — mas tasks sao instrucionais (markdown). O agent que executa e que usa Bash. Isso e uma confusao na story?
4. Sizing 2 pts — realista para task update + governance map + documentation + tests?

---

## Validacao Cruzada (Cross-Story)

Alem da analise individual, investigue:

### 1. Dependency Chain
- INS-4.3 depende de INS-4.2 (generator deve existir para ser wired). A interface do generator em INS-4.2 (AC5: `gen.generate(projectRoot, config)`) e consumida corretamente por INS-4.3 (Task 2.2: `await generator.generate(targetProjectRoot, config)`)?
- INS-4.8 depende de INS-4.1 (doctor --json). O formato JSON output definido em INS-4.1 (AC3) e o que INS-4.8 (AC1) espera parsear?

### 2. File Path Consistency
- INS-4.1 cria `.aios-core/core/doctor/` — INS-4.8 referencia `aios doctor --json` via CLI. O CLI path (`bin/aios.js`) e o module path (`.aios-core/core/doctor/`) estao alinhados?
- INS-4.2 cria `.aios-core/infrastructure/scripts/generate-settings-json.js` — INS-4.3 faz `require` deste path. O require funciona?
- INS-4.4 atualiza `.aios-core/product/templates/ide-rules/claude-rules.md` — este path existe? E o template real?

### 3. Test Location Consistency
- INS-4.1 propoe testes em `packages/installer/tests/unit/doctor/`
- INS-4.2 propoe testes em `packages/installer/tests/unit/generate-settings-json/`
- INS-4.7 propoe testes em `packages/installer/tests/unit/merger/`
- Estes paths sao consistentes com o test structure existente?

### 4. Sizing Total
- Total: 26 pts. Codex anterior sugeriu 27-31 pts. As stories estao subdimensionadas?
- Quais stories tem maior risco de estouro? INS-4.1 (12 checks) e INS-4.7 (recursive YAML merge)?

### 5. Coverage dos 10 Gaps do INDEX
- Verificar: cada um dos 10 gaps do INDEX.md (secao Gap Analysis) esta coberto por pelo menos 1 story?
- Ha gaps nao cobertos?

---

## Deliverable Esperado

Para cada story, fornecer:

```markdown
### INS-4.X: {title}

**Veredito:** APROVADA | APROVADA COM AJUSTES | REQUER REESCRITA

**Alignment com Plano:**
- [alinhado/desalinhado] com INDEX.md
- [alinhado/desalinhado] com Architect Handoff
- [alinhado/desalinhado] com Codex Findings

**Gaps Identificados:**
1. {gap description}
2. ...

**ACs Nao Testaveis:**
- {AC que nao pode ser verificado como descrito}

**Riscos de Implementacao:**
1. {risco + severidade + mitigacao}

**Ajustes Recomendados:**
1. {ajuste especifico}

**Sizing Assessment:** {pts atuais} → {pts recomendados} (justificativa)
```

**Secao final:** Sumario executivo com veredito geral (GO/GO com ajustes/NO-GO) e lista priorizada de ajustes obrigatorios.
