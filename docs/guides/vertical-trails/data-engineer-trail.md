# Trilha @data-engineer: Do Problema ao Output Validado

> **Story:** AIOS-DIFF-4.3.1
> **Agente:** @data-engineer (Dara)
> **Tempo estimado:** 30-60 minutos

---

## Mapa da Trilha

```
PROBLEMA: "Preciso criar uma tabela de users com RLS"
    ↓
WORKFLOW: Setup → Design → Migration → Validation
    ↓
TASKS: *setup-database → *model-domain → *apply-migration → *security-audit
    ↓
OUTPUT: Schema criado + RLS habilitado + Audit verde
```

---

## Exemplo Reproduzível Passo a Passo

### Cenário

Você está em um projeto novo e precisa:
1. Configurar estrutura de database (Supabase)
2. Criar tabela `users` com campos básicos
3. Habilitar RLS com política adequada
4. Validar que tudo está seguro

### Pré-requisitos

```bash
# Projeto AIOS inicializado
npx aios-core doctor  # deve retornar healthy

# Supabase configurado (ou PostgreSQL local)
echo $SUPABASE_DB_URL  # deve ter valor
```

---

### Passo 1: Ativar @data-engineer

```bash
@data-engineer
```

**Output esperado:**
```
-- Dara aqui! Database Architect & Operations Engineer.
Pronto para modelar, migrar ou auditar.

Quick commands:
  *setup-database supabase  - Setup de projeto Supabase
  *model-domain             - Sessão de modelagem
  *security-audit           - Auditoria de segurança
```

---

### Passo 2: Setup do Projeto

```bash
*setup-database supabase
```

**Output esperado:**
- Criação de `supabase/migrations/`
- Criação de `supabase/seeds/`
- Criação de `supabase/rollback/`
- Verificação de conexão

**Evidência de sucesso:**
```bash
ls supabase/
# migrations/  seeds/  rollback/  docs/
```

---

### Passo 3: Modelagem de Domínio

```bash
*model-domain
```

**Interação:**
```
Dara: Qual domínio você está modelando?
Você: Sistema de usuários para SaaS

Dara: Quais entidades principais?
Você: Users com email, nome, role e timestamps

Dara: Relações entre entidades?
Você: Por enquanto só users, depois adiciono organizations
```

**Output esperado:**
```sql
-- Modelo gerado por Dara

CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'superadmin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

**Evidência de sucesso:**
- Arquivo salvo em `supabase/migrations/001_create_users.sql`

---

### Passo 4: Dry-Run da Migration

```bash
*dry-run supabase/migrations/001_create_users.sql
```

**Output esperado:**
```
🔍 Dry-run: supabase/migrations/001_create_users.sql

✅ Syntax: Valid
✅ Dependencies: None required
✅ Estimated execution: <1s

Simulated output:
  CREATE TABLE: users (6 columns)
  CREATE INDEX: idx_users_email
  CREATE INDEX: idx_users_role
  CREATE FUNCTION: update_updated_at
  CREATE TRIGGER: users_updated_at

No errors detected. Safe to apply.
```

---

### Passo 5: Aplicar Migration

```bash
*snapshot pre_users
*apply-migration supabase/migrations/001_create_users.sql
```

**Output esperado:**
```
📸 Snapshot created: supabase/snapshots/20260216T120000_pre_users.sql

🔒 Acquiring advisory lock...
✅ Lock acquired

📝 Executing migration...
  CREATE TABLE: users ✓
  CREATE INDEX: idx_users_email ✓
  CREATE INDEX: idx_users_role ✓
  CREATE FUNCTION: update_updated_at ✓
  CREATE TRIGGER: users_updated_at ✓

✅ Migration applied successfully
🔓 Lock released

📸 Post-migration snapshot: supabase/snapshots/20260216T120100_post_users.sql
```

---

### Passo 6: Aplicar RLS

```bash
*policy-apply users KISS
```

**Output esperado:**
```
📋 Applying KISS RLS policy to: users

-- RLS Policy Generated --
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

✅ RLS enabled and policies applied
```

---

### Passo 7: Validar Segurança

```bash
*security-audit full
```

**Output esperado:**
```
🔍 Security Audit: full

📊 SCHEMA AUDIT
  ✅ Primary keys: 1/1 tables
  ✅ NOT NULL constraints: appropriate
  ✅ Foreign keys: N/A (single table)
  ✅ Audit timestamps: created_at, updated_at present
  ✅ Indices on FKs: N/A

🛡️ RLS AUDIT
  ✅ Tables with RLS enabled: 1/1 (100%)
  ✅ SELECT policy: present
  ✅ UPDATE policy: present
  ⚠️ INSERT policy: missing (users create via auth.users)
  ⚠️ DELETE policy: missing (admin-only recommended)

📊 SUMMARY
  Critical: 0
  Warnings: 2

  Recommendations:
  1. Add INSERT policy if users can self-register
  2. Add DELETE policy for admin cleanup

🎯 Overall: SECURE (with minor recommendations)
```

---

## Checklist de Validação

| Step | Comando | Output Esperado | ✓ |
|------|---------|-----------------|---|
| 1 | `@data-engineer` | Greeting de Dara | [ ] |
| 2 | `*setup-database supabase` | Estrutura criada | [ ] |
| 3 | `*model-domain` | SQL gerado | [ ] |
| 4 | `*dry-run` | "Safe to apply" | [ ] |
| 5 | `*apply-migration` | "Migration applied" | [ ] |
| 6 | `*policy-apply` | "RLS enabled" | [ ] |
| 7 | `*security-audit full` | "SECURE" | [ ] |

---

## Rollback (se necessário)

```bash
# Se algo deu errado:
*rollback supabase/snapshots/20260216T120000_pre_users.sql
```

---

## Variações da Trilha

### Variação A: PostgreSQL Local
```bash
*setup-database postgresql
# Resto do fluxo igual
```

### Variação B: MongoDB
```bash
*setup-database mongodb
# Comandos adaptados para NoSQL
```

### Variação C: Brownfield (projeto existente)
```bash
*security-audit full  # Primeiro audite
# Baseado no audit, decida próximos passos
```

---

## Comandos Relacionados

| Comando | Uso |
|---------|-----|
| `*snapshot {label}` | Criar backup antes de mudanças |
| `*rollback {target}` | Restaurar estado anterior |
| `*smoke-test` | Testar conexão e operações básicas |
| `*analyze-performance query` | Analisar queries lentas |
| `*test-as-user {id}` | Testar RLS como usuário específico |

---

*Trilha criada para Story AIOS-DIFF-4.3.1*
*-- Dara, arquitetando dados*
