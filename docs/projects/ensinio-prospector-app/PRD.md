# PRD — Ensinio Prospector App

**Autor:** Luiz Fosc
**Data:** 2026-03-11
**Status:** Draft
**Versão:** 0.2.0

---

## 1. Problema

Hoje o pipeline de prospecção via WhatsApp funciona 100% via CLI (squad `ensinio-whatsapp-prospector`). O fluxo atual:

1. Exportar chat manualmente do WhatsApp (ZIP)
2. Rodar pipeline CLI (parse → score → outreach → sheets)
3. Abrir Google Sheets para ver resultados
4. Copiar mensagem → abrir WhatsApp → colar → enviar
5. Voltar na planilha e marcar como "enviado" manualmente
6. Criar contato no GHL manualmente

**Problemas:**
- Export manual de chat é trabalhoso e limitado (só 1 grupo por vez)
- Google Sheets não é feito para tracking de outreach
- Sem status de envio integrado
- Processo fragmentado entre 5 ferramentas (CLI, Sheets, WhatsApp, GHL, planilha)
- Contatos não chegam automaticamente no CRM (GHL)

---

## 2. Solução

App web focado em **extração + composição + envio** de mensagens de prospecção via WhatsApp.

**Papel do app:** Extrator + Compositor + Disparador
**Papel do GHL:** CRM pós-envio (pipeline, follow-up, nurturing, analytics)

### Fluxo

```
┌─────────────────────────────────────────────────────────┐
│              ENSINIO PROSPECTOR APP                       │
│                                                           │
│  1. Upload ZIP (export de chat do WhatsApp)               │
│  2. Parse mensagens → identifica prospects                │
│  3. Scoring automático (dual axis: client + partner)      │
│  4. Gera mensagens de outreach personalizadas (AI)        │
│  5. Preview + edição das mensagens                        │
│  6. Login WhatsApp Web (QR code) → Evolution API          │
│  7. ENVIA pelo WhatsApp Web (Evolution API)               │
│  8. Após envio → cria contato no GHL via API              │
│                                                           │
└────────────────────────┬────────────────────────────────┘
                         │ API (automático, pós-envio)
                         ▼
┌─────────────────────────────────────────────────────────┐
│              GHL (GoHighLevel)                           │
│                                                          │
│  - Contato criado com dados enriquecidos                 │
│  - Custom fields: score, classificação, temperatura      │
│  - Custom fields: grupo de origem, nicho, mensagem       │
│  - Tag: "Leads Fosc"                                     │
│  - Nota: mensagem enviada + data                         │
│  - Pipeline: prospect entra no funil automaticamente     │
│  - Follow-up: GHL gerencia via API oficial do WhatsApp   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Por que o envio é pelo app e não pelo GHL?**
- GHL só envia WhatsApp via API oficial (requer templates aprovados pela Meta)
- Mensagens de prospecção fria são personalizadas e não passam por aprovação de template
- Após o primeiro contato, GHL assume o relacionamento via API oficial

---

## 3. Público-alvo

- **Primário:** Time comercial Ensinio (Antonio + Fosc)
- **Secundário:** Qualquer pessoa que prospecta via grupos de WhatsApp
- **Futuro:** SaaS para equipes de vendas

---

## 4. Features (MVP)

### P0 — Essencial para lançar

| # | Feature | Descrição |
|---|---------|-----------|
| F1 | **Upload ZIP** | Upload de export de chat do WhatsApp (ZIP), parse automático |
| F2 | **Parse de mensagens** | Extrair mensagens do ZIP, identificar participantes e contatos |
| F3 | **Conexão WhatsApp** | Login via QR code (para envio), sessão persistente, reconexão automática |
| F4 | **Scoring automático** | Dual scoring (client + partner) com breakdown visível |
| F5 | **Dashboard de prospects** | Lista com score, classificação, temperatura, status |
| F6 | **Mensagens de outreach** | Geração automática de mensagens personalizadas (AI) |
| F7 | **Preview + edição** | Revisar e editar mensagem antes de enviar |
| F8 | **Envio direto** | Enviar pelo WhatsApp via Evolution API |
| F9 | **Sync GHL** | Após envio, criar contato no GHL via API com dados enriquecidos |

### P1 — Importante mas pode esperar

| # | Feature | Descrição |
|---|---------|-----------|
| F10 | Filtros e busca | Filtrar por score, temperatura, status de envio |
| F11 | Templates de mensagem | Criar/editar templates de outreach por classificação |
| F12 | Multi-grupo | Processar vários grupos e consolidar prospects |
| F13 | Bulk send | Enviar para múltiplos prospects com delay automático |

### P2 — Nice to have

| # | Feature | Descrição |
|---|---------|-----------|
| F14 | Export CSV | Exportar dados para planilha (fallback sem GHL) |
| F15 | Multi-user | Múltiplos usuários com contas separadas |
| F16 | GHL webhook de resposta | GHL notifica o app quando prospect responde |
| F17 | Analytics básico | Contadores: enviadas, respondidas, taxa de conversão |

---

## 5. Stack Técnica

### 5.1 Integração WhatsApp — Evolution API

**Decisão: Evolution API** (self-hosted via Docker)

| Critério | Evolution API |
|----------|--------------|
| Facilidade | Alta — API REST pura |
| Performance | Alta — sem browser |
| Comunidade BR | Forte |
| QR Login | Sim |
| Ler grupos | Sim |
| Enviar msgs | Sim |
| Deploy | Docker simples |

**Risco aceito:** API não-oficial viola ToS do WhatsApp. Mitigação:
- Uso pessoal/interno (não SaaS público no MVP)
- Rate limiting agressivo (max 20 msgs/hora)
- Delays aleatórios simulando comportamento humano (3-15s entre envios)
- Conta dedicada para prospecção (não conta pessoal)

### 5.2 Integração GHL — API v2

| Operação | Endpoint GHL |
|----------|-------------|
| Criar contato | `POST /contacts/` |
| Custom fields | `PUT /contacts/{id}` (score, classificação, temperatura, grupo) |
| Adicionar tag | `POST /contacts/{id}/tags` ("Leads Fosc") |
| Criar nota | `POST /contacts/{id}/notes` (mensagem enviada + data) |
| Adicionar ao pipeline | `POST /opportunities/` |

**Autenticação:** API Key do GHL (configurável por usuário)

### 5.3 Frontend

| Tecnologia | Justificativa |
|------------|---------------|
| **Next.js 15** (App Router) | SSR, API routes, deploy fácil |
| **Tailwind CSS** | Consistência com outros projetos |
| **shadcn/ui** | Componentes acessíveis e customizáveis |
| **Zustand** | State management leve |

### 5.4 Backend

| Tecnologia | Justificativa |
|------------|---------------|
| **Next.js API Routes** | Monolito simplificado |
| **Evolution API** (Docker) | Conexão WhatsApp Web |
| **Supabase** | PostgreSQL + Auth (simples) |

### 5.5 Banco de Dados

**Tabelas principais:**

| Tabela | Campos chave |
|--------|-------------|
| `whatsapp_sessions` | id, status, connected_at, phone_number |
| `groups` | id, wa_group_id, name, member_count, last_synced |
| `contacts` | id, group_id, name, phone, message_count, raw_messages (JSONB) |
| `prospects` | id, contact_id, client_score, partner_score, classification, temperature, analysis (JSONB) |
| `outreach_messages` | id, prospect_id, message, status (draft/sent/failed), sent_at |
| `ghl_sync` | id, prospect_id, ghl_contact_id, synced_at, sync_status |
| `settings` | id, ghl_api_key, ghl_pipeline_id, evolution_api_url, scoring_config (JSONB) |

### 5.6 Infraestrutura

| Componente | Onde |
|-----------|------|
| Frontend + API | VPS (ou Vercel) |
| Evolution API | Docker no mesmo VPS |
| Supabase | Cloud (free tier pro MVP) |

---

## 6. Reutilização do Squad Existente

| Componente do squad | Como reutilizar no app |
|---------------------|----------------------|
| Fuzzy name matching (scripts/) | Utilitário em `lib/phone-utils.ts` |
| Scoring engine (prospect-analyst) | Service `lib/scoring-engine.ts` |
| Message templates (outreach-writer) | Service `lib/outreach.ts` + Claude API |
| ICP/Red flags (ensinio-mind) | Seed data no Supabase |
| Quality gates (checklists/) | Validação no backend |
| Dual scoring (7x7 matrix) | Lógica em `lib/scoring-engine.ts` |

---

## 7. Telas do App

### 7.1 Login / QR Code
- Mostra QR code gerado pela Evolution API
- Status de conexão (conectando / conectado / desconectado)
- Botão "Reconectar" se sessão expirar

### 7.2 Upload de Chat
- Área de upload (drag & drop) para arquivo ZIP
- Preview do parse: nome do grupo, total de mensagens, participantes
- Botão "Processar" para iniciar scoring
- Histórico de uploads já processados

### 7.3 Dashboard de Prospects
- **Separado por grupo** — cada upload de ZIP cria um grupo distinto
- Seletor de grupo no topo (sidebar ou dropdown)
- Tabela com: nome, telefone, score (client/partner), classificação, temperatura, status
- Cores por temperatura (HOT=vermelho, WARM=laranja, COLD=azul)
- Preview da mensagem ao clicar
- Botões: "Editar mensagem", "Enviar", "Enviada" (status)
- Filtros: por score, temperatura, status

### 7.4 Preview de Mensagem
- Mostra mensagem gerada
- Campo de edição livre
- Botão "Regenerar" (nova mensagem via AI)
- Botão "Enviar" → dispara via Evolution API → sync GHL
- Score breakdown visível ao lado

### 7.5 Configurações
- GHL API Key
- GHL Pipeline ID
- Evolution API URL
- Scoring config (thresholds, pesos)

---

## 8. Milestones

### M1 — Fundação (1-2 semanas)
- [ ] Setup Next.js + Tailwind + shadcn/ui
- [ ] Setup Supabase (schema, RLS)
- [ ] Upload ZIP + parse de mensagens
- [ ] Dashboard básico de prospects (pós-parse)

### M2 — Pipeline Core (1-2 semanas)
- [ ] Scoring engine (port da lógica do squad)
- [ ] Dashboard de prospects com scores
- [ ] Preview de mensagens
- [ ] Deploy Evolution API (Docker local)
- [ ] QR code login funcional (para envio)

### M3 — Envio + GHL (1 semana)
- [ ] Geração de mensagens via Claude API
- [ ] Envio direto via Evolution API
- [ ] Integração GHL: criar contato pós-envio
- [ ] Tracking de status (draft → sent → synced)

### M4 — Polish (1 semana)
- [ ] Filtros e busca
- [ ] Reconexão automática WhatsApp
- [ ] Error handling robusto
- [ ] Configurações editáveis
- [ ] Deploy em produção (VPS)

---

## 9. Métricas de Sucesso

| Métrica | Target MVP |
|---------|-----------|
| Tempo do QR scan ao primeiro prospect | < 5 minutos |
| Prospects processados por grupo | Mínimo 50 |
| Taxa de envio (msgs enviadas / total) | > 80% |
| Contatos criados no GHL automaticamente | 100% dos enviados |
| Taxa de resposta | > 15% (baseline atual) |

---

## 10. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Ban do WhatsApp | Média | Alto | Conta dedicada, rate limiting, delays humanos |
| Evolution API breaking changes | Baixa | Médio | Pin versão, abstrair em service layer |
| GHL API changes | Baixa | Baixo | Service layer abstraindo endpoints |
| Qualidade do scoring sem AI | Média | Médio | Claude API para análise + regras fixas como fallback |

---

## 11. Decisões Tomadas

| # | Decisão | Escolha | Razão |
|---|---------|---------|-------|
| D1 | Integração WhatsApp | Evolution API | REST simples, comunidade BR, Docker |
| D2 | CRM | GHL (GoHighLevel) | Já usado pelo time, API v2 disponível |
| D3 | Envio de mensagens | Pelo app (não pelo GHL) | GHL só aceita API oficial (templates aprovados) |
| D4 | Papel do app | Extrator + Compositor + Disparador | GHL assume CRM pós-envio |

## 12. Decisões Tomadas (continuação)

| # | Decisão | Escolha | Razão |
|---|---------|---------|-------|
| D5 | Deploy | Tudo VPS | Evolution API precisa Docker, simplifica ter tudo junto |
| D6 | AI para scoring | Híbrido | Regras fixas pro scoring matemático + Claude API pra análise de mensagens e geração de outreach |
| D7 | Auth | Config local | MVP é uso interno (Fosc + Antonio). Supabase Auth pode ser adicionado depois |

---

*Documento vivo — será atualizado conforme decisões forem tomadas.*
