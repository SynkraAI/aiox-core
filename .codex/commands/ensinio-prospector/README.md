# Ensinio Prospector

Squad especializado em prospectar leads qualificados a partir de Google Sheets, enriquecendo dados via Instagram/site/checkout, cruzando com as 67 solucoes da Ensinio (5 pilares) e gerando mensagens personalizadas de outreach com sync para GoHighLevel CRM.

**Version:** 1.0.0 | **Entry Agent:** Atlas (prospector-chief) | **Model Tier:** haiku/sonnet/opus

---

## Pipeline

```
Phase 1: Fetch Lead ─────────── prospector-chief (haiku)
  │  Google Sheets → proximo lead "Fila"
  │
Phase 2: Enrich ──────────────── instagram-researcher (sonnet)
  │  EXA → Instagram + Site + Checkout detection
  │  [QG: enrichment-quality-checklist]
  │
Phase 3: Load KB ─────────────── (parallel)
  │  Carrega ensinio-solutions-kb.md (5 pilares, 67 features)
  │
Phase 4: Analyze & Score ─────── prospect-analyst (sonnet)
  │  Cross-ref perfil × 5 pilares Ensinio
  │  [QG: scoring-validation-checklist]
  │
Phase 5: Generate Outreach ───── outreach-writer (opus)
  │  Mensagem personalizada com contexto Instagram
  │
Phase 6: Validate Message ────── prospector-chief (sonnet)
  │  [QG: message-quality-checklist]
  │
Phase 7: Sync CRM ───────────── crm-syncer (sonnet)
  │  GoHighLevel → atualiza contato + nota
  │
Phase 8: Notify ──────────────── crm-syncer (haiku)
  │  Slack webhook → resumo do lead
  │
Phase 9: Mark Done ───────────── prospector-chief (haiku)
  │  Google Sheets → "Fila" → "Processado"
```

**9 fases** | **3 quality gates** | **Retry policy** com exponential backoff

---

## Agentes

| Agente | Persona | Modelo | Papel | Tier |
|--------|---------|--------|-------|------|
| **prospector-chief** | Atlas | sonnet | Pipeline Orchestrator & Lead Qualification Chief | Orchestration |
| **instagram-researcher** | Scout | sonnet | Instagram & Web Data Researcher | Enrichment |
| **prospect-analyst** | Minerva | sonnet | Solution Fit Analyst & Lead Scorer | Analysis |
| **outreach-writer** | Velvet | opus | Personalized Outreach Copywriter | Outreach |
| **crm-syncer** | Nexus | sonnet | CRM Sync & Notification Agent | Integration |

---

## Quick Start

### Pipeline Completo (1 lead)
```
/ensinio-prospector:workflows:sheets-instagram-pipeline
```

### Tasks Individuais
```
/ensinio-prospector:tasks:fetch-sheets-lead           # Buscar proximo lead
/ensinio-prospector:tasks:enrich-instagram             # Enriquecer dados
/ensinio-prospector:tasks:detect-checkout-platform     # Detectar plataforma checkout
/ensinio-prospector:tasks:analyze-and-score            # Analisar e scorer
/ensinio-prospector:tasks:generate-outreach            # Gerar mensagem
/ensinio-prospector:tasks:validate-outreach            # Validar mensagem
/ensinio-prospector:tasks:sync-to-crm                  # Sincronizar CRM
/ensinio-prospector:tasks:notify-team                  # Notificar Slack
/ensinio-prospector:tasks:mark-lead-done               # Marcar como processado
```

### Agentes
```
/ensinio-prospector:agents:prospector-chief            # Atlas - Orquestrador
/ensinio-prospector:agents:instagram-researcher        # Scout - Pesquisador
/ensinio-prospector:agents:prospect-analyst            # Minerva - Analista
/ensinio-prospector:agents:outreach-writer             # Velvet - Copywriter
/ensinio-prospector:agents:crm-syncer                  # Nexus - CRM/Notificacao
```

---

## Pilares de Solucao Ensinio (67 features)

| Pilar | Features | Destaques |
|-------|----------|-----------|
| **1. LMS / Area de Membros** | 23 | Vitrine streaming, comunidades, trilhas, SCORM, certificados MEC, aulas ao vivo |
| **2. Gamificacao** | 7 | 25 gatilhos, pontos XP, moedas virtuais, missoes, ranking, loja de recompensas |
| **3. Agentes de IA** | 11 | Vendas 24/7, tutor, suporte, multi-canal, follow-up |
| **4. Pagamentos Integrados** | 15 | Multi-checkout, PIX/boleto/cartao, split, afiliados, upsell, order bump |
| **5. White Label + App + Integracoes** | 13 | Marca propria, app iOS/Android, SSO, API REST, webhooks |

KB completo: `data/ensinio-solutions-kb.md`

---

## Quality Gates

| ID | Nome | Transicao | Tipo | Checklist |
|----|------|-----------|------|-----------|
| QG-001 | Enrichment Quality | Raw Lead -> Enriched Lead | Blocking | `checklists/enrichment-quality-checklist.md` |
| QG-002 | Scoring Validation | Enriched -> Scored Prospects | Blocking | `checklists/scoring-validation-checklist.md` |
| QG-003 | Message Quality | Draft -> Approved Message | Blocking | `checklists/message-quality-checklist.md` |
| QG-004 | CRM Sync | Approved -> GoHighLevel Updated | Warning | - |

---

## Pre-requisitos

### Credenciais (configurar em `.env`)
```bash
GOHIGHLEVEL_API_KEY=your_api_key_here
GOHIGHLEVEL_LOCATION_ID=your_location_id_here
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx/yyy/zzz
GOOGLE_SHEETS_ID=your_spreadsheet_id_here
```

### MCP Servers necessarios
- **Google Workspace** — acesso a Google Sheets (autenticado)
- **EXA** — pesquisa web e company research

### Planilha Google Sheets
Colunas esperadas na sheet de leads:
| Coluna | Conteudo |
|--------|----------|
| Nome | Primeiro nome |
| Sobrenome | Sobrenome |
| Empresa | Nome da empresa |
| Telefone | +55XXXXXXXXXXX |
| Email | Email do lead |
| Instagram URL | URL do perfil Instagram |
| Checkout URL | URL da pagina de checkout (opcional) |
| Ticket | Valor do ticket (opcional) |
| Status | "Fila" / "Processado" / "Erro" |

---

## IDS Reuse Report

| Categoria | REUSE | ADAPT | CREATE | Total |
|-----------|-------|-------|--------|-------|
| Agents | 0 | 3 | 2 | 5 |
| Tasks | 0 | 3 | 6 | 9 |
| Data | 3 (symlink) | 0 | 2 | 5 |
| Checklists | 2 (symlink) | 0 | 1 | 3 |
| Workflows | 0 | 0 | 1 | 1 |
| **Total** | **5** | **6** | **12** | **23** |

**Taxa de reuso:** 48% direto (REUSE+ADAPT) dos artefatos core

---

## Estrutura de Arquivos

```
ensinio-prospector/
├── config.yaml
├── README.md
├── agents/
│   ├── prospector-chief.md              # Atlas v2 - Orquestrador
│   ├── instagram-researcher.md          # Scout - Pesquisador (NOVO)
│   ├── prospect-analyst.md              # Minerva v2 - Analista
│   ├── outreach-writer.md               # Velvet v2 - Copywriter
│   └── crm-syncer.md                    # Nexus - CRM/Notificacao (NOVO)
├── tasks/
│   ├── fetch-sheets-lead.md             # Buscar lead da planilha
│   ├── enrich-instagram.md              # Enriquecer via Instagram/site
│   ├── detect-checkout-platform.md      # Detectar plataforma checkout
│   ├── analyze-and-score.md             # Analisar e scorer (ADAPT)
│   ├── generate-outreach.md             # Gerar mensagem (ADAPT)
│   ├── validate-outreach.md             # Validar mensagem (ADAPT)
│   ├── sync-to-crm.md                   # Sync GoHighLevel
│   ├── notify-team.md                   # Notificar Slack
│   └── mark-lead-done.md               # Marcar processado
├── workflows/
│   └── sheets-instagram-pipeline.md     # Pipeline completo (9 fases)
├── checklists/
│   ├── enrichment-quality-checklist.md  # QG-001
│   ├── scoring-validation-checklist.md  # QG-002 (symlink)
│   └── message-quality-checklist.md     # QG-003 (symlink)
├── data/
│   ├── ensinio-solutions-kb.md          # KB (symlink)
│   ├── message-rules.md                 # Message rules (symlink)
│   ├── scoring-criteria.md              # Scoring criteria (symlink)
│   ├── platform-signatures.yaml         # Checkout platform fingerprints
│   └── crm-field-mapping.yaml           # AIOS → GoHighLevel mapping
└── scripts/                             # (Fase 2 - daemon de automacao)
```

---

## Settings

| Setting | Valor |
|---------|-------|
| `ensinio_kb_source` | `data/ensinio-solutions-kb.md` |
| `min_score_threshold` | 3 |
| `max_rework_iterations` | 2 |
| `language` | pt-BR |

---

*Ensinio Prospector v1.0.0 - AIOS Squad*
*CLI First | Observability Second | UI Third*
