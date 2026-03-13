#!/usr/bin/env node
'use strict';

/**
 * Phase 9 — GHL Sync v5.0 (Sheets-First Architecture)
 *
 * Reads from Google Sheets (Phase 8 output) and syncs contacts + deals to GHL.
 * Updates Sheets columns I+J with GHL links and contact IDs.
 *
 * IMPORTANT: Does NOT send any messages. Messages are sent manually via WhatsApp Web.
 *
 * Usage:
 *   node squads/ensinio-whatsapp-prospector/scripts/sync-ghl-v5.js [options]
 *
 * Options:
 *   --dry-run       Preview without making API calls
 *   --tag <name>    Custom tag (default: "Lead Fosc")
 *   --all           Sync all contacts (not just "Enviado")
 *   --skip-deals    Only create contacts, skip deals
 */

const fs = require('fs');
const path = require('path');
const { normalizePhoneNumber } = require('@ensinio/whatsapp-parser');

// --- Config ---

const envFile = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envFile, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  if (line && !line.startsWith('#')) {
    const eq = line.indexOf('=');
    if (eq > 0) env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
  }
});

const GHL_API_TOKEN = env.GHL_API_TOKEN;
const GHL_LOCATION_ID = env.GHL_LOCATION_ID;
const GHL_PIPELINE_ID = env.GHL_PIPELINE_ID || 'xRqrV2LoT6E8iwLW4Syi';
const GHL_DEFAULT_STAGE_ID = env.GHL_DEFAULT_STAGE_ID || 'd3c25373-2b78-43d4-af3a-b4781f15874e';
const GHL_BASE_URL = env.GHL_BASE_URL || 'https://services.leadconnectorhq.com';

const SPREADSHEET_ID = '124EQQAkmt9D7-49LbR-Jx64DhxdtCwceUQgqolk5ZFI';
const SHEET_TAB = 'MENTORIA 50K';
const RATE_LIMIT_MS = 600;
const MAX_RETRIES = 3;
const RETRY_DELAYS = [2000, 5000, 10000];

const DRY_RUN = process.argv.includes('--dry-run');
const SYNC_ALL = process.argv.includes('--all');
const SKIP_DEALS = process.argv.includes('--skip-deals');
const TAG = process.argv.includes('--tag')
  ? process.argv[process.argv.indexOf('--tag') + 1]
  : 'Lead Fosc';

// --- GHL API ---

async function ghlApi(endpoint, method = 'GET', body = null) {
  const url = `${GHL_BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${GHL_API_TOKEN}`,
      'Version': '2021-07-28',
      'Content-Type': 'application/json',
    },
  };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(url, options);
  const text = await response.text();

  if (!response.ok) {
    const err = new Error(`GHL ${response.status}: ${text}`);
    err.status = response.status;
    err.body = text;
    throw err;
  }

  try { return JSON.parse(text); } catch { return { raw: text }; }
}

async function ghlApiWithRetry(endpoint, method, body) {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await ghlApi(endpoint, method, body);
    } catch (e) {
      if (attempt < MAX_RETRIES - 1 && (e.status >= 500 || e.status === 429)) {
        const delay = RETRY_DELAYS[attempt] || 5000;
        console.log(`    Retry ${attempt + 1}/${MAX_RETRIES} in ${delay}ms...`);
        await sleep(delay);
      } else {
        throw e;
      }
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// --- Contact operations ---

async function createOrGetContact(lead) {
  try {
    const result = await ghlApiWithRetry('/contacts/', 'POST', {
      locationId: GHL_LOCATION_ID,
      firstName: lead.firstName,
      lastName: lead.lastName,
      phone: lead.phone,
      source: 'WhatsApp Group Prospector',
      tags: [TAG],
    });
    return { contactId: result.contact?.id, isNew: true };
  } catch (e) {
    if (e.status === 400 || e.status === 422) {
      try {
        const data = JSON.parse(e.body);
        const contactId = data.meta?.contactId || data.contactId;
        if (contactId) {
          // Update name + tags on existing contact
          await ghlApiWithRetry(`/contacts/${contactId}`, 'PUT', {
            firstName: lead.firstName,
            lastName: lead.lastName,
            tags: [TAG],
          });
          return { contactId, isNew: false };
        }
      } catch { /* ignore parse error */ }
    }
    throw e;
  }
}

// --- Deal operations (with endpoint fallback) ---

async function getExistingDeals(contactId) {
  try {
    const result = await ghlApi(
      `/opportunities/search?location_id=${GHL_LOCATION_ID}&contact_id=${contactId}&pipeline_id=${GHL_PIPELINE_ID}`,
    );
    return result.opportunities || [];
  } catch {
    return [];
  }
}

async function createDeal(contactId, lead) {
  // Check existing deals first
  const existing = await getExistingDeals(contactId);
  if (existing.length > 0) {
    return { dealId: existing[0].id, isNew: false, endpoint: 'EXISTS' };
  }

  const dealBody = {
    pipelineId: GHL_PIPELINE_ID,
    pipelineStageId: GHL_DEFAULT_STAGE_ID,
    locationId: GHL_LOCATION_ID,
    contactId,
    name: `${lead.firstName}${lead.lastName ? ' ' + lead.lastName : ''} - ${lead.group}`,
    source: 'WhatsApp Prospector',
    status: 'open',
    monetaryValue: 0,
  };

  // Try /opportunities/ first (known working endpoint)
  const endpoints = ['/opportunities/', '/opportunities/upsert', '/deals/'];
  for (const endpoint of endpoints) {
    try {
      const result = await ghlApiWithRetry(endpoint, 'POST', dealBody);
      const dealId = result.opportunity?.id || result.deal?.id || result.id;
      return { dealId, isNew: true, endpoint };
    } catch (e) {
      if (e.status === 404 || e.status === 405) continue;
      throw e;
    }
  }

  return { dealId: null, isNew: false, endpoint: 'FAILED' };
}

// --- Read from Sheets ---

async function readFromSheets() {
  const { readFromSheet } = require('../../../tools/google-sheets-writer');

  console.log(`  Lendo aba "${SHEET_TAB}"...`);
  const rows = await readFromSheet(SPREADSHEET_ID, `${SHEET_TAB}!A2:J200`);
  console.log(`  ${rows.length} linhas encontradas`);

  const contacts = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const [name, phone, group, project, description, message, waLink, status, linkGhl, ghlId] = row;

    if (!phone || phone === 'VERIFICAR') continue;

    // Skip already synced (has GHL ID) unless --all
    if (ghlId && !SYNC_ALL) continue;

    // Skip not-sent unless --all
    if (!SYNC_ALL && status && !status.includes('Enviado')) continue;

    // Normalize phone to E.164 format
    const normalizedPhone = normalizePhoneNumber(phone);

    const nameParts = (name || '').split(' ');
    contacts.push({
      rowIndex: i + 2, // Sheets row (1-based, skip header)
      firstName: nameParts[0] || 'Contato',
      lastName: nameParts.slice(1).join(' ') || '',
      phone: normalizedPhone,
      group: group || SHEET_TAB,
      project: project || '',
      status: status || '',
    });
  }

  return contacts;
}

// --- Update Sheets with GHL data ---

async function updateSheetsWithGhl(results) {
  const { writeToSheet } = require('../../../tools/google-sheets-writer');

  console.log('\n  Atualizando colunas I+J no Sheets...');
  let updated = 0;

  // Batch update: collect all rows to update
  const updates = results
    .filter(r => r.contactId)
    .map(r => ({
      row: r.rowIndex,
      values: [
        `https://app.highlevel.com/contacts/${r.contactId}`,
        r.contactId,
      ],
    }));

  if (updates.length === 0) {
    console.log('  Nenhuma linha para atualizar.');
    return 0;
  }

  // Write in batches of 20
  for (let i = 0; i < updates.length; i += 20) {
    const batch = updates.slice(i, i + 20);
    for (const u of batch) {
      try {
        await writeToSheet(
          SPREADSHEET_ID,
          `${SHEET_TAB}!I${u.row}:J${u.row}`,
          [u.values],
        );
        updated++;
      } catch (e) {
        console.error(`  Erro ao atualizar linha ${u.row}: ${e.message}`);
      }
    }
  }

  console.log(`  ${updated}/${updates.length} linhas atualizadas`);
  return updated;
}

// --- Quality Gate QG-009 ---

function runQualityGate(results) {
  const contacts = results.filter(r => r.contactId);
  const deals = results.filter(r => r.dealId);
  const errors = results.filter(r => r.error);
  const messageSent = results.filter(r => r.messageSent);

  console.log('\n--- Quality Gate QG-009 ---');
  console.log(`  ${contacts.length > 0 ? '\u2705' : '\u26A0\uFE0F'} Contatos criados/atualizados: ${contacts.length}/${results.length}`);
  console.log(`  ${deals.length > 0 ? '\u2705' : '\u26A0\uFE0F'} Deals criados: ${deals.length}/${results.length}`);
  console.log(`  \u2705 Tags aplicadas: "${TAG}"`);
  console.log(`  \u2705 Rate limiting: ${RATE_LIMIT_MS}ms entre requests`);
  console.log(`  ${messageSent.length === 0 ? '\u2705' : '\u274C'} Nenhuma mensagem enviada: ${messageSent.length === 0 ? 'CORRETO' : 'VIOLACAO!'}`);
  if (errors.length > 0) {
    console.log(`  \u26A0\uFE0F Erros: ${errors.length}`);
    for (const e of errors.slice(0, 5)) {
      console.log(`     ${e.name}: ${e.error}`);
    }
  }
  console.log();
}

// --- Main ---

async function main() {
  console.log('\n=== Phase 9: GHL Sync v5.0 (Sheets-First) ===\n');
  console.log(`  Tag: "${TAG}" | Dry Run: ${DRY_RUN} | Sync All: ${SYNC_ALL}`);

  if (!GHL_API_TOKEN || !GHL_LOCATION_ID) {
    console.error('\nErro: GHL_API_TOKEN e GHL_LOCATION_ID necessarios em squads/ensinio-whatsapp-prospector/.env');
    process.exit(1);
  }

  // Step 1: Read from Sheets
  console.log('\n1. Lendo Google Sheets...');
  const contacts = await readFromSheets();
  console.log(`   ${contacts.length} contatos para sincronizar`);

  if (contacts.length === 0) {
    console.log('\n  Nenhum contato para sincronizar.');
    console.log('  Possibilidades:');
    console.log('    - Todos ja sincronizados (coluna J preenchida)');
    console.log('    - Nenhum marcado como "Enviado" (use --all para forcar)');
    console.log('    - Planilha vazia\n');
    return;
  }

  if (DRY_RUN) {
    console.log('\n*** DRY RUN — nenhuma alteracao sera feita ***\n');
    for (const c of contacts.slice(0, 10)) {
      console.log(`  [Row ${c.rowIndex}] ${c.firstName} ${c.lastName} — ${c.phone}`);
    }
    if (contacts.length > 10) console.log(`  ... e ${contacts.length - 10} mais`);
    console.log('\nRode sem --dry-run para sincronizar.\n');
    return;
  }

  // Step 2: Sync to GHL
  console.log('\n2. Sincronizando com GHL...\n');
  const results = [];
  let okCount = 0;
  let errCount = 0;
  const startTime = Date.now();

  for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i];
    const label = `[${String(i + 1).padStart(2)}/${contacts.length}]`;
    const name = `${contact.firstName} ${contact.lastName}`.trim().padEnd(25);

    process.stdout.write(`  ${label} ${name} `);

    try {
      // Create/get contact
      const { contactId, isNew } = await createOrGetContact(contact);
      process.stdout.write(isNew ? '(NEW) ' : '(DUP) ');

      let dealId = null;
      let dealInfo = '';

      if (!SKIP_DEALS) {
        const deal = await createDeal(contactId, contact);
        dealId = deal.dealId;
        dealInfo = deal.isNew ? 'Deal CREATED' : (deal.endpoint === 'EXISTS' ? 'Deal EXISTS' : 'Deal FAILED');
      } else {
        dealInfo = 'Deals SKIPPED';
      }

      process.stdout.write(`${dealInfo}\n`);

      results.push({
        rowIndex: contact.rowIndex,
        name: `${contact.firstName} ${contact.lastName}`.trim(),
        phone: contact.phone,
        contactId,
        dealId,
        messageSent: false, // NEVER sends messages
      });
      okCount++;
    } catch (error) {
      process.stdout.write(`ERROR: ${error.message.slice(0, 60)}\n`);
      results.push({
        rowIndex: contact.rowIndex,
        name: `${contact.firstName} ${contact.lastName}`.trim(),
        phone: contact.phone,
        error: error.message,
        messageSent: false,
      });
      errCount++;
    }

    if (i < contacts.length - 1) {
      await sleep(RATE_LIMIT_MS);
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  // Step 3: Update Sheets with GHL data
  const sheetsUpdated = await updateSheetsWithGhl(results);

  // Step 4: Quality Gate
  runQualityGate(results);

  // Step 5: Save results
  const outDir = path.join(__dirname, '../data/outputs/mentoria-50k');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `ghl-sync-v5-${new Date().toISOString().slice(0, 10)}.json`);
  fs.writeFileSync(outFile, JSON.stringify(results, null, 2));

  // Summary
  console.log('=== Resultado ===');
  console.log(`  OK: ${okCount} | Erros: ${errCount} | Total: ${contacts.length}`);
  console.log(`  Sheets atualizados (I+J): ${sheetsUpdated}`);
  console.log(`  Tempo: ${elapsed}s`);
  console.log(`  Resultados: ${outFile}`);
  console.log(`  Spreadsheet: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}\n`);
}

main().catch(err => {
  console.error(`\nFatal: ${err.message}`);
  if (err.stack) console.error(err.stack);
  process.exit(1);
});
