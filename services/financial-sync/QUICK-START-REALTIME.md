# ⚡ Quick Start - Dashboard em Tempo Real

Guia super rápido para deixar o dashboard atualizado **em tempo real** com ClickUp.

---

## 🎯 O Que Você Vai Conseguir

```
✅ Dashboard atualiza a cada 5 segundos (sem recarregar)
✅ Webhooks instantâneos quando algo muda no ClickUp
✅ Histórico de sincronizações em tempo real
✅ Sincronização automática a cada 5 minutos (fallback)
✅ Zero perda de dados
```

---

## 🚀 Setup em 5 Minutos

### 1️⃣ Configurar Credenciais ClickUp

```bash
cd c:/Users/venda/aiox-core/services/financial-sync

# Editar .env
nano .env

# Ou abrir com editor (Windows):
# code .env
```

**Preencher:**

```env
CLICKUP_API_KEY=seu_api_key_aqui
CLICKUP_TEAM_ID=seu_team_id
CLICKUP_CRM_OFICIAL_ID=list_id_dos_clientes
CLICKUP_CRM_VENDAS_ID=list_id_das_vendas

# NOVA: Sincronização rápida (5 min)
SYNC_INTERVAL_MS=300000

# Salvar e sair
```

### 2️⃣ Iniciar Sistema

```bash
npm run start
```

**Output esperado:**

```
🚀 Iniciando Scheduler de Sincronização Automática
⏰ Intervalo: 5 minutos
🔌 Webhooks: desativados (use para tempo real)

🌐 API Server rodando em http://localhost:3001
📊 Dashboard: http://localhost:3001
```

### 3️⃣ Abrir Dashboard

```
http://localhost:3001
```

✅ **Pronto!** Dashboard sincroniza a cada 5 minutos.

---

## ⚡ Upgrade para Tempo Real (com Webhooks)

### Só se você quer **sincronização instantânea**

#### Passo 1: Expor API para a Internet

**Opção A: Ngrok (Recomendado)**

```bash
# Download: https://ngrok.com/download

# Em terminal novo:
ngrok http 3001

# Cópia a URL:
# https://abc123def456.ngrok.io
# ^
# | GUARDE ESSA URL
```

**Opção B: Cloudflare Tunnel**

```bash
npm install -g @cloudflare/wrangler
wrangler tunnel --url http://localhost:3001

# URL:
# https://xxx-yyy-zzz.cfargotunnels.com
```

#### Passo 2: Registrar Webhook no ClickUp

```bash
# No terminal (ou Postman):
TEAM_ID="seu_team_id"
API_KEY="seu_api_key"
WEBHOOK_URL="https://abc123.ngrok.io/api/webhooks"

curl -X POST \
  https://api.clickup.com/api/v2/team/$TEAM_ID/webhook \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "'$WEBHOOK_URL'",
    "events": ["taskUpdated", "taskStatusChanged", "customFieldValueChanged"]
  }'

# Esperado:
# {"id": "webhook_abc123", "health": {"status": "active"}}
```

#### Passo 3: Ativar no .env

```env
WEBHOOKS_ENABLED=true
CLICKUP_WEBHOOK_URL=https://abc123.ngrok.io/api/webhooks
CLICKUP_WEBHOOK_SECRET=opcional
```

#### Passo 4: Testar

```bash
# 1. Fazer uma alteração no ClickUp
#    (Ex: editar um custom field)

# 2. Assistir o dashboard atualizar em < 1 segundo ⚡

# 3. Verificar logs em: data/sync-log.json
```

---

## 📊 Como Usar o Dashboard

### Seções Principais

**1. Métricas (topo)**

```
💵 Faturado Total        → Total em negociação
✅ Recebido Total         → Dinheiro que já entrou
⏳ Em Aberto              → Ainda faltando receber
📊 Taxa de Recebimento   → % do faturado recebido
⏱️ DSO                     → Dias médios para receber
⚠️ Inadimplência          → % que não foi pago
📈 Total de Vendas        → Quantidade de deals
👥 Total de Clientes      → Quantidade de clients
```

**2. Abas (abaixo das métricas)**

```
📊 Vendas
├── ID, Cliente, Faturado, Recebido
├── Status (completed/open)
└── Vendedor

👥 Clientes
├── ID, Nome, Email, Telefone
├── Indústria
└── Risco (Baixo/Médio/Alto)

📋 Logs
├── Operação (sync, webhook, etc)
├── Status (sucesso/erro)
└── Timestamp
```

**3. Botões**

```
🔄 Sincronizar Agora  → Força sync imediato
🔃 Recarregar          → Atualiza página
```

---

## 🔄 Fluxo de Atualização

```
SEM WEBHOOKS (5 minutos):
┌─ Scheduler tick a cada 5 min
├─ Fetch dados do ClickUp
├─ Calcula métricas
├─ Salva em /data/*.json
└─ Dashboard auto-refresh a cada 10s mostra novos dados

COM WEBHOOKS (instantâneo):
┌─ Evento do ClickUp
├─ Webhook POST para /api/webhooks
├─ Debounce (max 1 sync a cada 10s)
├─ Fetch dados do ClickUp
├─ Salva em /data/*.json
├─ SSE push para dashboard
└─ Dashboard atualiza em < 1 segundo
```

---

## 📈 Monitorar Sincronizações

### Via Console

```bash
# Ver logs em tempo real
tail -f data/sync-log.json
```

### Via Dashboard

```
Aba "Logs de Sincronização" mostra:
├── Operação
├── Status (✅ sucesso / ❌ erro)
├── Detalhes (vendas count, clientes count)
└── Timestamp
```

### Via API

```bash
# Ver últimos 50 logs
curl http://localhost:3001/api/logs?limit=50
```

---

## ⚙️ Configurações Importantes

### Intervalo de Sincronização

```env
# Padrão: 5 minutos (300000 ms)
SYNC_INTERVAL_MS=300000

# Exemplos:
# 1 minuto:     60000
# 5 minutos:    300000  (padrão)
# 1 hora:       3600000
# 6 horas:      21600000
```

### Dashboard Refresh

```javascript
// Em dashboard.html:
setInterval(() => loadDashboard(), 10 * 1000); // 10 segundos

// Mudar para:
setInterval(() => loadDashboard(), 5 * 1000); // 5 segundos
```

### Webhook Debounce

```javascript
// Em webhook-receiver.js:
this.MIN_SYNC_INTERVAL = 10 * 1000; // 10 segundos mínimo

// Mudar para:
this.MIN_SYNC_INTERVAL = 30 * 1000; // 30 segundos (mais conservador)
```

---

## 🐛 Troubleshooting

### Dashboard não atualiza

```
✓ API está rodando? (http://localhost:3001/api/health)
✓ Credenciais ClickUp corretas em .env?
✓ Recarregar página (Ctrl+F5)?
✓ Abrir console (F12) → há erros?
```

### Webhook não funciona

```
✓ Ngrok rodando? (ngrok http 3001)
✓ URL pública acessível? (curl -I https://abc123.ngrok.io)
✓ Webhook registrado no ClickUp? (curl GET /webhook)
✓ Firewall bloqueando? (tente Cloudflare Tunnel)
```

### Sincronização lenta

```
✓ Mudar SYNC_INTERVAL_MS para menos em .env
✓ Ativar webhooks (instantâneo)
✓ Verificar internet (ClickUp API lento?)
```

---

## 📋 Checklist de Setup

```
[ ] .env configurado com credenciais ClickUp
[ ] npm run start rodando
[ ] Dashboard acessível em http://localhost:3001
[ ] Metrics carregando
[ ] Botão "Sincronizar Agora" funciona
[ ] Logs aparecem na aba "Logs"
[ ] (Opcional) Webhooks configurados
[ ] (Opcional) Ngrok/Cloudflare rodando
```

---

## 🎯 Próximos Passos

### Dashboard funcionando?

- ✅ Parabéns! Você tem sincronização a cada 5 minutos

### Quer tempo real?

- 📖 Leia: `WEBHOOKS-SETUP.md` (guia completo)
- 🔌 Configure webhooks ClickUp

### Quer mais funcionalidades?

- 📊 Gráficos avançados
- 📧 Alertas por email/Slack
- 📈 Relatórios PDF
- 🗄️ PostgreSQL (escalabilidade)

---

## 💡 Dicas Profissionais

1. **Mantenha ngrok rodando** em um terminal

   ```bash
   # Terminal dedicado para ngrok
   ngrok http 3001
   ```

2. **Monitore data/sync-log.json**

   ```bash
   # Ver logs em tempo real
   tail -f data/sync-log.json
   ```

3. **Use Cloudflare Tunnel em produção**

   ```bash
   # Melhor que ngrok para longo prazo
   wrangler tunnel --url http://localhost:3001
   ```

4. **Configure alertas** (próxima fase)
   - Slack quando inadimplência > 50%
   - Email com relatório diário

---

## ✨ Resultado Final

```
Dashboard ATUALIZADO EM TEMPO REAL
├── Métricas: a cada 5-10 segundos
├── Tabelas: a cada 10 segundos
├── Webhooks: < 1 segundo (com setup)
└── Logs: em tempo real

API REST funcionando:
├── /api/health
├── /api/sync
├── /api/sales
├── /api/clients
├── /api/metrics
├── /api/logs
├── /api/events (SSE para tempo real)
└── /api/webhooks (recebe eventos ClickUp)

Cron automático: a cada 5 minutos
Fallback seguro: funciona sem webhooks
```

---

**Sistema pronto para rodar! 🚀**

Qualquer dúvida, veja os arquivos:

- `README.md` - Documentação completa
- `WEBHOOKS-SETUP.md` - Setup detalhado de webhooks
- `IMPLEMENTATION-SUMMARY.md` - Detalhes técnicos

Boa sorte! 💪
