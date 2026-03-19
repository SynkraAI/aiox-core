#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const ROOT = process.cwd();
const WORKSPACE_CONFIG_PATH = path.join(ROOT, 'workspace', 'workspace.yaml');
const BUSINESSES_DIR = path.join(ROOT, 'workspace', 'businesses');

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = {
    bu: null,
    app: null,
    format: 'json',
  };

  for (const raw of argv) {
    if (raw.startsWith('--bu=')) {
      args.bu = raw.slice('--bu='.length).trim() || null;
      continue;
    }
    if (raw.startsWith('--business=')) {
      args.bu = raw.slice('--business='.length).trim() || null;
      continue;
    }
    if (raw.startsWith('--app=')) {
      args.app = raw.slice('--app='.length).trim() || null;
      continue;
    }
    if (raw.startsWith('--format=')) {
      args.format = raw.slice('--format='.length).trim() || 'json';
    }
  }

  return args;
}

function readYaml(filePath) {
  return yaml.load(fs.readFileSync(filePath, 'utf8')) || {};
}

function getWorkspaceConfig() {
  if (!fs.existsSync(WORKSPACE_CONFIG_PATH)) {
    fail('workspace/workspace.yaml not found');
  }
  return readYaml(WORKSPACE_CONFIG_PATH);
}

function getBusinessStatus(workspaceConfig, businessSlug) {
  const business = (((workspaceConfig || {}).businesses || {})[businessSlug] || {});
  const capabilities = business.capabilities || {};
  const ds = capabilities.design_system || {};
  const status = typeof ds.status === 'string' ? ds.status.trim() : 'not_configured';

  if (!['configured', 'not_configured', 'not_applicable'].includes(status)) {
    fail(`Invalid design_system status for business "${businessSlug}": ${status}`);
  }

  return status;
}

function getConfigPath(businessSlug) {
  return path.join(BUSINESSES_DIR, businessSlug, 'design-system', 'config.yaml');
}

function buildBusinessResult(workspaceConfig, businessSlug) {
  const status = getBusinessStatus(workspaceConfig, businessSlug);
  const configPath = getConfigPath(businessSlug);

  if (status !== 'configured') {
    return {
      business_slug: businessSlug,
      status,
      config_path: path.relative(ROOT, configPath),
      design_system: null,
    };
  }

  if (!fs.existsSync(configPath)) {
    fail(`Business "${businessSlug}" is configured but missing ${path.relative(ROOT, configPath)}`);
  }

  const config = readYaml(configPath);
  return {
    business_slug: businessSlug,
    status,
    config_path: path.relative(ROOT, configPath),
    design_system: {
      id: config.id || null,
      name: config.name || null,
      source: config.source || null,
      default_theme: config.default_theme || null,
      themes: Object.keys(config.themes || {}),
      apps: (config.apps || []).map((app) => ({
        id: app.id || null,
        root: app.root || null,
        theme: app.theme || null,
      })),
    },
  };
}

function resolveByApp(workspaceConfig, appId) {
  const businesses = Object.keys(workspaceConfig.businesses || {}).sort();
  for (const businessSlug of businesses) {
    const status = getBusinessStatus(workspaceConfig, businessSlug);
    if (status !== 'configured') {
      continue;
    }

    const configPath = getConfigPath(businessSlug);
    if (!fs.existsSync(configPath)) {
      continue;
    }

    const config = readYaml(configPath);
    const app = (config.apps || []).find((item) => item && item.id === appId);
    if (!app) {
      continue;
    }

    return {
      business_slug: businessSlug,
      status,
      config_path: path.relative(ROOT, configPath),
      design_system: {
        id: config.id || null,
        name: config.name || null,
        source: config.source || null,
        default_theme: config.default_theme || null,
        themes: Object.keys(config.themes || {}),
        app,
      },
    };
  }

  fail(`No configured Design System found for app "${appId}"`);
}

function printResult(result, format) {
  if (format === 'yaml') {
    process.stdout.write(yaml.dump(result, { lineWidth: 120, noRefs: true, sortKeys: false }));
    return;
  }

  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const workspaceConfig = getWorkspaceConfig();

  if (args.bu) {
    printResult(buildBusinessResult(workspaceConfig, args.bu), args.format);
    return;
  }

  if (args.app) {
    printResult(resolveByApp(workspaceConfig, args.app), args.format);
    return;
  }

  const businesses = Object.keys(workspaceConfig.businesses || {}).sort();
  const results = businesses.map((businessSlug) => buildBusinessResult(workspaceConfig, businessSlug));
  printResult({ businesses: results }, args.format);
}

if (require.main === module) {
  main();
}

module.exports = {
  BUSINESSES_DIR,
  ROOT,
  WORKSPACE_CONFIG_PATH,
  buildBusinessResult,
  getBusinessStatus,
  getConfigPath,
  getWorkspaceConfig,
  parseArgs,
  printResult,
  readYaml,
  resolveByApp,
};
