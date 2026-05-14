# Sprint 1: Authentication & Multi-tenant Foundation

**Duration:** 2 weeks | **Team:** 1-2 developers | **Estimated:** 80 hours

---

## Epic Context

Estabelecer a base segura e autenticada para o sistema AIOX Finance Commission. Sprint 1 desbloqueia todas as sprints subsequentes porque nenhuma outra funcionalidade pode funcionar sem autenticação + RLS (Row Level Security).

---

## Story 1.1: Implementar Supabase Auth com Sign Up / Login / Logout

**Tipo:** Backend Setup + Frontend Auth UI

**Acceptance Criteria:**

- [ ] Supabase project criado + PostgreSQL ready
- [ ] Schema migrations 001-002 aplicadas (users, permissions)
- [ ] Supabase Auth habilitado (Email/Password)
- [ ] Endpoint POST `/api/auth/signup` aceita email + password, cria user + retorna JWT
- [ ] Endpoint POST `/api/auth/login` valida credentials, retorna JWT + user data
- [ ] Endpoint POST `/api/auth/logout` invalida sessão
- [ ] JWT payload inclui user.id, user.role, exp
- [ ] Frontend: tela de login funcional (email + password + "Entrar")
- [ ] Frontend: botão Logout na sidebar que chama /api/auth/logout
- [ ] Session persist em localStorage (JWT)
- [ ] Protected routes redirectam para login se não autenticado
- [ ] Testes: unit tests em signup/login (validação, edge cases)
- [ ] Testes: E2E login flow (happy path + error cases)

**File List:**

- backend: `src/modules/auth/auth.controller.ts`, `auth.service.ts`, `auth.module.ts`
- backend: `src/guards/jwt.guard.ts`, `src/decorators/current-user.decorator.ts`
- frontend: `src/pages/login.tsx`, `src/hooks/useAuth.ts`, `src/context/AuthContext.tsx`
- migrations: `supabase/migrations/001_auth.sql`, `002_permissions.sql`
- tests: `src/modules/auth/__tests__/*.spec.ts`

**Dependencies:**

- NestJS @nestjs/jwt, @nestjs/passport
- Supabase client JS
- zod (validation)
- React Context or Zustand (state)

**Risks & Mitigations:**

- Risk: CORS issues entre frontend e backend
  - Mitigation: CORS allowlist early, test from browser console
- Risk: JWT expiry handling
  - Mitigation: refresh token endpoint, auto-refresh on 401

**Estimated:** 20 hours

---

## Story 1.2: Implementar RLS Policies (Multi-tenant Security)

**Tipo:** Database Security

**Acceptance Criteria:**

- [ ] Migrations 001-008 aplicadas completamente
- [ ] RLS habilitado globalmente (`ALTER SYSTEM SET rls.enabled = true`)
- [ ] Tabela `users`: policy "Users view self or admin" aplicada + testada
- [ ] Tabela `customers`: policy "All authenticated users see customers" aplicada
- [ ] Tabela `sales`: policy "Sales visibility by role" aplicada
  - ADMIN/FINANCEIRO veem todas as vendas
  - COMERCIAL vê apenas suas vendas (seller_id = auth.uid())
- [ ] Tabela `commissions`: policy aplicada (similar a sales)
- [ ] Tabela `permissions`: apenas ADMIN pode ler
- [ ] Tabela `audit_log`: apenas ADMIN pode ler
- [ ] Tabela `accounts`, `movements`: FINANCEIRO/ADMIN only
- [ ] Test: cross-tenant leak attempt falha (COMERCIAL não consegue ver outra venda de outro seller)
- [ ] Test: ADMIN consegue ver tudo
- [ ] Performance: queries com RLS têm <100ms em 1M rows

**File List:**

- migrations: `supabase/migrations/003-008_rls-policies.sql` (atualizado)
- tests: `supabase/__tests__/rls-*.test.sql`

**Dependencies:**

- Supabase RLS engine
- pgTap ou similar para SQL tests

**Risks & Mitigations:**

- Risk: RLS misconfiguration expõe dados
  - Mitigation: security audit + automated CI tests
- Risk: Performance hit com RLS
  - Mitigation: índices planejados, análise de explain plans

**Estimated:** 25 hours

---

## Story 1.3: Implementar Roles & Permissions Matrix

**Tipo:** Backend Setup

**Acceptance Criteria:**

- [ ] Tabela `permissions` populada com matriz 5 roles × 7 resources × 4 actions (vide schema)
- [ ] Seed script insere defaults (ADMIN full, COMERCIAL limited, FINANCEIRO read+approve, etc.)
- [ ] Endpoint GET `/api/permissions` retorna matriz
- [ ] Endpoint POST `/api/permissions/grant` (ADMIN only) permite adicionar permissão
- [ ] Endpoint DELETE `/api/permissions/revoke` (ADMIN only)
- [ ] Middleware `@CheckPermission('sales', 'CREATE')` bloqueia se usuário não tem permissão
- [ ] Decorator funciona em controller methods
- [ ] Test: COMERCIAL não consegue acessar POST /api/users
- [ ] Test: ADMIN consegue acessar tudo
- [ ] Test: permissão dinâmica (adicionar depois que usuário foi criado) funciona

**File List:**

- backend: `src/modules/permissions/permissions.service.ts`, `permissions.controller.ts`
- backend: `src/guards/permission.guard.ts`
- backend: `src/decorators/check-permission.decorator.ts`
- migrations: seed permissions (já em schema)
- tests: `src/modules/permissions/__tests__/*.spec.ts`

**Dependencies:**

- Supabase RLS + policy conditions
- NestJS guards + metadata reflection

**Risks & Mitigations:**

- Risk: permission explosion (matrix fica complexa)
  - Mitigation: document roles + audit regularly

**Estimated:** 15 hours

---

## Story 1.4: Configurar Estrutura NestJS + TypeScript Completa

**Tipo:** Project Setup

**Acceptance Criteria:**

- [ ] NestJS 10+ com TypeScript 5+
- [ ] ESLint + Prettier configurado
- [ ] Jest + @nestjs/testing setup
- [ ] Package.json scripts: dev, build, test, lint, typecheck
- [ ] tsconfig.json com paths: `@src/*`, `@modules/*`, `@common/*`
- [ ] .env.example com variáveis (SUPABASE_URL, SUPABASE_KEY, JWT_SECRET, etc.)
- [ ] Docker setup (opcional mas recomendado para dev)
- [ ] GitHub Actions CI: lint + typecheck + test em todo PR
- [ ] README com setup instructions
- [ ] Database connection string in .env works
- [ ] First test passes (`npm test`)

**File List:**

- `src/main.ts` (entry point)
- `src/app.module.ts` (root module)
- `.eslintrc.js`, `.prettierrc`
- `jest.config.js`
- `tsconfig.json`
- `.github/workflows/ci.yml`
- `Dockerfile` (optional)
- `docker-compose.yml` (optional)

**Dependencies:**

- @nestjs/core, @nestjs/common, @nestjs/jwt
- @supabase/supabase-js
- typeorm (optional, pode usar supabase client direto)
- zod, axios, etc.

**Estimated:** 20 hours

---

## Story 1.5: Backend Health Check + Deployment Setup

**Tipo:** DevOps Prep

**Acceptance Criteria:**

- [ ] Endpoint GET `/health` retorna 200 + { status: 'ok' }
- [ ] Endpoint GET `/api/status` retorna DB connection status
- [ ] Environment variables validados na startup (erro se faltam obrigatórias)
- [ ] Graceful shutdown (10s timeout)
- [ ] Logging estruturado (Winston ou Pino)
- [ ] Error handling middleware (500s viram JSON com requestId)
- [ ] CORS configurado para frontend URL
- [ ] Rate limiting em endpoints (opcional mas desejável)
- [ ] Deployment script para Vercel / Railway / Render
- [ ] Test: startup sequence completa
- [ ] Documented: environment variables + deployment steps

**File List:**

- `src/health/health.controller.ts`
- `src/filters/http-exception.filter.ts`
- `src/middleware/logging.middleware.ts`
- `deploy.md` ou `DEPLOYMENT.md`
- `.vercelrc` ou `railway.json` (se Vercel/Railway)

**Estimated:** 5 hours

---

## Summary

| Story     | Title                 | Hours   | Blocker?         |
| --------- | --------------------- | ------- | ---------------- |
| 1.1       | Supabase Auth + JWT   | 20h     | YES              |
| 1.2       | RLS Policies          | 25h     | YES              |
| 1.3       | Roles & Permissions   | 15h     | NO (after 1.1)   |
| 1.4       | NestJS Setup          | 20h     | YES (foundation) |
| 1.5       | Health Check + Deploy | 5h      | NO (final touch) |
| **TOTAL** |                       | **85h** |                  |

**Execution Order (Sequential):**

1. Story 1.4 (NestJS setup) — foundation
2. Story 1.1 (Auth) — unlocks everything
3. Story 1.2 (RLS) — security
4. Story 1.3 (Permissions) — authorization
5. Story 1.5 (Health + Deploy) — polish

**Definition of Done (all stories):**

- ✅ Code passes `npm run lint`
- ✅ TypeScript: `npm run typecheck` (zero errors)
- ✅ Tests pass: `npm test` (>80% coverage)
- ✅ Build succeeds: `npm run build`
- ✅ No CRITICAL issues in CodeRabbit
- ✅ All AC met
- ✅ Deployed to staging (if CD available)
- ✅ @qa sign-off (QA Gate: PASS)

---

## Handoff to Sprint 2

After Sprint 1 completes:

- All future PRs will be authenticated (Story 1.1)
- All queries will respect tenant boundaries (Story 1.2)
- UI will check permissions before showing buttons (Story 1.3)
- Backend will be deployable (Story 1.5)

**Sprint 2 unblocked:** Vendas domain (sales CRUD) can now assume auth + RLS + permissions work.
