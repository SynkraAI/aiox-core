/**
 * Story Index Generator for AIOX Framework
 *
 * Scans docs/stories/ directory and generates comprehensive story index
 * with metadata extraction, epic grouping, and markdown table formatting.
 *
 * @module story-index-generator
 * @version 1.0.0
 * @created 2025-01-16 (Story 6.1.2.6)
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Status emoji mapping
 */
const STATUS_EMOJI = {
  'Draft': '📝',
  'Approved': '✅',
  'Ready for Dev': '🚀',
  'In Progress': '⚙️',
  'Ready for Review': '👀',
  'Completed': '✅',
  'On Hold': '⏸️',
  'Cancelled': '❌',
};

/**
 * Priority emoji mapping
 */
const PRIORITY_EMOJI = {
  'Critical': '🔴',
  'High': '🟠',
  'Medium': '🟡',
  'Low': '🟢',
};

/**
 * Extracts metadata from story markdown file
 *
 * @param {string} filePath - Path to story file
 * @returns {Promise<Object|null>} Story metadata or null if parsing fails
 */
async function extractStoryMetadata(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const lines = content.split('\n');

    const metadata = {
      filePath,
      fileName: path.basename(filePath),
    };

    // Extract from YAML frontmatter or metadata section
    let inYamlBlock = false;
    let inMetadataSection = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // YAML frontmatter detection
      if (line === '---' && i < 10) {
        inYamlBlock = !inYamlBlock;
        continue;
      }

      // Metadata section detection
      if (line.startsWith('## Metadata') || line.startsWith('# Metadata')) {
        inMetadataSection = true;
        continue;
      }

      if (line.startsWith('## ') || line.startsWith('# ')) {
        inMetadataSection = false;
      }

      if (inYamlBlock || inMetadataSection) {
        // Extract key-value pairs
        const match = line.match(/^[-*]?\s*\*?\*?([A-Za-z\s]+)\*?\*?:\s*(.+)$/);
        if (match) {
          const key = match[1].trim().toLowerCase().replace(/\s+/g, '_');
          const value = match[2].trim().replace(/^`|`$/g, '');

          // Map to standard fields
          if (key === 'story_id' || key === 'id') metadata.storyId = value;
          if (key === 'title') metadata.title = value;
          if (key === 'epic') metadata.epic = value;
          if (key === 'status') metadata.status = value;
          if (key === 'priority') metadata.priority = value;
          if (key === 'owner' || key === 'assigned_to') metadata.owner = value;
          if (key === 'estimate' || key === 'effort') metadata.estimate = value;
          if (key === 'created') metadata.created = value;
          if (key === 'updated') metadata.updated = value;
        }
      }

      // Stop after metadata section
      if (i > 100) break;
    }

    // Extract title from first H1 if not in metadata
    if (!metadata.title) {
      const h1Match = content.match(/^#\s+(.+)$/m);
      if (h1Match) {
        metadata.title = h1Match[1].trim();
      }
    }

    // Extract story ID from filename if not in metadata
    if (!metadata.storyId) {
      const idMatch = metadata.fileName.match(/story-?([\d.]+)/i);
      if (idMatch) {
        metadata.storyId = idMatch[1];
      }
    }

    return metadata;
  } catch (error) {
    console.error(`Failed to extract metadata from ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Scans stories directory recursively
 *
 * @param {string} dirPath - Directory path to scan
 * @param {Array} stories - Accumulated stories array
 * @returns {Promise<Array>} Array of story metadata objects
 */
async function scanStoriesDirectory(dirPath, stories = []) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        // Recursively scan subdirectories
        await scanStoriesDirectory(fullPath, stories);
      } else if (entry.isFile() && entry.name.match(/\.md$/i)) {
        // Process markdown files
        const metadata = await extractStoryMetadata(fullPath);
        if (metadata && metadata.storyId) {
          stories.push(metadata);
        }
      }
    }

    return stories;
  } catch (error) {
    console.error(`Failed to scan directory ${dirPath}:`, error.message);
    return stories;
  }
}

/**
 * Groups stories by epic
 *
 * @param {Array} stories - Array of story metadata
 * @returns {Object} Stories grouped by epic
 */
function groupStoriesByEpic(stories) {
  const grouped = {};

  stories.forEach(story => {
    const epic = story.epic || 'Unassigned';
    if (!grouped[epic]) {
      grouped[epic] = [];
    }
    grouped[epic].push(story);
  });

  // Sort stories within each epic by story ID
  Object.keys(grouped).forEach(epic => {
    grouped[epic].sort((a, b) => {
      const aId = a.storyId.split('.').map(Number);
      const bId = b.storyId.split('.').map(Number);

      for (let i = 0; i < Math.max(aId.length, bId.length); i++) {
        const aNum = aId[i] || 0;
        const bNum = bId[i] || 0;
        if (aNum !== bNum) return aNum - bNum;
      }
      return 0;
    });
  });

  return grouped;
}

/**
 * Generates markdown table row for story
 *
 * @param {Object} story - Story metadata
 * @param {string} baseDir - Base directory for relative paths
 * @returns {string} Markdown table row
 */
function generateStoryRow(story, baseDir = 'docs/stories') {
  const statusEmoji = STATUS_EMOJI[story.status] || '❓';
  const priorityEmoji = story.priority ? PRIORITY_EMOJI[story.priority] : '';

  // Create relative path for link
  const relativePath = path.relative(baseDir, story.filePath).replace(/\\/g, '/');
  const link = `[${story.title || story.fileName}](${relativePath})`;

  return `| ${story.storyId} | ${link} | ${statusEmoji} ${story.status || 'Unknown'} | ${priorityEmoji} ${story.priority || 'N/A'} | ${story.owner || 'Unassigned'} | ${story.estimate || 'TBD'} |`;
}

/**
 * Generates complete story index markdown
 *
 * @param {Array} stories - Array of story metadata
 * @returns {string} Complete markdown content
 */
function generateIndexMarkdown(stories) {
  const grouped = groupStoriesByEpic(stories);
  const epics = Object.keys(grouped).sort();

  let markdown = `# Story Index

**Generated:** ${new Date().toISOString()}
**Total Stories:** ${stories.length}
**Epics:** ${epics.length}

---

## 📊 Summary by Status

`;

  // Status summary
  const statusCounts = {};
  stories.forEach(story => {
    const status = story.status || 'Unknown';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  Object.entries(statusCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([status, count]) => {
      const emoji = STATUS_EMOJI[status] || '❓';
      markdown += `- ${emoji} **${status}**: ${count}\n`;
    });

  markdown += '\n---\n\n## 📚 Stories by Epic\n\n';

  // Stories grouped by epic
  epics.forEach(epic => {
    const epicStories = grouped[epic];
    markdown += `### ${epic} (${epicStories.length} stories)\n\n`;
    markdown += '| Story ID | Title | Status | Priority | Owner | Estimate |\n';
    markdown += '|----------|-------|--------|----------|-------|----------|\n';

    epicStories.forEach(story => {
      markdown += generateStoryRow(story) + '\n';
    });

    markdown += '\n';
  });

  markdown += '---\n\n';
  markdown += '## 🔍 Legend\n\n';
  markdown += '### Status\n';
  Object.entries(STATUS_EMOJI).forEach(([status, emoji]) => {
    markdown += `- ${emoji} **${status}**\n`;
  });
  markdown += '\n### Priority\n';
  Object.entries(PRIORITY_EMOJI).forEach(([priority, emoji]) => {
    markdown += `- ${emoji} **${priority}**\n`;
  });

  markdown += '\n---\n\n';
  markdown += '*Auto-generated by AIOX Story Index Generator (Story 6.1.2.6)*\n';
  markdown += '*Update: Run `npm run stories:index` or `node .aiox-core/scripts/story-index-generator.js docs/stories`*\n';

  return markdown;
}

/**
 * Generates story index file
 *
 * @param {string} storiesDir - Path to stories directory
 * @param {string} outputPath - Path to output index file
 * @returns {Promise<Object>} Generation results
 */
async function generateStoryIndex(storiesDir = 'docs/stories', outputPath = null) {
  const output = outputPath || path.join(storiesDir, 'index.md');

  console.log(`📚 Scanning stories in: ${storiesDir}`);

  const stories = await scanStoriesDirectory(storiesDir);

  console.log(`✅ Found ${stories.length} stories`);

  const markdown = generateIndexMarkdown(stories);

  await fs.writeFile(output, markdown, 'utf8');

  console.log(`✅ Story index generated: ${output}`);

  return {
    totalStories: stories.length,
    outputPath: output,
    stories,
  };
}

// CLI execution support
if (require.main === module) {
  const storiesDir = process.argv[2] || 'docs/stories';
  const outputPath = process.argv[3] || null;

  generateStoryIndex(storiesDir, outputPath)
    .then(result => {
      console.log('\n📊 Generation Complete!');
      console.log(`Total Stories: ${result.totalStories}`);
      console.log(`Output: ${result.outputPath}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Generation failed:', error);
      process.exit(1);
    });
}

module.exports = {
  generateStoryIndex,
  extractStoryMetadata,
  scanStoriesDirectory,
  groupStoriesByEpic,
  generateIndexMarkdown,
  generateStoryRow,
  STATUS_EMOJI,
  PRIORITY_EMOJI,
};
