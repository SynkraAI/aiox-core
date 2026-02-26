'use strict';

const fs = require('fs');
const path = require('path');

const AGENTS_DIR = path.join(__dirname, '..', '..', '.aios-core', 'development', 'agents');

const AGENT_IDS = [
  'dev', 'qa', 'devops', 'architect', 'po', 'pm',
  'analyst', 'sm', 'data-engineer', 'ux'
];

describe('MEMORY.md Structured Format', () => {
  const agentFiles = AGENT_IDS.map((id) => ({
    id,
    filePath: path.join(AGENTS_DIR, id, 'MEMORY.md'),
  }));

  test.each(agentFiles)('$id/MEMORY.md has "## Active Patterns" heading', ({ filePath }) => {
    const content = fs.readFileSync(filePath, 'utf8');
    expect(content).toMatch(/^## Active Patterns$/m);
  });

  test.each(agentFiles)('$id/MEMORY.md has "## Promotion Candidates" heading', ({ filePath }) => {
    const content = fs.readFileSync(filePath, 'utf8');
    expect(content).toMatch(/^## Promotion Candidates$/m);
  });

  test.each(agentFiles)('$id/MEMORY.md has "## Archived" heading', ({ filePath }) => {
    const content = fs.readFileSync(filePath, 'utf8');
    expect(content).toMatch(/^## Archived$/m);
  });

  test.each(agentFiles)('$id/MEMORY.md sections appear in correct order (Active → Promotion → Archived)', ({ filePath }) => {
    const content = fs.readFileSync(filePath, 'utf8');
    const activeIdx = content.indexOf('## Active Patterns');
    const promotionIdx = content.indexOf('## Promotion Candidates');
    const archivedIdx = content.indexOf('## Archived');

    expect(activeIdx).toBeGreaterThan(-1);
    expect(promotionIdx).toBeGreaterThan(-1);
    expect(archivedIdx).toBeGreaterThan(-1);
    expect(activeIdx).toBeLessThan(promotionIdx);
    expect(promotionIdx).toBeLessThan(archivedIdx);
  });

  test('all 10 agent MEMORY.md files exist and conform to structure', () => {
    for (const { id, filePath } of agentFiles) {
      expect(fs.existsSync(filePath)).toBe(true);
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toMatch(/^## Active Patterns$/m);
      expect(content).toMatch(/^## Promotion Candidates$/m);
      expect(content).toMatch(/^## Archived$/m);
    }
    expect(agentFiles).toHaveLength(10);
  });

  test.each(agentFiles)('$id/MEMORY.md has non-empty Active Patterns section', ({ filePath }) => {
    const content = fs.readFileSync(filePath, 'utf8');
    const activeStart = content.indexOf('## Active Patterns');
    const promotionStart = content.indexOf('## Promotion Candidates');
    const activeSection = content.slice(activeStart + '## Active Patterns'.length, promotionStart).trim();
    expect(activeSection.length).toBeGreaterThan(0);
  });
});
