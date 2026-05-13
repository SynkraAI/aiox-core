# Story 7.1.1: Bootstrap /dev Workspace — aiox-dashboard Clone

**Story ID:** 7.1.1  
**Epic:** Epic-7 - Dashboard Workspace Integration  
**Wave:** Wave 1 (Foundation)  
**Status:** ⌛ In Progress
**Priority:** 🔴 High  
**Owner:** Architect (Aria) → Dev (Dex)  
**Created:** 2026-05-05  
**Updated:** 2026-05-05

---

## 📋 Objective

Configurar `/dev` como monorepo pai com `aiox-core` e `aiox-dashboard` como projetos irmãos.  
O dashboard observa dados do aiox-core via Supabase (read-only). Sem workspace hoisting — projetos independentes.

---

## 🎯 Story

**As a** desenvolvedor AIOX,  
**I want** o `aiox-dashboard` clonado em `C:\dev\aiox-dashboard` com um root `package.json` de conveniência em `C:\dev\`,  
**So that** posso rodar e desenvolver CLI + Dashboard em paralelo no mesmo workspace.

---

## ✅ Acceptance Criteria

- [x] `C:\dev\aiox-dashboard\` existe com clone do repositório `SynkraAI/aiox-dashboard`
- [x] `C:\dev\package.json` existe com scripts de conveniência (`dev`, `dev:core`, `dev:dashboard`, `lint`, `test`)
- [x] `C:\dev\.gitignore` existe cobrindo `node_modules`, `.env`, lock files dos dois projetos
- [x] `C:\dev\aiox-dashboard\.env.local` criado a partir do `.env.example` do dashboard
- [ ] Variáveis Supabase alinhadas entre `aiox-core` e `aiox-dashboard` — **pendente: preencher credenciais**
- [x] `cd C:\dev\aiox-dashboard && npm install` completa sem erros (bun não instalado, npm usado como fallback)
- [ ] Dashboard roda localmente (`npm run dev`) com acesso ao Supabase configurado — **pendente: credenciais Supabase**

---

## 📐 Scope

**IN:**
- Clone do repositório aiox-dashboard
- Root `package.json` com scripts only (sem workspace hoisting)
- Alinhamento de variáveis de ambiente Supabase
- `.gitignore` raiz

**OUT:**
- Unificação de workspaces npm (risco CJS/ESM)
- Rename de namespace `@aios/` → `@aiox/` (Story 7.1.2)
- Integração de dados Supabase (Story 7.1.3)
- CI/CD para o dashboard (Story 7.1.4)

---

## 🔗 Dependencies

- `aiox-core` já configurado em `C:\dev\aiox-core\`
- Bun não instalado; npm usado como fallback
- Credenciais Supabase disponíveis em `C:\dev\aiox-core\.env`

---

## 📁 File List

- [x] `C:\dev\package.json` — root workspace scripts
- [x] `C:\dev\.gitignore` — root gitignore
- [x] `C:\dev\aiox-dashboard\` — clone do repositório (1358 arquivos)
- [x] `C:\dev\aiox-dashboard\.env.local` — env local do dashboard (Supabase vars aguardando preenchimento)

---

## 📝 Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-05-05 | Aria (@architect) | Story criada em YOLO mode |
