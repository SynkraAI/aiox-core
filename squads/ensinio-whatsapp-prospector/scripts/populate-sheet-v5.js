#!/usr/bin/env node
'use strict';

/**
 * Phase 8 — Populate Google Sheets v5.0 (Sheets-First Architecture)
 *
 * Reads processed data (outreach-messages.md + phone-book) and populates
 * Google Sheets with 10 columns including WhatsApp links.
 *
 * Usage:
 *   node squads/ensinio-whatsapp-prospector/scripts/populate-sheet-v5.js [options]
 *
 * Options:
 *   --dry-run       Preview data without writing to Sheets
 *   --group <name>  Override group name (default: from phone-book)
 *   --tab <mode>    Tab mode: "per_group" (default) or "single"
 *   --clear         Clear existing data before writing
 */

const fs = require('fs');
const path = require('path');
const { resolvePhoneFromBook } = require('../lib/phone-resolver');
const { generateWhatsAppLink } = require('../lib/whatsapp-utils');

const DATA_DIR = path.join(__dirname, '..', 'data', 'outputs', 'mentoria-50k');
const PHONE_BOOK_PATH = path.join(__dirname, '..', 'data', 'phone-books', 'mentoria-50k.json');
const SPREADSHEET_ID = '124EQQAkmt9D7-49LbR-Jx64DhxdtCwceUQgqolk5ZFI';

const HEADERS = [
  'Nome', 'Telefone', 'Grupo WhatsApp', 'Projeto',
  'Explicacao Projeto', 'Mensagem', 'Link WhatsApp',
  'Status Envio', 'Link GHL', 'GHL Contact ID',
];

const DRY_RUN = process.argv.includes('--dry-run');
const CLEAR_FIRST = process.argv.includes('--clear');
const TAB_MODE = process.argv.includes('--tab')
  ? process.argv[process.argv.indexOf('--tab') + 1] || 'per_group'
  : 'per_group';

// --- Parse outreach messages from markdown ---

function parseOutreachMessages() {
  const raw = fs.readFileSync(path.join(DATA_DIR, 'outreach-messages.md'), 'utf8');
  const phoneBook = JSON.parse(fs.readFileSync(PHONE_BOOK_PATH, 'utf8'));
  const groupName = phoneBook.group_name || 'MENTORIA 50K';

  const sections = raw.split(/^### \d+\./m).slice(1);
  const prospects = [];

  for (const section of sections) {
    const lines = section.trim().split('\n');
    const headerMatch = lines[0].match(/^\s*(.+?)\s*\(Score\s*(\d+)\)/);
    if (!headerMatch) continue;

    const name = headerMatch[1].trim();
    const score = parseInt(headerMatch[2], 10);

    // Extract message
    const messageStart = lines.findIndex(l => l.startsWith('**Message:**'));
    if (messageStart === -1) continue;
    let messageEnd = lines.findIndex((l, i) =>
      i > messageStart && (l.startsWith('**WhatsApp Link:**') || l === '---'),
    );
    if (messageEnd === -1) messageEnd = lines.length;
    const message = lines.slice(messageStart + 1, messageEnd).join('\n').trim();

    // Resolve phone from phone-book
    const { phone, notes } = resolvePhoneFromBook(name, phoneBook);

    // Extract approach/project type
    const approachLine = lines.find(l => l.startsWith('**Approach:**'));
    const approach = approachLine ? approachLine.replace('**Approach:**', '').trim() : '';

    // Build description
    let description = `Score ${score}/10`;
    if (notes) description += ` - ${notes}`;

    // Build WhatsApp link (wa.me format to match original)
    const waLink = generateWhatsAppLink(phone, message, { format: 'wa.me' });

    prospects.push({
      name,
      phone,
      group: groupName,
      project: approach || 'client',
      description,
      message,
      waLink,
      score,
      status: '\u2B1C Nao enviado', // default status
      linkGhl: '',
      ghlId: '',
    });
  }

  // Sort by score descending (temperature)
  prospects.sort((a, b) => b.score - a.score);
  return { prospects, groupName };
}

// --- Format data for Sheets ---

function formatRowsForSheets(prospects) {
  return prospects.map(p => [
    p.name,
    `'${p.phone}`,  // Prefix with ' to force text in Sheets (preserves +)
    p.group,
    p.project,
    p.description,
    p.message,
    p.waLink,
    p.status,
    p.linkGhl,
    p.ghlId,
  ]);
}

function buildSummaryRows(prospects, groupName) {
  const withPhone = prospects.filter(p => p.phone && !p.phone.includes('MISSING'));
  const hot = prospects.filter(p => p.score >= 7);
  const warm = prospects.filter(p => p.score >= 5 && p.score < 7);
  const cold = prospects.filter(p => p.score >= 3 && p.score < 5);

  return [
    ['Metrica', 'Valor'],
    ['Grupo', groupName],
    ['Total Contatos', String(prospects.length)],
    ['Com Telefone', `${withPhone.length} (${Math.round(withPhone.length / prospects.length * 100)}%)`],
    ['HOT (7-10)', String(hot.length)],
    ['WARM (5-6)', String(warm.length)],
    ['COLD (3-4)', String(cold.length)],
    ['Mensagens Geradas', `${prospects.length} (100%)`],
    ['Ordenacao', 'Score DESC (temperatura)'],
    ['Data Processamento', new Date().toISOString().slice(0, 16).replace('T', ' ')],
  ];
}

// --- Write to Google Sheets ---

async function writeToSheets(prospects, groupName) {
  const { writeToSheet, clearSheet, createSheetsClient } = require('../../../tools/google-sheets-writer');

  const tabName = TAB_MODE === 'single' ? 'All Prospects' : groupName;
  const sheets = await createSheetsClient();

  // Ensure tabs exist
  try {
    const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const existingTabs = meta.data.sheets.map(s => s.properties.title);

    const tabsNeeded = TAB_MODE === 'single'
      ? ['Summary', 'All Prospects']
      : ['Summary', tabName];

    for (const tab of tabsNeeded) {
      if (!existingTabs.includes(tab)) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: SPREADSHEET_ID,
          requestBody: {
            requests: [{ addSheet: { properties: { title: tab } } }],
          },
        });
        console.log(`  + Aba "${tab}" criada`);
      }
    }
  } catch (e) {
    console.error(`  Erro ao verificar/criar abas: ${e.message}`);
  }

  // Clear if requested
  if (CLEAR_FIRST) {
    console.log('  Limpando dados existentes...');
    try { await clearSheet(SPREADSHEET_ID, `${tabName}!A:J`); } catch { /* tab might not exist */ }
    try { await clearSheet(SPREADSHEET_ID, 'Summary!A:B'); } catch { /* ignore */ }
  }

  // Write data tab (headers + rows)
  const dataRows = formatRowsForSheets(prospects);
  const allValues = [HEADERS, ...dataRows];

  console.log(`  Escrevendo ${dataRows.length} prospects em "${tabName}"...`);
  const dataResult = await writeToSheet(
    SPREADSHEET_ID,
    `${tabName}!A1:J${allValues.length}`,
    allValues,
  );
  console.log(`  ${dataResult.ok ? 'OK' : 'ERRO'} — ${dataResult.updatedCells || 0} celulas atualizadas`);

  // Write summary tab
  if (TAB_MODE === 'per_group') {
    const summaryRows = buildSummaryRows(prospects, groupName);
    console.log('  Escrevendo aba Summary...');
    const summaryResult = await writeToSheet(
      SPREADSHEET_ID,
      `Summary!A1:B${summaryRows.length}`,
      summaryRows,
    );
    console.log(`  ${summaryResult.ok ? 'OK' : 'ERRO'} — ${summaryResult.updatedCells || 0} celulas`);
  }

  return { dataRows: dataRows.length, tab: tabName };
}

// --- Quality Gate QG-008 ---

function runQualityGate(prospects) {
  const checks = [];
  let pass = true;

  // 1. All contacts have required fields
  const missingPhone = prospects.filter(p => !p.phone);
  checks.push({
    name: 'Telefones presentes',
    pass: missingPhone.length === 0,
    detail: missingPhone.length > 0
      ? `${missingPhone.length} sem telefone: ${missingPhone.map(p => p.name).join(', ')}`
      : `${prospects.length}/${prospects.length} com telefone`,
  });

  // 2. WhatsApp links valid
  const invalidLinks = prospects.filter(p => p.phone && !p.waLink.startsWith('https://wa.me/'));
  checks.push({
    name: 'Links WhatsApp validos',
    pass: invalidLinks.length === 0,
    detail: invalidLinks.length > 0
      ? `${invalidLinks.length} links invalidos`
      : `${prospects.filter(p => p.waLink).length} links OK`,
  });

  // 3. Messages present
  const noMessage = prospects.filter(p => !p.message || p.message.length < 20);
  checks.push({
    name: 'Mensagens presentes',
    pass: noMessage.length === 0,
    detail: noMessage.length > 0
      ? `${noMessage.length} sem mensagem adequada`
      : `${prospects.length} mensagens OK`,
  });

  // 4. Sorted by temperature
  let sorted = true;
  for (let i = 1; i < prospects.length; i++) {
    if (prospects[i].score > prospects[i - 1].score) { sorted = false; break; }
  }
  checks.push({
    name: 'Ordenacao por temperatura',
    pass: sorted,
    detail: sorted ? 'DESC correto' : 'Ordem incorreta',
  });

  // 5. Status defaults
  const wrongStatus = prospects.filter(p => p.status !== '\u2B1C Nao enviado');
  checks.push({
    name: 'Status padrao correto',
    pass: wrongStatus.length === 0,
    detail: `${prospects.length - wrongStatus.length}/${prospects.length} com status padrao`,
  });

  console.log('\n--- Quality Gate QG-008 ---');
  for (const c of checks) {
    const icon = c.pass ? '\u2705' : '\u26A0\uFE0F';
    console.log(`  ${icon} ${c.name}: ${c.detail}`);
    if (!c.pass) pass = false;
  }
  console.log(`\n  Resultado: ${pass ? 'PASS' : 'WARNINGS (continuando)'}\n`);

  return pass;
}

// --- Main ---

async function main() {
  console.log('\n=== Phase 8: Populate Google Sheets v5.0 ===\n');

  // Step 1: Parse data
  console.log('1. Parseando dados...');
  const { prospects, groupName } = parseOutreachMessages();
  console.log(`   ${prospects.length} prospects parseados (grupo: ${groupName})`);
  console.log(`   Score range: ${prospects[prospects.length - 1]?.score}-${prospects[0]?.score}`);

  // Step 2: Quality gate
  console.log('\n2. Validando dados...');
  runQualityGate(prospects);

  // Step 3: Preview or write
  if (DRY_RUN) {
    console.log('*** DRY RUN — dados nao serao escritos ***\n');
    console.log(`Tab: "${groupName}" | Colunas: ${HEADERS.length} | Linhas: ${prospects.length}`);
    console.log('\nPrimeiros 5 prospects:');
    for (const p of prospects.slice(0, 5)) {
      console.log(`  [${p.score}] ${p.name.padEnd(25)} ${p.phone.padEnd(16)} ${p.waLink ? 'wa.me OK' : 'NO LINK'}`);
    }
    console.log(`\n... e ${Math.max(0, prospects.length - 5)} mais\n`);
    console.log('Rode sem --dry-run para popular a planilha.\n');
    return;
  }

  // Step 4: Write to Sheets
  console.log('3. Escrevendo no Google Sheets...');
  const result = await writeToSheets(prospects, groupName);

  // Step 5: Summary
  console.log('\n=== Resultado ===');
  console.log(`  Prospects: ${result.dataRows}`);
  console.log(`  Tab: "${result.tab}"`);
  console.log(`  Colunas: ${HEADERS.length} (A-J)`);
  console.log(`  Spreadsheet: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`);
  console.log('\n  Proximo passo: Abra a planilha e clique nos links WhatsApp (coluna G)');
  console.log('  Marque "Enviado" na coluna H apos enviar cada mensagem.\n');
}

main().catch(err => {
  console.error(`\nFatal: ${err.message}`);
  if (err.stack) console.error(err.stack);
  process.exit(1);
});
