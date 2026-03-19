#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const resolver = require('./design-system/resolve_business_design_system.cjs');
const runtimePaths = require('./runtime-paths.cjs');
const { resolveSquadWorkspaceReadiness } = require('../../c-level/scripts/resolve-squad-workspace-readiness.cjs');

const ROOT = process.cwd();
const COMMON_COMPONENT_DIR_KEYS = [
  'atoms',
  'molecules',
  'organisms',
  'blocks',
  'sections',
  'chrome',
  'patterns',
  'motion',
  'pages',
  'ui',
];
const COMMON_TOKEN_PATTERNS = [
  /tokens?\.(css|scss|sass|less|ts|js)$/i,
  /animations?\.(css|scss|sass|less)$/i,
  /patterns?\.(css|scss|sass|less)$/i,
  /primitives?\.(css|scss|sass|less)$/i,
  /theme\.(css|scss|sass|less|ts|js)$/i,
  /variables?\.(css|scss|sass|less|ts|js)$/i,
];
const COMMON_BLUEPRINT_PATTERNS = [
  /storybook/i,
  /showcase/i,
  /catalog/i,
  /sections?-page/i,
  /pattern/i,
];

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = {
    business: null,
    app: null,
    codebase: null,
    task: null,
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
    if (raw.startsWith('--codebase=')) {
      args.codebase = raw.slice('--codebase='.length).trim() || null;
      continue;
    }
    if (raw.startsWith('--task=')) {
      args.task = raw.slice('--task='.length).trim() || null;
      continue;
    }
    if (raw.startsWith('--format=')) {
      args.format = raw.slice('--format='.length).trim() || 'json';
    }
  }

  return args;
}

function normalizePath(filePath) {
  if (!filePath) {
    return null;
  }
  return filePath.split(path.sep).join('/');
}

function readSessionContext() {
  const sessionPath = runtimePaths.getDesignSessionContextPath();
  if (!fs.existsSync(sessionPath)) {
    fail(`Design session context not found: ${runtimePaths.toWorkspaceRelative(sessionPath)}. Run node squads/design/scripts/set-active-context.cjs --business=<slug> or --app=<id>.`);
  }

  const payload = yaml.load(fs.readFileSync(sessionPath, 'utf8')) || {};
  const active = payload.active_context || {};
  const businessSlug =
    typeof active.business_slug === 'string' && active.business_slug.trim() !== ''
      ? active.business_slug.trim()
      : null;

  if (!businessSlug) {
    fail(`Invalid session context: missing active_context.business_slug in ${runtimePaths.toWorkspaceRelative(sessionPath)}`);
  }

  return {
    sessionPath,
    businessSlug,
    appId: typeof active.app_id === 'string' && active.app_id.trim() !== '' ? active.app_id.trim() : null,
    theme: typeof active.theme === 'string' && active.theme.trim() !== '' ? active.theme.trim() : null,
  };
}

function toRelative(targetPath) {
  const relative = path.relative(ROOT, targetPath);
  return relative === '' ? '.' : normalizePath(relative);
}

function ensureExists(targetPath, label) {
  if (!fs.existsSync(targetPath)) {
    fail(`${label} not found: ${toRelative(targetPath)}`);
  }
  return targetPath;
}

function resolveFirstExistingPath(candidates, label) {
  for (const candidate of candidates) {
    if (candidate && fs.existsSync(candidate)) {
      return candidate;
    }
  }
  const printable = candidates.filter(Boolean).map(toRelative).join(', ');
  fail(`${label} not found in any allowed base: ${printable}`);
}

function pickApp(config, requestedAppId, codebasePath) {
  const apps = Array.isArray(config.apps) ? config.apps : [];

  if (requestedAppId) {
    const app = apps.find((item) => item && item.id === requestedAppId);
    if (!app) {
      fail(`App "${requestedAppId}" not found in DS config`);
    }
    return app;
  }

  if (codebasePath) {
    const normalizedCodebase = normalizePath(codebasePath).replace(/\/+$/, '');
    const app = apps.find((item) => {
      if (!item || typeof item.root !== 'string') {
        return false;
      }
      const root = normalizePath(item.root).replace(/\/+$/, '');
      const componentsRoot =
        typeof item.components_root === 'string'
          ? normalizePath(path.join(item.root, item.components_root)).replace(/\/+$/, '')
          : null;

      return normalizedCodebase === root || normalizedCodebase === componentsRoot;
    });
    if (app) {
      return app;
    }
  }

  if (apps.length === 1) {
    return apps[0];
  }

  return null;
}

function buildConfiguredContext(result, requestedAppId, codebasePath, taskId, themeOverride = null) {
  const configPathAbs = ensureExists(path.join(ROOT, result.config_path), 'DS config');
  const config = resolver.readYaml(configPathAbs);
  const app = pickApp(config, requestedAppId, codebasePath);
  const themeId = themeOverride || (app && typeof app.theme === 'string' ? app.theme : config.default_theme);
  const theme = themeId && config.themes ? config.themes[themeId] || null : null;

  if (themeId && !theme) {
    fail(`Theme "${themeId}" not found in ${result.config_path}`);
  }

  const repoRootAbs = ensureExists(
    path.resolve(ROOT, result.design_system.source.repo_root),
    'DS source.repo_root',
  );
  const dsRootAbs = ensureExists(
    path.resolve(repoRootAbs, result.design_system.source.ds_root),
    'DS source.ds_root',
  );

  let appRootAbs = null;
  let componentsRootAbs = null;
  let componentDirs = {};
  let tokenFiles = [];
  let blueprintFiles = [];
  let hooksDir = null;
  let dataDir = null;
  let appDir = null;

  if (app) {
    appRootAbs = ensureExists(path.resolve(repoRootAbs, app.root), 'app.root');
    componentsRootAbs = ensureExists(
      path.resolve(appRootAbs, app.components_root),
      'app.components_root',
    );
    componentDirs = Object.fromEntries(
      Object.entries(app.component_dirs || {}).map(([key, value]) => [
        key,
        toRelative(ensureExists(path.resolve(componentsRootAbs, value), `app.component_dirs.${key}`)),
      ]),
    );
    tokenFiles = (app.token_files || []).map((file, index) =>
      toRelative(ensureExists(path.resolve(appRootAbs, file), `app.token_files[${index}]`)),
    );
    blueprintFiles = (app.blueprint_files || []).map((file, index) =>
      toRelative(ensureExists(path.resolve(appRootAbs, file), `app.blueprint_files[${index}]`)),
    );
    hooksDir = toRelative(ensureExists(path.resolve(appRootAbs, app.hooks_dir), 'app.hooks_dir'));
    dataDir = toRelative(ensureExists(path.resolve(appRootAbs, app.data_dir), 'app.data_dir'));
    appDir = toRelative(ensureExists(path.resolve(appRootAbs, app.app_dir), 'app.app_dir'));
  }

  const themeTokenFiles = [];
  if (theme && theme.tokens) {
    if (typeof theme.tokens.primary === 'string' && theme.tokens.primary.trim() !== '') {
      themeTokenFiles.push(
        toRelative(
          resolveFirstExistingPath(
            [
              path.resolve(repoRootAbs, theme.tokens.primary),
              path.resolve(dsRootAbs, theme.tokens.primary),
              appRootAbs ? path.resolve(appRootAbs, theme.tokens.primary) : null,
            ],
            `themes.${themeId}.tokens.primary`,
          ),
        ),
      );
    }
    for (const [index, file] of (theme.tokens.files || []).entries()) {
      themeTokenFiles.push(
        toRelative(
          resolveFirstExistingPath(
            [
              path.resolve(repoRootAbs, file),
              path.resolve(dsRootAbs, file),
              appRootAbs ? path.resolve(appRootAbs, file) : null,
            ],
            `themes.${themeId}.tokens.files[${index}]`,
          ),
        ),
      );
    }
  }

  return {
    task: taskId || null,
    resolution_method: requestedAppId ? 'app' : 'business',
    business_slug: result.business_slug,
    status: result.status,
    action: 'continue',
    config_path: result.config_path,
    design_system: {
      id: config.id || null,
      name: config.name || null,
      source: {
        ...result.design_system.source,
        repo_root_abs: toRelative(repoRootAbs),
        ds_root_abs: toRelative(dsRootAbs),
      },
      default_theme: config.default_theme || null,
      theme_selected: themeId || null,
      theme: theme
        ? {
          id: themeId,
          ...theme,
        }
        : null,
      themes: Object.keys(config.themes || {}),
    },
    app: app
      ? {
        ...app,
        root_abs: toRelative(appRootAbs),
        components_root_abs: toRelative(componentsRootAbs),
        component_dirs_abs: componentDirs,
        hooks_dir_abs: hooksDir,
        blueprint_files_abs: blueprintFiles,
        token_files_abs: tokenFiles,
        data_dir_abs: dataDir,
        app_dir_abs: appDir,
      }
      : null,
    resolved_paths: {
      ds_root: toRelative(dsRootAbs),
      token_files: tokenFiles,
      theme_token_files: themeTokenFiles,
      blueprint_files: blueprintFiles,
      component_dirs: componentDirs,
      hooks_dir: hooksDir,
      data_dir: dataDir,
      app_dir: appDir,
    },
  };
}

function walkFiles(dirPath, acc = []) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.')) {
      continue;
    }
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, acc);
      continue;
    }
    acc.push(fullPath);
  }
  return acc;
}

function buildHeuristicContext(codebasePath, taskId) {
  if (!codebasePath) {
    fail('Either --business, --app, or --codebase must be provided');
  }

  const codebaseAbs = ensureExists(path.resolve(ROOT, codebasePath), 'codebase');
  const componentDirs = {};
  for (const key of COMMON_COMPONENT_DIR_KEYS) {
    const candidate = path.join(codebaseAbs, key);
    if (fs.existsSync(candidate)) {
      componentDirs[key] = toRelative(candidate);
    }
  }

  const files = walkFiles(codebaseAbs);
  const tokenFiles = files
    .filter((file) => COMMON_TOKEN_PATTERNS.some((pattern) => pattern.test(path.basename(file))))
    .map(toRelative);
  const blueprintFiles = files
    .filter((file) => COMMON_BLUEPRINT_PATTERNS.some((pattern) => pattern.test(path.basename(file))))
    .map(toRelative);

  return {
    task: taskId || null,
    resolution_method: 'heuristic',
    business_slug: null,
    status: 'heuristic',
    action: 'continue_with_caution',
    config_path: null,
    design_system: null,
    app: {
      id: null,
      root: normalizePath(codebasePath),
      root_abs: toRelative(codebaseAbs),
    },
    resolved_paths: {
      ds_root: toRelative(codebaseAbs),
      token_files: tokenFiles,
      theme_token_files: [],
      blueprint_files: blueprintFiles,
      component_dirs: componentDirs,
      hooks_dir: null,
      data_dir: null,
      app_dir: null,
    },
  };
}

function buildOutput(args) {
  let result;
  let sessionContext = null;
  let cooReadiness = null;
  let businessForReadiness = args.business || null;
  let appForReadiness = args.app || null;
  if (args.business) {
    cooReadiness = resolveSquadWorkspaceReadiness({
      squad: 'design',
      business: args.business,
      contextType: 'design_system',
    });
    const workspaceConfig = resolver.getWorkspaceConfig();
    result = resolver.buildBusinessResult(workspaceConfig, args.business);
  } else if (args.app) {
    cooReadiness = resolveSquadWorkspaceReadiness({
      squad: 'design',
      app: args.app,
      contextType: 'design_system',
    });
    const workspaceConfig = resolver.getWorkspaceConfig();
    result = resolver.resolveByApp(workspaceConfig, args.app);
  } else {
    if (args.codebase) {
      return buildHeuristicContext(args.codebase, args.task);
    }

    sessionContext = readSessionContext();
    businessForReadiness = sessionContext.businessSlug;
    appForReadiness = sessionContext.appId;
    cooReadiness = resolveSquadWorkspaceReadiness({
      squad: 'design',
      business: businessForReadiness,
      app: appForReadiness,
      contextType: 'design_system',
    });
    const workspaceConfig = resolver.getWorkspaceConfig();
    result = sessionContext.appId
      ? resolver.resolveByApp(workspaceConfig, sessionContext.appId)
      : resolver.buildBusinessResult(workspaceConfig, sessionContext.businessSlug);
  }

  if (result.status === 'not_applicable') {
    return {
      task: args.task || null,
      resolution_method: args.app ? 'app' : args.business ? 'business' : 'default_business',
      business_slug: result.business_slug,
      status: result.status,
      action: 'skip',
      coo_readiness: {
        owner: cooReadiness.owner,
        status: cooReadiness.status,
        reason: cooReadiness.reason,
        canonical_config_paths: cooReadiness.canonical_config_paths,
      },
      config_path: result.config_path,
      design_system: null,
      message: 'Design System is not applicable for this BU. Do not request DS creation.',
    };
  }

  if (result.status === 'not_configured') {
    return {
      task: args.task || null,
      resolution_method: args.app ? 'app' : args.business ? 'business' : 'default_business',
      business_slug: result.business_slug,
      status: result.status,
      action: 'fail_closed',
      coo_readiness: {
        owner: cooReadiness.owner,
        status: cooReadiness.status,
        reason: cooReadiness.reason,
        canonical_config_paths: cooReadiness.canonical_config_paths,
      },
      config_path: result.config_path,
      design_system: null,
      remediation: `Create ${result.config_path} or mark the BU as not_applicable in workspace/workspace.yaml.`,
    };
  }

  const context = buildConfiguredContext(
    result,
    args.app || (sessionContext ? sessionContext.appId : null),
    args.codebase,
    args.task,
    sessionContext ? sessionContext.theme : null,
  );
  if (!args.business && !args.app && !args.codebase) {
    context.resolution_method = 'active_session';
    context.session_context_path = runtimePaths.toWorkspaceRelative(sessionContext.sessionPath);
  }
  context.coo_readiness = {
    owner: cooReadiness.owner,
    status: cooReadiness.status,
    reason: cooReadiness.reason,
    canonical_config_paths: cooReadiness.canonical_config_paths,
    app_id: appForReadiness,
    business_slug: businessForReadiness,
  };
  return context;
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
  const output = buildOutput(args);
  printOutput(output, args.format);
}

if (require.main === module) {
  main();
}

module.exports = {
  buildConfiguredContext,
  buildHeuristicContext,
  buildOutput,
  parseArgs,
};
