#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { resolvePhoneFromBook } = require('../lib/phone-resolver');
const { generateWhatsAppLink } = require('../lib/whatsapp-utils');

const DATA_DIR = path.join(__dirname, '..', 'data', 'outputs', 'mentoria-50k');
const PHONE_BOOK = path.join(__dirname, '..', 'data', 'phone-books', 'mentoria-50k.json');

const outreachRaw = fs.readFileSync(path.join(DATA_DIR, 'outreach-messages.md'), 'utf8');
const phoneBook = JSON.parse(fs.readFileSync(PHONE_BOOK, 'utf8'));

const sections = outreachRaw.split(/^### \d+\./m).slice(1);
const rows = [];

for (const section of sections) {
  const lines = section.trim().split('\n');
  const headerMatch = lines[0].match(/^\s*(.+?)\s*\(Score\s*(\d+)\)/);
  if (!headerMatch) continue;

  const name = headerMatch[1].trim();
  const score = parseInt(headerMatch[2], 10);

  // Extract message
  const messageStart = lines.findIndex(l => l.startsWith('**Message:**'));
  let messageEnd = lines.findIndex((l, i) => i > messageStart && (l.startsWith('**WhatsApp Link:**') || l === '---'));
  if (messageEnd === -1) messageEnd = lines.length;
  const message = lines.slice(messageStart + 1, messageEnd).join('\n').trim();

  // Resolve phone from phone book
  const { phone, notes: nicho } = resolvePhoneFromBook(name, phoneBook);

  // Generate WhatsApp link (using 'api' format to match original)
  const waLink = generateWhatsAppLink(phone, message, { format: 'api' });

  // Extract nicho/project from notes or approach line
  const approachLine = lines.find(l => l.startsWith('**Approach:**'));
  const approach = approachLine ? approachLine.replace('**Approach:**', '').trim() : '';

  // Build description from score + approach
  let descricao = `Score ${score}/10`;
  if (nicho) descricao += ` - ${nicho}`;

  rows.push({
    nome: name,
    telefone: phone,
    grupo: 'MENTORIA 50K',
    nicho: approach || 'client',
    descricao,
    mensagem: message,
    link: waLink,
    score,
  });
}

// Sort by score descending
rows.sort((a, b) => b.score - a.score);

// Columns: Nome | Telefone | Grupo WhatsApp | Projeto/Nicho | Descricao do Projeto | Mensagem WhatsApp | Link Direto
const tsvLines = [];
tsvLines.push(['Nome', 'Telefone', 'Grupo WhatsApp', 'Projeto/Nicho', 'Descricao do Projeto', 'Mensagem WhatsApp', 'Link Direto'].join('\t'));

for (const r of rows) {
  tsvLines.push([
    r.nome,
    r.telefone,
    r.grupo,
    r.nicho,
    r.descricao,
    r.mensagem.replace(/\t/g, ' ').replace(/\n/g, '\n'),
    r.link,
  ].join('\t'));
}

const output = path.join(DATA_DIR, 'outreach-sheets-final.tsv');
fs.writeFileSync(output, tsvLines.join('\n'), 'utf8');

console.log(`${rows.length} prospects gerados (sorted by score)`);
console.log(`Output: ${output}`);
console.log('\nPara colar no Google Sheets:');
console.log(`1. pbcopy < "${output}"`);
console.log('2. Abra a planilha e clique na celula A1');
console.log('3. Cmd+V para colar');
