/**
 * MMOS Test Fixtures Loader
 *
 * Utility functions for loading test fixtures.
 *
 * @story STORY-10.6
 */

const path = require('path');
const fs = require('fs');

const FIXTURES_DIR = path.join(__dirname, 'test-mind');

/**
 * Load a JSON fixture file
 * @param {string} filename - Fixture filename
 * @returns {Object} Parsed fixture data
 */
function loadFixture(filename) {
  const filepath = path.join(FIXTURES_DIR, filename);
  if (!fs.existsSync(filepath)) {
    throw new Error(`Fixture not found: ${filename}`);
  }
  return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
}

/**
 * Load sample sources fixture
 * @returns {Object} Sample sources configuration
 */
function loadSampleSources() {
  return loadFixture('sample-sources.json');
}

/**
 * Load sample extraction fixture
 * @returns {Object} Sample extraction results
 */
function loadSampleExtraction() {
  return loadFixture('sample-extraction.json');
}

/**
 * Load sample mind data fixture
 * @returns {Object} Sample mind mapping data
 */
function loadSampleMindData() {
  return loadFixture('sample-mind-data.json');
}

/**
 * Get path to a fixture file
 * @param {string} filename - Fixture filename
 * @returns {string} Full path to fixture
 */
function getFixturePath(filename) {
  return path.join(FIXTURES_DIR, filename);
}

/**
 * Create mock source adapter responses from fixtures
 * @returns {Object} Mock responses for source adapter
 */
function createSourceMocks() {
  const extraction = loadSampleExtraction();
  return {
    youtube: extraction.extractions.find(e => e.source.type === 'youtube')?.result,
    blog: extraction.extractions.find(e => e.source.type === 'blog')?.result,
    document: extraction.extractions.find(e => e.source.type === 'document')?.result,
  };
}

/**
 * Create mock project adapter responses from fixtures
 * @returns {Object} Mock responses for project adapter
 */
function createProjectMocks() {
  const mindData = loadSampleMindData();
  return {
    task: {
      id: 'fixture-task-id',
      name: `Mind Mapping: ${mindData.subject.name}`,
      description: mindData.subject.description,
      status: 'In Progress',
    },
    progress: {
      sourcesProcessed: mindData.sources.length,
      totalSources: mindData.sources.length,
      currentPhase: 'synthesis',
    },
  };
}

/**
 * Create mock storage adapter responses from fixtures
 * @returns {Object} Mock responses for storage adapter
 */
function createStorageMocks() {
  const mindData = loadSampleMindData();
  return {
    folders: {
      root: { id: 'root-folder-id', name: mindData.subject.name },
      sources: { id: 'sources-folder-id', name: 'sources' },
      processed: { id: 'processed-folder-id', name: 'processed' },
      outputs: { id: 'outputs-folder-id', name: 'outputs' },
      exports: { id: 'exports-folder-id', name: 'exports' },
    },
    spreadsheet: {
      id: 'fixture-spreadsheet-id',
      title: `${mindData.subject.name} - Mind Map Export`,
    },
  };
}

module.exports = {
  loadFixture,
  loadSampleSources,
  loadSampleExtraction,
  loadSampleMindData,
  getFixturePath,
  createSourceMocks,
  createProjectMocks,
  createStorageMocks,
  FIXTURES_DIR,
};
