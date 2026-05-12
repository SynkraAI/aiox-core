/**
 * Decision Log Indexer
 *
 * Maintains an index file of all decision logs for easy discovery.
 * Automatically updates when new logs are generated.
 *
 * @module decision-log-indexer
 * @see .aiox-core/scripts/decision-recorder.js
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Load configuration to get index file location
 *
 * @returns {Promise<Object>} Configuration object
 */
async function loadConfig() {
  const yaml = require('js-yaml');
  try {
    const configContent = await fs.readFile('.aiox-core/core-config.yaml', 'utf8');
    return yaml.load(configContent);
  } catch (error) {
    console.warn('Warning: Could not load core-config.yaml for indexing:', error.message);
    return {
      decisionLogging: {
        enabled: true,
        location: '.ai/',
        indexFile: 'decision-logs-index.md',
      },
    };
  }
}

/**
 * Parse metadata from decision log file
 *
 * @param {string} logPath - Path to decision log file
 * @returns {Promise<Object>} Metadata object
 */
async function parseLogMetadata(logPath) {
  try {
    const content = await fs.readFile(logPath, 'utf8');

    // Extract metadata from log content
    const storyMatch = content.match(/\*\*Story:\*\* (.+)/);
    const generatedMatch = content.match(/\*\*Generated:\*\* (.+)/);
    const agentMatch = content.match(/\*\*Agent:\*\* (.+)/);
    const statusMatch = content.match(/\*\*Status:\*\* (.+)/);
    const executionTimeMatch = content.match(/\*\*Execution Time:\*\* (.+)/);
    const decisionsMatch = content.match(/\*\*Decisions Made:\*\* (\d+)/);

    // Extract story ID from filename (e.g., decision-log-6.1.2.6.2.md)
    const filenameMatch = path.basename(logPath).match(/decision-log-(.+)\.md$/);
    const storyId = filenameMatch ? filenameMatch[1] : 'unknown';

    return {
      storyId,
      storyPath: storyMatch ? storyMatch[1] : '',
      timestamp: generatedMatch ? new Date(generatedMatch[1]) : new Date(),
      agent: agentMatch ? agentMatch[1] : 'unknown',
      status: statusMatch ? statusMatch[1] : 'unknown',
      duration: executionTimeMatch ? executionTimeMatch[1] : '0s',
      decisionCount: decisionsMatch ? parseInt(decisionsMatch[1]) : 0,
      logPath: path.normalize(logPath),
    };
  } catch (error) {
    console.error(`Error parsing log metadata from ${logPath}:`, error);
    return null;
  }
}

/**
 * Generate index file content from metadata array
 *
 * @param {Array<Object>} logMetadata - Array of log metadata objects
 * @returns {string} Markdown index content
 */
function generateIndexContent(logMetadata) {
  // Sort by timestamp (newest first)
  const sorted = logMetadata.sort((a, b) => b.timestamp - a.timestamp);

  let markdown = `# Decision Log Index

*Automatically generated decision log index*
*Last updated: ${new Date().toISOString()}*

---

## Quick Links

- [Decision Logging Guide](../docs/guides/decision-logging-guide.md)
- [Core Configuration](.aiox-core/core-config.yaml)

---

## Decision Logs

Total logs: ${logMetadata.length}

| Story ID | Date | Agent | Status | Duration | Decisions | Log File |
|----------|------|-------|--------|----------|-----------|----------|
`;

  sorted.forEach(meta => {
    const date = meta.timestamp.toISOString().split('T')[0]; // YYYY-MM-DD
    const relativePath = path.relative('.ai', meta.logPath).replace(/\\/g, '/');

    markdown += `| ${meta.storyId} | ${date} | ${meta.agent} | ${meta.status} | ${meta.duration} | ${meta.decisionCount} | [View](${relativePath}) |\n`;
  });

  markdown += `\n---

## Legend

- **Story ID**: Story identifier (e.g., 6.1.2.6.2)
- **Date**: When the decision log was generated
- **Agent**: Which agent executed the story (typically 'dev')
- **Status**: Execution status (completed, failed, cancelled)
- **Duration**: Total execution time
- **Decisions**: Number of autonomous decisions logged
- **Log File**: Link to full decision log

---

*This index is updated automatically when decision logs are generated*
*To manually rebuild the index, run: node .aiox-core/scripts/decision-log-indexer.js rebuild*
`;

  return markdown;
}

/**
 * Add or update a log entry in the index
 *
 * @param {string} logPath - Path to the decision log file
 * @returns {Promise<string>} Path to index file
 */
async function addToIndex(logPath) {
  const config = await loadConfig();

  if (!config.decisionLogging?.enabled) {
    console.log('Decision logging disabled, skipping index update');
    return null;
  }

  const indexDir = config.decisionLogging.location || '.ai/';
  const indexFile = path.join(indexDir, config.decisionLogging.indexFile || 'decision-logs-index.md');

  try {
    // Create .ai directory if it doesn't exist
    await fs.mkdir(indexDir, { recursive: true });

    // Parse metadata from the new log
    const newMetadata = await parseLogMetadata(logPath);
    if (!newMetadata) {
      console.warn('Could not parse log metadata, index not updated');
      return null;
    }

    // Read existing index (if it exists)
    let existingMetadata = [];
    try {
      const existingContent = await fs.readFile(indexFile, 'utf8');

      // Parse existing log entries from table
      const tableMatch = existingContent.match(/\| Story ID \|.+\n\|[-\s|]+\n((?:\|.+\n)*)/);
      if (tableMatch) {
        const rows = tableMatch[1].trim().split('\n');
        existingMetadata = rows
          .map(row => {
            const cells = row.split('|').map(c => c.trim()).filter(c => c);
            if (cells.length < 7) return null;

            return {
              storyId: cells[0],
              timestamp: new Date(cells[1]),
              agent: cells[2],
              status: cells[3],
              duration: cells[4],
              decisionCount: parseInt(cells[5]) || 0,
              logPath: cells[6].match(/\[View\]\((.+)\)/)?.[1] || '',
            };
          })
          .filter(m => m !== null);
      }
    } catch (_error) {
      // Index doesn't exist yet, that's okay
      console.log('Creating new decision log index');
    }

    // Remove old entry for same story ID if exists
    existingMetadata = existingMetadata.filter(m => m.storyId !== newMetadata.storyId);

    // Add new entry
    existingMetadata.push(newMetadata);

    // Generate updated index content
    const indexContent = generateIndexContent(existingMetadata);

    // Write index file
    await fs.writeFile(indexFile, indexContent, 'utf8');

    console.log(`✅ Decision log index updated: ${indexFile}`);
    return indexFile;
  } catch (error) {
    console.error('Error updating decision log index:', error);
    throw error;
  }
}

/**
 * Rebuild entire index by scanning .ai directory
 *
 * @returns {Promise<string>} Path to index file
 */
async function rebuildIndex() {
  const config = await loadConfig();

  if (!config.decisionLogging?.enabled) {
    console.log('Decision logging disabled, cannot rebuild index');
    return null;
  }

  const indexDir = config.decisionLogging.location || '.ai/';
  const indexFile = path.join(indexDir, config.decisionLogging.indexFile || 'decision-logs-index.md');

  try {
    // Find all decision log files
    const files = await fs.readdir(indexDir);
    const logFiles = files.filter(f => f.startsWith('decision-log-') && f.endsWith('.md'));

    console.log(`Found ${logFiles.length} decision log files`);

    // Parse metadata from all logs
    const metadata = [];
    for (const file of logFiles) {
      const logPath = path.join(indexDir, file);
      const meta = await parseLogMetadata(logPath);
      if (meta) {
        metadata.push(meta);
      }
    }

    // Generate index content
    const indexContent = generateIndexContent(metadata);

    // Write index file
    await fs.writeFile(indexFile, indexContent, 'utf8');

    console.log(`✅ Decision log index rebuilt: ${indexFile}`);
    console.log(`   Indexed ${metadata.length} decision logs`);

    return indexFile;
  } catch (error) {
    console.error('Error rebuilding decision log index:', error);
    throw error;
  }
}

// CLI usage: node decision-log-indexer.js rebuild
if (require.main === module) {
  const command = process.argv[2];

  if (command === 'rebuild') {
    rebuildIndex()
      .then(() => console.log('Index rebuild complete'))
      .catch(error => {
        console.error('Index rebuild failed:', error);
        process.exit(1);
      });
  } else {
    console.log('Usage: node decision-log-indexer.js rebuild');
    process.exit(1);
  }
}

module.exports = {
  addToIndex,
  rebuildIndex,
  parseLogMetadata,
  generateIndexContent,
};
