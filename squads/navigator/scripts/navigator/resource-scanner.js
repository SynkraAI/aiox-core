#!/usr/bin/env node

/**
 * Resource Scanner — Dynamic Discovery
 *
 * Scans filesystem for squads, tools, and skills at runtime.
 * Returns structured data for INDEX.md generation.
 *
 * Used by: nav-create-project-auto.md
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const PROJECT_ROOT = path.resolve(__dirname, '../../../..');

/**
 * Scan squads/ directory for all available squads
 */
function scanSquads() {
  const squadsDir = path.join(PROJECT_ROOT, 'squads');
  const entries = fs.readdirSync(squadsDir, { withFileTypes: true });

  const squads = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;

    const squadPath = path.join(squadsDir, entry.name);
    const squadYaml = path.join(squadPath, 'squad.yaml');
    const readmePath = path.join(squadPath, 'README.md');

    let description = 'Squad disponível';

    // Try to extract description from squad.yaml
    if (fs.existsSync(squadYaml)) {
      try {
        const config = yaml.load(fs.readFileSync(squadYaml, 'utf8'));
        description = config.description || config.squad?.description || description;
      } catch (err) {
        // Ignore parse errors
      }
    }

    // Fallback to first line of README
    if (description === 'Squad disponível' && fs.existsSync(readmePath)) {
      try {
        const readme = fs.readFileSync(readmePath, 'utf8');
        const firstLine = readme.split('\n').find(line => line.trim() && !line.startsWith('#'));
        if (firstLine) {
          description = firstLine.trim().substring(0, 80);
        }
      } catch (err) {
        // Ignore read errors
      }
    }

    squads.push({
      name: entry.name,
      description: description,
    });
  }

  return squads.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Scan tools/ directory for all available tools
 */
function scanTools() {
  const toolsDir = path.join(PROJECT_ROOT, 'tools');

  if (!fs.existsSync(toolsDir)) {
    return [];
  }

  const entries = fs.readdirSync(toolsDir, { withFileTypes: true });
  const tools = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name === '__pycache__' || entry.name === 'node_modules' || entry.name.startsWith('.')) continue;

    const toolPath = path.join(toolsDir, entry.name);
    const readmePath = path.join(toolPath, 'README.md');

    let description = 'Tool disponível';

    // Try to extract description from README
    if (fs.existsSync(readmePath)) {
      try {
        const readme = fs.readFileSync(readmePath, 'utf8');
        const firstLine = readme.split('\n').find(line => line.trim() && !line.startsWith('#'));
        if (firstLine) {
          description = firstLine.trim().substring(0, 80);
        }
      } catch (err) {
        // Ignore read errors
      }
    }

    tools.push({
      name: entry.name,
      description: description,
    });
  }

  return tools.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Scan .aios/skills/ directory for all available skills
 */
function scanSkills() {
  const skillsDir = path.join(PROJECT_ROOT, '.aios/skills');

  if (!fs.existsSync(skillsDir)) {
    return [];
  }

  const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
  const skills = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;

    const skillPath = path.join(skillsDir, entry.name);
    const skillMd = path.join(skillPath, 'SKILL.md');
    const readmePath = path.join(skillPath, 'README.md');

    let description = 'Skill disponível';

    // Try to extract description from SKILL.md frontmatter or README
    if (fs.existsSync(skillMd)) {
      try {
        const content = fs.readFileSync(skillMd, 'utf8');
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

        if (frontmatterMatch) {
          const frontmatter = yaml.load(frontmatterMatch[1]);
          description = frontmatter.description || description;
        } else {
          // Fallback to first non-header line
          const firstLine = content.split('\n').find(line => line.trim() && !line.startsWith('#'));
          if (firstLine) {
            description = firstLine.trim().substring(0, 80);
          }
        }
      } catch (err) {
        // Ignore parse errors
      }
    } else if (fs.existsSync(readmePath)) {
      try {
        const readme = fs.readFileSync(readmePath, 'utf8');
        const firstLine = readme.split('\n').find(line => line.trim() && !line.startsWith('#'));
        if (firstLine) {
          description = firstLine.trim().substring(0, 80);
        }
      } catch (err) {
        // Ignore read errors
      }
    }

    skills.push({
      name: entry.name,
      activation: `/AIOS:skills:${entry.name}`,
      description: description,
    });
  }

  return skills.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Main scan function - returns all resources
 */
function scanAllResources() {
  return {
    squads: scanSquads(),
    tools: scanTools(),
    skills: scanSkills(),
    timestamp: new Date().toISOString(),
  };
}

/**
 * CLI usage
 */
if (require.main === module) {
  const resources = scanAllResources();

  console.log('=== SQUADS ===');
  console.log(`Found ${resources.squads.length} squads:`);
  resources.squads.forEach(s => console.log(`  - ${s.name}: ${s.description}`));

  console.log('\n=== TOOLS ===');
  console.log(`Found ${resources.tools.length} tools:`);
  resources.tools.forEach(t => console.log(`  - ${t.name}: ${t.description}`));

  console.log('\n=== SKILLS ===');
  console.log(`Found ${resources.skills.length} skills:`);
  resources.skills.forEach(s => console.log(`  - ${s.name}: ${s.description}`));

  console.log(`\nScanned at: ${resources.timestamp}`);
}

module.exports = { scanAllResources, scanSquads, scanTools, scanSkills };
