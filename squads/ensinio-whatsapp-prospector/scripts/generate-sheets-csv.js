#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { resolvePhoneFromBook } = require('../lib/phone-resolver');
const { generateWhatsAppLink } = require('../lib/whatsapp-utils');

const DATA_DIR = path.join(__dirname, '..', 'data', 'outputs', 'mentoria-50k');
const PHONE_BOOK = path.join(__dirname, '..', 'data', 'phone-books', 'mentoria-50k.json');

// Read files
const outreachRaw = fs.readFileSync(path.join(DATA_DIR, 'outreach-messages.md'), 'utf8');
const phoneBook = JSON.parse(fs.readFileSync(PHONE_BOOK, 'utf8'));

// Parse outreach messages
const prospects = [];
const sections = outreachRaw.split(/^### \d+\./m).slice(1);

for (const section of sections) {
  const lines = section.trim().split('\n');

  // Extract name and score from first line: " Eduardo (Score 10)"
  const headerMatch = lines[0].match(/^\s*(.+?)\s*\(Score\s*(\d+)\)/);
  if (!headerMatch) continue;

  const name = headerMatch[1].trim();
  const score = parseInt(headerMatch[2], 10);

  // Extract approach
  const approachLine = lines.find(l => l.startsWith('**Approach:**'));
  const approach = approachLine ? approachLine.replace('**Approach:**', '').trim() : '';

  // Extract phone from phone book or from file
  const phoneLine = lines.find(l => l.startsWith('**Phone:**'));
  const phone = phoneLine ? phoneLine.replace('**Phone:**', '').trim() : '';

  // Extract message (between **Message:** and **WhatsApp Link:** or ---)
  const messageStart = lines.findIndex(l => l.startsWith('**Message:**'));
  let messageEnd = lines.findIndex((l, i) => i > messageStart && (l.startsWith('**WhatsApp Link:**') || l.startsWith('---')));
  if (messageEnd === -1) messageEnd = lines.length;

  const message = lines.slice(messageStart + 1, messageEnd)
    .join('\n')
    .trim();

  // Resolve phone from phone book
  const { phone: resolvedPhone } = resolvePhoneFromBook(name, phoneBook);

  // Generate WhatsApp link (using 'api' format to match original)
  const waLink = generateWhatsAppLink(resolvedPhone, message, { format: 'api' });

  // Determine tier
  let tier = '';
  if (score >= 9) tier = 'HOT';
  else if (score >= 7) tier = 'WARM-HIGH';
  else if (score >= 5) tier = 'WARM';
  else if (score >= 3) tier = 'COLD';

  prospects.push({
    rank: prospects.length + 1,
    name,
    score,
    tier,
    approach,
    phone: resolvedPhone,
    message,
    waLink,
    status: 'Pendente',
  });
}

// Generate CSV
const csvLines = [];
csvLines.push([
  'Rank',
  'Nome',
  'Score',
  'Tier',
  'Approach',
  'Telefone',
  'Mensagem',
  'WhatsApp Link',
  'Status',
  'Resposta',
  'Data Envio',
  'Notas',
].join('\t'));

for (const p of prospects) {
  csvLines.push([
    p.rank,
    p.name,
    p.score,
    p.tier,
    p.approach,
    p.phone,
    p.message.replace(/\t/g, ' ').replace(/\n/g, '\\n'),
    p.waLink,
    p.status,
    '',
    '',
    '',
  ].join('\t'));
}

const outputPath = path.join(DATA_DIR, 'outreach-google-sheets.tsv');
fs.writeFileSync(outputPath, csvLines.join('\n'), 'utf8');

console.log(`Generated ${prospects.length} prospects`);
console.log(`Output: ${outputPath}`);
console.log('\nBreakdown by tier:');
const tiers = {};
for (const p of prospects) {
  tiers[p.tier] = (tiers[p.tier] || 0) + 1;
}
for (const [tier, count] of Object.entries(tiers)) {
  console.log(`  ${tier}: ${count}`);
}

// Also check phone coverage
const withPhone = prospects.filter(p => p.phone).length;
const withLink = prospects.filter(p => p.waLink).length;
console.log(`\nPhone coverage: ${withPhone}/${prospects.length}`);
console.log(`WhatsApp links: ${withLink}/${prospects.length}`);
