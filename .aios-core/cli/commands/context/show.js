/**
 * Context Show Command
 * Display current session context
 *
 * Usage: aios context show [--json]
 *
 * @module cli/commands/context/show
 */

const SessionStateManager = require('../../../core/session/state-manager');

async function execute(args) {
  const isJson = args.includes('--json');

  try {
    const manager = SessionStateManager;
    const session = await manager.read();

    if (isJson) {
      // JSON output
      console.log(JSON.stringify({
        project: session.project,
        status: session.status,
        metadata: session.metadata,
      }, null, 2));
    } else {
      // Formatted output
      displayContext(session);
    }
  } catch (error) {
    console.error(`Error reading context: ${error.message}`);
    process.exit(1);
  }
}

function displayContext(session) {
  const { project, status, metadata } = session;

  // Visual representation
  console.log('Current Context:');
  let visual = `  ${project.emoji || '📦'} ${project.name || 'unknown'}`;
  if (status.progress) visual += ` [${status.progress}]`;
  if (status.emoji) visual += ` ${status.emoji}`;
  if (status.phase) visual += ` · ${status.phase}`;
  console.log(visual);

  // Project details
  console.log('\nProject:');
  console.log(`  Type: ${project.type || 'unknown'}`);
  console.log(`  Name: ${project.name || 'unknown'}`);
  console.log(`  Emoji: ${project.emoji || '📦'}`);

  // Status details
  console.log('\nStatus:');
  console.log(`  Phase: ${status.phase || 'none'}`);
  if (status.progress) {
    const [current, total] = status.progress.split('/').map(Number);
    const percentage = Math.round((current / total) * 100);
    console.log(`  Progress: ${status.progress} (${percentage}%)`);
  } else {
    console.log('  Progress: none');
  }
  if (status.currentTask) {
    console.log(`  Current Task: ${status.currentTask}`);
  }
  if (status.emoji) {
    console.log(`  Emoji: ${status.emoji}`);
  }

  // Metadata
  console.log('\nMetadata:');
  if (metadata.activeAgent) {
    console.log(`  Active Agent: ${metadata.activeAgent}`);
  }
  if (metadata.story) {
    console.log(`  Story: ${metadata.story}`);
  }
  if (metadata.startedAt) {
    const started = new Date(metadata.startedAt);
    console.log(`  Started: ${started.toLocaleString()}`);
  }
  if (metadata.lastUpdatedAt) {
    const updated = new Date(metadata.lastUpdatedAt);
    console.log(`  Last Updated: ${updated.toLocaleString()}`);
  }
}

module.exports = { execute };
