# Meta Ads Dashboard — Contexto Completo do Projeto

## Resumo

Dashboard de gestao de campanhas Meta Ads com lead scoring automatizado e pesquisa de avatar interativa.
Dois projetos: **Mecanico Expert** e **Projeto VD** (principal, ativo).
Roda no VPS via Docker + Traefik.

## URLs

- Login: `https://jarvis.srv1266496.hstgr.cloud/meta-dashboard/login`
- Dashboard Home: `https://jarvis.srv1266496.hstgr.cloud/meta-dashboard/`
- Funil de Captacao: `https://jarvis.srv1266496.hstgr.cloud/meta-dashboard/funil`
- Acesso direto ProjetoVD: `https://jarvis.srv1266496.hstgr.cloud/meta-dashboard/funil?project=projetovd`

## Infraestrutura

- **VPS:** `ssh root@72.62.141.8` (Hostinger srv1266496.hstgr.cloud)
- **Container:** `meta-ads-dashboard` (porta 5001, healthy)
- **Codigo fonte VPS:** `/opt/meta-ads-dashboard/`
- **Docker Compose:** `/opt/jarvis-hub/docker-compose.yml`
- **Rebuild:** `cd /opt/jarvis-hub && docker compose build meta-dashboard && docker compose up -d meta-dashboard`
- **Stack:** React + tRPC + Express + Vite + pnpm
- **Dockerfile:** `/opt/meta-ads-dashboard/Dockerfile` (node:20-slim, pnpm 10.4.1)

## Credenciais (env vars no container)

- **META_ACCESS_TOKEN:** EAF2aZCdED4BsBQ... (token longo, no docker-compose)
- **META_AD_ACCOUNT_ID:** act_191737889662177
- **SUPABASE_URL:** https://orysnoohbahnmbxbvusl.supabase.co
- **SUPABASE_ANON_KEY:** eyJhbGci... (no docker-compose)
- **SUPABASE_SERVICE_ROLE_KEY:** eyJhbGci... (no docker-compose)
- **GOOGLE_SERVICE_ACCOUNT_KEY_PATH:** /app/config/service-account.json
- **GOOGLE_SERVICE_ACCOUNT_EMAIL:** jarvis-hub@jarvis-hub-489013.iam.gserviceaccount.com

## Google Sheets — ProjetoVD

### Planilhas de Leads
- **Leads Trafego:** `1pWLDLVSq1GA9H3AqKiVJcR7kFPj8KePw_1f6egvvCrw`
- Colunas: email, telefone, data, utmSource, utmCampaign, utmMedium, utmContent, utmTerm

### Planilhas de Survey (Pesquisa de Avatar)
- **Survey Trafego:** `1uucY0j9S1k-GCrJuKmwIH6_aVeyYtTdz0JwUtQszLmE`
- **Survey Organica:** `1h5ar6lKb4B0dWFqNVtEFlwB5YjF7sqh8COgi-mQxyB0`
- **Perguntas da pesquisa (6 perguntas reais):**
  1. "Ha quanto tempo voce mora fora?" (1-3 anos, 5-10 anos, 3-5 anos, Mais de 20 anos, 10-20 anos, Menos de 1 ano, Nao moro fora)
  2. "Qual e a sua renda mensal (na sua moeda)?" (Ate 1.000, Ate 3.000, Ate 5.000, Nao tenho renda, Ate 10.000, Acima de 10.000)
  3. "Em qual pais voce mora atualmente?" (Portugal, Estados Unidos, Inglaterra, Espanha, Canada, Italia, Irlanda, Franca, Suica, Alemanha)
  4. "Voce sabe realizar um diagnostico completo e preciso pra seu cliente?" (faixas em EUR/USD)
  5. "Qual seu Genero" (Mulher, Homem) — 90 respostas
  6. "Qual sua idade?" (35-44, 45-54, 25-34, Mais de 54) — 90 respostas
- **Total de respostas matched:** 1.211

### Planilha Principal (Mecanico Expert)
- **ID:** `1Zhh7klMyT7l8nKKtWhz6bU6mGrtvkoXXfevZdbhIeIw`
- **Abas:** Leads (A:H), Survey/Pesquisa (dinamica), Ext. Wpp (WhatsApp), Leads Whats
- **Service Account:** autenticacao via JWT, 15min cache

## 3 Fontes de Dados

### 1. Meta Graph API v24.0
- Campanhas, adsets, ads, insights (spend, impressions, clicks, leads, purchases, ROAS)
- Endpoint: `graph.facebook.com/v24.0/`
- Credenciais por projeto via `getProjectMetaCredentials(projectKey)`

### 2. Google Sheets API v4
- Leads: email, telefone, data, UTMs (source, campaign, medium, content, term)
- Survey: pontuacao total, dimensoes de scoring, UTMs
- WhatsApp: dados de grupo
- Matching lead<->survey por email (primario) ou telefone (fallback, normalizacao BR)

### 3. Supabase (PostgreSQL)
- `project_configs`: nome, key, pin_hash, meta tokens, sheets_config, funnel_config, scoring_params
- `sessions`: token, project_key, expires_at (8h)
- Auth: PIN 4 digitos, bcrypt hash, cookie `project_session`

## Arquivos Principais no VPS

### Backend (`/opt/meta-ads-dashboard/server/`)
- `routers.ts` (~740 linhas) — todos os endpoints tRPC
  - Estrutura: `appRouter = { system, auth (fecha linha ~86), meta (fecha linha ~730), launches (fecha linha ~800) }`
  - Endpoint `surveyBreakdown` esta DENTRO do `meta: router({})` (linha ~698)
- `leadScoring.ts` (673 linhas) — engine de scoring, MQL grades, CPL
- `_core/env.ts` — config multi-projeto, getProjectConfig()
- `_core/context.ts` — tRPC context com user/projectKey do cookie

### Services (`/opt/meta-ads-dashboard/server/services/`)
- `score-aggregator.ts` (~460 linhas) — agrega scores de Google Sheets por UTM
  - Funcao `getSurveyBreakdown()` — retorna breakdown de pesquisa com cross-filter bidirecional
  - Interfaces: `SurveyBreakdownResult`, `QuestionBreakdown`, `AnswerDistribution`, `UtmBreakdownItem`, `SurveyUtmBreakdown`
  - Aceita `answerFilter?: { question: string; answer: string }` para filtrar por resposta especifica
  - Retorna `utmBreakdown` com campanhas/adsets/ads que geraram aquelas respostas
- `sheets-reader.ts` — leitura de leads e surveys via Google Sheets API
  - Interface `Lead`: email, phone, dateStr, utmSource, utmCampaign, utmMedium, utmContent, utmTerm
  - Interface `SurveyEntry`: email, phone, answers (Record<string, string>), utms
- `metaInsights.ts` — insights diarios Meta API com filtros de data/campanha
- `project-auth.ts` — PIN validation, session management via Supabase
- `sheets-config.ts` — CRUD de sheets_config no Supabase (le do Supabase project_configs)
- `supabase.ts` — cliente Supabase

### Frontend (`/opt/meta-ads-dashboard/client/src/pages/`)
- `Home.tsx` (171K) — dashboard principal com campanhas, KPIs, lead scoring
- `Funil.tsx` (~1300 linhas) — funil de captacao completo
- `ProjectLogin.tsx` (5.7K) — login com seletor de projeto + PIN OTP

## Funil.tsx — Estrutura Detalhada

### Constantes no nivel do modulo (antes das funcoes)
- `DONUT_COLORS` (linha ~58) — array de 12 cores para graficos donut

### Componente principal: `export default function Funil()` (linha ~137)

### Estados React importantes:
- `selectedCampaigns: Set<string>` — campanhas selecionadas na tabela
- `selectedAdsets: Set<string>` — conjuntos selecionados na tabela
- `surveyAnswerFilter: { question: string; answer: string } | undefined` — filtro de resposta de pesquisa (cross-filter bidirecional)
- `scoreSince / scoreUntil` — filtros de data
- `scoreDatePreset` — preset de data (7d, 14d, 30d, mes, tudo)

### Queries tRPC:
- `trpc.meta.funnelData.useQuery` — dados gerais do funil
- `trpc.meta.leadScoring.useQuery` — lead scoring com filtros de data
- `trpc.meta.surveyBreakdown.useQuery` — breakdown de pesquisa com cross-filter
  - Envia: project, since, until, campaigns, adsets, answerFilter
  - Recebe: questions[], totalResponses, utmBreakdown

### Secoes da pagina (ordem de exibicao):
1. **Header** — nome do funil, orcamento, meta, periodo, ticket
2. **KPIs** — cards com metricas principais
3. **Projecoes** — projecoes de leads/gasto
4. **Consolidado de Captacao** — tabela resumo
5. **Detalhamento Diario** — tabela com colunas: Data, R$, Impressoes, Alcance, Cliques, Leads, Grupo Wpp, **% Grupo Wpp** (>=85% verde, 78-84% amarelo, <78% vermelho), CPM, CTR, Tx Conv, CPL, CPC
6. **Pesquisa de Leads (Section 8)** — graficos donut interativos com cross-filter bidirecional
   - 6 donuts: tempo fora, renda, pais, diagnostico, genero, idade
   - Click em fatia → filtra + mostra painel UTM breakdown
   - Badge de filtro ativo com botao X para limpar
   - Painel "Origem dos leads" com 3 colunas (Campanhas, Conjuntos, Criativos)
   - Click em campanha/conjunto no painel → seleciona na tabela de Lead Score
7. **Evolucao Diaria (Section 6)** — graficos de linha/barra (Investimento, Leads, CPL, Tx Conversao)
8. **Lead Score por Campanha (Section 7)** — tabelas interativas de campanha/conjunto/criativo com scores
9. **Gasto por Temperatura (Section 8)** — cards Quente/Remarketing, Frio/Prospeccao, Outros

### Mapeamento UTM → Meta:
- `utmTerm` → Campanha (campaign name)
- `utmMedium` → Conjunto de anuncios (adset name)
- `utmContent` → Criativo (ad name)
- Normalizacao: `normUtm()` remove prefixos, lowercase

## Sistema de Lead Scoring

### 4 Dimensoes
1. **Oficina** (tipo de negocio)
2. **Renda** (faturamento)
3. **Equipe** (tamanho)
4. **Diagnostico** (maturidade)

### MQL Grades
- A: 80-100 (2.60% conv), B: 60-79 (1.30%), C: 40-59 (0.65%), D: 20-39 (0.28%), E: 0-19 (0.10%)

### Parametros Financeiros
- TICKET: R$2.800, TARGET_ROAS: 3.0, MAX_CPA: R$933.33, CONSERVATIVE_MARGIN: 0.8

### Fluxo de Dados
```
Sheets(leads+surveys) -> sheets-reader.ts -> score-aggregator.ts (match por email/telefone)
-> agrupa por UTM (term=campanha, medium=adset, content=ad) -> avgScore por grupo
-> leadScoring.ts (MQL grades, CPL aceitavel) -> routers.ts (merge com Meta API) -> frontend
```

## Cross-Filter Bidirecional (Pesquisa × UTMs)

### Como funciona:
1. **Tabela → Donuts:** Selecionar campanha/conjunto na tabela de Lead Score filtra os donuts de pesquisa
2. **Donut → Painel UTM:** Clicar numa fatia do donut mostra de quais campanhas/conjuntos/criativos vieram os leads com aquela resposta
3. **Painel UTM → Tabela:** Clicar numa campanha/conjunto no painel UTM seleciona na tabela de Lead Score

### Fluxo tecnico:
```
Click fatia donut → setSurveyAnswerFilter({ question, answer })
→ surveyBreakdownQuery refaz com answerFilter
→ Backend filtra leads cuja survey.answers[question] === answer
→ Retorna questions[] (donuts atualizados) + utmBreakdown (campanhas/conjuntos/criativos)
→ Frontend exibe painel "Origem dos leads" com 3 colunas clicaveis
```

### Arquivos envolvidos:
- `score-aggregator.ts`: funcao `getSurveyBreakdown()` aceita `answerFilter`, retorna `utmBreakdown`
- `routers.ts`: endpoint `surveyBreakdown` dentro de `meta: router({})`, aceita `answerFilter` no input
- `Funil.tsx`: estado `surveyAnswerFilter`, Pie onClick, painel UTM breakdown

## Multi-Projeto

- Projetos cadastrados no Supabase `project_configs`
- Cada projeto tem: PIN, meta_access_token, meta_account_id, sheets_config
- `getProjectConfig()` em `env.ts` tenta `projects.json` primeiro (NAO EXISTE no VPS), depois env vars
- Credenciais Meta sao as mesmas env vars para ambos projetos (act_191737889662177)
- Projeto selecionado via URL param `?project=xxx` + cookie session como fallback

## Funcionalidades Implementadas (historico)

### Sessao 1 (PR #548):
- Arquitetura documentada (ARCHITECTURE-LEAD-SCORE.md)
- Analise de lead scoring (lead-scoring-analysis.md)
- PRD Lead Score Automation (PRD-LEAD-SCORE-AUTOMATION.md)

### Sessao 2:
- **Coluna % Grupo Wpp** na tabela de detalhamento diario
  - Calculo: (Grupo Wpp / Leads) * 100
  - Cores: >=85% verde, 78-84% amarelo, <78% vermelho
- **Graficos Donut de Pesquisa de Avatar** (Section 8)
  - 6 donuts com dados reais das planilhas Google Sheets
  - 1.211 respostas matched (lead → survey por email/telefone)
  - Endpoint `meta.surveyBreakdown` no tRPC router
  - Funcao `getSurveyBreakdown()` no score-aggregator.ts
- **Cross-Filter Bidirecional (Pesquisa × UTMs)**
  - Click em fatia do donut → filtra por resposta
  - Painel "Origem dos leads" com campanhas/conjuntos/criativos
  - Click em campanha/conjunto no painel → seleciona na tabela
  - Badge de filtro ativo com X para limpar

## Pendencias (backlog)

1. **Logica de desconto para nao-respondentes** — definir formula/taxa para leads sem survey
2. **Inversoes de scoring (3)** — 3 respostas na planilha com score invertido
3. **Redistribuicao de pesos (20/15/25/40)** — oficina=20%, renda=15%, equipe=25%, diagnostico=40%
4. **Merge Londres/Inglaterra** — unificar entradas duplicadas na planilha
5. **Diferenciacao Q4** — tratar Q4 separadamente no scoring

## Outros Containers no VPS

- `jarvis-hub` (porta 3000, healthy) — JARVIS cockpit
- `jarvis-terminal` (porta 7681) — Claude Code web terminal
- `aios-health-dashboard` (porta 8080, UNHEALTHY) — precisa fix
- `n8n` (porta 5678) — automacao

## GitHub

- Repo: `SynkraAI/aios-core` (origin, somente leitura para klevdm)
- Fork: `klevdm/aios-core` (remote `fork`, push OK)
- VPS remote: `root@72.62.141.8:/opt/aios-core` (remote `vps`)
- PR #548: https://github.com/SynkraAI/aios-core/pull/548

## Metodo de Deploy (patches no VPS)

Quando precisar fazer alteracoes no dashboard:
1. Criar script `.cjs` local (ex: `tmp-fix-xxx.cjs`) que le, modifica e reescreve os arquivos no VPS
2. `scp` o script para `/tmp/` no VPS
3. `ssh` + `node /tmp/fix-xxx.cjs` para executar
4. `cd /opt/jarvis-hub && docker compose build meta-dashboard && docker compose up -d meta-dashboard`
5. Verificar: `docker ps --filter name=meta-ads-dashboard --format '{{.Status}}'` → deve mostrar "healthy"
6. Testar no browser: `https://jarvis.srv1266496.hstgr.cloud/meta-dashboard/funil?project=projetovd`
