#!/usr/bin/env node
/**
 * Cross-Provider Model Qualification Runner
 *
 * Executa testes de qualificação comparando modelos externos (GLM-5, Kimi)
 * contra Opus baseline usando as TASKS REAIS do squad-creator.
 *
 * Features:
 * - Carrega task real (sem duplicação)
 * - Salva snapshot da versão testada
 * - Suporta múltiplos modelos
 * - Gera relatório de comparação automático
 * - Usa paths do squad-config.yaml (zero hardcoded paths)
 *
 * Usage:
 *   node cross-provider-runner.js --task extract-knowledge --model glm5 --input hormozi-value-equation.md
 *   node cross-provider-runner.js --task extract-voice-dna --model glm5 --input halbert-voice.md
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Load config (auto-detects project root)
const config = require('../lib/config-loader');

// Load env variables
require(config.paths.envLoader);

// ============================================================================
// CONFIG
// ============================================================================

const PATHS = {
  tasksDir: config.paths.tasks,
  outputDir: config.paths.llmTests,
  inputsDir: config.paths.llmTestInputs,
};

const MODELS = {
  opus: {
    provider: 'anthropic',
    model_id: 'claude-opus-4-5-20250514',
    via: 'task-tool',
    cost: { input: 15.00, output: 75.00 },
  },
  glm5: {
    provider: 'openrouter',
    model_id: 'z-ai/glm-5',
    via: 'api',
    cost: { input: 0.80, output: 3.20 },
  },
  kimi: {
    provider: 'openrouter',
    model_id: 'moonshotai/kimi-k2.5',
    via: 'api',
    cost: { input: 0.50, output: 2.80 },
  },
};

const DEFAULTS = {
  temperature: 0.3,
  maxTokens: 8000,
  timeoutMs: 180000,
};

// ============================================================================
// TASK LOADER
// ============================================================================

function loadTask(taskName) {
  const taskPath = path.join(PATHS.tasksDir, `${taskName}.md`);

  if (!fs.existsSync(taskPath)) {
    throw new Error(`Task not found: ${taskPath}`);
  }

  const content = fs.readFileSync(taskPath, 'utf-8');
  const hash = crypto.createHash('md5').update(content).digest('hex').slice(0, 8);

  return {
    name: taskName,
    path: taskPath,
    content,
    hash,
    loadedAt: new Date().toISOString(),
  };
}

// ============================================================================
// INPUT RESOLVER
// ============================================================================

function resolveInputPath(inputArg) {
  // If it's already an absolute path, use it
  if (path.isAbsolute(inputArg)) {
    return inputArg;
  }

  // If it's just a filename, look in the inputs directory
  if (!inputArg.includes('/') && !inputArg.includes('\\')) {
    const inInputsDir = path.join(PATHS.inputsDir, inputArg);
    if (fs.existsSync(inInputsDir)) {
      return inInputsDir;
    }
  }

  // Otherwise, resolve relative to current working directory
  const relativePath = path.resolve(process.cwd(), inputArg);
  if (fs.existsSync(relativePath)) {
    return relativePath;
  }

  throw new Error(`Input file not found: ${inputArg}\nLooked in:\n  - ${path.join(PATHS.inputsDir, inputArg)}\n  - ${relativePath}`);
}

// ============================================================================
// PROMPT BUILDER
// ============================================================================

function buildTestPrompt(task, testInput, options = {}) {
  // v2.0: Pass FULL task content (truncated if too large)
  // This ensures QUALITY CHECK and all requirements reach the model
  const taskContent = truncateTaskContent(task.content, 12000);

  const prompt = `# Task Execution: ${task.name}

## TASK COMPLETA (Siga TODAS as instruções abaixo)

${taskContent}

---

## INPUT DE TESTE

${testInput}

---

## INSTRUÇÕES FINAIS

1. Execute a task acima usando o input fornecido
2. SIGA TODAS as regras da task, especialmente QUALITY CHECK
3. Responda APENAS com o output estruturado (YAML/MD)
4. ZERO INVENÇÃO - Só extraia o que está LITERALMENTE no input
5. CITE TUDO - Cada item deve ter [SOURCE: ...]

${options.additionalInstructions || ''}`;

  return prompt;
}

/**
 * Truncate task content intelligently:
 * - Keep frontmatter + first sections
 * - Keep QUALITY CHECK section (critical for quality)
 * - Keep OUTPUT section (defines expected format)
 * - Truncate middle sections if needed
 */
function truncateTaskContent(content, maxChars) {
  if (content.length <= maxChars) {
    return content;
  }

  // Extract key sections that MUST be included
  const qualityCheckMatch = content.match(/## QUALITY CHECK[\s\S]*?(?=\n## [A-Z]|\n---\n\*\*|$)/);
  const outputMatch = content.match(/## OUTPUT:[\s\S]*?(?=\n## [A-Z]|\n---\n\*\*|$)/);

  const qualityCheck = qualityCheckMatch ? qualityCheckMatch[0] : '';
  const outputSection = outputMatch ? outputMatch[0] : '';

  // Calculate how much space we have for the main content
  const reservedChars = qualityCheck.length + outputSection.length + 500; // 500 for headers
  const mainContentMax = maxChars - reservedChars;

  // Get content up to QUALITY CHECK or OUTPUT (whichever comes first)
  let mainContent = content;
  const qualityIdx = content.indexOf('## QUALITY CHECK');
  const outputIdx = content.indexOf('## OUTPUT:');
  const cutoffIdx = Math.min(
    qualityIdx > 0 ? qualityIdx : Infinity,
    outputIdx > 0 ? outputIdx : Infinity,
  );

  if (cutoffIdx < Infinity) {
    mainContent = content.slice(0, cutoffIdx);
  }

  // Truncate main content if needed
  if (mainContent.length > mainContentMax) {
    mainContent = mainContent.slice(0, mainContentMax) + '\n\n[... truncated for length ...]\n\n';
  }

  // Rebuild with key sections
  let result = mainContent;
  if (qualityCheck && !result.includes('## QUALITY CHECK')) {
    result += '\n\n' + qualityCheck;
  }
  if (outputSection && !result.includes('## OUTPUT:')) {
    result += '\n\n' + outputSection;
  }

  return result;
}

// Legacy function kept for reference
function extractTaskSections(content) {
  const sections = {};

  const purposeMatch = content.match(/## Purpose\n\n([\s\S]*?)(?=\n## |\n---|\Z)/);
  if (purposeMatch) sections.purpose = purposeMatch[1].trim();

  const executionMatch = content.match(/## Execution\n\n([\s\S]*?)(?=\n## Validation|\n## Error|\Z)/);
  if (executionMatch) sections.execution = executionMatch[1].slice(0, 3000);

  const antiMatch = content.match(/## Anti-Invention[\s\S]*?([\s\S]*?)(?=\n## |\n---|\Z)/);
  if (antiMatch) sections.antiInvention = antiMatch[1].trim();

  const outputMatch = content.match(/## Outputs?\n\n([\s\S]*?)(?=\n## |\n---|\Z)/);
  if (outputMatch) sections.outputs = outputMatch[1].trim();

  return sections;
}

// ============================================================================
// MODEL RUNNERS
// ============================================================================

async function runOpenRouterModel(modelConfig, prompt, options = {}) {
  const start = Date.now();

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://lendario.ai',
      'X-Title': 'Cross-Provider Qualification Test',
    },
    body: JSON.stringify({
      model: modelConfig.model_id,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: options.maxTokens || DEFAULTS.maxTokens,
      temperature: options.temperature || DEFAULTS.temperature,
    }),
  });

  const data = await response.json();
  const elapsed = (Date.now() - start) / 1000;

  if (data.error) {
    throw new Error(`API Error: ${JSON.stringify(data.error)}`);
  }

  return {
    content: data.choices[0].message.content,
    usage: data.usage,
    latency: elapsed,
    cost: calculateCost(data.usage, modelConfig.cost),
    raw: data,
  };
}

function calculateCost(usage, costConfig) {
  if (!usage) return 0;
  const inputCost = (usage.prompt_tokens / 1_000_000) * costConfig.input;
  const outputCost = (usage.completion_tokens / 1_000_000) * costConfig.output;
  return inputCost + outputCost;
}

// ============================================================================
// TEST EXECUTOR
// ============================================================================

async function runTest(taskName, modelName, inputArg, options = {}) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Cross-Provider Test: ${taskName} with ${modelName}`);
  console.log(`${'='.repeat(60)}\n`);

  // 1. Load task
  console.log('📄 Loading task...');
  const task = loadTask(taskName);
  console.log(`   Hash: ${task.hash}`);

  // 2. Resolve and load test input
  console.log('📥 Loading test input...');
  const testInputPath = resolveInputPath(inputArg);
  const testInput = fs.readFileSync(testInputPath, 'utf-8');
  console.log(`   Path: ${testInputPath}`);
  console.log(`   Size: ${testInput.length} chars`);

  // 3. Build prompt
  console.log('🔧 Building prompt...');
  const prompt = buildTestPrompt(task, testInput, options);
  console.log(`   Prompt size: ${prompt.length} chars`);

  // 4. Get model config
  const modelConfig = MODELS[modelName];
  if (!modelConfig) {
    throw new Error(`Unknown model: ${modelName}. Available: ${Object.keys(MODELS).join(', ')}`);
  }

  // 5. Execute
  console.log(`\n🚀 Running ${modelName}...`);
  let result;

  if (modelConfig.via === 'api') {
    result = await runOpenRouterModel(modelConfig, prompt, options);
  } else {
    console.log('   ⚠️  Opus requires Task tool execution. Run separately.');
    result = { content: null, usage: null, latency: null, cost: null };
  }

  if (result.content) {
    console.log('\n✅ Complete!');
    console.log(`   Latency: ${result.latency.toFixed(1)}s`);
    console.log(`   Cost: $${result.cost.toFixed(4)}`);
    console.log(`   Tokens: ${JSON.stringify(result.usage)}`);
  }

  // 6. Save results
  const outputDir = path.join(PATHS.outputDir, taskName, modelName);
  fs.mkdirSync(outputDir, { recursive: true });

  const timestamp = new Date().toISOString().split('T')[0];
  const runId = `run-${Date.now()}`;

  // Save task snapshot (only if new)
  const snapshotPath = path.join(outputDir, `task-snapshot-${task.hash}.md`);
  if (!fs.existsSync(snapshotPath)) {
    fs.writeFileSync(snapshotPath, task.content);
    console.log(`\n📸 Saved task snapshot: ${snapshotPath}`);
  }

  // Save result
  const resultFile = {
    meta: {
      task: taskName,
      task_hash: task.hash,
      model: modelName,
      model_id: modelConfig.model_id,
      timestamp,
      run_id: runId,
    },
    metrics: {
      latency_seconds: result.latency,
      cost_usd: result.cost,
      tokens: result.usage,
    },
    input: {
      path: path.basename(testInputPath),
      size_chars: testInput.length,
    },
    output: result.content,
  };

  const resultPath = path.join(outputDir, `${runId}.yaml`);
  fs.writeFileSync(resultPath, formatAsYaml(resultFile));
  console.log(`💾 Saved result: ${resultPath}`);

  return { task, result, outputDir, runId };
}

function formatAsYaml(obj) {
  let yaml = `# Cross-Provider Test Result\n# Generated: ${new Date().toISOString()}\n\n`;

  yaml += 'meta:\n';
  yaml += `  task: "${obj.meta.task}"\n`;
  yaml += `  task_hash: "${obj.meta.task_hash}"\n`;
  yaml += `  model: "${obj.meta.model}"\n`;
  yaml += `  model_id: "${obj.meta.model_id}"\n`;
  yaml += `  timestamp: "${obj.meta.timestamp}"\n`;
  yaml += `  run_id: "${obj.meta.run_id}"\n\n`;

  yaml += 'metrics:\n';
  yaml += `  latency_seconds: ${obj.metrics.latency_seconds?.toFixed(1) || 'null'}\n`;
  yaml += `  cost_usd: ${obj.metrics.cost_usd?.toFixed(4) || 'null'}\n`;
  if (obj.metrics.tokens) {
    yaml += '  tokens:\n';
    yaml += `    prompt: ${obj.metrics.tokens.prompt_tokens}\n`;
    yaml += `    completion: ${obj.metrics.tokens.completion_tokens}\n`;
    yaml += `    total: ${obj.metrics.tokens.total_tokens}\n`;
  }
  yaml += '\n';

  yaml += 'input:\n';
  yaml += `  path: "${obj.input.path}"\n`;
  yaml += `  size_chars: ${obj.input.size_chars}\n\n`;

  yaml += 'output: |\n';
  if (obj.output) {
    obj.output.split('\n').forEach(line => {
      yaml += `  ${line}\n`;
    });
  } else {
    yaml += '  null\n';
  }

  return yaml;
}

// ============================================================================
// CLI
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.length === 0) {
    console.log(`
Cross-Provider Model Qualification Runner

Usage:
  node cross-provider-runner.js --task <name> --model <model> --input <file>

Options:
  --task    Task name (e.g., extract-knowledge, extract-voice-dna)
  --model   Model to test (${Object.keys(MODELS).join(', ')})
  --input   Input file (filename in inputs/ or full path)
  --temp    Temperature (default: ${DEFAULTS.temperature})
  --tokens  Max tokens (default: ${DEFAULTS.maxTokens})

Paths (from squad-config.yaml):
  Tasks:  ${PATHS.tasksDir}
  Output: ${PATHS.outputDir}
  Inputs: ${PATHS.inputsDir}

Examples:
  # Using input filename (auto-resolves to inputs/ dir)
  node cross-provider-runner.js --task extract-knowledge --model glm5 --input hormozi-value-equation.md

  # Using relative path
  node cross-provider-runner.js --task extract-voice-dna --model glm5 --input ./my-input.md
    `);
    process.exit(0);
  }

  const getArg = (name) => {
    const idx = args.indexOf(`--${name}`);
    return idx !== -1 ? args[idx + 1] : null;
  };

  const taskName = getArg('task');
  const modelName = getArg('model');
  const inputArg = getArg('input');
  const temperature = parseFloat(getArg('temp')) || DEFAULTS.temperature;
  const maxTokens = parseInt(getArg('tokens')) || DEFAULTS.maxTokens;

  if (!taskName || !modelName || !inputArg) {
    console.error('❌ Missing required arguments. Use --help for usage.');
    process.exit(1);
  }

  try {
    await runTest(taskName, modelName, inputArg, { temperature, maxTokens });
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

main();
