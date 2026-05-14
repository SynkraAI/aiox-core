# 💰 AIOX Finance Commission System

**Status:** Sprint 1 - Foundation Phase  
**Start Date:** 2026-05-12  
**Team:** 1-2 developers  
**Estimated Duration:** 2 weeks (80 hours)

---

## 🎯 Objetivo

Estabelecer a base segura e autenticada para o sistema AIOX Finance Commission. Sprint 1 desbloqueia todas as sprints subsequentes porque nenhuma outra funcionalidade pode funcionar sem autenticação + RLS (Row Level Security).

---

## 📋 Sprint 1 Stories (5 stories, 85 horas)

| Story | Título                    | Horas | Status     |
| ----- | ------------------------- | ----- | ---------- |
| 1.1   | Supabase Auth + JWT       | 20h   | 🔵 Pending |
| 1.2   | RLS Policies              | 25h   | 🔵 Pending |
| 1.3   | Roles & Permissions       | 15h   | 🔵 Pending |
| 1.4   | NestJS + TypeScript Setup | 20h   | 🔵 Pending |
| 1.5   | Health Check + Deploy     | 5h    | 🔵 Pending |

**Execution Order:**

1. Story 1.4 (NestJS setup) — foundation
2. Story 1.1 (Auth) — unlocks everything
3. Story 1.2 (RLS) — security
4. Story 1.3 (Permissions) — authorization
5. Story 1.5 (Health + Deploy) — polish

---

## 🏗️ Architecture

### Tech Stack

- **Backend:** NestJS 10+, TypeScript 5+
- **Database:** PostgreSQL (Supabase)
- **Auth:** Supabase Auth (JWT)
- **Testing:** Jest + @nestjs/testing
- **Quality:** ESLint, Prettier, TypeScript strict

### Core Domains

1. **Auth** - User authentication and session management
2. **Users & Permissions** - Role-based access control (RBAC)
3. **Customers** - Customer management
4. **Sales** - Sales transactions with RLS isolation
5. **Commissions** - Commission calculation engine (7 types)
6. **Accounts** - Double-entry ledger
7. **Audit** - Compliance logging

---

## 📁 Project Structure

```
services/aiox-finance/
├── docs/                           # Documentation
│   ├── SPRINT-1-SPECIFICATION.md
│   ├── commission-engine-reference.ts
│   └── supabase-schema-reference.sql
│
├── src/                            # Source code
│   ├── main.ts                     # Entry point
│   ├── app.module.ts               # Root module
│   ├── modules/                    # Feature modules
│   │   ├── auth/
│   │   ├── users/
│   │   ├── permissions/
│   │   ├── customers/
│   │   ├── sales/
│   │   ├── commissions/
│   │   └── accounts/
│   ├── guards/                     # JWT, permission guards
│   ├── decorators/                 # Custom decorators
│   ├── filters/                    # Exception filters
│   └── middleware/                 # Logging, CORS, etc.
│
├── supabase/                       # Database
│   └── migrations/
│       ├── 001_auth.sql
│       ├── 002_permissions.sql
│       ├── 003_customers.sql
│       ├── 004_sales.sql
│       ├── 005_commission_types.sql
│       ├── 006_commissions.sql
│       ├── 007_accounts.sql
│       └── 008_audit.sql
│
├── tests/                          # Test files
│   ├── auth/
│   ├── permissions/
│   └── e2e/
│
├── package.json
├── tsconfig.json
├── .eslintrc.js
├── .prettierrc
├── jest.config.js
├── .env.example
└── README.md
```

---

## 🚀 Getting Started

### 1. Setup Environment

```bash
cd services/aiox-finance
cp .env.example .env

# Edit .env with your Supabase credentials:
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_ANON_KEY=eyJhbGci...
# SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
# JWT_SECRET=your-secret-key-here
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Migrations

```bash
# Apply all 8 migrations to Supabase
supabase db push
```

### 4. Start Development Server

```bash
npm run dev
```

---

## 📚 Reference Documents

**Specification:** `docs/SPRINT-1-SPECIFICATION.md`

- Complete story breakdowns
- Acceptance criteria
- Implementation details

**Commission Engine:** `docs/commission-engine-reference.ts`

- 7 commission types (Strategy Pattern)
- Validation logic
- Calculation examples

**Database Schema:** `docs/supabase-schema-reference.sql`

- 8 migrations
- RLS policies
- Seed data (permissions matrix)

---

## ✅ Definition of Done (All Stories)

- ✅ Code passes `npm run lint` (zero errors)
- ✅ TypeScript: `npm run typecheck` (zero errors)
- ✅ Tests pass: `npm test` (>80% coverage)
- ✅ Build succeeds: `npm run build`
- ✅ No CRITICAL issues in CodeRabbit
- ✅ All acceptance criteria met
- ✅ Deployed to staging
- ✅ QA sign-off

---

## 📞 Development Workflow

1. **@sm** creates story from spec
2. **@po** validates story (10-point checklist)
3. **@dev** implements (YOLO/Interactive mode)
4. **@qa** reviews (7 quality checks)
5. **@devops** pushes to main

---

**Next Step:** Create Story 1.4 (NestJS Setup) as foundation

Created: 2026-05-12
Version: 1.0.0-initial
