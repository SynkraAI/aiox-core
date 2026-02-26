# CODEX Story Review — Epic INS-4

## Sumario Executivo

**Veredito geral: GO com ajustes obrigatorios (nao GO direto).**

As 8 stories estao bem direcionadas, mas ha inconsistencias tecnicas que hoje bloqueiam implementacao sem retrabalho, principalmente em:
- contrato de API da IDE Sync (INS-4.5),
- schema real de `.claude/settings.json` (INS-4.2),
- contrato de retorno do merger (INS-4.7),
- e premissas incorretas sobre hooks em INS-4.3.

## Achados Prioritarios (antes da execucao)

1. **INS-4.5 usa assinatura de API inexistente (CRITICO):** `commandSync({ projectRoot, ides })` nao corresponde ao codigo real.
- Story: `docs/stories/epics/epic-installation-health/story-INS-4.5-ide-sync-integration.md:40`
- Codigo real: `commandSync(options)` usa `process.cwd()` e opcoes `ide/dryRun/verbose/quiet`, sem `projectRoot/ides` (`.aios-core/infrastructure/scripts/ide-sync/index.js:213`, `.aios-core/infrastructure/scripts/ide-sync/index.js:214`).

2. **INS-4.2 descreve schema de settings divergente do real (CRITICO):**
- Story usa objetos `{ tool, path }` e menciona `MultiEdit` (`docs/stories/epics/epic-installation-health/story-INS-4.2-settings-json-generator.md:154`).
- Arquivo real usa strings no formato `Edit(path)`/`Write(path)` (`.claude/settings.json:2`).
- Isso invalida parte dos ACs e exemplos atuais.

3. **INS-4.7 define retorno de merger incompatível (CRITICO):**
- Story pede `merge(...) => { merged, warnings }` (`docs/stories/epics/epic-installation-health/story-INS-4.7-config-smart-merge.md:47`).
- Contrato real do merger retorna `MergeResult` com `content/stats/changes` (`packages/installer/src/merger/types.js:10`, `packages/installer/src/merger/types.js:60`, `packages/installer/src/merger/strategies/env-merger.js:126`).

4. **INS-4.3 interpreta hooks já implementados de forma incorreta (ALTO):**
- Story diz que linhas 541/661 copiam git hooks para `.husky` (`docs/stories/epics/epic-installation-health/story-INS-4.3-installer-settings-rules.md:28`, `docs/stories/epics/epic-installation-health/story-INS-4.3-installer-settings-rules.md:102`).
- Codigo real copia hooks do Claude para `.claude/hooks`, nao `.husky` (`packages/installer/src/wizard/ide-config-generator.js:539`, `packages/installer/src/wizard/ide-config-generator.js:545`, `packages/installer/src/wizard/ide-config-generator.js:661`).

5. **INS-4.1 aponta source path de rules inexistente (ALTO):**
- Story: `.aios-core/infrastructure/templates/rules/` (`docs/stories/epics/epic-installation-health/story-INS-4.1-aios-doctor.md:108`).
- Esse path nao existe no repo; rules fonte estao em `.claude/rules/`.

---

### INS-4.1: `aios doctor` — Reescrita com 12+ Checks, --fix, --json

**Veredito:** APROVADA COM AJUSTES

**Alignment com Plano:**
- Alinhado com INDEX: sim (Gap 7)
- Alinhado com Architect Handoff: parcial
- Alinhado com Codex Findings: parcial

**Gaps Identificados:**
1. Path de fix de rules está incorreto (`.aios-core/infrastructure/templates/rules/`) (`docs/stories/epics/epic-installation-health/story-INS-4.1-aios-doctor.md:108`).
2. Check de MEMORY lista 10 agentes e inclui `aios-master`, mas `MEMORY.md` atuais estao em subpastas especificas (10 arquivos, sem `aios-master`/`squad-creator`), exigindo regra mais precisa.
3. Check `git-hooks` com “executável” em Windows e ambíguo.
4. `check core-config` exige chaves `boundary/project/ide`; precisa formalizar em schema para evitar falso negativo.

**ACs Nao Testaveis (como escritas):**
- “under 10 seconds” nao aparece como criterio assertivo de teste automatizado.

**Riscos de Implementacao:**
1. ALTO: duplicacao com `PostInstallValidator` sem contrato claro de reuso.
2. MEDIO: `--fix` com dependência de INS-4.2 pode gerar comportamento parcial.

**Ajustes Recomendados:**
1. Corrigir source de rules para `.claude/rules/`.
2. Definir check de hooks cross-platform por existencia + conteudo esperado, nao “executable”.
3. Separar checks “core” vs “optional/info” para reduzir falso FAIL.
4. Tornar AC de performance testavel (ex.: quick mode p95).

**Sizing Assessment:** 5 → 6 (justificativa: 12 checks + formatters + fix + CI contract + cross-platform)

---

### INS-4.2: Settings.json Boundary Generator — Deny/Allow from Config

**Veredito:** REQUER REESCRITA

**Alignment com Plano:**
- Alinhado com INDEX: sim (Gap 1)
- Alinhado com Architect Handoff: parcial
- Alinhado com Codex Findings: parcial

**Gaps Identificados:**
1. Schema de output proposto difere do arquivo real (`{tool,path}` vs strings `Edit(path)`) (`docs/stories/epics/epic-installation-health/story-INS-4.2-settings-json-generator.md:154`, `.claude/settings.json:2`).
2. Premissa “Claude Code nao expande `**`” está sem evidência técnica suficiente; granularidade atual pode ser por necessidade de exceções, não por limitação de glob.
3. “preserve user sections outside AIOS-managed permissions block” em JSON é vago (sem delimitador robusto).
4. `MultiEdit` citado sem confirmação no schema real do projeto (`docs/stories/epics/epic-installation-health/story-INS-4.2-settings-json-generator.md:87`).

**ACs Nao Testaveis:**
- “equivalent protection to current manual settings.json” sem métrica objetiva de equivalência.

**Riscos de Implementacao:**
1. CRITICO: gerar formato inválido para runtime.
2. ALTO: sobrescrever chaves de usuário por merge mal definido.

**Ajustes Recomendados:**
1. Reescrever ACs usando schema real (`permissions.deny/allow` como arrays de string).
2. Definir algoritmo determinístico de merge por chave (`permissions` gerenciado, demais chaves preservadas).
3. Formalizar teste de equivalência por conjunto normalizado de regras.
4. Remover `MultiEdit` do escopo inicial ou marcar como extensão opcional validada por feature-flag.

**Sizing Assessment:** 5 → 6 (justificativa: correção de schema + merge seguro + idempotência + cobertura)

---

### INS-4.3: Installer: Wire Generator + Validate Post-Install

**Veredito:** APROVADA COM AJUSTES

**Alignment com Plano:**
- Alinhado com INDEX: sim (Gap 1 residual)
- Alinhado com Architect Handoff: parcial
- Alinhado com Codex Findings: parcial

**Gaps Identificados:**
1. Documento afirma que hooks para `.husky` já são copiados; evidência real é `.claude/hooks` (`docs/stories/epics/epic-installation-health/story-INS-4.3-installer-settings-rules.md:102`, `packages/installer/src/wizard/ide-config-generator.js:539`).
2. Exemplo de `require('../../../.aios-core/...')` está frágil para path real de execução (`docs/stories/epics/epic-installation-health/story-INS-4.3-installer-settings-rules.md:120`).
3. Critério de validator como WARN precisa aderir ao modelo de severidade já existente no `post-install-validator`.

**ACs Nao Testaveis:**
- Nenhum crítico, mas faltam asserts objetivos de “ordem do hook point”.

**Riscos de Implementacao:**
1. ALTO: path relativo quebrar em cenários `targetDir != cwd`.
2. MEDIO: warning silencioso sem telemetria pode ocultar falha de proteção.

**Ajustes Recomendados:**
1. Corrigir narrativa de hooks (Claude hooks vs git hooks).
2. Definir adapter de path absoluto para chamar o gerador.
3. Adicionar teste de install com `targetDir` custom.

**Sizing Assessment:** 2 → 3 (justificativa: wiring + validação + robustez de path)

---

### INS-4.4: Installer: CLAUDE.md Template v5 (4 Novas Secoes)

**Veredito:** APROVADA COM AJUSTES

**Alignment com Plano:**
- Alinhado com INDEX: sim (Gap 4)
- Alinhado com Architect Handoff: sim
- Alinhado com Codex Findings: parcial

**Gaps Identificados:**
1. Story usa marcadores `FRAMEWORK-OWNED/PROJECT-CUSTOMIZED`, mas merger real interpreta `AIOS-MANAGED-START/END` (`packages/installer/src/merger/parsers/markdown-section-parser.js:7`).
2. Template atual usa `AIOS-MANAGED-*` (`.aios-core/product/templates/ide-rules/claude-rules.md:5`), enquanto produção usa `FRAMEWORK-OWNED` (`.claude/CLAUDE.md:7`): há mismatch de semântica.
3. Story assume seção “Graph Dashboard” existente na produção com esse heading; precisa normalização de heading real.

**ACs Nao Testaveis:**
- “sections inserted in logical order” sem ordem indexada objetiva.

**Riscos de Implementacao:**
1. ALTO: markers inconsistentes quebram merge incremental.
2. MEDIO: regressão em arquivos legados sem markers compatíveis.

**Ajustes Recomendados:**
1. Definir padrão único de marker para template + parser.
2. Se migrar para FRAMEWORK-OWNED, atualizar parser/merger explicitamente.
3. Adicionar teste de migração legacy -> novo marker.

**Sizing Assessment:** 3 → 4 (justificativa: além de conteúdo, exige alinhamento de protocolo de merge)

---

### INS-4.5: IDE Sync Integration — via API Programatica

**Veredito:** REQUER REESCRITA

**Alignment com Plano:**
- Alinhado com INDEX: sim (Gap 6)
- Alinhado com Architect Handoff: parcial
- Alinhado com Codex Findings: parcial

**Gaps Identificados:**
1. AC principal usa assinatura incorreta de `commandSync` (`docs/stories/epics/epic-installation-health/story-INS-4.5-ide-sync-integration.md:40` vs `.aios-core/infrastructure/scripts/ide-sync/index.js:213`).
2. `commandSync` não recebe `projectRoot` e opera por `process.cwd()` (`.aios-core/infrastructure/scripts/ide-sync/index.js:214`).
3. `commandValidate({ projectRoot })` também não existe nesse contrato (`.aios-core/infrastructure/scripts/ide-sync/index.js:338`).
4. Story cita `.mdc` para Cursor, mas transformer atual gera markdown (`.aios-core/infrastructure/scripts/ide-sync/transformers/cursor.js:93`).

**ACs Nao Testaveis:**
- ACs baseadas em parâmetros inexistentes de API atual.

**Riscos de Implementacao:**
1. CRITICO: integração não funciona com contrato atual.
2. ALTO: side effects de cwd se for adaptado sem encapsulamento.

**Ajustes Recomendados:**
1. Reescrever story para adapter explícito:
   - salvar `cwd`,
   - `process.chdir(targetRoot)`,
   - chamar `commandSync({ ide })` por IDE,
   - restaurar `cwd` em `finally`.
2. Alternativamente, criar API nova no `ide-sync` que aceite `projectRoot`.
3. Corrigir expectativa de output para formato real do Cursor transformer.

**Sizing Assessment:** 2 → 4 (justificativa: refatoração de contrato + segurança de estado global)

---

### INS-4.6: Entity Registry Bootstrap on Install

**Veredito:** APROVADA COM AJUSTES

**Alignment com Plano:**
- Alinhado com INDEX: sim (Gap 8)
- Alinhado com Architect Handoff: parcial
- Alinhado com Codex Findings: sim (reescopo bootstrap)

**Gaps Identificados:**
1. Task usa `time node ...` (não portátil em Windows/PowerShell) (`docs/stories/epics/epic-installation-health/story-INS-4.6-entity-registry-on-install.md:72`).
2. Exemplo `node populate-entity-registry.js targetRoot` conflita com script real, que não recebe `targetRoot` por argumento e usa `REPO_ROOT` interno (`.aios-core/development/scripts/populate-entity-registry.js:11`, `.aios-core/development/scripts/populate-entity-registry.js:612`).
3. Falta contrato claro para modo assíncrono (persistência de status/notificação).

**ACs Nao Testaveis:**
- “se >15s roda background” sem mecanismo de medição/replay estável para teste automatizado.

**Riscos de Implementacao:**
1. ALTO: execução no repo errado se `cwd` não for controlado.
2. MEDIO: processo assíncrono órfão.

**Ajustes Recomendados:**
1. Medir runtime via `process.hrtime` em wrapper Node cross-platform.
2. Chamada programática (`require(...).populate()`) com `cwd` explícito.
3. Registrar status em arquivo de instalação para consumo do doctor.

**Sizing Assessment:** 2 → 3 (justificativa: bootstrap + modo async + robustez cross-platform)

---

### INS-4.7: YAML Merger Strategy + Config Smart Merge (Phase 1)

**Veredito:** APROVADA COM AJUSTES

**Alignment com Plano:**
- Alinhado com INDEX: sim (Gap 5)
- Alinhado com Architect Handoff: sim (fase 1)
- Alinhado com Codex Findings: sim (necessidade de strategy YAML)

**Gaps Identificados:**
1. Contrato de retorno incorreto (`{merged,warnings}`) vs `MergeResult` real (`content/stats/changes`) (`docs/stories/epics/epic-installation-health/story-INS-4.7-config-smart-merge.md:47`, `packages/installer/src/merger/types.js:10`).
2. Exemplo de merge na story usa merge superficial de chaves, não cobre nested com semântica de array em `boundary.protected/exceptions`.
3. AC5 exige ordem “migrate -> merge -> write”, mas pipeline real de upgrade ainda precisa especificação formal.

**ACs Nao Testaveis:**
- “conflict” e “deprecated” precisam regra formal de detecção para nested keys.

**Riscos de Implementacao:**
1. CRITICO: quebrar contrato do merger e efeitos colaterais em strategies existentes.
2. ALTO: corrupção de YAML em edge cases de tipos (array/object/scalar).

**Ajustes Recomendados:**
1. Reescrever AC1 para contrato `MergeResult` nativo.
2. Definir merge policy por tipo (object deep, array preserve-target na fase 1).
3. Adicionar testes de regressão para `boundary.*` e `ide.*`.

**Sizing Assessment:** 5 → 6 (justificativa: strategy nova + integração upgrader + segurança de dados)

---

### INS-4.8: Unify Health-Check — Doctor + core/health-check + Task

**Veredito:** APROVADA COM AJUSTES

**Alignment com Plano:**
- Alinhado com INDEX: sim (Gap de unificação runtime)
- Alinhado com Architect Handoff: sim
- Alinhado com Codex Findings: sim (evitar 3º mecanismo)

**Gaps Identificados:**
1. Story fala em “via Bash tool”, mas task atual é `action: script` em YAML, não instrução de tool binding (`.aios-core/development/tasks/health-check.yaml:86`).
2. Mapa de governança precisa validação com Constituição real (risco de mapeamentos arbitrários).
3. Testes propostos em `packages/installer/tests/unit/` para behavior de task podem ficar desalinhados com local natural de teste das tasks.

**ACs Nao Testaveis:**
- “task works via Bash tool” (não há contrato técnico no task runtime atual para isso).

**Riscos de Implementacao:**
1. MEDIO: criar wrapper paralelo em vez de unificação real com `aios doctor --json`.
2. MEDIO: erro de interpretação de artigos da Constituição.

**Ajustes Recomendados:**
1. Trocar linguagem de AC5 para “task engine execution contract”, não “Bash tool”.
2. Definir schema estável do JSON de `doctor` consumido pela task.
3. Preservar `*hc` e remover somente `*doctor` (já existe hoje: `.aios-core/development/tasks/health-check.yaml:21`).

**Sizing Assessment:** 2 → 2 (justificativa: permanece enxuta após clarificação contratual)

---

## Validacao Cruzada

### 1) Dependency Chain

- **INS-4.3 <- INS-4.2:** Dependência conceitual correta, mas depende de corrigir contrato de API do generator (module + path robusto).
- **INS-4.8 <- INS-4.1:** Dependência correta; precisa congelar schema de `doctor --json` para parsing estável.

### 2) File Path Consistency

- `INS-4.1` (`.aios-core/core/doctor/`) + CLI (`bin/aios.js`) é viável no repo atual.
- `INS-4.2` path `.aios-core/infrastructure/scripts/generate-settings-json.js` é coerente com estrutura.
- `INS-4.3` exemplo de require relativo precisa correção.
- `INS-4.4` template path está correto: `.aios-core/product/templates/ide-rules/claude-rules.md`.

### 3) Test Location Consistency

- `packages/installer/tests/unit/doctor/` e `packages/installer/tests/unit/generate-settings-json/` são consistentes com estrutura existente.
- Para INS-4.8, considerar testes mais próximos do runtime de tasks (não só installer tests).

### 4) Sizing Total

- Proposto nas stories: **26 pts**.
- Recomendado após ajustes: **34 pts**.
- Maior risco de estouro: INS-4.2, INS-4.5, INS-4.7.

### 5) Coverage dos 10 Gaps do INDEX

- Cobertos diretamente: 1, 4, 5, 6, 7, 8.
- Cobertura parcial: 2 (rules residual), 10 (testes distribuídos sem matriz integrada).
- **Não cobertos com correção estrutural suficiente:** 3 (MEMORY sync no installer), 9 (hooks/husky no caminho `npx` ainda sem story de fix).

---

## Ajustes Obrigatorios (ordem sugerida)

1. Reescrever INS-4.5 com contrato real de `ide-sync`.
2. Reescrever INS-4.2 para schema real de `.claude/settings.json`.
3. Ajustar INS-4.7 para contrato `MergeResult`.
4. Corrigir premissas de hooks/rules em INS-4.3 e INS-4.1.
5. Adicionar cobertura explícita para gaps 3 e 9 (mesmo que como subtarefas obrigatórias em Wave 2/3).

