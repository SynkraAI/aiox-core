# Runbook — Deploy `tocks-tracking` (Handoff Opção B)

> [!WARNING]
> DEPRECATED as of 2026-05-04
> Reason: tocks-tracking functionality absorbed by tocks-sales-ai via D++ (STORY-TOCKS-CAPI-D++).
> Do NOT deploy this runbook. See apps/tocks-tracking/README.md for restoration ETA.
> Last known-good standalone state: fork commit `6c2bc08c` (pre-park snapshot).

**Status:** Pronto pra executar via dashboards (Railway / Supabase / Cloudflare)
**Tempo estimado:** 15-20 minutos
**Autor:** Gage (devops) — sessão autônoma 23/Abr 2026 pré-viagem
**Story:** `docs/stories/tocks/S-TOCKS-TRACK-FIX-001.md`
**Briefing dev Tray:** `docs/projects/tocks-tray-tracking-briefing.md`

---

## TL;DR

Deploy do backend standalone que recebe gclid da LP Tray e envia offline conversions pro Google Ads. **Tudo via dashboard** (nenhum CLI). Valores prontos em `apps/tocks-tracking/.env.production.local` (LOCAL only — não commitado).

**Commit local já feito:** veja seção 0 pro SHA.

---

## 0. Pré-requisitos (já feitos pelo Gage)

- Commit local atômico criado (SHA em "Outputs" no final desse doc).
- `.gitignore` atualizado (`!apps/tocks-tracking/` na linha 151).
- Arquivo `apps/tocks-tracking/.env.production.local` criado com secrets reais prontos (gitignored — nunca vai pro remoto).
- Migration Supabase pronta: `apps/tocks-tracking/supabase/migrations/005_gclid_captures.sql`.

**O que o user precisa fazer:** seguir as 6 seções abaixo (Railway → Env vars → Supabase migration → Cloudflare DNS → Railway domain → Smoke tests).

---

## 1. Railway — criar projeto (dashboard)

1. Abrir `https://railway.app/new`.
2. Clicar **Deploy from GitHub repo**.
3. Selecionar o repositório `AIOS` (ou o fork pessoal, se o push for via fork).
4. **Root Directory:** `apps/tocks-tracking`
5. **Dockerfile path:** `Dockerfile` (auto-detectado — deixa vazio)
6. Clicar **Deploy**.
7. O primeiro build **vai falhar** (sem env vars) — esperado. Vai para seção 2.

**Nota:** se o push ainda não foi pro GitHub (main divergiu 35/65), o Railway não vai achar o repo atualizado. Alternativa: **Deploy from Template → Empty Service**, e depois `railway link` local via CLI. Mas o caminho mais simples é fazer o push primeiro — vide runbook de push separado (não escopo deste).

---

## 2. Railway — env vars (dashboard)

**Local do arquivo com valores reais:** `D:/AIOS/apps/tocks-tracking/.env.production.local`

No Railway:

1. Project → service `tocks-tracking` → tab **Variables**.
2. Clicar **Raw Editor** (canto superior direito).
3. Colar o conteúdo abaixo, **substituindo apenas `TRAY_WEBHOOK_SECRET`** (gerar com `openssl rand -hex 32`):

```env
# Application
PORT=3100
NODE_ENV=production
LOG_LEVEL=info

# Supabase (COPIAR DE apps/tocks-tracking/.env.production.local)
SUPABASE_URL=<valor do .env.production.local>
SUPABASE_SERVICE_ROLE_KEY=<valor do .env.production.local>

# Google Ads OAuth (COPIAR DE apps/tocks-tracking/.env.production.local)
GOOGLE_ADS_CLIENT_ID=<valor>
GOOGLE_ADS_CLIENT_SECRET=<valor>
GOOGLE_ADS_DEVELOPER_TOKEN=<valor>
GOOGLE_ADS_REFRESH_TOKEN=<valor>

# Google Ads — non-secret IDs
GOOGLE_ADS_LOGIN_CUSTOMER_ID=7943699417
GOOGLE_ADS_TOCKS_CUSTOMER_ID=8146675397
GOOGLE_ADS_CONVERSION_ACTION_LEAD_ID=7550396040
GOOGLE_ADS_CONVERSION_ACTION_PURCHASE_ID=7161904202
GOOGLE_ADS_API_VERSION=v20
GOOGLE_ADS_TIMEOUT_MS=10000
GOOGLE_ADS_TIMEZONE=America/Sao_Paulo
GOOGLE_ADS_DEFAULT_LEAD_VALUE=13000

# Tray webhook — GERAR NOVO
TRAY_WEBHOOK_SECRET=<colar saída de: openssl rand -hex 32>

# CORS
CORS_ORIGINS=https://tockscustom.com.br,https://www.tockscustom.com.br

# Rate limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
```

4. **Save**. Railway faz redeploy automático.
5. Aguardar o build completar (~2-3 min). Ver logs: `Deployments → latest → View Logs`. Esperado no boot:
   ```
   {"level":30,"msg":"server.start","port":3100}
   ```

**Validação fail-close (opcional, 1 min):** apagar temporariamente `TRAY_WEBHOOK_SECRET`, salvar → redeploy deve FALHAR com mensagem clara no log. Restaurar o valor imediatamente.

---

## 3. Supabase — aplicar migration (dashboard)

1. Abrir SQL editor: `https://supabase.com/dashboard/project/spiwgzahtmlvpuqgwehc/sql`
2. Abrir o arquivo local: `D:/AIOS/apps/tocks-tracking/supabase/migrations/005_gclid_captures.sql`
3. Copiar **todo o conteúdo** e colar no editor SQL.
4. Clicar **Run** (ou Ctrl+Enter).
5. Esperado: mensagem verde "Success. No rows returned" (ou similar).

**Sanity queries (rodar depois pra validar):**

```sql
-- RLS habilitada nas duas tabelas novas
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname IN ('gclid_captures','tray_webhook_events');
-- Esperado: 2 rows, ambas com relrowsecurity = true

-- Indices criados
SELECT indexname
FROM pg_indexes
WHERE tablename IN ('gclid_captures','tray_webhook_events')
ORDER BY 1;
-- Esperado: >= 5 indices (gclid, email_hash, phone_hash, tied_to_order_id, event_type)

-- Tabelas existem e estão vazias
SELECT COUNT(*) FROM gclid_captures;
SELECT COUNT(*) FROM tray_webhook_events;
-- Esperado: 0 e 0
```

**Pré-requisito:** migrations 001-004 do `tocks-sales-ai` já devem estar aplicadas (criam tabela `tenants`). Se faltar, aplicar primeiro — mas o user confirmou que sales-ai já está em produção (Epic 7 Go Live), então isso já tá OK.

---

## 4. Cloudflare — adicionar DNS CNAME (dashboard)

1. Abrir Cloudflare: `https://dash.cloudflare.com/` → zone **`tockscustom.com.br`** → **DNS → Records**.
2. Clicar **Add record**.
3. Preencher:
   - **Type:** `CNAME`
   - **Name:** `tracking`
   - **Target:** valor que o Railway mostrou em `Settings → Networking → Public Networking` (algo como `tocks-tracking-production-abcd.up.railway.app`)
   - **Proxy status:** **Proxied** (nuvem laranja — IMPORTANTE, não deixar DNS Only)
   - **TTL:** Auto
4. **Save**.
5. Aguardar propagação (1-3 min).

**Validação DNS:**

```bash
dig tracking.tockscustom.com.br CNAME +short
# Esperado: retornar algo como `tocks-tracking-production-abcd.up.railway.app.`
```

(No Windows: `nslookup tracking.tockscustom.com.br`.)

---

## 5. Railway — custom domain (dashboard)

1. No Railway: project → service → **Settings → Networking**.
2. Seção **Public Networking → Custom Domain**.
3. **Add Domain:** `tracking.tockscustom.com.br` → Add.
4. Railway verifica o CNAME automaticamente e provisiona cert Let's Encrypt (~2 min).
5. Quando ficar **Verified**, bandeira verde aparece.

---

## 6. Smoke tests

### 6.1 Health check

```bash
curl -i https://tracking.tockscustom.com.br/health
# Esperado:
#   HTTP/2 200
#   {"status":"ok","service":"tocks-tracking",...}
```

### 6.2 Capture gclid (mock)

```bash
curl -X POST https://tracking.tockscustom.com.br/api/capture-gclid \
  -H "Content-Type: application/json" \
  -H "Origin: https://tockscustom.com.br" \
  -d '{
    "gclid":"TEST_GCLID_001_HANDOFF",
    "email_hash":"a1b2c3d4e5f6",
    "source_url":"https://tockscustom.com.br/"
  }'
# Esperado: HTTP 200, body com {"ok":true}
```

### 6.3 Verificar Supabase gravou

No SQL editor Supabase:
```sql
SELECT id, gclid, email_hash, source_url, captured_at
FROM gclid_captures
WHERE gclid = 'TEST_GCLID_001_HANDOFF'
ORDER BY captured_at DESC
LIMIT 1;
-- Esperado: 1 row recém-inserida
```

### 6.4 Validar CORS (rejeição)

```bash
curl -X POST https://tracking.tockscustom.com.br/api/capture-gclid \
  -H "Content-Type: application/json" \
  -H "Origin: https://evil-site.com" \
  -d '{"gclid":"X"}'
# Esperado: HTTP 403 (CORS rejected)
```

### 6.5 Validar Tray webhook auth (rejeição sem secret)

```bash
curl -X POST https://tracking.tockscustom.com.br/api/tray-webhook-purchase \
  -H "Content-Type: application/json" \
  -d '{"order_id":"X"}'
# Esperado: HTTP 401 (sem HMAC nem ?k=)
```

### 6.6 Limpar teste

```sql
DELETE FROM gclid_captures WHERE gclid = 'TEST_GCLID_001_HANDOFF';
```

---

## 7. Handoff pro dev externo Tray

**Canal:** Signal ou WhatsApp (NUNCA email, por conter secret).

**Payload da mensagem:**

```
Olá [nome do dev]. Backend de tracking no ar.

URL: https://tracking.tockscustom.com.br
Secret HMAC: <TRAY_WEBHOOK_SECRET que você gerou no passo 2>

Briefing completo está em D:/AIOS/docs/projects/tocks-tray-tracking-briefing.md
(resumido abaixo)

Endpoints:
  POST /api/capture-gclid         — chamado pela LP Tray ao receber gclid na URL
  POST /api/tray-webhook-lead     — chamado pela Tray quando carrinho abandonado
  POST /api/tray-webhook-purchase — chamado pela Tray quando pedido pago

Auth: assinar header X-Tray-Signature = hmac-sha256(secret, body) em HEX.
Fallback: se a Tray não suportar HMAC nativo, usar ?k=<secret> na URL.

Qualquer dúvida, me chama.
```

---

## 8. Monitoramento pós-deploy (48h)

No Railway → Logs, filtrar por:

- `capture_gclid.ok` — conta de capturas recebidas (LP funcionando)
- `tray.webhook.received` — conta de eventos Tray
- `google_ads.conversions.uploaded` — conversões subindo pra Google
- `google_ads.oauth.refresh_failed` — 🚨 alertar: token expirou (renovar)

**Google Ads dashboard:** `Ferramentas & Configurações → Medições → Conversões` → verificar count > 0 nas duas conversion actions:
- `Lead Qualificado Tocks` (id 7550396040)
- `Compras Loja Tray Tocks` (id 7161904202)

---

## 9. Rollback plan

Se algo quebrar em produção:

1. **Railway dashboard → Deployments → Pause.** Serviço para, /health passa a 502, LP continua funcionando (fail-open: script da LP tenta uma vez e esquece — não bloqueia conversão do usuário).
2. **DNS continua apontando** — sem impacto na loja Tray (apex `tockscustom.com.br` aponta Tray SaaS, apenas o subdomínio `tracking.*` ficou off).
3. **Migration Supabase:** não reverter. Tabelas `gclid_captures` + `tray_webhook_events` são adicionais, idempotentes, RLS isolada por tenant — zero impacto em outras tabelas.
4. **Para voltar a subir:** Deployments → Resume.

---

## 10. Renovação OAuth (~29/Abr)

Token Google Ads expira ~7 dias após reauth de 22/Abr (OAuth Testing mode).

Quando expirar:
1. Rodar `node D:/jarvis/mcp-ads-bridge/scripts/reauth-with-sheets.cjs` no PC local (login com `contato@tockscustom.com.br`).
2. Copiar novo `GOOGLE_ADS_REFRESH_TOKEN` do output.
3. Railway → service → Variables → editar apenas `GOOGLE_ADS_REFRESH_TOKEN` → save → redeploy automático.
4. Validar nos logs: `google_ads.oauth.refresh_ok`.

---

## Outputs do handoff

Preenchido após commit:

- **Commit SHA local:** `6c2bc08c07cbdfc90e3febcc1cd44416016e15c7` (short: `6c2bc08c`)
- **Branch:** `main` (local — NÃO pushed; main diverge 36 ahead / 65 behind origin/main)
- **Arquivos no commit:**
  - `.gitignore` (linha 151: `!apps/tocks-tracking/`)
  - `apps/tocks-tracking/**` (app extraído: 17 arquivos src + Dockerfile + railway.toml + migration + tests + README + .env.example + .gitignore interno)
  - `docs/projects/tocks-tray-tracking-briefing.md` (briefing do dev Tray)
  - `docs/stories/tocks/S-TOCKS-TRACK-FIX-001.md` (story QA'd)
  - `docs/runbooks/tocks-tracking-deploy.md` (este doc)

- **Arquivo NÃO commitado (LOCAL only):**
  - `apps/tocks-tracking/.env.production.local` (gitignored, contém secrets prontos pra copy-paste no Railway)

---

## Checklist resumido pro user (15-20 min)

- [ ] **(2 min)** Railway → New Project → GitHub repo → Root `apps/tocks-tracking` → Deploy (vai falhar, OK).
- [ ] **(3 min)** Railway → Variables → Raw Editor → colar do `.env.production.local` (gerar novo `TRAY_WEBHOOK_SECRET` antes).
- [ ] **(2 min)** Supabase SQL Editor → colar conteúdo de `005_gclid_captures.sql` → Run → rodar sanity queries.
- [ ] **(3 min)** Cloudflare → DNS → CNAME `tracking` → alvo Railway public URL → Proxied.
- [ ] **(2 min)** Railway → Settings → Networking → Custom Domain `tracking.tockscustom.com.br` → Verify.
- [ ] **(3 min)** Smoke tests seções 6.1-6.5 → se tudo 2xx/4xx conforme esperado, green light.
- [ ] **(2 min)** Mandar URL + `TRAY_WEBHOOK_SECRET` pro dev Tray via Signal/WhatsApp.
- [ ] **(opcional)** Deletar `apps/tocks-tracking/.env.production.local` após Railway setado.

---

**Dúvidas na viagem:** chama o agente `@devops` ou `@dev` que eles têm todo contexto deste doc + da story.
