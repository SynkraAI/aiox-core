# Story PRO-11: Email Authentication & Buyer-Based Pro Activation

**Epic:** AIOS Pro Architecture (PRO)
**Story ID:** PRO-11
**Sprint:** 14 (Authentication & Monetization)
**Priority:** Critical
**Points:** 13
**Status:** Ready
**Type:** Feature (Full-Stack)
**Owner:** @dev (Dex) + @devops (Gage)
**ADR:** [ADR-PRO-006](../../../architecture/adr/adr-pro-006-payment-subscription-device-control.md)
**Depends On:** PRO-7 (License Server Deployment)

---

## Executor Assignment

```yaml
executor: "@dev (Dex)"
secondary_executor: "@devops (Gage)"
quality_gate: "@architect (Aria)"
quality_gate_tools:
  - security_review
  - api_design_review
  - auth_flow_review
```

**Work Type Analysis:**
| Phase | Work Type | Executor | Quality Gate |
|-------|-----------|----------|--------------|
| 1 | Supabase Auth Setup | @devops | @architect |
| 2 | License Server Endpoints | @dev | @architect |
| 3 | CLI Auth Flow | @dev | @architect |
| 4 | Buyer Validation Integration | @dev | @qa |
| 5 | Security Hardening | @devops + @dev | @architect |
| 6 | Integration Testing | @qa | @dev |

---

## User Story

**Como** usuario que comprou o plano Pro (via Cohort/plataforma de pagamento),
**Quero** ativar o Pro usando apenas meu e-mail e senha, sem precisar de uma license key,
**Para** que a experiencia de ativacao seja simples, segura e protegida contra uso indevido.

---

## Context & Problem

### Problema Atual

O fluxo atual exige que o usuario possua uma **license key** (`PRO-XXXX-XXXX-XXXX-XXXX`) para ativar o Pro. Porem:

1. **Nao existe fluxo automatizado** de geracao de keys (payment gateway nao implementado)
2. **UX ruim** — usuario precisa copiar/colar uma key longa
3. **Sem protecao de identidade** — qualquer pessoa com a key pode ativar
4. **Validacao de compra ja existe** — API `validate_buyer` do Cohort Supabase retorna `{valid: true/false}` por e-mail

### Solucao

Substituir o fluxo de license key por **autenticacao com e-mail + senha + verificacao de e-mail**:

1. Usuario se registra com e-mail + senha
2. Recebe e-mail de verificacao (Supabase Auth)
3. Apos verificar, o sistema valida se e comprador via `validate_buyer`
4. Se comprador valido → gera license key automaticamente → ativa Pro
5. Logins futuros: e-mail + senha → revalida → ativa

### Protecoes de Seguranca

| Ameaca | Protecao |
|--------|----------|
| Usar e-mail de outra pessoa | **Verificacao de e-mail obrigatoria** — so ativa apos clicar no link |
| Brute force de senhas | Rate limiting (Supabase Auth built-in) + lockout apos 5 tentativas |
| Compartilhamento de conta | Device binding (machineId) + max 2 devices por license |
| Enumeracao de e-mails | Mensagens genericas ("Se este e-mail existe, enviamos verificacao") |
| API key do Cohort exposta | Key fica **APENAS** no License Server (env var), nunca no CLI |

---

## Architecture

### Fluxo de Registro (Primeiro Uso)

```
┌─────────────┐                    ┌──────────────────────┐                    ┌─────────────────┐
│  CLI         │   1. signup        │  License Server      │  2. create user   │  Supabase Auth   │
│  (pro-setup) │ ─────────────── → │  (Vercel)            │ ────────────── → │  (nosso projeto) │
│              │   {email, pass}    │                      │                   │                  │
│              │                    │                      │ ← session/token   │  3. send email   │
│              │ ← "Check email"    │                      │                   │  verification    │
└─────────────┘                    └──────────────────────┘                    └─────────────────┘
                                            │
       4. User clicks                       │
       verification link                    │
       in email                             │
                                            │
┌─────────────┐  5. confirm        ┌────────┴─────────────┐                    ┌─────────────────┐
│  CLI         │ ─────────────── → │  License Server      │  6. validate_buyer │  Cohort Supabase │
│  (waiting)   │   {email, pass}   │                      │ ────────────── → │  (externo)       │
│              │                    │                      │                   │                  │
│              │                    │                      │ ← {valid: true}   │                  │
│              │                    │  7. generate key     │                   │                  │
│              │                    │  8. activate license │                   │                  │
│              │ ← activation       │                      │                   │                  │
│              │   result           │                      │                   │                  │
└─────────────┘                    └──────────────────────┘                    └─────────────────┘
```

### Fluxo de Login (Uso Subsequente)

```
┌─────────────┐  1. login          ┌──────────────────────┐                    ┌─────────────────┐
│  CLI         │ ─────────────── → │  License Server      │  2. auth           │  Supabase Auth   │
│  (pro-setup) │   {email, pass}   │                      │ ────────────── → │  (nosso projeto) │
│              │                    │                      │                   │                  │
│              │                    │  3. find license     │ ← session valid   │                  │
│              │                    │  4. activate device  │                   │                  │
│              │ ← activation       │                      │                   │                  │
│              │   result           │                      │                   │                  │
└─────────────┘                    └──────────────────────┘                    └─────────────────┘
```

### Componentes Envolvidos

| Componente | Repositorio | Mudanca |
|-----------|-------------|---------|
| `pro-setup.js` | aios-core | MODIFICAR — novo Step 1 com email/password |
| `license-api.js` | aios-core | ADICIONAR — `signup()`, `login()`, `confirmEmail()` |
| License Server API | aios-license-server | ADICIONAR — endpoints `/v1/auth/*` |
| Supabase Auth | nosso Supabase (evvvnarpwcdybxdvcwjh) | CONFIGURAR — Auth, email templates |
| License Server DB | nosso Supabase | MODIFICAR — coluna `user_id` em `licenses` |

### Endpoints Novos no License Server

| Method | Path | Descricao |
|--------|------|-----------|
| POST | `/v1/auth/signup` | Registrar usuario (email + password) |
| POST | `/v1/auth/login` | Login (email + password) → retorna session |
| POST | `/v1/auth/verify-status` | Verificar se email foi confirmado |
| POST | `/v1/auth/activate-pro` | Verificar compra + gerar/recuperar key + ativar |
| POST | `/v1/auth/refresh` | Renovar session token |

### Schema Additions

```sql
-- Adicionar user_id a licenses (vincula license ao usuario autenticado)
ALTER TABLE licenses ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE licenses ADD COLUMN customer_email VARCHAR(255);
CREATE UNIQUE INDEX idx_licenses_user_id ON licenses(user_id) WHERE revoked_at IS NULL;

-- Tabela de buyer validation cache (evita chamadas repetidas ao Cohort)
CREATE TABLE buyer_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  email VARCHAR(255) NOT NULL,
  is_valid BOOLEAN NOT NULL,
  validated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  UNIQUE(user_id)
);

-- RLS: Apenas service_role pode acessar
ALTER TABLE buyer_validations ENABLE ROW LEVEL SECURITY;
-- Sem policies para anon/authenticated = acesso bloqueado por padrao
-- License Server usa service_role key
```

---

## Acceptance Criteria

```gherkin
AC-1: Registro com Email e Senha
  GIVEN um usuario novo que nunca ativou o Pro
  WHEN ele executa o installer e escolhe "Activate Pro"
  THEN o CLI solicita email e senha (minimo 8 caracteres)
  AND envia para o License Server
  AND recebe confirmacao de que email de verificacao foi enviado

AC-2: Verificacao de Email Obrigatoria
  GIVEN um usuario que se registrou mas NAO verificou o email
  WHEN ele tenta ativar o Pro
  THEN o sistema BLOQUEIA a ativacao
  AND exibe mensagem: "Please verify your email first. Check your inbox."
  AND oferece opcao de reenviar email de verificacao

AC-3: Validacao de Compra Automatica
  GIVEN um usuario com email verificado
  WHEN o sistema chama validate_buyer com o email do usuario
  AND a API retorna {valid: true}
  THEN o License Server gera uma license key automaticamente
  AND ativa o Pro no device do usuario
  AND retorna features, seats, e cache config

AC-4: Rejeicao de Nao-Compradores
  GIVEN um usuario com email verificado
  WHEN o sistema chama validate_buyer com o email do usuario
  AND a API retorna {valid: false}
  THEN o sistema NAO gera license key
  AND exibe mensagem: "No active Pro subscription found for this email."
  AND sugere: "Purchase Pro at https://pro.synkra.ai"

AC-5: Login com Credenciais Existentes
  GIVEN um usuario que ja se registrou e ativou o Pro anteriormente
  WHEN ele executa o installer em um novo device ou reinstalacao
  AND insere email e senha corretos
  THEN o sistema autentica via Supabase Auth
  AND recupera a license key existente
  AND ativa o Pro no novo device (respeitando limite de 2 devices)

AC-6: Protecao Contra Uso de Email Alheio
  GIVEN um atacante que tenta usar o email de outra pessoa
  WHEN ele se registra com email que nao controla
  THEN o email de verificacao vai para o dono real
  AND o atacante NAO consegue verificar
  AND a ativacao e BLOQUEADA indefinidamente ate verificacao

AC-7: Compatibilidade com License Key (Backward Compat)
  GIVEN um usuario que ja possui uma license key PRO-XXXX
  WHEN ele executa o installer
  THEN o CLI oferece DUAS opcoes:
    1. "Login with email and password" (NOVO — recomendado)
    2. "Enter license key" (LEGADO — ainda funciona)
  AND o fluxo legado continua funcionando sem alteracoes

AC-8: Rate Limiting na Autenticacao
  GIVEN tentativas repetidas de login com senha incorreta
  WHEN o limite de 5 tentativas em 15 minutos e atingido
  THEN o sistema retorna HTTP 429
  AND exibe: "Too many attempts. Try again in X minutes."

AC-9: Reenvio de Email de Verificacao
  GIVEN um usuario que nao recebeu ou perdeu o email de verificacao
  WHEN ele solicita reenvio no CLI
  THEN o sistema reenvia (maximo 3 reenvios por hora)
  AND exibe mensagem de confirmacao

AC-10: API Key do Cohort Protegida
  GIVEN o codigo do CLI (aios-core)
  WHEN qualquer pessoa inspeciona o codigo fonte
  THEN a API key do validate_buyer NAO esta presente
  AND a key existe APENAS como env var no License Server (Vercel)

AC-11: Sessao Persistente
  GIVEN um usuario autenticado com Pro ativo
  WHEN ele usa o CLI em sessoes subsequentes
  THEN o cache local (.aios/license.cache) continua funcionando
  AND revalidacao online acontece a cada 30 dias (comportamento existente)
  AND nao precisa fazer login novamente ate o cache expirar
```

---

## Scope

### IN Scope

- [ ] Setup do Supabase Auth no projeto existente (evvvnarpwcdybxdvcwjh)
- [ ] Configuracao de email templates de verificacao
- [ ] Endpoints de auth no License Server (signup, login, verify, activate-pro)
- [ ] Integracao com validate_buyer API (server-side only)
- [ ] Modificacao do `pro-setup.js` para fluxo email/password
- [ ] Metodos `signup()`, `login()`, `confirmEmail()` na `license-api.js`
- [ ] Cache de buyer validation (evitar chamadas repetidas)
- [ ] Backward compatibility com license key existente
- [ ] Rate limiting nos endpoints de auth
- [ ] Testes unitarios e de integracao

### OUT of Scope

- [ ] OAuth social login (Google, GitHub) — futuro
- [ ] Magic link (passwordless) — futuro, considerar como alternativa
- [ ] Portal web de gerenciamento de conta — futuro (PRO-13)
- [ ] Password reset via CLI — futuro (interim: admin reset via Supabase Dashboard)
- [ ] Multi-factor authentication (MFA) — futuro
- [ ] Payment gateway integration (Polar.sh) — PRO-10 do ADR-006

---

## Tasks / Subtasks

### Phase 1: Supabase Auth & Schema Setup (@devops)
- [ ] Task 1.1: Habilitar Supabase Auth no projeto evvvnarpwcdybxdvcwjh (AC: 1,2)
- [ ] Task 1.2: Configurar email provider (Supabase built-in ou Resend) (AC: 2,9)
- [ ] Task 1.3: Customizar email template de verificacao (branding AIOS Pro) (AC: 2)
- [ ] Task 1.4: Configurar rate limits de auth (max 5 tentativas/15min) (AC: 8)
- [ ] Task 1.5: Configurar redirect URL para verificacao de email (AC: 2,6)
- [ ] Task 1.6: Executar migration: adicionar `user_id` e `customer_email` em `licenses` (AC: 3,5)
- [ ] Task 1.7: Executar migration: criar tabela `buyer_validations` (AC: 3)
- [ ] Task 1.8: Testar fluxo de signup + verificacao manualmente

### Phase 2: License Server — Auth Endpoints (@dev)
- [ ] Task 2.1: Adicionar Supabase Auth client ao License Server (AC: 1)
- [ ] Task 2.2: Implementar `POST /v1/auth/signup` (criar usuario + enviar verificacao) (AC: 1,6)
- [ ] Task 2.3: Implementar `POST /v1/auth/login` (autenticar + retornar session) (AC: 5)
- [ ] Task 2.4: Implementar `POST /v1/auth/verify-status` (checar se email foi verificado) (AC: 2)
- [ ] Task 2.5: Implementar `POST /v1/auth/refresh` (renovar session token) (AC: 11)
- [ ] Task 2.6: Adicionar middleware de auth (validar JWT em rotas protegidas) (AC: 8,10)
- [ ] Task 2.7: Testes unitarios para todos os endpoints de auth

### Phase 3: License Server — Buyer Validation & Auto-Activation (@dev)
- [ ] Task 3.1: Adicionar env vars ao Vercel: `COHORT_VALIDATE_BUYER_API_KEY`, `COHORT_SUPABASE_URL`, `COHORT_SUPABASE_ANON_KEY` (AC: 10)
- [ ] Task 3.2: Implementar `lib/buyer-validator.js` — adapter para validate_buyer API (AC: 3,4)
- [ ] Task 3.3: Implementar `POST /v1/auth/activate-pro` (AC: 3,4,5):
  - Verificar session JWT valido
  - Verificar email confirmado
  - Chamar validate_buyer com email do usuario
  - Se valid: gerar license key + ativar + retornar activation result
  - Se invalid: retornar erro com mensagem amigavel
- [ ] Task 3.4: Implementar cache de buyer validation (24h TTL) (AC: 3)
- [ ] Task 3.5: Implementar geracao automatica de license key para novos compradores (AC: 3)
- [ ] Task 3.6: Testes unitarios e de integracao

### Phase 4: CLI — Auth Flow (@dev)
- [x] Task 4.1: Adicionar metodos na `license-api.js` (AC: 1,5):
  - `signup(email, password)`
  - `login(email, password)`
  - `checkEmailVerified(sessionToken)`
  - `activateByAuth(sessionToken, machineId, aiosCoreVersion)`
  - `resendVerification(sessionToken)`
- [x] Task 4.2: Modificar `pro-setup.js` Step 1 (AC: 7):
  - Opcao 1: "Login with email and password" (novo, recomendado)
  - Opcao 2: "Enter license key" (legado)
- [x] Task 4.3: Implementar fluxo de registro no CLI (AC: 1,2,9):
  - Prompt email → prompt password (com confirmacao) → signup → aguardar verificacao
  - Polling de verify-status a cada 5 segundos (timeout 10 min)
  - Apos verificado: chamar activate-pro
  - [Press R] para reenviar email de verificacao
- [x] Task 4.4: Implementar fluxo de login no CLI (AC: 5):
  - Prompt email → prompt password → login → activate-pro
- [x] Task 4.5: Tratamento de erros amigavel (AC: 2,4,8):
  - "Email already registered" → sugerir login
  - "Email not verified" → oferecer reenvio
  - "Invalid credentials" → contador de tentativas
  - "No subscription found" → link de compra
  - "Forgot password?" → exibir "Visit https://pro.synkra.ai/reset-password or contact support"
  - AuthError e BuyerValidationError classes adicionadas
- [x] Task 4.6: Suporte a CI mode via env vars (AC: 11):
  - `AIOS_PRO_EMAIL` + `AIOS_PRO_PASSWORD` (alternativa ao `AIOS_PRO_KEY`)
  - Email+password tem prioridade sobre key quando ambos presentes
- [x] Task 4.7: Testes unitarios
  - 13 testes para AuthError/BuyerValidationError (auth-errors.test.js)
  - 15 testes para license-api auth methods (license-api-auth.test.js)
  - 11 testes para pro-setup auth flow (pro-setup-auth.test.js)

### Phase 5: Security Hardening (@devops + @dev)
- [ ] Task 5.1: Audit de seguranca: garantir API key do Cohort so no server
- [ ] Task 5.2: Validar que senhas nunca sao logadas (mascarar em logs)
- [ ] Task 5.3: Implementar lockout apos tentativas excessivas
- [ ] Task 5.4: Garantir mensagens genericas (anti-enumeracao de emails)
- [ ] Task 5.5: Revisar todas as rotas com OWASP checklist

### Phase 6: Integration Testing (@qa)
- [ ] Task 6.1: Teste E2E: registro → verificacao → ativacao (happy path)
- [ ] Task 6.2: Teste E2E: login → ativacao em novo device
- [ ] Task 6.3: Teste: email nao verificado → bloqueio
- [ ] Task 6.4: Teste: nao-comprador → rejeicao
- [ ] Task 6.5: Teste: backward compat com license key legada
- [ ] Task 6.6: Teste: rate limiting e lockout
- [ ] Task 6.7: Teste: CI mode com env vars
- [ ] Task 6.8: Teste: reenvio de email de verificacao

---

## Technical Details

### Supabase Auth Configuration

```javascript
// License Server — inicializacao do Supabase Auth
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,           // nosso Supabase
  process.env.SUPABASE_SERVICE_ROLE_KEY // service role para admin ops
);

// Signup
const { data, error } = await supabase.auth.admin.createUser({
  email: userEmail,
  password: userPassword,
  email_confirm: false // requer verificacao manual
});

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: userEmail,
  password: userPassword
});

// Check verification
const { data: { user } } = await supabase.auth.admin.getUserById(userId);
const isVerified = user.email_confirmed_at !== null;
```

### Validate Buyer Integration (Server-Side Only)

```javascript
// License Server — NUNCA no CLI
async function validateBuyer(email) {
  const response = await fetch(
    process.env.COHORT_SUPABASE_URL + '/rest/v1/rpc/validate_buyer',
    {
      method: 'POST',
      headers: {
        'apikey': process.env.COHORT_SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        p_email: email,
        p_api_key: process.env.COHORT_VALIDATE_BUYER_API_KEY // PROTEGIDA
      })
    }
  );

  const data = await response.json();
  return data.valid === true;
}
```

### CLI UX Flow (Interactive)

```
  ╔══════════════════════════════════════════════╗
  ║          AIOS Pro Installation Wizard        ║
  ║          Premium Content & Features          ║
  ╚══════════════════════════════════════════════╝

  [1/3] License Activation

  How would you like to activate Pro?
  > 1. Login with email and password (Recommended)
    2. Enter license key

  Email: user@example.com
  Password: ********

  ✓ Account created. Verification email sent!

  ⏳ Waiting for email verification...
     Open your email and click the verification link.
     (Checking every 5 seconds... timeout in 10 minutes)
     [Press R to resend verification email]

  ✓ Email verified!
  ⏳ Validating Pro subscription...
  ✓ Pro subscription confirmed!
  ✓ License activated: PRO-7K9M-****-****-Q8RT

  [2/3] Pro Content Installation
  ...
```

### Environment Variables (License Server)

```bash
# Existing
SUPABASE_URL=https://evvvnarpwcdybxdvcwjh.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # admin access

# NEW — Cohort buyer validation
COHORT_SUPABASE_URL=https://burkonbjjahgyhncxaev.supabase.co
COHORT_SUPABASE_ANON_KEY=eyJ...  # anon key (public, read-only)
COHORT_VALIDATE_BUYER_API_KEY=40d1cc...  # PROTEGIDA, nunca no client
```

---

## Security Considerations

### Defesa em Profundidade

```
Layer 1: Email Verification
  → Garante que o usuario controla o email
  → Supabase Auth envia link unico + expiravel

Layer 2: Password Authentication
  → Garante que so o dono da conta pode fazer login
  → Supabase Auth com bcrypt hashing + salt

Layer 3: Buyer Validation (Server-Side)
  → Garante que o usuario e um comprador legítimo
  → API key NUNCA sai do License Server

Layer 4: Device Binding
  → machineId (SHA-256) vincula ativacao ao hardware
  → Max 2 devices por license (existente)

Layer 5: Rate Limiting
  → 5 tentativas de login / 15 min
  → 3 reenvios de verificacao / hora
  → 10 ativacoes / hora por key
```

### O Que NUNCA Deve Acontecer

1. API key do Cohort no codigo do CLI (client-side)
2. Senhas em logs (mascarar sempre)
3. Revelar se um email existe ou nao (mensagens genericas)
4. Permitir ativacao sem email verificado
5. Permitir login sem senha (exceto future magic link)

---

## Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| PRO-7 (License Server) | In Progress | Endpoints base ja existem |
| Supabase Auth | Disponivel | Ja incluso no projeto Supabase |
| validate_buyer API | Testado | Retorna {valid: true} com API key |
| Supabase SDK (@supabase/supabase-js) | Disponivel | Adicionar ao License Server |
| inquirer (CLI prompts) | Existente | Ja usado no pro-setup.js |

---

## Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Email de verificacao cai no spam | Medium | High | Configurar SPF/DKIM, usar custom domain |
| Supabase Auth rate limits | Low | Medium | Monitorar, upgrade plan se necessario |
| Latencia do validate_buyer | Low | Low | Cache de 24h no License Server |
| Usuario muda email na plataforma de compra | Low | Medium | Permitir re-validacao manual |
| Cohort muda API do validate_buyer | Low | High | Adapter pattern, monitorar breaking changes |

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Tempo medio de ativacao (signup to activated) | < 3 minutos |
| Taxa de verificacao de email | > 90% em 10 min |
| Taxa de ativacao com sucesso (compradores) | > 95% |
| Tentativas de fraude bloqueadas | 100% (email verificado) |
| Uptime do fluxo de auth | 99.9% |

---

## Migration Plan

### Usuarios Existentes (com license key)

1. License key continua funcionando (AC-7)
2. Opcional: vincular license key existente a um e-mail/conta
3. Futuro: migrar todos para auth-based (deprecar key-only)

### Rollout Plan

1. **Phase A (Soft Launch):** Ambas opcoes disponiveis (email + key)
2. **Phase B (Default):** Email como default, key como fallback
3. **Phase C (Deprecation):** Remover opcao de key-only (com aviso previo)

---

## File List

| File | Action | Description |
|------|--------|-------------|
| `packages/installer/src/wizard/pro-setup.js` | MODIFY | Novo Step 1 com opcoes email/key |
| `pro/license/license-api.js` | MODIFY | Adicionar signup(), login(), activateByAuth() |
| `pro/license/errors.js` | MODIFY | Adicionar AuthError, BuyerValidationError |
| **License Server (aios-license-server)** | | |
| `api/v1/auth/signup.js` | CREATE | Endpoint de registro |
| `api/v1/auth/login.js` | CREATE | Endpoint de login |
| `api/v1/auth/verify-status.js` | CREATE | Check email verification |
| `api/v1/auth/activate-pro.js` | CREATE | Validate buyer + activate |
| `api/v1/auth/refresh.js` | CREATE | Refresh session token |
| `lib/buyer-validator.js` | CREATE | Adapter para validate_buyer API |
| `lib/auth-middleware.js` | CREATE | JWT validation middleware |
| **Database (Supabase)** | | |
| Migration: add user_id to licenses | CREATE | Vincular licenses a auth users |
| Migration: buyer_validations table | CREATE | Cache de validacao |

---

## CodeRabbit Integration

### Story Type Analysis

**Primary Type**: Security + API
**Secondary Type(s)**: Infrastructure, CLI
**Complexity**: High (13 points, cross-repo, auth system)

### Specialized Agent Assignment

**Primary Agents**:
- @dev: License Server endpoints + CLI auth flow implementation
- @devops: Supabase Auth setup + security hardening

**Supporting Agents**:
- @architect: API design review, security architecture review
- @qa: Integration testing, E2E auth flow validation

### Quality Gate Tasks

- [ ] Pre-Commit (@dev): Unit tests for all auth endpoints (>= 80% coverage)
- [ ] Code Review (@architect): Auth flow security, API design, credential protection
- [ ] Pre-PR (@devops): Security audit — verify API keys not in client code, passwords not logged
- [ ] Integration Test (@qa): E2E auth flows (signup, verify, login, activate)

### Self-Healing Configuration

**Expected Self-Healing**:
- Primary Agent: @dev (light mode)
- Max Iterations: 2
- Timeout: 15 minutes
- Severity Filter: CRITICAL only

**Predicted Behavior**:
- CRITICAL issues: auto_fix (security vulnerabilities, credential leaks)
- HIGH issues: document_only (API design improvements)
- MEDIUM issues: ignore
- LOW issues: ignore

### CodeRabbit Focus Areas

**Primary Focus**:
- Auth security: credential handling, JWT validation, session management
- API error handling: proper HTTP status codes, generic error messages (anti-enumeration)
- Credential protection: no API keys in client code, no passwords in logs

**Secondary Focus**:
- Input validation: email format, password strength, request sanitization
- Rate limiting: proper 429 responses with retryAfter headers
- Backward compatibility: existing license key flow unaffected

---

## Dev Notes

### Relevant Source Tree

```
aios-core/
├── packages/installer/src/wizard/
│   └── pro-setup.js              # MODIFY — Step 1 auth flow (lines 157-240)
├── pro/license/
│   ├── license-api.js            # MODIFY — add signup(), login(), activateByAuth()
│   ├── license-cache.js          # NO CHANGE — cache behavior preserved
│   ├── license-crypto.js         # NO CHANGE — machine ID generation reused
│   ├── feature-gate.js           # NO CHANGE
│   └── errors.js                 # MODIFY — add AuthError, BuyerValidationError

aios-license-server/ (separate repo: github.com/SynkraAI/aios-license-server)
├── api/v1/
│   ├── license/                  # EXISTING — activate, validate, deactivate
│   └── auth/                     # CREATE — signup, login, verify-status, activate-pro, refresh
├── lib/
│   ├── buyer-validator.js        # CREATE — adapter for Cohort validate_buyer
│   └── auth-middleware.js        # CREATE — JWT validation middleware
└── vercel.json                   # May need route updates

Supabase (evvvnarpwcdybxdvcwjh):
├── auth.users                    # Supabase Auth managed table
├── public.licenses               # MODIFY — add user_id, customer_email columns
└── public.buyer_validations      # CREATE — validation cache table
```

### Key Implementation Notes

1. **pro-setup.js** (`packages/installer/src/wizard/pro-setup.js`):
   - `stepLicenseGate()` (line 157) is the entry point to modify
   - Add `inquirer` list prompt before the current password prompt
   - Existing `validateKeyWithApi()` (line 248) stays for backward compat
   - New function `authenticateWithEmail()` handles the auth flow

2. **license-api.js** (`pro/license/license-api.js`):
   - `LicenseApiClient` class (line 34) gets new auth methods
   - Base URL unchanged: `https://aios-license-server.vercel.app`
   - New methods hit `/v1/auth/*` instead of `/v1/license/*`

3. **Supabase Auth** uses `supabase.auth.admin.createUser()` (server-side) not `supabase.auth.signUp()` (client-side) — this allows the server to control the flow without exposing Supabase credentials to the CLI

4. **Password reset interim**: Until a web portal exists (PRO-13), password resets are handled manually by admin via Supabase Dashboard. CLI displays: "Visit https://pro.synkra.ai/reset-password or contact support@synkra.ai"

5. **validate_buyer API** confirmed working (tested 2026-02-15):
   - Endpoint: `POST https://burkonbjjahgyhncxaev.supabase.co/rest/v1/rpc/validate_buyer`
   - Test email: `gabrielfofonka98@gmail.com` → `{valid: true}`
   - Requires `p_api_key` (stored as `COHORT_VALIDATE_BUYER_API_KEY` on Vercel)

### Testing

**Framework:** Jest (consistent with existing `pro/license/` tests)
**Test Location:** `tests/pro/license/` (unit) + `tests/integration/auth/` (E2E)

**Test Standards:**
- Minimum 80% coverage for new code
- Mock Supabase Auth and validate_buyer API in unit tests
- Use `nock` or `msw` for HTTP mocking
- Integration tests require test Supabase project or local Supabase (`supabase start`)

**Test Data:**
- Test email: use `+test` suffix (e.g., `test+pro11@synkra.ai`)
- Test password: `TestPr0-2026!` (meets 8-char minimum)
- Mock validate_buyer responses: `{valid: true}` and `{valid: false}`
- Mock Supabase Auth responses: verified user, unverified user, rate-limited

**Key Test Scenarios:**
| Scenario | Expected | AC |
|----------|----------|-----|
| Signup happy path | Account created, email sent | AC-1 |
| Unverified blocks activation | 403, "verify email" message | AC-2 |
| Valid buyer activates | License key generated | AC-3 |
| Invalid buyer rejected | "No subscription found" | AC-4 |
| Login on new device | Existing key recovered | AC-5 |
| Wrong email owner | Verification link to real owner | AC-6 |
| Legacy key still works | Activation via key unchanged | AC-7 |
| 6th login attempt | 429 rate limited | AC-8 |

---

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References
- Tests: `npx jest tests/license/auth-errors.test.js tests/license/license-api-auth.test.js --testPathIgnorePatterns='[]'` (28 passed)
- Tests: `npx jest tests/installer/pro-setup-auth.test.js` (11 passed)
- Lint: 0 errors, 3 pre-existing warnings

### Completion Notes List
- Phase 4 (CLI Auth Flow) implemented in aios-core — 7/7 tasks complete
- Phases 1-3 are cross-repo (aios-license-server + Supabase Dashboard) — require separate implementation
- Phase 5-6 require both repos — partially implementable after Phases 2-3
- `_handleResponse` in license-api.js improved: preserves server error codes from 403 and 5xx responses (backward compatible)
- Added `resendVerification()` method (not in original story tasks but needed for AC-9 CLI support)
- Existing test `license-api.test.js > should use default config` was already failing pre-implementation (expects `api.synkra.ai`, actual is `aios-license-server.vercel.app`)

### File List
| File | Action | Description |
|------|--------|-------------|
| `pro/license/errors.js` | MODIFIED | Added AuthError, BuyerValidationError classes |
| `pro/license/license-api.js` | MODIFIED | Added signup(), login(), checkEmailVerified(), activateByAuth(), resendVerification(); improved _handleResponse error code preservation |
| `packages/installer/src/wizard/pro-setup.js` | MODIFIED | Added email/password auth flow, method selection UI, verification polling, CI env var support |
| `tests/license/auth-errors.test.js` | CREATED | 13 unit tests for AuthError and BuyerValidationError |
| `tests/license/license-api-auth.test.js` | CREATED | 15 unit tests for license-api auth methods |
| `tests/installer/pro-setup-auth.test.js` | CREATED | 11 unit tests for pro-setup auth flow and backward compat |

---

## QA Results
_To be populated during QA review_

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-15 | 0.1 | Initial draft — Email auth + buyer validation flow | @devops (Gage) |
| 2026-02-15 | 1.0 | PO validation: Added CodeRabbit Integration, Dev Notes, Testing standards, AC-to-task mapping, executor field fix, schema migration moved to Phase 1, password reset interim solution; Status Draft → Ready | @po (Pax) |
| 2026-02-15 | 1.1 | Phase 4 implemented: CLI auth flow (errors.js, license-api.js, pro-setup.js) + 39 unit tests. Improved _handleResponse error code preservation. | @dev (Dex) |

---

*Epic PRO - Story PRO-11 | Validated 2026-02-15*
