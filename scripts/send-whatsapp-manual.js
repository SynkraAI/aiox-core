#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const readline = require('readline');
const { generateWhatsAppLink } = require('../squads/ensinio-whatsapp-prospector/lib/whatsapp-utils');

const TSV_FILE = path.join(__dirname, '../data/outputs/mentoria-50k/outreach-sheets-final.tsv');

// Load prospects
function loadProspects() {
  return new Promise((resolve, reject) => {
    const prospects = [];
    const rl = readline.createInterface({
      input: fs.createReadStream(TSV_FILE),
      crlfDelay: Infinity,
    });

    let lineNum = 0;
    rl.on('line', (line) => {
      lineNum++;
      if (lineNum === 1) return;
      
      const parts = line.split('\t');
      if (parts.length >= 6 && parts[1]) {
        prospects.push({
          id: prospects.length + 1,
          name: parts[0],
          phone: parts[1],
          message: parts[5],
        });
      }
    });

    rl.on('close', () => resolve(prospects));
    rl.on('error', reject);
  });
}

// Open URL in browser
function openUrl(url) {
  const cmd = process.platform === 'darwin' 
    ? `open "${url}"` 
    : process.platform === 'linux'
      ? `xdg-open "${url}"`
      : `start "${url}"`;
  
  exec(cmd, (err) => {
    if (err) console.error('Error opening URL:', err.message);
  });
}

// User confirmation
function getUserInput(prompt) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.toLowerCase().trim());
    });
  });
}

// Main
async function main() {
  console.log('\n🚀 WhatsApp Web Manual Sender\n');
  
  const prospects = await loadProspects();
  console.log(`✓ Loaded ${prospects.length} prospects from TSV\n`);
  
  // Ask for interval
  const intervalStr = await getUserInput('⏱️  Interval between messages (1-60 seconds, default 5)? ');
  const interval = parseInt(intervalStr) || 5;
  
  if (interval < 1 || interval > 60) {
    console.error('❌ Invalid interval. Use 1-60 seconds.');
    process.exit(1);
  }

  console.log(`\n📱 Opening WhatsApp Web links with ${interval}s interval...\n`);
  
  let successCount = 0;
  const results = [];

  for (let i = 0; i < prospects.length; i++) {
    const prospect = prospects[i];
    const link = generateWhatsAppLink(prospect.phone, prospect.message, { format: 'web' });
    
    console.log(`[${String(i + 1).padStart(2, '0')}/77] ${prospect.name.padEnd(30)}`);
    console.log(`   🔗 ${link.substring(0, 80)}...\n`);
    
    // Open browser
    openUrl(link);
    
    // Wait for user confirmation
    const answer = await getUserInput('   ✓ Message sent? (y/n/skip/quit): ');
    
    if (answer === 'quit' || answer === 'q') {
      console.log('\n⏸️  Stopped by user.');
      break;
    }
    
    if (answer === 'skip' || answer === 's') {
      results.push({ id: prospect.id, name: prospect.name, phone: prospect.phone, status: 'skipped' });
      console.log('   ⏭️  Skipped.\n');
      continue;
    }
    
    if (answer === 'y' || answer === '') {
      results.push({ id: prospect.id, name: prospect.name, phone: prospect.phone, status: 'sent' });
      successCount++;
      console.log('   ✅ Marked as sent.\n');
      
      // Wait for interval before next
      if (i < prospects.length - 1) {
        console.log(`   ⏳ Waiting ${interval}s before next...\n`);
        await new Promise(r => setTimeout(r, interval * 1000));
      }
    }
  }

  // Save results
  const resultFile = path.join(__dirname, '../data/outputs/mentoria-50k/whatsapp-manual-results.json');
  fs.writeFileSync(resultFile, JSON.stringify(results, null, 2));

  console.log('\n✅ Done!');
  console.log(`   ✓ Sent: ${successCount}/${results.length}`);
  console.log(`   📁 Results: ${resultFile}\n`);
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
