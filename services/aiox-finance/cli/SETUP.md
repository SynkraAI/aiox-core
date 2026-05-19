# 🚀 Setup Completo - Sistema de Vendas e Comissões

## ⚡ Quick Start (5 minutos)

### 1️⃣ Configurar Supabase

**Opção A: Supabase Cloud (Recomendado)**
```bash
# 1. Acesse supabase.com e crie um projeto
# 2. Copie a URL e Chave Anon
# 3. Configure no dashboard HTML (aba Configuração)
```

**Opção B: Supabase Local**
```bash
# Instale Supabase CLI
npm install -g supabase

# Inicie Supabase localmente
supabase start

# URL: http://localhost:54321
# Key: ver em supabase/config.local.json
```

---

### 2️⃣ Criar Tabelas (se não existirem)

Execute no Supabase SQL Editor:

```sql
-- Tabela de Usuários
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'COMERCIAL',
  commission_percentage DECIMAL(5,2) NOT NULL DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Clientes
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Vendas
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES users(id),
  customer_id UUID NOT NULL REFERENCES customers(id),
  gross_amount DECIMAL(15,2) NOT NULL,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  discount_amount DECIMAL(15,2) DEFAULT 0,
  net_amount DECIMAL(15,2) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'PIX',
  notes TEXT,
  status VARCHAR(50) DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Comissões
CREATE TABLE commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES sales(id),
  seller_id UUID NOT NULL REFERENCES users(id),
  amount DECIMAL(15,2) NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Function: Auto-criar comissão quando venda é aprovada
CREATE OR REPLACE FUNCTION create_commission_on_sale_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'APPROVED' AND OLD.status = 'PENDING' THEN
    -- Buscar percentual de comissão do vendedor
    INSERT INTO commissions (sale_id, seller_id, amount, percentage)
    SELECT 
      NEW.id,
      NEW.seller_id,
      NEW.net_amount * (u.commission_percentage / 100),
      u.commission_percentage
    FROM users u
    WHERE u.id = NEW.seller_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS trigger_create_commission ON sales;
CREATE TRIGGER trigger_create_commission
AFTER UPDATE ON sales
FOR EACH ROW
EXECUTE FUNCTION create_commission_on_sale_approval();

-- Índices para performance
CREATE INDEX idx_sales_seller_id ON sales(seller_id);
CREATE INDEX idx_sales_status ON sales(status);
CREATE INDEX idx_commissions_seller_id ON commissions(seller_id);
CREATE INDEX idx_commissions_status ON commissions(status);
```

---

### 3️⃣ Criar Dados de Teste

```bash
# Criar um ADMIN e um COMERCIAL
node manage-users.js create \
  --name "Admin" \
  --email "admin@example.com" \
  --role ADMIN \
  --commission-percentage 0

node manage-users.js create \
  --name "João Vendedor" \
  --email "joao@example.com" \
  --role COMERCIAL \
  --commission-percentage 10

# Listar usuários criados
node manage-users.js list
```

---

### 4️⃣ Acessar o Dashboard

```bash
# Abra o arquivo no navegador
open cli/dashboard.html
# ou
firefox cli/dashboard.html
```

**Na aba "Configuração":**
1. Cole a URL do Supabase
2. Cole a Chave Anon
3. Clique "Testar Conexão"
4. Na aba "Login do Usuário", selecione um usuário

---

## 📊 Fluxo de Trabalho

### Cenário 1: Vendedor lança venda

```bash
# Terminal (CLI para dados diretos)
node launch-sale.js \
  --seller-id <seller-id> \
  --customer-id <customer-id> \
  --gross-amount 1000 \
  --tax-amount 100 \
  --discount-amount 50 \
  --method PIX
```

**OU via Dashboard:**
1. Selecione "João Vendedor" em "Login do Usuário"
2. Na aba "Lançar Nova Venda", preencha:
   - Vendedor: João Vendedor
   - Cliente: [selecione]
   - Valor Líquido: 850
   - Comissão: 10%
3. Clique "Lançar Venda"

### Cenário 2: Admin aprova venda

1. Selecione "Admin" em "Login do Usuário"
2. Na aba "📊 Vendas", veja a venda com status "PENDENTE"
3. Clique botão "✓ Aprovar"
4. Sistema cria automaticamente a comissão

### Cenário 3: Ver dashboard mensal

1. Clique aba "📈 Dashboard Mensal"
2. Veja gráficos de vendas e comissões
3. Tabela mostra oscilações mensais

---

## 🔧 Comandos CLI Disponíveis

### Usuários
```bash
node manage-users.js list                    # Ver todos
node manage-users.js create [opções]         # Criar novo
node manage-users.js edit --id [id] [opções] # Editar
node manage-users.js delete --id [id]        # Deletar
```

### Vendas
```bash
node launch-sale.js [opções]                 # Lançar venda
node approve-sale.js --sale-id [id]          # Aprovar
node check-commission.js --sale-id [id]      # Ver comissão
```

### Setup
```bash
node setup-test-data.js                      # Criar dados iniciais
```

---

## 🔐 Controle de Acesso

| Função | Lançar | Aprovar | Ver Tudo | Gerenciar |
|--------|--------|---------|----------|-----------|
| **ADMIN** | ✅ | ✅ | ✅ | ✅ |
| **COMERCIAL/VENDEDOR** | ✅ | ❌ | ❌ (só suas) | ❌ |

---

## ⚠️ Troubleshooting

**"Erro de conexão com Supabase"**
- Verifique URL e Chave Anon
- Teste em "Configuração" → "Testar Conexão"

**"Tabelas não encontradas"**
- Execute o SQL de criação de tabelas acima
- Verifique se está conectado ao banco correto

**"Comissão não foi criada"**
- Aguarde ~1 segundo após aprovar
- Clique "Recarregar" na aba Comissões

**"Botão Aprovar não aparece"**
- Verifique se está logado como ADMIN
- Apenas ADMIN pode aprovar

---

## 📝 Variáveis de Ambiente

```bash
export SUPABASE_URL="https://seu-projeto.supabase.co"
export SUPABASE_ANON_KEY="sua-chave-anonima"
```

Depois os CLIs usarão automaticamente. Se não definir, usa localhost.

---

**Pronto!** Sistema está 100% funcional. Comece lançando vendas e aprovando! 🎯
