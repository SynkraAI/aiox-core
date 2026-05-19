# 📖 Manual de Uso - Sistema GPSX Vendas & Comissões

## ⚡ Quick Start

### 1. Setup Credenciais
```powershell
$env:SUPABASE_URL="https://gvzqmgrpwnzfsxfwtsqq.supabase.co"
$env:SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2enFtZ3Jwd256ZnN4Znd0c3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMTE4MjAsImV4cCI6MjA5NDY4NzgyMH0.6HOiHQIAadlrBuoRc4zPMCuB-naJk8pPprf9T-NhOCc"
cd c:\Users\venda\aiox-core\services\aiox-finance\cli
```

### 2. Criar Admin
```powershell
node manage-users.js create --name "João Admin" --email "admin@gpsx.com.br" --role ADMIN --commission-percentage 0
```

### 3. Criar Vendedor
```powershell
node manage-users.js create --name "Pedro Vendedor" --email "vendedor@gpsx.com.br" --role VENDEDOR --commission-percentage 15
```

### 4. Listar Usuários
```powershell
node manage-users.js list
```

---

## 📊 Fluxo Completo de Venda

### Passo 1: Criar Cliente (no Supabase)
Vá para [Supabase SQL Editor](https://supabase.com/dashboard/project/gvzqmgrpwnzfsxfwtsqq/sql/new):
```sql
INSERT INTO customers (name, email, phone) 
VALUES ('Acme Corp', 'contato@acme.com.br', '11999999999')
RETURNING id;
```
**Copie o UUID retornado!**

### Passo 2: Lançar Venda
```powershell
node launch-sale.js `
  --seller-id "VENDEDOR_UUID" `
  --customer-id "CLIENTE_UUID" `
  --gross-amount 10000 `
  --tax-amount 1000 `
  --discount-amount 500 `
  --payment-method "Cartão"
```

**Retorna:** Sale ID

### Passo 3: Aprovar Venda (AUTOMÁTICO ✨)
```powershell
node approve-sale.js --sale-id "SALE_ID"
```

**O que acontece:**
- ✅ Sale status → APPROVED
- ✅ Banco cria comissão automaticamente
- ✅ Cálculo: `net_amount × (commission_percentage / 100)`

**Exemplo:** R$8.500 × 15% = **R$1.275**

---

## 🎨 Dashboard

1. Abra `dashboard.html` no navegador
2. Configure credenciais (URL + Anon Key)
3. Use as 6 abas:
   - 🛍️ Lançar Venda
   - 📋 Vendas
   - 💵 Comissões
   - 📈 Dashboard Mensal
   - 👤 Usuários
   - ⚙️ Configuração

---

## 🧑‍💼 Roles & Permissões

| Role | Comissão | Permissões |
|------|----------|-----------|
| **ADMIN** | 0% | Tudo (usuários, vendas, comissões) |
| **GERENTE** | 5% | Aprovar vendas, ver comissões |
| **VENDEDOR** | 15% | Lançar vendas próprias |
| **COMERCIAL** | 10% | Lançar vendas, ver comissões |

---

## 🔧 Referência de Comandos

### Users
```bash
# Criar
node manage-users.js create --name "Nome" --email "email@gpsx.com.br" --role ADMIN --commission-percentage 0

# Listar
node manage-users.js list

# Editar
node manage-users.js edit --id UUID --commission-percentage 20

# Deletar
node manage-users.js delete --id UUID
```

### Sales
```bash
# Lançar
node launch-sale.js --seller-id UUID --customer-id UUID --gross-amount 10000

# Aprovar
node approve-sale.js --sale-id UUID

# Listar comissões
node list-commissions.js
```

---

## 🚨 Troubleshooting

| Erro | Causa | Solução |
|------|-------|--------|
| `Invalid API key` | Credencial expirada | Use novo ANON_KEY do Supabase |
| `foreign key constraint` | Cliente/Vendedor não existe | Crie via SQL ou manage-users.js |
| `RLS violation` | Tabela protegida | Desabilitar RLS em Supabase → Policies |
| `Column not found` | Schema incompleto | Executar SQL schema no Supabase |

---

## 📞 Contato

**Email:** mentor@gpsx.com.br  
**Supabase Project:** [Console](https://supabase.com/dashboard/project/gvzqmgrpwnzfsxfwtsqq)

---

**✨ Sistema pronto para produção!**
