# EPIC-03-STORY-17 — List Groups & Group Detail API
**Story ID:** ZAP-017
**Epic:** EPIC-03 — Project & Group Management
**Sprint:** 2 | **Phase:** MVP
**Priority:** 🟠 HIGH
**Story Points:** 2
**Status:** Ready
**Assigned to:** @qa (Quinn)
**Prepared by:** River (Scrum Master)
**Implementation Order:** Day 2 of EPIC-03 (QA verification batch)

---

## User Story

**As a** tenant,
**I want** to list groups, get group detail with participants, and update group properties via the API,
**so that** the UI can display groups in phase boards and manage their lifecycle.

---

## Context & Background

⚠️ **API PRÉ-IMPLEMENTADA — ESTE ENDPOINT JÁ EXISTE.**

`apps/api/src/routes/groups.ts` foi implementado proativamente durante EPIC-02. Os endpoints `GET /api/v1/groups`, `GET /api/v1/groups/:id`, e `PATCH /api/v1/groups/:id` estão completos.

**Esta story NÃO requer desenvolvimento.** Tasks = SOMENTE verificação QA.

**Comportamento implementado:**
- `GET /api/v1/groups` — lista grupos (arquivados excluídos por padrão), suporta `?projectId=` e `?phaseId=`
- `GET /api/v1/groups/:id` — detalhe com fase e participantes (apenas `removed_at IS NULL`)
- `PATCH /api/v1/groups/:id` — atualiza name, capacity, status, phaseId
- `GET /api/v1/groups/:id/participants` — apenas participantes ativos

---

## Acceptance Criteria

### AC-017.1 — GET /groups lists groups (archived excluded by default)
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/v1/groups

# Expected: HTTP 200, { "data": [...groups] }
# archived groups (status='archived') MUST NOT appear
```

### AC-017.2 — Supports ?projectId= and ?phaseId= filter params
```bash
# Filter by project:
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3001/api/v1/groups?projectId=$PROJECT_ID"
# Expected: only groups belonging to $PROJECT_ID

# Filter by project + phase:
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3001/api/v1/groups?projectId=$PROJECT_ID&phaseId=$PHASE_ID"
# Expected: only groups in that specific phase
```

### AC-017.3 — GET /groups/:id returns group detail with phase and participants
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/v1/groups/$GROUP_ID

# Expected: HTTP 200
# Response shape:
# {
#   "data": {
#     "id": "uuid",
#     "name": "...",
#     "wa_group_id": "...",
#     "invite_link": "...",
#     "capacity": 1024,
#     "participant_count": 45,
#     "status": "active",
#     "phase": { "id": "...", "name": "Leads", "position": 1 },
#     "participants": [ { "id": "...", "wa_jid": "...", "joined_at": "..." } ]
#   }
# }
```

### AC-017.4 — Participants array includes only active participants
```
In GET /groups/:id response:
  participants[] MUST only include entries where removed_at IS NULL
  Participants with removed_at set (left the group) MUST NOT appear
  ⚠️ Dados buscados da tabela "group_participants" (não "participants") — confirmado em groups.ts
```

### AC-017.5 — PATCH /groups/:id updates name, capacity, status, or phaseId
```bash
# Move group to different phase:
curl -X PATCH http://localhost:3001/api/v1/groups/$GROUP_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"phaseId": "'$PHASE_AQUECIMENTO_ID'"}'
# Expected: HTTP 200, group.phase_id updated

# Update capacity:
curl -X PATCH http://localhost:3001/api/v1/groups/$GROUP_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"capacity": 500}'
# Expected: HTTP 200, group.capacity === 500

# Archive group:
curl -X PATCH http://localhost:3001/api/v1/groups/$GROUP_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "archived"}'
# Expected: HTTP 200, group.status === 'archived'
# Verify: group no longer appears in GET /groups list
```

---

## Dev Notes

⚠️ **NÃO REIMPLEMENTAR CÓDIGO EXISTENTE.**

Arquivo: `apps/api/src/routes/groups.ts`
Registrado: `apps/api/src/index.ts` linha 45

**Nota sobre AC-017.4:** Para testar participantes ativos vs removidos, você precisaria inserir registros na tabela `group_participants` diretamente (via Supabase dashboard ou SQL) com e sem `removed_at`. ⚠️ Tabela real é `group_participants` (não `participants`) — confirmado em groups.ts. Os webhooks de `group.participants.update` são EPIC-06 — participants são gerenciados por eles em produção.

---

## Tasks / Subtasks

### Task 1: QA Verification — AC-017.1 (list groups)
- [ ] 1.1 GET /api/v1/groups → HTTP 200, array
- [ ] 1.2 Arquivar um grupo via PATCH → verificar que não aparece na lista

### Task 2: QA Verification — AC-017.2 (filter params)
- [ ] 2.1 GET /groups?projectId=X → somente grupos do projeto X
- [ ] 2.2 GET /groups?projectId=X&phaseId=Y → somente grupos da fase Y no projeto X
- [ ] 2.3 Tenant isolation: GET /groups → somente grupos do tenant autenticado

### Task 3: QA Verification — AC-017.3 (group detail)
- [ ] 3.1 GET /groups/:id → HTTP 200 com shape correto
- [ ] 3.2 Verificar campo `phase` presente com name e position
- [ ] 3.3 Verificar campo `participants` presente (pode ser array vazio se nenhum participante)

### Task 4: QA Verification — AC-017.4 (active participants only)
- [ ] 4.1 Se possível: inserir participante com removed_at SET → verificar que não aparece
- [ ] 4.2 Confirmar que `GET /groups/:id/participants` endpoint também existe

### Task 5: QA Verification — AC-017.5 (PATCH group)
- [ ] 5.1 PATCH phaseId → grupo move para nova fase (verificar via GET detail)
- [ ] 5.2 PATCH capacity → capacity atualizado
- [ ] 5.3 PATCH status='archived' → grupo removido da lista

---

## Definition of Done

- [ ] AC-017.1: GET /groups lists groups (archived excluded by default)
- [ ] AC-017.2: Supports ?projectId= and ?phaseId= filter params
- [ ] AC-017.3: GET /groups/:id returns group detail with phase and participants
- [ ] AC-017.4: Participants array includes only active participants (removed_at IS NULL)
- [ ] AC-017.5: PATCH /groups/:id updates name, capacity, status, or phaseId
- [ ] TypeScript: 0 errors in apps/api (no regression)

---

## File List (update as you work)

| File | Action | Notes |
|------|--------|-------|
| `apps/api/src/routes/groups.ts` | VERIFIED | Pre-implemented — QA only |

---

## Dev Agent Record

### Debug Log

### Completion Notes

### Agent Model Used

---

## QA Results

**Revisor:** Quinn (@qa) | **Data:** 2026-02-20 | **Veredicto:** ⚠️ CONCERNS

### Code Review — Static Analysis

| AC | Código | Status |
|----|--------|--------|
| AC-017.1 | `.neq('status', 'archived')` — grupos arquivados excluídos da listagem. `.order('created_at', { ascending: false })`. Tenant isolation via `.eq('tenant_id', tenantId)`. | ✅ |
| AC-017.2 | `if (projectId) query.eq('project_id', projectId)` e `if (phaseId) query.eq('phase_id', phaseId)` — filtros opcionais aplicados corretamente. | ✅ |
| AC-017.3 | `GET /:id` retorna shape com `phase:project_phases(id, name, order)` e `participants:group_participants(id, phone, joined_at, removed_at)`. Dados presentes. **Discrepâncias de documentação vs implementação real** (ver LOWs abaixo). | ⚠️ |
| AC-017.4 | Nested select `participants:group_participants(id, phone, joined_at, removed_at)` NÃO aplica filtro `removed_at IS NULL` — retorna **todos** os participantes incluindo removidos. Endpoint dedicado `GET /:id/participants` (linha 193-202) usa `.is('removed_at', null)` corretamente. | ❌ |
| AC-017.5 | `PATCH /:id` aceita `name`, `capacity`, `status`, `phaseId` (mapeado para `phase_id`). Tenant isolation confirmada. | ✅ |

### TypeScript
- `npm run typecheck -w apps/api` → **0 erros** ✅
- `npm run typecheck -w apps/web` → **0 erros** ✅

### Concerns

- **MEDIUM — AC-017.4: Participantes removidos incluídos em GET /:id:** `groups.ts:112` — o nested select `participants:group_participants(id, phone, joined_at, removed_at)` não filtra `removed_at IS NULL`. PostgREST não suporta filtro IS NULL em nested selects inline. Fix recomendado: aplicar filtro no handler antes de retornar: `if (data.participants) data.participants = data.participants.filter((p) => !p.removed_at)`. O endpoint dedicado `GET /:id/participants` (linha 193-202) já implementa corretamente com `.is('removed_at', null)`.

- **LOW — Discrepâncias de documentação no AC-017.3:** Story doc documenta campos que diferem do código:
  - `"phase.position"` → real é `"phase.order"` (campo da tabela `project_phases`)
  - `"participants[].wa_jid"` → real é `"participants[].phone"` (campo da tabela `group_participants`)
  - `"invite_link"` → real é `"wa_invite_link"` (campo da tabela `groups`)
  - Código está correto — documentação da story precisa ser corrigida para evitar confusão no frontend.

### Manual Tests Pendentes
- AC-017.1: Requer servidor ativo para verificar `.neq('status', 'archived')` em runtime
- AC-017.4: Requer inserção manual de `group_participants` com `removed_at IS NULL` e `removed_at SET` para validar comportamento

### Gate Decision
**⚠️ CONCERNS** — 1 concern MEDIUM (participantes removidos incluídos em `GET /:id`), 1 concern LOW (discrepâncias de doc). O concern MEDIUM viola diretamente AC-017.4 mas o endpoint dedicado `GET /:id/participants` funciona corretamente. Não bloqueante para MVP dado que a UI usa o endpoint dedicado ou pode filtrar client-side. Recomendado fix antes de produção.

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-19 | River (SM) | Story created — QA-only verification (API pré-implementada durante EPIC-02) |
| 2026-02-19 | Pax (PO) | Validated — GO. Corrigido: tabela "group_participants" (não "participants"). Status: Draft → Ready |
| 2026-02-20 | Quinn (QA) | QA review — Veredicto: CONCERNS. 1 MEDIUM (participantes removidos em GET /:id), 1 LOW (discrepâncias de doc) |
| 2026-02-20 | Dex (Dev) | Fix MEDIUM aplicado — post-filter `removed_at === null` em `GET /:id` (groups.ts:122). TypeScript: 0 erros. |

---

*Source: docs/prd/epic-03-prd.md §10 AC-017*
*Implementation: apps/api/src/routes/groups.ts (pre-built)*
*Registration: apps/api/src/index.ts line 45*
