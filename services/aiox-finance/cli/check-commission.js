#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1cGFiYXNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MjAwMDAwMDAsImV4cCI6MTkwMDAwMDAwMH0.SUPABASE_JWT_SECRET_PLACEHOLDER';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCommission() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || !args.includes('--sale-id')) {
    console.log(`
Usage: node check-commission.js --sale-id <sale-id>

Shows commission details for a given sale

Example:
  node check-commission.js --sale-id 550e8400-e29b-41d4-a716-446655440000

Output: Commission ID, amount, percentage, status
    `);
    process.exit(args.includes('--help') ? 0 : 1);
  }

  const saleId = args[args.indexOf('--sale-id') + 1];

  try {
    console.log('\n📊 Checking commission...');

    const { data: saleData, error: saleError } = await supabase
      .from('sales')
      .select('id, net_amount, seller_id, status')
      .eq('id', saleId)
      .single();

    if (saleError || !saleData) {
      console.error('❌ Sale not found:', saleId);
      process.exit(1);
    }

    console.log('   Sale ID:', saleData.id);
    console.log(`   Sale Status: ${saleData.status}`);
    console.log(`   Net Amount: BRL ${parseFloat(saleData.net_amount).toFixed(2)}`);

    const { data: commissionData, error: commError } = await supabase
      .from('commissions')
      .select('*')
      .eq('sale_id', saleId)
      .single();

    if (commError || !commissionData) {
      console.log('\n⚠️  No commission found for this sale');
      console.log('   Make sure to approve the sale first:');
      console.log(`   node approve-sale.js --sale-id ${saleId}`);
      process.exit(0);
    }

    console.log('\n✅ Commission found!');
    console.log(`   Commission ID: ${commissionData.id}`);
    console.log(`   Amount: BRL ${parseFloat(commissionData.amount).toFixed(2)}`);
    console.log(`   Percentage: ${commissionData.percentage}%`);
    console.log(`   Status: ${commissionData.status}`);
    console.log(`   Created: ${new Date(commissionData.created_at).toLocaleString()}`);

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

checkCommission();
