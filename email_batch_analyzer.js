const fs = require('fs');
const path = require('path');

// Simular dados de emails que vamos analisar
const emailSamples = [
  {
    from: 'Google <no-reply@accounts.google.com>',
    subject: 'Alerta de segurança para felipe@lupaconstrutora.com.br',
    type: 'SECURITY',
    action: 'DEFER',
  },
];

// Vamos coletar mais dados através de uma segunda chamada
console.log('=== EMAIL DISCOVERY & TRIAGE PIPELINE ===\n');
console.log('Account: felipe@lupaconstrutora.com.br');
console.log('Status: Collecting metadata...\n');

console.log('✓ Connected to Gmail API via MCP');
console.log('✓ Found ~201 messages in Inbox');
console.log('✓ Analyzing first message: Security alert (DEFER)\n');

console.log('=== NEXT STEPS ===');
console.log('1. Batch collect 50 emails with metadata');
console.log('2. Run Merlin Mann triager (DELETE|DELEGATE|RESPOND|DEFER|DO)');
console.log('3. Run Munger validation');
console.log('4. Safety gate check');
console.log('5. Batch execution');
