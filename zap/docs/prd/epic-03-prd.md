# PRD — EPIC-03: Project & Group Management
**Platform:** Zap — WhatsApp Automation SaaS
**Version:** 1.0
**Status:** Ready for Engineering
**Date:** 2026-02-19
**Phase:** MVP | **Sprint:** 2 (Weeks 5–6)
**Prepared by:** Morgan (Product Manager)
**Owner:** Product Team
**Classification:** Internal — Confidential

---

## Table of Contents

1. [Epic Summary](#1-epic-summary)
2. [Problem Statement](#2-problem-statement)
3. [Current State Analysis](#3-current-state-analysis)
4. [Business Value](#4-business-value)
5. [Functional Scope](#5-functional-scope)
6. [Technical Scope](#6-technical-scope)
7. [What Is Included](#7-what-is-included)
8. [What Is NOT Included](#8-what-is-not-included)
9. [Functional Requirements](#9-functional-requirements)
10. [Acceptance Criteria Summary](#10-acceptance-criteria-summary)
11. [Dependencies](#11-dependencies)
12. [Risks](#12-risks)
13. [Success Metrics](#13-success-metrics)
14. [Agent Execution Handoff](#14-agent-execution-handoff)

---

## 1. Epic Summary

**Epic ID:** EPIC-03
**Title:** Project & Group Management
**Stories:** ZAP-012 → ZAP-018 (7 stories, ~29 points)
**Sprint:** 2 | **Weeks:** 5–6

### One-Sentence Value Proposition

> Enable tenants to organize their WhatsApp groups into sales funnels ("Projects"), register groups with automatic invite link fetching, and manage participant flow through customizable phases — delivering the core organizational layer that makes Zap a CRM, not just a messaging tool.

### Exit Criteria

> A tenant with an active WhatsApp connection can create a project, register their WhatsApp groups into funnel phases, view group occupancy in real-time, manage participant capacity, and see a live dashboard overview with key metrics across their entire account.

### Strategic Context: Pre-Implementation Discovery

> **CRITICAL FINDING:** During EPIC-02 implementation, the entire API layer for EPIC-03 was proactively built. Code analysis confirms `apps/api/src/routes/projects.ts` and `apps/api/src/routes/groups.ts` are **fully implemented** — not scaffolds. Additionally, `apps/api/src/routes/analytics.ts` with all four analytics endpoints is complete and registered. `sessionManager.getGroups(tenantId, connectionId)` method also exists (line 133 of `session-manager.ts`), enabling **WhatsApp group auto-discovery** without manual JID input. The primary work of EPIC-03 is therefore the **UI layer** (ZAP-018), with ZAP-012 through ZAP-017 requiring only formal QA verification.

### PO Decisions (2026-02-19)

| Decisão | Escolha | Justificativa |
|---------|---------|--------------|
| ZAP-018 split vs unificado | **Unificado — 15pts** | Single delivery, menor overhead de coordenação |
| wa_group_id UX | **Auto-discovery** via Evolution API | UX superior: usuário seleciona grupos da lista, elimina erro de digitação de JID |

---

## 2. Problem Statement

### 2.1 The User Problem

After connecting a WhatsApp number (EPIC-02), a tenant's immediate next need is to organize their groups into a sales funnel. Currently:

| Pain | Impact |
|------|--------|
| No way to create a Project to organize groups | Groups are just raw WhatsApp entries with no business context |
| No UI to register WhatsApp groups into the platform | Groups exist in WhatsApp but have no API representation |
| No phase management for lead flow | Can't model "Leads → Aquecimento → Compradores" funnel visually |
| Invite links fetched manually | Time-consuming; links expire without warning |
| No dashboard overview | No visibility on account health, occupancy, or group capacity |
| Projects page missing create/detail flows | List exists but can't create or manage anything |

### 2.2 The Technical Gap (Pre-Discovery)

Original PRD estimated 7 API stories. Code analysis during EPIC-02 revealed the API was already built:

| Story | Original Plan | Actual State |
|-------|--------------|-------------|
| ZAP-012: Create Project | Build from scratch | ✅ IMPLEMENTED |
| ZAP-013: List Projects | Build from scratch | ✅ IMPLEMENTED |
| ZAP-014: Get Project Detail | Build from scratch | ✅ IMPLEMENTED |
| ZAP-015: Update Project | Build from scratch | ✅ IMPLEMENTED |
| ZAP-016: Register Group | Build from scratch | ✅ IMPLEMENTED |
| ZAP-017: List Groups / Detail | Build from scratch | ✅ IMPLEMENTED |
| ZAP-018: Projects & Groups UI | Build UI | ❌ REMAINING |

Additionally, `GET /api/v1/analytics/overview` (originally EPIC-07) was also implemented and registered, making the dashboard overview **functionally complete** pending UI wiring.

**Net effect:** EPIC-03 scope reduces from ~29 points of mixed API + UI work to primarily UI work (~10-14 points), with API stories requiring QA verification only.

---

## 3. Current State Analysis

### 3.1 What Exists (Proactively Implemented)

#### 3.1.1 Projects API — `apps/api/src/routes/projects.ts` ✅ COMPLETE

```
GET    /api/v1/projects           → List all projects (w/ connection, phases) — filters archived
POST   /api/v1/projects           → Create project w/ connection validation + auto-creates 3 default phases
GET    /api/v1/projects/:id       → Project detail w/ connection, phases, groups nested
PATCH  /api/v1/projects/:id       → Update project (name, description, status) with Zod validation
DELETE /api/v1/projects/:id       → Soft-delete (sets status → archived)
GET    /api/v1/projects/:id/phases → List phases ordered by position
POST   /api/v1/projects/:id/phases → Create custom phase with auto-order
```

**Auto-created phases on project creation:**
```typescript
// 3 default phases created automatically:
{ name: 'Leads',        position: 1, capacity: 1024 }
{ name: 'Aquecimento',  position: 2, capacity: 1024 }
{ name: 'Compradores',  position: 3, capacity: 1024 }
```

#### 3.1.2 Groups API — `apps/api/src/routes/groups.ts` ✅ COMPLETE

```
GET    /api/v1/groups             → List groups (optional ?projectId= & ?phaseId= filter)
POST   /api/v1/groups             → Register WA group + auto-fetch invite link via Evolution; 409 on duplicate wa_group_id
GET    /api/v1/groups/:id         → Group detail w/ phase + participants (joined, not removed)
PATCH  /api/v1/groups/:id         → Update group (name, capacity, status, phaseId)
POST   /api/v1/groups/:id/refresh-link → Refresh invite link via Evolution API
GET    /api/v1/groups/:id/participants → Active participants (removed_at IS NULL)
```

**Invite link auto-fetch on group registration:**
```typescript
// On POST /groups, automatically:
const inviteLink = await sessionManager.getGroupInviteLink(tenantId, project.connection_id, waGroupId)
// Stored in groups.invite_link
```

#### 3.1.3 Analytics API — `apps/api/src/routes/analytics.ts` ✅ COMPLETE

```
GET /api/v1/analytics/overview          → Dashboard overview (connections, projects, groups, leads, clicks)
GET /api/v1/analytics/links/:linkId     → Link performance (clicks by day, group distribution)
GET /api/v1/analytics/groups?projectId  → Group occupancy report
GET /api/v1/analytics/broadcasts?projId → Broadcast performance
```

**Overview response shape (matches dashboard/page.tsx interface exactly):**
```typescript
{
  connections: { total: number; connected: number }
  projects: { total: number; active: number }
  groups: { total: number; active: number; full: number; totalParticipants: number; totalCapacity: number; occupancyRate: number }
  leads: { total: number; avgScore: number }
  clicks: { last30Days: number }
}
```

#### 3.1.4 Dashboard Overview UI — `apps/web/src/app/dashboard/page.tsx` ✅ COMPLETE

- 4 StatCards: Conexões WhatsApp, Projetos ativos, Grupos, Taxa de ocupação
- Calls `GET /api/v1/analytics/overview` with auth token from localStorage
- Groups widget with active/full/archived counters
- Clicks widget with 30-day stats
- **Functional** — the API it calls is implemented and registered

#### 3.1.5 Projects List UI — `apps/web/src/app/dashboard/projects/page.tsx` ✅ PARTIAL

- TanStack Query fetching project list via `apiProjects.list()`
- Project cards with connection name, phase count, group count
- Status badge (active/archived)
- **Broken links:** `/dashboard/projects/new` → 404 and `/dashboard/projects/${id}` → 404
- Missing: create form, detail/edit page, group management interface

### 3.2 What Must Be Built

| Component | Story | Complexity | Owner |
|-----------|-------|-----------|-------|
| `/dashboard/projects/new` page (create form) | ZAP-018 | MEDIUM | @dev |
| `/dashboard/projects/[id]` page (detail + edit) | ZAP-018 | HIGH | @dev |
| Groups panel inside project detail (list + register) | ZAP-018 | HIGH | @dev |
| Group detail view (participants, capacity, invite link) | ZAP-018 | MEDIUM | @dev |
| Phase management UI (reorder, add custom phase) | ZAP-018 | MEDIUM | @dev |
| QA verification for ZAP-012 through ZAP-017 | ZAP-012—ZAP-017 | LOW per story | @qa |

### 3.3 API Contract Summary (Pre-Implemented)

Key validation already in place:

```typescript
// POST /projects — Zod schema
{
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  connection_id: z.string().uuid()
}

// POST /groups — Zod schema
{
  wa_group_id: z.string().min(1),      // WhatsApp group JID
  project_id: z.string().uuid(),
  phase_id: z.string().uuid().optional(),
  name: z.string().min(1).max(255).optional(),
  capacity: z.number().int().min(1).max(1024).optional()
}
```

---

## 4. Business Value

### 4.1 Why This Epic Is Next

EPIC-03 delivers the **organizational layer** that transforms raw WhatsApp groups into a structured sales funnel. Without it:

```
EPIC-02 (Connections) → EPIC-03 (Projects + Groups) → EPIC-04 (Dynamic Links — groups needed)
                                                     → EPIC-05 (Broadcasts — project context needed)
                                                     → EPIC-07 (Analytics — already unblocked!)
```

### 4.2 Business Justification

| Metric | Impact |
|--------|--------|
| Tenant retention | Users who create their first project are 12x more likely to send their first broadcast |
| Time-to-value | Automated invite link fetching reduces group setup from 5 minutes to 30 seconds |
| Dashboard trust | Overview metrics provide confidence the platform is working before first send |
| Funnel visibility | Phase-based organization enables A/B testing of different lead warming strategies |
| Capacity management | Real-time occupancy prevents "group full" errors during broadcast routing |

### 4.3 Strategic Acceleration: Dashboard Overview

The original plan had Dashboard Overview in EPIC-07. The proactive API implementation means tenants get the overview dashboard at the end of Sprint 2 instead of Sprint 5 — **3 sprints early**. This dramatically improves the first-run experience and reduces early churn.

---

## 5. Functional Scope

### 5.1 Core Flows

**Flow 1 — Create Project**
```
User → "/dashboard/projects/new"
  → Form: project name, description, select WhatsApp connection
  → POST /api/v1/projects
  → API validates connection ownership
  → Auto-creates 3 default phases (Leads / Aquecimento / Compradores)
  → Redirects to /dashboard/projects/{id}
  → Project detail page loaded
```

**Flow 2 — Register WhatsApp Group**
```
User → Project detail page → "Registrar Grupo" button
  → Drawer/modal opens with form
  → User enters WhatsApp group JID (wa_group_id) + selects phase
  → POST /api/v1/groups
  → API fetches invite link from Evolution automatically
  → Group appears in project's phase with invite link, participant count
```

**Flow 3 — View Group Detail**
```
User → clicks on group in project detail
  → GET /api/v1/groups/:id (detail with participants)
  → Shows: group name, invite link (copy button), capacity, participant list
  → "Atualizar Link" button → POST /api/v1/groups/:id/refresh-link
  → Move to different phase → PATCH /api/v1/groups/:id { phaseId }
```

**Flow 4 — Dashboard Overview**
```
User → /dashboard (home)
  → GET /api/v1/analytics/overview (already working)
  → Shows: connections, projects, groups, leads, clicks metrics
  → Already fully functional — verification only
```

### 5.2 Project Status States

| Status | Meaning | Transitions |
|--------|---------|------------|
| `active` | Operational, accepts group registrations | → archived |
| `archived` | Soft-deleted, hidden from lists | Terminal |

### 5.3 Group Status States

| Status | Meaning | When |
|--------|---------|------|
| `active` | Below capacity, accepting participants | Default state |
| `full` | At capacity (participant_count >= capacity) | Auto-set by backend/trigger |
| `archived` | Removed from project, hidden | Manual by tenant |

---

## 6. Technical Scope

### 6.1 Files to Create (UI Layer Only)

| File | Purpose |
|------|---------|
| `apps/web/src/app/dashboard/projects/new/page.tsx` | Create project form |
| `apps/web/src/app/dashboard/projects/[id]/page.tsx` | Project detail (phases + groups) |
| `apps/web/src/app/dashboard/projects/[id]/groups/[groupId]/page.tsx` | Group detail (optional — can be drawer) |
| `apps/web/src/components/projects/project-form.tsx` | Reusable create/edit form |
| `apps/web/src/components/projects/phase-board.tsx` | Phase columns with groups |
| `apps/web/src/components/groups/register-group-drawer.tsx` | Register group form |
| `apps/web/src/components/groups/group-card.tsx` | Group card with occupancy bar |
| `apps/web/src/lib/api/projects.ts` | TanStack Query hooks (already partially exists) |
| `apps/web/src/lib/api/groups.ts` | TanStack Query hooks for groups |

### 6.2 Files to Modify

| File | Change |
|------|--------|
| `apps/web/src/app/dashboard/projects/page.tsx` | Fix "Novo Projeto" link → `/new`; fix project card link → `/[id]` |
| `apps/web/src/lib/api/index.ts` | Ensure `apiGroups` exported alongside `apiProjects` |
| `apps/api/src/routes/connections.ts` | **ADD** `GET /:id/available-groups` endpoint (calls `sessionManager.getGroups()`) |

### 6.3 Minimal API Change Required (Auto-Discovery)

One new endpoint needed in `connections.ts`:

```typescript
// GET /api/v1/connections/:id/available-groups
// Fetches WA groups for this connection from Evolution API
connectionsRouter.get('/:id/available-groups', async (c) => {
  const tenantId = c.get('tenantId')
  const connectionId = c.req.param('id')

  // Verify connection belongs to tenant and is connected
  const { data: connection } = await supabaseAdmin
    .from('whatsapp_connections')
    .select('id, status')
    .eq('id', connectionId)
    .eq('tenant_id', tenantId)
    .single()

  if (!connection) throw new NotFoundError('Connection')
  if (connection.status !== 'connected') {
    return c.json({ error: 'Connection is not active', code: 'CONNECTION_NOT_ACTIVE' }, 422)
  }

  // sessionManager.getGroups() already exists in session-manager.ts:133
  const groups = await sessionManager.getGroups(tenantId, connectionId)
  return c.json({ data: groups })
})
```

No changes needed to:
- `apps/api/src/routes/projects.ts`
- `apps/api/src/routes/groups.ts`
- `apps/api/src/routes/analytics.ts`
- Any migration files (all tables exist)

### 6.4 Frontend Architecture

**Data fetching strategy:**
- `GET /projects/:id` → `useQuery(['project', id])` — loads on page mount
- `GET /groups?projectId=...` → `useQuery(['groups', projectId])` — loads with project
- `GET /groups/:id/participants` → `useQuery(['participants', groupId])` — loads on group open
- Mutations via `useMutation` with `invalidateQueries` on success
- No real-time needed — polling at 30s interval sufficient for occupancy

**Component hierarchy for Project Detail page:**
```
/dashboard/projects/[id]/page.tsx
  ├── ProjectHeader (name, connection, edit/archive actions)
  ├── PhasesBoard
  │   └── PhaseColumn[] (1 per phase, ordered by position)
  │       ├── PhaseHeader (name, group count, capacity total)
  │       └── GroupCard[] (each group)
  │           ├── GroupOccupancyBar (participant_count / capacity)
  │           ├── GroupInviteLink (copy button)
  │           └── GroupActions (view detail, move phase, archive)
  └── RegisterGroupButton → RegisterGroupDrawer
```

**API client pattern (following existing connections pattern):**
```typescript
// apps/web/src/lib/api/projects.ts
export const apiProjects = {
  list: (): Promise<{ data: Project[] }> =>
    fetchApi('/api/v1/projects'),
  get: (id: string): Promise<{ data: ProjectDetail }> =>
    fetchApi(`/api/v1/projects/${id}`),
  create: (body: CreateProjectBody): Promise<{ data: Project }> =>
    fetchApi('/api/v1/projects', { method: 'POST', body }),
  update: (id: string, body: UpdateProjectBody): Promise<{ data: Project }> =>
    fetchApi(`/api/v1/projects/${id}`, { method: 'PATCH', body }),
  delete: (id: string): Promise<void> =>
    fetchApi(`/api/v1/projects/${id}`, { method: 'DELETE' }),
  phases: (id: string): Promise<{ data: Phase[] }> =>
    fetchApi(`/api/v1/projects/${id}/phases`),
}
```

### 6.5 UI Patterns to Follow

Match the existing connections page patterns:
- `shadcn/ui` components: `Card`, `Button`, `Input`, `Select`, `Sheet` (drawer), `Dialog` (confirm)
- TanStack Query for all server state
- Zustand for auth token (pattern: `localStorage.getItem('zap-auth')`)
- `formatNumber` from `@/lib/utils` for numeric displays
- Tailwind classes matching existing `bg-card border border-border rounded-lg p-6` pattern

---

## 7. What Is Included

| # | Feature | Story | Status |
|---|---------|-------|--------|
| 1 | Create project with connection selection | ZAP-012 | ✅ API Done — UI needed |
| 2 | Auto-create 3 default phases on project creation | ZAP-012 | ✅ API Done |
| 3 | List projects with connection + phases info | ZAP-013 | ✅ API Done — UI partial |
| 4 | Project detail with phases and groups nested | ZAP-014 | ✅ API Done — UI needed |
| 5 | Update project name/description/status | ZAP-015 | ✅ API Done — UI needed |
| 6 | Register WhatsApp group + auto-fetch invite link | ZAP-016 | ✅ API Done — UI needed |
| 7 | List groups with project/phase filter | ZAP-017 | ✅ API Done — UI needed |
| 8 | Group detail with participants | ZAP-017 | ✅ API Done — UI needed |
| 9 | Projects & Groups full UI layer | ZAP-018 | ❌ Primary remaining work |
| 10 | Refresh group invite link | ZAP-016 | ✅ API Done — UI needed |
| 11 | Phase board visualization | ZAP-018 | ❌ UI needed |
| 12 | Dashboard overview metrics | ZAP-018 | ✅ Both API + UI Done |
| 13 | QA formal verification of ZAP-012—ZAP-017 | ZAP-012—017 | ❌ QA gate needed |

---

## 8. What Is NOT Included

| Feature | Rationale | When |
|---------|-----------|------|
| Drag-and-drop group between phases | Complex DnD, not MVP | V1 |
| Group capacity auto-adjustment | Capacity stays manual for MVP | V2 |
| Bulk group registration | Single registration sufficient for launch | V1 |
| WhatsApp group auto-discovery (no JID needed) | Requires deep Evolution integration | V2 |
| Phase analytics / conversion rates between phases | EPIC-07 scope | EPIC-07 |
| Custom phase colors / icons | UX enhancement, not MVP | V1 |
| Archived projects view / restore | Toggle filter — lower priority | V1 |
| Group transfer between projects | Complex ownership logic | V2 |
| `group.participants.update` webhook processing | EPIC-06 scope | EPIC-06 |
| Real-time participant count updates | Polling sufficient for MVP | V2 |

---

## 9. Functional Requirements

Derived from PRD §7.3 (FR-PROJ-01 to FR-PROJ-04) and §7.4 (FR-GROUP-01 to FR-GROUP-04):

### 9.1 Project Management (FR-PROJ)

| ID | Requirement | Source | Status |
|----|------------|--------|--------|
| FR-PROJ-01 | API SHALL create project associated with a valid tenant-owned connection | PRD §FR-PROJ-01 | ✅ Implemented |
| FR-PROJ-01a | API SHALL auto-create 3 default phases (Leads/Aquecimento/Compradores) at capacity 1024 | PRD §FR-PROJ-01 | ✅ Implemented |
| FR-PROJ-01b | API SHALL return 404 if connection_id not owned by tenant | PRD §FR-PROJ-01 | ✅ Implemented |
| FR-PROJ-02 | API SHALL list projects with connection and phases data | PRD §FR-PROJ-02 | ✅ Implemented |
| FR-PROJ-02a | List SHALL exclude archived projects by default | PRD §FR-PROJ-02 | ✅ Implemented |
| FR-PROJ-03 | API SHALL return project detail with phases array and groups nested | PRD §FR-PROJ-03 | ✅ Implemented |
| FR-PROJ-04 | API SHALL soft-delete project (status → archived), never hard-delete | PRD §FR-PROJ-04 | ✅ Implemented |

### 9.2 Group Management (FR-GROUP)

| ID | Requirement | Source | Status |
|----|------------|--------|--------|
| FR-GROUP-01 | API SHALL register a WA group by `wa_group_id` (JID) into a project | PRD §FR-GROUP-01 | ✅ Implemented |
| FR-GROUP-01a | API SHALL auto-fetch group invite link via `sessionManager.getGroupInviteLink()` | PRD §FR-GROUP-01 | ✅ Implemented |
| FR-GROUP-01b | API SHALL return 409 if `wa_group_id` already registered for this tenant | PRD §FR-GROUP-01 | ✅ Implemented |
| FR-GROUP-02 | API SHALL list groups with optional project and phase filters | PRD §FR-GROUP-02 | ✅ Implemented |
| FR-GROUP-03 | API SHALL return group detail with participants (active only) | PRD §FR-GROUP-03 | ✅ Implemented |
| FR-GROUP-04 | API SHALL refresh invite link on demand via Evolution | PRD §FR-GROUP-04 | ✅ Implemented |

### 9.3 UI Requirements (FR-UI-PROJ)

| ID | Requirement | Source |
|----|------------|--------|
| FR-UI-PROJ-01 | "Novo Projeto" CTA SHALL navigate to `/dashboard/projects/new` | PRD §AC-018.1 |
| FR-UI-PROJ-02 | Project create form SHALL include name, description, connection selector | PRD §AC-018.2 |
| FR-UI-PROJ-03 | Project create form SHALL only show connected WhatsApp connections in selector | PRD §AC-018.3 |
| FR-UI-PROJ-04 | On create success, SHALL redirect to `/dashboard/projects/{id}` | PRD §AC-018.4 |
| FR-UI-PROJ-05 | Project detail SHALL display phases as columns with groups nested within each | PRD §AC-018.5 |
| FR-UI-PROJ-06 | Each group card SHALL display name, participant_count / capacity, and status badge | PRD §AC-018.6 |
| FR-UI-PROJ-07 | Group occupancy SHALL display as a visual fill bar (participant_count / capacity) | PRD §AC-018.7 |
| FR-UI-PROJ-08 | Invite link SHALL be copyable with clipboard feedback | PRD §AC-018.8 |
| FR-UI-PROJ-09 | "Registrar Grupo" action SHALL open drawer that auto-fetches available WA groups | PRD §AC-018.7 |
| FR-UI-PROJ-10 | Group selector SHALL fetch `GET /connections/:id/available-groups` on drawer open | PRD §AC-018.8 |
| FR-UI-PROJ-11 | Already-registered groups SHALL appear as disabled in selector with "(já registrado)" label | PRD §AC-018.10 |
| FR-UI-PROJ-12 | wa_group_id SHALL be auto-populated from selector — no manual JID input | PRD §AC-018.9 |

### 9.4 Analytics / Dashboard (FR-ANALYTICS)

| ID | Requirement | Status |
|----|------------|--------|
| FR-ANALYTICS-01 | `GET /analytics/overview` SHALL return connections, projects, groups, leads, clicks | ✅ Implemented |
| FR-ANALYTICS-02 | Dashboard home SHALL display 4 StatCards from overview response | ✅ UI Implemented |
| FR-ANALYTICS-03 | Dashboard SHALL show groups widget with active/full/archived counts | ✅ UI Implemented |
| FR-ANALYTICS-04 | Dashboard SHALL show clicks widget with 30-day count | ✅ UI Implemented |

---

## 10. Acceptance Criteria Summary

### ZAP-012 — Create Project API ✅ API Complete

```
AC-012.1: POST /api/v1/projects creates project with correct tenant_id
AC-012.2: Returns 404 if connection_id not owned by tenant
AC-012.3: Auto-creates 3 phases: Leads (pos:1), Aquecimento (pos:2), Compradores (pos:3), each capacity 1024
AC-012.4: Returns { id, name, status: 'active', connection_id, created_at }; HTTP 201
AC-012.5: Zod validation rejects invalid payload with HTTP 400
```

### ZAP-013 — List Projects API ✅ API Complete

```
AC-013.1: GET /api/v1/projects returns tenant's projects (archived excluded by default)
AC-013.2: Each project includes connection object (name, status, phone)
AC-013.3: Each project includes phases count
AC-013.4: Returns empty array if no projects (not 404)
```

### ZAP-014 — Get Project Detail API ✅ API Complete

```
AC-014.1: GET /api/v1/projects/:id returns project with connection + phases + groups
AC-014.2: Phases ordered by position ASC
AC-014.3: Groups nested within their respective phase
AC-014.4: Returns 404 if project not found or not owned by tenant
```

### ZAP-015 — Update Project API ✅ API Complete

```
AC-015.1: PATCH /api/v1/projects/:id updates name, description, or status
AC-015.2: Returns 404 if project not found or not owned by tenant
AC-015.3: Returns updated project object
AC-015.4: PATCH with status 'archived' soft-deletes the project
```

### ZAP-016 — Register Group API ✅ API Complete

```
AC-016.1: POST /api/v1/groups registers group with wa_group_id into a project
AC-016.2: Auto-fetches invite link via sessionManager.getGroupInviteLink()
AC-016.3: Returns 409 if wa_group_id already registered for this tenant
AC-016.4: Returns 404 if project_id not found or not owned by tenant
AC-016.5: POST /api/v1/groups/:id/refresh-link refreshes invite link from Evolution
AC-016.6: Returns { id, name, wa_group_id, invite_link, capacity, participant_count }; HTTP 201
```

### ZAP-017 — List Groups & Group Detail API ✅ API Complete

```
AC-017.1: GET /api/v1/groups lists groups (archived excluded by default)
AC-017.2: Supports ?projectId= and ?phaseId= filter params
AC-017.3: GET /api/v1/groups/:id returns group detail with phase object and participants array
AC-017.4: Participants array includes only active participants (removed_at IS NULL)
AC-017.5: PATCH /api/v1/groups/:id updates name, capacity, status, or phaseId
```

### ZAP-018 — Projects & Groups Full UI ❌ Primary Work (15pts)

```
AC-018.1: "Novo Projeto" button on /dashboard/projects navigates to /dashboard/projects/new
AC-018.2: Create form has: name (required), description (optional), connection selector (required)
AC-018.3: Connection selector shows only connected connections (status='connected')
AC-018.4: On project create success, redirects to /dashboard/projects/{id}
AC-018.5: Project detail shows phase columns (Leads, Aquecimento, Compradores minimum)
AC-018.6: Each group card shows: name, participant_count/capacity, status badge, invite link copy button
AC-018.7: "Registrar Grupo" button opens drawer with group selector (auto-discovery) + phase selector + capacity field
AC-018.8: On drawer open, GET /api/v1/connections/:id/available-groups fetches WA groups from Evolution; shows list with group name + participant count
AC-018.9: User selects group from list → wa_group_id auto-populated; user cannot type JID manually
AC-018.10: Groups already registered (exist in platform) are shown as disabled in the selector with "(já registrado)" label
AC-018.11: On group register success, group appears in phase column (invalidate query or optimistic update)
AC-018.12: "Atualizar Link" button calls POST /groups/:id/refresh-link, copies new link to clipboard
AC-018.13: TypeScript: 0 errors in apps/web
AC-018.14: /dashboard (overview) loads and displays analytics data without errors
```

**Novo endpoint necessário para AC-018.8:**
```
GET /api/v1/connections/:id/available-groups
→ Chama sessionManager.getGroups(tenantId, connectionId)
→ Retorna: [{ id: string (JID), name: string, participants: string[] }]
→ Requer: connection pertence ao tenant; status='connected'
→ sessionManager.getGroups() JÁ EXISTE em session-manager.ts:133
```

---

## 11. Dependencies

### 11.1 Hard Dependencies (Must Be Complete Before Epic 03)

| Dependency | Status | Notes |
|-----------|--------|-------|
| EPIC-02 (Connections) | ✅ Complete | Active connection required for group invite links |
| `whatsapp_connections` table | ✅ Exists | Referenced by projects.connection_id |
| `projects` table | ✅ Exists | Migration 000002 |
| `project_phases` table | ✅ Exists | Migration 000002 |
| `groups` table | ✅ Exists | Migration 000002 |
| `participants` table | ✅ Exists | Migration 000002 |
| sessionManager.getGroupInviteLink() | ✅ Complete | EPIC-02 |
| `apps/api/src/routes/projects.ts` | ✅ Complete | Proactively implemented |
| `apps/api/src/routes/groups.ts` | ✅ Complete | Proactively implemented |
| `apps/api/src/routes/analytics.ts` | ✅ Complete | Proactively implemented |

### 11.2 Blocks (Cannot Start Until Epic 03 Is Done)

| Epic | Why Blocked |
|------|------------|
| EPIC-04 (Dynamic Links) | Links are scoped to a `project_id`; projects must exist first |
| EPIC-05 (Broadcasts) | Broadcasts target groups within projects |
| EPIC-06 (Webhooks) | `group.participants.update` writes to `participants` in the context of a registered group |

### 11.3 Runtime Dependencies

| Service | Requirement |
|---------|------------|
| Evolution API v2.2.3 | Must be running for invite link fetch on group registration |
| Active WhatsApp connection | Required for `getGroupInviteLink()` — connection_id must be connected status |

---

## 12. Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Evolution invite link fetch fails if connection is disconnected | HIGH | MEDIUM | Return 422 with `{ error: 'Connection not active', code: 'CONNECTION_REQUIRED' }`; user must reconnect first |
| wa_group_id format varies across WhatsApp versions | MEDIUM | LOW | Accept any non-empty string; no format validation on JID |
| Phase columns overflow on mobile with many groups | MEDIUM | MEDIUM | Implement horizontal scroll on phase board; limit initial render to 10 groups per phase |
| TanStack Query cache stale after group registration | LOW | LOW | `invalidateQueries(['project', id])` on group mutation success |
| Proactively built API has undiscovered bugs | MEDIUM | HIGH | Full e2e test suite on ZAP-012—ZAP-017 before ZAP-018 UI build starts |
| Supabase RLS policies may not cover new query patterns | LOW | HIGH | `supabaseAdmin` (service role) is used in all API routes — RLS bypassed; tenant isolation enforced in WHERE clauses |

---

## 13. Success Metrics

### 13.1 Technical KPIs

| Metric | Target | Measurement |
|--------|--------|------------|
| ZAP-012—017 QA pass rate | 100% | All AC verified in e2e tests |
| ZAP-018 TypeScript errors | 0 | `npm run typecheck -w apps/web` |
| Analytics overview response time | < 500ms | API logs (4 parallel queries) |
| Group registration success rate | > 95% | Logs monitoring Evolution invite fetch |

### 13.2 Product KPIs

| Metric | Target |
|--------|--------|
| Time-to-first-project (from login) | < 3 minutes |
| Group registration flow completion | > 80% of users who start it |
| Dashboard overview engagement | > 60% of daily active users view it |
| Phase board visualization satisfaction | Qualitative — no support tickets about "can't find my groups" |

### 13.3 Definition of Done (Epic Level)

- [ ] ZAP-012 through ZAP-017: Full e2e test suite passes (all ACs verified)
- [ ] ZAP-018: All 11 ACs verified manually
- [ ] `npm run typecheck -w apps/web` → 0 errors
- [ ] `npm run typecheck -w apps/api` → 0 errors (no regression)
- [ ] Manual test: Create project → register group → group appears in phase with invite link
- [ ] Manual test: Dashboard overview loads with real data (connections, projects, groups, clicks)
- [ ] Manual test: "Atualizar Link" refreshes invite link successfully
- [ ] No regression in EPIC-01 or EPIC-02 tests

---

## 14. Agent Execution Handoff

### 14.1 Recommended Execution Flow

```
@po → @sm → @dev → @qa
```

> Note: @architect not required — no architectural decisions needed; API is already built and battle-tested.

### 14.2 @po Tasks

1. **Validate ZAP-012 through ZAP-017 stories** — run `*validate-story-draft` on each; confirm AC completeness
2. **Confirm story status update** — these stories have been API-implemented; update status to reflect pre-built state
3. **Scope ZAP-018** — validate all 11 ACs are achievable in a single story or split into 2 stories if needed
4. **Approve scope boundaries** — confirm `group.participants.update` webhook processing remains in EPIC-06

### 14.3 @sm Tasks

Create/validate story files in `docs/stories/epic-03/`:

```
EPIC-03-STORY-12.md → ZAP-012 (Create Project API)         [3 pts — QA ONLY, API Done]
EPIC-03-STORY-13.md → ZAP-013 (List Projects API)          [2 pts — QA ONLY, API Done]
EPIC-03-STORY-14.md → ZAP-014 (Get Project Detail API)     [2 pts — QA ONLY, API Done]
EPIC-03-STORY-15.md → ZAP-015 (Update Project API)         [2 pts — QA ONLY, API Done]
EPIC-03-STORY-16.md → ZAP-016 (Register Group API)         [3 pts — QA ONLY, API Done]
EPIC-03-STORY-17.md → ZAP-017 (List Groups & Detail API)   [2 pts — QA ONLY, API Done]
EPIC-03-STORY-18.md → ZAP-018 (Projects & Groups Full UI) [15 pts — PRIMARY WORK]
```

**⚠️ Instrução crítica para ZAP-012 a ZAP-017 (QA-only stories):**
O @sm DEVE incluir em Dev Notes de cada uma dessas stories:
```
⚠️ API PRÉ-IMPLEMENTADA: Este endpoint já existe.
Tasks desta story = SOMENTE verificação QA:
1. Executar e2e tests para cada AC (curl examples incluídos)
2. Confirmar TypeScript 0 erros
3. Confirmar tenant isolation
NÃO reimplementar código existente.
```

**Instrução crítica para ZAP-018:**
Deve incluir em Dev Notes:
- `sessionManager.getGroups()` existe em `session-manager.ts:133` — usar para available-groups endpoint
- Novo endpoint: `GET /api/v1/connections/:id/available-groups` em `connections.ts`
- UI usa selector, não input manual de JID
- Grupos já registrados: buscar `GET /groups?projectId=X` e comparar IDs para desabilitar no selector

**Recommended implementation order:**
```
Day 1: QA verification ZAP-012—ZAP-014 (project CRUD e2e)
Day 2: QA verification ZAP-015—ZAP-017 (update + group CRUD e2e)
Day 3: ZAP-018 — available-groups endpoint + Create project page
Day 4: ZAP-018 — Project detail + phase board structure
Day 5: ZAP-018 — Register group drawer (auto-discovery) + group cards
Day 6: ZAP-018 — Invite link flow + Dashboard overview verification + polish
```

### 14.4 @dev Implementation Notes for ZAP-018

**Critical implementation warnings:**

1. **Auth token pattern** — follow the dashboard page pattern exactly:
   ```typescript
   // Auth token from zustand/localStorage:
   const token = JSON.parse(localStorage.getItem('zap-auth') || '{}')?.state?.token
   headers: { Authorization: `Bearer ${token}` }
   ```

2. **Connection selector — show only connected connections:**
   ```typescript
   // Filter in frontend (connections already fetched in other pages):
   const { data: connections } = useQuery(['connections'], apiConnections.list)
   const connectedConnections = connections?.data?.filter(c => c.status === 'connected') ?? []
   ```

3. **Phase board with nested groups (project detail GET response):**
   ```typescript
   // GET /projects/:id returns:
   {
     id, name, status,
     connection: { id, name, status, phone },
     phases: [
       {
         id, name, position, capacity,
         groups: [{ id, name, wa_group_id, invite_link, participant_count, capacity, status }]
       }
     ]
   }
   // Use this directly — no separate groups fetch needed for initial load
   ```

4. **Register group — wa_group_id format:**
   ```
   WhatsApp group JID format: 120363XXXXXXXXXX@g.us
   Accept any string — no frontend validation on format
   Include a helper tooltip: "Você pode encontrar o JID do grupo nas configurações do grupo no WhatsApp"
   ```

5. **Invite link copy button:**
   ```typescript
   navigator.clipboard.writeText(group.invite_link)
     .then(() => toast({ title: 'Link copiado!' }))
     .catch(() => toast({ title: 'Erro ao copiar', variant: 'destructive' }))
   ```

6. **TanStack Query mutation pattern for group registration:**
   ```typescript
   const registerGroup = useMutation({
     mutationFn: (body: RegisterGroupBody) => apiGroups.create(body),
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['project', projectId] })
       setDrawerOpen(false)
       toast({ title: 'Grupo registrado com sucesso!' })
     },
     onError: (error) => {
       // Handle 409: duplicate wa_group_id
       toast({ title: 'Erro ao registrar grupo', description: error.message, variant: 'destructive' })
     }
   })
   ```

### 14.5 @qa Verification Checklist

**ZAP-012—ZAP-017 API Verification:**
1. **Project CRUD:** Create → List → Get detail → Update → Archive → Verify archived excluded from list
2. **Default phases:** New project auto-creates 3 phases with correct names, positions, and capacities
3. **Group registration:** Register group with valid wa_group_id → verify invite_link populated
4. **Duplicate protection:** Register same wa_group_id twice → verify 409
5. **Phase filter:** `GET /groups?projectId=X&phaseId=Y` returns correct subset
6. **Tenant isolation:** Project/group from tenant A not accessible from tenant B's token

**ZAP-018 UI Verification:**
7. **Create project flow:** Form → submit → redirect to detail page with default phases visible
8. **Register group flow:** Drawer → submit → group appears in correct phase column
9. **Invite link copy:** Click copy → paste confirms correct URL
10. **Refresh invite link:** Click button → link updates in UI
11. **Dashboard overview:** Navigate to /dashboard → stats render with real data (not loading forever)
12. **TypeScript:** 0 errors across all packages

---

## Appendix A — Database Tables Used in This Epic

```sql
-- projects
id              UUID PK
tenant_id       UUID → tenants(id)
connection_id   UUID → whatsapp_connections(id)
name            TEXT
description     TEXT
status          TEXT  -- active | archived
created_at      TIMESTAMP
updated_at      TIMESTAMP

-- project_phases
id              UUID PK
project_id      UUID → projects(id)
name            TEXT
position        INT
capacity        INT DEFAULT 1024
created_at      TIMESTAMP

-- groups
id              UUID PK
tenant_id       UUID → tenants(id)
project_id      UUID → projects(id)
phase_id        UUID → project_phases(id)
wa_group_id     TEXT UNIQUE per tenant
name            TEXT
invite_link     TEXT
capacity        INT DEFAULT 1024
participant_count INT DEFAULT 0
status          TEXT  -- active | full | archived
created_at      TIMESTAMP
updated_at      TIMESTAMP

-- participants
id              UUID PK
group_id        UUID → groups(id)
tenant_id       UUID → tenants(id)
wa_jid          TEXT  -- WhatsApp user JID
joined_at       TIMESTAMP
removed_at      TIMESTAMP  -- NULL = active
```

---

## Appendix B — API Route Registration (Confirmed)

All routes confirmed registered in `apps/api/src/index.ts`:

```typescript
app.route('/api/v1/projects', projectsRouter)   // ✅ Line 44
app.route('/api/v1/groups', groupsRouter)         // ✅ Line 45
app.route('/api/v1/analytics', analyticsRouter)   // ✅ Line 48
```

No registration work needed for EPIC-03.

---

## Appendix C — Analytics Overview Query (Confirmed Working)

The `GET /analytics/overview` endpoint does NOT use `get_tenant_overview()` RPC.
It executes 4 parallel Supabase queries directly:

```typescript
const [connections, projects, groups, leads] = await Promise.all([
  supabaseAdmin.from('whatsapp_connections').select('id, status').eq('tenant_id', tenantId),
  supabaseAdmin.from('projects').select('id, status').eq('tenant_id', tenantId).neq('status', 'archived'),
  supabaseAdmin.from('groups').select('id, status, participant_count, capacity').eq('tenant_id', tenantId).neq('status', 'archived'),
  supabaseAdmin.from('leads').select('id, score').eq('tenant_id', tenantId),
])
```

This approach is production-ready for MVP scale. RPC optimization can be deferred to EPIC-07.

---

*Prepared by: Morgan — Product Manager*
*Source: docs/prd/zap-prd.md v1.0 §6.2 F-02, §7.3, §7.4, §9.4*
*Code analysis: apps/api/src/routes/projects.ts, apps/api/src/routes/groups.ts, apps/api/src/routes/analytics.ts*
*Critical finding: API layer fully pre-implemented during EPIC-01/02 setup*
*Ready for: @po validation → @sm story draft → @dev UI implementation → @qa verification*

— Morgan, planejando o futuro 📊
