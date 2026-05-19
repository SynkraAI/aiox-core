#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
const Decimal = require('decimal.js');

const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1cGFiYXNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MjAwMDAwMDAsImV4cCI6MTkwMDAwMDAwMH0.SUPABASE_JWT_SECRET_PLACEHOLDER';

const supabase = createClient(supabaseUrl, supabaseKey);

async function launchSale() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.length === 0) {
    console.log(`
Usage: node launch-sale.js [options]

Options:
  --seller-id <uuid>          Seller UUID (required)
  --customer-id <uuid>        Customer UUID (required)
  --gross-amount <number>     Gross amount in BRL (required)
  --tax-amount <number>       Tax amount (default: 0)
  --discount-amount <number>  Discount amount (default: 0)
  --method <method>           Payment method: PIX, CREDIT_CARD, etc. (default: PIX)
  --gateway-id <uuid>         Financial gateway UUID (optional)
  --installments <number>     Installment count 1-36 (default: 1)
  --recurring                 Is recurring (default: false)
  --notes <text>              Sale notes (optional)

Examples:
  node launch-sale.js \\
    --seller-id 550e8400-e29b-41d4-a716-446655440000 \\
    --customer-id 550e8400-e29b-41d4-a716-446655440001 \\
    --gross-amount 1000 \\
    --tax-amount 100 \\
    --discount-amount 50 \\
    --method PIX

Result: Creates sale + auto-calculates commission on net_amount
    `);
    process.exit(0);
  }

  const params = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    params[key] = value;
  }

  if (!params['seller-id'] || !params['customer-id'] || !params['gross-amount']) {
    console.error('❌ Missing required parameters: --seller-id, --customer-id, --gross-amount');
    process.exit(1);
  }

  const grossAmount = new Decimal(params['gross-amount']);
  const taxAmount = new Decimal(params['tax-amount'] || 0);
  const discountAmount = new Decimal(params['discount-amount'] || 0);
  const netAmount = grossAmount.minus(taxAmount).minus(discountAmount);

  if (netAmount.lessThan(0)) {
    console.error('❌ Net amount cannot be negative (gross - tax - discount)');
    process.exit(1);
  }

  try {
    console.log('\n📝 Launching sale...');
    console.log(`   Seller ID: ${params['seller-id']}`);
    console.log(`   Customer ID: ${params['customer-id']}`);
    console.log(`   Gross Amount: BRL ${grossAmount.toFixed(2)}`);
    console.log(`   Tax: BRL ${taxAmount.toFixed(2)}`);
    console.log(`   Discount: BRL ${discountAmount.toFixed(2)}`);
    console.log(`   Net Amount: BRL ${netAmount.toFixed(2)}`);

    const saleId = uuidv4();
    const { data: saleData, error: saleError } = await supabase
      .from('sales')
      .insert({
        id: saleId,
        seller_id: params['seller-id'],
        customer_id: params['customer-id'],
        gross_amount: parseFloat(grossAmount.toFixed(2)),
        net_amount: parseFloat(netAmount.toFixed(2)),
        tax_amount: parseFloat(taxAmount.toFixed(2)),
        discount_amount: parseFloat(discountAmount.toFixed(2)),
        payment_method: params['method'] || 'PIX',
        financial_gateway_id: params['gateway-id'] || null,
        installment_count: parseInt(params['installments'] || 1),
        is_recurring: params['recurring'] === 'true',
        notes: params['notes'] || null,
        status: 'PENDING',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (saleError) {
      console.error('❌ Failed to create sale:', saleError.message);
      process.exit(1);
    }

    console.log('\n✅ Sale created successfully!');
    console.log(`   Sale ID: ${saleData.id}`);
    console.log(`   Status: ${saleData.status}`);

    console.log('\n📊 Next step: Approve sale to trigger auto-commission');
    console.log(`   node approve-sale.js --sale-id ${saleData.id}`);

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

launchSale();
