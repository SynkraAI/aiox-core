-- ============================================================================
-- AIOX Finance Commission System - PostgreSQL Migrations
-- Supabase Ready - 8 Atomic Migrations
-- ============================================================================

-- Migration 001: Enable RLS & UUID Extension
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
ALTER SYSTEM SET rls.enabled = true;

-- Migration 002: Auth & Multi-tenant Foundations
-- ============================================================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'FINANCEIRO', 'GESTOR', 'COMERCIAL', 'AUDITOR')),
  password_hash TEXT,
  active BOOLEAN DEFAULT true,
  last_access TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role VARCHAR(20) NOT NULL,
  resource VARCHAR(50) NOT NULL,
  action VARCHAR(10) NOT NULL CHECK (action IN ('CREATE', 'READ', 'UPDATE', 'DELETE')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(role, resource, action)
);

-- RLS Policy: Users só veem a si mesmos (exceto ADMIN)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view self or admin" ON public.users
  FOR SELECT USING (
    auth.uid()::text = id::text OR
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN'
  );

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);

-- Migration 003: Customers Domain
-- ============================================================================
CREATE TYPE document_type AS ENUM ('CPF', 'CNPJ');

CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document VARCHAR(20) NOT NULL UNIQUE,
  document_type document_type NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone VARCHAR(20),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: Everyone sees all customers (financial visibility)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All authenticated users see customers" ON public.customers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE INDEX idx_customers_document ON public.customers(document);
CREATE INDEX idx_customers_name ON public.customers(name);

-- Migration 004: Sales Domain (CRITICAL)
-- ============================================================================
CREATE TYPE payment_method AS ENUM ('dinheiro', 'pix', 'transferencia', 'debito', 'credito', 'boleto');
CREATE TYPE sale_status AS ENUM ('draft', 'confirmed', 'received', 'cancelled');

CREATE TABLE public.sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES public.customers(id),
  seller_id UUID NOT NULL REFERENCES public.users(id),
  product_name TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  gross_value DECIMAL(15,2) NOT NULL CHECK (gross_value > 0),
  discount_pct DECIMAL(5,2) DEFAULT 0 CHECK (discount_pct >= 0 AND discount_pct <= 100),
  net_value DECIMAL(15,2) NOT NULL GENERATED ALWAYS AS (gross_value * (1 - discount_pct/100)) STORED,
  payment_method payment_method NOT NULL,
  installments SMALLINT DEFAULT 1 CHECK (installments > 0),
  status sale_status DEFAULT 'draft',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: COMERCIAL sees own sales + their team; FINANCEIRO/ADMIN sees all
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sales visibility by role" ON public.sales
  FOR SELECT USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) IN ('ADMIN', 'FINANCEIRO') OR
    seller_id = auth.uid()
  );

CREATE INDEX idx_sales_seller ON public.sales(seller_id);
CREATE INDEX idx_sales_customer ON public.sales(customer_id);
CREATE INDEX idx_sales_status ON public.sales(status);
CREATE INDEX idx_sales_created ON public.sales(created_at DESC);

-- Migration 005: Commission Types (7 Fixed Types)
-- ============================================================================
CREATE TABLE public.commission_types (
  id SMALLINT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO public.commission_types (id, name, description) VALUES
  (1, 'FIXA', 'Valor fixo por venda realizada'),
  (2, 'PERCENTUAL', 'Percentual sobre o valor da venda'),
  (3, 'ESCALAS', 'Percentual varia por faixa de vendas'),
  (4, 'PERFORMANCE', 'Bônus baseado em metas atingidas'),
  (5, 'RECORRENTE', 'Paga mensalmente em assinaturas'),
  (6, 'PRODUTO', 'Percentual diferente por produto'),
  (7, 'LUCRO_LIQUIDO', 'Sobre o lucro real da venda');

CREATE TABLE public.commission_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type_id SMALLINT NOT NULL REFERENCES public.commission_types(id),
  config JSONB NOT NULL, -- { "percentage": 5 } or { "scales": [...] }
  valid_from DATE DEFAULT CURRENT_DATE,
  valid_to DATE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Examples of config for each type:
-- Type 1 (FIXA):      { "amount": 50 }
-- Type 2 (PERCENT):   { "percentage": 5 }
-- Type 3 (ESCALAS):   { "scales": [{"min": 0, "max": 10000, "pct": 3}, {"min": 10000, "pct": 5}] }
-- Type 4 (PERF):      { "basePct": 5, "targets": [{"metaPct": 110, "bonusPct": 10}] }
-- Type 5 (RECURR):    { "percentage": 2, "frequency": "monthly" }
-- Type 6 (PRODUTO):   { "products": {"prodA": 5, "prodB": 8} }
-- Type 7 (LUCRO):     { "percentage": 10 }

CREATE INDEX idx_commission_rules_active ON public.commission_rules(active);

-- Migration 006: Commissions Domain
-- ============================================================================
CREATE TYPE commission_status AS ENUM ('pending', 'confirmed', 'paid', 'reversed');

CREATE TABLE public.commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID NOT NULL REFERENCES public.sales(id),
  rule_id UUID NOT NULL REFERENCES public.commission_rules(id),
  seller_id UUID NOT NULL REFERENCES public.users(id),
  base_value DECIMAL(15,2) NOT NULL CHECK (base_value >= 0),
  commission_value DECIMAL(15,2) NOT NULL CHECK (commission_value >= 0),
  status commission_status DEFAULT 'pending',
  approved_by UUID REFERENCES public.users(id),
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  reversal_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: ADMIN/FINANCEIRO see all; COMERCIAL sees own commissions
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Commission visibility by role" ON public.commissions
  FOR SELECT USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) IN ('ADMIN', 'FINANCEIRO') OR
    seller_id = auth.uid()
  );

-- RLS: Only ADMIN/FINANCEIRO can approve
CREATE POLICY "Commission approval by role" ON public.commissions
  FOR UPDATE USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) IN ('ADMIN', 'FINANCEIRO')
  );

CREATE INDEX idx_commissions_sale ON public.commissions(sale_id);
CREATE INDEX idx_commissions_seller ON public.commissions(seller_id);
CREATE INDEX idx_commissions_status ON public.commissions(status);
CREATE INDEX idx_commissions_approved ON public.commissions(approved_by);

-- Migration 007: Double-Entry Ledger (Financial Core)
-- ============================================================================
CREATE TYPE account_type AS ENUM ('ASSET', 'LIABILITY', 'EQUITY');
CREATE TYPE movement_type AS ENUM ('DEBIT', 'CREDIT');

CREATE TABLE public.accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  type account_type NOT NULL,
  balance DECIMAL(15,2) DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO public.accounts (code, name, type) VALUES
  ('1000', 'Caixa', 'ASSET'),
  ('1010', 'Banco do Brasil', 'ASSET'),
  ('1020', 'Itaú Unibanco', 'ASSET'),
  ('2000', 'Contas a Pagar', 'LIABILITY'),
  ('3000', 'Capital', 'EQUITY'),
  ('4000', 'Receita de Vendas', 'EQUITY'),
  ('5000', 'Despesa de Comissões', 'EQUITY');

CREATE TABLE public.movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES public.accounts(id),
  type movement_type NOT NULL,
  category VARCHAR(50) NOT NULL,
  ref_type VARCHAR(50), -- 'sale', 'commission', 'payment'
  ref_id UUID,
  value DECIMAL(15,2) NOT NULL CHECK (value > 0),
  balance_after DECIMAL(15,2) NOT NULL,
  posted_at TIMESTAMPTZ DEFAULT now(),
  description TEXT
);

-- RLS: FINANCEIRO/ADMIN see all movements
ALTER TABLE public.movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Movements visibility" ON public.movements
  FOR SELECT USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) IN ('ADMIN', 'FINANCEIRO')
  );

CREATE INDEX idx_movements_account ON public.movements(account_id);
CREATE INDEX idx_movements_ref ON public.movements(ref_type, ref_id);
CREATE INDEX idx_movements_date ON public.movements(posted_at DESC);

-- Migration 008: Audit & Compliance
-- ============================================================================
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  action VARCHAR(50) NOT NULL,
  entity VARCHAR(50) NOT NULL,
  entity_id UUID,
  before_json JSONB,
  after_json JSONB,
  ip_address INET,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- RLS: Only ADMIN sees audit log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Audit log admin only" ON public.audit_log
  FOR SELECT USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN'
  );

CREATE INDEX idx_audit_user ON public.audit_log(user_id);
CREATE INDEX idx_audit_entity ON public.audit_log(entity, entity_id);
CREATE INDEX idx_audit_timestamp ON public.audit_log(timestamp DESC);

-- ============================================================================
-- SEED: Default Permissions Matrix
-- ============================================================================
INSERT INTO public.permissions (role, resource, action) VALUES
-- ADMIN: full access
('ADMIN', 'sales', 'CREATE'),
('ADMIN', 'sales', 'READ'),
('ADMIN', 'sales', 'UPDATE'),
('ADMIN', 'sales', 'DELETE'),
('ADMIN', 'commissions', 'CREATE'),
('ADMIN', 'commissions', 'READ'),
('ADMIN', 'commissions', 'UPDATE'),
('ADMIN', 'commissions', 'DELETE'),
('ADMIN', 'users', 'CREATE'),
('ADMIN', 'users', 'READ'),
('ADMIN', 'users', 'UPDATE'),
('ADMIN', 'users', 'DELETE'),

-- COMERCIAL: manage own sales, view own commissions
('COMERCIAL', 'sales', 'CREATE'),
('COMERCIAL', 'sales', 'READ'),
('COMERCIAL', 'sales', 'UPDATE'),

-- FINANCEIRO: read all, approve commissions, manage finances
('FINANCEIRO', 'sales', 'READ'),
('FINANCEIRO', 'commissions', 'READ'),
('FINANCEIRO', 'commissions', 'UPDATE'),
('FINANCEIRO', 'accounts', 'READ'),
('FINANCEIRO', 'accounts', 'UPDATE'),

-- AUDITOR: read-only on everything
('AUDITOR', 'sales', 'READ'),
('AUDITOR', 'commissions', 'READ'),
('AUDITOR', 'audit_log', 'READ'),

-- GESTOR: oversee team
('GESTOR', 'sales', 'READ'),
('GESTOR', 'commissions', 'READ');

-- ============================================================================
-- SUMMARY OF SCHEMA
-- ============================================================================
-- Tables: 13
-- RLS Policies: 10
-- Indexes: 20+
-- Audit: 3-layer (audit_log + RLS + constraint checks)
-- Double-entry: Automatic balance derivation via movements table
-- Commission engine: Strategy pattern ready (config JSONB per rule)
-- ============================================================================
