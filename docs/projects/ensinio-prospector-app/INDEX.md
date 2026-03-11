# Ensinio Prospector App — Project Index

## Estado Atual
- **Squad base:** `ensinio-whatsapp-prospector` v3.0.0 (pipeline CLI completo)
- **Project Path:** `~/CODE/Projects/ensinio-prospector-app/`
- **Status:** M1 Done + M2 Done — App com scoring, preview, WhatsApp connect
- **Bloqueadores:** Nenhum

## Visão do Produto
App de prospecção via WhatsApp Web com outreach integrado e tracking de envios.

**Diferenciais vs squad atual (CLI + Google Sheets):**
- Login via WhatsApp Web embutido no app (sem export manual de chat)
- Interface própria para visualizar/gerenciar mensagens de outreach
- Tracking de envio (enviada / não enviada / respondida)
- Substitui Google Sheets como destino final

**Stack definida:**
- **Frontend:** Next.js 15 + Tailwind + shadcn/ui
- **Backend:** Next.js API Routes + Supabase (PostgreSQL)
- **WhatsApp:** Evolution API (self-hosted, Docker)

## Última Sessão
- **Data:** 2026-03-11
- **Agente/Squad:** @dev (implementação)
- **O que foi feito:**
  1. PRD atualizado: fluxo ZIP upload (não API), WhatsApp só p/ envio
  2. M1 Done: Next.js 15 + Supabase schema + chat parser + upload ZIP + dashboard
  3. M2 Done: scoring engine + preview mensagens + WhatsApp connect + Evolution API
  4. VK Talks processado: 80 membros, 50 telefones, 28 prospects scorados, 28 mensagens
  5. 12 decisões tomadas, 0 em aberto

## Próximo Passo
- M3: Envio direto via Evolution API + integração GHL (criar contato pós-envio)
- Ou: deploy Evolution API Docker local e testar QR code real
- Ou: processar mais grupos (enviar mais ZIPs)

## Squads Relacionados
- `ensinio-whatsapp-prospector` — Pipeline CLI de prospecção via WhatsApp (v3.0.0, 77 prospects processados)
- `ensinio-mind` — Source of truth do conhecimento Ensinio (5 pilares, 67 soluções)
- `ensinio-prospector` — Prospecção geral (consome ensinio-mind)

## Arquivos Chave
| Arquivo | Conteúdo |
|---------|---------|
| INDEX.md | Este arquivo |
| PRD.md | Product Requirements Document v0.1 |
| research/whatsapp-web-integration.md | Research sobre integração WhatsApp Web |
| `squads/ensinio-whatsapp-prospector/` | Squad base com pipeline CLI |
| `squads/ensinio-whatsapp-prospector/data/outputs/mentoria-50k/` | Dados do primeiro batch (77 prospects) |

## Histórico
| Data | Ação |
|------|------|
| 2026-03-11 | PRD v0.1 criado — stack, features, arquitetura, milestones |
| 2026-03-11 | Projeto criado — evolução de squad para app completo |
