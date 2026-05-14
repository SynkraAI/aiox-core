# 🏛️ Plano Arquitetural: Sistema de Controle Financeiro + Comissões

**Versão:** 1.0  
**Data:** 2026-05-13  
**Status:** Arquitetura Validada  
**Próximo Passo:** Sprint Planning

---

## 1. VISÃO GERAL DO SISTEMA

### 1.1 Objetivos Principais

```
┌─────────────────────────────────────────────────────────────┐
│ Criar sistema SaaS profissional de:                         │
│ • Gestão de vendas                                          │
│ • Cálculo automático de comissões                           │
│ • Aprovação de comissões com audit trail                    │
│ • Recorrências (mensalidades automáticas)                   │
│ • Dashboard financeiro multi-dimensional                    │
│ • Relatórios inteligentes com export (PDF/Excel)            │
│ • Controle por usuário/vendedor com RLS                     │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Stack Atual (VALIDADO ✅)

**Backend:**

- NestJS 10.3 (TypeScript)
- Supabase (PostgreSQL + Auth + RLS)
- Zod (validation)
- UUID v4

**Frontend:**

- React (localhost:3000)
- HTML/CSS (dashboard estático - será evoluído)
- Fetch API → NestJS backend

**Database:**

- PostgreSQL (Supabase)
- Row-Level Security (RLS) policies
- Migrations versionadas

**Quality:**

- Jest (unit + integration tests)
- TypeScript strict mode
- ESLint + Prettier

---

## 2. ARQUITETURA DE BANCO DE DADOS

### 2.1 ERD Conceitual (Estado Atual + Extensões)

```
┌─────────────────────────────────────────────────────────────────┐
│                      USERS (Foundation)                         │
│ ├─ id (UUID PK)                                                 │
│ ├─ email (UNIQUE)                                               │
│ ├─ role (ENUM: ADMIN, FINANCEIRO, GESTOR, COMERCIAL, VENDEDOR) │
│ ├─ commission_percentage (DECIMAL 5.2) ← ★ NEW                 │
│ ├─ active (BOOLEAN)                                             │
│ └─ created_at, updated_at                                       │
└─────────────────────────────────────────────────────────────────┘
         │
         ├──> CUSTOMERS
         │    ├─ id (UUID PK)
         │    ├─ name, email, phone
         │    ├─ created_by (FK users)
         │    └─ [address, city, state, zip]
         │
         ├──> SALES ← ★ CORE TABLE
         │    ├─ id (UUID PK)
         │    ├─ customer_id (FK customers)
         │    ├─ seller_id (FK users)
         │    ├─ gross_amount (DECIMAL 15.2)
         │    ├─ net_amount (DECIMAL 15.2) ← ★ NEW
         │    ├─ tax_amount (DECIMAL 15.2) ← ★ NEW
         │    ├─ discount_amount (DECIMAL 15.2) ← ★ NEW
         │    ├─ payment_method (ENUM) ← ★ NEW
         │    ├─ financial_gateway_id (FK) ← ★ NEW
         │    ├─ installment_count (INT) ← ★ NEW
         │    ├─ is_recurring (BOOLEAN) ← ★ NEW
         │    ├─ status (ENUM: PENDING, APPROVED, REJECTED, PAID)
         │    ├─ sale_date
         │    ├─ notes
         │    └─ created_at, updated_at
         │
         ├──> COMMISSIONS
         │    ├─ id (UUID PK)
         │    ├─ sale_id (FK sales)
         │    ├─ seller_id (FK users)
         │    ├─ amount (DECIMAL 15.2)
         │    ├─ percentage (DECIMAL 5.2)
         │    ├─ status (ENUM: PENDING, APPROVED, REJECTED, PAID)
         │    ├─ approved_by (FK users)
         │    ├─ approval_date
         │    ├─ payment_date ← ★ NEW
         │    └─ created_at, updated_at
         │
         ├──> RECURRING_PAYMENTS ← ★ NEW TABLE
         │    ├─ id (UUID PK)
         │    ├─ sale_id (FK sales) - se is_recurring=true
         │    ├─ customer_id (FK customers)
         │    ├─ seller_id (FK users)
         │    ├─ monthly_amount (DECIMAL 15.2)
         │    ├─ start_date
         │    ├─ end_date
         │    ├─ due_day (INT: 1-31)
         │    ├─ status (ENUM: ACTIVE, COMPLETED, CANCELLED)
         │    └─ created_at
         │
         ├──> RECURRING_INSTALLMENTS ← ★ NEW TABLE
         │    ├─ id (UUID PK)
         │    ├─ recurring_payment_id (FK recurring_payments)
         │    ├─ month_year (DATE)
         │    ├─ amount (DECIMAL 15.2)
         │    ├─ due_date
         │    ├─ status (ENUM: PENDING, PAID, OVERDUE, CANCELLED)
         │    ├─ paid_date
         │    └─ created_at, updated_at
         │
         ├──> FINANCIAL_GATEWAYS ← ★ NEW TABLE
         │    ├─ id (UUID PK)
         │    ├─ name (VARCHAR: Cakto, InfinitePay, Mercado Pago, Stripe, Asaas, Outro)
         │    ├─ active (BOOLEAN)
         │    └─ created_at
         │
         ├──> ACCOUNTS
         │    ├─ id (UUID PK)
         │    ├─ user_id (FK users)
         │    ├─ account_type (ENUM: CHECKING, SAVINGS, INVESTMENT)
         │    ├─ balance (DECIMAL 15.2)
         │    ├─ status (ENUM: ACTIVE, INACTIVE, FROZEN)
         │    └─ created_at, updated_at
         │
         ├──> AUDIT_LOG
         │    ├─ id (UUID PK)
         │    ├─ user_id (FK users)
         │    ├─ action (VARCHAR)
         │    ├─ table_name (VARCHAR)
         │    ├─ record_id (UUID)
         │    ├─ changes (JSONB)
         │    ├─ ip_address
         │    ├─ user_agent
         │    └─ created_at
         │
         └──> MOVEMENTS ← ★ ENHANCED
              ├─ id (UUID PK)
              ├─ user_id (FK users)
              ├─ amount (DECIMAL 15.2)
              ├─ movement_type (ENUM: DEPOSIT, WITHDRAWAL, COMMISSION_CREDIT, ...)
              ├─ related_commission_id (FK commissions) ← ★ NEW
              ├─ related_sale_id (FK sales) ← ★ NEW
              ├─ status (ENUM: PENDING, COMPLETED, FAILED)
              ├─ description
              └─ created_at
```

### 2.2 Novas Tabelas Necessárias

| Tabela                   | Propósito                                      | Prioridade |
| ------------------------ | ---------------------------------------------- | ---------- |
| `recurring_payments`     | Armazenar mensalidades ativas                  | **P0**     |
| `recurring_installments` | Parcelas geradas automaticamente               | **P0**     |
| `financial_gateways`     | Mapeamento de financeiras (Cakto, Stripe, etc) | **P1**     |
| `sales_installments`     | Parcelas da venda (vendas à prazo)             | **P1**     |

### 2.3 Campos Novos em Tabelas Existentes

**users:**

- `commission_percentage` (DECIMAL 5.2) - % de comissão padrão

**sales:**

- `gross_amount` (antes apenas `amount`)
- `net_amount` - valor que entra para empresa
- `tax_amount` - impostos/taxas
- `discount_amount` - descontos
- `payment_method` (ENUM)
- `financial_gateway_id` (FK)
- `installment_count` (INT)
- `is_recurring` (BOOLEAN)

**commissions:**

- `payment_date` - quando foi paga
- `approval_date` - quando foi aprovada

---

## 3. DECOMPOSIÇÃO EM FEATURES/STORIES

### 3.1 EPIC 3: Core Financial Operations (Sprint 3)

#### Story 3.1: Enhanced Sales Management

- **Objetivo:** Expandir cadastro de vendas com todos os campos necessários
- **AC:**
  - Vendas com gross/net/tax/discount amounts
  - Integração com financial gateways (Cakto, Stripe, etc)
  - Suporte a parcelamentos (installment_count)
  - Identificação de vendas recorrentes (is_recurring flag)
  - RLS policies por vendedor/admin
  - Tests: 15+ cases

**Arquivos novos:**

- `src/modules/sales/sales.module.ts`
- `src/modules/sales/sales.service.ts`
- `src/modules/sales/sales.controller.ts`
- `src/modules/sales/dto/*`
- `src/modules/sales/__tests__/*`

**Database:**

- Migration: Alter `sales` table + add fields
- Indexes: (seller_id, status), (customer_id), (financial_gateway_id)

---

#### Story 3.2: Financial Gateways Management

- **Objetivo:** CRUD para financeiras (Cakto, InfinitePay, Stripe, etc)
- **AC:**
  - Listar, criar, editar, deletar gateways
  - Flag de ativação (active/inactive)
  - Apenas ADMIN pode gerenciar
  - Tests: 10+ cases

**Arquivos novos:**

- `src/modules/financial-gateways/gateways.module.ts`
- `src/modules/financial-gateways/gateways.service.ts`
- `src/modules/financial-gateways/gateways.controller.ts`

**Database:**

- Migration: Create `financial_gateways` table

---

#### Story 3.3: Automatic Commission Calculation

- **Objetivo:** Calcular automaticamente comissões ao criar venda
- **AC:**
  - Comissão = seller_commission_percentage × sale.net_amount
  - Gerar registro em `commissions` table com status=PENDING
  - Atualizar `users.commission_percentage` quando muda role
  - Apenas vendas aprovadas contam para comissão
  - Audit log cada cálculo
  - Tests: 12+ cases

**Arquivos novos:**

- `src/modules/commissions/commissions.module.ts`
- `src/modules/commissions/commissions.service.ts`
- `src/modules/commissions/commission-calculator.service.ts` (lógica pura)
- `src/modules/commissions/__tests__/*`

**Database:**

- Migration: Alter `commissions` table + add approval_date, payment_date
- Trigger: Auto-create commission record quando sale.status='APPROVED'

---

#### Story 3.4: Commission Approval Workflow

- **Objetivo:** ADMIN/FINANCEIRO aprova comissões, audit trail automático
- **AC:**
  - Endpoint PATCH `/api/commissions/:id/approve`
  - Validar seller_id, verify amounts
  - Registrar approved_by, approval_date
  - Atualizar commission.status = APPROVED
  - Gerar movimento no `movements` table
  - Trigger audit log automático
  - RLS: Apenas ADMIN/FINANCEIRO podem aprovar
  - Tests: 14+ cases

**Arquivos novos:**

- `src/modules/commissions/commission-approval.service.ts`
- Nova action em commissions.controller.ts

**Database:**

- Trigger: Auto-audit quando comissão muda de status

---

### 3.2 EPIC 4: Recurring Payments & Recurring Commissions (Sprint 4)

#### Story 4.1: Recurring Sales Setup

- **Objetivo:** Criar sistema de vendas recorrentes (mensalidades)
- **AC:**
  - Flag is_recurring=true em venda
  - Definir data início, data término, dia de vencimento
  - Gerar automaticamente table `recurring_payments` com status=ACTIVE
  - Calcular quantas parcelas (meses entre start/end)
  - Validações: end_date > start_date, due_day 1-31
  - Tests: 16+ cases

**Arquivos novos:**

- `src/modules/recurring/recurring.module.ts`
- `src/modules/recurring/recurring.service.ts`
- `src/modules/recurring/recurring-calculator.service.ts`
- DTOs para criar recurring payment

**Database:**

- Migrations: Create `recurring_payments`, `recurring_installments` tables

---

#### Story 4.2: Auto-Generate Monthly Installments

- **Objetivo:** Gerar automaticamente parcelas mensais de recorrências
- **AC:**
  - Ao criar recurring_payment, gerar N registros em recurring_installments
  - Cada installment tem: month_year, amount, due_date, status=PENDING
  - Scheduler (cron ou event) gera parcelas futuras automaticamente
  - Exemplo: 10/05/2026 até 10/05/2027 dia 10 → 12 parcelas
  - Tests: 14+ cases

**Arquivos novos:**

- `src/modules/recurring/installment-generator.service.ts`
- `src/modules/recurring/recurring-scheduler.service.ts` (cron job)

**Database:**

- Seeds: Generate sample recurring payments + installments for testing

---

#### Story 4.3: Recurring Payment Status Management

- **Objetivo:** Marcar pagamentos como PAID/OVERDUE, atualizar comissões
- **AC:**
  - PATCH `/api/recurring-installments/:id/mark-paid` (seller)
  - PATCH `/api/recurring-installments/:id/mark-overdue` (admin/financeiro)
  - Validar data de pagamento
  - Auto-check: se todas as parcelas de recurring_payment='PAID' → recurring_payment.status='COMPLETED'
  - Gerar commission para cada parcela paga
  - Tests: 16+ cases

**Arquivos novos:**

- Payment status management endpoints
- Commission generation for recurring installments

---

### 3.3 EPIC 5: Financial Dashboard & Reporting (Sprint 5)

#### Story 5.1: Dashboard KPIs Service

- **Objetivo:** API backend que calcula todos os KPIs do dashboard
- **AC:**
  - Endpoint GET `/api/dashboard/metrics` com query filters:
    - period (daily/weekly/monthly)
    - seller_id (optional)
    - financial_gateway_id (optional)
  - Retorna JSON com:
    - Total receita (gross)
    - Total receita líquida (net)
    - Total comissões (pendentes, aprovadas, pagas)
    - Comissões por vendedor (ranking)
    - Vendas por gateway
    - Clientes ativos, inadimplentes
    - Recorrência mensal (MRR)
    - Previsão de recebimento
  - Cache de 1 hora (Redis opcional)
  - Tests: 20+ cases

**Arquivos novos:**

- `src/modules/dashboard/dashboard.module.ts`
- `src/modules/dashboard/dashboard.service.ts`
- `src/modules/dashboard/kpi-calculator.service.ts`

---

#### Story 5.2: Advanced Reporting Engine

- **Objetivo:** Gerar relatórios financeiros completos (DRE expandido)
- **AC:**
  - Expandir relatórios 2.2 (DRE, Cash Flow, Metrics)
  - Adicionar filtros: period, seller_id, financial_gateway_id, product_id
  - Retornar estrutura JSON com:
    - Faturamento (por período/vendedor/gateway)
    - Receita líquida
    - Comissões (breakdown por vendedor)
    - Inadimplência (clientes/meses vencidos)
    - Previsão de recebimento
  - Tests: 18+ cases

**Arquivos novos:**

- Extensão de `src/modules/reports/financial.service.ts`

---

#### Story 5.3: PDF/Excel Export (Report 2.3 Enhancement)

- **Objetivo:** Exportar relatórios em PDF e Excel (além de JSON)
- **AC:**
  - Expand existing `/api/reports/export` endpoint
  - Accept `format` query param: json|pdf|excel
  - PDF: Use pdfkit or similar
  - Excel: Use xlsx or csv2json library
  - Gerar arquivo com timestamp no nome
  - Tests: 12+ cases

**Arquivos novos:**

- Export formatters: PDFFormatter, ExcelFormatter
- Library: `pdfkit`, `xlsx`

---

#### Story 5.4: Frontend Dashboard Implementation

- **Objetivo:** Evoluir dashboard React para exibir KPIs e charts
- **AC:**
  - Homepage com cards de KPIs (receita, comissões, vendas)
  - Charts: Receita por período, ranking vendedores, receita por gateway
  - Tabelas: Vendas recentes, comissões pendentes, clientes inadimplentes
  - Filtros: Período, vendedor, gateway
  - Responsive design (mobile-first)
  - Tests: Component + integration

**Arquivos novos:**

- `apps/dashboard/src/pages/dashboard.tsx`
- `apps/dashboard/src/components/kpi-cards.tsx`
- `apps/dashboard/src/components/revenue-chart.tsx`
- `apps/dashboard/src/components/seller-ranking.tsx`
- `apps/dashboard/src/hooks/use-dashboard-metrics.ts`
- Styles

---

### 3.4 EPIC 6: Administrative UI & Approval Flows (Sprint 6)

#### Story 6.1: Sales Management UI

- **Objetivo:** Frontend para CRUD de vendas com filtros e ações
- **AC:**
  - Listar vendas (tabela paginada)
  - Criar nova venda (form com validação)
  - Editar venda (se status=PENDING)
  - Deletar venda (ADMIN only)
  - Filtros: Seller, Status, Period, Gateway
  - Ações: Aprovar, Rejeitar, Marcar como pago
  - Real-time updates (WebSocket ou polling)
  - Tests: Component + integration

**Stack:** React + React Hook Form + Zod validation

---

#### Story 6.2: Commission Approval UI

- **Objetivo:** Dashboard de aprovação de comissões para ADMIN/FINANCEIRO
- **AC:**
  - Listar comissões pendentes
  - Visualizar detalhes (sale, seller, calculation)
  - Ação: Aprovar / Rejeitar com observação
  - Visualization: Total a aprovar, histórico de aprovações
  - Filter by seller, date range
  - Bulk approve option

---

#### Story 6.3: Recurring Payments Management UI

- **Objetivo:** Gerenciar mensalidades e parcelas no frontend
- **AC:**
  - Listar recorrências ativas
  - Visualizar parcelas (calendar view + table)
  - Marcar parcelas como pagas
  - Ações: Alterar data término, cancelar recorrência
  - Visualizar inadimplência (parcelas atrasadas)

---

### 3.5 EPIC 7: Audit & Compliance (Sprint 7)

#### Story 7.1: Enhanced Audit Logging

- **Objetivo:** Registrar TODAS as alterações financeiras com trail completo
- **AC:**
  - Auto-log em `audit_log` para:
    - Criação/edição/deleção de sales
    - Aprovação/rejeição de commissions
    - Mudança de status (payment, recurring)
  - Incluir: user_id, action, table, changes (JSONB), timestamp, ip, user_agent
  - Endpoint GET `/api/audit-log` (ADMIN only, RLS)
  - Retention: 2+ anos
  - Tests: 10+ cases

---

#### Story 7.2: Financial Reconciliation Reports

- **Objetivo:** Relatórios de reconciliação (sales vs comissions vs movements)
- **AC:**
  - Validar: Σ sales = Σ commissions + company_net_revenue
  - Detectar discrepâncias
  - Export reconciliation report
  - Tests: 12+ cases

---

## 4. MAPA DE DEPENDÊNCIAS ENTRE STORIES

```
Story 1.x (Foundation - DONE ✅)
  ├─ 1.1: Auth + JWT ✅
  ├─ 1.2: RLS Isolation ✅
  ├─ 1.3: Roles & Permissions ✅
  ├─ 1.4: NestJS Setup ✅
  └─ 1.5: Health Checks ✅

Story 2.x (Reports Foundation - DONE ✅)
  ├─ 2.1: DRE/Cash Flow/Metrics ✅
  ├─ 2.2: Financial Reports ✅
  └─ 2.3: Report Export Filters ✅

Story 3.x (Core Financial Operations) ← START HERE
  ├─ 3.1: Enhanced Sales (DEPENDS: 1.x, 2.x)
  ├─ 3.2: Financial Gateways (DEPENDS: 3.1)
  ├─ 3.3: Auto Commission Calc (DEPENDS: 3.1)
  └─ 3.4: Commission Approval (DEPENDS: 3.3)

Story 4.x (Recurring Payments)
  ├─ 4.1: Recurring Sales Setup (DEPENDS: 3.1)
  ├─ 4.2: Auto Generate Installments (DEPENDS: 4.1)
  └─ 4.3: Recurring Payment Status (DEPENDS: 4.2)

Story 5.x (Dashboard & Reporting)
  ├─ 5.1: Dashboard KPIs Service (DEPENDS: 3.x, 4.x)
  ├─ 5.2: Advanced Reporting Engine (DEPENDS: 5.1)
  ├─ 5.3: PDF/Excel Export (DEPENDS: 5.2)
  └─ 5.4: Frontend Dashboard UI (DEPENDS: 5.1)

Story 6.x (Admin UIs)
  ├─ 6.1: Sales Management UI (DEPENDS: 3.1, 5.4)
  ├─ 6.2: Commission Approval UI (DEPENDS: 3.4, 5.4)
  └─ 6.3: Recurring Mgmt UI (DEPENDS: 4.3, 5.4)

Story 7.x (Audit & Compliance)
  ├─ 7.1: Enhanced Audit Logging (DEPENDS: 3.x)
  └─ 7.2: Financial Reconciliation (DEPENDS: 5.2)
```

---

## 5. SEQUÊNCIA DE IMPLEMENTAÇÃO RECOMENDADA

### Phase 1: Core Financial Operations (2-3 weeks)

**Objetivo:** Ter sistema de vendas, comissões e aprovações operacional

| Sprint       | Stories            | Focus                                           | Est.    |
| ------------ | ------------------ | ----------------------------------------------- | ------- |
| **Sprint 3** | 3.1, 3.2, 3.3, 3.4 | Sales CRUD, gateways, auto-commission, approval | 3 weeks |

**Checklist:**

- ✅ Enhanced sales table with all fields
- ✅ Financial gateways management
- ✅ Automatic commission calculation engine
- ✅ Commission approval workflow
- ✅ Tests: 51+ unit/integration tests
- ✅ TypeScript strict mode
- ✅ ESLint + Prettier pass

---

### Phase 2: Recurring Payments (1-2 weeks)

**Objetivo:** Sistema de mensalidades automatizado

| Sprint       | Stories       | Focus                                         | Est.    |
| ------------ | ------------- | --------------------------------------------- | ------- |
| **Sprint 4** | 4.1, 4.2, 4.3 | Recurring setup, auto-generation, status mgmt | 2 weeks |

**Checklist:**

- ✅ Recurring payment creation logic
- ✅ Monthly installment auto-generation (scheduler)
- ✅ Payment status management (PAID/OVERDUE)
- ✅ Tests: 46+ test cases
- ✅ All quality gates pass

---

### Phase 3: Dashboard & Reporting (2-3 weeks)

**Objetivo:** Visualização de dados e inteligência de negócios

| Sprint       | Stories            | Focus                                     | Est.    |
| ------------ | ------------------ | ----------------------------------------- | ------- |
| **Sprint 5** | 5.1, 5.2, 5.3, 5.4 | KPIs, reports, export, frontend dashboard | 3 weeks |

**Checklist:**

- ✅ Dashboard KPIs API
- ✅ Advanced reporting (DRE expanded)
- ✅ PDF/Excel export functionality
- ✅ Frontend dashboard with charts
- ✅ Real-time updates via API
- ✅ Tests: 62+ test cases

---

### Phase 4: Admin UIs & Approval Flows (2 weeks)

**Objetivo:** Interface completa para administração

| Sprint       | Stories       | Focus                                          | Est.    |
| ------------ | ------------- | ---------------------------------------------- | ------- |
| **Sprint 6** | 6.1, 6.2, 6.3 | Sales UI, commission approval UI, recurring UI | 2 weeks |

**Checklist:**

- ✅ Sales management interface
- ✅ Commission approval dashboard
- ✅ Recurring payments management
- ✅ Real-time notifications
- ✅ Responsive design
- ✅ Component tests

---

### Phase 5: Audit & Compliance (1 week)

**Objetivo:** Rastreabilidade e conformidade regulatória

| Sprint       | Stories  | Focus                                 | Est.   |
| ------------ | -------- | ------------------------------------- | ------ |
| **Sprint 7** | 7.1, 7.2 | Audit logging, reconciliation reports | 1 week |

**Checklist:**

- ✅ Comprehensive audit trail
- ✅ Reconciliation reports
- ✅ Compliance with financial regulations
- ✅ Tests: 22+ test cases

---

## 6. PADRÕES ARQUITETURAIS

### 6.1 Backend Architecture (NestJS)

**Estrutura de módulos:**

```
src/
├── health/
├── modules/
│   ├── auth/
│   │   ├── auth.service.ts
│   │   ├── auth.controller.ts
│   │   └── __tests__/
│   ├── sales/
│   │   ├── sales.service.ts
│   │   ├── sales.controller.ts
│   │   ├── dto/
│   │   └── __tests__/
│   ├── commissions/
│   │   ├── commissions.service.ts
│   │   ├── commission-calculator.service.ts
│   │   ├── commission-approval.service.ts
│   │   ├── commissions.controller.ts
│   │   └── __tests__/
│   ├── recurring/
│   │   ├── recurring.service.ts
│   │   ├── recurring-calculator.service.ts
│   │   ├── installment-generator.service.ts
│   │   ├── recurring-scheduler.service.ts
│   │   └── __tests__/
│   ├── dashboard/
│   │   ├── dashboard.service.ts
│   │   ├── kpi-calculator.service.ts
│   │   └── __tests__/
│   ├── reports/
│   │   ├── financial.service.ts
│   │   ├── exporters/
│   │   │   ├── pdf.exporter.ts
│   │   │   └── excel.exporter.ts
│   │   └── __tests__/
│   └── financial-gateways/
│       ├── gateways.service.ts
│       ├── gateways.controller.ts
│       └── __tests__/
├── guards/
│   ├── jwt.guard.ts
│   └── permission.guard.ts
├── decorators/
│   ├── current-user.decorator.ts
│   └── check-permission.decorator.ts
└── main.ts
```

**Padrões:**

- **Service Layer:** Lógica de negócio isolada
- **DTO Pattern:** Request/Response DTOs com validação Zod
- **Guard Pattern:** JWT + Permission-based access control
- **Dependency Injection:** NestJS DI container
- **Error Handling:** Consistent HttpException responses

### 6.2 Frontend Architecture (React)

**Estrutura:**

```
apps/dashboard/src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Layout.tsx
│   ├── sales/
│   │   ├── SalesTable.tsx
│   │   ├── SalesForm.tsx
│   │   └── SalesDetails.tsx
│   ├── commissions/
│   │   ├── CommissionApprovalForm.tsx
│   │   └── CommissionsList.tsx
│   ├── dashboard/
│   │   ├── KPICards.tsx
│   │   ├── RevenueChart.tsx
│   │   └── SellerRanking.tsx
│   └── recurring/
│       ├── RecurringPaymentsList.tsx
│       └── InstallmentCalendar.tsx
├── hooks/
│   ├── use-dashboard-metrics.ts
│   ├── use-sales.ts
│   ├── use-commissions.ts
│   └── use-recurring.ts
├── types/
│   ├── sales.ts
│   ├── commissions.ts
│   ├── recurring.ts
│   └── dashboard.ts
├── utils/
│   ├── api-client.ts
│   ├── formatters.ts
│   └── validators.ts
├── App.tsx
└── index.tsx
```

**Padrões:**

- **Custom Hooks:** Lógica de dados encapsulada
- **Composition:** Components pequenos e reutilizáveis
- **Real-time Updates:** Polling ou WebSocket
- **Form Validation:** React Hook Form + Zod
- **State Management:** Context API ou Zustand

### 6.3 Database Patterns

**Migrations:**

- Versionadas em `supabase/migrations/`
- Nomeadas: `NNN_description.sql`
- RLS policies obrigatórias
- Indexes em colunas frequentemente filtradas

**Triggers:**

```sql
-- Auto-update updated_at
CREATE TRIGGER update_sales_timestamp
BEFORE UPDATE ON sales
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Auto-create commission record
CREATE TRIGGER create_commission_on_sale_approval
AFTER UPDATE ON sales
FOR EACH ROW
WHEN (OLD.status != 'APPROVED' AND NEW.status = 'APPROVED')
EXECUTE FUNCTION create_commission_record();
```

**RLS Policies:**

- SELECT by role (ADMIN > FINANCEIRO > GESTOR > COMERCIAL > VENDEDOR)
- INSERT by creator or ADMIN
- UPDATE by ADMIN or owner (role-dependent)
- DELETE by ADMIN only

---

## 7. TECNOLOGIAS RECOMENDADAS

### 7.1 Backend

| Layer          | Technology            | Reason                                        |
| -------------- | --------------------- | --------------------------------------------- |
| **Framework**  | NestJS 10+            | Type-safe, modular, built-in DI               |
| **Language**   | TypeScript 5+         | Strict typing, better tooling                 |
| **Database**   | Supabase (PostgreSQL) | RLS native, Auth built-in, excellent for SaaS |
| **Auth**       | Supabase Auth + JWT   | Row-level security, no external service       |
| **Validation** | Zod 4+                | Runtime validation, DX optimal                |
| **Testing**    | Jest 29+              | Fast, built-in coverage, NestJS compatible    |
| **Scheduler**  | node-cron or Bull     | Monthly installment generation                |
| **Reporting**  | pdfkit + xlsx         | PDF/Excel export lightweight                  |
| **Caching**    | Redis (optional)      | Dashboard KPIs cache (nice-to-have)           |

### 7.2 Frontend

| Layer           | Technology                     | Reason                              |
| --------------- | ------------------------------ | ----------------------------------- |
| **Framework**   | React 18+                      | Component-based, hooks, ecosystem   |
| **Forms**       | React Hook Form                | Minimal re-renders, Zod integration |
| **Validation**  | Zod 4+                         | Shared schema with backend          |
| **Charts**      | Recharts or Chart.js           | Lightweight, React-friendly         |
| **HTTP Client** | Fetch API                      | Modern, no dependency               |
| **State**       | Context API or Zustand         | Lightweight, no Redux overhead      |
| **Styling**     | CSS-in-JS or Tailwind          | Component-scoped, utility-first     |
| **Tables**      | TanStack Table                 | Headless, flexible, performant      |
| **Testing**     | Vitest + React Testing Library | Fast, modern, RTL best practices    |

### 7.3 DevOps & Quality

| Tool               | Purpose                                 |
| ------------------ | --------------------------------------- |
| **TypeScript**     | Strict mode, zero `any`                 |
| **ESLint**         | Code quality, patterns                  |
| **Prettier**       | Code formatting consistency             |
| **Jest**           | Unit + integration tests, >80% coverage |
| **GitHub Actions** | CI/CD (Story 1.5 foundation)            |
| **CodeRabbit**     | Automated code review                   |
| **Supabase CLI**   | Migrations, local development           |

---

## 8. PRINCÍPIOS DE IMPLEMENTAÇÃO (AIOX Constitution)

### 8.1 CLI First

✅ **Toda funcionalidade opera 100% via CLI antes de UI**

- Story 3.1 Sales: API endpoints prontos antes do React UI
- Story 3.3 Commission Calc: Lógica pura testável via CLI antes de dashboard
- Story 4.2 Auto-Generate: Scheduler roda via CLI antes de UI para monitorar

**Checklist:**

- ✅ Backend endpoint 100% operacional
- ✅ Testável via curl/Postman
- ✅ Unit tests passando
- ✅ Então: implementar frontend

### 8.2 Story-Driven Development

✅ **Cada story tem AC claros, testes, e DoD**

**Template Story:**

```markdown
# Story X.Y: [Título]

## Story Statement

As a [role], I want [action], so that [benefit]

## Acceptance Criteria

- [ ] AC1: ...
- [ ] AC2: ...
- [ ] AC3: ...
- [ ] AC11: Tests passing, lint/typecheck pass

## File List

[Atualizado @dev durante implementação]

## Definition of Done

- ✅ All AC met
- ✅ >80% test coverage
- ✅ npm run lint pass
- ✅ npm run typecheck pass
- ✅ npm test pass (all tests)
- ✅ CodeRabbit no CRITICAL issues
```

### 8.3 Constitution Compliance

✅ **Agent Authority:** Apenas @devops faz git push  
✅ **Quality First:** TypeScript strict, tests, lint pass sempre  
✅ **No Invention:** Tudo em spec/story antes de código  
✅ **Absolute Imports:** `@/modules/...` nunca `../../../`

### 8.4 Code Quality Gates

**Pre-commit:**

```bash
npm run lint       # ESLint
npm run typecheck  # TypeScript
npm run build      # NestJS build
npm test           # Jest suite
```

**Pre-PR:**

```bash
npm run test:cov   # Coverage >80%
coderabbit check   # No CRITICAL issues
```

---

## 9. ESTIMATIVAS E TIMELINE

### Timeline Total: 10-12 weeks

```
Week 1-3:   Sprint 3 (Core Financial Ops)   - Sales, Gateways, Commission Calc, Approval
Week 4-5:   Sprint 4 (Recurring Payments)   - Recurring setup, auto-generation, status mgmt
Week 6-8:   Sprint 5 (Dashboard & Reports)  - KPIs, reporting, export, frontend
Week 9-10:  Sprint 6 (Admin UIs)             - Sales UI, approval dashboard, recurring UI
Week 11:    Sprint 7 (Audit & Compliance)   - Audit logging, reconciliation
Week 12:    Testing, optimizations, launch  - QA, performance tuning, documentation
```

### Story-Level Estimates

| Sprint | Story                    | Estimate | Status              |
| ------ | ------------------------ | -------- | ------------------- |
| **S3** | 3.1: Enhanced Sales      | 4d       | Ready               |
| **S3** | 3.2: Financial Gateways  | 2d       | Ready               |
| **S3** | 3.3: Auto Commission     | 3d       | Ready               |
| **S3** | 3.4: Commission Approval | 3d       | Ready               |
| **S4** | 4.1: Recurring Sales     | 3d       | Depends on 3.1      |
| **S4** | 4.2: Auto Installments   | 3d       | Depends on 4.1      |
| **S4** | 4.3: Recurring Status    | 3d       | Depends on 4.2      |
| **S5** | 5.1: Dashboard KPIs      | 4d       | Depends on 3.x, 4.x |
| **S5** | 5.2: Advanced Reports    | 3d       | Depends on 5.1      |
| **S5** | 5.3: PDF/Excel Export    | 3d       | Depends on 5.2      |
| **S5** | 5.4: Frontend Dashboard  | 4d       | Depends on 5.1      |
| **S6** | 6.1: Sales UI            | 4d       | Depends on 3.1      |
| **S6** | 6.2: Commission UI       | 3d       | Depends on 3.4      |
| **S6** | 6.3: Recurring UI        | 3d       | Depends on 4.3      |
| **S7** | 7.1: Audit Logging       | 2d       | Depends on 3.x      |
| **S7** | 7.2: Reconciliation      | 2d       | Depends on 5.2      |

**Total Estimate:** ~52 days = 10.4 weeks (com 5d/semana)

---

## 10. PRÓXIMOS PASSOS RECOMENDADOS

### ✅ Imediato (Hoje)

1. **Valide essa arquitetura** com seu time (2h workshop)
2. **Crie stories em docs/stories/** baseadas neste documento
3. **Configure @po para validar** cada story antes de @dev implementar

### 📋 Sprint Planning (Day 1)

1. **Quebr this architecture into Git issues** (ou ClickUp tasks)
2. **Setup board** (Trello/Linear/GitHub Projects) com sprints
3. **Ativar @sm** para criar stories oficiais
4. **Ativar @po** para validar stories

### 🚀 Sprint 3 Kick-off (Week 1)

1. **Story 3.1:** Enhanced Sales Management
   - Backend CRUD endpoints
   - DTO validation (Zod)
   - RLS policies
   - 15+ unit tests
   - Estimated: 4 days

2. **Story 3.2:** Financial Gateways
   - Create, read, update, delete gateways
   - Admin-only access
   - Estimated: 2 days

3. **Story 3.3:** Auto Commission Calculation
   - Commission calculator service (pure logic)
   - Integration with sales service
   - Tests: 12+ cases
   - Estimated: 3 days

4. **Story 3.4:** Commission Approval Workflow
   - Approval endpoint
   - Audit trail
   - Movement generation
   - Estimated: 3 days

---

## 11. RISK MITIGATION

| Risk                            | Impact   | Mitigation                                       |
| ------------------------------- | -------- | ------------------------------------------------ |
| Comissão calculation complexity | HIGH     | Pure function calculator with extensive tests    |
| Recurring payment edge cases    | HIGH     | Generated installments have buffer period checks |
| Performance (N+1 queries)       | MEDIUM   | Index strategy + DataLoader pattern              |
| RLS policy bugs                 | CRITICAL | QA-dedicated testing per story + audit logs      |
| Real-time sync dashboard        | MEDIUM   | Polling v1, WebSocket v2 if needed               |
| PDF/Excel export fails          | MEDIUM   | Fallback to JSON + client-side generation        |

---

## 12. SUCCESS CRITERIA

✅ **MVP (Sprint 3-4):**

- Vendas completas com todos os campos
- Comissões automaticamente calculadas e aprovadas
- Recorrências funcionando com geração automática de parcelas

✅ **Dashboard (Sprint 5):**

- KPIs em tempo real
- Relatórios com 3 formatos (JSON, PDF, Excel)
- Visualização clara de receita, comissões, ranking

✅ **Production Ready (Sprint 6-7):**

- UI completa para todas as operações
- Audit trail completo
- Reconciliação financeira automática
- 80%+ test coverage
- Zero CRITICAL issues

---

## 13. REFERENCE DOCUMENTS

- **Database Schema:** supabase/migrations/
- **API Spec:** Will be created per story
- **Style Guide:** AIOX Constitution (`.claude/CLAUDE.md`)
- **Quality Standards:** npm scripts in root package.json
- **Deployment:** GitHub Actions (Story 1.5)

---

**Document Status:** ✅ ARCHITECTURE VALIDATED  
**Next Review:** After Sprint 3 completion  
**Last Updated:** 2026-05-13

— Aria, arquitetando o futuro 🏗️
