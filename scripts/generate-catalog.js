#!/usr/bin/env node

/**
 * AIOX Catalog Generator
 *
 * Scans the codebase and generates a comprehensive catalog of:
 * - Squads
 * - Skills
 * - Tools
 * - Agents
 *
 * Usage: node scripts/generate-catalog.js
 */

const fs = require('fs');
const path = require('path');
// Simple YAML key extractor (avoids js-yaml dependency)
function simpleYamlValue(content, key) {
  const match = content.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  return match ? match[1].trim().replace(/^['"]|['"]$/g, '') : null;
}

const ROOT = process.cwd();
const SQUADS_DIR = path.join(ROOT, 'squads');
const SKILLS_DIR = path.join(ROOT, '.aios', 'skills');
const TOOLS_DIR = path.join(ROOT, 'tools');
const AGENTS_DIR = path.join(ROOT, '.claude', 'commands', 'AIOS', 'agents');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Extract squad metadata
 */
function extractSquads() {
  log('📦 Scanning squads...', 'cyan');

  const squads = [];

  if (!fs.existsSync(SQUADS_DIR)) {
    log('⚠️  Squads directory not found', 'yellow');
    return squads;
  }

  const items = fs.readdirSync(SQUADS_DIR)
    .filter(item => {
      const fullPath = path.join(SQUADS_DIR, item);
      return fs.statSync(fullPath).isDirectory() && !item.startsWith('_');
    })
    .sort();

  items.forEach(squadDir => {
    const squadPath = path.join(SQUADS_DIR, squadDir);
    const yamlPath = path.join(squadPath, 'squad.yaml');
    const readmePath = path.join(squadPath, 'README.md');

    let name = squadDir;
    let description = 'Sem descrição';

    // Try YAML first
    if (fs.existsSync(yamlPath)) {
      try {
        const content = fs.readFileSync(yamlPath, 'utf8');
        name = simpleYamlValue(content, 'name') || squadDir;
        const desc = simpleYamlValue(content, 'description');
        if (desc) {
          description = desc.substring(0, 200);
        }
      } catch (e) {
        // Ignore YAML errors
      }
    }

    // Fallback to README
    if (description === 'Sem descrição' && fs.existsSync(readmePath)) {
      try {
        const content = fs.readFileSync(readmePath, 'utf8');
        const lines = content.split('\n');
        for (const line of lines) {
          if (line.startsWith('# ') && !line.startsWith('## ')) {
            description = line.replace(/^#+\s*/, '').replace(/[#*~\-`]/g, '').trim().substring(0, 200);
            break;
          }
          if (line.startsWith('>')) {
            description = line.replace(/^>\s*/, '').trim().substring(0, 200);
            break;
          }
        }
      } catch (e) {
        // Ignore
      }
    }

    squads.push({
      name,
      slug: squadDir,
      description
    });
  });

  log(`✓ Found ${squads.length} squads`, 'green');
  return squads;
}

/**
 * Extract skills metadata
 */
function extractSkills() {
  log('⚡ Scanning skills...', 'cyan');

  const skills = [];

  if (!fs.existsSync(SKILLS_DIR)) {
    log('⚠️  Skills directory not found', 'yellow');
    return skills;
  }

  const items = fs.readdirSync(SKILLS_DIR)
    .filter(item => {
      const fullPath = path.join(SKILLS_DIR, item);
      return fs.statSync(fullPath).isDirectory() && !item.startsWith('.');
    })
    .sort();

  items.forEach(skillName => {
    const skillPath = path.join(SKILLS_DIR, skillName);
    const skillMdPath = path.join(skillPath, 'SKILL.md');
    const readmePath = path.join(skillPath, 'README.md');

    let description = 'Sem descrição';

    if (fs.existsSync(skillMdPath)) {
      try {
        const content = fs.readFileSync(skillMdPath, 'utf8');
        const lines = content.split('\n');
        for (const line of lines) {
          if (line.startsWith('# ')) {
            description = line.replace('# ', '').trim().substring(0, 200);
            break;
          }
        }
      } catch (e) {
        // Ignore
      }
    } else if (fs.existsSync(readmePath)) {
      try {
        const content = fs.readFileSync(readmePath, 'utf8');
        const lines = content.split('\n');
        for (const line of lines) {
          if (line.startsWith('# ')) {
            description = line.replace('# ', '').trim().substring(0, 200);
            break;
          }
        }
      } catch (e) {
        // Ignore
      }
    }

    skills.push({
      name: skillName,
      description
    });
  });

  log(`✓ Found ${skills.length} skills`, 'green');
  return skills;
}

/**
 * Extract tools metadata
 */
function extractTools() {
  log('🔧 Scanning tools...', 'cyan');

  const tools = [];

  if (!fs.existsSync(TOOLS_DIR)) {
    log('⚠️  Tools directory not found', 'yellow');
    return tools;
  }

  const items = fs.readdirSync(TOOLS_DIR)
    .filter(item => {
      const fullPath = path.join(TOOLS_DIR, item);
      return fs.statSync(fullPath).isDirectory() &&
             !item.startsWith('.') &&
             !item.startsWith('__');
    })
    .sort();

  items.forEach(toolName => {
    const toolPath = path.join(TOOLS_DIR, toolName);
    const readmePath = path.join(toolPath, 'README.md');

    let description = 'Sem descrição';

    if (fs.existsSync(readmePath)) {
      try {
        const content = fs.readFileSync(readmePath, 'utf8');
        const lines = content.split('\n');
        for (const line of lines) {
          if (line.startsWith('# ')) {
            description = line.replace('# ', '').trim().substring(0, 200);
            break;
          }
        }
      } catch (e) {
        // Ignore
      }
    }

    tools.push({
      name: toolName,
      description
    });
  });

  log(`✓ Found ${tools.length} tools`, 'green');
  return tools;
}

/**
 * Extract agents metadata (hardcoded, from system knowledge)
 */
function extractAgents() {
  log('👥 Loading agents...', 'cyan');

  const agents = [
    {
      id: '@dev',
      persona: 'Dex',
      scope: 'Implementação de código, git add/commit, branch management'
    },
    {
      id: '@qa',
      persona: 'Quinn',
      scope: 'Testes e qualidade, QA gates, code review'
    },
    {
      id: '@architect',
      persona: 'Aria',
      scope: 'Arquitetura e design técnico, technology selection'
    },
    {
      id: '@pm',
      persona: 'Morgan',
      scope: 'Product Management, epic orchestration, requirements'
    },
    {
      id: '@po',
      persona: 'Pax',
      scope: 'Product Owner, story validation, backlog prioritization'
    },
    {
      id: '@sm',
      persona: 'River',
      scope: 'Scrum Master, story creation, sprint management'
    },
    {
      id: '@analyst',
      persona: 'Alex',
      scope: 'Pesquisa e análise de dados'
    },
    {
      id: '@data-engineer',
      persona: 'Dara',
      scope: 'Database design, schema DDL, query optimization'
    },
    {
      id: '@ux-design-expert',
      persona: 'Uma',
      scope: 'UX/UI design, design systems, user research'
    },
    {
      id: '@devops',
      persona: 'Gage',
      scope: 'CI/CD, git push (EXCLUSIVO), MCP management, infrastructure'
    },
    {
      id: '@aios-master',
      persona: 'Master',
      scope: 'Framework governance, constitutional enforcement'
    },
    {
      id: '@squad-creator',
      persona: 'Scout',
      scope: 'Squad creation, workspace setup, onboarding'
    }
  ];

  log(`✓ Loaded ${agents.length} agents`, 'green');
  return agents;
}

/**
 * Generate markdown catalog
 */
function generateMarkdown(squads, skills, tools, agents) {
  const date = new Date().toLocaleDateString('pt-BR');

  let markdown = `# AIOX Catalog

> Gerado automaticamente em ${date}

---

## Squads (${squads.length})

| Squad | Descrição | Ativação |
|-------|-----------|----------|
`;

  squads.forEach(squad => {
    markdown += `| ${squad.name} | ${squad.description} | \`/${squad.slug}\` |\n`;
  });

  markdown += `\n---\n\n## Skills (${skills.length})

| Skill | Descrição | Ativação |
|-------|-----------|----------|
`;

  skills.forEach(skill => {
    markdown += `| ${skill.name} | ${skill.description} | \`/AIOS:skills:${skill.name}\` |\n`;
  });

  markdown += `\n---\n\n## Tools (${tools.length})

| Tool | Descrição |
|------|-----------|
`;

  tools.forEach(tool => {
    markdown += `| ${tool.name} | ${tool.description} |\n`;
  });

  markdown += `\n---\n\n## Agents (${agents.length})

| Agent | Persona | Escopo |
|-------|---------|--------|
`;

  agents.forEach(agent => {
    markdown += `| ${agent.id} | ${agent.persona} | ${agent.scope} |\n`;
  });

  markdown += `\n---\n\n## Quick Reference

### Slash Commands Pattern
- **Squads:** \`/squad-name\` (ex: \`/agent-autonomy\`, \`/kaizen\`)
- **Skills:** \`/AIOS:skills:skill-name\` (ex: \`/AIOS:skills:book-to-markdown\`)
- **Agents:** \`@agent-id\` (ex: \`@dev\`, \`@architect\`)

### Common Workflows

#### Story Development Cycle
\`\`\`
@sm *create-story → @po *validate → @dev *develop → @qa *qa-gate → @devops *push
\`\`\`

#### Spec Pipeline
\`\`\`
@pm *gather → @architect *assess → @analyst *research → @pm *spec → @qa *critique
\`\`\`

#### Brownfield Discovery
\`\`\`
@architect *audit → @data-engineer *schema-review → @ux-design-expert *frontend-spec → @qa *validate
\`\`\`

---

## Data Completeness

| Categoria | Total | Coverage |
|-----------|-------|----------|
| Squads | ${squads.length} | 100% |
| Skills | ${skills.length} | 100% |
| Tools | ${tools.length} | 100% |
| Agents | ${agents.length} | 100% |

---

*AIOX Catalog — CLI First | Observability Second | UI Third*
`;

  return markdown;
}

/**
 * Sync slash commands — ensure every squad has a README.md in .claude/commands/, .gemini/commands/, .codex/commands/
 */
function syncCommands(squads) {
  log('🔗 Syncing slash commands...', 'cyan');

  const models = ['claude', 'gemini', 'codex'];
  let totalCreated = 0;

  models.forEach(model => {
    const commandsDir = path.join(ROOT, `.${model}`, 'commands');
    let modelCreated = 0;

    squads.forEach(squad => {
      const cmdDir = path.join(commandsDir, squad.slug);
      const cmdReadme = path.join(cmdDir, 'README.md');

      if (!fs.existsSync(cmdDir)) {
        fs.mkdirSync(cmdDir, { recursive: true });
      }

      if (!fs.existsSync(cmdReadme)) {
        // Copy README from squad source, or generate minimal one
        const srcReadme = path.join(SQUADS_DIR, squad.slug, 'README.md');
        if (fs.existsSync(srcReadme)) {
          fs.copyFileSync(srcReadme, cmdReadme);
        } else {
          fs.writeFileSync(cmdReadme, `# ${squad.name}\n\n${squad.description}\n`, 'utf8');
        }
        modelCreated++;
      }
    });

    if (modelCreated > 0) {
      log(`✓ ${model}: Created ${modelCreated} missing command(s)`, 'green');
    } else {
      log(`✓ ${model}: All commands in sync`, 'green');
    }

    totalCreated += modelCreated;
  });

  if (totalCreated === 0) {
    log('✓ All models synchronized', 'green');
  }
}

/**
 * Main execution
 */
function main() {
  try {
    log('\n🚀 AIOX Catalog Generator', 'blue');
    log('========================\n', 'blue');

    // Extract data
    const squads = extractSquads();
    const skills = extractSkills();
    const tools = extractTools();
    const agents = extractAgents();

    // Sync slash commands
    syncCommands(squads);

    // Generate markdown
    log('\n📝 Generating markdown...', 'cyan');
    const markdown = generateMarkdown(squads, skills, tools, agents);

    // Write file
    const outputPath = path.join(ROOT, '.aios-core', 'data', 'catalog.md');
    fs.writeFileSync(outputPath, markdown, 'utf8');

    log(`✓ Catalog written to ${outputPath}`, 'green');

    // Summary
    log('\n📊 Summary', 'blue');
    log(`  Squads:  ${squads.length}`, 'green');
    log(`  Skills:  ${skills.length}`, 'green');
    log(`  Tools:   ${tools.length}`, 'green');
    log(`  Agents:  ${agents.length}`, 'green');
    log('\n✨ Done!\n', 'green');

    process.exit(0);
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'yellow');
    console.error(error);
    process.exit(1);
  }
}

main();
