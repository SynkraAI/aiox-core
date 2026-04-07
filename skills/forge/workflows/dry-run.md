# Workflow: Dry Run

> Simula um Forge run completo sem executar nenhum agente. Preview antes de comprometer.

---

## When to Use

- Usuário quer saber "o que o Forge faria?" antes de rodar de verdade
- Estimar quantidade de stories, agentes envolvidos, tempo esperado
- Verificar se o modo correto seria selecionado para o pedido
- Planejar sem comprometer — zero side effects

---

## Pipeline

```
DISCOVERY (real) → ECOSYSTEM_SCAN (real) → SIMULATE_EXECUTION (read-only) → REPORT → DECISION
```

**Modelo híbrido:** Phase SIM-1 executa Discovery e Ecosystem Scan REAIS (perguntas ao usuário, scan de minds/skills/squads). A partir de SIM-2, tudo é simulação read-only — nenhum agente é despachado, nenhum código é gerado.

**Hook behavior:** O plugin system boota normalmente (before:run, lifecycle). O ecosystem-scanner roda no after:phase:0 real. Mas hooks de fases simuladas (Phase 1-5) NÃO disparam — a simulação apenas LISTA quais plugins disparariam, sem executá-los.

---

## Execution

### Phase SIM-1: Simulated Discovery

1. **Run Phase 0 Discovery (REAL)** — EXATAMENTE como o Discovery normal (perguntas ao usuário, numbered options). Cria state.json com `mode: "DRY_RUN"` e `status: "running"`, mas NÃO cria lock file (não bloqueia outros runs).

2. **Run Ecosystem Scan (REAL)** — o ecosystem-scanner plugin dispara normalmente no hook `after:phase:0` (lê minds, skills, squads). O resultado é salvo no state.json sob `plugins.ecosystem_scan` como em qualquer run normal. Isso é necessário para que o relatório de simulação mostre dados reais do ecossistema.

3. **Detect mode** — com base nas respostas, detectar qual modo o Forge usaria:
   - Se descrição sugere app completo → FULL_APP
   - Se menciona feature/funcionalidade → SINGLE_FEATURE
   - Se menciona bug/erro → BUG_FIX
   - etc.

4. **Load workflow file** — ler o workflow correspondente ao modo detectado (read-only) para saber quais fases e agentes seriam usados.

### Phase SIM-2: Simulated Execution Plan

Para cada fase do workflow detectado, SIMULAR (sem executar):

1. **Agentes por fase:**
   - Ler a tabela de Agent Mapping do workflow
   - Listar quais agentes seriam despachados em cada fase

2. **Plugins por fase (SIMULADO — ler sem executar):**
   - Ler `plugins/*.yaml`, filtrar por `activation.modes` do modo DETECTADO (não DRY_RUN)
   - Para cada hook point em cada fase, listar quais plugins DISPARARIAM se o run fosse real
   - NÃO executar nenhum plugin — apenas reportar quais seriam ativados

3. **Quality Gates:**
   - Verificar quais extended quality gates ativariam baseado na detecção:
     - `package.json` com test script? → bulletproof-test ativaria
     - `tailwind.config`? → tokenizacao ativaria
     - Cloud infra? → cloud-pentest ativaria (se enabled)

4. **Story Estimate:**
   - Baseado na descrição + modo:
     - FULL_APP: 5-10 stories total
     - SINGLE_FEATURE: 1-3 stories
     - BUG_FIX: 1 story
   - **Se `mvp.mode` = "all":** total = MVP (não dividir). Mostrar "~5-10 stories (tudo MVP)"
   - **Se `mvp.mode` = "defined" ou "assisted":** separar MVP (3-5) e post-MVP (2-5). Mostrar "~3-5 MVP + ~2-5 post-MVP"
   - **NUNCA** mostrar o range de MVP como se fosse o total quando `mvp.mode = "all"`
   - **Calibração via Forge Memory (se disponível):**
     Checar `.aios/memory/forge/learnings.yaml` por entries com `category: "estimation_accuracy"` neste projeto.
     Se existirem: usar `accuracy_ratio` médio para ajustar a estimativa genérica.
     Exemplo: se o ratio médio é 1.8 (estimou 5, foram 9), multiplicar estimativa por 1.8.
     Learnings de estimation_accuracy têm precedência sobre ranges genéricos.

5. **Checkpoint Estimate:**
   - Calcular checkpoints obrigatórios (Discovery, MVP Gate, Deploy)
   - Calcular checkpoints automáticos (a cada N stories, se quality gate falhar)

### Phase SIM-3: Simulation Report

Apresentar o resultado formatado:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🔍 DRY RUN — Simulação Completa
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Modo detectado:     {FULL_APP | SINGLE_FEATURE | ...}
  Workflow:           {workflow file name}

  📋 Fases planejadas:
    ✅ Phase 0: Discovery
    ○ Phase 1: Spec Pipeline (@pm + @architect + @analyst)
    ○ Phase 2: Story Factory (@sm + @po)
    ○ Phase 3: Build Loop (@dev + @qa) — ~{N} stories
    ○ Phase 4: Integration (@qa + @pedro-valerio + @kaizen)
    ○ Phase 5: Deploy (@devops)

  🤖 Agentes envolvidos: {list}

  🔌 Plugins que disparariam:
    ├── lifecycle (todas as fases)
    ├── ecosystem-scanner (Phase 0+)
    ├── forge-memory (before/after run)
    ├── bulletproof-test (Phase 4) {se detectado}
    ├── vulnerability-scanner (Phase 4)
    └── quest-sync (after run)

  📊 Estimativas:
    Stories:       ~{N} total (~{M} MVP)
    Checkpoints:   {N} paradas humanas
    Quality Gates:  {N} gates ativos

  🌐 Ecosystem:
    Minds relevantes:  {list or "nenhum encontrado"}
    Skills disponíveis: {list or "nenhum encontrado"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Phase SIM-4: Decision

```
O que quer fazer?

> 1. **Executar de verdade** — iniciar o Forge run com essas configurações
> 2. **Salvar plano** — exportar como .md para referência
> 3. **Ajustar e simular de novo** — mudar algo e re-simular
> 4. **Cancelar** — não fazer nada
```

- **Opção 1 — Converter para run real:**
  Executar o **Caminho B** de `phase-0-discovery.md` Step 9 com estas adições:
  1. Gerar NOVO `run_id` = `forge-{slug}-{YYYYMMDD-HHmm}` (timestamp ATUAL)
  2. Checar `.lock` (Caminho B passo 1)
  3. Criar `.lock` (Caminho B passo 3)
  4. Criar run folder (Caminho B passo 4)
  5. Criar state.json com:
     - `mode` = modo detectado (ex: FULL_APP)
     - `status` = "running"
     - Campos `discovery`, `tech_decisions`, `mvp`, `core_atom` copiados do dry-run state
     - Campo `plugins.ecosystem_scan` copiado do dry-run state
     - **Campo `source_dry_run` obrigatório:**
       ```json
       "source_dry_run": {
         "run_id": "{dry-run-original-run-id}",
         "detected_mode": "FULL_APP",
         "simulation_estimate": { "stories": 8, "agents": 9, "plugins": 4 }
       }
       ```
  6. Copiar `context-pack.json` do dry-run para o novo run folder
  7. Marcar dry-run original como `status: "converted"` no seu state.json
  8. Prosseguir para Phase 1 normalmente

  **Validação:** Ao iniciar Phase 1, o runner DEVE verificar que o novo state.json tem todos os campos obrigatórios (`discovery`, `tech_decisions`, `mvp`, `core_atom`, `plugins.ecosystem_scan`). Se algum estiver faltando, HALT com mensagem de erro — não prosseguir com estado incompleto.

- **Opção 2:** Salvar o relatório como `.aios/forge-runs/{run_id}/simulation-report.md`. Marcar dry-run como `status: "saved"`.
- **Opção 3:** Voltar ao Phase SIM-1 com perguntas específicas
- **Opção 4:** Marcar dry-run como `status: "cancelled"`. Encerrar.

---

## Agent Mapping

| Phase | Primary Agent | Note |
|-------|--------------|------|
| SIM-1 | Forge (self) | Discovery questions only |
| SIM-2 | Forge (self) | Read-only analysis |
| SIM-3 | Forge (self) | Report generation |
| SIM-4 | Forge (self) | User decision |

**ZERO external agent dispatches.** The entire workflow is read-only (except Discovery + Ecosystem Scan in SIM-1).

---

## Progress Display

```
  ✅ SIM-1: Discovery — respostas coletadas
  ✅ SIM-1: Ecosystem Scan — {N} recursos encontrados
  🔄 SIM-2: Simulando execução...
  ○ SIM-3: Relatório
  ○ SIM-4: Decisão
```

---

## Quest Integration

| Quest World | Forge Phase | XP |
|-------------|------------|-----|
| N/A | N/A | 0 |

Dry Run não gera XP no Quest — é uma simulação, não execução real.
Se o usuário escolher "Executar de verdade" (opção 1), o run real que se inicia gera XP normalmente.

---

## Quality Gates

- No quality gates — this is a simulation, not an execution
- If user chooses "Executar de verdade" (option 1), the real workflow's gates apply

---

## State Management

- **Creates** `.aios/forge-runs/{run_id}/` with `state.json` (mode: "DRY_RUN")
- **NUNCA cria `.aios/forge-runs/.lock`** — dry-run é simulação, não bloqueia outros runs. Lock só é criado se o usuário escolher "Executar de verdade" (opção 1 do SIM-4), e nesse caso é o NOVO run real que cria o lock, não o dry-run.
- `state.json` contains Discovery answers, ecosystem scan results, and simulation report
- If user chooses option 2 (save plan): export simulation report as `.aios/forge-runs/{run_id}/simulation-report.md`
- If user chooses option 1 (execute): um NOVO run é criado (ver detalhes na seção SIM-4 opção 1 acima)

---

## Error Recovery

Minimal — since no agents are dispatched, the only errors are:
- YAML parse failures (ecosystem scan) → skip and note in report
- Missing workflow files → report the issue, suggest `/forge help`
