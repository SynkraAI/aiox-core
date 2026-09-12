const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..', '..');
const CORE_DIR = path.join(REPO_ROOT, '.aiox-core');
const CORE_MANIFEST = path.join(CORE_DIR, 'package.json');

/**
 * Regression tests for the internal `.aiox-core/package.json` manifest.
 *
 * That manifest declares the runtime dependencies consumed by scripts under
 * `.aiox-core/`. It is what governs installs in consumer projects, where only
 * `.aiox-core/` ships. When a module under `.aiox-core/` requires a package the
 * manifest does not declare, resolution silently walks up the directory tree and
 * can succeed from an unrelated ancestor `node_modules` on the developer's
 * machine — then fails with MODULE_NOT_FOUND on any clean install.
 *
 * `ajv-formats` hit exactly that: declared in the root package.json, consumed by
 * four modules under `.aiox-core/`, absent from the internal manifest.
 */
describe('.aiox-core internal manifest dependency declarations', () => {
  const manifest = JSON.parse(fs.readFileSync(CORE_MANIFEST, 'utf-8'));
  const declared = new Set([
    ...Object.keys(manifest.dependencies || {}),
    ...Object.keys(manifest.peerDependencies || {}),
    ...Object.keys(manifest.optionalDependencies || {}),
  ]);

  const SKIP_DIRS = new Set(['node_modules', '.git', 'coverage', 'dist', 'build', '__tests__']);

  /** Collect every .js file under .aiox-core/, excluding vendored/build output. */
  function collectJsFiles(dir, acc = []) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return acc;
    }

    for (const entry of entries) {
      if (SKIP_DIRS.has(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        collectJsFiles(full, acc);
      } else if (entry.isFile() && entry.name.endsWith('.js') && !entry.name.endsWith('.test.js')) {
        acc.push(full);
      }
    }
    return acc;
  }

  /** Bare specifier => package name ('@scope/pkg/sub' => '@scope/pkg'). */
  function packageNameOf(specifier) {
    const parts = specifier.split('/');
    return specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
  }

  const REQUIRE_RE = /require\(\s*['"]([^'"]+)['"]\s*\)/g;

  it('declares ajv-formats, which modules under .aiox-core/ require at runtime', () => {
    expect(declared.has('ajv-formats')).toBe(true);
  });

  // Runtime surface: modules the framework loads to do its job. Deliberately
  // excludes development/ and infrastructure/scripts/, which host code
  // generators and scaffolding tools whose `require` calls describe the code
  // they *emit* (jest, mocha, playwright, handlebars templates) rather than
  // what .aiox-core/ itself loads. Those are tracked separately as optional
  // tooling; folding them in here would force heavyweight installs on every
  // consumer project.
  const RUNTIME_DIRS = ['core', 'quality', path.join('product', 'templates', 'engine')];

  it('declares every third-party package required by .aiox-core runtime modules', () => {
    const builtins = new Set(require('module').builtinModules);
    const undeclared = new Map();

    const runtimeFiles = RUNTIME_DIRS.flatMap((dir) => collectJsFiles(path.join(CORE_DIR, dir)));
    expect(runtimeFiles.length).toBeGreaterThan(0);

    for (const file of runtimeFiles) {
      const source = fs.readFileSync(file, 'utf-8');

      for (const match of source.matchAll(REQUIRE_RE)) {
        const specifier = match[1];

        // Relative and absolute paths resolve within the tree, not via node_modules.
        if (specifier.startsWith('.') || specifier.startsWith('/')) continue;
        if (specifier.startsWith('node:')) continue;
        // Dynamic specifiers built from template literals are not static imports.
        if (specifier.includes('${')) continue;

        const pkg = packageNameOf(specifier);
        if (builtins.has(pkg)) continue;
        if (declared.has(pkg)) continue;

        if (!undeclared.has(pkg)) undeclared.set(pkg, []);
        undeclared.get(pkg).push(path.relative(REPO_ROOT, file));
      }
    }

    // Report every offender with its call sites, so a failure is actionable.
    const report = [...undeclared.entries()]
      .map(([pkg, files]) => `  ${pkg} — required by ${files.slice(0, 3).join(', ')}`)
      .join('\n');

    expect(report).toBe('');
  });
});
