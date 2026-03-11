# Sessão 2026-03-11 — M3: Circle DS + IndexedDB

## Resumo
Migração completa de shadcn/ui para @circle-ds/react e adição de persistência local via IndexedDB.

## O que foi feito

### M3.1 — Migração Visual (Circle DS)
- [x] `package.json`: removidas 5 deps (shadcn, @base-ui/react, cva, clsx, tailwind-merge)
- [x] Adicionado `@circle-ds/react` via `file:../../design-systems/circle-ds`
- [x] `globals.css`: import `@circle-ds/react/styles.css` no lugar do `shadcn/tailwind.css`
- [x] Novo `src/lib/scoring-colors.ts` — CSSProperties + BadgeVariant mappings
- [x] `whatsapp-connect.tsx` → Card + Badge + Button + Alert
- [x] `scoring-summary.tsx` → Card + Badge (temperature + classification)
- [x] `prospects-table.tsx` → Table + sort funcional (4 colunas)
- [x] `message-preview.tsx` → Badge + Button (ghost iconOnly para fechar)
- [x] `group-selector.tsx` → Button (primary/secondary)
- [x] `page.tsx` → Alert dismissible para erros
- [x] Deletados: `src/components/ui/button.tsx`, `src/lib/utils.ts`, `components.json`

### M3.2 — Persistência IndexedDB
- [x] Novo `src/lib/services/local-db.ts` — API nativa IndexedDB
- [x] Store refatorado: `crypto.randomUUID()` para IDs
- [x] Nova action `loadFromIdb()` + state `isHydrated`
- [x] `addGroup()` salva no IndexedDB após atualizar state
- [x] `removeGroup()` remove do IndexedDB
- [x] Hydrate automático via `useEffect` no mount da page.tsx

### Verificação
- [x] `npm install` — 264 pacotes removidos, 1 adicionado
- [x] `npm run build` — compilado sem erros

## Decisões Tomadas
1. **Path do circle-ds:** `file:../../design-systems/circle-ds` (relativo a `~/CODE/Projects/`)
2. **Cores de classificação:** inline CSSProperties (hex) em vez de Tailwind classes — necessário porque Badge do circle-ds usa `style` prop
3. **Sort na tabela:** estado local (`useState`) em vez de store global — sort é preferência de visualização, não dados persistentes
4. **IndexedDB nativa:** sem lib adicional (idb, dexie, etc.) — a API é simples o suficiente

## Próximo Passo
- M4: Envio automatizado via Evolution API (fila, rate limiting, status de entrega)
- Alternativas menores: filtros/busca, export CSV, edição de telefone inline
