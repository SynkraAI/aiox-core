# Ensinio WhatsApp Prospector

Squad especializado em prospectar leads qualificados a partir de exports de grupos de WhatsApp, cruzando com as 67 soluções da Ensinio (5 pilares), ICPs, red flags e gerando mensagens personalizadas de outreach para Google Sheets, com envio via Evolution API.

**Version:** 5.0.0 | **Entry Agent:** Atlas (prospector-chief) | **Model Tier:** haiku/sonnet/opus

---

## What's New in v5.0.0

### Sheets-First Architecture
Google Sheets agora é a **fonte de verdade**, não o GHL.

```
ANTES (v4.0):  Parse -> Analyze -> Write -> GHL SYNC -> Sheets
AGORA (v5.0):  Parse -> Analyze -> Write -> SHEETS -> Evolution API -> GHL (opcional)
```

### Pipeline Renumerado (11 Fases Sequenciais)
Fases agora são sequenciais sem buracos: 1 a 11.

### Phase 10: Envio via Evolution API (INTERATIVO)
- Envia mensagens via Evolution API (self-hosted)
- **NUNCA envia sem confirmação explícita**
- Preview de 3 mensagens antes de confirmar
- Pacing mínimo 3s entre mensagens
- Pausa automática se erro > 20%
- Atualiza status no Sheets em tempo real
- Fallback: envio manual via links WhatsApp (Coluna G)

### Phase 11: GHL Sync (OPCIONAL)
- **NÃO envia mensagens** (crítico!)
- Apenas cria contatos + deals no GHL
- Preenche Colunas I+J no Sheets
- Fallback endpoint: `/deals/` se `/opportunities/` der 404

### 10 Colunas no Google Sheets
| Coluna | Conteúdo | Preenchida por |
|--------|----------|----------------|
| A | Nome | Phase 9 |
| B | Telefone (E.164) | Phase 9 |
| C | Grupo WhatsApp | Phase 9 |
| D | Projeto/Nicho | Phase 9 |
| E | Explicação | Phase 9 |
| F | Mensagem | Phase 9 |
| G | Link WhatsApp (pré-encoded) | Phase 9 |
| H | Status Envio | Phase 10 (ou manual) |
| I | Link GHL | Phase 11 |
| J | GHL Contact ID | Phase 11 |

---

## Pipeline v5.0 (11 Fases)

```
                                    ┌─────────────────┐
                                    │  Load KB (P3)   │
                                    │  Atlas/sonnet   │
                                    └────────┬────────┘
                                             │ parallel
┌──────────┐    ┌──────────┐    ┌────────────┴────────────┐
│ Parse(P1)│───>│Valid.(P2)│───>│  Resolve Phones (P4)    │
│  Cipher  │    │  Cipher  │    │  Atlas/interactive      │
│  haiku   │    │  haiku   │    └────────────┬────────────┘
└──────────┘    └──────────┘                 │
                              ┌──────────────┴──────────────┐
                              │    Analyze & Score (P5)      │
                              │    Minerva/sonnet            │
                              │    Dual Scoring (client +    │
                              │    partner) + Matriz 7x3     │
                              └──────────────┬───────────────┘
                                             │
                              ┌──────────────┴──────────────┐
                              │    Validate Scoring (P6)     │
                              │    Atlas/sonnet              │
                              └──────────────┬───────────────┘
                                             │
                              ┌──────────────┴──────────────┐
                              │    Write Outreach (P7)       │
                              │    Assembler/opus            │
                              │    Squad Delegation:         │
                              │    schwartz + ladeira +      │
                              │    copy-maestro + clone +    │
                              │    hopkins audit             │
                              └──────────────┬───────────────┘
                                             │
                              ┌──────────────┴──────────────┐
                              │    Validate Batch (P8)       │
                              │    Atlas/sonnet              │
                              └──────────────┬───────────────┘
                                             │
                              ┌──────────────┴──────────────┐
                              │    Populate Sheets (P9)      │
                              │    Atlas/sonnet              │
                              │    SOURCE OF TRUTH           │
                              │    BLOQUEADOR                │
                              └──────────────┬───────────────┘
                                             │
                              ┌──────────────┴──────────────┐
                              │    Send Evolution API (P10)  │
                              │    Atlas/sonnet              │
                              │    INTERATIVO (sempre perg.) │
                              └──────────────┬───────────────┘
                                             │
                              ┌──────────────┴──────────────┐
                              │    GHL Sync (P11)            │
                              │    Atlas/sonnet              │
                              │    OPCIONAL (sem msgs)       │
                              └─────────────────────────────┘
```

**11 fases** | **8 quality gates** | **Retry policy** com exponential backoff

---

## Parser Module Integration

**Package:** `@ensinio/whatsapp-parser` (standalone module)

```javascript
const { parseWhatsAppExport, validateParsedData, normalizePhoneNumber } = require('@ensinio/whatsapp-parser');
```

- `parseWhatsAppExport(zipPath)` — Parse ZIP -> ParsedExport
- `validateParsedData(data)` — Validate parsed output
- `normalizePhoneNumber(phone)` — Normalize phone to E.164
- `detectChatFormat(content)` — Auto-detect format (Android BR, iOS BR, etc)

**Implementation:** `lib/parse-chat-export-impl.js`
**Tests:** 82/82 passing, 86.75% coverage

---

## Agentes

| Agente | Persona | Modelo | Papel |
|--------|---------|--------|-------|
| **prospector-chief** | Atlas | sonnet | Pipeline Orchestrator (Phases 2-4, 6, 8-11) |
| **chat-parser** | Cipher | haiku | WhatsApp Parser (Phases 1-2) |
| **prospect-analyst** | Minerva | sonnet | Dual Scorer (Phase 5) |
| **outreach-writer** | Assembler | opus | Message Assembler (Phase 7, delega copy) |

---

## Quick Start

### Pipeline Completo (1 grupo)
```
*full-pipeline {zip_path} {group_name}
```

### Pipeline Batch (multiplos grupos)
```
*batch-pipeline [{zip1, grupo1}, {zip2, grupo2}, ...]
```

### Tasks Individuais
```
*parse {zip}             # Phase 1: Parsear ZIP
*analyze                 # Phase 5: Analisar + dual scoring
*write                   # Phase 7: Gerar mensagens (squad delegation)
*populate-sheet          # Phase 9: Popular Sheets (source of truth)
*send-evolution          # Phase 10: Enviar via Evolution API (pergunta antes)
*sync-ghl               # Phase 11: Sync GHL (opcional, sem msgs)
*status                  # Ver progresso do pipeline
```

### Envio Seletivo por Grupo (batch)
```
"Envie todas as mensagens do grupo Mentoria 50K"
→ Filtra aba "Mentoria 50K" no Sheets → Phase 10 so para esse grupo
```

---

## Quality Gates

| ID | Nome | Phase | Tipo |
|----|------|-------|------|
| QG-001 | Parse Validation | 2 | Bloqueador |
| QG-000.5 | Phone Resolution | 4 | Interativo |
| QG-002 | Analysis Complete | 5 | Bloqueador |
| QG-002.5 | Scoring Validation | 6 | Bloqueador |
| QG-003 | Message Quality | 8 | Bloqueador (max 2 iter) |
| QG-008 | Sheet Population | 9 | Bloqueador |
| QG-010 | Send Validation | 10 | Interativo |
| QG-005 | GHL Sync | 11 | Opcional |

---

## Red Flags (BLOQUEADORES — client_score = 0)

| Red Flag | Sinal | Efeito |
|----------|-------|--------|
| Produto físico | Vende roupas, canecas (ele mesmo) | client_score = 0 |
| Apenas ebook | Quer vitrine para PDF simples | client_score = 0 |
| Afiliado/revenda | Quer revender, não criar conteúdo | client_score = 0 |
| "Gerenciem tudo" | Quer terceirização total | client_score = 0 |

**NOTA:** Bloqueadores afetam APENAS client_score. Partner_score é avaliado independentemente.

---

## Output: Google Sheets

**Spreadsheet ID:** `124EQQAkmt9D7-49LbR-Jx64DhxdtCwceUQgqolk5ZFI`

Ordenado por **temperature score** (mais quente primeiro).

---

## Estrutura de Arquivos

```
ensinio-whatsapp-prospector/
├── config.yaml                          # Configuração v5.0
├── README.md                            # Este arquivo
├── agents/
│   ├── prospector-chief.md              # Atlas - Orquestrador
│   ├── chat-parser.md                   # Cipher - Parser
│   ├── prospect-analyst.md              # Minerva - Analista
│   └── outreach-writer.md               # Assembler (delega copy)
├── tasks/
│   ├── parse-chat-export.md             # P1: Parse ZIP
│   ├── validate-parsed-data.md          # P2: Validação parse
│   ├── handle-parse-errors.md           # Recovery: Erros parse
│   ├── load-ensinio-kb.md               # P3: Carregar KB
│   ├── resolve-phone-numbers.md         # P4: Resolver telefones
│   ├── analyze-prospects.md             # P5: Dual Scoring
│   ├── write-outreach.md                # P7: Squad delegation
│   ├── validate-outreach-batch.md       # P8: Validar batch
│   ├── populate-sheet-v5.md             # P9: Sheets (source of truth)
│   ├── send-via-evolution-api.md        # P10: Evolution API (NEW v5.0)
│   └── sync-to-ghl-v5.md               # P11: GHL Sync (opcional)
├── workflows/
│   ├── full-pipeline.yaml               # Pipeline 11 fases (v5.0)
│   └── batch-pipeline.yaml              # Batch multi-grupo (v5.0)
├── checklists/
│   ├── parse-validation-checklist.md    # QG-001
│   ├── phone-validation-checklist.md    # QG-000.5
│   ├── scoring-validation-checklist.md  # QG-002.5
│   ├── message-quality-checklist.md     # QG-003
│   └── ghl-sync-checklist.md            # QG-005
├── data/
│   ├── scoring-criteria.md              # v3.0 (dual scoring)
│   ├── message-rules.md                 # Regras de mensagem
│   └── phone-books/                     # Phone books per group
│       └── {group-slug}.json
├── lib/
│   └── parse-chat-export-impl.js        # Parser implementation
└── outputs/                             # Exemplo outputs
```

---

## Configuração

### Evolution API (.env)
```env
EVOLUTION_API_URL=https://your-evolution-api.example.com
EVOLUTION_API_KEY=your-api-key
EVOLUTION_INSTANCE=your-instance-name
```

### GHL (.env, opcional)
```env
GHL_API_TOKEN=pit-xxx
GHL_LOCATION_ID=xxx
GHL_PIPELINE_ID=xRqrV2LoT6E8iwLW4Syi
GHL_DEFAULT_STAGE_ID=d3c25373-2b78-43d4-af3a-b4781f15874e
```

### Squad Settings (config.yaml)
| Setting | Valor |
|---------|-------|
| `google_sheets_id` | `124EQQAkmt9D7-49LbR-Jx64DhxdtCwceUQgqolk5ZFI` |
| `ensinio_kb_source` | `ensinio-mind/data/ensinio-solutions-kb.md` |
| `phone_format` | E.164 |
| `default_country_code` | +55 |
| `min_score_threshold` | 3 |
| `max_rework_iterations` | 2 |
| `evolution.interval_ms` | 3000 |
| `evolution.error_threshold` | 20% |
| `evolution.confirm_before_send` | true (ALWAYS) |

---

## Dependências Externas (Squads)

### Mandatory
- **ensinio-mind** — KB Ensinio, ICPs, Red Flags, Arguments, Playbook
- **copywriting-squad** — Awareness, Clone selection, Draft, Audit
- **leandro-ladeira** — Big Idea por cluster de dor

### Optional
- **hormozi** — Hooks fortes
- **storytelling-masters-fosc** — Micro-stories
- **conversao-extrema** — Word mapping

---

*WhatsApp Prospector Ensinio v5.0.0 — Sheets-First | Evolution API | AIOS Squad*
