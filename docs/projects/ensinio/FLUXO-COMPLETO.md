# 🎯 Fluxo Completo: Ensinio WhatsApp Prospector v4.0

**Documento:** Explicação visual do fluxo de dados desde o ZIP do WhatsApp até o Google Sheets (com sincronização GHL)

---

## 📋 Resumo Executivo

```
ZIP do WhatsApp
     ↓
[PARSE] → Extrai contatos e mensagens
     ↓
[VALIDATE] → Valida dados
     ↓
[RESOLVE PHONES] → Pede números dos contatos
     ↓
[LOAD KB] → Carrega Ensinio solutions
     ↓
[ANALYZE] → Analisa com ICP + Red Flags + Scoring
     ↓
[VALIDATE SCORING] → Valida scores
     ↓
[WRITE OUTREACH] → Gera mensagens personalizadas
     ↓
[VALIDATE OUTREACH] → Valida mensagens
     ↓
[GHL SYNC] → Cria contatos, deals e envia messages no GHL
     ↓
[SHEETS] → Popula Google Sheets com resultados
     ↓
📊 RESULTADO FINAL
```

---

## 🔄 Fluxo Detalhado (Fase por Fase)

### ENTRADA: ZIP do WhatsApp
```
FILE: grupo-marketing-digital.zip
├── _chat.txt (principal)
├── profile.jpg
├── media/ (não usado)
└── vCard data (se disponível)
```

**Formatos suportados:**
- Android BR: `DD/MM/YYYY HH:MM - Nome: Mensagem`
- iOS BR: `[DD/MM/YYYY HH:MM:SS] Nome: Mensagem`

---

## 📍 FASE 1: PARSE (Extrair dados do ZIP)

**Agente:** Cipher (chat-parser)
**Modelo:** haiku
**Task:** `parse-chat-export.md`
**Tempo:** ~30-60s para 5000 mensagens

### O que acontece:
1. ✅ Descompacta o ZIP
2. ✅ Localiza `_chat.txt`
3. ✅ Detecta formato automaticamente (Android BR vs iOS BR)
4. ✅ Processa linha por linha com regex
5. ✅ Agrupa mensagens por remetente
6. ✅ Filtra mensagens do sistema:
   - "Mensagens e chamadas são protegidas"
   - "criou o grupo"
   - "adicionou/saiu/removeu"
   - "mudou ícone/descrição"
   - "<Mídia oculta>"
7. ✅ Extrai metadados do grupo

### DADOS SAÍDA (Estrutura JSON):
```json
{
  "group_name": "Mentoria 50k",
  "date_range": {
    "start": "2025-01-01",
    "end": "2026-02-19"
  },
  "total_messages": 5000,
  "total_contacts": 150,
  "contacts": [
    {
      "name": "João Silva",
      "phone": null,              // ← AINDA NÃO TEM NÚMERO
      "message_count": 45,
      "first_message_date": "2025-03-15T14:30:00",
      "last_message_date": "2026-01-20T18:45:00",
      "messages": [
        {
          "timestamp": "2025-03-15T14:30:00",
          "content": "Opa, tudo bem?"
        }
      ]
    }
  ]
}
```

### ⚠️ QUALITY GATE QG-001: Validação de Parse

**Blocking Checks (todos precisam passar):**
1. ✅ ZIP foi extraído corretamente?
2. ✅ Arquivo `_chat.txt` encontrado?
3. ✅ Arquivo não está vazio?
4. ✅ Pelo menos 1 contato extraído?
5. ✅ Pelo menos 10 mensagens (não-sistema)?
6. ✅ Mensagens do sistema foram filtradas?

**Se falhar:** → Trigger `handle-parse-errors.md` (recuperação manual)

---

## 📍 FASE 1b: VALIDATE PARSED DATA (Validar dados)

**Agente:** Cipher (chat-parser)
**Modelo:** haiku
**Task:** `validate-parsed-data.md`
**Tempo:** ~10-20s

### O que acontece:
1. ✅ Executa 6 checks BLOCKING
2. ✅ Executa 5 checks WARNING
3. ✅ Calcula métricas de qualidade
4. ✅ Gera relatório

### MÉTRICAS CALCULADAS:
```json
{
  "total_contacts": 150,
  "contacts_with_phone": 65,
  "phone_coverage": "43%",          // ← LOW! (target: >50%)
  "total_messages": 5000,
  "system_messages_filtered": 320,
  "avg_messages_per_contact": 33,
  "date_range_days": 410,
  "duplicate_contacts": 0,
  "encoding_quality": "100%"
}
```

### ⚠️ WARNING FLAGS (não bloqueiam, mas documentam):
- ❌ Phone coverage < 50% → FALTA LIGAR PARA MUITA GENTE!
- ⚠️ Encoding quality < 100% → Alguns nomes garbled
- ⚠️ Duplicate contacts detected → Precisam deduplicar
- ⚠️ Messages out of order → Cronologia inconsistente
- ⚠️ Missing group metadata → Falta informação

**Se PASS:** → Continuar
**Se FAIL:** → Halt com erro claro

---

## 📍 FASE 2: LOAD ENSINIO KB (Carregar conhecimento)

**Agente:** Atlas (prospector-chief)
**Modelo:** sonnet
**Task:** `load-ensinio-kb.md`
**Tempo:** ~5-10s (cached depois da primeira vez)
**Cache:** Reutilizado para próximos grupos

### O que acontece:
1. ✅ Carrega arquivo: `ensinio-mind/data/ensinio-solutions-kb.md`
2. ✅ Parse das 5 pillars de Ensinio:
   - Pillar 1: Sales & Revenue
   - Pillar 2: Marketing & Growth
   - Pillar 3: Product & Tech
   - Pillar 4: People & Culture
   - Pillar 5: Ops & Finance
3. ✅ Extrai 67+ features/soluções disponíveis
4. ✅ Carrega ICPs, red flags, argumentos

### DADOS CARREGADOS:
```
5 Pillars
├── Sales & Revenue (12 solutions)
├── Marketing & Growth (15 solutions)
├── Product & Tech (13 solutions)
├── People & Culture (16 solutions)
└── Ops & Finance (11 solutions)

+ ICPs (comportamento do cliente ideal)
+ Red Flags (18 tipos de clientes ruins)
  └── 4 BLOQUEADORES (excluem imediatamente)
+ Sales Playbook (5 objeções + respostas)
```

---

## 📍 FASE 2b: RESOLVE PHONE NUMBERS (Resolver telefones) ⚡ INTERATIVO

**Agente:** Atlas (prospector-chief)
**Modelo:** interactive (com processamento de imagens)
**Task:** `resolve-phone-numbers.md` ← **SOURCE OF TRUTH**
**Tempo:** ~10-20 minutos (depende do volume de imagens)
**Tipo:** ⚠️ BLOCKING INTERATIVO

### 📋 Documentação Completa

**⚠️ Para fluxo COMPLETO com imagens, fragmentação, leitura e normalização:**

→ Leia: **`squads/ensinio-whatsapp-prospector/tasks/resolve-phone-numbers.md`**

Contém:
- **Step 2b: Image-Based Resolution** (imagens → números)
- Fluxo de fragmentação (ImageMagick crop)
- Lógica de matching nome→telefone
- Processamento de contatos residuais
- Validação E.164
- Phone-books per group

### 🎯 Resumo (para este fluxograma)

1. ✅ Encontra contatos SEM número
2. ✅ Usuário fornece **pasta com imagens/screenshots**
3. ✅ **Fragmentação automática** (ImageMagick x1080px)
4. ✅ **Leitura de imagens** para extrair números
5. ✅ **Normalização para E.164** (+55XXXXXXXXXXX)
6. ✅ **Armazenamento em phone-book** (per group)
7. ✅ **Contatos residuais** → tentativa manual

### ✅ RESULTADO
```json
{
  "name": "João Silva",
  "phone": "+5531999887766",    // ← Extraído de imagem!
  "message_count": 45,
  "messages": [...]
}
```

---

**✅ PROVA REAL (Session 2026-03-10):**
- 230 contatos extraídos de 12 screenshots
- 50 matches automáticos
- 7 residuais resolvidos manualmente
- **100% coverage**

---

## 📍 FASE 3: ANALYZE & SCORE (Analisar e pontuar)

**Agente:** Minerva (prospect-analyst)
**Modelo:** sonnet
**Task:** `analyze-prospects.md`
**Tempo:** ~30-60s para 150 contatos

### O que acontece para CADA contato:
1. ✅ Lê perfil do contato (nome, telefone, mensagens)
2. ✅ Busca RED FLAGS (4 bloqueadores):
   - ❌ Vende produto físico? → Score 0 (excluir)
   - ❌ Apenas ebook? → Score 0 (excluir)
   - ❌ Afiliado/revenda? → Score 0 (excluir)
   - ❌ Quer "gerenciar tudo"? → Score 0 (excluir)
3. ✅ Se passou nos bloqueadores, analisa:
   - ICP match (demográfico + comportamental)
   - Fit de solução (qual pillar?)
   - Tipo de cliente (agência, coach, loja, etc)
   - Temperatura (1-10)
4. ✅ Calcula SCORE:
   ```
   Base: 5.0
   + ICP match: +1.0 até +2.0
   - Red flags: -0.5 até -2.0
   + Behavior signals: +0.5 até +1.0
   = FINAL SCORE: 3-10
   ```

### EXEMPLO: Análise de um contato
```json
{
  "name": "João Silva",
  "phone": "+5531999887766",
  "messages": ["Opa, tudo bem?", "Eu tenho um podcast", "Vendo cursos online"],

  "analysis": {
    "red_flags_blocking": [],              // ← Passou!
    "red_flags_warning": [
      "Menciona podcast (pode ser hobby)"
    ],
    "icp_match": {
      "score": 1.5,
      "reason": "Comportamento empreendedor, podcaster, vende info-produtos"
    },
    "pillar_fit": "Marketing & Growth",    // ← Qual solução Ensinio se aplica?
    "prospect_type": "Content Creator",
    "behavior_temperature": 7,             // ← Quão quente está?
    "final_score": 7.2,                    // ← Score final
    "recommended_argument": "Escalade seu podcast com funis de vendas"
  }
}
```

### SCORING BREAKDOWN:
```
Score 1-3: Frio (não encaixa, red flags, baixo engagement)
Score 4-5: Morno (interessante mas não prioritário)
Score 6-7: Quente (bom fit, deve contactar)
Score 8-10: Muito Quente (prioridade máxima!)
```

### ⚠️ QUALITY GATE QG-002: Análise Completa
- Todos os contatos foram analisados?
- Scores calculados corretamente?
- Red flags flagueados?
- Pillar recommendations atribuídas?

---

## 📍 FASE 3b: VALIDATE SCORING (Validar scores)

**Agente:** Atlas (prospector-chief)
**Modelo:** sonnet
**Task:** Incluído em `analyze-prospects.md`
**Tempo:** ~10-20s

### O que acontece:
1. ✅ Revisa scores gerados
2. ✅ Valida lógica de scoring
3. ✅ Verifica red flags
4. ✅ Testa argumentos recomendados

### ⚠️ QUALITY GATE QG-002.5: Validação Scoring
- Scores entre 1-10?
- Red flags identificados corretamente?
- Argumentos apropriados para cada score?

---

## 📍 FASE 4: WRITE OUTREACH (Escrever mensagens)

**Agente:** Velvet (outreach-writer)
**Modelo:** opus (modelo mais capaz!)
**Task:** `write-outreach.md`
**Tempo:** ~1-2 minutos para 150 contatos

### O que acontece para CADA contato:
1. ✅ Lê análise completa do contato
2. ✅ Lê argumentos de venda
3. ✅ Gera mensagem PERSONALIZADA:
   - Nome do contato
   - Menção específica do que faz
   - Argumento customizado para seu nicho
   - Call to action (WhatsApp, Calendly, etc)

### EXEMPLO: Mensagem Gerada
```
Opa João!

Achei demais seu podcast! 🎙️

Aproveito pra te convidar... A gente da Ensinio ajuda podcasters
como você a montar funis de vendas pra monetizar os ouvintes.

Tem muita gente ganhando 15-30k/mês com isso. Quer conversar?

Abs
```

### ⚠️ QUALITY GATE QG-003: Qualidade de Mensagem
- Mensagem é personalizada?
- Menciona dados reais do prospect?
- Tem call-to-action claro?
- Tem erros ortográficos/gramaticais?
- É apropriada para o nicho?

---

## 📍 FASE 4b: VALIDATE OUTREACH BATCH (Validar batch de mensagens)

**Agente:** Atlas (prospector-chief)
**Modelo:** sonnet
**Task:** `validate-outreach-batch.md`
**Tempo:** ~20-30s

### O que acontece:
1. ✅ Revisa todas as mensagens
2. ✅ Valida personalization
3. ✅ Verifica tone of voice
4. ✅ Aprova ou rejeita para envio

### RESULTADO:
```json
{
  "total_messages": 150,
  "approved": 145,
  "rejected": 5,
  "quality_score": 96.7,
  "rejection_reasons": [
    "João Silva - Mensagem genérica demais",
    "Maria Santos - Erro gramatical"
  ]
}
```

### ⚠️ QUALITY GATE QG-003 FINAL: Batch Validado
- Todas as mensagens foram revistas?
- Rejeitadas têm razão documentada?
- Quality score > 90%?

---

## 📍 FASE 5: GHL SYNC (Sincronizar com GoHighLevel) 🆕 v4.0

**Agente:** Atlas (prospector-chief)
**Modelo:** sonnet
**Task:** `sync-to-ghl.md`
**Tempo:** ~2-5 minutos (rate limited: 600ms entre requests)
**Status:** ⚠️ PODE FALHAR (API issues)

### PASSO 0: PERGUNTAR TAGS (OBRIGATÓRIO)
```
Qual tag deseja aplicar aos contatos no GHL?

1. "Leads Fosc" (default)
2. Outra tag
3. Múltiplas tags
→ Aguarda resposta do usuário
```

### PASSO 1: Criar/Buscar Contatos
Para cada prospect aprovado:

```
REQUEST: POST /contacts/
{
  "locationId": "XXXXXX",
  "firstName": "João",
  "lastName": "Silva",
  "phone": "+5531999887766",
  "source": "WhatsApp Group Prospector",
  "tags": ["Leads Fosc"],
  "customFields": {
    "whatsapp_group": "Mentoria 50k",
    "prospect_score": "7.2",
    "ensinio_pillar": "Marketing & Growth",
    "prospect_type": "Content Creator"
  }
}

RESPONSE:
{
  "contactId": "ABC123",
  "firstName": "João",
  "phone": "+5531999887766"
}
```

**Deduplicação:** Busca por telefone antes de criar (`GET /contacts/lookup/phone/{phone}`)
- Se existe → apenas adiciona tags
- Se não existe → cria novo

### PASSO 2: Criar Deals (Oportunidades)
Para cada contato criado:

```
REQUEST: POST /opportunities/
{
  "pipelineId": "xRqrV2LoT6E8iwLW4Syi",
  "pipelineStageId": "d3c25373-2b78-43d4-af3a-b4781f15874e",
  "locationId": "XXXXXX",
  "contactId": "ABC123",
  "name": "João Silva - Mentoria 50k",
  "source": "WhatsApp Prospector",
  "status": "open",
  "monetaryValue": 0
}

RESPONSE:
{
  "dealId": "DEAL123",
  "contactId": "ABC123",
  "pipelineId": "xRqrV2LoT6E8iwLW4Syi",
  "stage": "Para prospectar"  ← Estágio inicial
}
```

### PASSO 3: Enviar Mensagens (se `send_messages: true`)
Para cada deal criado:

```
REQUEST: POST /messages/
{
  "locationId": "XXXXXX",
  "contactId": "ABC123",
  "type": "WhatsApp",
  "message": "Opa João!\n\nAchei demais seu podcast! 🎙️\n...",
  "source": "WhatsApp Prospector"
}

RESPONSE: 200 OK
```

### ⚠️ POSSÍVEIS ERROS NO GHL SYNC

**BLOCKER CRÍTICO ENCONTRADO NA SESSÃO ANTERIOR:**
```
❌ POST /opportunities/ retorna HTTP 404 (Not Found)
   Endpoint: POST /opportunities/
   Versão API: 2021-07-28
   Status: 49 contatos falharam com 404
```

**POSSÍVEL SOLUÇÃO:** Tentar `/deals/` em vez de `/opportunities/`
- Contatos FUNCIONAM via `/contacts/` ✅
- Deals FALHAM via `/opportunities/` ❌
- Precisa investigar endpoint correto

### ⚠️ QUALITY GATE QG-005: GHL Sync
- Contatos criados no GHL?
- Deals criados no pipeline?
- Mensagens enviadas com sucesso?
- Rate limiting respeitado (600ms)?
- Deduplicação funcionando?

---

## 📍 FASE 6: POPULATE GOOGLE SHEETS (Preencher planilha)

**Agente:** Atlas (prospector-chief)
**Modelo:** sonnet
**Task:** `populate-sheet.md`
**Tempo:** ~2-5 minutos

### O que acontece:
1. ✅ Pega todos os prospects aprovados
2. ✅ Ordena por temperature score (mais quente primeiro)
3. ✅ Formata dados para Google Sheets
4. ✅ Popula abas conforme `sheet_mode`:

### SHEET MODES:
```
A) single_tab
   → Uma aba "All Prospects"
   → Todos os dados
   → Coluna C = Grupo de origem

B) new_tab_per_group (padrão)
   → Uma aba por grupo (ex: "Mentoria 50k", "VK Talks")
   → Uma aba "Summary" com estatísticas
   → Cada aba ordenada por temperature

C) append
   → Adiciona novas linhas após dados existentes
   → Não sobrescreve dados anteriores
```

### ESTRUTURA DO GOOGLE SHEETS:
```
Coluna A: Nome (primeiro nome apenas)
Coluna B: Telefone (+55XXXXXXXXXXX)
Coluna C: Grupo do WhatsApp
Coluna D: Nome/nicho do projeto
Coluna E: Explicação projeto
Coluna F: Mensagem WhatsApp
Coluna G: Link WhatsApp direto (URL-encoded)

Classificação: Por TEMPERATURE (mais quente primeiro)
```

### EXEMPLO DE LINHA FINAL:
```
| João Silva | +5531999887766 | Mentoria 50k | Podcast | ... | Opa João!... | https://wa.me/55... |
```

### ⚠️ QUALITY GATE QG-004: Sheet Population
- Dados populados corretamente?
- Número de linhas matches contatos aprovados?
- Ordenação por temperature OK?
- URLs de WhatsApp funcionam?

---

## 📊 RESULTADO FINAL

### Google Sheets Output
```
Spreadsheet ID: 124EQQAkmt9D7-49LbR-Jx64DhxdtCwceUQgqolk5ZFI

Dados consolidados:
├── Coluna A-G: Prospect data
├── Linha 1: Headers
├── Linhas 2+: Um prospect por linha
├── Ordenação: Temperature DESC (mais quente primeiro)
└── Filtros: Aplicáveis por coluna
```

### GoHighLevel
```
Contatos criados: 145
Deals criados: 145
Mensagens enviadas: 145
Tags aplicadas: "Leads Fosc"
Pipeline: "Qualificacao"
Stage: "Para prospectar"
```

### Relatório de Qualidade
```
Batch Summary:
├── Groups processed: 1
├── Total contacts parsed: 150
├── Total with phones: 98 (65%)
├── Red flags blocked: 8
├── Qualified prospects: 142 (95%)
├── Messages approved: 145 (100%)
├── GHL sync successful: 145
├── Sheet population successful: 145
└── Batch quality score: 96.7%
```

---

## ⚠️ POTENCIAIS PROBLEMAS IDENTIFICADOS

### 1. **BLOCKER CRÍTICO: GHL API Endpoint 404**
```
Status: ACTIVE
Severity: CRITICAL
Impact: GHL sync falha para deals

Error: POST /opportunities/ → 404 Not Found
Cause: Endpoint pode estar errado/desatualizado
Solution: Tentar /deals/ em vez de /opportunities/

Files affected:
- squads/ensinio-whatsapp-prospector/tasks/sync-to-ghl.md
- docs/projects/ensinio/sessions/2026-03-12-ghl-sync-test.md
```

### 2. **Low Phone Coverage Warning**
```
Atual: ~43-65% dos contatos têm telefone
Target: >80%
Impacto: Phase 2b (resolve phones) é obrigatória e manual
```

### 3. **Phone-book Management**
```
Risk: Confundir phone-books entre grupos
Mitigation: Armazenar em data/phone-books/{group-slug}.json
Current: Sem duplicação entre grupos ✅
```

### 4. **GHL Tag Prompt**
```
Requirement: SEMPRE perguntar ao usuário antes de sync
Current: Implementado com prompt interativo ✅
```

---

## 🔍 CHECKLIST: O QUE VOCÊ DEVE REVISAR

### Cada Fase Tem:
- [ ] Agente designado (Cipher, Atlas, Minerva, Velvet)?
- [ ] Modelo apropriado (haiku/sonnet/opus)?
- [ ] Task file documentada?
- [ ] Quality gate definido?
- [ ] Error handling documentado?
- [ ] Veto conditions claras?

### Pipeline Geral:
- [ ] Ordem das fases está correta?
- [ ] Dados fluem corretamente entre fases?
- [ ] Todos os quality gates são blocking quando necessário?
- [ ] GHL sync está antes do Sheets (ordem importa)?
- [ ] Batch pipeline permite múltiplos grupos?

### Integrações:
- [ ] GHL API endpoint está correto? ⚠️ **PROBLEMA CONHECIDO**
- [ ] Google Sheets API funcionando?
- [ ] Phone books sendo armazenados per group?
- [ ] Tags sendo aplicadas corretamente no GHL?

---

## 📞 PRÓXIMOS PASSOS PARA VOCÊ REVISAR

1. **Investigar GHL Endpoint 404**
   - Testar `/deals/` em vez de `/opportunities/`
   - Validar versão API (2021-07-28 pode estar desatualizada)
   - Documentar endpoint correto

2. **Validar Phone Coverage**
   - Phase 2b é obrigatória para contatos sem número
   - Usuário precisa estar disponível para responder

3. **Testar Batch Processing**
   - Múltiplos ZIPs sendo processados sequencialmente
   - Consolidação de resultados funcionando
   - Phone-books não sendo misturados

4. **Verificar GHL Sync Completo**
   - Contatos criados ✅
   - Deals criados ❌ (404 error)
   - Mensagens enviadas ⚠️ (depende de deal ser criado)

---

**Versão:** v4.0.0 (com GHL Integration)
**Data:** 2026-03-12
**Criado para revisão:** @dev review com @po + @architect
