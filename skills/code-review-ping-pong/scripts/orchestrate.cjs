#!/usr/bin/env node
'use strict';

/**
 * Code Review Ping-Pong — Autonomous Orchestrator
 *
 * Runs the full ping-pong cycle automatically:
 *   Codex (REVIEW) → Claude Code (FIX) → [Gemini (AUDIT)] → loop until PERFECT
 *
 * Usage:
 *   node orchestrate.cjs                    — Run with defaults (session.md scope)
 *   node orchestrate.cjs --max-rounds 5     — Limit to 5 rounds
 *   node orchestrate.cjs --with-audit       — Include Gemini audit after each fix
 *   node orchestrate.cjs --audit-every 2   — Gemini audit every 2 fixes
 *   node orchestrate.cjs --dry-run          — Show commands without executing
 *   node orchestrate.cjs --start-from fix   — Resume from FIX mode (skip first review)
 *   node orchestrate.cjs --codex-model o4-mini  — Use a cheaper model for Codex reviews
 *   node orchestrate.cjs --session engine   — Use session-engine.md as scope
 *   node orchestrate.cjs --pipeline         — Run ALL sessions sequentially
 *   node orchestrate.cjs --no-stall-check   — Disable stall detection
 *   node orchestrate.cjs --no-archive       — Don't auto-archive on PERFECT
 *   node orchestrate.cjs --cwd /path/to/project — Run in a different directory
 *
 * Prerequisites:
 *   - claude, codex, gemini CLIs installed and authenticated
 *   - .code-review-ping-pong/session.md exists with scope defined
 */

const { execFileSync, execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ─── Config ──────────────────────────────────────────────────────────────────

const DEFAULTS = {
  maxRounds: 15,
  withAudit: false,
  auditEvery: 1,
  dryRun: false,
  startFrom: 'review',
  codexModel: null,
  claudeModel: null,
  reviewer: 'codex',       // 'codex' | 'claude' | 'gemini' — who does reviews
  fixer: 'claude',         // 'codex' | 'claude' | 'gemini' — who does fixes
  reviewEscalation: null,
  fixEscalation: null,
  session: null,
  pipeline: false,
  noStallCheck: false,
  noArchive: false,
  cwd: process.cwd(),
  timeout: 10 * 60 * 1000,
};

const CLI = {
  claude: 'claude',
  codex: 'codex',
  gemini: 'gemini',
};

const FLAGS = {
  claude: ['--print', '--dangerously-skip-permissions'],
  codex: ['exec', '--dangerously-bypass-approvals-and-sandbox'],
  gemini: ['--prompt', '--approval-mode', 'yolo'],
};

// ─── Colors ──────────────────────────────────────────────────────────────────

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(color, icon, msg) {
  console.log(`${color}${icon}${c.reset} ${msg}`);
}

function banner(msg) {
  const line = '━'.repeat(60);
  console.log(`\n${c.cyan}${line}${c.reset}`);
  console.log(`${c.cyan}${c.bold}  ${msg}${c.reset}`);
  console.log(`${c.cyan}${line}${c.reset}\n`);
}

// ─── YAML Parsing ────────────────────────────────────────────────────────────

function parseFrontmatter(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf-8');
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const result = {};
  const lines = match[1].split('\n');
  for (const line of lines) {
    const kv = line.match(/^(\w[\w_]*):\s*(.*)$/);
    if (kv) {
      let val = kv[2].replace(/^["']|["']$/g, '').trim();
      if (/^\d+$/.test(val)) val = Number(val);
      result[kv[1]] = val;
    }
  }
  return result;
}

// ─── Model Escalation ────────────────────────────────────────────────────────

/**
 * Parse escalation string like "o4-mini<8,gpt-4o" into tiers.
 * Format: "model1<threshold1,model2<threshold2,modelN"
 * The last model has no threshold (used for all scores >= last threshold).
 * Returns sorted array of { model, maxScore } where maxScore is exclusive.
 */
function parseEscalation(str) {
  if (!str) return null;
  const tiers = [];
  const parts = str.split(',').map(s => s.trim());
  for (const part of parts) {
    const match = part.match(/^(.+)<(\d+)$/);
    if (match) {
      tiers.push({ model: match[1].trim(), maxScore: Number(match[2]) });
    } else {
      tiers.push({ model: part.trim(), maxScore: Infinity });
    }
  }
  return tiers.sort((a, b) => a.maxScore - b.maxScore);
}

/**
 * Given the current score and escalation tiers, return the model to use.
 * Score 0 (first round) uses the cheapest tier.
 */
function resolveModel(tiers, currentScore) {
  if (!tiers || tiers.length === 0) return null;
  for (const tier of tiers) {
    if (currentScore < tier.maxScore) return tier.model;
  }
  return tiers[tiers.length - 1].model;
}

// ─── Round Detection ─────────────────────────────────────────────────────────

function getPingPongDir(cwd) {
  return path.join(cwd, '.code-review-ping-pong');
}

function getLatestRound(ppDir) {
  if (!fs.existsSync(ppDir)) return 0;
  const files = fs.readdirSync(ppDir).filter(f => /^round-\d+\.md$/.test(f));
  if (files.length === 0) return 0;
  const numbers = files.map(f => Number(f.match(/round-(\d+)\.md/)[1]));
  return Math.max(...numbers);
}

function getNextStep(ppDir) {
  const nsPath = path.join(ppDir, 'next-step.md');
  if (!fs.existsSync(nsPath)) return null;
  const content = fs.readFileSync(nsPath, 'utf-8');
  const result = {};
  const patterns = {
    current_mode: /current_mode:\s*(\S+)/,
    cycle_state: /cycle_state:\s*(\S+)/,
    next_agent: /next_agent:\s*(.+)/,
    next_mode: /next_mode:\s*(.+)/,
    current_round: /current_round:\s*(\d+)/,
  };
  for (const [key, regex] of Object.entries(patterns)) {
    const m = content.match(regex);
    if (m) result[key] = m[1].trim();
  }
  return result;
}

function roundFileExists(ppDir, round, type) {
  const suffix = type === 'review' ? '' : `-${type}`;
  return fs.existsSync(path.join(ppDir, `round-${round}${suffix}.md`));
}

// ─── Prompt Builders ─────────────────────────────────────────────────────────

function buildReviewPrompt(ppDir, round, cwd, recurringTopics) {
  const prevFixed = round > 1 ? `round-${round - 1}-fixed.md` : null;

  let prompt = `Ative a skill code-review-ping-pong em modo REVIEW.

Contexto:
- Projeto: ${path.basename(cwd)}
- Diretório de rounds: .code-review-ping-pong/
- Escopo: session.md
- Branch: ${getBranch(cwd)}`;

  if (prevFixed) {
    prompt += `\n- Artefato anterior: ${prevFixed}
- Round anterior: ${prevFixed}`;
  }

  prompt += `\n\nLeia session.md para o escopo${prevFixed ? ` e ${prevFixed} para entender o que foi corrigido` : ''}. Revise o código atual e gere .code-review-ping-pong/round-${round}.md.`;

  // [Improvement 4] Inject recurring topic warnings
  if (recurringTopics && recurringTopics.length > 0) {
    const topicList = recurringTopics.map(t => `"${t.topic}" (visto em ${t.timesSeen} rounds)`).join(', ');
    prompt += `\n\nATENÇÃO — Tópicos recorrentes detectados (apareceram em 3+ rounds): ${topicList}.
Se qualquer um destes tópicos aparecer novamente, marque como REGRESSION no severity.`;
  }

  return prompt;
}

function buildFixPrompt(ppDir, round, cwd) {
  const branch = getBranch(cwd);
  const commitSha = (() => {
    try { return execSync('git rev-parse HEAD', { cwd, encoding: 'utf-8' }).trim(); } catch { return 'unknown'; }
  })();

  return `Ative a skill code-review-ping-pong em modo FIX.

Contexto:
- Projeto: ${path.basename(cwd)}
- Diretório de rounds: .code-review-ping-pong/
- Artefato anterior: round-${round}.md
- Escopo: session.md
- Branch: ${branch}
- Commit SHA atual: ${commitSha}

Leia round-${round}.md para entender os findings, aplique as correções no código atual e gere .code-review-ping-pong/round-${round}-fixed.md.

IMPORTANTE — O arquivo round-${round}-fixed.md DEVE passar no validate.cjs. Formato obrigatório do frontmatter YAML:

\`\`\`yaml
---
protocol: code-review-ping-pong
type: fix
round: ${round}
date: "YYYY-MM-DD"
fixer: "nome do agente"
review_file: round-${round}.md
commit_sha_before: "${commitSha}"
commit_sha_after: "sha após fixes"
branch: ${branch}
issues_fixed: N      # contagem de fixes com status FIXED
issues_skipped: N    # contagem de fixes com status SKIPPED
issues_total: N      # total = fixed + skipped (deve bater com array fixes)
git_diff_stat: "X files changed, Y insertions(+), Z deletions(-)"
quality_checks:
  lint: pass|fail|skipped
  typecheck: pass|fail|skipped
  tests: pass|fail|skipped
fixes:
  - id: "X.Y"
    status: FIXED|SKIPPED
    file: "caminho/do/arquivo"
    description: "o que foi feito"
    deviation: "none"
preserved:
  - "arquivo — razão"
---
\`\`\`

Após o frontmatter, o Markdown DEVE conter uma seção para CADA fix:
- Para FIXED: \`### Fix for Issue X.Y\` com detalhes
- Para SKIPPED: \`**Issue X.Y** — razão do skip\` na seção Skipped Issues

O número de entradas no Markdown deve bater EXATAMENTE com o array fixes no YAML.

REGRA ANTI-WHACK-A-MOLE (OBRIGATÓRIO):
Para CADA issue encontrada, antes de corrigir, faça grep/busca por o MESMO padrão de bug em TODOS os arquivos do escopo (session.md).
Se o mesmo padrão existir em outros arquivos, corrija TODOS de uma vez — não apenas o arquivo citado na issue.
Exemplo: se uma issue diz "fetch sem res.ok em leads-table.tsx", procure TODOS os fetches sem res.ok no escopo e corrija todos.
Se o padrão se repete em 5+ arquivos, considere criar uma abstração compartilhada (hook, utility) em vez de copiar o fix.
Documente os arquivos extras corrigidos na descrição do fix.

REGRA DE PROPAGAÇÃO SEMÂNTICA (OBRIGATÓRIO):
O grep textual NÃO é suficiente para issues conceituais. Para CADA issue, pergunte-se:
"Qual é o CONTRATO que está quebrado aqui? Quais OUTROS módulos participam desse mesmo contrato?"
Exemplo: se a issue diz "status unused não é tratado no xp-system", NÃO basta grep por "unused".
Você deve listar TODOS os módulos que iteram items ou calculam stats e verificar se CADA UM trata unused corretamente.
O problema não é "onde a palavra unused aparece", mas "onde a palavra unused DEVERIA aparecer e não aparece".
Documente a análise de propagação semântica na descrição do fix.`;
}

function buildAuditPrompt(ppDir, round, cwd) {
  const branch = getBranch(cwd);
  const commitSha = (() => {
    try { return execSync('git rev-parse --short HEAD', { cwd, encoding: 'utf-8' }).trim(); } catch { return 'unknown'; }
  })();

  const roundsList = [];
  for (let i = 1; i <= round; i++) roundsList.push(`"${i}"`);

  return `Ative a skill code-review-ping-pong em modo AUDIT.

Contexto:
- Projeto: ${path.basename(cwd)}
- Diretório de rounds: .code-review-ping-pong/
- Artefato anterior: round-${round}-fixed.md
- Escopo: session.md
- Branch: ${branch}
- Commit SHA atual: ${commitSha}

Leia TODOS os rounds anteriores (.code-review-ping-pong/round-*.md) e gere .code-review-ping-pong/round-${round}-audit.md com análise cross-cutting.

IMPORTANTE — O arquivo round-${round}-audit.md DEVE passar no validate.cjs. Formato obrigatório do frontmatter YAML:

\`\`\`yaml
---
protocol: code-review-ping-pong
type: audit
round: ${round}
date: "YYYY-MM-DD"
auditor: "Gemini CLI"
commit_sha: "${commitSha}"
branch: ${branch}
rounds_reviewed:
${roundsList.map(r => `  - ${r}`).join('\n')}
files_in_scope:
  - "caminho/do/arquivo1"
  - "caminho/do/arquivo2"
process_health: N    # 1-10, saúde geral do processo de review
new_issues:          # issues que NENHUM round anterior pegou (use [] se nenhuma)
  - id: "A${round}.1"
    severity: "CRITICAL|HIGH|MEDIUM|LOW"
    title: "título curto"
    file: "caminho/do/arquivo"
    line: N
    suggestion: "sugestão de fix"
    missed_by: "review|fix|both"
findings:            # padrões observados no processo
  - type: "recurring_issue|fix_quality|regression_missed|architecture_gap|blind_spot|review_drift"
    title: "título"
    detail: "resumo"
    rounds_affected: "1,2,3"
---
\`\`\`

REGRAS:
- IDs de new_issues DEVEM começar com "A" (ex: A${round}.1)
- files_in_scope DEVE ser array não-vazio (leia session.md para a lista)
- rounds_reviewed DEVE listar todos os rounds analisados
- Para cada issue no YAML, DEVE existir \`#### Issue A${round}.X\` correspondente no Markdown
- Se não encontrou issues novas, use \`new_issues: []\``;
}

function getBranch(cwd) {
  try {
    return execSync('git branch --show-current', { cwd, encoding: 'utf-8' }).trim();
  } catch {
    return 'unknown';
  }
}

// ─── OpenAI API Direct Call ───────────────────────────────────────────────────

function getOpenAIApiKey() {
  // Try env var first, then config.toml
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY;
  const configPath = path.join(require('os').homedir(), '.codex', 'config.toml');
  if (fs.existsSync(configPath)) {
    const content = fs.readFileSync(configPath, 'utf-8');
    const match = content.match(/api_key\s*=\s*"([^"]+)"/);
    if (match) return match[1];
  }
  return null;
}

function readScopeFiles(cwd, ppDir) {
  const sessionPath = path.join(ppDir, 'session.md');
  if (!fs.existsSync(sessionPath)) return '';

  const sessionContent = fs.readFileSync(sessionPath, 'utf-8');
  // Extract file list from session.md
  const filesMatch = sessionContent.match(/## Scope[\s\S]*?- files:\n([\s\S]*?)(?=\n##|\n*$)/);
  if (!filesMatch) return '';

  const files = filesMatch[1]
    .split('\n')
    .map(l => l.replace(/^\s*-\s*/, '').trim())
    .filter(l => l && !l.startsWith('#'));

  let context = '';
  const MAX_CHARS_PER_FILE = 12000; // ~3k tokens per file, keeps total under 25k tokens
  for (const file of files) {
    const filePath = path.join(cwd, file);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf-8');
      if (content.length > MAX_CHARS_PER_FILE) {
        content = content.slice(0, MAX_CHARS_PER_FILE) + `\n\n[... TRUNCATED — file has ${Math.round(content.length / 1000)}k chars, showing first ${Math.round(MAX_CHARS_PER_FILE / 1000)}k ...]`;
      }
      context += `\n--- FILE: ${file} ---\n${content}\n`;
    }
  }
  return context;
}

function runOpenAIApi(prompt, opts) {
  const { cwd, timeout, dryRun } = opts;
  const apiKey = getOpenAIApiKey();

  if (!apiKey) {
    log(c.red, '✗', 'OpenAI API key não encontrada. Configure OPENAI_API_KEY ou ~/.codex/config.toml api_key.');
    return { success: false, output: '', error: 'No API key', duration_ms: 0 };
  }

  // Resolve model from escalation or config
  const model = opts.codexModel || 'gpt-4o-mini';

  if (dryRun) {
    log(c.yellow, '🏃', `[DRY-RUN] OpenAI API call: model=${model}, prompt=${prompt.length} chars`);
    return { success: true, output: '[dry-run]', duration_ms: 0 };
  }

  log(c.blue, '▶', `Running openai-api (${model})...`);

  const ppDir = getPingPongDir(cwd);
  const scopeContent = readScopeFiles(cwd, ppDir);

  // Read previous rounds for context
  let roundsContext = '';
  const roundFiles = fs.readdirSync(ppDir)
    .filter(f => /^round-\d+(-fixed)?\.md$/.test(f))
    .sort();
  for (const f of roundFiles.slice(-2)) { // Last 2 round files for context (save tokens)
    let content = fs.readFileSync(path.join(ppDir, f), 'utf-8');
    if (content.length > 4000) content = content.slice(0, 4000) + '\n[...TRUNCATED...]';
    roundsContext += `\n--- ${f} ---\n${content}\n`;
  }

  const today = new Date().toISOString().slice(0, 10);
  const branch = getBranch(cwd);
  const roundNum = prompt.match(/round-(\d+)\.md/)?.[1] || '1';

  // Extract file list from session for the template
  const sessionRaw = fs.readFileSync(path.join(ppDir, 'session.md'), 'utf-8');
  const filesSection = sessionRaw.match(/- files:\n([\s\S]*?)(?=\n##|\n*$)/);
  const scopeFilesList = filesSection
    ? filesSection[1].split('\n').map(l => l.replace(/^\s*-\s*/, '').trim()).filter(Boolean)
    : ['SKILL.md'];
  const filesInScopeYaml = scopeFilesList.map(f => `  - "${f}"`).join('\n');

  const systemPrompt = `You are an expert code/documentation reviewer for the code-review-ping-pong protocol. You produce structured review files with YAML frontmatter and Markdown.

CRITICAL FORMAT RULES — the output MUST pass a strict validator:

1. Output ONLY the round file content. No preamble, no explanation. Start with \`---\` on line 1.
2. Use this EXACT date: "${today}"
3. Use this EXACT branch: "${branch}"
4. The round number is: ${roundNum}
5. Each issue in the YAML \`issues:\` array MUST have: id, severity, title, file, line, suggestion
6. The Markdown body MUST use \`#### Issue {id} — {title}\` headers (four #, space, "Issue", space, id, space, em-dash, space, title)
7. Each YAML issue MUST have a matching Markdown header. Count must match exactly.
8. \`line\` field must be a real line range like "45-52", not "1-1"
9. \`score\` must be a bare number (not quoted), 1-10
10. \`verdict\` must be "CONTINUE" (score < 10) or "PERFECT" (score = 10)

YAML FRONTMATTER TEMPLATE (copy exactly, fill values):
\`\`\`
---
protocol: code-review-ping-pong
type: review
round: ${roundNum}
date: "${today}"
reviewer: "OpenAI ${model}"
commit_sha: "unknown"
branch: "${branch}"
files_in_scope:
${filesInScopeYaml}
score: 8
verdict: "CONTINUE"
issues:
  - id: "${roundNum}.1"
    severity: "HIGH"
    title: "Short descriptive title"
    file: "engine/guide.md"
    line: "45-52"
    suggestion: "What to fix"
---
\`\`\`

MARKDOWN BODY TEMPLATE (after the closing ---):
\`\`\`
# Code Ping-Pong — Round ${roundNum} Review

## 🎯 Score: N/10 — VERDICT

## Issues

### 🟠 HIGH

#### Issue ${roundNum}.1 — Short descriptive title
- **File:** \\\`engine/guide.md\\\`
- **Line:** 45-52
- **Problem:** Detailed description of what is wrong
- **Suggestion:** How to fix it

### 🟡 MEDIUM

#### Issue ${roundNum}.2 — Another title
...

## ✅ What Is Good
- List things that are well-implemented

## 📊 Summary
- **Total issues:** N
- **By severity:** 🔴 0 CRITICAL, 🟠 N HIGH, 🟡 N MEDIUM, 🟢 N LOW
\`\`\`

SCORING GUIDE:
- 4-6: Multiple real issues — broken logic, contract violations, missing edge cases that cause incorrect behavior
- 7-8: Minor real issues — small logic gaps, missing fallbacks that could fail at runtime
- 9: Only cosmetic or "nice to have" items — no functional impact
- 10: PERFECT — no issues that affect correctness, completeness, or runtime behavior

CRITICAL SCORING RULES:
- ONLY report issues that affect CORRECTNESS or RUNTIME BEHAVIOR. A module that works correctly gets 10/10.
- Do NOT report "could be clearer" or "cross-reference missing" or "documentation could mention X" as issues. These are SUGGESTIONS, not issues.
- Do NOT report the same issue topic that appeared in previous rounds (check the PREVIOUS ROUNDS context). If a topic was already fixed, do not invent a variant.
- If the only things you find are documentation polish, wording suggestions, or "add a comment here" — the score is 10/10 PERFECT.
- Ask yourself: "If an LLM executes these instructions as-is, will it produce WRONG results?" If no → not an issue.

Be thorough but precise. Reference specific line numbers. Focus on cross-module contract consistency.`;

  const userMessage = `${prompt}

--- SESSION SCOPE ---
${fs.readFileSync(path.join(ppDir, 'session.md'), 'utf-8')}

--- FILES IN SCOPE ---
${scopeContent}

${roundsContext ? `--- PREVIOUS ROUNDS (for context) ---\n${roundsContext}` : ''}`;

  const body = JSON.stringify({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.3,
    max_tokens: 8000,
  });

  const roundStart = Date.now();
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = spawnSync('curl', [
        '-s', '-S', '-w', '\n__HTTP_STATUS__%{http_code}',
        '-X', 'POST',
        'https://api.openai.com/v1/chat/completions',
        '-H', 'Content-Type: application/json',
        '-H', `Authorization: Bearer ${apiKey}`,
        '-d', body,
      ], {
        timeout: timeout || 120000,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      const duration_ms = Date.now() - roundStart;
      const rawOutput = result.stdout || '';
      const statusMatch = rawOutput.match(/__HTTP_STATUS__(\d+)/);
      const httpStatus = statusMatch ? Number(statusMatch[1]) : 0;
      const jsonBody = rawOutput.replace(/__HTTP_STATUS__\d+/, '').trim();

      // Rate limit — retry with backoff
      if (httpStatus === 429) {
        const waitSec = attempt * 15;
        log(c.yellow, '⏳', `Rate limit (429). Retry ${attempt}/${maxRetries} em ${waitSec}s...`);
        if (attempt < maxRetries) {
          spawnSync('sleep', [String(waitSec)]);
          continue;
        }
        log(c.red, '✗', 'Rate limit persistente após 3 tentativas.');
        return { success: false, output: '', error: 'Rate limit 429', duration_ms };
      }

      if (result.status !== 0 || httpStatus >= 400) {
        const stderr = (result.stderr || '').slice(-500);
        log(c.red, '✗', `OpenAI API error (HTTP ${httpStatus})`);
        if (stderr) console.log(`${c.dim}  ${stderr}${c.reset}`);
        return { success: false, output: '', error: stderr || `HTTP ${httpStatus}`, duration_ms };
      }

      let response;
      try { response = JSON.parse(jsonBody); } catch {
        log(c.red, '✗', 'OpenAI API: resposta não é JSON válido');
        return { success: false, output: '', error: 'Invalid JSON response', duration_ms };
      }

      if (response.error) {
        log(c.red, '✗', `OpenAI API: ${response.error.message}`);
        return { success: false, output: '', error: response.error.message, duration_ms };
      }

    let content = response.choices?.[0]?.message?.content || '';
    // Strip code fences if the model wrapped the output
    content = content.replace(/^```[\w]*\n?/, '').replace(/\n?```\s*$/, '').trim();
    const usage = response.usage;
    if (usage) {
      const cost = estimateCost(model, usage.prompt_tokens, usage.completion_tokens);
      log(c.dim, '💰', `Tokens: ${usage.prompt_tokens} in / ${usage.completion_tokens} out (~$${cost.toFixed(4)})`);
    }

    // Write the round file — the API returns the content directly
    const roundMatch = prompt.match(/round-(\d+)\.md/);
    if (roundMatch) {
      const roundNum = roundMatch[1];
      const roundPath = path.join(ppDir, `round-${roundNum}.md`);
      fs.writeFileSync(roundPath, content);
      log(c.green, '✓', `round-${roundNum}.md escrito via OpenAI API`);
    }

    return { success: true, output: content, duration_ms };
    } catch (err) {
      const duration_ms = Date.now() - roundStart;
      log(c.red, '✗', `OpenAI API error: ${err.message}`);
      return { success: false, output: '', error: err.message, duration_ms };
    }
  } // end retry loop
  return { success: false, output: '', error: 'Max retries exceeded', duration_ms: Date.now() - roundStart };
}

function estimateCost(model, inputTokens, outputTokens) {
  const pricing = {
    'gpt-4o-mini': { input: 0.15, output: 0.60 },
    'gpt-4o': { input: 2.50, output: 10.00 },
    'gpt-4.1-mini': { input: 0.40, output: 1.60 },
    'gpt-4.1': { input: 2.00, output: 8.00 },
    'o4-mini': { input: 1.10, output: 4.40 },
    'o3': { input: 2.00, output: 8.00 },
  };
  const p = pricing[model] || { input: 2.50, output: 10.00 };
  return (inputTokens * p.input + outputTokens * p.output) / 1_000_000;
}

// ─── CLI Execution ───────────────────────────────────────────────────────────

function buildCliCommand(agent, prompt, opts) {
  if (agent === 'claude') {
    const claudeArgs = [...FLAGS.claude];
    if (opts?.claudeModel) claudeArgs.push('--model', opts.claudeModel);
    claudeArgs.push(prompt);
    return { command: CLI.claude, args: claudeArgs };
  }

  if (agent === 'codex') {
    const codexArgs = [...FLAGS.codex];
    if (opts?.codexModel) codexArgs.push('--model', opts.codexModel);
    codexArgs.push(prompt);
    return { command: CLI.codex, args: codexArgs };
  }

  if (agent === 'gemini') {
    return { command: CLI.gemini, args: ['--prompt', prompt, ...FLAGS.gemini.slice(1)] };
  }

  throw new Error(`Unsupported agent: ${agent}`);
}

// [Improvement 1] runCli now returns duration_ms
function runCli(agent, prompt, opts) {
  // OpenAI API direct call — bypass CLI entirely
  if (agent === 'openai-api') return runOpenAIApi(prompt, opts);

  const { cwd, timeout, dryRun } = opts;
  const { command, args } = buildCliCommand(agent, prompt, opts);

  if (dryRun) {
    log(c.yellow, '🏃', '[DRY-RUN] Would execute:');
    console.log(`${c.dim}  ${shellQuote([command, ...args])}${c.reset}\n`);
    return { success: true, output: '[dry-run]', duration_ms: 0 };
  }

  log(c.blue, '▶', `Running ${agent}...`);
  console.log(`${c.dim}  Timeout: ${Math.floor(timeout / 1000)}s${c.reset}`);

  const roundStart = Date.now();
  try {
    const result = spawnSync(command, args, {
      cwd,
      timeout,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, TERM: 'dumb', NO_COLOR: '1' },
    });

    const duration_ms = Date.now() - roundStart;

    if (result.status !== 0) {
      const stderr = (result.stderr || '').slice(-500);
      log(c.red, '✗', `${agent} exited with code ${result.status}`);
      if (stderr) console.log(`${c.dim}  ${stderr}${c.reset}`);
      return { success: false, output: result.stdout || '', error: stderr, duration_ms };
    }

    log(c.green, '✓', `${agent} completed successfully`);
    return { success: true, output: result.stdout || '', duration_ms };
  } catch (err) {
    const duration_ms = Date.now() - roundStart;
    if (err.signal === 'SIGTERM') {
      log(c.red, '⏰', `${agent} timed out after ${Math.floor(timeout / 1000)}s`);
    } else {
      log(c.red, '✗', `${agent} error: ${err.message}`);
    }
    return { success: false, output: '', error: err.message, duration_ms };
  }
}

function shellQuote(argv) {
  return argv
    .map((value) => {
      if (/^[A-Za-z0-9_./:-]+$/.test(value)) {
        return value;
      }
      return `'${String(value).replace(/'/g, '\'\\\'\'')}'`;
    })
    .join(' ');
}

// ─── Validation ──────────────────────────────────────────────────────────────

function validateRound(ppDir, fileName) {
  const validateScript = path.join(ppDir, 'validate.cjs');
  if (!fs.existsSync(validateScript)) return true;

  try {
    execFileSync('node', [validateScript, fileName], {
      cwd: path.dirname(ppDir),
      encoding: 'utf-8',
      stdio: 'pipe',
    });
    return true;
  } catch {
    return false;
  }
}

function checkVerdict(ppDir, round) {
  const roundFile = path.join(ppDir, `round-${round}.md`);
  const yaml = parseFrontmatter(roundFile);
  if (!yaml) return { verdict: 'UNKNOWN', score: 0 };
  return {
    verdict: yaml.verdict || 'UNKNOWN',
    score: yaml.score || 0,
    issues: yaml.issues || [],
  };
}

// ─── [Improvement 2] Stall Detection ─────────────────────────────────────────

function checkStall(metrics) {
  const scores = metrics.scoreHistory;
  if (scores.length < 2) return { stalled: false };

  // Check consecutive drops (2 in a row)
  if (scores.length >= 3) {
    const last3 = scores.slice(-3).map(s => s.score);
    if (last3[2] < last3[1] && last3[1] < last3[0]) {
      return { stalled: true, reason: `Score caiu 2x consecutivas: ${last3.join(' → ')}` };
    }
  }

  // Check plateau (3 same scores in a row)
  if (scores.length >= 3) {
    const last3 = scores.slice(-3).map(s => s.score);
    if (last3[0] === last3[1] && last3[1] === last3[2]) {
      return { stalled: true, reason: `Score estagnado em ${last3[0]}/10 por 3 rounds` };
    }
  }

  return { stalled: false };
}

function writeStallReport(ppDir, metrics, reason) {
  const scores = metrics.scoreHistory.map(s => `R${s.round}: ${s.score}/10`).join(', ');
  const content = `# Stall Report

**Reason:** ${reason}
**Score history:** ${scores}
**Generated:** ${new Date().toISOString()}

## Suggestions

1. Review the session scope — it may be too broad or ambiguous
2. Check if the reviewer and fixer are contradicting each other
3. Consider splitting into more focused sessions (--session)
4. Run with --with-audit to add a third perspective (Gemini)
5. Manually review the last 2 round files for patterns

## Resume

To continue despite stall: \`node orchestrate.cjs --no-stall-check\`
`;
  fs.writeFileSync(path.join(ppDir, 'stall-report.md'), content);
}

// ─── [Improvement 3] Fix Quality Gate ────────────────────────────────────────

function checkFixQuality(ppDir, round) {
  const warnings = [];
  const fixFile = path.join(ppDir, `round-${round}-fixed.md`);
  const yaml = parseFrontmatter(fixFile);
  if (!yaml) return { warnings, errors: [] };

  const errors = [];

  // Check: fix produced no file changes
  const diffStat = String(yaml.git_diff_stat || '');
  if (diffStat === '' || /^0 files? changed/.test(diffStat)) {
    errors.push('Fix produced no file changes (git_diff_stat is empty or 0)');
  }

  // Check: lint/typecheck failures
  if (yaml.quality_checks) {
    const qc = String(yaml.quality_checks);
    if (/lint:\s*fail/i.test(qc)) errors.push('Lint failed after fix');
    if (/typecheck:\s*fail/i.test(qc)) errors.push('Typecheck failed after fix');
  }

  // Check: issues_fixed < issues_total without SKIPPED explanation
  if (yaml.issues_fixed != null && yaml.issues_total != null) {
    if (yaml.issues_fixed < yaml.issues_total && (!yaml.issues_skipped || yaml.issues_skipped === 0)) {
      warnings.push(`Fixed ${yaml.issues_fixed}/${yaml.issues_total} issues but none marked as SKIPPED`);
    }
  }

  return { warnings, errors };
}

// ─── [Improvement 4] Regression Tracker ──────────────────────────────────────

function extractTopics(ppDir, round) {
  const roundFile = path.join(ppDir, `round-${round}.md`);
  if (!fs.existsSync(roundFile)) return [];

  const content = fs.readFileSync(roundFile, 'utf-8');
  const topics = [];

  // Extract from YAML title fields: title: "some title"
  const titleMatches = content.match(/title:\s*"([^"]+)"/g);
  if (titleMatches) {
    for (const m of titleMatches) {
      const t = m.match(/title:\s*"([^"]+)"/);
      if (t) topics.push(t[1].toLowerCase().trim());
    }
  }

  // Extract from Markdown issue headers: #### Issue X.Y — Title
  const headerMatches = content.match(/####\s+Issue\s+\S+\s*[—–-]\s*(.+)/g);
  if (headerMatches) {
    for (const m of headerMatches) {
      const t = m.match(/####\s+Issue\s+\S+\s*[—–-]\s*(.+)/);
      if (t) topics.push(t[1].toLowerCase().trim());
    }
  }

  return [...new Set(topics)];
}

function updateTopicHistory(metrics, round, topics) {
  for (const topic of topics) {
    if (!metrics.topicHistory[topic]) {
      metrics.topicHistory[topic] = { firstSeen: round, lastSeen: round, timesSeen: 1 };
    } else {
      metrics.topicHistory[topic].lastSeen = round;
      metrics.topicHistory[topic].timesSeen++;
    }
  }
}

function getRecurringTopics(metrics, threshold = 3) {
  return Object.entries(metrics.topicHistory)
    .filter(([, v]) => v.timesSeen >= threshold)
    .map(([topic, v]) => ({ topic, ...v }));
}

function writeTrackerJson(ppDir, metrics) {
  fs.writeFileSync(
    path.join(ppDir, 'tracker.json'),
    JSON.stringify({ topicHistory: metrics.topicHistory, scoreHistory: metrics.scoreHistory }, null, 2),
  );
}

// ─── [Improvement 6] Archive Auto-Cleanup ────────────────────────────────────

function archiveRounds(ppDir, sessionName) {
  const date = new Date().toISOString().slice(0, 10);
  const archiveDir = path.join(ppDir, `archive-${sessionName || 'default'}-${date}`);

  // Avoid collision: append counter if dir exists
  let finalDir = archiveDir;
  let counter = 1;
  while (fs.existsSync(finalDir)) {
    finalDir = `${archiveDir}-${counter++}`;
  }
  fs.mkdirSync(finalDir, { recursive: true });

  const roundFiles = fs.readdirSync(ppDir).filter(f => /^round-\d+/.test(f));
  for (const f of roundFiles) {
    fs.renameSync(path.join(ppDir, f), path.join(finalDir, f));
  }

  // Also archive auxiliary files
  for (const f of ['stall-report.md', 'tracker.json', 'orchestrator-summary.json']) {
    const src = path.join(ppDir, f);
    if (fs.existsSync(src)) fs.renameSync(src, path.join(finalDir, f));
  }

  // Reset next-step.md
  const nsPath = path.join(ppDir, 'next-step.md');
  if (fs.existsSync(nsPath)) fs.unlinkSync(nsPath);

  return finalDir;
}

// ─── [Improvement 1] Summary with metrics ────────────────────────────────────

function writeSummary(ppDir, lastRound, outcome, startTime, reviews, fixes, audits, metrics) {
  const elapsedMs = Date.now() - startTime;
  const elapsed = Math.floor(elapsedMs / 1000);
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  // Per-mode averages
  const reviewTimes = (metrics?.rounds || []).filter(r => r.mode === 'review').map(r => r.duration_ms);
  const fixTimes = (metrics?.rounds || []).filter(r => r.mode === 'fix').map(r => r.duration_ms);
  const avgReview = reviewTimes.length ? Math.round(reviewTimes.reduce((a, b) => a + b, 0) / reviewTimes.length / 1000) : 0;
  const avgFix = fixTimes.length ? Math.round(fixTimes.reduce((a, b) => a + b, 0) / fixTimes.length / 1000) : 0;

  console.log('');
  console.log(`${c.cyan}${'━'.repeat(60)}${c.reset}`);
  console.log(`${c.bold}  Resumo da Orquestração${c.reset}`);
  console.log(`${c.cyan}${'━'.repeat(60)}${c.reset}`);
  console.log(`  Resultado:  ${outcome === 'PERFECT' ? c.green : c.yellow}${outcome}${c.reset}`);
  console.log(`  Rounds:     ${lastRound}`);
  console.log(`  Reviews:    ${reviews}`);
  console.log(`  Fixes:      ${fixes}`);
  console.log(`  Audits:     ${audits}`);
  console.log(`  Tempo:      ${mins}m${secs}s`);
  if (avgReview > 0) console.log(`  Avg Review: ${avgReview}s`);
  if (avgFix > 0) console.log(`  Avg Fix:    ${avgFix}s`);
  console.log(`${c.cyan}${'━'.repeat(60)}${c.reset}`);
  console.log('');

  // Write JSON summary for dashboard consumption
  if (metrics) {
    const summary = {
      outcome,
      lastRound,
      reviews,
      fixes,
      audits,
      elapsed: elapsedMs,
      avgReviewMs: reviewTimes.length ? Math.round(reviewTimes.reduce((a, b) => a + b, 0) / reviewTimes.length) : 0,
      avgFixMs: fixTimes.length ? Math.round(fixTimes.reduce((a, b) => a + b, 0) / fixTimes.length) : 0,
      rounds: metrics.rounds,
      scoreHistory: metrics.scoreHistory,
      topicHistory: metrics.topicHistory,
      date: new Date().toISOString(),
    };
    try {
      fs.writeFileSync(path.join(ppDir, 'orchestrator-summary.json'), JSON.stringify(summary, null, 2));
    } catch { /* ignore write errors */ }
  }
}

// ─── [Improvement 7] runCycle — extracted main loop ──────────────────────────

function resolveSession(ppDir, config) {
  let sessionFile = config.session ? `session-${config.session}.md` : 'session.md';
  let sessionPath = path.join(ppDir, sessionFile);

  // [Improvement 5] Auto-suggest when no --session and session.md missing
  if (!config.session && !fs.existsSync(sessionPath)) {
    const available = fs.readdirSync(ppDir).filter(f => /^session-[\w-]+\.md$/.test(f));
    if (available.length === 1) {
      const autoName = available[0].replace(/^session-/, '').replace(/\.md$/, '');
      config.session = autoName;
      sessionFile = `session-${autoName}.md`;
      sessionPath = path.join(ppDir, sessionFile);
      log(c.cyan, '📄', `Auto-selecionada sessão única: ${sessionFile}`);
    } else if (available.length > 1 && !config.pipeline) {
      log(c.yellow, '⚠', 'Múltiplas sessões encontradas. Escolha uma:');
      for (const s of available) {
        const name = s.replace(/^session-/, '').replace(/\.md$/, '');
        console.log(`${c.dim}  --session ${name}${c.reset}`);
      }
      console.log(`\nOu use ${c.bold}--pipeline${c.reset} para rodar todas sequencialmente.`);
      return null;
    }
  }

  if (!fs.existsSync(sessionPath)) {
    const available = fs.readdirSync(ppDir).filter(f => /^session(-[\w-]+)?\.md$/.test(f));
    if (available.length > 0) {
      log(c.red, '✗', `${sessionFile} não encontrado. Sessões disponíveis:`);
      for (const s of available) {
        const name = s.replace(/^session-?/, '').replace(/\.md$/, '') || '(default)';
        console.log(`${c.dim}  --session ${name}${c.reset}`);
      }
    } else {
      log(c.red, '✗', 'Nenhum session*.md encontrado. Defina o escopo primeiro.');
    }
    return null;
  }

  // Copy to canonical session.md so agents always find it
  const canonicalSession = path.join(ppDir, 'session.md');
  if (config.session) {
    try { fs.unlinkSync(canonicalSession); } catch {}
    fs.copyFileSync(sessionPath, canonicalSession);
  }

  return { sessionFile, sessionPath };
}

function runCycle(config, ppDir, metrics) {
  let currentRound = getLatestRound(ppDir);
  let mode = config.startFrom;

  const nextStep = getNextStep(ppDir);
  if (nextStep && nextStep.cycle_state === 'COMPLETE') {
    if (!config.dryRun) {
      log(c.green, '🏆', `Ciclo já completo! (round ${nextStep.current_round})`);
      return 0;
    }
    const completedRound = Number(nextStep.current_round) || currentRound;
    currentRound = mode === 'review' ? Math.max(completedRound + 1, 1) : Math.max(completedRound, 1);
  }

  // Auto-detect mode from state
  if (nextStep && config.startFrom === 'review') {
    if (nextStep.cycle_state === 'WAITING_FOR_FIX') {
      mode = 'fix';
      log(c.yellow, '↩', `Resumindo do round ${currentRound} em modo FIX`);
    } else if (nextStep.cycle_state === 'WAITING_FOR_REVIEW') {
      mode = 'review';
      currentRound++;
      log(c.yellow, '↩', `Resumindo para round ${currentRound} em modo REVIEW`);
    } else if (nextStep.cycle_state === 'WAITING_FOR_AUDIT') {
      mode = 'audit';
      log(c.yellow, '↩', `Resumindo do round ${currentRound} em modo AUDIT`);
    }
  } else if (currentRound === 0) {
    currentRound = 1;
    mode = 'review';
  }

  const startTime = Date.now();
  let totalReviews = 0;
  let totalFixes = 0;
  let totalAudits = 0;

  banner('Code Review Ping-Pong — Orchestrator Autônomo');
  log(c.cyan, '📋', `Projeto: ${path.basename(config.cwd)}`);
  log(c.cyan, '🌿', `Branch: ${getBranch(config.cwd)}`);
  if (config.session) log(c.cyan, '📄', `Sessão: session-${config.session}.md`);
  log(c.cyan, '🔄', `Max rounds: ${config.maxRounds}`);
  log(c.cyan, '🔍', `Audit: ${config.withAudit ? `sim (a cada ${config.auditEvery} fix${config.auditEvery > 1 ? 'es' : ''})` : 'não'}`);
  log(c.cyan, '▶', `Iniciando no round ${currentRound}, modo ${mode.toUpperCase()}`);
  if (config.dryRun) log(c.yellow, '⚠', 'Modo DRY-RUN — nenhum comando será executado');
  console.log('');

  while (currentRound <= config.maxRounds) {
    // ── REVIEW ──
    if (mode === 'review') {
      const reviewAgent = config.reviewer;
      const reviewLabel = { codex: 'Codex', claude: 'Claude Code', gemini: 'Gemini', 'openai-api': 'OpenAI API' }[reviewAgent] || reviewAgent;
      banner(`Round ${currentRound} — REVIEW (${reviewLabel})`);
      totalReviews++;

      // [Improvement 4] Inject recurring topics
      const recurring = getRecurringTopics(metrics);
      const prompt = buildReviewPrompt(ppDir, currentRound, config.cwd, recurring);

      // Model escalation: pick review model based on latest score
      const lastScore = metrics.scoreHistory.length > 0 ? metrics.scoreHistory[metrics.scoreHistory.length - 1].score : 0;
      const reviewTiers = parseEscalation(config.reviewEscalation);
      const escalatedReviewModel = resolveModel(reviewTiers, lastScore);
      const reviewConfig = { ...config };
      if (escalatedReviewModel) {
        if (reviewAgent === 'codex' || reviewAgent === 'openai-api') reviewConfig.codexModel = escalatedReviewModel;
        if (reviewAgent === 'claude') reviewConfig.claudeModel = escalatedReviewModel;
        log(c.dim, '🔀', `Modelo review: ${escalatedReviewModel} (score ${lastScore})`);
      }

      const result = runCli(reviewAgent, prompt, reviewConfig);

      metrics.rounds.push({ round: currentRound, mode: 'review', agent: reviewAgent, duration_ms: result.duration_ms || 0, success: result.success });

      if (!result.success) {
        log(c.red, '✗', `Review falhou no round ${currentRound}. Abortando.`);
        writeSummary(ppDir, currentRound, 'REVIEW_FAILED', startTime, totalReviews, totalFixes, totalAudits, metrics);
        return 1;
      }

      if (!config.dryRun && !roundFileExists(ppDir, currentRound, 'review')) {
        log(c.red, '✗', `round-${currentRound}.md não foi criado pelo Codex. Abortando.`);
        return 1;
      }

      if (!config.dryRun && !validateRound(ppDir, `round-${currentRound}.md`)) {
        log(c.red, '✗', `round-${currentRound}.md falhou na validação. Abortando.`);
        return 1;
      }

      if (!config.dryRun) {
        const { verdict, score } = checkVerdict(ppDir, currentRound);
        log(c.blue, '📊', `Score: ${score}/10 — Verdict: ${verdict}`);

        // [Improvement 1] Track score
        metrics.scoreHistory.push({ round: currentRound, score });

        // [Improvement 4] Track topics
        const topics = extractTopics(ppDir, currentRound);
        updateTopicHistory(metrics, currentRound, topics);
        writeTrackerJson(ppDir, metrics);

        // [Improvement 2] Stall detection
        if (!config.noStallCheck) {
          const stall = checkStall(metrics);
          if (stall.stalled) {
            writeStallReport(ppDir, metrics, stall.reason);
            log(c.yellow, '⚠', `Stall detectado: ${stall.reason}. Veja stall-report.md`);
            writeSummary(ppDir, currentRound, 'STALLED', startTime, totalReviews, totalFixes, totalAudits, metrics);
            return 3;
          }
        }

        if (verdict === 'PERFECT') {
          banner(`🏆 PERFECT! Score 10/10 em ${currentRound} rounds`);
          writeSummary(ppDir, currentRound, 'PERFECT', startTime, totalReviews, totalFixes, totalAudits, metrics);

          // [Improvement 6] Archive rounds
          if (!config.noArchive) {
            const archiveDir = archiveRounds(ppDir, config.session);
            log(c.green, '📦', `Rounds arquivados em ${path.basename(archiveDir)}/`);
          }

          return 0;
        }
      }

      mode = 'fix';
      continue;
    }

    // ── FIX ──
    if (mode === 'fix') {
      const fixAgent = config.fixer;
      const fixLabel = fixAgent === 'claude' ? 'Claude Code' : fixAgent === 'codex' ? 'Codex' : 'Gemini';
      banner(`Round ${currentRound} — FIX (${fixLabel})`);
      totalFixes++;

      const prompt = buildFixPrompt(ppDir, currentRound, config.cwd);

      // Model escalation: pick fix model based on latest score
      const fixLastScore = metrics.scoreHistory.length > 0 ? metrics.scoreHistory[metrics.scoreHistory.length - 1].score : 0;
      const fixTiers = parseEscalation(config.fixEscalation);
      const escalatedFixModel = resolveModel(fixTiers, fixLastScore);
      const fixConfig = { ...config };
      if (escalatedFixModel) {
        if (fixAgent === 'claude') fixConfig.claudeModel = escalatedFixModel;
        if (fixAgent === 'codex') fixConfig.codexModel = escalatedFixModel;
        log(c.dim, '🔀', `Modelo fix: ${escalatedFixModel} (score ${fixLastScore})`);
      }

      const result = runCli(fixAgent, prompt, fixConfig);

      metrics.rounds.push({ round: currentRound, mode: 'fix', agent: fixAgent, duration_ms: result.duration_ms || 0, success: result.success });

      if (!result.success) {
        log(c.red, '✗', `Fix falhou no round ${currentRound}. Abortando.`);
        writeSummary(ppDir, currentRound, 'FIX_FAILED', startTime, totalReviews, totalFixes, totalAudits, metrics);
        return 1;
      }

      if (!config.dryRun && !roundFileExists(ppDir, currentRound, 'fixed')) {
        log(c.red, '✗', `round-${currentRound}-fixed.md não foi criado pelo Claude Code. Abortando.`);
        return 1;
      }

      if (!config.dryRun && !validateRound(ppDir, `round-${currentRound}-fixed.md`)) {
        log(c.red, '✗', `round-${currentRound}-fixed.md falhou na validação. Abortando.`);
        return 1;
      }

      // [Improvement 3] Fix quality gate
      if (!config.dryRun) {
        const quality = checkFixQuality(ppDir, currentRound);
        for (const w of quality.warnings) log(c.yellow, '⚠', `Fix quality: ${w}`);
        for (const e of quality.errors) log(c.red, '⚠', `Fix quality: ${e}`);
      }

      if (config.withAudit && totalFixes % config.auditEvery === 0) {
        mode = 'audit';
        continue;
      }

      mode = 'review';
      currentRound++;
      continue;
    }

    // ── AUDIT ──
    if (mode === 'audit') {
      banner(`Round ${currentRound} — AUDIT (Gemini)`);
      totalAudits++;

      const prompt = buildAuditPrompt(ppDir, currentRound, config.cwd);
      const result = runCli('gemini', prompt, config);

      metrics.rounds.push({ round: currentRound, mode: 'audit', agent: 'gemini', duration_ms: result.duration_ms || 0, success: result.success });

      if (!result.success) {
        log(c.yellow, '⚠', `Audit falhou no round ${currentRound}. Continuando sem audit.`);
      }

      if (!config.dryRun && result.success) {
        if (!roundFileExists(ppDir, currentRound, 'audit')) {
          log(c.red, '✗', `round-${currentRound}-audit.md não foi criado pelo Gemini. Abortando.`);
          return 1;
        }
        if (!validateRound(ppDir, `round-${currentRound}-audit.md`)) {
          log(c.red, '✗', `round-${currentRound}-audit.md falhou na validação. Abortando.`);
          return 1;
        }
      }

      mode = 'review';
      currentRound++;
      continue;
    }
  }

  log(c.yellow, '⚠', `Limite de ${config.maxRounds} rounds atingido sem PERFECT.`);
  writeSummary(ppDir, currentRound - 1, 'MAX_ROUNDS', startTime, totalReviews, totalFixes, totalAudits, metrics);
  return 2;
}

// ─── [Improvement 7/8] Pipeline mode ─────────────────────────────────────────

function runPipeline(config) {
  const ppDir = getPingPongDir(config.cwd);
  const sessions = fs.readdirSync(ppDir)
    .filter(f => /^session-[\w-]+\.md$/.test(f))
    .map(f => f.replace(/^session-/, '').replace(/\.md$/, ''))
    .sort();

  if (sessions.length === 0) {
    log(c.red, '✗', 'Nenhuma session-*.md encontrada para pipeline.');
    process.exit(1);
  }

  banner(`Pipeline — ${sessions.length} sessões: ${sessions.join(', ')}`);

  const results = [];
  const pipelineStart = Date.now();

  for (const session of sessions) {
    const metrics = { rounds: [], scoreHistory: [], topicHistory: {} };
    const sessionConfig = { ...config, session, pipeline: false };

    // Archive existing rounds before starting fresh
    if (!config.dryRun) {
      const existingRounds = fs.readdirSync(ppDir).filter(f => /^round-\d+/.test(f));
      if (existingRounds.length > 0) {
        const archiveDir = archiveRounds(ppDir, `pre-${session}`);
        log(c.dim, '📦', `Rounds anteriores arquivados em ${path.basename(archiveDir)}/`);
      }
    }

    // Resolve session
    const resolved = resolveSession(ppDir, sessionConfig);
    if (!resolved) {
      results.push({ session, outcome: 'SESSION_NOT_FOUND', rounds: 0, startScore: null, endScore: null, elapsed: 0 });
      continue;
    }

    const exitCode = runCycle(sessionConfig, ppDir, metrics);

    const startScore = metrics.scoreHistory.length > 0 ? metrics.scoreHistory[0].score : null;
    const endScore = metrics.scoreHistory.length > 0 ? metrics.scoreHistory[metrics.scoreHistory.length - 1].score : null;
    const outcome = exitCode === 0 ? 'PERFECT' : exitCode === 2 ? 'MAX_ROUNDS' : exitCode === 3 ? 'STALLED' : 'FAILED';
    const elapsed = metrics.rounds.reduce((sum, r) => sum + (r.duration_ms || 0), 0);

    results.push({
      session,
      outcome,
      rounds: metrics.scoreHistory.length,
      startScore,
      endScore,
      elapsed,
      filesChanged: 0, // Would need git diff to get this
    });

    log(c.cyan, '─', `Sessão ${session}: ${outcome} (${metrics.scoreHistory.length} rounds, ${startScore}→${endScore})`);

    // If FAILED (not stalled/max-rounds), abort pipeline
    if (exitCode === 1) {
      log(c.red, '✗', `Sessão ${session} falhou. Abortando pipeline.`);
      break;
    }
  }

  // [Improvement 9] Write pipeline report
  writePipelineReport(ppDir, results, pipelineStart);

  // Print pipeline summary
  const totalElapsed = Math.floor((Date.now() - pipelineStart) / 1000);
  banner('Pipeline — Resumo Final');
  for (const r of results) {
    const color = r.outcome === 'PERFECT' ? c.green : r.outcome === 'FAILED' ? c.red : c.yellow;
    console.log(`  ${color}${r.outcome.padEnd(12)}${c.reset} ${r.session.padEnd(20)} ${r.rounds} rounds  ${r.startScore ?? '-'}→${r.endScore ?? '-'}`);
  }
  console.log(`\n  Tempo total: ${Math.floor(totalElapsed / 60)}m${totalElapsed % 60}s`);
  console.log(`  Relatório: .code-review-ping-pong/final-report-${new Date().toISOString().slice(0, 10)}.md\n`);

  const allPerfect = results.every(r => r.outcome === 'PERFECT');
  process.exit(allPerfect ? 0 : 1);
}

// ─── [Improvement 9] Pipeline Report ─────────────────────────────────────────

function writePipelineReport(ppDir, results, pipelineStart) {
  const date = new Date().toISOString().slice(0, 10);
  const totalElapsed = Math.floor((Date.now() - pipelineStart) / 1000);
  const totalRounds = results.reduce((sum, r) => sum + r.rounds, 0);
  const perfectCount = results.filter(r => r.outcome === 'PERFECT').length;

  let md = `---
protocol: code-review-ping-pong
type: pipeline-report
date: "${date}"
sessions_total: ${results.length}
sessions_perfect: ${perfectCount}
total_rounds: ${totalRounds}
total_time: "${Math.floor(totalElapsed / 60)}m${totalElapsed % 60}s"
---

# Pipeline Report — ${date}

## Per-Session Summary

| Session | Rounds | Start | End | Outcome |
|---------|--------|-------|-----|---------|
`;

  for (const r of results) {
    md += `| ${r.session} | ${r.rounds} | ${r.startScore ?? '-'}/10 | ${r.endScore ?? '-'}/10 | ${r.outcome} |\n`;
  }

  md += `
## Aggregate Stats

- **Sessions:** ${results.length} total, ${perfectCount} PERFECT
- **Total rounds:** ${totalRounds}
- **Total time:** ${Math.floor(totalElapsed / 60)}m${totalElapsed % 60}s
`;

  fs.writeFileSync(path.join(ppDir, `final-report-${date}.md`), md);
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  const args = parseArgs(process.argv.slice(2));
  const config = { ...DEFAULTS, ...args };
  const ppDir = getPingPongDir(config.cwd);

  if (!fs.existsSync(ppDir)) {
    log(c.red, '✗', `.code-review-ping-pong/ não encontrado em ${config.cwd}`);
    process.exit(1);
  }

  // [Improvement 7] Pipeline mode
  if (config.pipeline) {
    runPipeline(config);
    return;
  }

  // Resolve session
  const resolved = resolveSession(ppDir, config);
  if (!resolved) process.exit(1);

  // Run single cycle
  const metrics = { rounds: [], scoreHistory: [], topicHistory: {} };
  const exitCode = runCycle(config, ppDir, metrics);
  process.exit(exitCode);
}

// ─── Arg Parser ──────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const result = {};
  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case '--max-rounds':
        result.maxRounds = Number(argv[++i]) || DEFAULTS.maxRounds;
        break;
      case '--with-audit':
        result.withAudit = true;
        break;
      case '--audit-every':
        result.withAudit = true;
        result.auditEvery = Number(argv[++i]) || DEFAULTS.auditEvery;
        break;
      case '--dry-run':
        result.dryRun = true;
        break;
      case '--codex-model':
        result.codexModel = argv[++i] || null;
        break;
      case '--claude-model':
        result.claudeModel = argv[++i] || null;
        break;
      case '--review-escalation':
        result.reviewEscalation = argv[++i] || null;
        break;
      case '--fix-escalation':
        result.fixEscalation = argv[++i] || null;
        break;
      case '--reviewer':
        result.reviewer = argv[++i] || 'codex';
        break;
      case '--fixer':
        result.fixer = argv[++i] || 'claude';
        break;
      case '--session':
        result.session = argv[++i] || null;
        break;
      case '--pipeline':
        result.pipeline = true;
        break;
      case '--no-stall-check':
        result.noStallCheck = true;
        break;
      case '--no-archive':
        result.noArchive = true;
        break;
      case '--start-from':
        result.startFrom = argv[++i] || 'review';
        break;
      case '--cwd':
        result.cwd = argv[++i] || DEFAULTS.cwd;
        break;
      case '--timeout':
        result.timeout = (Number(argv[++i]) || 10) * 60 * 1000;
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
        break;
      default:
        if (argv[i].startsWith('-')) {
          console.error(`Flag desconhecida: ${argv[i]}`);
          process.exit(1);
        }
    }
  }
  return result;
}

function printHelp() {
  console.log(`
${c.bold}Code Review Ping-Pong — Orchestrator Autônomo${c.reset}

Roda o ciclo completo automaticamente:
  Codex (REVIEW) → Claude Code (FIX) → [Gemini (AUDIT)] → loop até PERFECT

${c.bold}Uso:${c.reset}
  node orchestrate.cjs [opções]

${c.bold}Opções:${c.reset}
  --max-rounds <N>    Limite de rounds (padrão: 15)
  --with-audit        Incluir audit Gemini após cada fix
  --audit-every <N>   Audit Gemini a cada N fixes (implica --with-audit)
  --reviewer <agent>  Quem faz review: codex, claude, gemini, openai-api (padrão: codex)
  --fixer <agent>     Quem faz fix: claude, codex, gemini (padrão: claude)
  --codex-model <m>   Modelo fixo do Codex (ex: o4-mini, o3)
  --claude-model <m>  Modelo fixo do Claude (ex: sonnet, opus)
  --review-escalation Escalar modelo do review por score (ex: "gpt-4o-mini<8,gpt-4o")
  --fix-escalation    Escalar modelo do fix por score (ex: "sonnet<9,opus")
  --session <name>    Sessão a usar (ex: engine → session-engine.md)
  --pipeline          Rodar TODAS as sessões sequencialmente
  --no-stall-check    Desabilitar detecção de stall
  --no-archive        Não arquivar rounds ao atingir PERFECT
  --dry-run           Mostrar comandos sem executar
  --start-from <mode> Começar de: review, fix, audit (padrão: auto-detect)
  --cwd <path>        Rodar em outro diretório
  --timeout <min>     Timeout por CLI em minutos (padrão: 10)
  -h, --help          Mostrar esta ajuda

${c.bold}Pré-requisitos:${c.reset}
  - CLIs instaladas: claude, codex, gemini
  - .code-review-ping-pong/session.md com escopo definido

${c.bold}Exemplos:${c.reset}
  node orchestrate.cjs                          # Roda com defaults
  node orchestrate.cjs --session engine          # Sessão específica
  node orchestrate.cjs --pipeline                # Todas as sessões
  node orchestrate.cjs --with-audit             # Com audit Gemini
  node orchestrate.cjs --max-rounds 5 --dry-run # Dry-run, max 5 rounds
  node orchestrate.cjs --start-from fix         # Resumir do modo FIX
  node orchestrate.cjs --reviewer openai-api                   # Review via API OpenAI direta
  node orchestrate.cjs --reviewer openai-api \\
    --review-escalation "gpt-4o-mini<8,gpt-4o"                 # Escala modelo por score
  node orchestrate.cjs --fix-escalation "sonnet<9,opus"        # Sonnet até 9, depois Opus
`);
}

// ─── Run ─────────────────────────────────────────────────────────────────────

if (require.main === module) {
  main();
}

module.exports = {
  archiveRounds,
  buildAuditPrompt,
  buildCliCommand,
  buildFixPrompt,
  buildReviewPrompt,
  checkFixQuality,
  checkStall,
  extractTopics,
  getLatestRound,
  getNextStep,
  getRecurringTopics,
  parseArgs,
  parseFrontmatter,
  roundFileExists,
  shellQuote,
  validateRound,
};
