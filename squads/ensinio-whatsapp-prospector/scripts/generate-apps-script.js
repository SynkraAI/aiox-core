#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

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

  const messageStart = lines.findIndex(l => l.startsWith('**Message:**'));
  let messageEnd = lines.findIndex((l, i) => i > messageStart && (l.startsWith('**WhatsApp Link:**') || l === '---'));
  if (messageEnd === -1) messageEnd = lines.length;
  const message = lines.slice(messageStart + 1, messageEnd).join('\n').trim();

  const nameLower = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  let phone = '';
  let nicho = '';

  for (const [cn, cd] of Object.entries(phoneBook.contacts)) {
    const cLower = cn.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (cLower.includes(nameLower) || nameLower.includes(cLower)) {
      phone = cd.phone; nicho = cd.notes || ''; break;
    }
  }
  if (!phone) {
    const parts = nameLower.split(/\s+/);
    for (const [cn, cd] of Object.entries(phoneBook.contacts)) {
      const cLower = cn.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (parts.filter(p => p.length > 2 && cLower.includes(p)).length >= 2) {
        phone = cd.phone; nicho = cd.notes || ''; break;
      }
    }
  }
  if (!phone) {
    const firstName = nameLower.split(/\s+/)[0];
    if (firstName.length > 2) {
      for (const [cn, cd] of Object.entries(phoneBook.contacts)) {
        const cLower = cn.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (cLower.startsWith(firstName)) { phone = cd.phone; nicho = cd.notes || ''; break; }
      }
    }
  }

  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const encodedMsg = encodeURIComponent(message);
  const waLink = cleanPhone ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMsg}` : '';

  const approachLine = lines.find(l => l.startsWith('**Approach:**'));
  const approach = approachLine ? approachLine.replace('**Approach:**', '').trim() : 'client';

  rows.push([
    name,
    phone,
    'MENTORIA 50K',
    approach,
    `Score ${score}/10` + (nicho ? ` - ${nicho}` : ''),
    message,
    waLink,
  ]);
}

// Sort by score (extracted from descricao)
rows.sort((a, b) => {
  const sa = parseInt(a[4].match(/Score (\d+)/)?.[1] || '0', 10);
  const sb = parseInt(b[4].match(/Score (\d+)/)?.[1] || '0', 10);
  return sb - sa;
});

// Generate Apps Script
const script = `function populateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();

  // Header
  var header = ["Nome", "Telefone", "Grupo WhatsApp", "Projeto/Nicho", "Descricao do Projeto", "Mensagem WhatsApp", "Link Direto"];
  sheet.getRange(1, 1, 1, 7).setValues([header]);
  sheet.getRange(1, 1, 1, 7).setFontWeight("bold");

  // Data
  var data = ${JSON.stringify(rows, null, 2)};

  if (data.length > 0) {
    sheet.getRange(2, 1, data.length, 7).setValues(data);
  }

  // Format
  sheet.setColumnWidth(1, 180);  // Nome
  sheet.setColumnWidth(2, 160);  // Telefone
  sheet.setColumnWidth(3, 150);  // Grupo
  sheet.setColumnWidth(4, 120);  // Nicho
  sheet.setColumnWidth(5, 250);  // Descricao
  sheet.setColumnWidth(6, 400);  // Mensagem
  sheet.setColumnWidth(7, 200);  // Link

  // Wrap text in message column
  sheet.getRange(2, 6, data.length, 1).setWrap(true);

  // Auto-resize rows
  for (var i = 2; i <= data.length + 1; i++) {
    sheet.setRowHeight(i, 80);
  }

  // Freeze header
  sheet.setFrozenRows(1);

  SpreadsheetApp.getUi().alert(data.length + ' prospects inseridos com sucesso!');
}
`;

const outputPath = path.join(DATA_DIR, 'populate-sheet.gs');
fs.writeFileSync(outputPath, script, 'utf8');

console.log('Script gerado: ' + outputPath);
console.log(rows.length + ' prospects');
console.log('\nPara usar:');
console.log('1. Na planilha: Extensoes > Apps Script');
console.log('2. Cole o conteudo do arquivo');
console.log('3. Clique Run (populateSheet)');
console.log('4. Autorize quando pedir');
