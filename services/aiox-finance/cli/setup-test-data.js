#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1cGFiYXNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MjAwMDAwMDAsImV4cCI6MTkwMDAwMDAwMH0.SUPABASE_JWT_SECRET_PLACEHOLDER';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupTestData() {
  try {
    console.log('\n🔧 Setting up test data...\n');

    // Create test customer
    const customerId = uuidv4();
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .insert({
        id: customerId,
        name: 'Test Customer',
        email: 'customer@test.com',
        phone: '11999999999',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (customerError) {
      console.error('⚠️  Customer creation error (may already exist):', customerError.message);
    } else {
      console.log('✅ Customer created:', customerId);
    }

    // Create test seller
    const sellerId = uuidv4();
    const { data: sellerData, error: sellerError } = await supabase
      .from('users')
      .insert({
        id: sellerId,
        name: 'Test Seller',
        email: 'seller@test.com',
        role: 'COMERCIAL',
        commission_percentage: 10,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (sellerError) {
      console.error('⚠️  Seller creation error (may already exist):', sellerError.message);
    } else {
      console.log('✅ Seller created:', sellerId);
      console.log('   Commission: 10%');
    }

    console.log('\n🎯 Test data ready! Use this command to launch a sale:\n');
    console.log(`node launch-sale.js \\`);
    console.log(`  --seller-id ${sellerId || '{SELLER_ID}'} \\`);
    console.log(`  --customer-id ${customerId || '{CUSTOMER_ID}'} \\`);
    console.log(`  --gross-amount 1000 \\`);
    console.log(`  --tax-amount 100 \\`);
    console.log(`  --discount-amount 50 \\`);
    console.log(`  --method PIX`);

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

setupTestData();
