# 💰 Financial Sync - CLI-First Financial Dashboard

Sincronização em tempo real de dados financeiros com ClickUp (CRM OFICIAL + CRM-VENDAS).
Dashboard completo com API, Database, Cron automático e CLI.

## 🚀 Quick Start (3 passos)

### 1️⃣ Configuração

```bash
cp .env.example .env
# ✏️ Edite .env com suas credenciais ClickUp:
# CLICKUP_API_KEY=sua_chave_aqui
# CLICKUP_TEAM_ID=seu_team_id
# CLICKUP_CRM_OFICIAL_ID=list_id_clientes
# CLICKUP_CRM_VENDAS_ID=list_id_vendas
```

### 2️⃣ Iniciar Sistema (API + Dashboard + Cron)

```bash
npm run start
# ou
npm run dev
```

### 3️⃣ Abrir Dashboard

```
http://localhost:3001
```

## 📋 Comandos Disponíveis

### Sistema Completo (API + Scheduler + Dashboard)

```bash
npm run start          # Inicia API Server + Cron Scheduler + Dashboard
npm run dev            # Alias para start
```

### API Isolada

```bash
npm run api            # Apenas API Server (porta 3001)
```

### CLI (Sincronização Manual)

```bash
npm run sync           # Sincronizar tudo (ClickUp → Database)
npm run sync:sales     # Apenas relatório de vendas
npm run sync:clients   # Apenas relatório de clientes
npm run sync:help      # Ajuda de comandos
```

## 🏗️ Arquitetura

```
services/financial-sync/
├── index.js                    # 🎯 Orquestrador Principal (API + Scheduler)
├── config.js                   # ⚙️ Configuração centralizada
├── package.json
├── .env.example
│
├── api/
│   ├── server.js              # 🌐 HTTP Server (Node.js puro, sem Express)
│   └── dashboard.html         # 📊 Dashboard UI (HTML/CSS/JS vanilla)
│
├── cli/
│   ├── sync-service.js        # 🔄 Orquestrador de Sync (CLI + Persistência)
│   ├── sync-service-demo.js   # 📦 Demo com dados fake
│   ├── clickup-client.js      # 🔗 Cliente HTTPS ClickUp API
│   ├── mappers.js             # 🗺️ Transform (ClickUp → Schema)
│   └── scheduler.js           # ⏰ Cron Scheduler (sync a cada 6h)
│
├── db/
│   └── database.js            # 💾 Persistência (JSON files no /data)
│
└── data/                       # 📁 Database (JSON files)
    ├── sales.json
    ├── clients.json
    ├── metrics.json
    └── sync-log.json
```

## 📊 Funcionalidades Implementadas

### ✅ CLI-First Architecture

- Sincronização 100% via CLI
- Independente de UI
- Funciona sem dependências externas pesadas

### ✅ ClickUp Integration

- Cliente HTTPS nativo (sem SDK)
- Fetch de 2 listas: CRM-OFICIAL (clientes) + CRM-VENDAS (vendas)
- Parsing automático de custom fields
- Error handling com retry logic

### ✅ Data Mapping & Transformation

- Mappers automáticos (ClickUp → Schema local)
- Extração de: Deal Value, Paid Amount, Payment Method, Status
- Cálculo automático de: Faturado, Recebido, Em Aberto

### ✅ Financial Metrics

```
📊 Métricas Calculadas:
├── Faturado Total (sum de Deal Value)
├── Recebido Total (sum de Paid Amount)
├── Em Aberto (Faturado - Recebido)
├── Taxa de Recebimento (Recebido / Faturado %)
├── DSO - Dias Médios de Recebimento
├── Taxa de Inadimplência (% vendas não recebidas)
└── Total de Vendas & Clientes
```

### ✅ API REST (HTTP nativo)

```
📡 Endpoints:
├── GET  /                      Dashboard HTML
├── GET  /api/health            Health check
├── GET  /api/sync              Sincronizar (POST)
├── GET  /api/sales             Últimas vendas (JSON)
├── GET  /api/clients           Clientes cadastrados (JSON)
├── GET  /api/metrics           Métricas financeiras (JSON)
├── GET  /api/logs?limit=50     Logs de sincronização (JSON)
└── GET  /api/dashboard         Dados completos para UI (JSON)
```

### ✅ Database Persistence

- JSON file-based (sem dependências externas)
- Sincronização automática após cada sync
- Query access via Database class

### ✅ Cron Scheduler

- Sincronização automática a cada 6 horas
- Run imediato ao iniciar
- Next-run reporting
- Duplicate execution prevention

### ✅ Dashboard UI

- Métricas em tempo real (com gráficos de progresso)
- Tabelas de vendas com filtros
- Tabelas de clientes com análise de risco
- Logs de sincronização com status
- Sync manual (botão "Sincronizar Agora")
- Auto-refresh a cada 5 minutos
- Design responsivo (mobile-friendly)
- Sem dependências (HTML/CSS/JS vanilla)

## 🔐 Segurança

- ✅ API Key em `.env` (nunca em código)
- ✅ HTTPS para requisições ClickUp
- ✅ CORS habilitado para dashboard
- ✅ Sanitização de logs (sem exposição de IDs sensíveis)
- ✅ `.env` no `.gitignore`

## 📈 Fluxo de Dados

```
ClickUp API
    ↓
clickup-client.js (HTTPS GET)
    ↓
mappers.js (Transform ClickUp → Local)
    ↓
sync-service.js (Validação + Logging)
    ↓
database.js (Persiste em /data/*.json)
    ↓
API Server (Serve via HTTP)
    ↓
Dashboard UI (Visualização em tempo real)
```

## 🚀 Deployment

### Local Development

```bash
npm run start
# API: http://localhost:3001
# Dashboard: http://localhost:3001/dashboard
```

### Production

```bash
node index.js
# Configure em .env:
# API_PORT=3001
# API_HOST=0.0.0.0
```

## 📋 Próximos Passos

- [ ] Database SQL (PostgreSQL/MySQL) para melhor escalabilidade
- [ ] Autenticação (JWT/OAuth)
- [ ] Webhooks ClickUp (sync em tempo real)
- [ ] Relatórios PDF (export)
- [ ] Alertas (email/Slack quando inadimplência > threshold)
- [ ] Multi-tenant support
- [ ] React dashboard (upgrade de UI)

## 🐛 Troubleshooting

### "Cannot find module"

```bash
npm install  # Apenas Node.js stdlib necessário
```

### "ClickUp API Error: 401"

```
✏️ Verificar .env:
- CLICKUP_API_KEY válida?
- CLICKUP_TEAM_ID correto?
- CLICKUP_CRM_OFICIAL_ID existe?
- CLICKUP_CRM_VENDAS_ID existe?
```

### Dashboard mostra "Erro ao conectar com API"

```bash
# Verificar se API Server está rodando
npm run api
# Deve estar em http://localhost:3001
```

---

**CLI First Architecture** ✅
**Production Ready** ✅
**Zero External Dependencies** ✅ (only Node.js stdlib)
