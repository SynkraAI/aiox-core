# Ensinio WhatsApp Prospector

Squad especializado em prospectar leads qualificados a partir de exports de grupos de WhatsApp, cruzando com as 67 soluções da Ensinio (5 pilares), ICPs, red flags e gerando mensagens personalizadas de outreach para Google Sheets.

**Version:** 4.0.0 | **Entry Agent:** Atlas (prospector-chief) | **Model Tier:** haiku/sonnet/opus

---

## What's New in v4.0.0

### GoHighLevel Integration (Phase 7)
Antes de popular o Google Sheets, o pipeline agora sincroniza com o GHL:
- **Criar contatos** no GHL com tags customizaveis (default: "Leads Fosc")
- **Criar deals** no pipeline Qualificacao (stage "Para prospectar")
- **Enviar mensagens** de outreach via WhatsApp API do GHL
- **Tag prompt interativo**: SEMPRE pergunta ao usuario qual tag aplicar antes de sincronizar
- **Rate limiting**: batch com delay de 600ms entre requests
- **Deduplicacao**: busca por telefone antes de criar contato
- **Quality Gate QG-005**: valida sync completo

### Configuracao
```env
# squads/ensinio-whatsapp-prospector/.env
GHL_API_TOKEN=pit-xxx
GHL_LOCATION_ID=xxx
GHL_PIPELINE_ID=xRqrV2LoT6E8iwLW4Syi
GHL_DEFAULT_STAGE_ID=d3c25373-2b78-43d4-af3a-b4781f15874e
```

---

## What's New in v3.0.0

### 1. Phone Resolution (Phase 2b) — Interactive
WhatsApp exports mostram nomes de contatos salvos, não números. Nova fase interativa:
- Apresenta contatos sem número e pergunta ao usuário
- Valida formato E.164 automaticamente (`+55XXXXXXXXXXX`)
- Auto-normaliza inputs comuns (`31 99988-7766` → `+5531999887766`)
- **Phone-books PER GROUP** — "João" no Grupo A != "João" no Grupo B
- Reutiliza phone-book se o grupo já foi processado antes

### 2. ICP + Red Flags Intelligence (ensinio-mind v1.1)
- **Red flag pre-screen:** 4 BLOQUEADORES que eliminam antes de analisar (produto físico, só ebook, afiliado, "gerenciem tudo")
- **ICP match scoring:** Bônus por match demográfico e comportamental
- **Nichos top 5:** Business, Education, Health, Finance, Tech
- **Argumentos por score:** Cada faixa de temperatura recebe o argumento ideal

### 3. Multi-Grupo Batch
- Processar múltiplos ZIPs de uma vez
- Cada grupo com pipeline independente
- Consolidar numa única planilha (3 modos: single_tab, new_tab_per_group, append)
- KB carregado uma vez e reutilizado

### 4. Scoring v2.1
- Bônus ICP (faturamento, audiência, plataformas concorrentes)
- Penalidades red flags (-1 a -2)
- Argumento recomendado por score range
- Data sources: `ensinio-mind/data/` (ICPs, red flags, arguments, sales playbook)

---

## Pipeline (v4.0)

```
                                    ┌─────────────────┐
                                    │  Load KB (P2)   │
                                    │  Atlas/sonnet   │
                                    └────────┬────────┘
                                             │ parallel
┌──────────┐    ┌──────────┐    ┌────────────┴────────────┐
│ Parse(P1)│───>│Valid.(P1b│───>│  Resolve Phones (P2b)   │
│  Cipher  │    │) Cipher  │    │  Atlas/interactive      │
│  haiku   │    │  haiku   │    └────────────┬────────────┘
└──────────┘    └──────────┘                 │
                              ┌──────────────┴──────────────┐
                              │    Analyze & Score (P3)      │
                              │    Minerva/sonnet            │
                              │    + ICP match + Red flags   │
                              └──────────────┬───────────────┘
                                             │
                              ┌──────────────┴──────────────┐
                              │    Valid. Score (P3b)         │
                              │    Atlas/sonnet              │
                              └──────────────┬───────────────┘
                                             │
                              ┌──────────────┴──────────────┐
                              │    Write Outreach (P4)       │
                              │    Velvet/opus               │
                              └──────────────┬───────────────┘
                                             │
                              ┌──────────────┴──────────────┐
                              │    Valid. Batch (P4b)        │
                              │    Atlas/sonnet              │
                              └──────────────┬───────────────┘
                                             │
                              ┌──────────────┴──────────────┐
                              │    GHL Sync (P5) [NEW v4.0]  │
                              │    Atlas/sonnet              │
                              │    Contact + Deal + Message  │
                              │    + Tag prompt interativo   │
                              └──────────────┬───────────────┘
                                             │
                              ┌──────────────┴──────────────┐
                              │    Sheets (P6)               │
                              │    Atlas/sonnet              │
                              └─────────────────────────────┘
```

**10 fases** | **7 quality gates** | **Retry policy** com exponential backoff

---

## Agentes

| Agente | Persona | Modelo | Papel | Tier |
|--------|---------|--------|-------|------|
| **prospector-chief** | Atlas | sonnet | Pipeline Orchestrator & Lead Qualification Chief | Orchestration |
| **chat-parser** | Cipher | haiku | WhatsApp Export Parser & Data Validator | Processing |
| **prospect-analyst** | Minerva | sonnet | Solution Fit Analyst & Lead Scorer (+ ICP/Red Flag) | Analysis |
| **outreach-writer** | Velvet | opus | Personalized Outreach Copywriter | Outreach |

---

## Quick Start

### Pipeline Completo (1 grupo)
```
/ensinio-whatsapp-prospector:workflows:full-pipeline
```
Inputs: `{zip_path}` (path do ZIP exportado) + `{group_name}` (nome do grupo)

### Pipeline Batch (múltiplos grupos)
```
/ensinio-whatsapp-prospector:workflows:batch-pipeline
```
Inputs: Array de `{zip_path, group_name}` + `{sheet_mode}` (single_tab | new_tab_per_group | append)

### Tasks Individuais
```
/ensinio-whatsapp-prospector:tasks:parse-chat-export        # P1: Parsear ZIP WhatsApp
/ensinio-whatsapp-prospector:tasks:validate-parsed-data     # P1b: Validar dados parseados
/ensinio-whatsapp-prospector:tasks:load-ensinio-kb          # P2: Carregar KB Ensinio (5 pilares)
/ensinio-whatsapp-prospector:tasks:resolve-phone-numbers    # P2b: Resolver telefones (interativo)
/ensinio-whatsapp-prospector:tasks:analyze-prospects         # P3: Analisar, ICP match, red flags, scorer
/ensinio-whatsapp-prospector:tasks:write-outreach            # P4: Gerar mensagens personalizadas
/ensinio-whatsapp-prospector:tasks:validate-outreach-batch   # P4b: Validar batch de mensagens
/ensinio-whatsapp-prospector:tasks:sync-to-ghl               # P5: Sync GHL (Contact+Deal+Msg) [NEW v4.0]
/ensinio-whatsapp-prospector:tasks:populate-sheet            # P6: Popular Google Sheets
/ensinio-whatsapp-prospector:tasks:handle-parse-errors       # Recovery: Tratar erros de parse
```

---

## Phone Number Format (E.164)

```
+[country_code][area_code][number]
```

| Type | Format | Example |
|------|--------|---------|
| BR Mobile | +55[DDD]9[XXXX][XXXX] | +5511999887766 |
| BR Landline | +55[DDD][XXXX][XXXX] | +551133445566 |
| International | +[code][number] | +1234567890 |

Auto-normalization: `31 99988-7766` → `+5531999887766`

Phone-books: `data/phone-books/{group-slug}.json` (per group, never global)

---

## Data Sources

### From this squad (data/)
| Arquivo | Conteúdo |
|---------|----------|
| `scoring-criteria.md` | Critérios de scoring v2.1 (com ICP + red flags) |
| `message-rules.md` | Regras de mensagem |
| `phone-books/{slug}.json` | Phone books per group |

### From ensinio-mind (source of truth)
| Arquivo | Conteúdo |
|---------|----------|
| `ensinio-solutions-kb.md` | KB completo — 5 pilares, 67+ features |
| `ensinio-icps.md` | ICP detalhado (demográfico + comportamental) |
| `ensinio-red-flags.md` | 18 red flags + 4 BLOQUEADORES |
| `ensinio-arguments.md` | 3 argumentos principais + matriz de uso |
| `ensinio-sales-playbook.md` | 5 objeções + respostas + perguntas |
| `ensinio-sales-cycle.md` | Timeline, funil, aceleradores |

---

## Quality Gates

| ID | Nome | Transição | Tipo |
|----|------|-----------|------|
| QG-000.5 | Phone Resolution | Parsed -> Contacts with Phones | Interactive |
| QG-001 | Parse Validation | Raw ZIP -> Structured Contacts | Blocking |
| QG-002 | Analysis Complete | Contacts -> Scored Prospects | Blocking |
| QG-002.5 | Scoring Validation | Scored -> Validated Scores | Blocking |
| QG-003 | Message Quality | Draft -> Approved Message | Blocking |
| QG-005 | GHL Sync | Approved -> GHL (Contact+Deal+Msg) | Blocking |
| QG-004 | Sheet Population | Approved -> Google Sheets | Blocking |

---

## Red Flags (BLOQUEADORES)

| Red Flag | Sinal | Score |
|----------|-------|-------|
| Produto físico | Vender roupas, canecas, produtos tangíveis | 0 (excluir) |
| Apenas ebook | Quer vitrine para PDF simples | 0 (excluir) |
| Afiliado/revenda | Quer revender, não criar conteúdo | 0 (excluir) |
| "Gerenciem tudo" | Quer terceirização total | 0 (excluir) |

---

## Output: Google Sheets

**Spreadsheet ID:** `124EQQAkmt9D7-49LbR-Jx64DhxdtCwceUQgqolk5ZFI`

| Coluna | Conteúdo |
|--------|----------|
| A | Nome (primeiro nome) |
| B | Telefone (+55XXXXXXXXXXX) |
| C | Grupo do WhatsApp de origem |
| D | Nome/nicho do projeto |
| E | Explicação detalhada do projeto |
| F | Mensagem do WhatsApp (raw text) |
| G | Link WhatsApp direto (URL-encoded) |

Ordenado por **temperature score** (mais quente primeiro).

---

## Estrutura de Arquivos

```
ensinio-whatsapp-prospector/
├── config.yaml                          # Configuração do squad v3.0
├── README.md                            # Este arquivo
├── agents/
│   ├── prospector-chief.md              # Atlas - Orquestrador
│   ├── chat-parser.md                   # Cipher - Parser
│   ├── prospect-analyst.md              # Minerva - Analista
│   └── outreach-writer.md               # Velvet - Copywriter
├── tasks/
│   ├── parse-chat-export.md             # P1: Parse ZIP
│   ├── validate-parsed-data.md          # P1b: Validação parse
│   ├── handle-parse-errors.md           # Recovery: Erros parse
│   ├── load-ensinio-kb.md               # P2: Carregar KB
│   ├── resolve-phone-numbers.md         # P2b: Resolver telefones (NEW v3.0)
│   ├── analyze-prospects.md             # P3: Analisar + ICP + Red Flags (UPDATED v3.0)
│   ├── write-outreach.md                # P4: Escrever mensagens
│   ├── validate-outreach-batch.md       # P4b: Validar batch
│   ├── sync-to-ghl.md                  # P5: Sync GHL (NEW v4.0)
│   └── populate-sheet.md               # P6: Popular Sheets
├── workflows/
│   ├── full-pipeline.yaml               # Pipeline completo (9 fases) (UPDATED v3.0)
│   └── batch-pipeline.yaml             # Pipeline batch multi-grupo (NEW v3.0)
├── checklists/
│   ├── parse-validation-checklist.md    # QG-001
│   ├── phone-validation-checklist.md    # QG-000.5 (NEW v3.0)
│   ├── scoring-validation-checklist.md  # QG-002.5
│   ├── message-quality-checklist.md     # QG-003
│   └── ghl-sync-checklist.md           # QG-005 (NEW v4.0)
└── data/
    ├── ensinio-solutions-kb.md          # KB v2.0 (symlink to ensinio-mind)
    ├── message-rules.md                 # Regras de mensagem
    ├── scoring-criteria.md              # Critérios de scoring v2.1 (UPDATED v3.0)
    └── phone-books/                     # Phone books per group (NEW v3.0)
        └── {group-slug}.json            # Um arquivo por grupo
```

---

## Settings

| Setting | Valor |
|---------|-------|
| `google_sheets_id` | `124EQQAkmt9D7-49LbR-Jx64DhxdtCwceUQgqolk5ZFI` |
| `ensinio_kb_source` | `ensinio-mind/data/ensinio-solutions-kb.md` |
| `ensinio_mind_sources` | ICPs, red flags, arguments, playbook, cycle |
| `phone_books_dir` | `data/phone-books` |
| `phone_format` | E.164 |
| `default_country_code` | +55 |
| `min_score_threshold` | 3 |
| `max_rework_iterations` | 2 |
| `batch_size` | 50 |
| `language` | pt-BR |
| `ghl.pipeline_id` | `xRqrV2LoT6E8iwLW4Syi` (Qualificacao) |
| `ghl.default_stage_id` | `d3c25373-...` (Para prospectar) |
| `ghl.default_tags` | `["Leads Fosc"]` |
| `ghl.tag_prompt` | `true` (SEMPRE perguntar antes) |
| `ghl.send_messages` | `true` |
| `ghl.rate_limit_delay_ms` | 600 |

---

*WhatsApp Prospector Ensinio v4.0.0 - AIOS Squad*
