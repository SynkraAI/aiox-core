#!/usr/bin/env node

/**
 * Task Migration Helper - V1.0 to V2.0
 * 
 * Semi-automated migration helper that adds missing V2.0 sections to tasks.
 * Requires manual review and content filling.
 * 
 * Usage:
 *   node migrate-task-to-v2.js <task-file>     # Migrate single task
 * 
 * Process:
 *   1. Reads existing task
 *   2. Identifies missing V2.0 sections
 *   3. Adds section templates with TODO markers
 *   4. Creates backup of original
 *   5. Saves migrated version
 */

const fs = require('fs');
const path = require('path');

const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
};

/**
 * V2.0 Section Templates
 */
const sectionTemplates = {
  executionModes: `## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)
- Autonomous decision making with logging
- Minimal user interaction
- **Best for:** Simple, deterministic tasks

### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**
- Explicit decision checkpoints
- Educational explanations
- **Best for:** Learning, complex decisions

### 3. Pre-Flight Planning - Comprehensive Upfront Planning
- Task analysis phase (identify all ambiguities)
- Zero ambiguity execution
- **Best for:** Ambiguous requirements, critical work

**Parameter:** \`mode\` (optional, default: \`interactive\`)

---
`,

  taskDefinition: `## Task Definition (AIOX Task Format V1.0)

\`\`\`yaml
task: {TODO: task identifier}
responsável: {TODO: Agent Name}
responsavel_type: Agente
atomic_layer: {TODO: Atom|Molecule|Organism}

**Entrada:**
- campo: {TODO: fieldName}
  tipo: {TODO: string|number|boolean}
  origem: {TODO: User Input | config | Step X}
  obrigatório: true
  validação: {TODO: validation rule}

**Saída:**
- campo: {TODO: fieldName}
  tipo: {TODO: type}
  destino: {TODO: output | state | Step Y}
  persistido: true
\`\`\`

---
`,

  preConditions: `## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

\`\`\`yaml
pre-conditions:
  - [ ] {TODO: condition description}
    tipo: pre-condition
    blocker: true
    validação: |
      {TODO: validation logic}
    error_message: "{TODO: error message}"
\`\`\`

---
`,

  postConditions: `## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

\`\`\`yaml
post-conditions:
  - [ ] {TODO: verification step}
    tipo: post-condition
    blocker: true
    validação: |
      {TODO: validation logic}
    error_message: "{TODO: error message}"
\`\`\`

---
`,

  acceptanceCriteria: `## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

\`\`\`yaml
acceptance-criteria:
  - [ ] {TODO: acceptance criterion}
    tipo: acceptance-criterion
    blocker: true
    validação: |
      {TODO: validation logic}
    error_message: "{TODO: error message}"
\`\`\`

---
`,

  tools: `## Tools

**External/shared resources used by this task:**

- **Tool:** N/A
  - **Purpose:** {TODO: what this tool does}
  - **Source:** {TODO: where to find it}

---
`,

  scripts: `## Scripts

**Agent-specific code for this task:**

- **Script:** N/A
  - **Purpose:** {TODO: what this script does}
  - **Language:** {TODO: JavaScript | Python | Bash}
  - **Location:** {TODO: file path}

---
`,

  errorHandling: `## Error Handling

**Strategy:** {TODO: Fail-fast | Graceful degradation | Retry with backoff}

**Common Errors:**

1. **Error:** {TODO: error type}
   - **Cause:** {TODO: why it happens}
   - **Resolution:** {TODO: how to fix}
   - **Recovery:** {TODO: automated recovery steps}

---
`,

  performance: `## Performance

**Expected Metrics:**

\`\`\`yaml
duration_expected: {TODO: X minutes}
cost_estimated: {TODO: $X}
token_usage: {TODO: ~X tokens}
\`\`\`

**Optimization Notes:**
- {TODO: performance tips}

---
`,

  metadata: `## Metadata

\`\`\`yaml
story: {TODO: Story ID or N/A}
version: 1.0.0
dependencies:
  - {TODO: dependency file or N/A}
tags:
  - {TODO: tag1}
  - {TODO: tag2}
updated_at: ${new Date().toISOString().split('T')[0]}
\`\`\`

---
`,
};

/**
 * Check which sections are missing in the task
 */
function analyzeMissingSections(content) {
  const checks = {
    executionModes: !content.includes('## Execution Modes') && !content.includes('# Execution Modes'),
    taskDefinition: !(content.includes('responsável:') && content.includes('atomic_layer:')),
    entrada: !content.includes('**Entrada:**'),
    saida: !content.includes('**Saída:**'),
    preConditions: !content.includes('pre-conditions:'),
    postConditions: !content.includes('post-conditions:'),
    acceptanceCriteria: !content.includes('acceptance-criteria:'),
    tools: !(content.includes('## Tools') || content.includes('**Tools:**')),
    scripts: !(content.includes('## Scripts') || content.includes('**Scripts:**')),
    errorHandling: !(content.includes('## Error Handling') && content.includes('strategy:')),
    performance: !(content.includes('duration_expected:') && content.includes('cost_estimated:')),
    metadata: !(content.includes('## Metadata') && content.includes('story:') && content.includes('version:')),
  };

  return checks;
}

/**
 * Migrate a task file to V2.0 format
 */
function migrateTask(filePath) {
  const fileName = path.basename(filePath);
  
  console.log(`${colors.cyan}📝 Migrating: ${fileName}${colors.reset}\n`);

  // Read original file
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Analyze missing sections
  const missing = analyzeMissingSections(content);
  const missingSections = Object.keys(missing).filter(k => missing[k]);

  if (missingSections.length === 0) {
    console.log(`${colors.green}✅ Task already V2.0 compliant!${colors.reset}\n`);
    return;
  }

  console.log(`${colors.yellow}Missing sections (${missingSections.length}):${colors.reset}`);
  missingSections.forEach(section => {
    console.log(`   - ${section}`);
  });
  console.log();

  // Create backup
  const backupPath = filePath.replace('.md', '.v1-backup.md');
  fs.writeFileSync(backupPath, content, 'utf8');
  console.log(`${colors.green}✅ Backup created: ${path.basename(backupPath)}${colors.reset}`);

  // Build migrated content
  let migratedContent = content;

  // Find insertion point (usually after Purpose or first major section)
  const purposeIndex = content.indexOf('## Purpose');
  const insertionPoint = purposeIndex !== -1 
    ? content.indexOf('\n---\n', purposeIndex) + 5
    : content.indexOf('\n##', 100); // Fallback: after first heading

  if (insertionPoint === -1 || insertionPoint === 4) {
    console.log(`${colors.yellow}⚠ Could not find insertion point. Adding sections at end.${colors.reset}`);
  }

  // Add missing sections
  let sectionsToAdd = '\n';
  
  if (missing.executionModes) {
    sectionsToAdd += sectionTemplates.executionModes + '\n';
  }
  
  if (missing.taskDefinition || missing.entrada || missing.saida) {
    sectionsToAdd += sectionTemplates.taskDefinition + '\n';
  }
  
  if (missing.preConditions) {
    sectionsToAdd += sectionTemplates.preConditions + '\n';
  }
  
  if (missing.postConditions) {
    sectionsToAdd += sectionTemplates.postConditions + '\n';
  }
  
  if (missing.acceptanceCriteria) {
    sectionsToAdd += sectionTemplates.acceptanceCriteria + '\n';
  }
  
  if (missing.tools) {
    sectionsToAdd += sectionTemplates.tools + '\n';
  }
  
  if (missing.scripts) {
    sectionsToAdd += sectionTemplates.scripts + '\n';
  }
  
  if (missing.errorHandling) {
    sectionsToAdd += sectionTemplates.errorHandling + '\n';
  }
  
  if (missing.performance) {
    sectionsToAdd += sectionTemplates.performance + '\n';
  }
  
  if (missing.metadata) {
    sectionsToAdd += sectionTemplates.metadata + '\n';
  }

  // Insert sections
  if (insertionPoint > 0) {
    migratedContent = 
      content.substring(0, insertionPoint) +
      sectionsToAdd +
      content.substring(insertionPoint);
  } else {
    migratedContent = content + '\n' + sectionsToAdd;
  }

  // Save migrated file
  fs.writeFileSync(filePath, migratedContent, 'utf8');
  console.log(`${colors.green}✅ Migration complete: ${fileName}${colors.reset}`);
  console.log(`${colors.yellow}⚠ IMPORTANT: Review and fill TODO markers${colors.reset}\n`);

  // Run validation
  console.log(`${colors.cyan}🔍 Validating migrated task...${colors.reset}`);
  const validatePath = path.join(__dirname, 'validate-task-v2.js');
  const { execSync } = require('child_process');
  
  try {
    execSync(`node "${validatePath}" "${filePath}"`, { stdio: 'inherit' });
  } catch (_error) {
    // Validation failed - expected for TODOs
    console.log(`${colors.yellow}⚠ Validation failed - fill TODOs and re-validate${colors.reset}\n`);
  }
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node migrate-task-to-v2.js <task-file>');
    console.log('');
    console.log('Example:');
    console.log('  node migrate-task-to-v2.js .aiox-core/tasks/dev-develop-story.md');
    process.exit(0);
  }

  const taskFile = args[0];
  
  if (!fs.existsSync(taskFile)) {
    console.error(`${colors.yellow}✗ File not found: ${taskFile}${colors.reset}`);
    process.exit(2);
  }

  migrateTask(taskFile);
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { migrateTask, analyzeMissingSections };

