// preflight/05-env-validate.mjs — checks required env vars present + non-empty.
// Exit 0 = all required env vars set. Read-only.

const REQUIRED = ['DEEPSEEK_API_KEY', 'TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID'];
const verbose = process.argv.includes('--verbose');

function main() {
  const missing = REQUIRED.filter((key) => {
    const v = process.env[key];
    return v === undefined || v === null || String(v).trim() === '';
  });
  if (missing.length > 0) {
    console.error('[preflight 05] Checked: required env vars present + non-empty');
    console.error(`  Expected: ${REQUIRED.join(', ')}. Actual: missing/empty → ${missing.join(', ')}`);
    console.error('  Fix: set the missing vars in your shell or .env file before running migration.');
    process.exit(1);
  }
  if (verbose) console.log(`[preflight 05] OK — all ${REQUIRED.length} required env vars set`);
  process.exit(0);
}

try { main(); }
catch (err) { console.error(`[preflight 05] Script error: ${err.message}`); process.exit(2); }
