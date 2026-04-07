# Forge Dry Run Round 2 Checklist for Claude

> Foco: validação da segunda rodada de ajustes do `DRY_RUN`
> Data: 2026-04-04
> Escopo: `phase-0-discovery.md`, `workflows/dry-run.md`, `runner.md`

---

## Status Atual

- [x] A bifurcação do Step 9 em `phase-0-discovery.md` ficou clara
- [x] `DRY_RUN` agora tem caminho exclusivo sem `.lock`
- [x] A conversão para run real está melhor especificada
- [x] A validação de state foi realmente integrada ao fluxo principal do runner (Step 0 no Execution Protocol + referência cruzada)
- [x] Os novos status do dry-run (`converted`, `saved`, `cancelled`) foram propagados para o restante do Forge

---

## Checklist de Verificação

### 1. State Validation realmente executa

- [x] Verificar se `skills/forge/runner.md` seção `1.1 State Validation` não está apenas solta como documentação
  - **Fix:** Criado `Step 0: State Validation Gate` na seção `Execution Protocol` do runner.md. Texto explícito: "Esta é a ÚNICA chamada de Section 1.1."
- [x] Amarrar explicitamente essa validação ao lifecycle antes da primeira fase real de execução
  - **Fix:** Step 0 define: FULL_APP → antes Phase 1, SINGLE_FEATURE/BUG_FIX → antes Phase 3, RESUME → antes de retomar.
- [x] Garantir no texto do runner onde essa validação acontece
- [x] Evitar depender de inferência implícita do agente — Step 0 é prescritivo, não sugestivo
- [x] Referência explícita na seção `Execution Protocol` — Step 0 vem antes do Step 1

### 2. `source_dry_run` tem consumo real suficiente

- [x] Confirmar se o uso descrito de `source_dry_run` em `runner.md` é suficiente
  - **Fix:** 3 pontos de consumo: (1) mensagem visual no Step 0, (2) comparação na Phase 4, (3) learning no forge-memory.md
- [x] Verificar se há clareza sobre onde o learning de divergência de estimativa será registrado
  - **Fix:** Nova categoria `estimation_accuracy` no forge-memory.md Save Protocol Step 1.
- [x] Confirmar se esse learning conversa de forma consistente com `forge-memory`
  - **Fix:** dry-run.md SIM-2 agora lê `estimation_accuracy` do learnings.yaml para calibrar estimativas futuras.
- [x] Validar se a mensagem visual aparece em momento definido do fluxo
  - **Fix:** Aparece no Step 0 (State Validation Gate) — antes da primeira fase de execução.

### 3. Novos status do dry-run

- [x] Revisar impacto de `status: "converted"` no mecanismo de resume — NÃO resumable (Section 6.0)
- [x] Revisar impacto de `status: "saved"` no mecanismo de resume — NÃO resumable, aparece em listagens
- [x] Revisar impacto de `status: "cancelled"` no mecanismo de resume — NÃO resumable, ignorado em listagens
- [x] Verificar se listagens de runs ativos/interrompidos tratam corretamente esses status
  - **Fix:** SKILL.md §3 Step 4, SKILL.md help listing, phase-0-discovery.md Step 3 — todos atualizados para filtrar `status == "running"` APENAS
- [x] Confirmar se algum lugar assume apenas `running`/`completed`
  - **Fix:** replay.md já usava `status == "completed"` (correto). forge-feedback.md já usava `status == "completed"` (correto). Todos os outros pontos foram atualizados.

### 4. Teste comportamental recomendado

- [ ] Rodar `/forge dry-run "app de gerenciamento de tarefas"` em projeto de teste
- [ ] Confirmar que o dry-run:
  - cria pasta do run
  - cria `state.json`
  - cria `context-pack.json`
  - não cria `.aios/forge-runs/.lock`
- [ ] Escolher `Executar de verdade`
- [ ] Confirmar que o novo run real:
  - recebe novo `run_id`
  - cria `.lock`
  - contém `source_dry_run`
  - herda os campos esperados do dry-run
- [ ] Confirmar que o dry-run original muda para `status: "converted"`

---

## Arquivos para Revisar

- `skills/forge/phases/phase-0-discovery.md`
- `skills/forge/workflows/dry-run.md`
- `skills/forge/runner.md`

---

## Pedido Objetivo para Claude

- [x] Verificar se a segunda rodada realmente fechou o fluxo do `DRY_RUN` — **SIM, fechou na rodada 3**
- [x] Corrigir qualquer ponto onde a validação de state ainda esteja só documental — **Step 0 no Execution Protocol + referência cruzada explícita**
- [x] Revisar a compatibilidade dos novos status do dry-run com resume, listagens e filtros de run — **6 pontos atualizados (SKILL.md x2, phase-0-discovery.md, runner.md Section 6.0, replay.md confirmado, forge-feedback.md confirmado)**

## Resumo das Mudanças (Rodada 3)

| Arquivo | Mudança |
|---------|---------|
| `runner.md` | Novo Step 0 (State Validation Gate) no Execution Protocol. Nova Section 6.0 (Run Status Model com 5 status). Resume atualizado para usar Step 0. |
| `forge-memory.md` | Nova categoria `estimation_accuracy` no Save Protocol. Loop fechado: dry-run estima → run real executa → memory salva ratio → próximo dry-run calibra. |
| `dry-run.md` | SIM-2 agora consulta learnings de `estimation_accuracy` para calibrar estimativas. |
| `phase-0-discovery.md` | Step 3 filtro atualizado: `status == "running"` em vez de `status != "completed"`. |
| `SKILL.md` | §3 Step 4 e help listing atualizados para filtrar apenas `status == "running"`. |
