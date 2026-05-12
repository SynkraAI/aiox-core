/**
 * Constitution Generator Tests
 *
 * Tests for parseConstitution(), extractRules(), generateConstitution(),
 * cleanText(), and main() entry point.
 *
 * @story SYN-8 - Domain Content Files
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const {
  parseConstitution,
  extractRules,
  generateConstitution,
  cleanText,
  main,
  ROMAN_TO_ARABIC,
} = require('../../.aiox-core/core/synapse/scripts/generate-constitution');
const { parseManifest, loadDomainFile } = require('../../.aiox-core/core/synapse/domain/domain-loader');

// Set timeout for all tests
jest.setTimeout(30000);

/**
 * Helper: create a temp directory for testing
 */
function createTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'synapse-constitution-test-'));
}

/**
 * Helper: clean up temp directory
 */
function cleanupTempDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

/**
 * Fixture: minimal constitution with 2 articles
 */
const MINIMAL_CONSTITUTION = `# Constitution

## Core Principles

### I. CLI First (NON-NEGOTIABLE)

Description text.

**Regras:**
- MUST: All functionality works via CLI first
- MUST: Dashboards only observe, never control

---

### II. Agent Authority (NON-NEGOTIABLE)

Description text.

**Regras:**
- MUST: Only @devops can git push
- MUST: Agents must delegate appropriately
- MUST NOT: No agent can assume another's authority

---

## Governance

Amendment process here.
`;

/**
 * Fixture: full 6-article constitution matching real format
 */
const FULL_CONSTITUTION = `# Synkra AIOX Constitution

> **Version:** 1.0.0

## Core Principles

### I. CLI First (NON-NEGOTIABLE)

O CLI e a fonte da verdade.

**Regras:**
- MUST: Toda funcionalidade nova DEVE funcionar 100% via CLI
- MUST: Dashboards apenas observam, NUNCA controlam
- MUST: A UI NUNCA e requisito para operacao do sistema
- MUST: Ao decidir onde implementar, sempre CLI > Observability > UI

---

### II. Agent Authority (NON-NEGOTIABLE)

Cada agente tem autoridades exclusivas.

**Regras:**
- MUST: Apenas @devops pode executar \`git push\` para remote
- MUST: Apenas @devops pode criar Pull Requests
- MUST: Apenas @devops pode criar releases e tags
- MUST: Agentes DEVEM delegar para o agente apropriado
- MUST: Nenhum agente pode assumir autoridade de outro

---

### III. Story-Driven Development (MUST)

Todo desenvolvimento comeca com uma story.

**Regras:**
- MUST: Nenhum codigo e escrito sem uma story associada
- MUST: Stories DEVEM ter acceptance criteria claros
- MUST: Progresso DEVE ser rastreado via checkboxes
- MUST: File List DEVE ser mantida atualizada
- SHOULD: Stories seguem o workflow padrao

---

### IV. No Invention (MUST)

Especificacoes nao inventam.

**Regras:**
- MUST: Todo statement em spec.md DEVE rastrear para:
- MUST NOT: Adicionar features nao presentes nos requisitos
- MUST NOT: Assumir detalhes de implementacao nao pesquisados
- MUST NOT: Especificar tecnologias nao validadas

---

### V. Quality First (MUST)

Qualidade nao e negociavel.

**Regras:**
- MUST: npm run lint passa sem erros
- MUST: npm run typecheck passa sem erros
- MUST: npm test passa sem falhas
- MUST: npm run build completa com sucesso
- MUST: CodeRabbit nao reporta issues CRITICAL
- MUST: Story status e Done ou Ready for Review
- SHOULD: Cobertura de testes nao diminui

---

### VI. Absolute Imports (SHOULD)

Imports relativos criam acoplamento.

**Regras:**
- SHOULD: Sempre usar imports absolutos com alias @/
- SHOULD NOT: Usar imports relativos (../../../)
- EXCEPTION: Imports dentro do mesmo modulo podem ser relativos

---

## Governance

Amendment process here.
`;

describe('cleanText', () => {
  test('should remove backticks from text', () => {
    expect(cleanText('`git push` para remote')).toBe('git push para remote');
  });

  test('should trim whitespace', () => {
    expect(cleanText('  hello world  ')).toBe('hello world');
  });

  test('should handle text without backticks', () => {
    expect(cleanText('plain text')).toBe('plain text');
  });
});

describe('ROMAN_TO_ARABIC', () => {
  test('should map Roman numerals I-VI correctly', () => {
    expect(ROMAN_TO_ARABIC['I']).toBe(1);
    expect(ROMAN_TO_ARABIC['II']).toBe(2);
    expect(ROMAN_TO_ARABIC['III']).toBe(3);
    expect(ROMAN_TO_ARABIC['IV']).toBe(4);
    expect(ROMAN_TO_ARABIC['V']).toBe(5);
    expect(ROMAN_TO_ARABIC['VI']).toBe(6);
  });
});

describe('extractRules', () => {
  test('should extract MUST rules from article content', () => {
    const content = `### I. CLI First (NON-NEGOTIABLE)

**Regras:**
- MUST: Rule one
- MUST: Rule two
`;
    const rules = extractRules(content);
    expect(rules).toEqual(['MUST: Rule one', 'MUST: Rule two']);
  });

  test('should extract mixed rule types', () => {
    const content = `### IV. No Invention (MUST)

- MUST: Required rule
- MUST NOT: Forbidden action
- SHOULD: Recommended practice
- SHOULD NOT: Discouraged practice
- EXCEPTION: Special case allowed
`;
    const rules = extractRules(content);
    expect(rules).toHaveLength(5);
    expect(rules[0]).toBe('MUST: Required rule');
    expect(rules[1]).toBe('MUST NOT: Forbidden action');
    expect(rules[2]).toBe('SHOULD: Recommended practice');
    expect(rules[3]).toBe('SHOULD NOT: Discouraged practice');
    expect(rules[4]).toBe('EXCEPTION: Special case allowed');
  });

  test('should ignore non-rule lines', () => {
    const content = `### I. Title (SEV)

Description text here.
Some more context.

**Regras:**
- MUST: Only this is a rule

**Gate:** some gate info
`;
    const rules = extractRules(content);
    expect(rules).toEqual(['MUST: Only this is a rule']);
  });

  test('should clean backticks from rule text', () => {
    const content = `### II. Auth (NON-NEGOTIABLE)

- MUST: Only @devops can \`git push\` to remote
`;
    const rules = extractRules(content);
    expect(rules).toEqual(['MUST: Only @devops can git push to remote']);
  });
});

describe('parseConstitution', () => {
  test('should parse minimal constitution with 2 articles', () => {
    const articles = parseConstitution(MINIMAL_CONSTITUTION);
    expect(articles).toHaveLength(2);

    expect(articles[0].number).toBe(1);
    expect(articles[0].roman).toBe('I');
    expect(articles[0].title).toBe('CLI First');
    expect(articles[0].severity).toBe('NON-NEGOTIABLE');
    expect(articles[0].rules).toHaveLength(2);

    expect(articles[1].number).toBe(2);
    expect(articles[1].roman).toBe('II');
    expect(articles[1].title).toBe('Agent Authority');
    expect(articles[1].severity).toBe('NON-NEGOTIABLE');
    expect(articles[1].rules).toHaveLength(3);
  });

  test('should parse full 6-article constitution', () => {
    const articles = parseConstitution(FULL_CONSTITUTION);
    expect(articles).toHaveLength(6);

    // Verify all articles extracted
    expect(articles[0].title).toBe('CLI First');
    expect(articles[1].title).toBe('Agent Authority');
    expect(articles[2].title).toBe('Story-Driven Development');
    expect(articles[3].title).toBe('No Invention');
    expect(articles[4].title).toBe('Quality First');
    expect(articles[5].title).toBe('Absolute Imports');

    // Verify severities
    expect(articles[0].severity).toBe('NON-NEGOTIABLE');
    expect(articles[1].severity).toBe('NON-NEGOTIABLE');
    expect(articles[2].severity).toBe('MUST');
    expect(articles[5].severity).toBe('SHOULD');
  });

  test('should return empty array for null/undefined input', () => {
    expect(parseConstitution(null)).toEqual([]);
    expect(parseConstitution(undefined)).toEqual([]);
    expect(parseConstitution('')).toEqual([]);
  });

  test('should return empty array for non-string input', () => {
    expect(parseConstitution(123)).toEqual([]);
    expect(parseConstitution({})).toEqual([]);
  });

  test('should return empty array for content with no articles', () => {
    const content = '# Just a header\n\nSome text without articles.';
    expect(parseConstitution(content)).toEqual([]);
  });

  test('should stop parsing before Governance section', () => {
    const articles = parseConstitution(FULL_CONSTITUTION);
    const lastArticle = articles[articles.length - 1];
    // Should not include governance content in any article's rules
    for (const article of articles) {
      for (const rule of article.rules) {
        expect(rule).not.toContain('Amendment');
      }
    }
  });

  test('should correctly number articles using Roman numerals', () => {
    const articles = parseConstitution(FULL_CONSTITUTION);
    expect(articles[0].number).toBe(1);
    expect(articles[1].number).toBe(2);
    expect(articles[2].number).toBe(3);
    expect(articles[3].number).toBe(4);
    expect(articles[4].number).toBe(5);
    expect(articles[5].number).toBe(6);
  });
});

describe('generateConstitution', () => {
  test('should generate KEY=VALUE format from articles', () => {
    const articles = parseConstitution(MINIMAL_CONSTITUTION);
    const output = generateConstitution(articles);

    expect(output).toContain('CONSTITUTION_RULE_ART1_0=CLI First (NON-NEGOTIABLE)');
    expect(output).toContain('CONSTITUTION_RULE_ART1_1=MUST: All functionality works via CLI first');
    expect(output).toContain('CONSTITUTION_RULE_ART2_0=Agent Authority (NON-NEGOTIABLE)');
    expect(output).toContain('CONSTITUTION_RULE_ART2_1=MUST: Only @devops can git push');
  });

  test('should include header comments', () => {
    const articles = parseConstitution(MINIMAL_CONSTITUTION);
    const output = generateConstitution(articles);

    expect(output).toContain('# SYNAPSE Constitution Domain (L0)');
    expect(output).toContain('# Auto-generated from .aiox-core/constitution.md');
    expect(output).toContain('# DO NOT EDIT MANUALLY');
  });

  test('should include article section comments', () => {
    const articles = parseConstitution(MINIMAL_CONSTITUTION);
    const output = generateConstitution(articles);

    expect(output).toContain('# Article I: CLI First (NON-NEGOTIABLE)');
    expect(output).toContain('# Article II: Agent Authority (NON-NEGOTIABLE)');
  });

  test('should handle empty articles array', () => {
    const output = generateConstitution([]);
    expect(output).toContain('# SYNAPSE Constitution Domain (L0)');
    // Should only have header lines, no rules
    const ruleLines = output.split('\n').filter(l => l.startsWith('CONSTITUTION_RULE'));
    expect(ruleLines).toHaveLength(0);
  });

  test('output should be parseable by domain-loader loadDomainFile', () => {
    const articles = parseConstitution(FULL_CONSTITUTION);
    const output = generateConstitution(articles);

    let tempDir;
    try {
      tempDir = createTempDir();
      const filePath = path.join(tempDir, 'constitution');
      fs.writeFileSync(filePath, output, 'utf8');

      // loadDomainFile detects KEY=VALUE format and extracts values
      const rules = loadDomainFile(filePath);
      expect(rules.length).toBeGreaterThan(0);

      // First rule is Article 1 title (value extracted from key)
      expect(rules[0]).toBe('CLI First (NON-NEGOTIABLE)');
      // Should contain rules from Article 1 and Article 6
      expect(rules.some(r => r.includes('CLI'))).toBe(true);
      expect(rules.some(r => r.includes('Absolute Imports'))).toBe(true);
    } finally {
      if (tempDir) cleanupTempDir(tempDir);
    }
  });
});

describe('main', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  test('should generate constitution file from source', () => {
    const constitutionPath = path.join(tempDir, 'constitution.md');
    const outputPath = path.join(tempDir, 'output', 'constitution');

    fs.writeFileSync(constitutionPath, FULL_CONSTITUTION, 'utf8');

    const result = main({ constitutionPath, outputPath });

    expect(result.success).toBe(true);
    expect(result.articles).toBe(6);
    expect(result.rules).toBeGreaterThan(0);
    expect(fs.existsSync(outputPath)).toBe(true);
  });

  test('should be idempotent — re-run produces same content', () => {
    const constitutionPath = path.join(tempDir, 'constitution.md');
    const outputPath = path.join(tempDir, 'output', 'constitution');

    fs.writeFileSync(constitutionPath, FULL_CONSTITUTION, 'utf8');

    main({ constitutionPath, outputPath });
    const firstRun = fs.readFileSync(outputPath, 'utf8');

    main({ constitutionPath, outputPath });
    const secondRun = fs.readFileSync(outputPath, 'utf8');

    expect(firstRun).toBe(secondRun);
  });

  test('should handle missing constitution.md gracefully', () => {
    const constitutionPath = path.join(tempDir, 'nonexistent.md');
    const outputPath = path.join(tempDir, 'output', 'constitution');

    const result = main({ constitutionPath, outputPath });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Constitution file not found');
    expect(fs.existsSync(outputPath)).toBe(false);
  });

  test('should handle constitution with no articles', () => {
    const constitutionPath = path.join(tempDir, 'empty.md');
    const outputPath = path.join(tempDir, 'output', 'constitution');

    fs.writeFileSync(constitutionPath, '# Empty doc\n\nNo articles here.', 'utf8');

    const result = main({ constitutionPath, outputPath });

    expect(result.success).toBe(false);
    expect(result.error).toBe('No articles found');
  });

  test('should create output directory if it does not exist', () => {
    const constitutionPath = path.join(tempDir, 'constitution.md');
    const outputPath = path.join(tempDir, 'deep', 'nested', 'dir', 'constitution');

    fs.writeFileSync(constitutionPath, MINIMAL_CONSTITUTION, 'utf8');

    const result = main({ constitutionPath, outputPath });

    expect(result.success).toBe(true);
    expect(fs.existsSync(outputPath)).toBe(true);
  });

  test('should overwrite existing output file', () => {
    const constitutionPath = path.join(tempDir, 'constitution.md');
    const outputDir = path.join(tempDir, 'output');
    const outputPath = path.join(outputDir, 'constitution');

    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(outputPath, 'OLD CONTENT', 'utf8');
    fs.writeFileSync(constitutionPath, MINIMAL_CONSTITUTION, 'utf8');

    const result = main({ constitutionPath, outputPath });

    expect(result.success).toBe(true);
    const content = fs.readFileSync(outputPath, 'utf8');
    expect(content).not.toContain('OLD CONTENT');
    expect(content).toContain('CONSTITUTION_RULE_ART1_0');
  });
});

describe('integration: real constitution.md', () => {
  const realConstitutionPath = path.join(__dirname, '..', '..', '.aiox-core', 'constitution.md');

  test('should parse real constitution.md with 6 articles', () => {
    // Skip if constitution.md doesn't exist (CI environment)
    if (!fs.existsSync(realConstitutionPath)) {
      return;
    }

    const content = fs.readFileSync(realConstitutionPath, 'utf8');
    const articles = parseConstitution(content);

    expect(articles).toHaveLength(6);
    expect(articles[0].title).toBe('CLI First');
    expect(articles[5].title).toBe('Absolute Imports');
  });

  test('should generate valid constitution from real source', () => {
    if (!fs.existsSync(realConstitutionPath)) {
      return;
    }

    let tempDir;
    try {
      tempDir = createTempDir();
      const outputPath = path.join(tempDir, 'constitution');

      const result = main({ constitutionPath: realConstitutionPath, outputPath });

      expect(result.success).toBe(true);
      expect(result.articles).toBe(6);

      // Verify output is loadable by domain-loader
      const rules = loadDomainFile(outputPath);
      expect(rules.length).toBeGreaterThan(20);
    } finally {
      if (tempDir) cleanupTempDir(tempDir);
    }
  });
});

describe('integration: manifest parseability', () => {
  test('should validate .synapse/manifest is parseable by domain-loader', () => {
    const manifestPath = path.join(__dirname, '..', '..', '.synapse', 'manifest');

    // Skip if manifest doesn't exist yet
    if (!fs.existsSync(manifestPath)) {
      return;
    }

    const result = parseManifest(manifestPath);

    expect(result.devmode).toBe(false);
    expect(Object.keys(result.domains).length).toBeGreaterThanOrEqual(19);
    expect(result.domains.CONSTITUTION).toBeDefined();
    expect(result.domains.CONSTITUTION.nonNegotiable).toBe(true);
    expect(result.domains.AGENT_DEV).toBeDefined();
    expect(result.domains.AGENT_DEV.agentTrigger).toBe('dev');
  });
});
