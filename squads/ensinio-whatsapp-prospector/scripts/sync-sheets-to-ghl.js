#!/usr/bin/env node
'use strict';

/**
 * Sync Google Sheets leads to GHL (contacts + deals)
 * Reads from the Ensinio prospector spreadsheet, creates contacts and deals.
 *
 * Usage:
 *   node squads/ensinio-whatsapp-prospector/scripts/sync-sheets-to-ghl.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const { readFromSheet } = require('../../../tools/google-sheets-writer');

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
const GHL_PIPELINE_ID = env.GHL_PIPELINE_ID;
const GHL_DEFAULT_STAGE_ID = env.GHL_DEFAULT_STAGE_ID;
const GHL_BASE_URL = env.GHL_BASE_URL || 'https://services.leadconnectorhq.com';

const SPREADSHEET_ID = '124EQQAkmt9D7-49LbR-Jx64DhxdtCwceUQgqolk5ZFI';
const SHEET_RANGE = 'Leads Grupo Mentoria Renan (Fosc)!A2:H78';
const TAG = 'Lead Fosc';
const RATE_LIMIT_MS = 600;
const DRY_RUN = process.argv.includes('--dry-run');

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

// --- Contact creation (with dedup) ---

async function createOrGetContact(lead) {
  try {
    const result = await ghlApi('/contacts/', 'POST', {
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
      // Duplicate — extract contactId and update name
      try {
        const data = JSON.parse(e.body);
        const contactId = data.meta?.contactId || data.contactId;
        if (contactId) {
          // Update contact name if it changed
          await ghlApi(`/contacts/${contactId}`, 'PUT', {
            firstName: lead.firstName,
            lastName: lead.lastName,
          });
          return { contactId, isNew: false };
        }
      } catch {}
    }
    throw e;
  }
}

// --- Deal: check existing, create if missing ---

async function getExistingDeals(contactId) {
  try {
    const result = await ghlApi(`/opportunities/search?location_id=${GHL_LOCATION_ID}&contact_id=${contactId}&pipeline_id=${GHL_PIPELINE_ID}`, 'GET');
    return result.opportunities || [];
  } catch {
    return [];
  }
}

async function createDeal(contactId, lead) {
  // Check if deal already exists
  const existing = await getExistingDeals(contactId);
  if (existing.length > 0) {
    return { dealId: existing[0].id, endpoint: 'EXISTS', isNew: false };
  }

  const dealBody = {
    pipelineId: GHL_PIPELINE_ID,
    pipelineStageId: GHL_DEFAULT_STAGE_ID,
    locationId: GHL_LOCATION_ID,
    contactId: contactId,
    name: `${lead.firstName}${lead.lastName ? ' ' + lead.lastName : ''} - Mentoria 50K`,
    source: 'WhatsApp Prospector',
    status: 'open',
    monetaryValue: 0,
  };

  // Try /opportunities/ first
  try {
    const result = await ghlApi('/opportunities/', 'POST', dealBody);
    return { dealId: result.opportunity?.id || result.id, endpoint: '/opportunities/', isNew: true };
  } catch (e) {
    if (e.status === 404) {
      // Fallback: try /opportunities/upsert
      try {
        const result = await ghlApi('/opportunities/upsert', 'POST', dealBody);
        return { dealId: result.opportunity?.id || result.id, endpoint: '/opportunities/upsert', isNew: true };
      } catch (e2) {
        if (e2.status === 404) {
          return { dealId: null, endpoint: 'FAILED', error: e2.message, isNew: false };
        }
        throw e2;
      }
    }
    throw e;
  }
}

// --- Main ---

async function main() {
  console.log('\n=== GHL Sync: Sheets → Contacts + Deals ===\n');
  if (DRY_RUN) console.log('*** DRY RUN — nenhuma alteração será feita ***\n');

  // Read from Google Sheets
  console.log('Lendo planilha...');
  const rows = await readFromSheet(SPREADSHEET_ID, SHEET_RANGE);
  console.log(`${rows.length} leads encontrados\n`);

  // Parse leads
  const leads = [];
  for (const row of rows) {
    const [firstName, lastName, phone, group, type, description] = row;
    if (!phone || phone === 'VERIFICAR' || phone.startsWith('(')) continue;
    leads.push({
      firstName: firstName || '',
      lastName: lastName || '',
      phone,
      group: group || 'MENTORIA 50K',
      type: type || 'client',
      description: description || '',
    });
  }

  console.log(`${leads.length} leads válidos (${rows.length - leads.length} pulados — sem telefone ou VERIFICAR)\n`);

  if (DRY_RUN) {
    leads.forEach((l, i) => {
      console.log(`  [${String(i + 1).padStart(2)}] ${l.firstName} ${l.lastName} — ${l.phone}`);
    });
    console.log('\n*** DRY RUN completo. Rode sem --dry-run para executar. ***\n');
    return;
  }

  // Sync
  const results = [];
  let ok = 0;
  let errors = 0;
  const startTime = Date.now();

  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i];
    const label = `[${String(i + 1).padStart(2)}/${leads.length}]`;
    const name = `${lead.firstName} ${lead.lastName}`.trim().padEnd(25);

    process.stdout.write(`${label} ${name} `);

    try {
      // Step 1: Contact
      const { contactId, isNew } = await createOrGetContact(lead);
      process.stdout.write(isNew ? '(NEW) ' : '(DUP) ');

      // Step 2: Deal
      const deal = await createDeal(contactId, lead);
      if (deal.dealId && deal.endpoint === 'EXISTS') {
        process.stdout.write('Deal EXISTS\n');
      } else if (deal.dealId) {
        process.stdout.write(`Deal CREATED (${deal.endpoint})\n`);
      } else {
        process.stdout.write('Contact OK, Deal FAILED\n');
      }

      results.push({
        name: `${lead.firstName} ${lead.lastName}`.trim(),
        phone: lead.phone,
        contactId,
        dealId: deal.dealId,
        isNew,
        status: deal.dealId ? 'success' : 'partial',
      });
      ok++;
    } catch (error) {
      process.stdout.write(`ERROR: ${error.message.slice(0, 80)}\n`);
      results.push({
        name: `${lead.firstName} ${lead.lastName}`.trim(),
        phone: lead.phone,
        status: 'error',
        error: error.message,
      });
      errors++;
    }

    if (i < leads.length - 1) {
      await new Promise(r => setTimeout(r, RATE_LIMIT_MS));
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('\n=== Resultado ===');
  console.log(`  OK: ${ok} | Erros: ${errors} | Total: ${leads.length}`);
  console.log(`  Tempo: ${elapsed}s\n`);

  // Save results
  const outDir = path.join(__dirname, '../data/outputs/mentoria-50k');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `ghl-sync-sheets-${new Date().toISOString().slice(0, 10)}.json`);
  fs.writeFileSync(outFile, JSON.stringify(results, null, 2));
  console.log(`  Resultados: ${outFile}\n`);
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
