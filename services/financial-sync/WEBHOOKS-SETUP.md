# 🔌 ClickUp Webhooks Setup - Sincronização em Tempo Real

Guia completo para configurar webhooks do ClickUp e deixar o dashboard atualizado **instantaneamente**.

---

## ⚡ O Que São Webhooks?

Webhooks são notificações automáticas que o ClickUp envia quando algo muda:

- ✅ Venda criada/atualizada → Sincroniza imediatamente
- ✅ Cliente modificado → Atualiza no dashboard em < 1 segundo
- ✅ Deal recebido → Taxa de recebimento atualiza em tempo real

**Sem webhooks:** Sincronização a cada 5 minutos (delay)
**Com webhooks:** Sincronização instantânea (< 1 segundo)

---

## 🔧 Pré-requisitos

1. ✅ Sistema Financial Sync rodando (`npm run start`)
2. ✅ API Server em http://localhost:3001
3. ✅ ClickUp Team ID
4. ✅ ClickUp API Key com permissão para webhooks
5. ✅ URL pública para receber webhooks (importante!)

---

## 📋 Passo 1: Preparar URL Pública

### Opção A: Ngrok (Desenvolvimento)

```bash
# Instalar ngrok
# Download em: https://ngrok.com/download

# Expor porta 3001 para a internet
ngrok http 3001

# Saída esperada:
# Forwarding   https://abc123.ngrok.io -> http://localhost:3001
# ^- COPIE ESTA URL
```

**URL Webhook:** `https://abc123.ngrok.io/api/webhooks`

### Opção B: Cloudflare Tunnel (Gratuito)

```bash
# Instalar Cloudflare Tunnel
npm install -g @cloudflare/wrangler

# Expor porta 3001
wrangler tunnel --url http://localhost:3001

# Saída esperada:
# https://xxx-yyy-zzz.cfargotunnels.com
```

**URL Webhook:** `https://xxx-yyy-zzz.cfargotunnels.com/api/webhooks`

### Opção C: Production (AWS/Heroku/DigitalOcean)

```
URL Webhook: https://seu-dominio.com/api/webhooks
```

---

## 📌 Passo 2: Encontrar Team ID e Workspace ID

```bash
# Opção 1: Usar ClickUp API
curl -H "Authorization: pk_YOUR_CLICKUP_API_KEY" \
  https://api.clickup.com/api/v3/team

# Resposta:
{
  "teams": [
    {
      "id": "YOUR_TEAM_ID",
      "name": "Seu Time",
      ...
    }
  ]
}

# Copie o "id" → Este é seu TEAM_ID
```

---

## 🔐 Passo 3: Gerar Webhook no ClickUp

### Via ClickUp API

```bash
# Variáveis
CLICKUP_API_KEY="pk_sua_chave_aqui"
TEAM_ID="seu_team_id"
WEBHOOK_URL="https://abc123.ngrok.io/api/webhooks"

# Criar webhook
curl -X POST \
  https://api.clickup.com/api/v2/team/$TEAM_ID/webhook \
  -H "Authorization: $CLICKUP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "'$WEBHOOK_URL'",
    "events": [
      "taskCreated",
      "taskUpdated",
      "taskStatusChanged",
      "customFieldValueChanged"
    ]
  }'

# Resposta esperada:
{
  "id": "webhook_id_123",
  "endpoint": "'$WEBHOOK_URL'",
  "health": {
    "status": "active"
  }
}
```

### Via ClickUp UI (Alternativa)

1. Abra ClickUp → Settings
2. Vá para: Integrations → Webhooks
3. Clique em "Create Webhook"
4. Preencha:
   - **URL:** `https://abc123.ngrok.io/api/webhooks`
   - **Events:** Selecione todos os eventos relevantes
   - **Teams/Workspaces:** Selecione seu time

---

## ⚙️ Passo 4: Configurar no .env

```bash
# Abrir .env
nano .env

# Adicionar:
WEBHOOKS_ENABLED=true
CLICKUP_WEBHOOK_URL=https://abc123.ngrok.io/api/webhooks
CLICKUP_WEBHOOK_SECRET=seu_webhook_secret_opcional

# Salvar e sair (Ctrl+X → Y → Enter)
```

---

## 🧪 Passo 5: Testar Webhook

### Teste 1: Verificar Endpoint

```bash
# O endpoint deve estar acessível
curl -I https://abc123.ngrok.io/api/webhooks

# Resposta esperada: HTTP 200 ou 405 (OK, apenas aguardando POST)
```

### Teste 2: Simular Webhook

```bash
# Enviar webhook simulado
curl -X POST \
  http://localhost:3001/api/webhooks \
  -H "Content-Type: application/json" \
  -d '{
    "event": "taskUpdated",
    "data": {
      "id": "test-task-123"
    }
  }'

# Esperado no console do app:
# 🔔 [Webhook] Evento recebido: taskUpdated
# 📦 Recurso: task
# ⚡ [Webhook] Sincronizando ClickUp agora...
```

### Teste 3: Provocar Evento Real

```bash
# No ClickUp, faça uma ação real:
1. Abra um task da lista CRM-VENDAS
2. Altere um custom field (ex: "Deal Value")
3. Clique em salvar

# Esperado:
# - Console do app mostra: "[Webhook] Evento recebido"
# - Dashboard atualiza em < 1 segundo
```

---

## 📊 Passo 6: Monitorar Webhooks

### Ver Status do Webhook (API)

```bash
CLICKUP_API_KEY="pk_..."
TEAM_ID="..."
WEBHOOK_ID="webhook_id_123"

curl -H "Authorization: $CLICKUP_API_KEY" \
  https://api.clickup.com/api/v2/team/$TEAM_ID/webhook/$WEBHOOK_ID
```

### Ver Logs no App

```bash
# Os logs aparecem em:
# 1. Console do terminal (npm run start)
# 2. Arquivo data/sync-log.json
# 3. Dashboard → Aba "Logs"

# Exemplo de log:
{
  "timestamp": "2026-04-14T20:00:00.000Z",
  "operation": "webhook_received",
  "success": true,
  "eventType": "taskUpdated",
  "resourceType": "task"
}
```

---

## 🎯 Eventos Suportados

Configure estes eventos no ClickUp:

```
✅ taskCreated         - Nova venda ou cliente
✅ taskUpdated         - Alteração em qualquer field
✅ taskStatusChanged   - Mudança de status (aberto/fechado)
✅ customFieldValueChanged - Alteração em custom fields
✅ taskDeleted         - Exclusão de task
```

### Mínimo Recomendado

```json
"events": [
  "taskUpdated",
  "taskStatusChanged",
  "customFieldValueChanged"
]
```

---

## ⏱️ Debounce (Prevenção de Duplicatas)

O sistema implementa **debounce automático**:

- Múltiplos webhooks em < 10 segundos = 1 sync
- Evita sobrecarga e requisições desnecessárias

```
Webhook 1 → Sync agendado
Webhook 2 (2s depois) → Cancela anterior, reagenda
Webhook 3 (3s depois) → Cancela anterior, reagenda
↓ (após 10s) →
SYNC EXECUTA uma única vez com todos os dados
```

---

## 🚨 Troubleshooting

### Webhook não é acionado

```
1. ✓ URL está acessível? (curl -I url)
2. ✓ API Key tem permissão?
3. ✓ Events está selecionado no ClickUp?
4. ✓ Firewall bloqueia ngrok? (tente Cloudflare)
```

### Dashboard não atualiza

```
1. ✓ Console mostra "[Webhook] Evento recebido"?
2. ✓ data/sync-log.json tem novos eventos?
3. ✓ Recarregar página do browser?
4. ✓ Verificar console do navegador (F12)?
```

### Muitos syncs simultâneos

```
Aumentar MIN_SYNC_INTERVAL em webhook-receiver.js:
this.MIN_SYNC_INTERVAL = 30 * 1000; // 30 segundos
```

---

## 🔄 Comparação: Com vs Sem Webhooks

| Métrica              | Sem Webhooks | Com Webhooks       |
| -------------------- | ------------ | ------------------ |
| Frequência de sync   | 5 minutos    | Instantânea        |
| Delay de atualização | até 5 min    | < 1 segundo        |
| Requisições/hora     | ~12          | ~100 (com eventos) |
| Uso de CPU           | Baixo        | Médio              |
| Custo API ClickUp    | Baixo        | Médio              |

---

## 🎬 Começar Agora

### Setup Rápido (10 minutos)

1. **Terminal 1:** Instalar e rodar ngrok

```bash
ngrok http 3001
# Copie: https://abc123.ngrok.io
```

2. **Terminal 2:** Rodar Financial Sync

```bash
npm run start
```

3. **Terminal 3:** Criar webhook

```bash
# Use o curl command acima
curl -X POST https://api.clickup.com/api/v2/team/$TEAM_ID/webhook \
  -H "Authorization: pk_..." \
  -d '{"endpoint": "https://abc123.ngrok.io/api/webhooks", ...}'
```

4. **Navegador:** Abrir Dashboard

```
http://localhost:3001
```

5. **ClickUp:** Fazer uma alteração em qualquer task

```
Dashboard atualiza em < 1 segundo ⚡
```

---

## 📞 Suporte

### Documentação Oficial

- ClickUp Webhooks: https://clickup.com/api/v2/docs#webhooks
- ClickUp Team API: https://clickup.com/api/v2/docs#teams

### Ngrok Documentation

- https://ngrok.com/docs

### Seu Dashboard

```
http://localhost:3001 → Aba "Logs" mostra histórico de webhooks
```

---

**Pronto para sincronização em tempo real! 🚀**

Agora seu dashboard está sempre atualizado com os últimos dados do ClickUp.
