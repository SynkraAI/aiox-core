#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Read TSV to get all prospects
const TSV_FILE = path.join(__dirname, '../data/outputs/mentoria-50k/outreach-sheets-final.tsv');
const tsvContent = fs.readFileSync(TSV_FILE, 'utf-8');
const tsvLines = tsvContent.split('\n');

console.log('\n📊 Checking Google Sheets for already sent messages...\n');
console.log('ℹ️  To see which prospects have "Enviado" in column H:');
console.log('    1. Open the spreadsheet in browser');
console.log('    2. Check column H for "Enviado" marks');
console.log('    3. Filter to show only "Enviado" rows\n');
console.log(`📁 Total prospects in TSV: ${tsvLines.length - 1} (excluding header)`);
console.log('🔗 Sheet: https://docs.google.com/spreadsheets/d/124EQQAkmt9D7-49LbR-Jx64DhxdtCwceUQgqolk5ZFI/edit?gid=0#gid=0');
console.log('\n🔄 When ready, you can:\n');
console.log('   Option 1: Run script to skip already-sent prospects');
console.log('   Option 2: Manually review column H and note down skips\n');
