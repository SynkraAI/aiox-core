const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..', '..');
const CORE_DIR = path.join(REPO_ROOT, '.aiox-core');
const INFRA_DIR = path.join(CORE_DIR, 'infrastructure');

/**
 * Guards the layered dependency direction declared in
 * `.aiox-core/infrastructure/README.md`:
 *
 *   infrastructure/ ← core/ ← development/ ← product/
 *
 *   - infrastructure/ CAN import from: nothing (base layer)
 *   - core/          CAN import from: infrastructure/
 *   - development/   CAN import from: infrastructure/, core/
 *   - product/       CAN import from: infrastructure/, core/
 *
 * Infrastructure importing upward inverts that direction. One such import is a
 * genuine cycle: infrastructure/{batch-creator,component-generator} →
 * core/elicitation/elicitation-engine → infrastructure/scripts/security-checker.
 * That cycle is already mitigated deliberately — the engine wraps its require in
 * try/catch with a documented fallback ("resolves the cross-module dependency
 * issue from Story 2.2") — so it does not break at load time today.
 *
 * These violations predate this test and are not fixed here: unwinding them means
 * extracting ports (SecurityPolicy, WorkflowValidation, ContentScanner) and
 * rewiring composition, which touches the nine core/ modules that import
 * infrastructure/ legitimately. The test pins the known set so the debt stays
 * visible and cannot grow silently. Fixing one means deleting its entry.
 */
describe('infrastructure layer boundary', () => {
  const SKIP_DIRS = new Set(['node_modules', '.git', 'coverage', 'dist', 'build', '__tests__']);

  /**
   * Known upward imports from infrastructure/, as of AIOX 5.4.1.
   * Key: path relative to .aiox-core/infrastructure/. Value: why it is here.
   */
  const KNOWN_VIOLATIONS = {
    'scripts/pre-dispatch-guard.js': 'core/permissions/dispatch-governance — assertDispatchGovernance',
    'scripts/component-generator.js': 'core/elicitation/elicitation-engine — ElicitationEngine',
    'scripts/batch-creator.js': 'core/elicitation/elicitation-engine — ElicitationEngine',
    'scripts/framework-analyzer.js': 'development/scripts/workflow-validator — WorkflowValidator',
    'scripts/framework-3way-diff.js': 'core/security/port-denylist — scanContent',
  };

  const UPWARD_IMPORT_RE = /require\(\s*['"](?:\.\.\/)+(core|development|product)\/[^'"]*['"]\s*\)/;

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

  /** Files under infrastructure/ that import from core/, development/ or product/. */
  function findUpwardImports() {
    const found = [];

    for (const file of collectJsFiles(INFRA_DIR)) {
      const source = fs.readFileSync(file, 'utf-8');
      if (UPWARD_IMPORT_RE.test(source)) {
        found.push(path.relative(INFRA_DIR, file).split(path.sep).join('/'));
      }
    }

    return found.sort();
  }

  it('does not introduce new upward imports from infrastructure/', () => {
    const actual = findUpwardImports();
    const known = Object.keys(KNOWN_VIOLATIONS).sort();

    const added = actual.filter((f) => !known.includes(f));

    expect(added).toEqual([]);
  });

  it('keeps the known-violation list honest — no stale entries', () => {
    // A fixed violation must be removed from KNOWN_VIOLATIONS, otherwise the
    // list drifts into fiction and stops meaning anything.
    const actual = findUpwardImports();
    const known = Object.keys(KNOWN_VIOLATIONS).sort();

    const stale = known.filter((f) => !actual.includes(f));

    expect(stale).toEqual([]);
  });

  it('documents the dependency direction in the infrastructure README', () => {
    // The rule this test enforces must stay written down where a reader looks.
    const readme = fs.readFileSync(path.join(INFRA_DIR, 'README.md'), 'utf-8');

    expect(readme).toMatch(/CAN import from: nothing \(base layer\)/);
  });
});
