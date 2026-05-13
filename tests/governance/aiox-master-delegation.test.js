'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

describe('aiox-master delegation authority', () => {
  const publishedSurfaces = [
    '.aiox-core/development/agents/aiox-master.md',
    '.claude/skills/AIOX/agents/aiox-master/SKILL.md',
    '.claude/rules/agent-authority.md',
    '.aiox-core/data/aiox-kb.md',
  ];

  const forbiddenAuthorityPhrases = [
    'Execute ANY task directly',
    'No restrictions',
    'Universal executor of all Synkra AIOX capabilities',
    'Execute any resource directly without persona transformation',
    'Can execute any task from any agent directly',
    'All capabilities without switching',
    'CAN do any task without switching agents',
  ];

  test.each(publishedSurfaces)('%s does not grant universal execution authority', relativePath => {
    const content = read(relativePath);

    for (const phrase of forbiddenAuthorityPhrases) {
      expect(content).not.toContain(phrase);
    }
  });

  test('canonical aiox-master agent requires pre-execution delegation checks', () => {
    const content = read('.aiox-core/development/agents/aiox-master.md');

    expect(content).toContain('MANDATORY PRE-EXECUTION CHECK');
    expect(content).toContain('delegate specialized work by default');
    expect(content).toContain("Story creation is @sm's exclusive domain");
    expect(content).toContain('GitHub, PR, release, MCP');
  });

  test('agent authority rules make delegation the default for specialized work', () => {
    const content = read('.claude/rules/agent-authority.md');

    expect(content).toContain('Delegation is the default for specialized work');
    expect(content).toContain('Story creation → @sm');
    expect(content).toContain('Direct execution of exclusive specialized tasks without `--force-execute`');
  });
});
