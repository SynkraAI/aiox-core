/**
 * SYNAPSE Path Utilities Tests
 *
 * Tests for resolveSynapsePath() and resolveDomainPath().
 *
 * @story SYN-1 - Domain Loader + Manifest Parser
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const {
  resolveSynapsePath,
  resolveDomainPath,
} = require('../../.aiox-core/core/synapse/utils/paths');

// Set timeout for all tests
jest.setTimeout(30000);

describe('resolveSynapsePath', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'synapse-paths-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test('should detect existing .synapse/ directory', () => {
    // Given: a directory with .synapse/ inside
    const synapsePath = path.join(tempDir, '.synapse');
    fs.mkdirSync(synapsePath);

    // When: resolving
    const result = resolveSynapsePath(tempDir);

    // Then: exists is true, paths are correct
    expect(result.exists).toBe(true);
    expect(result.synapsePath).toBe(synapsePath);
    expect(result.manifestPath).toBe(path.join(synapsePath, 'manifest'));
  });

  test('should report non-existing .synapse/ directory', () => {
    // Given: a directory without .synapse/

    // When: resolving
    const result = resolveSynapsePath(tempDir);

    // Then: exists is false, paths still computed
    expect(result.exists).toBe(false);
    expect(result.synapsePath).toBe(path.join(tempDir, '.synapse'));
    expect(result.manifestPath).toBe(path.join(tempDir, '.synapse', 'manifest'));
  });

  test('should handle path with spaces', () => {
    // Given: directory with spaces in path
    const spacedDir = path.join(tempDir, 'dir with spaces');
    fs.mkdirSync(spacedDir);
    fs.mkdirSync(path.join(spacedDir, '.synapse'));

    // When: resolving
    const result = resolveSynapsePath(spacedDir);

    // Then: works correctly
    expect(result.exists).toBe(true);
    expect(result.synapsePath).toContain('dir with spaces');
  });

  test('should not detect .synapse as file (only directory)', () => {
    // Given: .synapse exists as a file, not a directory
    fs.writeFileSync(path.join(tempDir, '.synapse'), 'not a directory');

    // When: resolving
    const result = resolveSynapsePath(tempDir);

    // Then: exists is false (file, not directory)
    expect(result.exists).toBe(false);
  });
});

describe('resolveDomainPath', () => {
  test('should resolve domain file path correctly', () => {
    // Given: a synapse path and file name
    const synapsePath = path.join('C:', 'project', '.synapse');

    // When: resolving domain path
    const result = resolveDomainPath(synapsePath, 'agent-dev');

    // Then: correct path using platform separator
    expect(result).toBe(path.join(synapsePath, 'agent-dev'));
  });

  test('should handle nested-like domain file names', () => {
    const synapsePath = '/home/user/project/.synapse';
    const result = resolveDomainPath(synapsePath, 'workflow-story-dev');
    expect(result).toBe(path.join(synapsePath, 'workflow-story-dev'));
  });
});
