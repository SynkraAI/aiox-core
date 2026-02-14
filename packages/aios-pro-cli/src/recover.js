#!/usr/bin/env node

/**
 * License Recovery Flow
 *
 * Implements OWASP-compliant license key recovery via portal redirect.
 * Decision 3 (D1 Section 4): Portal-first — CLI redirects to web portal.
 *
 * Security:
 *   - Anti-enumeration: identical message for any email input
 *   - No API calls — purely local CLI + browser redirect
 *   - Rate limiting is server-side (3/email/hour) — documented, not enforced here
 */

const readline = require('readline');

const RECOVERY_URL = 'https://pro.synkra.ai/recover';

const RECOVERY_MESSAGE =
  'Se este email estiver associado a uma licenca, voce recebera instrucoes de recuperacao.';

/**
 * Mask email for display: u***@example.com
 * @param {string} email
 * @returns {string}
 */
function maskEmail(email) {
  const atIndex = email.indexOf('@');
  if (atIndex <= 0) {
    return '***';
  }
  return email[0] + '***' + email.slice(atIndex);
}

/**
 * Prompt user for email input via readline
 * @returns {Promise<string>}
 */
function promptEmail() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question('  Enter your email: ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * Open URL in default browser with offline fallback
 * @param {string} url
 * @param {Function} [openFn] - Optional override for testing (defaults to dynamic import of 'open')
 * @returns {Promise<boolean>} true if browser opened, false if fallback
 */
async function openBrowser(url, openFn) {
  try {
    const open = openFn || (await import('open')).default;
    await open(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Main recovery flow
 * @returns {Promise<void>}
 */
async function recoverLicense() {
  console.log('\naios-pro — License Recovery\n');

  const email = await promptEmail();

  if (!email) {
    console.error('\n  Error: Email is required.\n');
    process.exit(1);
  }

  const masked = maskEmail(email);

  // Anti-enumeration: identical message regardless of email validity
  console.log(`\n  ${RECOVERY_MESSAGE}`);
  console.log(`  Email: ${masked}\n`);

  const browserOpened = await openBrowser(RECOVERY_URL);

  if (browserOpened) {
    console.log('  Recovery portal opened in your browser.');
  } else {
    console.log('  Could not open browser automatically.');
  }

  console.log(`  You can also visit: ${RECOVERY_URL}\n`);
}

module.exports = { recoverLicense, maskEmail, promptEmail, openBrowser, RECOVERY_URL, RECOVERY_MESSAGE };
