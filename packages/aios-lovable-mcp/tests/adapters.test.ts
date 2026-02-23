import { describe, it, expect } from 'vitest';
import { ArchitectAdapter } from '../src/adapters/architect-adapter.js';
import { DevAdapter } from '../src/adapters/dev-adapter.js';
import { Orchestrator } from '../src/adapters/orchestrator.js';

describe('ArchitectAdapter', () => {
  const adapter = new ArchitectAdapter();

  it('returns success with architecture data', async () => {
    const result = await adapter.execute({
      spec: 'Build a quiz app with leaderboards',
    });

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data!.architecture.stack.frontend).toContain('Next.js');
    expect(result.data!.architecture.security.auth_strategy).toContain(
      'Supabase'
    );
    expect(result.data!.architecture_markdown).toContain('# System Architecture');
    expect(result.duration_ms).toBeGreaterThanOrEqual(0);
  });

  it('respects stack_preference for vite', async () => {
    const result = await adapter.execute({
      spec: 'Build a dashboard',
      stack_preference: 'vite-react',
    });

    expect(result.success).toBe(true);
    expect(result.data!.architecture.stack.frontend).toContain('Vite');
  });

  it('has a 5-minute timeout', () => {
    expect(adapter.timeoutMs).toBe(5 * 60 * 1000);
  });
});

describe('DevAdapter', () => {
  const adapter = new DevAdapter();

  it('returns success with generated files (nextjs)', async () => {
    const result = await adapter.execute({
      spec: 'Build a quiz app',
    });

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data!.files.length).toBeGreaterThan(0);
    expect(result.data!.files[0].path).toContain('page.tsx');
    expect(result.data!.dependencies.production).toHaveProperty(
      '@supabase/supabase-js'
    );
    expect(result.data!.setup_instructions).toContain('npm install');
  });

  it('generates vite files when framework is vite-react', async () => {
    const result = await adapter.execute({
      spec: 'Build a dashboard',
      framework: 'vite-react',
    });

    expect(result.success).toBe(true);
    expect(result.data!.files[0].path).toContain('App.tsx');
  });

  it('has a 10-minute timeout', () => {
    expect(adapter.timeoutMs).toBe(10 * 60 * 1000);
  });
});

describe('Orchestrator', () => {
  const orchestrator = new Orchestrator();

  it('routes designArchitecture to ArchitectAdapter', async () => {
    const result = await orchestrator.designArchitecture({
      spec: 'E-commerce platform',
    });

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it('routes generateCode to DevAdapter', async () => {
    const result = await orchestrator.generateCode({
      spec: 'E-commerce platform',
    });

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });
});
