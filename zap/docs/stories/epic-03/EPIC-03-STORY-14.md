# EPIC-03-STORY-14 — Get Project Detail API
**Story ID:** ZAP-014
**Epic:** EPIC-03 — Project & Group Management
**Sprint:** 2 | **Phase:** MVP
**Priority:** 🟠 HIGH
**Story Points:** 2
**Status:** Ready
**Assigned to:** @qa (Quinn)
**Prepared by:** River (Scrum Master)
**Implementation Order:** Day 1 of EPIC-03 (QA verification batch)

---

## User Story

**As a** tenant,
**I want** to fetch full project details via the API including phases and their nested groups,
**so that** the UI can render the phase board with all groups pre-loaded in a single request.

---

## Context & Background

⚠️ **API PRÉ-IMPLEMENTADA — ESTE ENDPOINT JÁ EXISTE.**

`apps/api/src/routes/projects.ts` foi implementado proativamente durante EPIC-02. O endpoint `GET /api/v1/projects/:id` retorna o projeto completo com connection, phases e groups aninhados, ordenados por posição.

**Esta story NÃO requer desenvolvimento.** Tasks = SOMENTE verificação QA.

**Comportamento implementado:**
- Retorna projeto com `connection`, `phases[]`, e `groups[]` aninhados dentro de cada fase
- Fases ordenadas por `order ASC` (⚠️ campo é `order`, starts at 0 — não `position`)
- Retorna 404 se projeto não pertencer ao tenant

---

## Acceptance Criteria

### AC-014.1 — Returns project with connection, phases, and groups
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/v1/projects/$PROJECT_ID

# Expected: HTTP 200
# Response shape (campos reais confirmados em projects.ts):
# {
#   "data": {
#     "id": "uuid",
#     "name": "Funil Black Friday",
#     "status": "active",
#     "connection": { "id": "...", "display_name": "...", "status": "...", "phone": "..." },
#     "phases": [
#       {
#         "id": "uuid",
#         "name": "Leads",
#         "order": 0,                  ⚠️ "order" (não "position"), starts at 0
#         "capacity_per_group": 1024,  ⚠️ "capacity_per_group" (não "capacity")
#         "groups": [ { "id": "...", "name": "...", "participant_count": 0, "capacity": 1024, "status": "active" } ]
#         # ⚠️ groups retorna: id, name, participant_count, capacity, status
#         # wa_group_id e wa_invite_link NÃO são retornados até ZAP-018 Task 1.6 ser implementado
#       },
#       ...
#     ]
#   }
# }
```

### AC-014.2 — Phases ordered by order ASC
```
⚠️ Campo é "order" (não "position"), começa em 0.
In the response, phases[] MUST be ordered:
  order: 0 first (Leads)
  order: 1 second (Aquecimento)
  order: 2 third (Compradores)
Any custom phases must also respect order-field ordering.
```

### AC-014.3 — Groups nested within their respective phase
```
Each phase object MUST contain a groups[] array.
Groups MUST appear in the phase they belong to (matching phase_id).
Groups from phase A MUST NOT appear in phase B.
```

### AC-014.4 — Returns 404 if project not found or not owned by tenant
```bash
# Non-existent project:
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/v1/projects/00000000-0000-0000-0000-000000000000
# Expected: HTTP 404

# Project belonging to different tenant:
curl -H "Authorization: Bearer $OTHER_TOKEN" \
  http://localhost:3001/api/v1/projects/$PROJECT_ID
# Expected: HTTP 404 (not 403 — information hiding)
```

---

## Dev Notes

⚠️ **NÃO REIMPLEMENTAR CÓDIGO EXISTENTE.**

Arquivo: `apps/api/src/routes/projects.ts`
Registrado: `apps/api/src/index.ts` linha 44

Para verificar grupos aninhados: registrar pelo menos 1 grupo em uma fase antes de testar (usar AC-016 da ZAP-016).

---

## Tasks / Subtasks

### Task 1: QA Verification — AC-014.1 (project detail shape)
- [ ] 1.1 GET /api/v1/projects/:id → HTTP 200
- [ ] 1.2 Verificar `connection` objeto presente com campos corretos
- [ ] 1.3 Verificar `phases` array presente com objetos de fase

### Task 2: QA Verification — AC-014.2 (phases ordering)
- [ ] 2.1 Confirmar fases ordenadas: order 0 primeiro (Leads), 1 segundo (Aquecimento), 2 terceiro (Compradores)

### Task 3: QA Verification — AC-014.3 (groups nested)
- [ ] 3.1 Registrar um grupo em Fase "Aquecimento" via POST /groups
- [ ] 3.2 GET project detail → verificar grupo aparece em `phases[1].groups` (Aquecimento)
- [ ] 3.3 Verificar grupo NÃO aparece em outras fases

### Task 4: QA Verification — AC-014.4 (404)
- [ ] 4.1 UUID inexistente → HTTP 404
- [ ] 4.2 Projeto de outro tenant → HTTP 404

---

## Definition of Done

- [ ] AC-014.1: GET /projects/:id returns project with connection + phases + groups
- [ ] AC-014.2: Phases ordered by order ASC (field "order", starts at 0)
- [ ] AC-014.3: Groups nested within their respective phase
- [ ] AC-014.4: Returns 404 if not found or not owned by tenant
- [ ] TypeScript: 0 errors in apps/api (no regression)

---

## File List (update as you work)

| File | Action | Notes |
|------|--------|-------|
| `apps/api/src/routes/projects.ts` | VERIFIED | Pre-implemented — QA only |

---

## Dev Agent Record

### Debug Log

### Completion Notes

### Agent Model Used

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-19 | River (SM) | Story created — QA-only verification (API pré-implementada durante EPIC-02) |
| 2026-02-19 | Pax (PO) | Validated — GO. Corrigido: "order" (não "position"), "capacity_per_group", "display_name", grupos não retornam wa_group_id até ZAP-018 Task 1.6. Status: Draft → Ready |

---

*Source: docs/prd/epic-03-prd.md §10 AC-014*
*Implementation: apps/api/src/routes/projects.ts (pre-built)*
