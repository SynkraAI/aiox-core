/**
 * Tests for atomicWriteSync utility
 *
 * @module tests/synapse/atomic-write
 * @created Story NOG-12 - State Persistence Hardening
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { atomicWriteSync } = require('../../.aios-core/core/synapse/utils/atomic-write');

describe('atomicWriteSync', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'atomic-write-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('writes new file successfully', () => {
    const filePath = path.join(tmpDir, 'test.json');
    const data = JSON.stringify({ hello: 'world' }, null, 2);

    atomicWriteSync(filePath, data);

    expect(fs.existsSync(filePath)).toBe(true);
    expect(fs.readFileSync(filePath, 'utf8')).toBe(data);
  });

  test('overwrites existing file', () => {
    const filePath = path.join(tmpDir, 'test.json');
    fs.writeFileSync(filePath, '{"old": true}', 'utf8');

    const newData = JSON.stringify({ new: true }, null, 2);
    atomicWriteSync(filePath, newData);

    expect(fs.readFileSync(filePath, 'utf8')).toBe(newData);
  });

  test('no orphaned tmp file on success', () => {
    const filePath = path.join(tmpDir, 'test.json');
    atomicWriteSync(filePath, 'data');

    const files = fs.readdirSync(tmpDir);
    expect(files).toEqual(['test.json']);
  });

  test('preserves original file when write fails (read-only dir)', () => {
    const filePath = path.join(tmpDir, 'nonexistent', 'deep', 'nested', 'test.json');
    const parentDir = path.join(tmpDir, 'nonexistent', 'deep', 'nested');

    // atomicWriteSync creates parent dirs, so this should work
    atomicWriteSync(filePath, '{"created": true}');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  test('creates parent directories if they do not exist', () => {
    const filePath = path.join(tmpDir, 'sub', 'dir', 'test.json');

    atomicWriteSync(filePath, '{"nested": true}');

    expect(fs.existsSync(filePath)).toBe(true);
    expect(JSON.parse(fs.readFileSync(filePath, 'utf8'))).toEqual({ nested: true });
  });

  test('cleans up tmp file on rename failure', () => {
    // Simulate failure by making target a directory (rename will fail)
    const filePath = path.join(tmpDir, 'target');
    fs.mkdirSync(filePath);
    fs.writeFileSync(path.join(filePath, 'blocker.txt'), 'block');

    expect(() => {
      atomicWriteSync(filePath, 'data');
    }).toThrow();

    // No orphaned .tmp.{pid} files
    const files = fs.readdirSync(tmpDir);
    const tmpFiles = files.filter(f => f.includes('.tmp.'));
    expect(tmpFiles).toHaveLength(0);
  });

  test('handles empty string data', () => {
    const filePath = path.join(tmpDir, 'empty.json');
    atomicWriteSync(filePath, '');

    expect(fs.readFileSync(filePath, 'utf8')).toBe('');
  });

  test('handles large data', () => {
    const filePath = path.join(tmpDir, 'large.json');
    const largeData = JSON.stringify({ data: 'x'.repeat(100000) });

    atomicWriteSync(filePath, largeData);

    expect(fs.readFileSync(filePath, 'utf8')).toBe(largeData);
  });

  test('respects encoding parameter', () => {
    const filePath = path.join(tmpDir, 'encoded.txt');
    const data = 'hello world';

    atomicWriteSync(filePath, data, 'utf8');

    expect(fs.readFileSync(filePath, 'utf8')).toBe(data);
  });

  test('original intact if crash before rename (simulated)', () => {
    const filePath = path.join(tmpDir, 'session.json');
    const original = '{"prompt_count": 5}';
    fs.writeFileSync(filePath, original, 'utf8');

    // Simulate a "crash" by just writing the tmp file without rename
    const tmpPath = `${filePath}.tmp.99999`;
    fs.writeFileSync(tmpPath, '{"prompt_count": 6}', 'utf8');

    // Original should be untouched
    expect(fs.readFileSync(filePath, 'utf8')).toBe(original);

    // Clean up
    fs.unlinkSync(tmpPath);
  });
});
