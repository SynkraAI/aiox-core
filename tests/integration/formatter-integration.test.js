/**
 * Integration Tests for Output Formatter
 * 
 * Story: 6.1.6 - Output Formatter Implementation
 * Tests formatter integration with real task execution
 */

const PersonalizedOutputFormatter = require('../../.aiox-core/infrastructure/scripts/output-formatter');
const OutputPatternValidator = require('../../.aiox-core/infrastructure/scripts/validate-output-pattern');
const fs = require('fs');
const path = require('path');

// Mock fs for agent file reading
jest.mock('fs');

describe('Formatter Integration', () => {
  let mockAgent;
  let mockTask;
  let mockResults;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup dev agent (Dex - Builder)
    mockAgent = {
      id: 'dev',
      name: 'Dex',
      title: 'Full Stack Developer',
    };

    mockTask = {
      name: 'develop-story',
    };

    mockResults = {
      startTime: '2025-01-15T10:00:00Z',
      endTime: '2025-01-15T10:02:30Z',
      duration: '2.5s',
      tokens: { total: 1800 },
      success: true,
      output: `Created files:
- .aiox-core/scripts/output-formatter.js
- .aiox-core/scripts/validate-output-pattern.js
- .aiox-core/templates/task-execution-report.md

All tests passing.`,
      tests: { passed: 50, total: 50 },
      coverage: 85,
      linting: { status: '✅ Clean' },
    };

    // Mock dev agent file
    const mockDevAgentContent = `# dev

\`\`\`yaml
agent:
  name: Dex
  id: dev
  title: Full Stack Developer

persona_profile:
  archetype: Builder
  zodiac: "♒ Aquarius"
  communication:
    tone: pragmatic
    emoji_frequency: medium
    vocabulary:
      - construir
      - implementar
      - refatorar
      - resolver
      - otimizar
      - debugar
      - testar
    greeting_levels:
      minimal: "💻 dev Agent ready"
      named: "💻 Dex (Builder) ready. Let's build something great!"
      archetypal: "💻 Dex the Builder ready to innovate!"
    signature_closing: "— Dex, sempre construindo 🔨"
\`\`\`
`;

    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(mockDevAgentContent);
  });

  test('develop-story task uses formatter successfully', () => {
    // 1. Load dev agent (Dex - Builder)
    const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);

    // 2. Execute formatter
    const formattedOutput = formatter.format();

    // 3. Capture formatted output
    expect(formattedOutput).toBeDefined();
    expect(formattedOutput.length).toBeGreaterThan(0);

    // 4. Validate structure compliance
    const validator = new OutputPatternValidator();
    const validation = validator.validate(formattedOutput);

    expect(validation.valid).toBe(true);
    expect(validation.errors.length).toBe(0);

    // 5. Verify personality injection (vocabulary, tone, signature)
    expect(formattedOutput).toContain('Dex (Builder)');
    expect(formattedOutput).toContain('Tá pronto!'); // Pragmatic tone
    expect(formattedOutput).toContain('— Dex, sempre construindo 🔨'); // Signature

    // 6. Verify metrics section last
    const lines = formattedOutput.split('\n');
    const metricsIndex = lines.findIndex(line => line === '### Metrics');
    const signatureIndex = lines.findIndex(line => line.includes('— Dex'));
    
    expect(metricsIndex).toBeGreaterThan(-1);
    expect(signatureIndex).toBeGreaterThan(metricsIndex);

    // 7. Verify performance <50ms
    const start = process.hrtime.bigint();
    formatter.format();
    const duration = Number(process.hrtime.bigint() - start) / 1000000;

    expect(duration).toBeLessThan(50);
  });

  test('formatter output passes validator for all sections', () => {
    const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);
    const output = formatter.format();
    const validator = new OutputPatternValidator();
    const result = validator.validate(output);

    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  test('formatter maintains fixed structure positions', () => {
    const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);
    const output = formatter.format();
    const lines = output.split('\n');

    // Find header start
    const headerIndex = lines.findIndex(line => line === '## 📊 Task Execution Report');
    expect(headerIndex).toBeGreaterThan(-1);

    // Duration should be on line 7 (headerIndex + 6)
    expect(lines[headerIndex + 6]).toMatch(/^\*\*Duration:\*\*/);

    // Tokens should be on line 8 (headerIndex + 7)
    expect(lines[headerIndex + 7]).toMatch(/^\*\*Tokens Used:\*\*/);
  });

  test('formatter injects personality correctly', () => {
    const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);
    const output = formatter.format();

    // Check agent name and archetype
    expect(output).toContain('**Agent:** Dex (Builder)');

    // Check pragmatic tone message
    expect(output).toContain('Tá pronto!');

    // Check signature
    expect(output).toContain('— Dex, sempre construindo 🔨');
  });

  test('formatter handles task-specific output correctly', () => {
    const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);
    const output = formatter.format();

    expect(output).toContain('### Output');
    expect(output).toContain('Created files:');
    expect(output).toContain('output-formatter.js');
  });

  test('formatter includes metrics correctly', () => {
    const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);
    const output = formatter.format();

    expect(output).toContain('### Metrics');
    expect(output).toContain('Tests: 50/50');
    expect(output).toContain('Coverage: 85%');
    expect(output).toContain('Linting: ✅ Clean');
  });

  test('formatter performance meets target', () => {
    const iterations = 10;
    const times = [];

    for (let i = 0; i < iterations; i++) {
      const formatter = new PersonalizedOutputFormatter(mockAgent, mockTask, mockResults);
      const start = process.hrtime.bigint();
      formatter.format();
      const duration = Number(process.hrtime.bigint() - start) / 1000000;
      times.push(duration);
    }

    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const p95Time = times.sort((a, b) => a - b)[Math.floor(times.length * 0.95)];

    expect(avgTime).toBeLessThan(50);
    expect(p95Time).toBeLessThan(50);
  });
});

