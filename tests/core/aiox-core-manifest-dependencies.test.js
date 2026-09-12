const fs = require('fs');
const path = require('path');
const ts = require('typescript');

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

  /**
   * Collect bare `require('pkg')` specifiers from a source file, skipping those
   * inside a `catch` block.
   *
   * A require inside `catch` is an optional fallback: the primary dependency is
   * declared and resolves, and this path only runs if it somehow does not.
   * Declaring such a package as a hard dependency would force every consumer to
   * install a module the framework never loads in practice.
   *
   * Parsed via the TypeScript compiler's AST rather than scanned textually.
   * Counting braces over raw text misreads any `{` or `}` that appears inside a
   * string, comment, regex or template literal, so a require could be
   * misclassified in either direction. The AST also rules out false matches like
   * `foo.require('x')` or a dynamic `require(someVar)`, which are not static
   * bare specifiers at all.
   *
   * @returns {string[]} bare specifiers required outside any catch block
   */
  function collectStaticRequires(source, fileName) {
    const sourceFile = ts.createSourceFile(
      fileName,
      source,
      ts.ScriptTarget.Latest,
      /* setParentNodes */ true,
      ts.ScriptKind.JS,
    );

    const specifiers = [];

    /** True when any ancestor of `node` is the block of a catch clause. */
    function insideCatch(node) {
      for (let cur = node.parent; cur; cur = cur.parent) {
        if (ts.isCatchClause(cur)) return true;
      }
      return false;
    }

    function visit(node) {
      if (
        ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        node.expression.text === 'require' &&
        node.arguments.length === 1 &&
        ts.isStringLiteral(node.arguments[0]) &&
        !insideCatch(node)
      ) {
        specifiers.push(node.arguments[0].text);
      }

      ts.forEachChild(node, visit);
    }

    visit(sourceFile);
    return specifiers;
  }

  describe('collectStaticRequires', () => {
    it('collects top-level bare requires', () => {
      const src = "const a = require('alpha');\nconst b = require('@scope/beta');\n";

      expect(collectStaticRequires(src, 'probe.js')).toEqual(['alpha', '@scope/beta']);
    });

    it('skips requires inside a catch block', () => {
      const src = `
        let mod;
        try { mod = require('primary'); }
        catch (e) { mod = require('fallback'); }
      `;

      expect(collectStaticRequires(src, 'probe.js')).toEqual(['primary']);
    });

    it('is not fooled by braces inside strings, comments, regexes or templates', () => {
      // Brace counting over raw text miscounts every one of these and
      // misclassifies the require that follows.
      const src = `
        const brace = '}';
        // a stray } in a comment
        /* and } another */
        const re = /[{}]/g;
        const tpl = \`\${brace} }\`;
        const real = require('after-the-noise');
      `;

      expect(collectStaticRequires(src, 'probe.js')).toEqual(['after-the-noise']);
    });

    it('skips a catch-guarded require even when a string in the block holds a stray brace', () => {
      // The case brace counting gets wrong: the `'}'` literal closes the block
      // early for a text scanner, so the fallback leaks out as a hard dependency.
      const src = "try { a = require('primary'); } catch (e) { const s = '}'; a = require('fallback'); }";

      expect(collectStaticRequires(src, 'probe.js')).toEqual(['primary']);
    });

    it('ignores member-expression and dynamic requires', () => {
      const src = `
        const x = foo.require('not-a-real-require');
        const y = require(someVariable);
        const z = require(\`dynamic/\${name}\`);
        const w = require('genuine');
      `;

      expect(collectStaticRequires(src, 'probe.js')).toEqual(['genuine']);
    });

    it('still collects a require nested in a try block', () => {
      // Only `catch` marks an optional fallback; `try` does not.
      const src = "try { const a = require('inside-try'); } catch { /* ignore */ }";

      expect(collectStaticRequires(src, 'probe.js')).toEqual(['inside-try']);
    });
  });

  it('declares ajv-formats, which modules under .aiox-core/ require at runtime', () => {
    expect(declared.has('ajv-formats')).toBe(true);
  });

  it('does not declare `yaml`, which is only a catch-guarded fallback for js-yaml', () => {
    // registry-provider.js requires js-yaml and falls back to `yaml` only if
    // that throws. js-yaml is declared and resolves, so the fallback never runs
    // — declaring `yaml` would add an install every consumer pays for unused.
    expect(declared.has('js-yaml')).toBe(true);
    expect(declared.has('yaml')).toBe(false);
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

      for (const specifier of collectStaticRequires(source, file)) {
        // Relative and absolute paths resolve within the tree, not via node_modules.
        if (specifier.startsWith('.') || specifier.startsWith('/')) continue;
        if (specifier.startsWith('node:')) continue;

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
