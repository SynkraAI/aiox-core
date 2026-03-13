/**
 * Context Set Command
 * Manually set session context
 *
 * Usage: aios context set <name> [options]
 *
 * @module cli/commands/context/set
 */

const SessionStateManager = require('../../../core/session/state-manager');

async function execute(args) {
  // Parse args
  const name = args[0];
  if (!name) {
    console.error('Error: Project name required');
    console.log('Usage: aios context set <name> [options]');
    process.exit(1);
  }

  const options = parseOptions(args.slice(1));

  // Validate inputs
  try {
    validateOptions(options);
  } catch (error) {
    console.error(`Validation error: ${error.message}`);
    process.exit(1);
  }

  // Build context update
  const contextUpdate = {
    project: {
      name: name,
      ...(options.emoji && { emoji: options.emoji }),
      ...(options.type && { type: options.type }),
    },
    status: {
      ...(options.phase && { phase: options.phase }),
      ...(options.progress && { progress: options.progress }),
      ...(options.status && { emoji: options.status }),
    },
    metadata: {
      ...(options.agent && { activeAgent: options.agent }),
      ...(options.story && { story: options.story }),
    },
  };

  // Update session
  const manager = SessionStateManager;
  await manager.update(contextUpdate);

  // Update terminal title immediately
  const session = await manager.read();

  // Show confirmation
  console.log('✓ Context updated:');
  displayContext(session);
}

function parseOptions(args) {
  const options = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, '');
    const value = args[i + 1];
    if (value) {
      options[key] = value;
    }
  }
  return options;
}

function validateOptions(options) {
  // Validate emoji (single char - can be 2 bytes for emoji)
  if (options.emoji && options.emoji.length > 4) {
    throw new Error('Emoji must be a single character');
  }

  // Validate progress format
  if (options.progress && !/^\d+\/\d+$/.test(options.progress)) {
    throw new Error('Progress must be in format "n/m" (e.g., "2/5")');
  }

  // Validate type
  if (options.type) {
    const validTypes = ['framework', 'squad', 'app', 'tool', 'design-system', 'project'];
    if (!validTypes.includes(options.type)) {
      throw new Error(`Invalid type. Must be one of: ${validTypes.join(', ')}`);
    }
  }
}

function displayContext(session) {
  const { project, status, metadata } = session;

  // Build visual representation
  let visual = `  ${project.emoji || '📦'} ${project.name}`;
  if (status.progress) visual += ` [${status.progress}]`;
  if (status.emoji) visual += ` ${status.emoji}`;
  if (status.phase) visual += ` · ${status.phase}`;

  console.log(visual);
  console.log();
  console.log('Details:');
  if (project.type) console.log(`  Type: ${project.type}`);
  if (status.phase) console.log(`  Phase: ${status.phase}`);
  if (status.progress) {
    const [current, total] = status.progress.split('/').map(Number);
    const percent = Math.round((current / total) * 100);
    console.log(`  Progress: ${status.progress} (${percent}%)`);
  }
  if (metadata.activeAgent) console.log(`  Agent: ${metadata.activeAgent}`);
  if (metadata.story) console.log(`  Story: ${metadata.story}`);
}

module.exports = { execute };
