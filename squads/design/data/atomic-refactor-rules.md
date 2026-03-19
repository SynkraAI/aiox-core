# Atomic Design Refactoring Rules

> Validation rules and best practices for Atomic Design refactoring.
> Based on 18+ refactored components with 91% average reduction.
>
> **v2.0 - Jan/2026:** Adicionados gates anti-over-engineering após análise mostrar +111% código em alguns casos.

---

## ⛔ GATES ANTI-OVER-ENGINEERING (LER PRIMEIRO!)

> **LIÇÃO JAN/2026:** Atomizamos 22 componentes. Em alguns casos, FragmentsTab foi de 475 → 1003 linhas (+111%) com 73% dos hooks sem reuso externo.

### GATE 0: Devo Atomizar?

| Linhas | useState | Decisão |
|--------|----------|---------|
| >800 | qualquer | **SIM** - atomizar |
| 500-800 | >7 | **SIM** - atomizar |
| 500-800 | ≤7 | **TALVEZ** - só se hooks serão reusados |
| <500 | qualquer | **NÃO** - organizar inline |

### GATE 1: Antes de Criar Cada Hook

```
PERGUNTA OBRIGATÓRIA: Esse hook será usado em OUTRO componente?

SE SIM → criar o hook (listar onde será usado)
SE NÃO → NÃO criar, manter useState inline com comentários organizados
```

**Exemplo de useState inline organizado (melhor que hook órfão):**
```typescript
const MyComponent = () => {
  // === STATE: Data ===
  const { data, isLoading } = useMyData(id);

  // === STATE: UI ===
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // === STATE: Filters ===
  const [search, setSearch] = useState('');
  const filteredData = useMemo(() => data?.filter(...), [data, search]);

  // ... resto
};
```

### GATE 2: Validação Final (OBRIGATÓRIO)

```bash
# Após terminar, verificar linhas TOTAIS
find {pasta-criada} -name "*.ts" -o -name "*.tsx" | xargs wc -l | tail -1

# Se linhas_depois > linhas_antes → FALHA, simplificar ou reverter
```

| Métrica | Limite | Se Falhar |
|---------|--------|-----------|
| Linhas totais | ≤ original | Simplificar |
| Arquivos | ≤7 por feature | Consolidar |
| Hooks órfãos | 0 | Mover inline |

---

## Required Rules (MUST)

### 1. Line Limits

| Type | Max | Ideal |
|------|--------|-------|
| Template (orchestrator) | **100** | 50-80 |
| Organism | 200 | 100-150 |
| Molecule | 100 | 50-80 |
| Hook | 150 | 80-120 |
| types.ts | No limit | - |
| data/*.ts | No limit | - |

**Validation:**
```bash
# Check largest file (except types.ts and data/)
find . -name "*.tsx" -o -name "*.ts" | grep -v types.ts | grep -v /data/ | xargs wc -l | sort -rn | head -5
```

### 2. Folder Structure

```
{domain}/{feature}/
├── types.ts           # REQUIRED
├── index.ts           # REQUIRED
├── {Feature}Template.tsx  # REQUIRED (orchestrator)
├── hooks/
│   └── index.ts       # REQUIRED if has hooks
├── molecules/
│   └── index.ts       # REQUIRED if has molecules
└── organisms/
    └── index.ts       # REQUIRED
```

### 3. Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Template | `{Feature}Template.tsx` | `CoursesTemplate.tsx` |
| Organism | `{Feature}{Type}.tsx` | `CoursesListView.tsx` |
| Molecule | `{Name}.tsx` | `StatCard.tsx` |
| Hook (data) | `use{Feature}Data.ts` | `useCoursesData.ts` |
| Hook (filters) | `use{Feature}Filters.ts` | `useCoursesFilters.ts` |
| Hook (dialog) | `use{Name}Dialog.ts` | `useCreateDialog.ts` |
| Types | `types.ts` | `types.ts` |
| Index | `index.ts` | `index.ts` |

### 4. Required Extraction

**ALWAYS extract:**
- [ ] `render{X}()` → `{X}View.tsx` or `{X}Section.tsx`
- [ ] `useState` grouped by concern → custom hook
- [ ] Color/icon configs → `types.ts`
- [ ] Mock/static data → `data/`

### 5. TypeScript

- [ ] `npx tsc --noEmit` must pass with 0 errors
- [ ] No `any` types (except when unavoidable)
- [ ] Props typed with interfaces in `types.ts`
- [ ] Hooks with explicit or inferred return type

### 6. Types Consistency

**RULE:** Every type imported in `data/*.ts` MUST exist in `types.ts`

```typescript
// ❌ WRONG - import type that doesn't exist
// data/my-data.ts
import type { FaqItem, CourseModule } from '../types';
// but types.ts doesn't have FaqItem or CourseModule → ERROR!

// ✅ CORRECT - types.ts has all interfaces
// types.ts
export interface FaqItem { ... }
export interface CourseModule { ... }

// data/my-data.ts
import type { FaqItem, CourseModule } from '../types'; // OK!
```

**Validation:**
```bash
# Check imported vs exported types
grep -h "from '../types'" {folder}/data/*.ts
grep "export interface\|export type" {folder}/types.ts
```

### 7. AppRoutes.tsx Updates

**RULE:** If moving a Template to a new folder, MUST update `AppRoutes.tsx`

```typescript
// If moving: books/templates/BookDetailTemplate.tsx
//        to: books/book-detail/BookDetailTemplate.tsx

// BEFORE in AppRoutes.tsx:
const BookDetailTemplate = React.lazy(() => import('./books/templates/BookDetailTemplate'));

// AFTER in AppRoutes.tsx:
const BookDetailTemplate = React.lazy(() => import('./books/book-detail/BookDetailTemplate'));
```

**Validation:**
```bash
# Check if import exists in new path
grep "BookDetailTemplate" app/components/AppRoutes.tsx
npm run typecheck | grep "Cannot find module"
```

### 8. Find ALL Importers

**RULE:** BEFORE moving any file, find ALL files that import it.

```bash
# Required before moving
grep -rn "{ComponentName}" app/components/ --include="*.tsx" --include="*.ts" | grep "import"
```

**Common error example:**
```
# Component: CreatePersona
# Subagent moved to: create-persona/CreatePersona.tsx
# Subagent updated: views/index.ts (re-export)
# Subagent FORGOT: PersonasTemplate.tsx (direct import)
# RESULT: broken import!
```

**Import checklist:**
- [ ] views/index.ts (re-export)
- [ ] {Parent}Template.tsx (direct import)
- [ ] AppRoutes.tsx (lazy import)
- [ ] Other components that use it

### 9. Preserve Hook Types

**RULE:** Check EXACT types of hooks BEFORE creating types.ts

```typescript
// ❌ WRONG - Create type without checking hook
// types.ts
interface Props {
  slug?: string;  // useParams returns string | undefined
}
// hook/useData.ts
const { data } = useCourseContents(slug); // useCourseContents expects string | null
// RESULT: Type error!

// ✅ CORRECT - Check hook first
// 1. Open hook and see: useCourseContents(slug: string | null)
// 2. In component, convert: useCourseContents(slug ?? null)
```

**Validation BEFORE creating types.ts:**
```bash
# See hook signature
grep -A5 "export function use" app/hooks/useYYY.ts
grep -A5 "export const use" app/hooks/useYYY.ts
```

### 10. Real TypeScript Validation

**RULE:** Run REAL tsc and verify output, don't lie.

### 11. Type Definition Order

**RULE:** Define types BEFORE using them in interfaces.

```typescript
// ❌ WRONG - type used before defined
export interface Props {
  onNavigate: (view: CourseView) => void;  // CourseView not defined yet!
}
export type CourseView = 'overview' | 'research';  // Too late

// ✅ CORRECT - type defined first
export type CourseView = 'overview' | 'research';
export interface Props {
  onNavigate: (view: CourseView) => void;  // OK
}
```

### 12. Nullable Consistency

**RULE:** Match exact nullability between source and consumer.

```typescript
// useParams returns: string | undefined
// useCourseContents expects: string | null

// ❌ WRONG - passing undefined to null parameter
const { slug } = useParams();
useCourseContents(slug);  // Type error!

// ✅ CORRECT - convert undefined to null
const { slug } = useParams();
useCourseContents(slug ?? null);
```

**Common conversions:**
| Source | Target | Fix |
|--------|--------|-----|
| `undefined` | `null` | `value ?? null` |
| `null` | `undefined` | `value ?? undefined` |
| `string \| undefined` | `string \| null` | `value ?? null` |

### 13. String to Union Type Casting

**RULE:** When data comes from objects with string keys, cast to union type.

```typescript
// Pipeline step has key as string
const pipeline = [{ key: 'overview', ... }, { key: 'research', ... }];

// But onNavigate expects union type
onNavigate: (view: 'overview' | 'research') => void;

// ❌ WRONG - string not assignable to union
onClick={() => onNavigate(step.key)}  // Type error!

// ✅ CORRECT - cast to expected type
onClick={() => onNavigate(step.key as CourseView)}
```

### 14. Props Consistency Across Components

**RULE:** When parent and child share a callback, use SAME type.

```typescript
// ❌ WRONG - different types for same callback
// Parent:
onNavigate: (view: 'overview' | 'research') => void;
// Child:
onNavigate: (view: string) => void;  // Incompatible!

// ✅ CORRECT - shared type
export type CourseView = 'overview' | 'research';

// Parent:
onNavigate: (view: CourseView) => void;
// Child:
onNavigate: (view: CourseView) => void;  // Same type
```

```bash
# Required after refactoring
npx tsc --noEmit 2>&1 | grep -E "(error|{ComponentName})" | head -30

# If returns ANYTHING → FIX BEFORE RETURNING
# DO NOT report "0 errors" without running this command
```

**Common errors tsc detects:**
| Error | Cause | Fix |
|-------|-------|-----|
| `Cannot find module` | Wrong import path | Update import |
| `Type 'undefined' not assignable to 'null'` | Hook expects null | `value ?? null` |
| `Type 'string' not assignable to union` | Generic type | Use exact union type |
| `Property does not exist` | Incompatible type | Check original type |

---

## Recommended Rules (SHOULD)

### 1. Template Orchestrator

The template should be ONLY composition:

```typescript
// ✅ GOOD - composition only
export const FeatureTemplate = () => {
  const data = useFeatureData();
  const filters = useFeatureFilters(data.items);

  return (
    <div>
      <FeatureHeader onRefresh={data.refetch} />
      <FeatureListView items={filters.filteredItems} />
    </div>
  );
};

// ❌ BAD - logic in template
export const FeatureTemplate = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch('/api/items').then(r => r.json()).then(setItems);
  }, []);

  const filteredItems = items.filter(i => i.active);

  return (
    <div>
      {filteredItems.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
};
```

### 2. Hooks

- Um hook = um concern
- Hooks podem usar outros hooks
- Hooks NÃO devem renderizar JSX
- Retornar objeto com estado + actions

```typescript
// ✅ BOM
export function useFilters(items) {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() =>
    items.filter(i => i.name.includes(search)),
    [items, search]
  );
  return { search, setSearch, filtered };
}

// ❌ RUIM - mistura concerns
export function useEverything() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  // ... 20 estados diferentes
}
```

### 3. Organisms

- Recebe props, não busca dados
- Pode ter estado de UI local (hover, expanded)
- Não deve chamar APIs diretamente
- Composição de molecules

```typescript
// ✅ BOM - recebe props
export const ListView = ({ items, onItemClick }: Props) => {
  return items.map(item => (
    <ItemCard key={item.id} item={item} onClick={() => onItemClick(item)} />
  ));
};

// ❌ RUIM - busca dados internamente
export const ListView = () => {
  const [items, setItems] = useState([]);
  useEffect(() => { fetchItems().then(setItems); }, []);
  return items.map(item => <div>{item.name}</div>);
};
```

### 4. Molecules

- Stateless (ou estado de UI mínimo)
- Reutilizáveis em múltiplos contextos
- Props simples e bem definidas
- Sem dependências de contexto específico

### 5. Shared Components

Antes de criar um molecule/hook:
1. Verificar se existe em `shared/molecules/`
2. Verificar se existe em `shared/hooks/`
3. Se for genérico (usado em 3+ lugares) → criar em shared/
4. Se for específico do domínio → criar local

---

## Anti-Patterns (NEVER)

### 1. Imports Circulares

```typescript
// ❌ NUNCA - hooks importando organisms
// hooks/useData.ts
import { ListView } from '../organisms/ListView'; // ERRADO!

// ❌ NUNCA - molecules importando organisms
// molecules/Card.ts
import { Header } from '../organisms/Header'; // ERRADO!
```

**Hierarquia correta:**
```
types.ts ← hooks ← molecules ← organisms ← Template
```

### 2. Props Drilling Excessivo

```typescript
// ❌ RUIM - passar 10+ props
<ListView
  items={items}
  loading={loading}
  error={error}
  onRefresh={refetch}
  search={search}
  setSearch={setSearch}
  filter={filter}
  setFilter={setFilter}
  sortBy={sortBy}
  setSortBy={setSortBy}
  // ...
/>

// ✅ MELHOR - agrupar em objetos
<ListView
  data={{ items, loading, error }}
  filters={filtersState}
  actions={{ onRefresh, onItemClick }}
/>
```

### 3. Arquivos Gigantes

```typescript
// ❌ NUNCA - organism com 500 linhas
// Sinal que precisa ser dividido em múltiplos organisms

// ❌ NUNCA - hook com 300 linhas
// Sinal que precisa ser dividido em múltiplos hooks
```

### 4. Lógica no Render

```typescript
// ❌ RUIM
return (
  <div>
    {items.filter(i => i.active).sort((a,b) => a.name.localeCompare(b.name)).map(...)}
  </div>
);

// ✅ BOM - processar antes
const sortedItems = useMemo(() =>
  items.filter(i => i.active).sort((a,b) => a.name.localeCompare(b.name)),
  [items]
);
return <div>{sortedItems.map(...)}</div>;
```

---

## Métricas de Sucesso

### Redução Esperada

| Tier | Antes | Depois | Redução |
|------|-------|--------|---------|
| TIER 1 (>800) | 800-2000 | 50-200 | 85-95% |
| TIER 2 (500-800) | 500-800 | 40-150 | 80-90% |
| TIER 3 (300-500) | 300-500 | 30-100 | 70-80% |

### Número de Arquivos

| Componente Original | Arquivos Esperados |
|---------------------|-------------------|
| 300-500 linhas | 8-12 arquivos |
| 500-800 linhas | 12-18 arquivos |
| 800-1500 linhas | 15-25 arquivos |
| 1500+ linhas | 20-35 arquivos |

### Qualidade

- [ ] 0 erros TypeScript
- [ ] 0 imports circulares
- [ ] 0 arquivos >200 linhas (exceto types/data)
- [ ] 100% funcionalidade preservada
- [ ] Barrel exports funcionando

---

## Final Validation Checklist

```markdown
## Refactoring Validation: {ComponentName}

### Structure
- [ ] Folder created at `{domain}/{feature}/`
- [ ] types.ts exists
- [ ] index.ts with barrel exports
- [ ] hooks/index.ts exists
- [ ] organisms/index.ts exists

### Code
- [ ] Template ≤200 lines
- [ ] No file >200 lines (except types/data)
- [ ] All render{X} extracted
- [ ] All useState grouped in hooks
- [ ] npx tsc --noEmit passes

### Functionality
- [ ] Renders same as original
- [ ] Interactions work
- [ ] Edge cases handled (loading, empty, error)

### Metrics
- Before: _____ lines
- After: _____ lines (orchestrator)
- Reduction: _____%
- Files created: _____
```

---

*Rules v1.3 - 2026-01-05*
*Added rules 8-14 based on Wave 1.1 subagent errors:*
*- Rule 8: Find ALL importers before moving*
*- Rule 9: Preserve hook types (undefined vs null)*
*- Rule 10: Real TypeScript validation*
*- Rule 11: Type definition order (define before use)*
*- Rule 12: Nullable consistency (undefined vs null)*
*- Rule 13: String to union type casting*
*- Rule 14: Props consistency across components*
*Based on 18+ refactorings + Wave 1.1 error analysis*
