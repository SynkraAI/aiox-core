#!/usr/bin/env node
'use strict';

/**
 * Google Sheets Writer — CLI utility for writing to Google Sheets
 *
 * Usage:
 *   node tools/google-sheets-writer.js update <spreadsheetId> <range> <json-values>
 *   node tools/google-sheets-writer.js append <spreadsheetId> <range> <json-values>
 *   node tools/google-sheets-writer.js clear  <spreadsheetId> <range>
 *   node tools/google-sheets-writer.js read   <spreadsheetId> <range>
 *
 * Examples:
 *   node tools/google-sheets-writer.js update SHEET_ID 'A1:B2' '[["Name","Phone"],["John","+5511999"]]'
 *   node tools/google-sheets-writer.js append SHEET_ID 'Sheet1!A:B' '[["New Row","Data"]]'
 *   node tools/google-sheets-writer.js clear  SHEET_ID 'A1:Z100'
 *   node tools/google-sheets-writer.js read   SHEET_ID 'A1:B10'
 *
 * Environment variables (optional — falls back to MCP credentials):
 *   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN
 *
 * Or reads from ~/.claude.json MCP config automatically.
 */

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

// --- Credential resolution ---

function getCredentials() {
  // 1. Try environment variables
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN) {
    return {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    };
  }

  // 2. Try .env in squad
  const envFiles = [
    path.join(__dirname, '../squads/ensinio-whatsapp-prospector/.env'),
    path.join(__dirname, '../.env'),
  ];

  for (const envFile of envFiles) {
    if (fs.existsSync(envFile)) {
      const content = fs.readFileSync(envFile, 'utf-8');
      const vars = {};
      for (const line of content.split('\n')) {
        const match = line.match(/^([A-Z_]+)=(.+)$/);
        if (match) vars[match[1]] = match[2].trim();
      }
      if (vars.GOOGLE_CLIENT_ID && vars.GOOGLE_CLIENT_SECRET && vars.GOOGLE_REFRESH_TOKEN) {
        return {
          clientId: vars.GOOGLE_CLIENT_ID,
          clientSecret: vars.GOOGLE_CLIENT_SECRET,
          refreshToken: vars.GOOGLE_REFRESH_TOKEN,
        };
      }
    }
  }

  // 3. Try ~/.claude.json MCP config (global + per-project)
  const claudeJsonPath = path.join(require('os').homedir(), '.claude.json');
  if (fs.existsSync(claudeJsonPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(claudeJsonPath, 'utf-8'));

      // Search all possible locations for google-workspace MCP config
      const locations = [
        config.mcpServers?.['google-workspace']?.env,
        ...Object.values(config.projects || {}).map(p => p.mcpServers?.['google-workspace']?.env),
      ].filter(Boolean);

      for (const env of locations) {
        const clientId = env.GOOGLE_OAUTH_CLIENT_ID || env.GOOGLE_CLIENT_ID;
        const clientSecret = env.GOOGLE_OAUTH_CLIENT_SECRET || env.GOOGLE_CLIENT_SECRET;
        const refreshToken = env.GOOGLE_OAUTH_REFRESH_TOKEN || env.GOOGLE_REFRESH_TOKEN;
        if (clientId && clientSecret && refreshToken) {
          return { clientId, clientSecret, refreshToken };
        }
      }
    } catch (e) {
      // ignore parse errors
    }
  }

  // 4. Try @presto-ai/google-workspace-mcp credentials cache
  const mcpCredDir = path.join(require('os').homedir(), '.config', 'google-workspace-mcp');
  const credFiles = ['credentials.json', 'tokens.json'];
  for (const file of credFiles) {
    const credPath = path.join(mcpCredDir, file);
    if (fs.existsSync(credPath)) {
      try {
        const creds = JSON.parse(fs.readFileSync(credPath, 'utf-8'));
        if (creds.refresh_token && creds.client_id && creds.client_secret) {
          return {
            clientId: creds.client_id,
            clientSecret: creds.client_secret,
            refreshToken: creds.refresh_token,
          };
        }
      } catch (e) {
        // ignore
      }
    }
  }

  return null;
}

function createAuth() {
  const creds = getCredentials();
  if (!creds) {
    console.error('Error: No Google credentials found.');
    console.error('Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN');
    console.error('Or configure google-workspace MCP in ~/.claude.json');
    process.exit(1);
  }

  const oauth2Client = new google.auth.OAuth2(creds.clientId, creds.clientSecret);
  if (creds.refreshToken) {
    oauth2Client.setCredentials({ refresh_token: creds.refreshToken });
  }
  return oauth2Client;
}

// --- Commands ---

async function cmdUpdate(sheets, spreadsheetId, range, values) {
  const result = await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values },
  });
  console.log(JSON.stringify({
    ok: true,
    action: 'update',
    updatedCells: result.data.updatedCells,
    updatedRange: result.data.updatedRange,
  }));
}

async function cmdAppend(sheets, spreadsheetId, range, values) {
  const result = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values },
  });
  console.log(JSON.stringify({
    ok: true,
    action: 'append',
    updatedCells: result.data.updates?.updatedCells,
    updatedRange: result.data.updates?.updatedRange,
  }));
}

async function cmdClear(sheets, spreadsheetId, range) {
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range,
  });
  console.log(JSON.stringify({
    ok: true,
    action: 'clear',
    clearedRange: range,
  }));
}

async function cmdRead(sheets, spreadsheetId, range) {
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });
  console.log(JSON.stringify({
    ok: true,
    action: 'read',
    range: result.data.range,
    values: result.data.values || [],
  }));
}

// --- Programmatic API ---

async function createSheetsClient() {
  const auth = createAuth();
  return google.sheets({ version: 'v4', auth });
}

async function writeToSheet(spreadsheetId, range, values, options = {}) {
  const sheets = await createSheetsClient();
  const method = options.append ? 'append' : 'update';

  if (method === 'append') {
    const result = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: options.raw ? 'RAW' : 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values },
    });
    return {
      ok: true,
      updatedCells: result.data.updates?.updatedCells,
      updatedRange: result.data.updates?.updatedRange,
    };
  }

  const result = await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: options.raw ? 'RAW' : 'USER_ENTERED',
    requestBody: { values },
  });
  return {
    ok: true,
    updatedCells: result.data.updatedCells,
    updatedRange: result.data.updatedRange,
  };
}

async function readFromSheet(spreadsheetId, range) {
  const sheets = await createSheetsClient();
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });
  return result.data.values || [];
}

async function clearSheet(spreadsheetId, range) {
  const sheets = await createSheetsClient();
  await sheets.spreadsheets.values.clear({ spreadsheetId, range });
  return { ok: true, clearedRange: range };
}

// --- Main ---

async function main() {
  const [,, command, spreadsheetId, range, jsonValues] = process.argv;

  if (!command || !spreadsheetId) {
    console.error('Usage: google-sheets-writer.js <update|append|clear|read> <spreadsheetId> <range> [json-values]');
    process.exit(1);
  }

  const auth = createAuth();
  const sheets = google.sheets({ version: 'v4', auth });

  try {
    switch (command) {
      case 'update': {
        if (!range || !jsonValues) {
          console.error('update requires <range> and <json-values>');
          process.exit(1);
        }
        const values = JSON.parse(jsonValues);
        await cmdUpdate(sheets, spreadsheetId, range, values);
        break;
      }
      case 'append': {
        if (!range || !jsonValues) {
          console.error('append requires <range> and <json-values>');
          process.exit(1);
        }
        const values = JSON.parse(jsonValues);
        await cmdAppend(sheets, spreadsheetId, range, values);
        break;
      }
      case 'clear':
        if (!range) {
          console.error('clear requires <range>');
          process.exit(1);
        }
        await cmdClear(sheets, spreadsheetId, range);
        break;
      case 'read':
        if (!range) {
          console.error('read requires <range>');
          process.exit(1);
        }
        await cmdRead(sheets, spreadsheetId, range);
        break;
      default:
        console.error(`Unknown command: ${command}. Use update, append, clear, or read.`);
        process.exit(1);
    }
  } catch (error) {
    console.error(JSON.stringify({
      ok: false,
      error: error.message,
      status: error.response?.status,
      details: error.response?.data?.error?.message,
    }));
    process.exit(1);
  }
}

// Export for programmatic use
module.exports = { writeToSheet, readFromSheet, clearSheet, createSheetsClient };

// Run CLI if called directly
if (require.main === module) {
  main();
}
