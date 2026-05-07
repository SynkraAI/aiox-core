/**
 * Pro Buyer Subcommand Module
 *
 * CLI commands for AIOX Pro buyer validation and management.
 * Consumes aiox-license-server via pro/license/license-api.js.
 *
 * Subcommands (Wave 1 — this file):
 *   aiox pro buyer validate --email <E> [--json]
 *   aiox pro buyer validate-batch --file <F> [--concurrency N] [--json]
 *
 * Subcommands (Wave 2 — depends on POST /api/v1/admin/buyers/register in
 * aiox-license-server; not yet implemented):
 *   aiox pro buyer register --email <E> --name <N> [--cpf <C>] [--yes] [--json]
 *
 * @module cli/commands/pro/buyer
 * @story 123.8 — Cohort Buyer CLI Migration
 * @see docs/architecture/design-cohort-buyer-cli-migration.md
 */

'use strict';

const { Command } = require('commander');
const fs = require('fs');
const path = require('path');

// Dynamic license path resolution — duplicates pattern from pro/index.js so
// buyer.js can be loaded independently. Kept intentionally self-contained.
//
// Resolution order (matches pro/index.js and pro-setup.js):
//   1. Bundled pro/ (framework-dev / npx context with submodule)
//   2. npm canonical scope (@aiox-squads/pro)
//   3. npm legacy scopes (@aiox-fullstack/pro, @aios-fullstack/pro)
//   4. cwd node_modules under either scope
const PRO_PACKAGE_CANONICAL = '@aiox-squads/pro';
const PRO_PACKAGE_FALLBACK = '@aiox-fullstack/pro';
const PRO_PACKAGE_LEGACY = '@aios-fullstack/pro';
const PRO_PACKAGES = [PRO_PACKAGE_CANONICAL, PRO_PACKAGE_FALLBACK, PRO_PACKAGE_LEGACY];

function resolveLicensePath() {
  const relativePath = path.resolve(__dirname, '..', '..', '..', '..', 'pro', 'license');
  if (fs.existsSync(relativePath)) {
    return relativePath;
  }

  // Try canonical first, then fallback scope via require.resolve
  for (const pkgName of PRO_PACKAGES) {
    try {
      const proPkg = require.resolve(`${pkgName}/package.json`);
      const proDir = path.dirname(proPkg);
      const npmPath = path.join(proDir, 'license');
      if (fs.existsSync(npmPath)) {
        return npmPath;
      }
    } catch {
      // package not installed under this scope — try next
    }
  }

  // cwd fallback (when require.resolve doesn't see the package, e.g., npx context)
  for (const pkgName of PRO_PACKAGES) {
    const [scope, pkg] = pkgName.split('/');
    const cwdPath = path.join(process.cwd(), 'node_modules', scope, pkg, 'license');
    if (fs.existsSync(cwdPath)) {
      return cwdPath;
    }
  }

  return relativePath;
}

const licensePath = resolveLicensePath();

function loadClient() {
  try {
    const { licenseApi } = require(path.join(licensePath, 'license-api'));
    return licenseApi;
  } catch (error) {
    console.error('Erro: módulo AIOX Pro license não disponível.');
    console.error(`Instale: npm install ${PRO_PACKAGE_CANONICAL}`);
    console.error(`(ou fallback: npm install ${PRO_PACKAGE_FALLBACK} / ${PRO_PACKAGE_LEGACY})`);
    console.error(`Detalhe: ${error.message}`);
    process.exit(2);
  }
}

/**
 * Email format check — minimal, server-side validates definitively.
 */
function isValidEmail(email) {
  if (typeof email !== 'string' || email.length === 0 || email.length > 254) {
    return false;
  }
  // Simple RFC 5322-lite: no whitespace, one @, dot in domain
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Classify error into exit code and human-friendly message.
 * Exit codes per story 123.8 ACs:
 *   0 success, 1 validation failed (isBuyer: false),
 *   2 transport/server, 3 auth (reserved for Wave 2 register).
 */
function classifyError(err) {
  const code = err && err.code ? err.code : null;

  // Network / transport / server
  if (code === 'NETWORK_ERROR' || code === 'SERVER_ERROR') {
    return {
      exitCode: 2,
      message: 'Falha de rede/servidor. Tente novamente em instantes.',
      hint: 'Para mais detalhes: AIOX_DEBUG=true aiox pro buyer validate ...',
    };
  }
  if (code === 'AUTH_RATE_LIMITED' || code === 'RATE_LIMITED') {
    const retry = err.details && err.details.retryAfter ? ` (retry em ${err.details.retryAfter}s)` : '';
    return {
      exitCode: 2,
      message: `Rate limit atingido${retry}.`,
      hint: 'Aguarde antes de tentar novamente.',
    };
  }

  // Default: unknown / bad request
  return {
    exitCode: 2,
    message: err && err.message ? err.message : 'Erro desconhecido.',
    hint: null,
  };
}

/**
 * Emit result to stdout.
 * @param {object} payload - Shape { email, isBuyer, hasAccount }
 * @param {boolean} asJson - If true, emit JSON only (no decorative text)
 */
function emitValidateResult(payload, asJson) {
  if (asJson) {
    process.stdout.write(`${JSON.stringify(payload)}\n`);
    return;
  }
  const statusIcon = payload.isBuyer ? '✅' : '❌';
  const buyerLabel = payload.isBuyer ? 'Sim' : 'Não';
  const accountLabel = payload.hasAccount ? 'Sim' : 'Não';
  process.stdout.write(
    `\n${statusIcon} ${payload.email}\n` +
    `   Buyer:      ${buyerLabel}\n` +
    `   Account:    ${accountLabel}\n\n`,
  );
}

// ---------------------------------------------------------------------------
// aiox pro buyer validate
// ---------------------------------------------------------------------------

async function validateAction(options) {
  const email = options && options.email;
  const asJson = Boolean(options && options.json);

  if (!isValidEmail(email)) {
    if (asJson) {
      process.stdout.write(`${JSON.stringify({ error: 'INVALID_EMAIL', email })}\n`);
    } else {
      process.stderr.write('Erro: email inválido.\n');
    }
    process.exit(2);
  }

  const client = loadClient();

  try {
    const result = await client.validateBuyer(email);
    emitValidateResult(result, asJson);
    process.exit(result.isBuyer ? 0 : 1);
  } catch (err) {
    const classified = classifyError(err);
    if (asJson) {
      process.stdout.write(`${JSON.stringify({
        error: err && err.code ? err.code : 'UNKNOWN',
        message: classified.message,
        email,
      })}\n`);
    } else {
      process.stderr.write(`\nFalha: ${classified.message}\n`);
      if (classified.hint) {
        process.stderr.write(`${classified.hint}\n`);
      }
    }
    process.exit(classified.exitCode);
  }
}

// ---------------------------------------------------------------------------
// aiox pro buyer validate-batch
// ---------------------------------------------------------------------------

/**
 * Run `worker(item)` over `items` with bounded parallelism.
 * Keeps order of results matching input.
 */
async function mapWithConcurrency(items, concurrency, worker) {
  const results = new Array(items.length);
  let cursor = 0;

  async function next() {
    while (true) {
      const idx = cursor++;
      if (idx >= items.length) return;
      results[idx] = await worker(items[idx], idx);
    }
  }

  const limit = Math.max(1, Math.min(concurrency, items.length));
  const workers = [];
  for (let i = 0; i < limit; i += 1) {
    workers.push(next());
  }
  await Promise.all(workers);
  return results;
}

function parseEmailsFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'));
}

async function validateBatchAction(options) {
  const filePath = options && options.file;
  const asJson = Boolean(options && options.json);
  const concurrencyRaw = options && options.concurrency ? Number(options.concurrency) : 5;
  const concurrency = Math.max(1, Math.min(10, Number.isFinite(concurrencyRaw) ? concurrencyRaw : 5));

  if (!filePath || !fs.existsSync(filePath)) {
    const msg = filePath ? `Arquivo não encontrado: ${filePath}` : 'Erro: --file é obrigatório.';
    if (asJson) {
      process.stdout.write(`${JSON.stringify({ error: 'FILE_NOT_FOUND', file: filePath })}\n`);
    } else {
      process.stderr.write(`${msg}\n`);
    }
    process.exit(2);
  }

  let emails;
  try {
    emails = parseEmailsFile(filePath);
  } catch (err) {
    if (asJson) {
      process.stdout.write(`${JSON.stringify({ error: 'FILE_READ_ERROR', message: err.message })}\n`);
    } else {
      process.stderr.write(`Falha ao ler arquivo: ${err.message}\n`);
    }
    process.exit(2);
  }

  if (emails.length === 0) {
    if (asJson) {
      process.stdout.write('[]\n');
    } else {
      process.stdout.write('Nenhum email no arquivo.\n');
    }
    process.exit(0);
  }

  const client = loadClient();

  const results = await mapWithConcurrency(emails, concurrency, async (email) => {
    if (!isValidEmail(email)) {
      return { email, isBuyer: false, hasAccount: false, error: 'INVALID_EMAIL' };
    }
    try {
      const r = await client.validateBuyer(email);
      return { email: r.email, isBuyer: r.isBuyer, hasAccount: r.hasAccount };
    } catch (err) {
      return {
        email,
        isBuyer: false,
        hasAccount: false,
        error: err && err.code ? err.code : 'UNKNOWN',
      };
    }
  });

  if (asJson) {
    process.stdout.write(`${JSON.stringify(results)}\n`);
  } else {
    for (const r of results) {
      if (r.error) {
        process.stdout.write(`⚠️  ${r.email}  [${r.error}]\n`);
      } else {
        const icon = r.isBuyer ? '✅' : '❌';
        process.stdout.write(`${icon}  ${r.email}  buyer=${r.isBuyer} account=${r.hasAccount}\n`);
      }
    }
    const successes = results.filter((r) => !r.error && r.isBuyer).length;
    process.stdout.write(`\n${successes}/${results.length} buyers.\n`);
  }

  const anyFailure = results.some((r) => r.error || !r.isBuyer);
  process.exit(anyFailure ? 1 : 0);
}

// ---------------------------------------------------------------------------
// aiox pro buyer register — Wave 2 stub (hidden until endpoint exists)
// ---------------------------------------------------------------------------

async function registerAction(options = {}) {
  if (options.json) {
    process.stdout.write(
      JSON.stringify({
        status: 'pending_wave_2',
        message: '`register` pendente (Wave 2 da Story 123.8).',
        reason: 'Endpoint POST /api/v1/admin/buyers/register em aiox-license-server ainda não foi implementado.',
        story: 'docs/stories/epic-123/STORY-123.8-cohort-buyer-cli-migration.md',
      }) + '\n',
    );
  } else {
    process.stderr.write(
      '\nOperação `register` pendente (Wave 2 da Story 123.8).\n' +
      'Depende do endpoint POST /api/v1/admin/buyers/register no repo aiox-license-server,\n' +
      'que ainda não foi implementado.\n\n' +
      'Acompanhe em docs/stories/epic-123/STORY-123.8-cohort-buyer-cli-migration.md\n',
    );
  }
  process.exit(2);
}

// ---------------------------------------------------------------------------
// Command builder
// ---------------------------------------------------------------------------

/**
 * Create the `aiox pro buyer` subcommand group.
 * @returns {Command}
 */
function createBuyerCommand() {
  const cmd = new Command('buyer')
    .description('Validar e gerenciar buyers AIOX Pro (Cohort admin)');

  cmd
    .command('validate')
    .description('Verificar se um email é comprador AIOX Pro')
    .requiredOption('-e, --email <email>', 'Email do buyer a validar')
    .option('--json', 'Emitir saída JSON estável (sem decoração)')
    .action(validateAction);

  cmd
    .command('validate-batch')
    .description('Validar múltiplos emails de um arquivo (bounded concurrency)')
    .requiredOption('-f, --file <path>', 'Arquivo com um email por linha')
    .option('-c, --concurrency <n>', 'Requisições paralelas (default 5, máx 10)', '5')
    .option('--json', 'Emitir saída JSON (array de resultados)')
    .action(validateBatchAction);

  // Wave 2 stub — kept so the CLI surface is stable once endpoint lands.
  cmd
    .command('register')
    .description('Cadastrar novo buyer (pendente Wave 2 — endpoint cross-repo)')
    .option('-e, --email <email>', 'Email do buyer')
    .option('-n, --name <name>', 'Nome do buyer')
    .option('--cpf <cpf>', 'CPF (opcional)')
    .option('-y, --yes', 'Pular confirmação')
    .option('--json', 'Emitir saída JSON')
    .action(registerAction);

  return cmd;
}

module.exports = {
  createBuyerCommand,
  // Exports internos para testes:
  _internal: {
    isValidEmail,
    classifyError,
    parseEmailsFile,
    mapWithConcurrency,
  },
};
