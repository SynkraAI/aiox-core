# EPIC-03-STORY-16 — Register Group API
**Story ID:** ZAP-016
**Epic:** EPIC-03 — Project & Group Management
**Sprint:** 2 | **Phase:** MVP
**Priority:** 🔴 CRITICAL
**Story Points:** 3
**Status:** Ready
**Assigned to:** @qa (Quinn)
**Prepared by:** River (Scrum Master)
**Implementation Order:** Day 2 of EPIC-03 (QA verification batch)

---

## User Story

**As a** tenant,
**I want** to register a WhatsApp group into a project via the API,
**so that** the system automatically fetches the invite link from Evolution and assigns the group to a phase.

---

## Context & Background

⚠️ **API PRÉ-IMPLEMENTADA — ESTE ENDPOINT JÁ EXISTE.**

`apps/api/src/routes/groups.ts` foi implementado proativamente durante EPIC-02. Os endpoints `POST /api/v1/groups` e `POST /api/v1/groups/:id/refresh-link` estão completos.

**Esta story NÃO requer desenvolvimento.** Tasks = SOMENTE verificação QA.

**Comportamento implementado:**
- `POST /api/v1/groups` com Zod validation
- Auto-fetches invite link via `sessionManager.getGroupInviteLink(tenantId, connectionId, waGroupId)`
- Retorna 409 se `waGroupId` já registrado para este tenant
- Retorna 404 se `projectId` não pertencer ao tenant
- `POST /api/v1/groups/:id/refresh-link` renova o invite link via Evolution

**Zod schema (⚠️ campos são camelCase, confirmado em groups.ts:41-46):**
```typescript
{
  waGroupId: z.string().min(1),              // ⚠️ camelCase! WhatsApp group JID (e.g. 120363XXX@g.us)
  projectId: z.string().uuid(),              // ⚠️ camelCase! required
  phaseId: z.string().uuid().optional(),     // ⚠️ camelCase! optional
  name: z.string().min(1).max(200),          // ⚠️ REQUIRED (não optional!) — max 200
  capacity: z.number().int().min(1).max(1024).default(1024) // optional, default 1024
}
```

---

## Acceptance Criteria

### AC-016.1 — Register group with waGroupId into a project
```bash
# ⚠️ API usa camelCase para todos os campos (confirmado em groups.ts:41-46)
# ⚠️ "name" é OBRIGATÓRIO (z.string().min(1).max(200)) — não enviar sem name
curl -X POST http://localhost:3001/api/v1/groups \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "waGroupId": "120363XXXXXXXXXX@g.us",
    "projectId": "'$PROJECT_ID'",
    "phaseId": "'$PHASE_LEADS_ID'",
    "name": "Nome do Grupo"
  }'

# Expected: HTTP 201
# Response: { "data": { "id": "uuid", "name": "...", "wa_group_id": "...", "wa_invite_link": "...", ... } }
# ⚠️ Campo retornado é "wa_invite_link" (não "invite_link")
```

### AC-016.2 — Auto-fetches invite link
```
After POST /api/v1/groups succeeds:
  response.data.wa_invite_link MUST be non-null and non-empty
  ⚠️ Campo é "wa_invite_link" (não "invite_link") — confirmado em groups.ts
  Format: "https://chat.whatsapp.com/XXXXX"
  (fetched automatically by sessionManager.getGroupInviteLink)
```

### AC-016.3 — Returns 409 if waGroupId already registered for this tenant
```bash
# Register same group twice (⚠️ camelCase + name obrigatório):
curl -X POST http://localhost:3001/api/v1/groups \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"waGroupId": "120363XXXXXXXXXX@g.us", "projectId": "'$PROJECT_ID'", "name": "Nome"}'
# Expected: HTTP 409 Conflict
```

### AC-016.4 — Returns 404 if projectId not found or not owned by tenant
```bash
# ⚠️ camelCase:
curl -X POST http://localhost:3001/api/v1/groups \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"waGroupId": "test@g.us", "projectId": "00000000-0000-0000-0000-000000000000", "name": "Test"}'
# Expected: HTTP 404
```

### AC-016.5 — POST /groups/:id/refresh-link refreshes invite link
```bash
curl -X POST http://localhost:3001/api/v1/groups/$GROUP_ID/refresh-link \
  -H "Authorization: Bearer $TOKEN"

# Expected: HTTP 200
# Response: { "data": { "wa_invite_link": "https://chat.whatsapp.com/NEW_LINK" } }
# ⚠️ Campo é "wa_invite_link" (não "invite_link")
# Verify: new link differs from original (or same if unchanged by WhatsApp)
```

### AC-016.6 — Returns correct response shape with HTTP 201
```
POST /api/v1/groups success response MUST include:
  - id (UUID)
  - name (string)
  - wa_group_id (string)
  - wa_invite_link (string, auto-fetched) ⚠️ "wa_invite_link" (não "invite_link")
  - capacity (integer, default 1024)
  - participant_count (integer, 0 on create)
HTTP status: 201 Created
```

---

## Dev Notes

⚠️ **NÃO REIMPLEMENTAR CÓDIGO EXISTENTE.**

Arquivo: `apps/api/src/routes/groups.ts`
Registrado: `apps/api/src/index.ts` linha 45

**ATENÇÃO para AC-016.2:** O invite link é buscado via Evolution API. Se a conexão WhatsApp não estiver ativa, o endpoint pode retornar `wa_invite_link: null` ou um erro. Para testar corretamente, usar uma conexão com status='connected' e um grupo real. ⚠️ Campo é `wa_invite_link` (não `invite_link`).

**Formato de wa_group_id:** `120363XXXXXXXXXX@g.us` — qualquer string não-vazia é aceita. Usar um JID real de grupo para AC-016.1 e AC-016.2.

---

## Tasks / Subtasks

### Task 1: QA Verification — AC-016.1 (register group)
- [ ] 1.1 Obter wa_group_id de um grupo WhatsApp real (via celular ou Evolution API)
- [ ] 1.2 POST /api/v1/groups com waGroupId, projectId, phaseId, name (⚠️ camelCase, name obrigatório)
- [ ] 1.3 Verificar HTTP 201 e campos da resposta

### Task 2: QA Verification — AC-016.2 (invite link auto-fetch)
- [ ] 2.1 Verificar que `wa_invite_link` na resposta é não-nulo (⚠️ campo é wa_invite_link)
- [ ] 2.2 Verificar formato: começa com "https://chat.whatsapp.com/"

### Task 3: QA Verification — AC-016.3 (duplicate 409)
- [ ] 3.1 Registrar mesmo waGroupId segunda vez (camelCase + name) → HTTP 409

### Task 4: QA Verification — AC-016.4 (404 tenant isolation)
- [ ] 4.1 projectId inexistente → HTTP 404
- [ ] 4.2 projectId de outro tenant → HTTP 404

### Task 5: QA Verification — AC-016.5 (refresh-link)
- [ ] 5.1 POST /groups/:id/refresh-link → HTTP 200
- [ ] 5.2 Verificar `wa_invite_link` na resposta é string não-vazia

### Task 6: TypeScript check
- [ ] 6.1 `npm run typecheck -w apps/api` → 0 errors

---

## Definition of Done

- [ ] AC-016.1: POST /groups registers group with waGroupId into project (camelCase, name required)
- [ ] AC-016.2: wa_invite_link auto-fetched and non-null in response
- [ ] AC-016.3: 409 if waGroupId already registered for this tenant
- [ ] AC-016.4: 404 if projectId not found or not owned by tenant
- [ ] AC-016.5: POST /groups/:id/refresh-link refreshes invite link
- [ ] AC-016.6: Returns correct response shape with HTTP 201
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

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-19 | River (SM) | Story created — QA-only verification (API pré-implementada durante EPIC-02) |
| 2026-02-19 | Pax (PO) | Validated — GO. Corrigido: camelCase (waGroupId/projectId/phaseId), name OBRIGATÓRIO, wa_invite_link (não invite_link). Status: Draft → Ready |

---

*Source: docs/prd/epic-03-prd.md §10 AC-016*
*Implementation: apps/api/src/routes/groups.ts (pre-built)*
*Registration: apps/api/src/index.ts line 45*
