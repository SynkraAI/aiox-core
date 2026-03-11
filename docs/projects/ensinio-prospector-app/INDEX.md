# Ensinio Prospector App — Project Index

## Estado Atual
- **Squad base:** `ensinio-whatsapp-prospector` v3.0.0 (pipeline CLI completo)
- **Project Path:** `~/CODE/Projects/ensinio-prospector-app/`
- **Status:** M1 + M2 + M3 Done — Circle DS + IndexedDB + sort funcional
- **Bloqueadores:** Nenhum

## Visão do Produto
App de prospecção via WhatsApp Web com outreach integrado e tracking de envios.

**Diferenciais vs squad atual (CLI + Google Sheets):**
- Login via WhatsApp Web embutido no app (sem export manual de chat)
- Interface própria para visualizar/gerenciar mensagens de outreach
- Tracking de envio (enviada / não enviada / respondida)
- Substitui Google Sheets como destino final

**Stack definida:**
- **Frontend:** Next.js 16 + Tailwind v4 + @circle-ds/react (link local)
- **State:** Zustand 5 + IndexedDB (nativa)
- **Backend:** Next.js API Routes + Supabase (PostgreSQL)
- **WhatsApp:** Evolution API (self-hosted, Docker)

## Última Sessão
- **Data:** 2026-03-11
- **Agente/Squad:** @dev (implementação)
- **O que foi feito (M3):**
  1. Migração visual: shadcn/ui → @circle-ds/react (Card, Badge, Button, Alert, Table)
  2. Removidas 5 deps: shadcn, @base-ui/react, cva, clsx, tailwind-merge
  3. Novo `scoring-colors.ts`: estilos inline para badges (CSSProperties)
  4. Sort funcional na ProspectsTable (4 colunas: C, P, Classificação, Temp)
  5. Persistência IndexedDB: dados sobrevivem reload (saveGroup, loadAllGroups, deleteGroup)
  6. Store refatorado: `crypto.randomUUID()`, `loadFromIdb()`, `isHydrated`
  7. Hydrate automático via useEffect no mount
  8. Build passando sem erros

## Próximo Passo
- M4: Envio direto via Evolution API + fila de envio + rate limiting
- Alternativas: filtros/busca na tabela, export CSV, edição de telefone inline

## Squads Relacionados
- `ensinio-whatsapp-prospector` — Pipeline CLI de prospecção via WhatsApp (v3.0.0, 77 prospects processados)
- `ensinio-mind` — Source of truth do conhecimento Ensinio (5 pilares, 67 soluções)
- `ensinio-prospector` — Prospecção geral (consome ensinio-mind)

## Arquivos Chave
| Arquivo | Conteúdo |
|---------|---------|
| `src/app/page.tsx` | Layout principal + hydrate IndexedDB |
| `src/stores/prospects-store.ts` | Estado global (Zustand + IndexedDB) |
| `src/lib/scoring-engine.ts` | Engine de scoring dual-axis |
| `src/lib/chat-parser.ts` | Parser de chats WhatsApp |
| `src/lib/scoring-colors.ts` | Estilos inline para badges (circle-ds) |
| `src/lib/services/local-db.ts` | Serviço IndexedDB (saveGroup, loadAllGroups, deleteGroup) |
| `src/lib/services/evolution-api.ts` | Client Evolution API |
| `src/components/prospects-table.tsx` | Tabela com sort (circle-ds Table) |
| `src/components/message-preview.tsx` | Preview + edição de mensagem |
| `src/components/whatsapp-connect.tsx` | Conexão WhatsApp (QR code) |
| `src/components/scoring-summary.tsx` | Resumo badges temperatura/classificação |
| `src/components/group-selector.tsx` | Seletor de grupos |

## Histórico
| Data | Ação |
|------|------|
| 2026-03-11 | M3 Done — Circle DS migration + IndexedDB persistence + sort funcional |
| 2026-03-11 | M2 Done — scoring engine, message preview, WhatsApp connect, Evolution API |
| 2026-03-11 | M1 Done — Next.js + Supabase + chat parser + upload ZIP + multi-grupo |
| 2026-03-11 | VK Talks processado — 80 membros, 50 telefones, 28 mensagens outreach |
| 2026-03-11 | PRD v0.2 — fluxo corrigido (ZIP → parse → score → WhatsApp → GHL) |
| 2026-03-11 | Projeto criado — evolução de squad para app completo |
