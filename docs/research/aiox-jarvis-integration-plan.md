# AIOX-JARVIS Integration Plan: MCP Precision + One AI Patterns

**Data:** 2026-03-30
**Status:** DRAFT
**Autor:** Orion (aios-master)

---

## Diagnostico do Estado Atual

### Ecossistema JARVIS (D:\jarvis)

| Componente | Tools | Protocolo | Status |
|------------|-------|-----------|--------|
| mcp-bridge (brain) | 16 tools | Stdio + HTTP/SSE | Operacional |
| mcp-ads-bridge | 52 tools | Stdio | Operacional |
| mcp-image-studio | 7 tools | Stdio | Operacional |
| Docker Gateway (EXA, Context7, Apify, Playwright) | ~20 tools | Docker MCP | Parcial (bugs secrets) |
| **TOTAL** | **~95 tools** | - | - |

### Problemas Identificados

1. **Tool Selection Errada** — 95 tools expostas, LLM erra na escolha. Tool descriptions consomem ~40-50% da context window
2. **Gaps de API** — Nem tudo tem MCP (Meta Ads Manager visual, dashboards, plataformas sem API)
3. **Zero Feedback Loop** — Quando agente erra uma tool call, nao aprende. Repete o erro
4. **OAuth Manual** — Cada bridge gerencia tokens independentemente (ads-bridge tem refresh, brain nao precisa, image studio usa API keys)
5. **Agentes Reativos** — So executam quando invocados. Sem triggers automaticos

---

## Plano de Integracao: 4 Camadas

### CAMADA 1: Semantic Router (PRIORIDADE MAXIMA)

**O que:** Camada de routing pre-MCP que filtra 95 tools para 3-5 relevantes por request.

**Tecnologia:** `aurelio-labs/semantic-router` (Python) ou implementacao JS nativa

**Como integra no AIOX-JARVIS:**

```
User Request
     |
     v
+-------------------+
| Semantic Router   |  <-- Nova camada em D:\jarvis\tool-router\
| (embedding-based) |
| ~10ms latency     |
+--------+----------+
         |
         | filtra por dominio:
         |   "ads" -> mcp-ads-bridge tools
         |   "image" -> mcp-image-studio tools
         |   "knowledge" -> mcp-bridge tools
         |   "browser" -> playwright/browser-use
         |   "code" -> native Claude Code tools
         |
         v
+-------------------+
| Tool Registry     |  <-- Ja existe: .aios-core/data/tool-registry.yaml
| (tier filtering)  |      Enriquecer com embeddings e route definitions
+--------+----------+
         |
         v
   3-5 tools expostas ao LLM
```

**Integracao concreta com tool-registry.yaml:**

```yaml
# Adicionar ao tool-registry.yaml
routing:
  engine: semantic  # semantic | keyword | hybrid
  model: local      # local (all-MiniLM-L6-v2) | openai (text-embedding-3-small)

  domains:
    ads:
      description: "Google Ads, Meta Ads, campaigns, budgets, keywords, bidding"
      tools: [google_ads_*, meta_ads_*, google_sheets_*]
      utterances:
        - "check campaign performance"
        - "create ad group"
        - "update budget"
        - "search terms report"

    knowledge:
      description: "Mind clones, consultations, insights, conclave"
      tools: [publish_conclave_report, get_analyst_brief, request_expert_consultation, ...]
      utterances:
        - "ask the expert"
        - "consult mind clone"
        - "publish insights"

    visual:
      description: "Image generation, transformation, background removal"
      tools: [generate_image, transform_image, upscale_image, ...]
      utterances:
        - "generate image"
        - "remove background"
        - "create banner"

    browser:
      description: "Web navigation, form filling, screenshot, scraping"
      tools: [playwright_*, browser_*]
      utterances:
        - "open website"
        - "take screenshot"
        - "fill form"

    code:
      description: "File operations, search, edit, build"
      tools: [Read, Write, Edit, Bash, Grep, Glob]
      utterances:
        - "read file"
        - "edit code"
        - "run tests"
```

**Implementacao:**

```
D:\jarvis\tool-router\
  ├── index.ts          # MCP server wrapper (intercepta ListTools)
  ├── router.ts         # Semantic routing engine
  ├── embeddings.ts     # Local embedding (ONNX) ou API
  ├── routes.yaml       # Route definitions (synced from tool-registry)
  └── package.json
```

**Valor:** Reduz context window de ~40K tokens (95 tools) para ~5K (5 tools). Precision sobe dramaticamente.

**Esforco:** 2-3 dias

---

### CAMADA 2: Browser Automation Fallback

**O que:** Quando MCP nao tem a action, agente usa browser real.

**Analise de opcoes:**

| Criterio | browser-use | Skyvern | agent-browser (Vercel) |
|----------|-------------|---------|----------------------|
| Maturidade | Alta (mais stars) | Media | Baixa |
| LLM Support | Claude, GPT-4o, qualquer | Vision LLMs | Claude Code nativo |
| Setup | Python + Chromium | Docker + API | npm install |
| Resistencia a layout changes | Baixa (seletores) | Alta (vision) | Media |
| Integracao JARVIS | MCP wrapper necessario | API REST | Ja CLI |
| Custo de tokens | Medio | Alto (vision) | Baixo |

**Recomendacao:** `browser-use` como primario + `Skyvern` como fallback para sites complexos.

**Como integra:**

```
MCP Tool Call
     |
     v
Tool exists? --YES--> Executa via MCP bridge
     |
     NO
     |
     v
+------------------+
| browser-use      |  <-- Nova camada: D:\jarvis\browser-agent\
| (Chromium/CDP)   |
| Navega site real |
+--------+---------+
         |
         | Site muito complexo / layout mudou?
         v
+------------------+
| Skyvern          |  <-- Fallback vision-based
| (Vision LLM)    |
+------------------+
```

**Casos de uso JARVIS imediatos:**
- **Tocks Sales AI:** Navegar painel WhatsApp Business, extrair metricas
- **Bretda:** Monitorar concorrentes (11ravens.com), capturar precos/layouts
- **Ads:** Acessar Meta Ads Manager para funcoes sem API (audience insights visuais)
- **Corporation:** Agentes acessam dashboards de analytics que so existem em browser

**Esforco:** 3-5 dias (browser-use) + 2 dias (Skyvern fallback)

---

### CAMADA 3: Feedback Loop (Error Learning)

**O que:** Quando um agente erra uma tool call, o erro e a correcao sao salvos. Todos os agentes aprendem.

**Integracao natural com bridge-data/:**

```
D:\jarvis\bridge-data\
  ├── conclave-reports/      # Ja existe
  ├── consultations/         # Ja existe
  ├── aios-insights/         # Ja existe
  ├── tool-errors/           # NOVO: error knowledge base
  │   ├── index.json         # Indice de erros conhecidos
  │   └── fixes/
  │       ├── ads-wrong-account.json
  │       ├── image-format-mismatch.json
  │       └── browser-selector-stale.json
  └── tool-usage-log/        # NOVO: usage analytics
      └── 2026-03-30.jsonl   # Append-only log
```

**Schema de erro:**

```json
{
  "id": "uuid",
  "tool": "google_ads_update_budget",
  "error_type": "wrong_account",
  "error_message": "Account 'bretda' not found",
  "context": "User asked to update Tocks budget but agent called with wrong account",
  "fix": "Always pass account='tocks' when discussing Tocks campaigns",
  "agent": "dev",
  "timestamp": "2026-03-30T10:00:00Z",
  "occurrences": 3
}
```

**Integracao com MCP bridge:**

Adicionar 3 tools ao `mcp-bridge`:
- `log_tool_error` — Registra erro + contexto
- `search_known_fixes` — Busca fix para erro similar (embedding search)
- `get_tool_usage_stats` — Analytics de uso por tool/agent

**Integracao com Mega Brain:**

O `auto_feedback_loop` ja deposita insights no inbox do Mega Brain. Extender para incluir tool errors como insight type:

```json
{
  "type": "tool_error_pattern",
  "content": "google_ads_update_budget falha 3x quando account nao especificado",
  "source": "tool-errors/ads-wrong-account.json"
}
```

**Esforco:** 2-3 dias

---

### CAMADA 4: Event-Driven Triggers (One AI Pattern)

**O que:** Agentes sao invocados automaticamente por eventos, nao so manualmente.

**Integracao com Corporation scheduler:**

O arquivo `D:\AIOS\.aios-core\core\corporation\scheduler.js` ja existe. Extender com:

```
Webhook/Event
     |
     v
+--------------------+
| Event Router       |  <-- Novo modulo em corporation/
| (webhook listener) |
+--------+-----------+
         |
         | Mapeia evento -> agente + task
         v
+--------------------+
| Corporation        |  <-- Ja existe: scheduler.js
| Scheduler          |
+--------+-----------+
         |
         v
   Agente executa task automaticamente
```

**Triggers concretos para projetos ativos:**

| Trigger | Evento | Agente | Task |
|---------|--------|--------|------|
| Novo lead Tocks | Webhook WhatsApp | @sales-ai | Preencher perfil |
| Budget 80% gasto | Google Ads alert | @analyst | Avaliar performance |
| PR aberto | GitHub webhook | @qa | Review automatico |
| Erro MCP repetido 3x | tool-errors count | @devops | Investigar/fix |
| Mind Clone atualizado | Mega Brain inbox | @brain-bridge | Sync knowledge |
| Campanha sub-performing | Ads metrics check | @traffic-master | Otimizar |

**Como receber webhooks:**

O `mcp-bridge/src/server.ts` ja tem HTTP server com SSE em `0.0.0.0:3099`. Adicionar endpoints:

```typescript
// POST /webhooks/:source — Recebe eventos externos
if (url.pathname.startsWith("/webhooks/") && req.method === "POST") {
  const source = url.pathname.split("/")[2]; // whatsapp, github, ads, etc.
  const body = await parseBody(req);
  await eventRouter.dispatch(source, body);
  res.writeHead(200).end(JSON.stringify({ queued: true }));
}
```

**Expor via Tailscale** (ja configurado no server.ts — `HOST = "0.0.0.0"`).

**Esforco:** 5-7 dias (mais complexo, depende das 3 camadas anteriores)

---

## Roadmap de Implementacao

### Fase 1: Quick Win (esta semana)
- [ ] **Semantic Router** — Criar `D:\jarvis\tool-router\` com route definitions
- [ ] Enriquecer `tool-registry.yaml` com domains e utterances
- [ ] Wrapper MCP que intercepta ListTools e filtra por contexto
- **Impacto:** Precision de tool selection sobe de ~60% para ~90%

### Fase 2: Observability (semana 2)
- [ ] **Feedback Loop** — Adicionar `tool-errors/` e `tool-usage-log/` ao bridge-data
- [ ] 3 novas tools no mcp-bridge (log_tool_error, search_known_fixes, get_tool_usage_stats)
- [ ] Hook pre_tool_use no AIOS que consulta known fixes antes de executar
- **Impacto:** Agentes param de repetir erros

### Fase 3: Browser Gap (semana 3-4)
- [ ] **browser-use** — Setup em `D:\jarvis\browser-agent\`
- [ ] MCP wrapper para expor como tool
- [ ] Integrar como fallback no tool-router (domain "browser")
- [ ] Skyvern como backup para sites vision-heavy
- **Impacto:** Cobre 100% dos gaps de API

### Fase 4: Event-Driven (mes 2)
- [ ] **Webhook endpoints** no bridge HTTP server
- [ ] Event Router no corporation/
- [ ] Triggers para projetos ativos (Tocks, Bretda, Serenity)
- [ ] Multi-channel notifications (Telegram/Slack para Corporation 24/7)
- **Impacto:** Sistema proativo, nao apenas reativo

---

## O que Absorver do One AI (Concreto)

| Pattern One AI | Como Implementar no JARVIS | Onde |
|----------------|---------------------------|------|
| Managed OAuth + auto refresh | Modulo compartilhado de token management | `D:\jarvis\shared\oauth-manager\` |
| JSON flows que agentes modificam | Workflows YAML com flag `mutable: true` | `.aios-core/data/workflow-chains.yaml` |
| 250+ integrations catalog | Mapeamento de APIs prioritarias por projeto | `tool-registry.yaml` expansao |
| Event-driven webhooks | Endpoints no bridge HTTP server | `mcp-bridge/src/server.ts` |
| Multi-channel deploy | Telegram bot + Slack webhook para Corporation | `corporation/notifications/` |
| Usage-based scaling | tool-usage-log analytics | `bridge-data/tool-usage-log/` |

---

## Decisao Critica: Python vs Node.js

O `semantic-router` original e Python. O ecossistema JARVIS e 100% TypeScript/Node.js.

**Opcoes:**
1. **Python sidecar** — semantic-router como processo separado, comunica via HTTP
2. **JS port** — Reimplementar routing em TS usando `@xenova/transformers` (ONNX embeddings no Node)
3. **Hybrid** — Router em Python, exposto como MCP server (stdio)

**Recomendacao:** Opcao 2 (JS port). Motivos:
- Ecosistema unificado (npm everywhere)
- `@xenova/transformers` ja roda embeddings locais no Node.js
- Menor latencia (sem IPC)
- Mais facil de manter

---

## Metricas de Sucesso

| Metrica | Atual | Meta Fase 1 | Meta Fase 4 |
|---------|-------|-------------|-------------|
| Tool selection accuracy | ~60% | ~90% | ~95% |
| Context window usado por tools | ~40% | ~10% | ~8% |
| Erros repetidos por sessao | 3-5 | 1-2 | 0-1 |
| Cobertura de acoes (API + browser) | ~70% | ~70% | ~95% |
| Tempo resposta tool routing | N/A | <50ms | <20ms |
| Agentes proativos (event-driven) | 0 | 0 | 6+ triggers |

---

*Documento gerado por Orion (aios-master) — 2026-03-30*
*Referencia: One AI patterns + MCP precision research*
