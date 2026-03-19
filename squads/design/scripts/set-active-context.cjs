#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const resolver = require('./design-system/resolve_business_design_system.cjs');
const runtimePaths = require('./runtime-paths.cjs');
const { resolveSquadWorkspaceReadiness } = require('../../c-level/scripts/resolve-squad-workspace-readiness.cjs');

const ROOT = process.cwd();

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = {
    business: null,
    app: null,
    theme: null,
    reason: 'manual',
    format: 'json',
  };

  for (const raw of argv) {
    if (raw.startsWith('--business=')) {
      args.business = raw.slice('--business='.length).trim() || null;
      continue;
    }
    if (raw.startsWith('--bu=')) {
      args.business = raw.slice('--bu='.length).trim() || null;
      continue;
    }
    if (raw.startsWith('--app=')) {
      args.app = raw.slice('--app='.length).trim() || null;
      continue;
    }
    if (raw.startsWith('--theme=')) {
      args.theme = raw.slice('--theme='.length).trim() || null;
      continue;
    }
    if (raw.startsWith('--reason=')) {
      args.reason = raw.slice('--reason='.length).trim() || 'manual';
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

function writeYaml(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, yaml.dump(data, { lineWidth: 120, noRefs: true, sortKeys: false }), 'utf8');
}

function resolveContext(args) {
  if (!args.business && !args.app) {
    fail('Provide --business=<slug> or --app=<id>');
  }

  const cooReadiness = resolveSquadWorkspaceReadiness({
    squad: 'design',
    business: args.business,
    app: args.app,
    contextType: 'design_system',
  });

  if (cooReadiness.status !== 'ready') {
    fail(`Cannot activate DS context: ${cooReadiness.status} (${cooReadiness.reason})`);
  }

  const workspaceConfig = resolver.getWorkspaceConfig();
  const result = args.app
    ? resolver.resolveByApp(workspaceConfig, args.app)
    : resolver.buildBusinessResult(workspaceConfig, args.business);

  if (result.status !== 'configured') {
    fail(`Cannot activate DS context for status=${result.status}`);
  }

  const configPathAbs = path.join(ROOT, result.config_path);
  const config = readYaml(configPathAbs);

  let app = null;
  if (args.app) {
    app = (config.apps || []).find((item) => item && item.id === args.app) || null;
  } else if ((config.apps || []).length === 1) {
    app = config.apps[0];
  }

  const theme = args.theme || (app && app.theme) || config.default_theme;
  if (!config.themes || !config.themes[theme]) {
    fail(`Theme "${theme}" not found in ${result.config_path}`);
  }

  return {
    business_slug: result.business_slug,
    app_id: app ? app.id || null : null,
    theme,
    design_system_id: config.id || null,
    config_path: result.config_path,
    readiness_status: cooReadiness.status,
  };
}

function printOutput(output, format) {
  if (format === 'yaml') {
    process.stdout.write(yaml.dump(output, { lineWidth: 120, noRefs: true, sortKeys: false }));
    return;
  }
  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const activeContext = resolveContext(args);
  const sessionPath = runtimePaths.getDesignSessionContextPath();
  const payload = {
    active_context: {
      ...activeContext,
      updated_at: new Date().toISOString(),
      reason: args.reason,
    },
  };

  writeYaml(sessionPath, payload);
  printOutput(
    {
      session_context_path: runtimePaths.toWorkspaceRelative(sessionPath),
      ...payload,
    },
    args.format,
  );
}

if (require.main === module) {
  main();
}
