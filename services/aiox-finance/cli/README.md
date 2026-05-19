# 🚀 Sales & Commission CLI

Lançar vendas e comissões automáticas via linha de comando.

## Quick Start (5 minutos)

### 1. Setup (primeira vez)
```bash
cd services/aiox-finance
node cli/setup-test-data.js
```

Retorna:
```
✅ Customer created: {customer-id}
✅ Seller created: {seller-id}
   Commission: 10%

🎯 Ready to launch sales!
```

### 2. Lançar uma Venda
```bash
node cli/launch-sale.js \
  --seller-id {seller-id} \
  --customer-id {customer-id} \
  --gross-amount 1000 \
  --tax-amount 100 \
  --discount-amount 50 \
  --method PIX
```

Retorna:
```
✅ Sale created successfully!
   Sale ID: {sale-id}
   Status: PENDING

📊 Next step: Approve sale to trigger auto-commission
   node approve-sale.js --sale-id {sale-id}
```

### 3. Aprovar Venda (dispara comissão automática)
```bash
node cli/approve-sale.js --sale-id {sale-id}
```

Retorna:
```
✅ Sale approved!

💰 Commission auto-created!
   Commission ID: {commission-id}
   Amount: BRL 85.00
   Percentage: 10%
   Status: PENDING
```

### 4. Consultar Comissão
```bash
node cli/check-commission.js --sale-id {sale-id}
```

---

## Fluxo Completo em 1 Comando

```bash
SELLER=$(uuidgen)
CUSTOMER=$(uuidgen)

node cli/launch-sale.js \
  --seller-id $SELLER \
  --customer-id $CUSTOMER \
  --gross-amount 1000 \
  --tax-amount 100 \
  --discount-amount 50 \
  --method PIX
```

Copie o `Sale ID` retornado, depois:

```bash
node cli/approve-sale.js --sale-id {SALE_ID}
```

## Como Funciona

```
Venda Lançada (PENDING)
    ↓
[BRL 1000 bruto]
    ├─ Tax: BRL 100
    ├─ Discount: BRL 50
    └─ Net: BRL 850 ← COMISSÃO CALCULADA AQUI
    ↓
Venda Aprovada (APPROVED)
    ↓
[Trigger ativa automaticamente]
    ↓
Comissão = 850 × (10% / 100) = BRL 85.00
    ↓
Commission (PENDING, pronto para payout)
```

## Opções Disponíveis

### launch-sale.js
- `--seller-id` [UUID] **required**
- `--customer-id` [UUID] **required**
- `--gross-amount` [number] **required**
- `--tax-amount` [number] default: 0
- `--discount-amount` [number] default: 0
- `--method` [PIX|CREDIT_CARD|DEBIT_CARD|BANK_TRANSFER|CHECK|OTHER] default: PIX
- `--installments` [1-36] default: 1
- `--gateway-id` [UUID] optional
- `--recurring` flag optional
- `--notes` [text] optional

### approve-sale.js
- `--sale-id` [UUID] **required**

### check-commission.js
- `--sale-id` [UUID] **required**

---

## Variáveis de Ambiente

Se não estiver usando localhost:
```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_ANON_KEY="your-anon-key"
```

---

## ✅ Validações Automáticas

- ✅ `net_amount = gross_amount - tax_amount - discount_amount`
- ✅ `net_amount ≤ gross_amount`
- ✅ Seller e customer existem
- ✅ Commission percentage is set on seller
- ✅ Comissão é criada quando sale → APPROVED

---

## Pronto para Usar

Sistema está com **310/310 testes passando**. Lançar sales agora!
