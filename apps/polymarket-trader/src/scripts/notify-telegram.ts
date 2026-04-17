#!/usr/bin/env npx tsx
/**
 * Send a Telegram notification from Claude Remote Agent.
 *
 * Usage: npx tsx src/scripts/notify-telegram.ts --message "Trade executed: ..."
 *   or pipe: echo "message" | npx tsx src/scripts/notify-telegram.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// Load .env
const projectRoot = join(import.meta.dirname, '..', '..');
try {
  const envPath = join(projectRoot, '.env');
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
} catch { /* no .env */ }

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!BOT_TOKEN || !CHAT_ID) {
  console.error(JSON.stringify({ error: 'Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID' }));
  process.exit(1);
}

// Get message from --message arg or stdin
const msgIdx = process.argv.indexOf('--message');
let message = msgIdx !== -1 ? process.argv[msgIdx + 1] : '';

if (!message) {
  // Try to read from stdin (piped input)
  try {
    message = readFileSync('/dev/stdin', 'utf-8').trim();
  } catch {
    console.error(JSON.stringify({ error: 'No message provided. Use --message or pipe input.' }));
    process.exit(1);
  }
}

async function send() {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: message,
      parse_mode: 'Markdown',
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(JSON.stringify({ error: `Telegram API error: ${res.status}`, body }));
    process.exit(1);
  }

  console.log(JSON.stringify({ success: true, message: 'Notification sent' }));
}

send().catch(err => {
  console.error(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
  process.exit(1);
});
