'use strict';

const fs = require('fs');
const path = require('path');

const CLAUDE_MD_PATH = path.join(__dirname, '..', '..', '.claude', 'CLAUDE.md');

describe('CLAUDE.md Ownership Annotations', () => {
  let content;

  beforeAll(() => {
    content = fs.readFileSync(CLAUDE_MD_PATH, 'utf8');
  });

  test('CLAUDE.md contains FRAMEWORK-OWNED annotations', () => {
    expect(content).toContain('<!-- FRAMEWORK-OWNED:');
  });

  test('CLAUDE.md contains PROJECT-CUSTOMIZED annotations', () => {
    expect(content).toContain('<!-- PROJECT-CUSTOMIZED:');
  });

  test('annotation count matches expected sections (9 framework + 6 project = 15 total)', () => {
    const frameworkMatches = content.match(/<!-- FRAMEWORK-OWNED:/g) || [];
    const projectMatches = content.match(/<!-- PROJECT-CUSTOMIZED:/g) || [];

    // 9 FRAMEWORK-OWNED: Constitution, Language, CLI First, Estrutura, Boundary, Agentes, Story-Driven, Otimizacao, MCP
    expect(frameworkMatches.length).toBe(9);
    // 6 PROJECT-CUSTOMIZED: Padroes, Testes, Git, Comandos, Debug, Tool Selection (TOK-2)
    expect(projectMatches.length).toBe(6);
  });

  test('framework-owned sections appear before project-customized sections', () => {
    const firstFramework = content.indexOf('<!-- FRAMEWORK-OWNED:');
    const firstProject = content.indexOf('<!-- PROJECT-CUSTOMIZED:');

    expect(firstFramework).toBeGreaterThan(-1);
    expect(firstProject).toBeGreaterThan(-1);
    expect(firstFramework).toBeLessThan(firstProject);
  });
});
