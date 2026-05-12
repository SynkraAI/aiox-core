/**
 * Domain Loader + Manifest Parser Tests
 *
 * Tests for parseManifest(), loadDomainFile(), isExcluded(),
 * matchKeywords(), and helper functions.
 *
 * @story SYN-1 - Domain Loader + Manifest Parser
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const {
  parseManifest,
  loadDomainFile,
  isExcluded,
  matchKeywords,
  extractDomainInfo,
  domainNameToFile,
  KNOWN_SUFFIXES,
  GLOBAL_KEYS,
} = require('../../.aiox-core/core/synapse/domain/domain-loader');

// Set timeout for all tests
jest.setTimeout(30000);

/**
 * Helper: create a temp directory with files for testing
 */
function createTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'synapse-test-'));
}

/**
 * Helper: clean up temp directory
 */
function cleanupTempDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

describe('parseManifest', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  test('should parse a valid manifest with all domain attributes', () => {
    // Given: a manifest file with all supported attributes
    const manifestPath = path.join(tempDir, 'manifest');
    fs.writeFileSync(manifestPath, [
      '# SYNAPSE Manifest',
      'GLOBAL_STATE=active',
      'GLOBAL_ALWAYS_ON=true',
      'CONSTITUTION_STATE=active',
      'CONSTITUTION_ALWAYS_ON=true',
      'CONSTITUTION_NON_NEGOTIABLE=true',
      'AGENT_DEV_STATE=active',
      'AGENT_DEV_AGENT_TRIGGER=dev',
      'WORKFLOW_STORY_DEV_STATE=active',
      'WORKFLOW_STORY_DEV_WORKFLOW_TRIGGER=story_development',
      'MYDOMAIN_STATE=active',
      'MYDOMAIN_RECALL=keyword1,keyword2',
      'MYDOMAIN_EXCLUDE=skip,ignore',
      'DEVMODE=false',
      'GLOBAL_EXCLUDE=skip,ignore',
    ].join('\n'));

    // When: parsing the manifest
    const result = parseManifest(manifestPath);

    // Then: all domains and global flags are parsed correctly
    expect(result.devmode).toBe(false);
    expect(result.globalExclude).toEqual(['skip', 'ignore']);
    expect(result.domains.GLOBAL).toEqual({
      state: 'active',
      alwaysOn: true,
      file: 'global',
    });
    expect(result.domains.CONSTITUTION).toEqual({
      state: 'active',
      alwaysOn: true,
      nonNegotiable: true,
      file: 'constitution',
    });
    expect(result.domains.AGENT_DEV).toEqual({
      state: 'active',
      agentTrigger: 'dev',
      file: 'agent-dev',
    });
    expect(result.domains.WORKFLOW_STORY_DEV).toEqual({
      state: 'active',
      workflowTrigger: 'story_development',
      file: 'workflow-story-dev',
    });
    expect(result.domains.MYDOMAIN).toEqual({
      state: 'active',
      recall: ['keyword1', 'keyword2'],
      exclude: ['skip', 'ignore'],
      file: 'mydomain',
    });
  });

  test('should return empty config when manifest does not exist', () => {
    // Given: a path to a non-existent manifest
    const manifestPath = path.join(tempDir, 'nonexistent-manifest');

    // When: parsing
    const result = parseManifest(manifestPath);

    // Then: graceful empty config returned
    expect(result.devmode).toBe(false);
    expect(result.globalExclude).toEqual([]);
    expect(result.domains).toEqual({});
  });

  test('should handle empty manifest file', () => {
    // Given: an empty manifest file
    const manifestPath = path.join(tempDir, 'manifest');
    fs.writeFileSync(manifestPath, '');

    // When: parsing
    const result = parseManifest(manifestPath);

    // Then: empty config returned
    expect(result.devmode).toBe(false);
    expect(result.globalExclude).toEqual([]);
    expect(result.domains).toEqual({});
  });

  test('should skip comments and empty lines', () => {
    // Given: manifest with comments and blank lines
    const manifestPath = path.join(tempDir, 'manifest');
    fs.writeFileSync(manifestPath, [
      '# This is a comment',
      '',
      '  # Another comment with leading spaces',
      '  ',
      'GLOBAL_STATE=active',
    ].join('\n'));

    // When: parsing
    const result = parseManifest(manifestPath);

    // Then: only the valid line is parsed
    expect(Object.keys(result.domains)).toEqual(['GLOBAL']);
    expect(result.domains.GLOBAL.state).toBe('active');
  });

  test('should handle malformed lines gracefully', () => {
    // Given: manifest with malformed lines (no '=' sign)
    const manifestPath = path.join(tempDir, 'manifest');
    fs.writeFileSync(manifestPath, [
      'NO_EQUALS_SIGN',
      'VALID_STATE=active',
      '=no_key',
      'ANOTHER_MALFORMED',
    ].join('\n'));

    // When: parsing
    const result = parseManifest(manifestPath);

    // Then: only valid line is parsed, malformed lines skipped
    expect(result.domains.VALID).toEqual({
      state: 'active',
      file: 'valid',
    });
  });

  test('should parse DEVMODE=true correctly', () => {
    // Given: manifest with DEVMODE enabled
    const manifestPath = path.join(tempDir, 'manifest');
    fs.writeFileSync(manifestPath, 'DEVMODE=true');

    // When: parsing
    const result = parseManifest(manifestPath);

    // Then: devmode is true
    expect(result.devmode).toBe(true);
  });

  test('should handle value with equals signs', () => {
    // Given: a manifest where value contains '=' (e.g., base64)
    const manifestPath = path.join(tempDir, 'manifest');
    fs.writeFileSync(manifestPath, 'MYDOM_RECALL=a=b,c=d');

    // When: parsing
    const result = parseManifest(manifestPath);

    // Then: value split only on first '='
    expect(result.domains.MYDOM.recall).toEqual(['a=b', 'c=d']);
  });

  test('should skip keys with no known suffix', () => {
    // Given: manifest with keys that have no recognized suffix
    const manifestPath = path.join(tempDir, 'manifest');
    fs.writeFileSync(manifestPath, [
      'RANDOM_KEY=value',
      'ANOTHER_UNKNOWN=data',
      'GLOBAL_STATE=active',
    ].join('\n'));

    // When: parsing
    const result = parseManifest(manifestPath);

    // Then: unknown keys are skipped, valid ones parsed
    expect(Object.keys(result.domains)).toEqual(['GLOBAL']);
  });

  test('should handle Windows-style line endings (CRLF)', () => {
    // Given: manifest with CRLF line endings
    const manifestPath = path.join(tempDir, 'manifest');
    fs.writeFileSync(manifestPath, 'GLOBAL_STATE=active\r\nDEVMODE=true\r\n');

    // When: parsing
    const result = parseManifest(manifestPath);

    // Then: parsed correctly
    expect(result.domains.GLOBAL.state).toBe('active');
    expect(result.devmode).toBe(true);
  });
});

describe('loadDomainFile', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  test('should load domain file in KEY=VALUE format', () => {
    // Given: a domain file with DOMAIN_RULE_N=text format
    const domainPath = path.join(tempDir, 'agent-dev');
    fs.writeFileSync(domainPath, [
      '# Agent Dev Domain Rules',
      'AGENT_DEV_RULE_1=Always use kebab-case for file names',
      'AGENT_DEV_RULE_2=Follow conventional commits',
      'AGENT_DEV_RULE_3=Write tests for every feature',
    ].join('\n'));

    // When: loading the domain file
    const rules = loadDomainFile(domainPath);

    // Then: rules are extracted from values
    expect(rules).toEqual([
      'Always use kebab-case for file names',
      'Follow conventional commits',
      'Write tests for every feature',
    ]);
  });

  test('should load domain file in plain text format', () => {
    // Given: a domain file with plain text lines
    const domainPath = path.join(tempDir, 'constitution');
    fs.writeFileSync(domainPath, [
      '# Constitution Rules',
      'CLI First is non-negotiable',
      'Story-driven development always',
      'No invention beyond specs',
    ].join('\n'));

    // When: loading the domain file
    const rules = loadDomainFile(domainPath);

    // Then: each non-empty, non-comment line is a rule
    expect(rules).toEqual([
      'CLI First is non-negotiable',
      'Story-driven development always',
      'No invention beyond specs',
    ]);
  });

  test('should return empty array when domain file does not exist', () => {
    // Given: a path to a non-existent domain file
    const domainPath = path.join(tempDir, 'nonexistent');

    // When: loading
    const rules = loadDomainFile(domainPath);

    // Then: empty array returned
    expect(rules).toEqual([]);
  });

  test('should return empty array for empty domain file', () => {
    // Given: an empty domain file
    const domainPath = path.join(tempDir, 'empty');
    fs.writeFileSync(domainPath, '');

    // When: loading
    const rules = loadDomainFile(domainPath);

    // Then: empty array
    expect(rules).toEqual([]);
  });

  test('should extract AUTH and RULE entries from agent domain files', () => {
    // Given: agent domain file with AUTH + RULE keys
    const domainPath = path.join(tempDir, 'agent-devops');
    fs.writeFileSync(domainPath, [
      '# Agent devops domain',
      'AGENT_DEVOPS_AUTH_0=EXCLUSIVE: git push',
      'AGENT_DEVOPS_AUTH_1=EXCLUSIVE: gh pr create',
      'AGENT_DEVOPS_RULE_0=Run pre-push quality gates',
      'AGENT_DEVOPS_RULE_1=Confirm version bump with user',
    ].join('\n'));

    // When: loading the domain file
    const rules = loadDomainFile(domainPath);

    // Then: both AUTH and RULE values are extracted
    expect(rules).toEqual([
      'EXCLUSIVE: git push',
      'EXCLUSIVE: gh pr create',
      'Run pre-push quality gates',
      'Confirm version bump with user',
    ]);
  });

  test('should extract values from context bracket keys (RULE_BRACKET_N)', () => {
    // Given: context domain file with bracket-level keys
    const domainPath = path.join(tempDir, 'context');
    fs.writeFileSync(domainPath, [
      '# Context brackets',
      'CONTEXT_RULE_FRESH_0=Context is fresh',
      'CONTEXT_RULE_MODERATE_0=Standard context level',
      'CONTEXT_RULE_CRITICAL_0=Context nearly exhausted',
    ].join('\n'));

    // When: loading the domain file
    const rules = loadDomainFile(domainPath);

    // Then: values extracted from all bracket-level keys
    expect(rules).toEqual([
      'Context is fresh',
      'Standard context level',
      'Context nearly exhausted',
    ]);
  });

  test('should extract values from constitution keys (RULE_ARTN_M)', () => {
    // Given: constitution domain file with article-numbered keys
    const domainPath = path.join(tempDir, 'constitution');
    fs.writeFileSync(domainPath, [
      '# Constitution',
      'CONSTITUTION_RULE_ART1_0=CLI First (NON-NEGOTIABLE)',
      'CONSTITUTION_RULE_ART1_1=MUST: All functionality works via CLI first',
      'CONSTITUTION_RULE_ART6_0=Absolute Imports (SHOULD)',
    ].join('\n'));

    // When: loading the domain file
    const rules = loadDomainFile(domainPath);

    // Then: values extracted from article-numbered keys
    expect(rules).toEqual([
      'CLI First (NON-NEGOTIABLE)',
      'MUST: All functionality works via CLI first',
      'Absolute Imports (SHOULD)',
    ]);
  });

  test('should extract values from commands keys (RULE_COMMAND_N)', () => {
    // Given: commands domain file with command-category keys
    const domainPath = path.join(tempDir, 'commands');
    fs.writeFileSync(domainPath, [
      '# Commands',
      'COMMANDS_RULE_BRIEF_0=Use bullet points only',
      'COMMANDS_RULE_DEV_0=Code over explanation',
      'COMMANDS_RULE_SYNAPSE_STATUS_0=Display current SYNAPSE state',
    ].join('\n'));

    // When: loading the domain file
    const rules = loadDomainFile(domainPath);

    // Then: values extracted from command-category keys
    expect(rules).toEqual([
      'Use bullet points only',
      'Code over explanation',
      'Display current SYNAPSE state',
    ]);
  });
});

describe('isExcluded', () => {
  test('should return true when prompt matches global exclude keyword', () => {
    // Given: a prompt containing an exclude keyword
    // When: checking exclusion
    const result = isExcluded('please skip this task', ['skip', 'ignore'], []);

    // Then: excluded
    expect(result).toBe(true);
  });

  test('should return true when prompt matches domain exclude keyword', () => {
    // Given: domain-specific exclusion
    const result = isExcluded('this is internal only', [], ['internal']);

    // Then: excluded
    expect(result).toBe(true);
  });

  test('should return false when no keywords match', () => {
    // Given: prompt that doesn't match any exclude keywords
    const result = isExcluded('implement the login feature', ['skip', 'ignore'], ['internal']);

    // Then: not excluded
    expect(result).toBe(false);
  });

  test('should be case-insensitive', () => {
    // Given: keyword in different case
    const result = isExcluded('SKIP this please', ['skip'], []);

    // Then: still excluded
    expect(result).toBe(true);
  });

  test('should handle special regex characters in keywords', () => {
    // Given: keyword with regex special chars
    const result = isExcluded('use file.txt pattern', ['file.txt'], []);

    // Then: matches literally (dot escaped)
    expect(result).toBe(true);
  });

  test('should return false for empty prompt', () => {
    const result = isExcluded('', ['skip'], []);
    expect(result).toBe(false);
  });

  test('should return false for null prompt', () => {
    const result = isExcluded(null, ['skip'], []);
    expect(result).toBe(false);
  });

  test('should skip empty/falsy keywords in exclude list', () => {
    // Given: exclude list with empty strings
    const result = isExcluded('some prompt', ['', null, 'skip'], []);

    // Then: empty keywords are skipped, valid one still works
    expect(result).toBe(false); // 'skip' not in 'some prompt'
  });

  test('should match valid keyword even with empty ones in list', () => {
    const result = isExcluded('skip this', ['', 'skip'], []);
    expect(result).toBe(true);
  });
});

describe('matchKeywords', () => {
  test('should return true when prompt matches a keyword', () => {
    const result = matchKeywords('deploy to production', ['deploy', 'release']);
    expect(result).toBe(true);
  });

  test('should return false when no keywords match', () => {
    const result = matchKeywords('write unit tests', ['deploy', 'release']);
    expect(result).toBe(false);
  });

  test('should be case-insensitive', () => {
    const result = matchKeywords('DEPLOY NOW', ['deploy']);
    expect(result).toBe(true);
  });

  test('should return false for empty keywords array', () => {
    const result = matchKeywords('some prompt', []);
    expect(result).toBe(false);
  });

  test('should return false for empty prompt', () => {
    const result = matchKeywords('', ['deploy']);
    expect(result).toBe(false);
  });

  test('should handle special regex characters in keywords', () => {
    const result = matchKeywords('check (status) now', ['(status)']);
    expect(result).toBe(true);
  });

  test('should skip empty/falsy keywords', () => {
    const result = matchKeywords('deploy now', ['', null, 'deploy']);
    expect(result).toBe(true);
  });
});

describe('extractDomainInfo', () => {
  test('should extract domain name from STATE suffix', () => {
    const { domainName, suffix } = extractDomainInfo('AGENT_DEV_STATE');
    expect(domainName).toBe('AGENT_DEV');
    expect(suffix).toBe('_STATE');
  });

  test('should extract domain name from WORKFLOW_TRIGGER suffix', () => {
    const { domainName, suffix } = extractDomainInfo('WORKFLOW_STORY_DEV_WORKFLOW_TRIGGER');
    expect(domainName).toBe('WORKFLOW_STORY_DEV');
    expect(suffix).toBe('_WORKFLOW_TRIGGER');
  });

  test('should extract domain name from AGENT_TRIGGER suffix', () => {
    const { domainName, suffix } = extractDomainInfo('AGENT_DEV_AGENT_TRIGGER');
    expect(domainName).toBe('AGENT_DEV');
    expect(suffix).toBe('_AGENT_TRIGGER');
  });

  test('should extract domain name from NON_NEGOTIABLE suffix', () => {
    const { domainName, suffix } = extractDomainInfo('CONSTITUTION_NON_NEGOTIABLE');
    expect(domainName).toBe('CONSTITUTION');
    expect(suffix).toBe('_NON_NEGOTIABLE');
  });

  test('should return null for keys with no known suffix', () => {
    const { domainName, suffix } = extractDomainInfo('UNKNOWN_KEY');
    expect(domainName).toBeNull();
    expect(suffix).toBeNull();
  });

  test('should return null for empty prefix', () => {
    const { domainName, suffix } = extractDomainInfo('_STATE');
    expect(domainName).toBeNull();
  });
});

describe('domainNameToFile', () => {
  test('should convert simple domain name', () => {
    expect(domainNameToFile('GLOBAL')).toBe('global');
  });

  test('should convert multi-word domain name with underscores', () => {
    expect(domainNameToFile('AGENT_DEV')).toBe('agent-dev');
  });

  test('should convert long domain name', () => {
    expect(domainNameToFile('WORKFLOW_STORY_DEV')).toBe('workflow-story-dev');
  });
});

describe('constants', () => {
  test('KNOWN_SUFFIXES should contain all 7 suffixes', () => {
    expect(KNOWN_SUFFIXES).toHaveLength(7);
    expect(KNOWN_SUFFIXES).toContain('_STATE');
    expect(KNOWN_SUFFIXES).toContain('_ALWAYS_ON');
    expect(KNOWN_SUFFIXES).toContain('_NON_NEGOTIABLE');
    expect(KNOWN_SUFFIXES).toContain('_AGENT_TRIGGER');
    expect(KNOWN_SUFFIXES).toContain('_WORKFLOW_TRIGGER');
    expect(KNOWN_SUFFIXES).toContain('_RECALL');
    expect(KNOWN_SUFFIXES).toContain('_EXCLUDE');
  });

  test('GLOBAL_KEYS should contain DEVMODE and GLOBAL_EXCLUDE', () => {
    expect(GLOBAL_KEYS).toEqual(['DEVMODE', 'GLOBAL_EXCLUDE']);
  });
});

describe('parseManifest — edge cases for comma-separated values', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  test('should handle empty GLOBAL_EXCLUDE value', () => {
    // Given: GLOBAL_EXCLUDE with empty value
    const manifestPath = path.join(tempDir, 'manifest');
    fs.writeFileSync(manifestPath, 'GLOBAL_EXCLUDE=');

    // When: parsing
    const result = parseManifest(manifestPath);

    // Then: empty array (parseCommaSeparated handles empty string)
    expect(result.globalExclude).toEqual([]);
  });

  test('should handle RECALL with trailing commas', () => {
    const manifestPath = path.join(tempDir, 'manifest');
    fs.writeFileSync(manifestPath, 'MYDOM_RECALL=a,,b,');

    const result = parseManifest(manifestPath);
    expect(result.domains.MYDOM.recall).toEqual(['a', 'b']);
  });
});
