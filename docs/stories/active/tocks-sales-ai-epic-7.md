# Epic 7: Go Live Pipeline — WhatsApp + Supabase + IA End-to-End

**Project:** Tocks Sales AI
**Epic:** Pipeline real end-to-end: WhatsApp -> IA -> Supabase -> Dashboard
**Status:** TODO
**Created:** 2026-04-14
**Priority:** CRITICAL
**Conclave:** 5 experts (Sales Ops Analyst, CRM Manager, Lead Qualifier, Sales Closer, Chris Voss) — CONSENSUS unanime

## Objetivo

Eliminar mock data e conectar o fluxo completo: lead entra via WhatsApp real -> Claude AI qualifica e sugere respostas -> Supabase persiste dados reais -> Dashboard mostra metricas ao vivo. Culmina com deploy staging e vendedor piloto usando o sistema.

## Contexto

<!-- Source: Conclave Mind Clone consultation (2026-04-14) -->
<!-- Context: Brownfield — Epic 6 DONE (Dashboard CRM luxury), backend API funcional -->

### O que ja existe (Epics 1-6 DONE)

**Backend (`apps/tocks-sales-ai/`):**
- Express API com webhook WhatsApp (HMAC, dedup LRU, Zod validation)
- BullMQ message queue (5 workers, Redis fallback sync)
- Claude AI pipeline: Mind Clone router, objection handler, response suggester, upsell engine
- Lead scorer, profile builder, follow-up scheduler (1h interval)
- LGPD compliance: anonymization, consent logs, audit trails
- 10 migrations SQL + 4 multi-tenant migrations
- CLI completa (ai, campaigns, conversations, customers, db, gdpr, leads, messages, orders, queue)
- Health check: DB, webhook, Redis, rate limiter — tudo passa

**Frontend (`apps/sales-dashboard/`):**
- Next.js 14 + shadcn/ui + Design System luxury (Navy+Gold)
- 4 telas: Dashboard Home, Leads, Conversas, Metricas
- Navigation com sidebar, Cmd+K, keyboard shortcuts
- 12 arquivos mock data em `src/data/`
- Tanstack Query + Zustand stores

### O que falta (Epic 7)

1. Supabase rodando com dados reais (migrations aplicadas, RLS ativo)
2. WhatsApp conectado a numero real (Meta Business API)
3. Claude AI respondendo conversas reais com contexto do Supabase
4. Dashboard consumindo Supabase ao inves de mock data
5. LGPD testado com dados reais
6. Deploy staging + vendedor piloto

## Usuarios

| Role | Acesso | Expectativa |
|------|--------|-------------|
| **Admin (dono Tocks)** | Tudo | Ver leads reais, metricas ao vivo, pipeline real |
| **Vendedor piloto** | Limitado | Receber leads via WhatsApp, ver sugestoes IA, responder pelo CRM |

## Stack

- Backend: Node.js + Express + BullMQ + Claude AI (Haiku routine / Sonnet 4 complex)
- Database: Supabase (Postgres + RLS + Realtime)
- Queue: Redis + BullMQ (fallback sync)
- Frontend: Next.js 14 + shadcn/ui + Tanstack Query + Zustand
- WhatsApp: Meta Business API (Cloud API)
- Deploy: Vercel (frontend) + Railway/Fly.io (backend)

## Env Vars Necessarias

```bash
# Backend (tocks-sales-ai)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
WHATSAPP_TOKEN=EAAx...
WHATSAPP_VERIFY_TOKEN=tocks_verify_2026
WHATSAPP_APP_SECRET=abc123...
WHATSAPP_PHONE_NUMBER_ID=123456789
WHATSAPP_BUSINESS_ACCOUNT_ID=987654321
CLAUDE_API_KEY=sk-ant-...
REDIS_URL=redis://...
ANONYMIZATION_SALT=random_salt_lgpd

# Frontend (sales-dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## Stories

---

### Story 7.1: Supabase Real — Schema, Migrations, RLS & Seed

**Status:** DONE
**Assigned:** @data-engineer + @dev
**Completed:** 2026-04-14
**Depends on:** Nenhuma (blocker para todas)
**Priority:** P0 (BLOCKER)

#### Story

Como admin do Tocks Sales AI,
eu quero que o banco de dados Supabase esteja rodando com schema real, RLS ativo e dados seed,
para que o sistema tenha persistencia real e segura.

#### Acceptance Criteria

- [x] Supabase project criado (ou existente confirmado) com URL e keys configuradas
- [x] Todas 10 migrations aplicadas em ordem (`001_create_customers` ate `010_create_rls_policies`)
- [x] 4 migrations multi-tenant aplicadas (`001_initial_schema` ate `004_seed_tocks_tenant`) + 001b fix function
- [x] RLS policies ativas e testadas:
  - Service role bypassa RLS (confirmado - ve tenants, products)
  - Anon key sem auth retorna vazio (RLS bloqueando)
  - Admin/Vendedor roles: requer auth users para testar completo
- [x] Seed data criado: 1 tenant (Tocks Custom) + 8 produtos catalogo
- [x] Indices de performance confirmados (migration 009)
- [x] `.env` configurado com credenciais reais (Supabase, Redis, Claude, WhatsApp)
- [x] Health check: DB OK, Redis OK, Claude Key SET, WhatsApp Token SET
- [ ] Pendente: WHATSAPP_APP_SECRET (nao bloqueia, mas necessario para Story 7.2)
- [ ] Pendente: user_profiles seed (admin + vendedor piloto — requer Supabase Auth users)

#### Dev Technical Guidance

**Arquivos chave:**
- `apps/tocks-sales-ai/migrations/` — 10 SQL files
- `apps/tocks-sales-ai/supabase/migrations/` — 4 multi-tenant SQL files
- `apps/tocks-sales-ai/.env` — credenciais Supabase
- `apps/sales-dashboard/.env.local` — NEXT_PUBLIC vars

**Ordem de execucao:**
1. Confirmar/criar projeto Supabase
2. Aplicar migrations core (001-010)
3. Aplicar migrations multi-tenant (001-004)
4. Verificar RLS via Supabase Dashboard
5. Inserir seed data via CLI ou SQL
6. Testar health check

**Risco:** Migration 010 (RLS) tem 8KB — revisar policies antes de aplicar.

#### File List

- [ ] `apps/tocks-sales-ai/.env`
- [ ] `apps/tocks-sales-ai/supabase/config.toml` (se necessario)
- [ ] `apps/tocks-sales-ai/migrations/_all_migrations.sql` (referencia)

---

### Story 7.2: WhatsApp Integration Real — Meta Business API

**Status:** TODO
**Assigned:** @dev
**Depends on:** Story 7.1 (Supabase real para persistir mensagens)
**Priority:** P0

#### Story

Como vendedor da Tocks Custom,
eu quero receber mensagens reais de clientes via WhatsApp no CRM,
para que eu possa responder rapido e nao perder leads.

#### Acceptance Criteria

- [ ] Meta Business App configurado com webhook URL apontando para backend
- [ ] `WHATSAPP_TOKEN`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET`, `WHATSAPP_PHONE_NUMBER_ID` configurados
- [ ] Webhook verification (`GET /webhook/whatsapp`) respondendo corretamente ao Meta challenge
- [ ] Mensagens inbound (text, image, audio) sendo recebidas e persistidas no Supabase:
  - Tabela `messages` com direction=inbound
  - Tabela `customers` criada/atualizada automaticamente
  - Tabela `conversations` criada/continuada
- [ ] Deduplicacao LRU funcionando (sem mensagens duplicadas)
- [ ] Signature verification HMAC-SHA256 ativo (`WHATSAPP_APP_SECRET` != empty)
- [ ] BullMQ processando mensagens async (ou sync fallback se Redis indisponivel)
- [ ] Rate limiting ativo (100 req/min no webhook, 60 msg/min no worker)
- [ ] Envio de mensagens outbound funcionando via Meta Cloud API
- [ ] Mensagem de teste enviada e recebida com sucesso end-to-end
- [ ] Logs Pino registrando mensagens com phone masking (LGPD)

#### Dev Technical Guidance

**Arquivos chave:**
- `apps/tocks-sales-ai/src/integrations/whatsapp-client.ts` — ja existe (476 lines)
- `apps/tocks-sales-ai/src/integrations/whatsapp-webhook.ts` — ja existe
- `apps/tocks-sales-ai/src/queue/` — BullMQ worker + producer
- `apps/tocks-sales-ai/.env` — WhatsApp credentials

**O que ja existe vs o que precisa:**
- Webhook handler: PRONTO (HMAC, dedup, Zod, BullMQ enqueue)
- WhatsApp client: PRONTO (send message, templates)
- O que falta: configurar credenciais reais, expor webhook via tunnel (ngrok/cloudflare), testar end-to-end

**Setup do tunnel para dev:**
```bash
# Opção 1: ngrok
ngrok http 3100
# Opção 2: Cloudflare Tunnel
cloudflared tunnel --url http://localhost:3100
```
Registrar URL no Meta Developer Console > Webhooks.

#### File List

- [ ] `apps/tocks-sales-ai/.env` (WhatsApp credentials)
- [ ] `apps/tocks-sales-ai/src/integrations/whatsapp-client.ts` (ajustes se necessario)
- [ ] `apps/tocks-sales-ai/src/integrations/whatsapp-webhook.ts` (ajustes se necessario)

---

### Story 7.3: AI Pipeline Real — Claude com Contexto Supabase

**Status:** TODO
**Assigned:** @dev + @architect
**Depends on:** Story 7.1 + 7.2 (dados reais + mensagens reais)
**Priority:** P0

#### Story

Como vendedor da Tocks Custom,
eu quero que a IA sugira respostas inteligentes baseadas no historico real do cliente,
para que eu possa responder com contexto e fechar mais vendas.

#### Acceptance Criteria

- [ ] Claude AI recebendo contexto real do Supabase em cada interacao:
  - Historico de conversas do cliente
  - Lead score atual
  - Produtos de interesse (se identificados)
  - Stage no pipeline
- [ ] Model routing funcionando: Haiku para respostas rotineiras, Sonnet 4 para complexas
- [ ] Response suggester gerando 2-3 opcoes de resposta por mensagem inbound
- [ ] Sugestoes salvas na tabela `ai_suggestions` com status (pending/accepted/rejected)
- [ ] Objection handler detectando objecoes (preco, prazo, concorrencia) e sugerindo respostas especificas
- [ ] Upsell engine identificando oportunidades de upgrade
- [ ] Cost tracking: log do custo por chamada Claude (tokens in/out)
- [ ] Fallback gracioso quando Claude API falha: notificar vendedor, nao travar conversa
- [ ] Circuit breaker ativo para Mind Clone integration
- [ ] Tempo de resposta da IA < 3 segundos para sugestoes

#### Dev Technical Guidance

**Arquivos chave:**
- `apps/tocks-sales-ai/src/assistant/` — Mind Clone router, objection handler, response suggester, upsell engine
- `apps/tocks-sales-ai/src/customer/lead-scorer.ts` — scoring para contexto
- `apps/tocks-sales-ai/src/customer/profile-builder.ts` — perfil do cliente

**Modelos configurados:**
- `AI_MODEL_ROUTINE=claude-3-haiku-20240307` — respostas simples, saudacoes, FAQ
- `AI_MODEL_COMPLEX=claude-sonnet-4-20250514` — objecoes, negociacao, upsell

**Custo estimado:**
- Haiku: ~$0.001/mensagem rotineira
- Sonnet 4: ~$0.01/mensagem complexa
- Budget mensal estimado: 500 msgs/dia x 30 dias = ~$15-50/mes

#### File List

- [ ] `apps/tocks-sales-ai/src/assistant/response-suggester.ts`
- [ ] `apps/tocks-sales-ai/src/assistant/objection-handler.ts`
- [ ] `apps/tocks-sales-ai/src/assistant/upsell-engine.ts`
- [ ] `apps/tocks-sales-ai/src/assistant/mind-clone-router.ts`
- [ ] `apps/tocks-sales-ai/.env` (CLAUDE_API_KEY)

---

### Story 7.4: Dashboard Live Data — Kill Mock, Connect Supabase

**Status:** TODO
**Assigned:** @dev
**Depends on:** Story 7.1 (Supabase real com dados)
**Priority:** P1

#### Story

Como admin do Tocks Sales AI,
eu quero ver dados reais no dashboard (leads, conversas, metricas, pipeline),
para que eu possa tomar decisoes baseadas em informacao real.

#### Acceptance Criteria

- [ ] Tanstack Query hooks conectados ao Supabase real (nao mais mock):
  - `useLeads()` — query `customers` table com filtros
  - `useConversations()` — query `conversations` + `messages` com realtime
  - `useMetrics()` — query agregada de KPIs
  - `usePipeline()` — query `customers` agrupado por stage
  - `useOrders()` — query `orders` table
- [ ] Supabase Realtime ativo para:
  - Novas mensagens (atualiza tela de Conversas ao vivo)
  - Novos leads (atualiza contadores no Dashboard Home)
  - Mudancas de stage (atualiza pipeline)
- [ ] Mock data files mantidos mas so usados em dev quando `NEXT_PUBLIC_USE_MOCK=true`
- [ ] Loading states e empty states implementados para dados reais
- [ ] Error handling para falhas de conexao Supabase (retry + toast)
- [ ] Paginacao real no lugar de array slicing
- [ ] Filtros de data funcionando com query real (nao filter client-side)
- [ ] Performance: dashboard carrega em < 2s com 100 leads

#### Dev Technical Guidance

**Arquivos a modificar:**
- `apps/sales-dashboard/src/data/` — 12 mock files (manter como fallback)
- `apps/sales-dashboard/src/hooks/` ou `src/lib/` — criar/adaptar hooks Tanstack Query
- `apps/sales-dashboard/src/providers/` — Supabase provider (se nao existir)
- `apps/sales-dashboard/.env.local` — NEXT_PUBLIC_SUPABASE_URL + KEY

**Padrao recomendado:**
```typescript
// src/hooks/use-leads.ts
export function useLeads(filters: LeadFilters) {
  return useQuery({
    queryKey: ['leads', filters],
    queryFn: () => supabase
      .from('customers')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .range(filters.offset, filters.offset + filters.limit - 1),
    staleTime: 30_000,
  })
}
```

**Feature flag:**
- `NEXT_PUBLIC_USE_MOCK=true` → usa mock data (dev sem Supabase)
- `NEXT_PUBLIC_USE_MOCK=false` ou ausente → Supabase real

#### File List

- [ ] `apps/sales-dashboard/src/lib/supabase.ts` (client singleton)
- [ ] `apps/sales-dashboard/src/hooks/use-leads.ts`
- [ ] `apps/sales-dashboard/src/hooks/use-conversations.ts`
- [ ] `apps/sales-dashboard/src/hooks/use-metrics.ts`
- [ ] `apps/sales-dashboard/src/hooks/use-pipeline.ts`
- [ ] `apps/sales-dashboard/src/hooks/use-orders.ts`
- [ ] `apps/sales-dashboard/src/hooks/use-realtime.ts`
- [ ] `apps/sales-dashboard/.env.local`

---

### Story 7.5: LGPD & Security Audit — Dados Reais

**Status:** TODO
**Assigned:** @qa + @dev
**Depends on:** Story 7.1 + 7.2 (dados reais fluindo)
**Priority:** P1

#### Story

Como admin do Tocks Sales AI,
eu quero garantir que o sistema esta em compliance LGPD com dados reais de clientes,
para que a Tocks Custom nao tenha exposicao juridica.

#### Acceptance Criteria

- [ ] Consent flow testado end-to-end:
  - Primeira mensagem WhatsApp inclui aviso de privacidade
  - Consentimento registrado na tabela `consent_log`
  - Opt-out funcional: cliente digita "PARAR" e dados sao anonimizados
- [ ] Anonymization testado:
  - `node bin/tocks.js gdpr anonymize --phone +55xxx` anonimiza dados reais
  - Dados anonimizados nao sao reversiveis (salt + hash)
  - Audit log registra operacao
- [ ] RLS testado com roles reais:
  - Vendedor A NAO ve leads do Vendedor B
  - Admin ve tudo
  - Tentativa de acesso indevido bloqueada e logada
- [ ] Rate limiting testado sob carga:
  - 100+ requests/min no webhook nao causa crash
  - Mensagens acima do rate limit retornam 429
- [ ] Logs nao contem dados pessoais (phone masking confirmado)
- [ ] WHATSAPP_APP_SECRET definido (nao mais warning)
- [ ] Backup strategy definida (Supabase point-in-time recovery ou pg_dump schedule)
- [ ] Relatorio de compliance gerado e salvo em `docs/compliance/`

#### Dev Technical Guidance

**Arquivos chave:**
- `apps/tocks-sales-ai/src/compliance/lgpd-manager.ts` — ja existe
- `apps/tocks-sales-ai/migrations/007_create_consent_log.sql`
- `apps/tocks-sales-ai/migrations/008_create_audit_log.sql`
- `apps/tocks-sales-ai/migrations/010_create_rls_policies.sql`

**BugHunter findings (10/Abr) ja corrigidos:**
- HIGH 1: anonymization DB update sem error check — CORRIGIDO
- HIGH 2: completeJSON cast unsafe — CORRIGIDO (Zod)
- MEDIUM: N+1 em previewAnonymize, timeout race — PENDENTE

#### File List

- [ ] `apps/tocks-sales-ai/src/compliance/lgpd-manager.ts`
- [ ] `docs/compliance/lgpd-audit-2026-04.md` (novo)

---

### Story 7.6: Staging Deploy + Vendedor Piloto

**Status:** TODO
**Assigned:** @devops + @dev
**Depends on:** Stories 7.1-7.4 (pipeline completa funcionando)
**Priority:** P1

#### Story

Como dono da Tocks Custom,
eu quero o CRM rodando em staging com 1 vendedor real usando o sistema,
para validar que funciona antes de escalar para toda equipe.

#### Acceptance Criteria

- [ ] Backend deployado em Railway/Fly.io com:
  - Webhook WhatsApp acessivel via HTTPS publico
  - Redis/Upstash conectado
  - Supabase conectado
  - Env vars de producao configuradas
  - Health check passando: `GET https://api.tocks-sales.ai/health`
- [ ] Frontend deployado na Vercel com:
  - Supabase real conectado
  - Dominio staging: `staging.crm.tockscustom.com.br` (ou similar)
  - Auth funcionando (login vendedor piloto)
- [ ] Webhook URL registrada no Meta Developer Console
- [ ] Vendedor piloto configurado:
  - User criado no Supabase (role: vendedor, tenant: tocks)
  - Login funcional no dashboard
  - WhatsApp do vendedor associado ao numero business
- [ ] Teste end-to-end com vendedor real:
  - Cliente envia mensagem WhatsApp
  - Mensagem aparece no dashboard em < 5 segundos
  - IA sugere resposta
  - Vendedor aceita/edita e envia pelo CRM
  - Lead atualizado no pipeline
  - Metricas refletem a interacao
- [ ] Monitoring basico:
  - Logs acessiveis (Railway/Fly.io logs ou Pino transport)
  - Alerta se health check falha
- [ ] Feedback do vendedor documentado apos 48h de uso

#### Dev Technical Guidance

**Deploy backend (Railway):**
```bash
# Dockerfile ja existente ou usar buildpack Node.js
railway link
railway up
railway variables set SUPABASE_URL=... WHATSAPP_TOKEN=... etc
```

**Deploy frontend (Vercel):**
```bash
cd apps/sales-dashboard
vercel --prod
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**Webhook URL final:**
- Meta Console > App Settings > Webhooks > Callback URL: `https://api.xxx/webhook/whatsapp`
- Verify Token: valor de `WHATSAPP_VERIFY_TOKEN`

#### File List

- [ ] `apps/tocks-sales-ai/Dockerfile` (se necessario)
- [ ] `apps/tocks-sales-ai/railway.toml` ou `fly.toml`
- [ ] `apps/sales-dashboard/vercel.json` (se necessario)
- [ ] `docs/deploy/staging-checklist.md` (novo)

---

## Dependencias entre Stories

```
7.1 (Supabase) ──┬──> 7.2 (WhatsApp) ──> 7.3 (AI Pipeline)
                  │                              │
                  └──> 7.4 (Dashboard Live) ─────┤
                                                  │
                  7.5 (LGPD) <── depende de 7.1+7.2
                                                  │
                  7.6 (Deploy) <── depende de 7.1-7.4
```

**Caminho critico:** 7.1 → 7.2 → 7.3 → 7.6
**Paralelo possivel:** 7.4 pode comecar junto com 7.2 (ambos dependem so de 7.1)

## Definition of Done (Epic)

- [ ] Supabase rodando com schema completo e RLS ativo
- [ ] WhatsApp recebendo e enviando mensagens reais
- [ ] Claude AI sugerindo respostas com contexto real
- [ ] Dashboard mostrando dados ao vivo (zero mock em staging)
- [ ] LGPD compliance verificado com dados reais
- [ ] 1 vendedor piloto usando o sistema por 48h+
- [ ] Feedback documentado e backlog do Epic 8 criado

## Conclave Decision Log

**Data:** 2026-04-14
**Experts consultados:** Sales Ops Analyst, CRM Manager, Lead Qualifier (SDR), Sales Closer (AE), Chris Voss
**Consenso:** Supabase + WhatsApp real sao inseparaveis e P0. Mock data precisa morrer. Pipeline end-to-end antes de qualquer feature nova. Testar com vendedor real > testes automatizados.
**Dissent:** Ordem Supabase vs WhatsApp (resolvido: paralelo). Staging vs direto piloto (resolvido: staging primeiro).
**Blind spots identificados:** LGPD dados reais, rate limits Meta API, custo Claude/conversa, fallback IA, backup Supabase.
