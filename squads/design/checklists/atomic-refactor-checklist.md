# Atomic Design Refactoring Checklist

> Use este checklist para cada componente refatorado.
> Referência: `app/components/ops/users/` (OpsUsersTemplate)
>
> **v2.0 - Jan/2026:** Adicionados gates anti-over-engineering.

---

## ⛔ GATE 0: Devo Atomizar? (ANTES DE TUDO)

```bash
wc -l {arquivo}
grep -c "useState" {arquivo}
```

| Linhas | useState | Decisão |
|--------|----------|---------|
| >800 | qualquer | **SIM** |
| 500-800 | >7 | **SIM** |
| 500-800 | ≤7 | **TALVEZ** - só se hooks reusáveis |
| <500 | qualquer | **NÃO** - organizar inline |

- [ ] Componente passa no GATE 0? Se **NÃO** → pare aqui, apenas organize inline

---

## Pre-Flight (Antes de Começar)

### Análise do Componente
- [ ] Ler arquivo COMPLETO (não só o início)
- [ ] Contar linhas totais: `wc -l {arquivo}`
- [ ] Listar todos `useState` (quantos? _____)
- [ ] Listar todas funções `render{X}()` (quantas? _____)
- [ ] Identificar padrões JSX repetidos (2+ vezes)
- [ ] Mapear dependências externas (hooks, utils, types)

### Verificar Shared Components
- [ ] Checar `app/components/shared/hooks/` - hook já existe?
- [ ] Checar `app/components/shared/molecules/` - molecule já existe?
- [ ] Checar `app/components/ui/` - componente UI existe?
- [ ] Se precisar de novo shared → adicionar em `docs/refactoring/SHARED_REQUESTS.md`

### Confirmar Domínio
- [ ] Identificar domínio correto: `{domain}/{feature}/`
- [ ] Verificar que não existe pasta com mesmo nome
- [ ] Confirmar que não vai tocar arquivos de OUTRO domínio

---

## Estrutura (Criar Pastas/Arquivos)

### Criar Estrutura Base
```
app/components/{domain}/{feature}/
├── types.ts
├── index.ts
├── {Feature}Template.tsx
├── hooks/
│   └── index.ts
├── molecules/
│   └── index.ts
└── organisms/
    └── index.ts
```

- [ ] Criar pasta `{domain}/{feature}/`
- [ ] Criar `types.ts` com interfaces
- [ ] Criar `index.ts` (barrel export)
- [ ] Criar pasta `hooks/` + `index.ts`
- [ ] Criar pasta `molecules/` + `index.ts` (se necessário)
- [ ] Criar pasta `organisms/` + `index.ts`

---

## Extração (Decompor o Componente)

### 1. Types (types.ts) - CRÍTICO ⚠️
- [ ] Mover/criar todas interfaces de Props
- [ ] Mover/criar tipos de dados (enums, unions)
- [ ] Mover/criar configurações (COLORS, ICONS, etc.)
- [ ] Exportar tudo com `export`
- [ ] **VALIDAÇÃO OBRIGATÓRIA:** Após criar `data/*.ts`, verificar que TODOS os types importados existem em `types.ts`
  ```bash
  # Listar types importados em data/
  grep -h "from '../types'" {pasta}/data/*.ts | grep -oE "{ [^}]+ }"
  # Verificar se existem em types.ts
  grep "export interface\|export type" {pasta}/types.ts
  ```
  **Se algum type estiver faltando → ADICIONAR antes de continuar**

### 2. Hooks (hooks/) - ⚠️ GATE 1 POR HOOK

**Para CADA hook que você vai criar, responda:**
```
Esse hook será usado em OUTRO componente?
[ ] SIM - onde: ____________
[ ] NÃO → NÃO crie, mantenha useState inline
```

- [ ] **GATE 1 passou para todos os hooks?**
- [ ] Agrupar `useState` relacionados em hooks customizados
- [ ] Naming: `use{Feature}{Concern}.ts`
  - Dados: `use{Feature}Data.ts`
  - Filtros: `use{Feature}Filters.ts`
  - Dialogs: `use{Dialog}Dialog.ts`
- [ ] Cada hook retorna objeto com estado + setters
- [ ] Exportar no `hooks/index.ts`

### 3. Molecules (molecules/) - Se Necessário
- [ ] Extrair padrões JSX repetidos 2+ vezes
- [ ] Componentes pequenos, stateless
- [ ] Props bem definidas em types.ts
- [ ] Exportar no `molecules/index.ts`

### 4. Organisms (organisms/)
- [ ] Cada `render{X}()` vira `{X}View.tsx` ou `{X}Section.tsx`
- [ ] Recebe props, não usa hooks diretamente (exceto UI state)
- [ ] Naming consistente: `{Feature}Header.tsx`, `{Feature}ListView.tsx`
- [ ] Exportar no `organisms/index.ts`

### 5. Template Orchestrator
- [ ] Importar todos hooks
- [ ] Importar todos organisms
- [ ] Apenas composição (sem lógica de negócio)
- [ ] Layout e ordem dos organisms
- [ ] Passar props para cada organism

---

## Validação (Pós-Extração)

### TypeScript
- [ ] `npx tsc --noEmit` - 0 erros
- [ ] Sem `any` types (exceto quando inevitável)
- [ ] Props tipadas corretamente

### Contagem de Linhas
- [ ] Template orchestrator: **≤100 linhas** (sem estado, só composição)
- [ ] Cada hook: ≤150 linhas
- [ ] Cada molecule: ≤100 linhas
- [ ] Cada organism: ≤200 linhas (exceções documentadas)
- [ ] types.ts: sem limite (configs podem ser grandes)

### Imports - CRÍTICO ⚠️

**REGRA: SEMPRE usar aliases `@/`, NUNCA paths relativos para UI**

```typescript
// ✅ CORRETO
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// ❌ ERRADO - NÃO usar
import { Icon } from '../../../ui/icon';
import { Button } from '../../shared/ui/button';
```

- [ ] **Validação obrigatória antes de concluir:**
  ```bash
  grep -rn "from '\.\./\.\./\.\." {pasta-criada}/
  ```
  Se retornar resultados → **CORRIGIR antes de reportar conclusão**

- [ ] Todos imports de `@/components/ui/*` usam alias
- [ ] Sem imports circulares
- [ ] Barrel exports funcionando (`import { X } from './hooks'`)
- [ ] Paths relativos OK apenas para arquivos do mesmo módulo

### Funcionalidade
- [ ] Testar no browser - renderiza igual ao original?
- [ ] Testar interações - botões, forms, dialogs funcionam?
- [ ] Testar edge cases - loading, empty, error states

### Consistência com Padrão
- [ ] Comparar estrutura com `ops/users/`
- [ ] Naming conventions seguidas
- [ ] Barrel exports no mesmo padrão

---

## Finalização

### Documentação
- [ ] Atualizar `docs/refactoring/COMPONENT_REFACTORING_ROADMAP.md`
  - [ ] Marcar status como ✅ Done
  - [ ] Adicionar linha count (antes → depois)
  - [ ] Adicionar estrutura de arquivos criados
- [ ] Se criou shared component → documentar uso

### Git
- [ ] `git add` apenas arquivos do domínio refatorado
- [ ] Commit message: `refactor({domain}): decompose {Component} ({antes}→{depois} lines)`
- [ ] Não commitar arquivos de outros domínios

### Cleanup
- [ ] Deletar arquivo original (se moveu para nova pasta)
- [ ] Atualizar imports em arquivos que usavam o componente
- [ ] Verificar que nenhum import quebrou

### AppRoutes.tsx - CRÍTICO ⚠️

**Se o componente mudou de path (ex: `templates/X.tsx` → `x-feature/X.tsx`):**

- [ ] **OBRIGATÓRIO:** Atualizar import em `app/components/AppRoutes.tsx`
  ```bash
  # Verificar se AppRoutes importa o componente antigo
  grep "{ComponentName}" app/components/AppRoutes.tsx
  ```
- [ ] Corrigir o path do import lazy:
  ```typescript
  // ANTES (path antigo)
  const MyTemplate = React.lazy(() => import('./domain/templates/MyTemplate'));

  // DEPOIS (novo path)
  const MyTemplate = React.lazy(() => import('./domain/my-feature/MyTemplate'));
  ```
- [ ] **Validar:** `npm run typecheck` não deve ter erro `Cannot find module`

---

## ⛔ GATE 2: Validação Final (OBRIGATÓRIO)

```bash
# Contar linhas TOTAIS da pasta criada
find {pasta-criada} -name "*.ts" -o -name "*.tsx" | xargs wc -l | tail -1
```

| Métrica | Limite | Se Falhar |
|---------|--------|-----------|
| Linhas totais | ≤ original | Simplificar ou reverter |
| Arquivos criados | ≤7 | Consolidar |
| Hooks sem uso externo | 0 | Mover inline |

- [ ] **GATE 2 passou?** Se não → simplificar antes de commitar

---

## Métricas de Sucesso

| Métrica | Critério | Check |
|---------|----------|-------|
| **GATE 2: Linhas totais** | **≤ original** | [ ] |
| **GATE 2: Arquivos** | **≤7** | [ ] |
| **GATE 2: Hooks órfãos** | **0** | [ ] |
| Redução de linhas no template | ≥70% | [ ] |
| Template orchestrator | **≤100 linhas** | [ ] |
| Maior organism | ≤200 linhas | [ ] |
| TypeScript errors | 0 | [ ] |
| Import validation | 0 `../../../` | [ ] |
| Types consistency | Todos types em data/ existem em types.ts | [ ] |
| AppRoutes.tsx | Import atualizado (se mudou path) | [ ] |
| Funcionalidade | 100% igual | [ ] |

---

## Quick Reference

### Naming Conventions

```
Hooks:      use{Feature}{Concern}.ts     → useCoursesData.ts
Molecules:  {Pattern}.tsx                 → StatCard.tsx
Organisms:  {Feature}{Type}.tsx           → CoursesListView.tsx
Template:   {Feature}Template.tsx         → CoursesTemplate.tsx
Types:      types.ts                      → types.ts
Index:      index.ts                      → index.ts
```

### Extração de useState

```typescript
// ANTES (no template)
const [search, setSearch] = useState('');
const [filters, setFilters] = useState({});

// DEPOIS (em hooks/useFilters.ts)
export function useFilters() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  return { search, setSearch, filters, setFilters };
}
```

### Extração de render{X}

```typescript
// ANTES (no template)
const renderHeader = () => <div>...</div>;

// DEPOIS (em organisms/Header.tsx)
export const Header: React.FC<HeaderProps> = (props) => <div>...</div>;
```

---

*Checklist v1.2 - Adicionadas validações críticas: types consistency e AppRoutes.tsx*
*Baseado em 18+ componentes refatorados com 91% de redução média*
