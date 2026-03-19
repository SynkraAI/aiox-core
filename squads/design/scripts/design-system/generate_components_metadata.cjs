#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const registryPath = path.join(ROOT, 'workspace/ui/registry.json');
const outputPath = path.join(ROOT, 'workspace/domains/design-system/metadata/components.json');

const DEFAULTS_BY_COMPONENT = {
  button: {
    agent_owner: 'brad-frost',
    variants: ['default', 'secondary', 'outline', 'ghost', 'link'],
    tokens: ['color.brand.primary', 'color.text.inverse', 'spacing.3', 'radius.md'],
    a11y: {
      role: 'button',
      keyboard: ['Enter', 'Space'],
      aria: ['aria-label (when icon-only)', 'aria-disabled'],
      wcag: ['2.1.1', '2.4.7', '4.1.2'],
    },
  },
  input: {
    agent_owner: 'brad-frost',
    variants: ['default', 'error', 'disabled'],
    tokens: ['color.surface.default', 'color.border.default', 'color.text.default', 'spacing.3', 'radius.md'],
    a11y: {
      role: 'textbox',
      keyboard: ['Tab', 'Shift+Tab'],
      aria: ['aria-label or associated label', 'aria-describedby', 'aria-invalid'],
      wcag: ['1.3.1', '2.4.6', '3.3.1', '4.1.2'],
    },
  },
};

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function safeReadJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    fail(`Unable to parse JSON at ${filePath}: ${error.message}`);
  }
}

function inferComponent(item) {
  const key = item.name;
  const defaults = DEFAULTS_BY_COMPONENT[key] || {
    agent_owner: 'design-chief',
    variants: ['default'],
    tokens: [],
    a11y: {
      role: 'generic',
      keyboard: ['Tab'],
      aria: [],
      wcag: ['4.1.2'],
    },
  };

  return {
    id: key,
    name: item.title || key,
    status: 'active',
    version: '1.0.0',
    agent_owner: defaults.agent_owner,
    registryKey: key,
    files: (item.files || []).map((file) => ({
      path: file.path,
      type: file.type || 'registry:component',
    })),
    variants: defaults.variants,
    tokens: defaults.tokens,
    a11y: defaults.a11y,
    task_refs: ['ds-build-component', 'ds-sync-registry', 'ds-govern-a11y-compliance'],
    template_refs: ['component-visual-spec-tmpl', 'component-prompt-injection-tmpl'],
    workflow_refs: ['brownfield-complete', 'greenfield-new'],
  };
}

function main() {
  if (!fs.existsSync(registryPath)) {
    fail(`Registry not found: ${registryPath}`);
  }

  const registry = safeReadJson(registryPath);
  const items = Array.isArray(registry.items) ? registry.items : [];

  const components = items.map(inferComponent);
  const payload = {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    source: {
      registry: 'workspace/ui/registry.json',
      generator: 'squads/design/scripts/design-system/generate_components_metadata.cjs',
    },
    components,
    integrity: {
      componentCount: components.length,
      registryItemCount: items.length,
    },
  };

  ensureDir(outputPath);
  fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`PASS: Generated ${payload.integrity.componentCount} components at ${path.relative(ROOT, outputPath)}`);
}

main();
