# Task: Run Digital Profiler

**Task ID:** run-profiler
**Version:** 2.0
**Execution Type:** Agent
**Purpose:** Create complete digital presence dossier for a local business
**Executor:** @digital-profiler
**Orchestrator:** @insight-chief
**Estimated Time:** 15-30 min

---

## Connected Artifacts

| Artifact | Path | Purpose |
|----------|------|---------|
| **Template** | `squads/insight/templates/dossie-tmpl.md` | Output DEVE seguir este template |
| **Scoring Rubric** | `squads/insight/data/scoring-rubric.yaml` | Critérios EXATOS de pontuação |
| **Tool Strategies** | `squads/insight/data/tool-strategies.yaml` | Primary → Fallback → Unavailable |
| **Niche Config** | `squads/insight/data/niche-config.yaml` | Portais e pesos por nicho |
| **QA Checklist** | `squads/insight/checklists/qa-checkpoint-checklist.md` | IN-QA-001 antes de entregar |

**REGRA:** Carregar scoring-rubric, tool-strategies e niche-config ANTES de iniciar a análise.

---

## Inputs

| Parameter | Type | Required | Validation | Example |
|-----------|------|----------|------------|---------|
| `business_name` | string | **OBRIGATÓRIO** | Não pode ser vazio | "Tecnoprinter" |
| `city` | string | **OBRIGATÓRIO** | Formato "Cidade/UF" | "Porto Alegre/RS" |
| `niche` | string | **OBRIGATÓRIO** | Deve existir em niche-config (ou usar "geral") | "outsourcing_impressao" |
| `url` | string | Opcional | URL válida com https:// | "https://tecnoprinter.com.br" |
| `social_profiles` | list | Opcional | Handles ou URLs | ["@tecnoprinterbr"] |

### Input Validation — VETO

```yaml
veto_conditions:
  - "business_name vazio → VETO: 'Informe o nome do negócio'"
  - "city vazio → VETO: 'Informe a cidade/UF'"
  - "niche vazio → VETO: 'Informe o nicho (ou use geral)'"
```

**Se QUALQUER campo obrigatório estiver faltando, NÃO iniciar análise. Pedir os dados.**

---

## Output

| Item | Path | Template |
|------|------|----------|
| Dossiê | `outputs/insight/{client-slug}/dossie-presenca-digital.md` | `dossie-tmpl.md` |

### Output Rules

```yaml
output_rules:
  path: "outputs/insight/{client-slug}/dossie-presenca-digital.md"
  client_slug: "nome do cliente em lowercase, sem acentos, hifenizado"
  file_name: "FIXO — dossie-presenca-digital.md (sem data no nome)"
  template: "OBRIGATÓRIO — seguir dossie-tmpl.md seção por seção"
  never: "NUNCA salvar dentro de squads/insight/ (código, não dados)"
```

---

## Steps

### Step 0: Validate Inputs & Load Config

```yaml
action: validate_and_load
mandatory: true
order: FIRST (antes de qualquer análise)

steps:
  - "Validar 3 campos obrigatórios (business_name, city, niche)"
  - "Carregar niche-config.yaml → lookup niche (ou 'geral')"
  - "Carregar scoring-rubric.yaml → ter critérios prontos"
  - "Carregar tool-strategies.yaml → saber ferramentas disponíveis"
  - "Definir client-slug: lowercase, sem acentos, hifenizado"
  - "Confirmar output path: outputs/insight/{client-slug}/dossie-presenca-digital.md"

veto:
  - "Campo obrigatório faltando → PARAR e pedir dados"
  - "Niche não encontrado em niche-config → usar 'geral' (não inventar)"
```

### Step 1: Cadastral Data Discovery

```yaml
action: discover_cadastral
tool_strategy: "cadastral_data"
metrics:
  - cnpj
  - razao_social
  - nome_fantasia
  - data_abertura
  - porte
  - capital_social
  - cnae
  - socios
  - endereco
  - telefone_email
  - servicos

note: "Estes dados vão na seção 'Dados Cadastrais' do template. Se não encontrados, marcar 'Não disponível' — NUNCA inventar."
```

### Step 2: Site Analysis (peso: 20)

```yaml
action: analyze_site
tool_strategy: "site_analysis + pagespeed"
scoring: "scoring-rubric.yaml → site"

metrics:
  - ssl_https
  - mobile_responsivo
  - pagespeed_mobile
  - meta_tags
  - heading_structure
  - cta_visible
  - tracking
  - whatsapp_button
  - blog_conteudo

depth: |
  NÃO analisar só a homepage. Verificar também:
  - Página de serviços/produtos (se existir)
  - Blog (se existir) — último post, frequência
  - Página de contato — WhatsApp, formulário, mapa
  Mínimo: homepage + 1 página interna

skip_if: "URL não fornecida → score = 0, nota: 'Site não informado pelo operador. Buscar via WebSearch.'"
```

### Step 3: Google Maps Analysis (peso: 20)

```yaml
action: analyze_maps
tool_strategy: "google_maps"
scoring: "scoring-rubric.yaml → google_maps"

metrics:
  - profile_claimed
  - completeness
  - reviews_count
  - reviews_rating
  - photos
  - posts_recent
  - hours_description

fallback_sequence: |
  1. Exa MCP: "google.com/maps/place {nome} {cidade}"
  2. WebSearch: "{nome} {cidade} Google Maps reviews"
  3. WebSearch: "{nome} {cidade} avaliações google"
  4. WebSearch: "{nome} {cidade} site:apontador.com.br OR site:benditoguia.com.br"
  5. Se tudo falhar: scoring_when_unavailable rules
```

### Step 4: Social Media Analysis (peso: 20)

```yaml
action: analyze_social
tool_strategy: "instagram + facebook + linkedin"
scoring: "scoring-rubric.yaml → social_media"

channels:
  instagram: { priority: critical_br, strategy: "instagram" }
  facebook: { priority: high, strategy: "facebook" }
  linkedin: { priority: "depends_on_niche", strategy: "linkedin" }
  tiktok: { priority: medium, strategy: "websearch" }
  youtube: { priority: low, strategy: "websearch" }

niche_override: |
  Consultar niche_config.channel_weights para ajustar prioridades.
  Exemplo: B2B → LinkedIn priority: critical (não medium)
```

### Step 5: Reputation Analysis (peso: 15)

```yaml
action: analyze_reputation
tool_strategy: "reclame_aqui"
scoring: "scoring-rubric.yaml → reputation"

channels:
  reclame_aqui:
    strategy: "reclame_aqui"
    note: "53% dos brasileiros consultam RA antes de comprar"
  google_reviews:
    note: "Usar dados coletados no Step 3 (Google Maps). Não duplicar buscas."
```

### Step 6: Niche Portal Analysis (peso: 15, condicional)

```yaml
action: analyze_niche_portals
tool_strategy: "niche_portals"
scoring: "scoring-rubric.yaml → niche_portals"
condition: "niche_config tem portals definidos"

steps:
  - "Consultar niche_config → listar portais do nicho"
  - "Para cada portal: aplicar strategy_per_portal"
  - "Se niche não tem portais: redistribuir peso (ver scoring-rubric)"

note: "Se nicho = 'geral' ou portals = [], redistribuir 15 pontos: +8 Maps, +7 Reputação"
```

### Step 7: NAP Consistency Check (peso: 10)

```yaml
action: check_nap
scoring: "scoring-rubric.yaml → consistency_nap"

check_across:
  - site
  - google_maps
  - instagram (bio)
  - facebook (info)
  - reclame_aqui
  - portais_de_nicho

metrics:
  - name: "Mesmo nome em todos os canais?"
  - address: "Mesmo endereço?"
  - phone: "Mesmo telefone/WhatsApp?"
  - hours: "Horários consistentes?"

note: "Usar dados JÁ coletados nos steps anteriores. NÃO fazer buscas adicionais."
```

### Step 8: Competitor Discovery & Comparison

```yaml
action: compare_competitors
tool_strategy: "competitors"
minimum: 1
target: 3

method:
  - "WebSearch: '{nicho} {cidade}' + '{serviço} {cidade}'"
  - "Exa: '{nicho} {cidade}' para complementar"
  - "Para cada concorrente: quick scan (site + maps + RA)"
  - "Tabela comparativa: score estimado por canal + vantagem competitiva"

output: "Tabela com 3 colunas de concorrentes + coluna do analisado"
```

### Step 9: Calculate Score & Prioritize Gaps

```yaml
action: calculate_score
scoring: "scoring-rubric.yaml"

formula: "Soma de todos os scores por canal (já ponderados)"
display: "Ver scoring-rubric.yaml → display_format (~ para estimado, sem ~ para verificado)"

gap_priority:
  critical: "Canal principal do nicho ausente ou score < 30% do máximo"
  alto: "Oportunidade de receita direta (reviews, Maps, portais)"
  medio: "Presença incompleta (redes sociais, NAP)"
  baixo: "Nice to have (TikTok, YouTube, LinkedIn para B2C)"

quick_wins: "Gaps onde impacto >= ALTO e esforço <= 2h"
estimated_scores: "Calcular score estimado após quick wins e após TODAS as ações"
```

### Step 10: Generate Dossier from Template

```yaml
action: generate_dossier
template: "squads/insight/templates/dossie-tmpl.md"
output_path: "outputs/insight/{client-slug}/dossie-presenca-digital.md"

rules:
  - "Seguir template seção por seção — NÃO pular seções"
  - "Se dados não disponíveis, marcar 'Não disponível' — NÃO omitir a seção"
  - "Incluir seção Limitações com TODOS os canais onde dados foram estimados/indisponíveis"
  - "Incluir seção Metadados com score de confiança e ferramentas utilizadas"
  - "Footer com assinatura do agente e data"
```

### Step 11: Self-QA (antes de entregar)

```yaml
action: self_qa
checklist: "squads/insight/checklists/qa-checkpoint-checklist.md → IN-QA-001"
mandatory: true
order: LAST (depois de gerar dossiê, ANTES de entregar)

checks:
  - "D1: Score coerente com dados?"
  - "D2: Breakdown por canal presente?"
  - "D3: Todos canais obrigatórios analisados?"
  - "D4: Portais de nicho (se aplicável)?"
  - "D5: Comparativo top 3?"
  - "D6: Gaps priorizados por impacto?"
  - "D7: Dados com fontes verificáveis?"
  - "D8: NAP verificada?"
  - "D9: Quick wins identificados?"

veto:
  - "Qualquer check blocking falhar → corrigir ANTES de entregar"
  - "Score sem justificativa → REJEITAR próprio output"
  - "Canal obrigatório ignorado → completar"

output: "Adicionar resultado do self-QA na seção Metadados"
```

---

## Veto Conditions (bloqueiam entrega)

| Condition | Action |
|-----------|--------|
| Campo obrigatório faltando no input | PARAR, pedir dados |
| Score sem breakdown justificado | Não entregar |
| Canal obrigatório não analisado | Completar antes de entregar |
| Dados inventados (sem fonte) | Remover ou marcar como estimativa |
| Comparativo de concorrentes ausente | Não entregar |
| Template não seguido | Reformatar output |
| Output salvo em path errado | Mover para path correto |
| Self-QA falhou em check blocking | Corrigir antes de entregar |

---

## Handoff

→ Salvar dossiê em `outputs/insight/{client-slug}/dossie-presenca-digital.md`
→ Retornar para @insight-chief para QA checkpoint (IN-QA-001)
→ Se chamado direto (sem insight-chief): executar self-QA (Step 11) como substituto

---

## Acceptance Criteria

- [ ] Input validado (3 campos obrigatórios)
- [ ] Niche config carregado
- [ ] Scoring rubric aplicado (scores com critérios documentados)
- [ ] Tool strategies seguidas (fallbacks executados quando primary falhou)
- [ ] Score 0-100 com breakdown por canal
- [ ] Todos canais obrigatórios analisados (site, Maps, social, reputação)
- [ ] Portais de nicho analisados (se aplicável)
- [ ] Top 3 concorrentes mapeados e comparados
- [ ] Gaps priorizados por impacto
- [ ] Quick wins identificados com estimativa de pontos
- [ ] NAP consistency verificada
- [ ] Dados com fontes verificáveis
- [ ] Template seguido (dossie-tmpl.md)
- [ ] Output salvo no path correto
- [ ] Self-QA executado (IN-QA-001)
- [ ] Seção Limitações preenchida (dados estimados/indisponíveis)
