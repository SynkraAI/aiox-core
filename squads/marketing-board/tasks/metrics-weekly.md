# Task: Metrics Weekly — OPES Marketing Arm

**Task ID**: metrics-weekly
**Agent**: @marketing-metrics
**Version**: 1.0.0

---

## Purpose

Análise semanal de performance do conteúdo publicado em Instagram e LinkedIn. Gera insights acionáveis e sugere ajustes no Content Map.

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ig_handle` | string | No | Handle do Instagram (default: josecarlosamorim) |
| `linkedin_data` | string | No | Dados manuais do LinkedIn |

---

## Workflow

### Step 1: Coletar Dados Instagram (Automatizado)

```
1. Usar Apify Instagram Scraper:
   - directUrls: ["https://www.instagram.com/{ig_handle}/"]
   - resultsType: "posts"
   - resultsLimit: 10
   - onlyPostsNewerThan: "7 days"
2. Extrair: likes, comments, timestamp, caption preview
```

### Step 2: Coletar Dados LinkedIn (Manual)

```
1. Perguntar ao José:
   - "Quantas impressões seus posts LinkedIn tiveram esta semana?"
   - "Algum post se destacou?"
2. Ou aceitar screenshot do dashboard
```

### Step 3: Análise de Padrões

```
1. Comparar temas: qual performou melhor?
2. Comparar formatos: confessional vs tutorial vs provocação
3. Comparar horários: manhã vs tarde
4. Comparar plataformas: IG vs LinkedIn
5. Identificar top 3 e bottom 3 posts
```

### Step 4: Gerar Relatório + Recomendações

```
1. Relatório de performance (template)
2. 3 ajustes acionáveis
3. Sugestão de atualização do Content Map
4. Salvar em docs/logs/
```

### Step 5: Calcular 3 KPIs Oficiais

```
Os 3 KPIs do setor de marketing (cobrados pelo CEO ao CMO):

KPI 1 — SAVE RATE (Remarkability Index)
  Instagram: (Saves + Shares) / Alcance × 100
  LinkedIn:  (Reposts) / Impressions × 100
  Meta: IG ≥ 3% | LinkedIn ≥ 2%

KPI 2 — DMs POR SEMANA (Permission Index)
  Número bruto de DMs recebidas de pessoas novas
  Fonte: Input manual do José
  Meta: Sem 1-4: 5/semana | Sem 5-8: 15/semana

KPI 3 — PURPLE COW AVERAGE (Quality Gate)
  Média semanal dos scores Purple Cow /5 de todos posts publicados
  Fonte: Registro do Gate 2.5 em cada daily-content
  Meta: ≥ 4.0/5 toda semana

Apresentar no relatório como:
| KPI | Meta | Atual | Status |
|-----|------|-------|--------|
| Save Rate IG | ≥3% | X% | 🟢/🟡/🔴 |
| Save Rate LI | ≥2% | X% | 🟢/🟡/🔴 |
| DMs/semana | ≥5 | X | 🟢/🟡/🔴 |
| Purple Cow Avg | ≥4.0 | X.X | 🟢/🟡/🔴 |
```

### Step 5.5: Token Health Check ⛔

```
VERIFICACAO OBRIGATORIA — Previne falha silenciosa de publicacao.

1. Ler ~/.config/aios/credentials.yaml
2. Verificar token LinkedIn:
   a. Se campo `linkedin.token_renewed_at` existe:
      - Calcular dias desde renovacao
      - Se > 50 dias → 🔴 ALERTA: "Token LinkedIn expira em ~10 dias"
      - Se > 40 dias → 🟡 AVISO: "Token LinkedIn expira em ~20 dias"
      - Se ≤ 40 dias → 🟢 OK
   b. Se campo nao existe:
      - 🟡 AVISO: "Data de renovacao LinkedIn nao registrada"
      - Recomendar: adicionar `token_renewed_at: YYYY-MM-DD` ao credentials.yaml
3. Verificar token Instagram:
   a. Page token Instagram e permanente (expires_at: 0)
   b. Verificar se token existe e nao esta vazio → 🟢 OK / 🔴 AUSENTE
4. Verificar UazAPI:
   a. Verificar se URL e token existem → 🟢 OK / 🔴 AUSENTE

Apresentar no relatorio como:
| Plataforma | Token | Status | Acao |
|------------|-------|--------|------|
| LinkedIn | Bearer OAuth | 🟢/🟡/🔴 | [acao se necessario] |
| Instagram | Page Token | 🟢/🔴 | [acao se necessario] |
| WhatsApp | UazAPI | 🟢/🔴 | [acao se necessario] |

Se qualquer token 🔴:
  → Notificar Jose via output do relatorio
  → Adicionar como blocker no proximo /weekly-content-plan
```

**Output:** Token health table no relatorio semanal

> ⚠️ Token LinkedIn expira ~60 dias. Sem este check, publicacao falha
> silenciosamente e @metrics perde dados da semana.

### Step 6: QA Gate — Forced Feedback Loop ⛔

```
GATE OBRIGATÓRIO — Semana não fecha sem isso.

1. @metrics gera 3 ajustes acionáveis (Step 4)
2. @metrics ATUALIZA data/content-map.yaml:
   a. Move temas underperforming para menor frequência
   b. Aumenta frequência de temas top performers
   c. Adiciona novas ideias baseadas em padrões
   d. Registra data da última atualização
3. @cmo REVISA as mudanças no Content Map:
   - [ ] Mudanças fazem sentido estratégico?
   - [ ] SVA continua sendo servida?
   - [ ] Não estamos perseguindo vanity metrics?
4. Content Map atualizado = NEXT WEEK STARTS

Se @metrics NÃO atualizar o Content Map → semana seguinte
usa queue antiga E registra "feedback loop falhou" no relatório.
```

**Output:** Content Map atualizado + aprovação do CMO

> ⚠️ Este gate GARANTE que dados viram ação.
> Sem ele, relatórios são documentação morta.

---

## Output

| Output | Path | Description |
|--------|------|-------------|
| Metrics Report | `docs/logs/YYYY-MM-DD_marketing-metrics.md` | Relatório semanal com KPIs |
| Content Map Update | `data/content-map.yaml` | Queue e pesos atualizados |

---

## Success Criteria

- [ ] Dados Instagram coletados via Apify
- [ ] Dados LinkedIn incorporados
- [ ] Top e bottom performers identificados
- [ ] 3 KPIs oficiais calculados (Save Rate, DMs, Purple Cow Avg)
- [ ] 3 ajustes acionáveis propostos
- [ ] Token health check executado (Step 5.5)
- [ ] Se token 🔴 → José notificado com ação de renovação
- [ ] Content Map ATUALIZADO (não apenas sugerido)
- [ ] CMO revisou mudanças no Content Map
- [ ] Relatório salvo em docs/logs/

---

*Task v2.1.0 — Weekly Analytics for OPES Marketing*
*QA Gate: Forced Feedback Loop (dados → content-map → CMO review)*
*v2.1.0: Adicionado Step 5.5 Token Health Check*
