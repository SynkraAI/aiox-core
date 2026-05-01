# 03 — Env Vars necessárias para ativação CAPI (Caminho C)

**Data:** 2026-04-30
**PR:** PR-CAPI-ACTIVATION (Caminho C)
**Autor:** @aios-dev (Dex)
**Audience:** Orion (lead) — quem vai configurar as envs no Vercel.

---

## Contexto

Caminho C entregue: rate limit + CORS + Lead-only filter implementados em `src/app/api/meta-conversion/route.ts`. Build PASS, typecheck PASS, push completo. Falta apenas configurar as env vars no Vercel pra ativação real.

**Importante:** sem essas envs, a rota continua em modo degradado mas seguro:
- Sem `METAAPI_*` → 202 no-op (não envia nada para Meta)
- Sem `UPSTASH_*` → rate limit DESATIVADO (fail-open, warn log)
- CORS + Lead-only filter sempre ativos (não dependem de env)

---

## Env Vars

### Bloco 1 — Meta CAPI core (obrigatórias para ativação)

| Variável | Valor esperado | Onde obter |
|----------|---------------|------------|
| `METAAPI_ACCESS_TOKEN` | System User Token (~200 chars, começa com `EAA...`) | BM Bretda → Configurações de negócios → Usuários → Usuários do sistema → Adicionar `bretda-capi-server` (Admin) → Adicionar Pixel como ativo → Gerar token com `ads_management` + `business_management` |
| `METAAPI_PIXEL_ID` | `1014260166903168` (confirmar com user) | BM Bretda → Events Manager → Pixel → ID no canto superior |
| `METAAPI_TEST_EVENT_CODE` | `TEST12345` (opcional, primeira semana) | Events Manager → Test Events → "Generate test event code". Usar nos primeiros dias para validar dedup, depois remover. |

**Marcar como Sensitive no Vercel UI** o `METAAPI_ACCESS_TOKEN`.

### Bloco 2 — Upstash Redis (rate limit)

| Variável | Valor esperado | Onde obter |
|----------|---------------|------------|
| `UPSTASH_REDIS_REST_URL` | `https://xxxx-yyyy.upstash.io` | https://upstash.com → Login GitHub → Create Database (free tier, region: us-east-1 ou closest to Vercel) → REST tab |
| `UPSTASH_REDIS_REST_TOKEN` | Token longo (~50 chars) | Mesma página → REST tab → "Read-only token" NÃO; pegar o token write/read padrão |

**Free tier Upstash:** 10k commands/day. Nosso uso esperado é ~1-3 commands/lead, ~50 leads/dia → ~150 commands/dia. Folga de 60×.

**Alternativa:** `vercel kv create meta-capi-ratelimit` no CLI Vercel. Auto-injeta envs `KV_REST_API_URL` + `KV_REST_API_TOKEN`. Para usar com este código, basta renomear: `UPSTASH_REDIS_REST_URL=$KV_REST_API_URL` (Upstash e Vercel KV compartilham mesma API REST).

---

## Procedimento de ativação

### Step 1 — Configurar Upstash (5min)

1. https://upstash.com → Login com GitHub
2. **Create Database**:
   - Name: `bretda-meta-capi-ratelimit`
   - Type: Redis
   - Region: `us-east-1` (mesmo region que maioria dos Vercel deployments)
   - Eviction: opcional, desnecessário (sliding window expira sozinho)
   - Free tier
3. Aba **REST** → copiar `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`

### Step 2 — Configurar Vercel envs

```bash
# bretda-lp project no Vercel
vercel env add UPSTASH_REDIS_REST_URL production
# paste URL do Upstash

vercel env add UPSTASH_REDIS_REST_TOKEN production
# paste token (marcar Sensitive)

vercel env add METAAPI_PIXEL_ID production
# paste Pixel ID (1014260166903168 ou confirmar)

vercel env add METAAPI_ACCESS_TOKEN production
# paste System User Token (marcar Sensitive)

vercel env add METAAPI_TEST_EVENT_CODE production
# paste TEST12345 (REMOVER depois de validação)
```

**Adicionar também em `preview`** (deploys de PRs futuros) mas SEM `METAAPI_ACCESS_TOKEN` em preview (pra evitar disparos de teste para Meta production).

### Step 3 — Redeploy

```bash
vercel --prod
```

ou push qualquer commit pra `main` (auto-deploy).

### Step 4 — Validação health-check

```bash
curl https://bretda.com.br/api/meta-conversion
```

Esperado:
```json
{
  "service": "meta-conversion",
  "configured": true,
  "pixel_id_present": true,
  "access_token_present": true,
  "test_event_code_present": true,
  "rate_limit_configured": true,
  "lead_only_filter_active": true,
  "cors_whitelist_size": 3,
  "graph_api_version": "v18.0"
}
```

### Step 5 — Test Event no Events Manager

1. Events Manager → Test Events → tab `TEST12345`
2. Trigger Lead manualmente:
   ```bash
   curl -X POST https://bretda.com.br/api/meta-conversion \
     -H "Content-Type: application/json" \
     -H "Origin: https://bretda.com.br" \
     -d '{
       "event_name": "Lead",
       "event_id": "test_activation_001",
       "user_data": { "email": "test@bretda.com.br" },
       "custom_data": { "currency": "BRL" }
     }'
   ```
3. Esperado response: `{ "status": "ok", "events_received": 1, "fbtrace_id": "..." }`
4. Test Events tab deve mostrar evento com badge de matching client+server (dedup OK)

### Step 6 — Smoke test rate limit

```bash
# Disparar 25 requests rapidamente — esperado ~5 ultimas com 429
for i in {1..25}; do
  curl -s -o /dev/null -w "%{http_code}\n" -X POST https://bretda.com.br/api/meta-conversion \
    -H "Content-Type: application/json" \
    -H "Origin: https://bretda.com.br" \
    -d '{"event_name":"Lead","event_id":"rl_test_'$i'"}'
done
```

Esperado: primeiras 20 retornam `200`, ultimas 5 retornam `429`.

### Step 7 — Smoke test CORS

```bash
# Origin nao-whitelisted deve dar 403
curl -X POST https://bretda.com.br/api/meta-conversion \
  -H "Content-Type: application/json" \
  -H "Origin: https://attacker.com" \
  -d '{"event_name":"Lead","event_id":"cors_test"}'
```

Esperado: `403 { "status": "error", "reason": "forbidden_origin" }`

### Step 8 — Smoke test Lead-only filter

```bash
# Evento passivo deve dar 202 skipped
curl -X POST https://bretda.com.br/api/meta-conversion \
  -H "Content-Type: application/json" \
  -H "Origin: https://bretda.com.br" \
  -d '{"event_name":"PageView","event_id":"pv_test"}'
```

Esperado: `202 { "status": "skipped", "reason": "passive_event_pending_consent_banner", ... }`

### Step 9 — Remover TEST_EVENT_CODE depois de validação (~3-5 dias)

```bash
vercel env rm METAAPI_TEST_EVENT_CODE production
vercel --prod
```

---

## Rollback

Se algo der errado, basta remover o `METAAPI_ACCESS_TOKEN`:

```bash
vercel env rm METAAPI_ACCESS_TOKEN production
vercel --prod
```

A rota volta ao modo 202 no-op imediatamente. CORS e Lead-only filter continuam ativos (defense-in-depth, mesmo sem CAPI ativo).

---

## TODOs Sprint 2 (PR5 + além)

| Item | PR alvo | Severidade |
|------|---------|-----------|
| LGPD `/legal/privacidade` page detalhada (DPO, base legal, transferência internacional) | PR5 | HIGH |
| Cookie consent banner (react-cookie-consent ou custom) | PR5 | HIGH |
| `/api/privacy/forget` endpoint (LGPD Art. 18) | PR5 | HIGH |
| Expandir `LEAD_ONLY_EVENTS` quando consent banner ativo OU substituir filtro por consent flag | PR5 | HIGH |
| HMAC client signature (defesa em profundidade alem CORS) | PR6 | MEDIUM |
| Log PII sanitizer regex (M2) | PR6 | MEDIUM |
| Drop `graph_api_version` do GET response em prod (M6 info disclosure) | PR6 | LOW |
| ESLint config gap fix (browser+node globals) | PR-LINT-CONFIG | LOW |

---

## Referências

- Implementação: `apps/bretda-lp/src/app/api/meta-conversion/route.ts`
- README endpoint: `apps/bretda-lp/src/app/api/meta-conversion/README.md`
- QA gate caveat (caveats_for_devops): `.aios-core/data/gates/PR-META-CAPI.yaml`
- Conclave H1/H2 source: `docs/projects/bretda-redesign/02-conclave/META-CAPI-SECURITY-CONCLAVE.md`
- Tracking client: `apps/bretda-lp/src/lib/tracking.ts`
