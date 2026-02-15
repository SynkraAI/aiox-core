#!/usr/bin/env node

/**
 * SYNAPSE Package Builder — Creates a distributable ZIP for collaborators.
 *
 * Usage: node scripts/package-synapse.js
 * Output: synapse-package.zip in project root
 *
 * The ZIP contains all SYNAPSE files organized by category with a
 * README-INSTALL.md tutorial for setting up SYNAPSE in a new project.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, '.synapse-package');
const ZIP_NAME = 'synapse-package.zip';

// ── File manifest ──────────────────────────────────────────────────────────

const FILES = {
  // Core Engine
  'core/engine.js': '.aios-core/core/synapse/engine.js',
  'core/context/context-tracker.js': '.aios-core/core/synapse/context/context-tracker.js',
  'core/domain/domain-loader.js': '.aios-core/core/synapse/domain/domain-loader.js',
  'core/layers/layer-processor.js': '.aios-core/core/synapse/layers/layer-processor.js',
  'core/layers/l0-constitution.js': '.aios-core/core/synapse/layers/l0-constitution.js',
  'core/layers/l1-global.js': '.aios-core/core/synapse/layers/l1-global.js',
  'core/layers/l2-agent.js': '.aios-core/core/synapse/layers/l2-agent.js',
  'core/layers/l3-workflow.js': '.aios-core/core/synapse/layers/l3-workflow.js',
  'core/layers/l4-task.js': '.aios-core/core/synapse/layers/l4-task.js',
  'core/layers/l5-squad.js': '.aios-core/core/synapse/layers/l5-squad.js',
  'core/layers/l6-keyword.js': '.aios-core/core/synapse/layers/l6-keyword.js',
  'core/layers/l7-star-command.js': '.aios-core/core/synapse/layers/l7-star-command.js',
  'core/memory/memory-bridge.js': '.aios-core/core/synapse/memory/memory-bridge.js',
  'core/output/formatter.js': '.aios-core/core/synapse/output/formatter.js',
  'core/session/session-manager.js': '.aios-core/core/synapse/session/session-manager.js',
  'core/scripts/generate-constitution.js': '.aios-core/core/synapse/scripts/generate-constitution.js',
  'core/utils/paths.js': '.aios-core/core/synapse/utils/paths.js',
  'core/utils/tokens.js': '.aios-core/core/synapse/utils/tokens.js',

  // Diagnostics
  'core/diagnostics/synapse-diagnostics.js': '.aios-core/core/synapse/diagnostics/synapse-diagnostics.js',
  'core/diagnostics/report-formatter.js': '.aios-core/core/synapse/diagnostics/report-formatter.js',
  'core/diagnostics/collectors/safe-read-json.js': '.aios-core/core/synapse/diagnostics/collectors/safe-read-json.js',
  'core/diagnostics/collectors/hook-collector.js': '.aios-core/core/synapse/diagnostics/collectors/hook-collector.js',
  'core/diagnostics/collectors/session-collector.js': '.aios-core/core/synapse/diagnostics/collectors/session-collector.js',
  'core/diagnostics/collectors/manifest-collector.js': '.aios-core/core/synapse/diagnostics/collectors/manifest-collector.js',
  'core/diagnostics/collectors/pipeline-collector.js': '.aios-core/core/synapse/diagnostics/collectors/pipeline-collector.js',
  'core/diagnostics/collectors/uap-collector.js': '.aios-core/core/synapse/diagnostics/collectors/uap-collector.js',
  'core/diagnostics/collectors/timing-collector.js': '.aios-core/core/synapse/diagnostics/collectors/timing-collector.js',
  'core/diagnostics/collectors/quality-collector.js': '.aios-core/core/synapse/diagnostics/collectors/quality-collector.js',
  'core/diagnostics/collectors/consistency-collector.js': '.aios-core/core/synapse/diagnostics/collectors/consistency-collector.js',
  'core/diagnostics/collectors/output-analyzer.js': '.aios-core/core/synapse/diagnostics/collectors/output-analyzer.js',
  'core/diagnostics/collectors/relevance-matrix.js': '.aios-core/core/synapse/diagnostics/collectors/relevance-matrix.js',

  // Hook Entry Point
  'hook/synapse-engine.js': '.claude/hooks/synapse-engine.js',

  // Commands
  'commands/manager.md': '.claude/commands/synapse/manager.md',
  'commands/tasks/add-rule.md': '.claude/commands/synapse/tasks/add-rule.md',
  'commands/tasks/create-command.md': '.claude/commands/synapse/tasks/create-command.md',
  'commands/tasks/create-domain.md': '.claude/commands/synapse/tasks/create-domain.md',
  'commands/tasks/diagnose-synapse.md': '.claude/commands/synapse/tasks/diagnose-synapse.md',
  'commands/tasks/edit-rule.md': '.claude/commands/synapse/tasks/edit-rule.md',
  'commands/tasks/suggest-domain.md': '.claude/commands/synapse/tasks/suggest-domain.md',
  'commands/tasks/toggle-domain.md': '.claude/commands/synapse/tasks/toggle-domain.md',
  'commands/templates/domain-template': '.claude/commands/synapse/templates/domain-template',
  'commands/templates/manifest-entry-template': '.claude/commands/synapse/templates/manifest-entry-template',
  'commands/utils/manifest-parser-reference.md': '.claude/commands/synapse/utils/manifest-parser-reference.md',

  // Skills
  'skills/SKILL.md': '.claude/skills/synapse/SKILL.md',
  'skills/references/brackets.md': '.claude/skills/synapse/references/brackets.md',
  'skills/references/commands.md': '.claude/skills/synapse/references/commands.md',
  'skills/references/domains.md': '.claude/skills/synapse/references/domains.md',
  'skills/references/layers.md': '.claude/skills/synapse/references/layers.md',
  'skills/references/manifest.md': '.claude/skills/synapse/references/manifest.md',
  'skills/assets/README.md': '.claude/skills/synapse/assets/README.md',

  // Documentation
  'docs/SYNAPSE-FLOWCHARTS.md': 'docs/architecture/SYNAPSE/SYNAPSE-FLOWCHARTS.md',
  'docs/DESIGN-SYNAPSE-ENGINE.md': 'docs/architecture/SYNAPSE/docs/DESIGN-SYNAPSE-ENGINE.md',
};

// Runtime domain files to copy from .synapse/
const RUNTIME_DOMAINS = [
  'manifest', 'constitution', 'global', 'context', 'commands',
  'agent-dev', 'agent-qa', 'agent-architect', 'agent-pm', 'agent-po',
  'agent-sm', 'agent-devops', 'agent-analyst', 'agent-data-engineer',
  'agent-ux', 'agent-aios-master', 'agent-squad-creator',
  'workflow-story-dev', 'workflow-epic-create', 'workflow-arch-review',
];

// ── Build ──────────────────────────────────────────────────────────────────

function main() {
  console.log('Building SYNAPSE package...\n');

  // Clean
  if (fs.existsSync(OUT_DIR)) fs.rmSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // Copy files
  let copied = 0;
  let missing = 0;
  for (const [dest, src] of Object.entries(FILES)) {
    const srcPath = path.join(ROOT, src);
    const destPath = path.join(OUT_DIR, dest);
    if (!fs.existsSync(srcPath)) {
      console.warn(`  SKIP (missing): ${src}`);
      missing++;
      continue;
    }
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.copyFileSync(srcPath, destPath);
    copied++;
  }

  // Copy runtime domains
  const runtimeDir = path.join(OUT_DIR, 'runtime');
  fs.mkdirSync(runtimeDir, { recursive: true });
  for (const domain of RUNTIME_DOMAINS) {
    const srcPath = path.join(ROOT, '.synapse', domain);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, path.join(runtimeDir, domain));
      copied++;
    } else {
      console.warn(`  SKIP (runtime): .synapse/${domain}`);
      missing++;
    }
  }

  // Copy tests
  const testsDir = path.join(OUT_DIR, 'tests');
  copyDirRecursive(path.join(ROOT, 'tests', 'synapse'), testsDir);

  // Generate README-INSTALL.md
  generateReadme(OUT_DIR);

  console.log(`\nCopied: ${copied} files | Missing: ${missing} files`);

  // Create ZIP
  const zipPath = path.join(ROOT, ZIP_NAME);
  if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);

  try {
    // Use PowerShell Compress-Archive on Windows
    execSync(
      `powershell -Command "Compress-Archive -Path '${OUT_DIR}\\*' -DestinationPath '${zipPath}' -Force"`,
      { stdio: 'inherit' },
    );
    console.log(`\nZIP created: ${ZIP_NAME}`);
    console.log(`Size: ${(fs.statSync(zipPath).size / 1024).toFixed(1)} KB`);
  } catch (err) {
    console.error('Failed to create ZIP:', err.message);
    console.log(`Package directory still available at: ${OUT_DIR}`);
  }

  // Cleanup temp dir
  if (fs.existsSync(zipPath) && fs.existsSync(OUT_DIR)) {
    fs.rmSync(OUT_DIR, { recursive: true });
  }
}

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function generateReadme(outDir) {
  const content = `# SYNAPSE Context Engine — Installation Guide

## What is SYNAPSE?

SYNAPSE (Synkra Adaptive Processing & State Engine) is the JIT context injection
engine for AIOS. On every user prompt, it injects \`<synapse-rules>\` with adaptive
contextual rules through an 8-layer pipeline.

## Prerequisites

- **Node.js** 18+
- **Claude Code** CLI with hook support
- **AIOS Core** installed (\`npx aios-core install\`)

## Quick Install

### 1. Copy Core Engine

Copy the \`core/\` directory to your project:

\`\`\`
cp -r core/ <your-project>/.aios-core/core/synapse/
\`\`\`

### 2. Copy Hook Entry Point

\`\`\`
cp hook/synapse-engine.js <your-project>/.claude/hooks/
\`\`\`

### 3. Register the Hook

Add to \`.claude/settings.local.json\`:

\`\`\`json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "type": "command",
        "command": "node .claude/hooks/synapse-engine.js"
      }
    ]
  }
}
\`\`\`

### 4. Copy Runtime Domains

\`\`\`
cp -r runtime/ <your-project>/.synapse/
mkdir -p <your-project>/.synapse/sessions
mkdir -p <your-project>/.synapse/metrics
mkdir -p <your-project>/.synapse/cache
\`\`\`

### 5. Copy Commands & Skills (Optional)

\`\`\`
cp -r commands/ <your-project>/.claude/commands/synapse/
cp -r skills/ <your-project>/.claude/skills/synapse/
\`\`\`

### 6. Update .gitignore

Add these lines:

\`\`\`
.synapse/sessions/
.synapse/metrics/
.synapse/cache/
!.claude/hooks/synapse-engine.js
\`\`\`

## Verification

After installation, activate any agent and run:

\`\`\`
/synapse:tasks:diagnose-synapse
\`\`\`

Expected: All checks PASS, Context Quality grade B or higher.

## Architecture

See \`docs/SYNAPSE-FLOWCHARTS.md\` for complete visual architecture including:
- 8-layer pipeline flow
- Context brackets (FRESH/MODERATE/DEPLETED/CRITICAL)
- Domain system
- Session management
- Diagnostics pipeline (10 collectors)
- Metrics persistence

## Tests

Copy \`tests/\` to your project and run:

\`\`\`bash
npx jest synapse
\`\`\`

Expected: 749+ tests passing.

## File Structure

\`\`\`
synapse-package/
├── README-INSTALL.md          # This file
├── core/                      # Engine source (.aios-core/core/synapse/)
│   ├── engine.js              # Main orchestrator
│   ├── context/               # Bracket tracker
│   ├── domain/                # Manifest + domain loader
│   ├── layers/                # L0-L7 layer processors
│   ├── memory/                # MIS bridge (Pro)
│   ├── output/                # XML formatter
│   ├── session/               # Session manager
│   ├── diagnostics/           # Observability (10 collectors)
│   ├── scripts/               # Constitution generator
│   └── utils/                 # Path + token helpers
├── hook/                      # .claude/hooks/synapse-engine.js
├── commands/                  # .claude/commands/synapse/
├── skills/                    # .claude/skills/synapse/
├── runtime/                   # .synapse/ domain files (manifest, domains)
├── docs/                      # Architecture documentation
└── tests/                     # Full test suite (749+ tests)
\`\`\`

---

*SYNAPSE Context Engine v2.0 — Synkra AIOS*
*Generated: ${new Date().toISOString().split('T')[0]}*
`;

  fs.writeFileSync(path.join(outDir, 'README-INSTALL.md'), content, 'utf8');
}

main();
