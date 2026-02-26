#!/usr/bin/env node
// =============================================================================
// MCP Discipline Fallback Module
// =============================================================================
// When Tool Search is NOT available, this module manages MCP server toggling
// in .mcp.json to reduce token overhead by disabling non-essential servers.
//
// Story: TOK-2 (AC: 8, 9, 10)
// Strategy: Fallback 1 — MCP discipline
//
// Usage:
//   node .aios-core/data/mcp-discipline.js --apply     # Disable non-essential
//   node .aios-core/data/mcp-discipline.js --restore   # Re-enable all
//   node .aios-core/data/mcp-discipline.js --status    # Show current state
//   node .aios-core/data/mcp-discipline.js --enable <server>  # Re-enable specific
// =============================================================================

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const MCP_JSON_PATH = path.join(PROJECT_ROOT, '.mcp.json');
const BACKUP_PATH = path.join(PROJECT_ROOT, '.aios', 'mcp-backup.json');
const CAPABILITIES_PATH = path.join(PROJECT_ROOT, '.aios', 'runtime-capabilities.json');

function loadCapabilities() {
  try {
    return JSON.parse(fs.readFileSync(CAPABILITIES_PATH, 'utf8'));
  } catch {
    return null;
  }
}

function loadMcpConfig() {
  try {
    return JSON.parse(fs.readFileSync(MCP_JSON_PATH, 'utf8'));
  } catch {
    console.error('❌ Could not read .mcp.json');
    process.exit(1);
  }
}

function saveMcpConfig(config) {
  fs.writeFileSync(MCP_JSON_PATH, JSON.stringify(config, null, 2) + '\n');
}

function backupConfig(config) {
  const backupDir = path.dirname(BACKUP_PATH);
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  fs.writeFileSync(BACKUP_PATH, JSON.stringify(config, null, 2));
}

function getEssentialServers() {
  const caps = loadCapabilities();
  if (caps && caps.essentialServers) {
    return caps.essentialServers.map(s => s.name);
  }
  // Hardcoded fallback
  return ['nogic', 'code-graph'];
}

function apply() {
  const config = loadMcpConfig();
  backupConfig(config);

  const essential = getEssentialServers();
  const servers = config.mcpServers || {};
  let disabled = 0;

  for (const [name, serverConfig] of Object.entries(servers)) {
    if (!essential.includes(name)) {
      serverConfig.disabled = true;
      disabled++;
      console.log(`  🔒 Disabled: ${name} (non-essential)`);
    } else {
      console.log(`  ✅ Kept: ${name} (essential)`);
    }
  }

  saveMcpConfig(config);
  console.log(`\n📋 MCP Discipline applied: ${disabled} servers disabled, ${essential.length} essential kept`);
  console.log(`   Backup saved to: ${BACKUP_PATH}`);
}

function restore() {
  if (!fs.existsSync(BACKUP_PATH)) {
    console.log('⚠️  No backup found. Nothing to restore.');
    return;
  }

  const backup = JSON.parse(fs.readFileSync(BACKUP_PATH, 'utf8'));
  saveMcpConfig(backup);
  console.log('✅ MCP config restored from backup');
}

function enableServer(serverName) {
  const config = loadMcpConfig();
  const servers = config.mcpServers || {};

  if (!servers[serverName]) {
    console.log(`❌ Server '${serverName}' not found in .mcp.json`);
    return;
  }

  delete servers[serverName].disabled;
  saveMcpConfig(config);
  console.log(`✅ Re-enabled: ${serverName}`);
}

function status() {
  const config = loadMcpConfig();
  const caps = loadCapabilities();
  const servers = config.mcpServers || {};
  const essential = getEssentialServers();

  console.log('=== MCP Server Status ===\n');

  if (caps) {
    console.log(`Strategy: ${caps.strategy.primary}`);
    console.log(`Tool Search: ${caps.runtime.toolSearch.available ? 'AVAILABLE' : 'NOT AVAILABLE'}\n`);
  }

  for (const [name, serverConfig] of Object.entries(servers)) {
    const isEssential = essential.includes(name);
    const isDisabled = serverConfig.disabled === true;
    const status = isDisabled ? '🔒 DISABLED' : '✅ ACTIVE';
    const badge = isEssential ? '[ESSENTIAL]' : '[non-essential]';
    console.log(`  ${status} ${name} ${badge}`);
  }

  console.log(`\nTotal: ${Object.keys(servers).length} servers`);
  console.log(`Backup exists: ${fs.existsSync(BACKUP_PATH) ? 'YES' : 'NO'}`);
}

// CLI handling
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case '--apply':
    console.log('=== Applying MCP Discipline ===\n');
    apply();
    break;
  case '--restore':
    restore();
    break;
  case '--enable':
    if (!args[1]) {
      console.log('Usage: --enable <server-name>');
      process.exit(1);
    }
    enableServer(args[1]);
    break;
  case '--status':
    status();
    break;
  default:
    console.log('MCP Discipline Fallback Module');
    console.log('Usage:');
    console.log('  --apply          Disable non-essential MCP servers');
    console.log('  --restore        Restore from backup');
    console.log('  --enable <name>  Re-enable specific server');
    console.log('  --status         Show current status');
}
