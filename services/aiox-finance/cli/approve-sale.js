#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1cGFiYXNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MjAwMDAwMDAsImV4cCI6MTkwMDAwMDAwMH0.SUPABASE_JWT_SECRET_PLACEHOLDER';

const supabase = createClient(supabaseUrl, supabaseKey);

async function approveSale() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || !args.includes('--sale-id')) {
    console.log(`
Usage: node approve-sale.js --sale-id <sale-id>

This:
  1. Changes sale status to APPROVED
  2. Triggers database function to auto-calculate commission
  3. Shows the created commission

Example:
  node approve-sale.js --sale-id 550e8400-e29b-41d4-a716-446655440000

Result: Commission is auto-created with status PENDING
    `);
    process.exit(args.includes('--help') ? 0 : 1);
  }

  const saleId = args[args.indexOf('--sale-id') + 1];

  try {
    console.log('\n🔄 Approving sale...');
    console.log(`   Sale ID: ${saleId}`);

    const { data: saleData, error: saleError } = await supabase
      .from('sales')
      .update({ status: 'APPROVED', updated_at: new Date().toISOString() })
      .eq('id', saleId)
      .select()
      .single();

    if (saleError) {
      console.error('❌ Failed to approve sale:', saleError.message);
      process.exit(1);
    }

    console.log('✅ Sale approved!');

    // Wait a moment for trigger to execute
    await new Promise((resolve) => setTimeout(resolve, 500));

    const { data: commissionData, error: commError } = await supabase
      .from('commissions')
      .select('*')
      .eq('sale_id', saleId)
      .single();

    if (commError || !commissionData) {
      console.log('⚠️  Commission not yet created (may be processing)');
      console.log('   Retry in a moment: node check-commission.js --sale-id ' + saleId);
      process.exit(0);
    }

    console.log('\n💰 Commission auto-created!');
    console.log(`   Commission ID: ${commissionData.id}`);
    console.log(`   Amount: BRL ${parseFloat(commissionData.amount).toFixed(2)}`);
    console.log(`   Percentage: ${commissionData.percentage}%`);
    console.log(`   Status: ${commissionData.status}`);

    console.log('\n📋 Next: Check or approve commission');
    console.log(`   node check-commission.js --sale-id ${saleId}`);

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

approveSale();
