# EPIC-03-STORY-19 — Group Management Actions (Move Phase / Archive / View Detail)
**Story ID:** ZAP-019
**Epic:** EPIC-03 — Project & Group Management
**Sprint:** 3 | **Phase:** MVP
**Priority:** 🟡 MEDIUM
**Story Points:** 5
**Status:** Ready for Review
**Assigned to:** —
**Prepared by:** River (Scrum Master)
**Depends on:** ZAP-018 (group-card.tsx deve existir)
**Origin:** QA gate ZAP-018 — AC-018.6 parcialmente não atendida (group action menu ausente)

---

## User Story

**As a** tenant gerenciando grupos no phase board,
**I want** poder arquivar um grupo, mover um grupo para outra fase, e ver os detalhes de um grupo diretamente no kanban,
**so that** eu possa organizar meu funil sem precisar sair da página de projeto.

---

## Context & Background

Durante a implementação de ZAP-018, o `group-card.tsx` entregou as ações de link (copiar, atualizar, abrir). O AC-018.6 especificava adicionalmente um **group action menu** com 3 ações que não foram implementadas:

1. **View detail** — visualizar detalhes do grupo (participantes, fase atual, capacidade)
2. **Move phase** — mover grupo para outra fase do projeto
3. **Archive** — arquivar o grupo (status → `archived`)

**API já implementada (EPIC-02):**
- `PATCH /api/v1/groups/:id` aceita `{ status?: 'active'|'full'|'archived', phaseId?: string }` — confirmado em `groups.ts:124–150`
- `GET /api/v1/groups/:id` retorna detalhes completos incluindo `phase:project_phases` e `participant_count`

**Nenhum endpoint novo necessário** — apenas UI.

---

## Acceptance Criteria

### AC-019.1 — Menu de ações no GroupCard
```
GIVEN um group card está visível no phase board
THEN existe um botão/ícone de menu (ex: MoreHorizontal) no canto do card
WHEN usuário clica no menu
THEN aparece um dropdown com as opções:
  - "Ver detalhes"
  - "Mover de fase"
  - "Arquivar grupo"
  AND grupos com status='archived' NÃO mostram a opção "Arquivar grupo"
```

### AC-019.2 — View Detail: modal/drawer com informações do grupo
```
GIVEN usuário clica em "Ver detalhes" no menu do grupo
THEN abre um painel (modal ou drawer) com:
  - Nome do grupo
  - Fase atual
  - participant_count / capacity
  - Status badge
  - wa_invite_link (se existir)
  - wa_group_id (exibido como texto, não editável)
WHEN usuário fecha o painel
THEN retorna ao phase board sem alterações
```

### AC-019.3 — Move Phase: mover grupo para outra fase
```
GIVEN usuário clica em "Mover de fase" no menu do grupo
THEN abre um selector com as fases disponíveis do projeto (exceto a fase atual)
WHEN usuário seleciona uma nova fase e confirma
THEN PATCH /api/v1/groups/:id é chamado com { phaseId: novaFase.id }
  AND on success: toast "Grupo movido para [nome da fase]"
  AND project detail refetches (invalidateQueries ['project', projectId])
  AND grupo aparece na nova coluna de fase
GIVEN PATCH retorna erro
THEN toast "Erro ao mover grupo" com mensagem do erro
```

### AC-019.4 — Archive: arquivar grupo
```
GIVEN usuário clica em "Arquivar grupo" no menu do grupo
THEN aparece confirmação inline ou dialog: "Arquivar [nome do grupo]? Esta ação pode ser desfeita alterando o status manualmente."
WHEN usuário confirma
THEN PATCH /api/v1/groups/:id é chamado com { status: 'archived' }
  AND on success: toast "Grupo arquivado"
  AND project detail refetches
  AND grupo card atualiza badge para "Arquivado" (bg-gray-100 text-gray-500)
GIVEN PATCH retorna erro
THEN toast "Erro ao arquivar grupo" com mensagem do erro
```

### AC-019.5 — TypeScript: 0 erros em apps/web
```
WHEN running: npm run typecheck -w apps/web
THEN exit code 0 com nenhum erro TypeScript
```

---

## Dev Notes

### PATCH /api/v1/groups/:id — Schema confirmado

```typescript
// groups.ts:124-150
// Request body (camelCase):
{
  status?: 'active' | 'full' | 'archived'   // para arquivar
  phaseId?: string                           // UUID para mover de fase
}

// Response: { data: Group }
// tenant isolation: .eq('tenant_id', tenantId) verificado internamente
```

### Componentes existentes a modificar

```
apps/web/src/components/groups/group-card.tsx  ← MODIFICAR
  - Adicionar MoreHorizontal button + dropdown menu
  - Adicionar estado de loading por ação (mutating)
  - Manter ações de link existentes (copy, refresh, external)
```

### Novos componentes a criar (se necessário)

```
apps/web/src/components/groups/group-detail-drawer.tsx  ← CRIAR (opcional)
  - Pode ser um modal simples em vez de drawer separado
  - Alternativa: expandir o próprio GroupCard inline
```

### Padrão de dropdown (sem shadcn/ui)

Seguir o mesmo padrão Tailwind do `register-group-drawer.tsx`. Exemplo de dropdown posicionado:

```tsx
// Estado: const [menuOpen, setMenuOpen] = useState(false)
// Fechar ao clicar fora: useEffect com window.addEventListener('click', ...)
<div className="relative">
  <button onClick={() => setMenuOpen(!menuOpen)}>
    <MoreHorizontal className="w-4 h-4" />
  </button>
  {menuOpen && (
    <div className="absolute right-0 top-6 z-10 bg-background border border-border rounded-md shadow-lg py-1 w-40">
      <button className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent">Ver detalhes</button>
      <button className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent">Mover de fase</button>
      {group.status !== 'archived' && (
        <button className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent text-red-600">Arquivar grupo</button>
      )}
    </div>
  )}
</div>
```

### Move Phase — fases disponíveis

As fases já estão disponíveis na `PhaseColumn` via `projectId`. O GroupCard precisa receber as fases do projeto como prop (ou buscar via cache do TanStack Query):

```typescript
// Opção A: passar phases como prop adicional no GroupCard
interface GroupCardProps {
  group: Group
  projectId: string
  phases: Phase[]  // ← adicionar
  onToast: (title: string, description?: string, variant?: 'default' | 'destructive') => void
}

// Opção B: buscar do cache TanStack Query (evita prop drilling)
const { data } = useQuery({ queryKey: ['project', projectId] })
const phases = data?.data?.phases ?? []
```

### Confirmação de Archive

Implementar como estado local simples — sem dialog externo:

```tsx
const [confirmArchive, setConfirmArchive] = useState(false)

{confirmArchive ? (
  <div className="...">
    <p>Arquivar este grupo?</p>
    <button onClick={() => archiveMutation.mutate()}>Confirmar</button>
    <button onClick={() => setConfirmArchive(false)}>Cancelar</button>
  </div>
) : (
  <button onClick={() => setConfirmArchive(true)}>Arquivar grupo</button>
)}
```

---

## CodeRabbit Integration

| Field | Value |
|-------|-------|
| Primary Story Type | Frontend |
| Primary Executor | @dev |
| QA Gate | @qa |
| Severity Focus | CRITICAL + HIGH |
| Key Checks | TanStack Query invalidation, dropdown a11y, mutation error handling |

---

## Tasks / Subtasks

### Task 1: Menu de ações no GroupCard
- [x] 1.1 Adicionar `MoreHorizontal` button ao `group-card.tsx`
- [x] 1.2 Implementar dropdown Tailwind com 3 opções
- [x] 1.3 Fechar dropdown ao clicar fora (useEffect + click listener)
- [x] 1.4 Ocultar "Arquivar" quando `group.status === 'archived'`

### Task 2: View Detail
- [x] 2.1 Criar modal/drawer de detalhes (inline no GroupCard ou componente separado)
- [x] 2.2 Exibir: nome, fase atual, participant_count/capacity, status, wa_invite_link, wa_group_id
- [x] 2.3 Botão fechar — sem alterações de estado

### Task 3: Move Phase
- [x] 3.1 Adicionar `phases` ao `GroupCardProps` (ou buscar via TanStack Query cache)
- [x] 3.2 Atualizar `PhaseColumn` e `PhaseBoard` para propagar `phases` ao GroupCard
- [x] 3.3 Selector de fases (exceto fase atual)
- [x] 3.4 `useMutation` → `PATCH /api/v1/groups/:id` com `{ phaseId }`
- [x] 3.5 On success: toast + `invalidateQueries(['project', projectId])`
- [x] 3.6 On error: toast "Erro ao mover grupo"

### Task 4: Archive
- [x] 4.1 Estado de confirmação inline (sem dialog externo)
- [x] 4.2 `useMutation` → `PATCH /api/v1/groups/:id` com `{ status: 'archived' }`
- [x] 4.3 On success: toast "Grupo arquivado" + invalidate query
- [x] 4.4 On error: toast "Erro ao arquivar grupo"
- [x] 4.5 Loading state no botão durante mutation

### Task 5: Quality checks
- [x] 5.1 `npm run typecheck -w apps/web` → 0 erros
- [ ] 5.2 Manual: abrir menu, clicar cada ação, verificar resultado

---

## Dependencies

| Dependency | Type | Status |
|-----------|------|--------|
| ZAP-018 (group-card.tsx existente) | Hard | ✅ Implementado |
| `PATCH /api/v1/groups/:id` | Hard | ✅ Implementado (groups.ts:124) |
| `GET /api/v1/groups/:id` | Soft | ✅ Implementado (se view detail precisar de fetch fresh) |

---

## Definition of Done

- [x] AC-019.1: Menu com 3 opções visível no GroupCard
- [x] AC-019.2: View detail exibe informações corretas
- [x] AC-019.3: Move phase atualiza a coluna corretamente
- [x] AC-019.4: Archive atualiza badge e confirma antes de executar
- [x] AC-019.5: TypeScript 0 erros
- [x] Story File List atualizada

---

## File List (update as you work)

| File | Action | Notes |
|------|--------|-------|
| `apps/web/src/lib/api.ts` | MODIFIED | Adicionar `update` ao `apiGroups` (PATCH endpoint) |
| `apps/web/src/components/groups/group-card.tsx` | MODIFIED | Menu + view detail modal + move phase + archive |
| `apps/web/src/components/projects/phase-column.tsx` | MODIFIED | Props `phases` + `currentPhase` propagadas ao GroupCard |
| `apps/web/src/components/projects/phase-board.tsx` | MODIFIED | Passa `phases` para PhaseColumn |

---

## Dev Agent Record

### Debug Log

Nenhum bug encontrado. Implementação direta.

### Completion Notes

- View detail implementado inline no GroupCard (modal fixed inset-0 z-50) — sem componente separado
- Move phase: selector inline no card, `currentPhase` construído a partir de `{ phaseId, name }` no PhaseColumn
- Archive: confirmação inline com border-red-200 bg-red-50 — sem dialog externo
- `apiGroups.update` adicionado ao api.ts com tipos explícitos
- `phases` propagadas via prop drilling: PhaseBoard → PhaseColumn → GroupCard
- TypeScript: 0 erros confirmados

### Agent Model Used

claude-sonnet-4-6

---

## QA Results

**Revisor:** Quinn (@qa) | **Data:** 2026-02-20 | **Veredicto:** ✅ PASS

### Code Review — Static Analysis

| AC | Código | Status |
|----|--------|--------|
| AC-019.1 | `MoreHorizontal` button com `e.stopPropagation()`. Dropdown 3 opções. `{group.status !== 'archived' && ...}` oculta "Arquivar" corretamente. Click-outside via `useRef + useEffect`. | ✅ |
| AC-019.2 | Modal `fixed inset-0 z-50` (não clipado por overflow dos ancestrais). Exibe: nome, `currentPhase.name`, `participant_count / capacity`, status badge, `wa_invite_link`, `wa_group_id`. Fechamento por overlay click ou botão X. | ✅ |
| AC-019.3 | `availablePhases = phases.filter((p) => p.id !== currentPhase.id)`. `movePhaseMutation` → `PATCH /:id` com `{ phaseId }`. Toast `"Grupo movido para ${targetPhase?.name}"`. `invalidateQueries(['project', projectId])`. Error toast presente. | ✅ |
| AC-019.4 | `confirmArchive` state inline. Mensagem correta inclui nome do grupo. `archiveMutation` → `{ status: 'archived' }`. Toast "Grupo arquivado". `Loader2` spinner no botão. Error toast presente. | ✅ |
| AC-019.5 | `npm run typecheck -w apps/web` → **0 erros** ✅ | ✅ |

### TypeScript
- `npm run typecheck -w apps/web` → **0 erros** ✅
- `npm run typecheck -w apps/api` → **0 erros** ✅

### Observações
- **LOW:** `register-group-drawer.tsx:69` — detecção de 409 via `err.message.includes('409')`. Funciona na implementação atual da `ApiClient`. Frágil se o formato de erro mudar. Tech-debt para versão futura.
- Prop drilling (`phases` + `currentPhase`): PhaseBoard → PhaseColumn → GroupCard — padrão aceitável para esta profundidade. TanStack Query cache seria alternativa para escala futura.

### Manual Tests Pendentes
- AC-019.1/2/3/4: Requerem servidor ativo (Docker) para validação E2E das mutações

### Gate Decision
**✅ PASS** — Todos os 5 ACs atendidos. TypeScript 0 erros. Implementação limpa. 1 concern LOW não bloqueante.

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-20 | River (SM) | Story criada como follow-up de ZAP-018 — group action menu identificado como gap por @qa Quinn no QA gate |
| 2026-02-20 | Pax (PO) | Validação *validate-story-draft — Score 9/10 — Veredicto GO — Status Draft → Ready |
| 2026-02-20 | Dex (Dev) | Implementação completa — 4 arquivos modificados, TypeScript 0 erros — Status Ready → Ready for Review |

---

*Source: QA gate ZAP-018 — AC-018.6 gap report*
*API ref: apps/api/src/routes/groups.ts:124 (PATCH endpoint)*
