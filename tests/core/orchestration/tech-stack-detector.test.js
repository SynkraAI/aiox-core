/**
 * Testes unitários para o módulo tech-stack-detector
 *
 * Testa a classe TechStackDetector que detecta a stack tecnológica
 * do projeto de forma determinística usando operações de filesystem.
 */

const path = require('path');

jest.mock('fs-extra');
const fs = require('fs-extra');
const TechStackDetector = require('../../../.aios-core/core/orchestration/tech-stack-detector');

describe('TechStackDetector', () => {
  let detector;
  const PROJECT_ROOT = '/fake/project';

  /**
   * Helper reutilizado em _detectDatabase, _detectFrontend e _detectBackend.
   * Configura mocks para simular um package.json com as dependências fornecidas.
   */
  function setupDeps(deps) {
    fs.pathExists.mockImplementation(async (p) => {
      if (p === path.join(PROJECT_ROOT, 'package.json')) return true;
      return false;
    });
    fs.readJson.mockResolvedValue({ dependencies: deps });
  }

  beforeEach(() => {
    jest.clearAllMocks();
    detector = new TechStackDetector(PROJECT_ROOT);

    // Default: nada existe
    fs.pathExists.mockResolvedValue(false);
    fs.readJson.mockRejectedValue(new Error('not found'));
    fs.readdir.mockResolvedValue([]);
    fs.readFile.mockResolvedValue('');
  });

  // ============================================================
  // Constructor
  // ============================================================
  describe('constructor', () => {
    test('armazena projectRoot', () => {
      expect(detector.projectRoot).toBe(PROJECT_ROOT);
    });

    test('inicializa cache de package.json como null', () => {
      expect(detector._packageJsonCache).toBeNull();
    });
  });

  // ============================================================
  // _createEmptyProfile
  // ============================================================
  describe('_createEmptyProfile', () => {
    test('retorna profile com todos os flags false', () => {
      const profile = detector._createEmptyProfile();
      expect(profile.hasDatabase).toBe(false);
      expect(profile.hasFrontend).toBe(false);
      expect(profile.hasBackend).toBe(false);
      expect(profile.hasTypeScript).toBe(false);
      expect(profile.hasTests).toBe(false);
    });

    test('retorna database profile vazio', () => {
      const profile = detector._createEmptyProfile();
      expect(profile.database).toEqual({
        type: null,
        hasSchema: false,
        hasMigrations: false,
        hasRLS: false,
        envVarsConfigured: false,
      });
    });

    test('retorna frontend profile vazio', () => {
      const profile = detector._createEmptyProfile();
      expect(profile.frontend).toEqual({
        framework: null,
        buildTool: null,
        styling: null,
        componentLibrary: null,
      });
    });

    test('retorna backend profile vazio', () => {
      const profile = detector._createEmptyProfile();
      expect(profile.backend).toEqual({ type: null, hasAPI: false });
    });

    test('retorna campos computados vazios', () => {
      const profile = detector._createEmptyProfile();
      expect(profile.applicablePhases).toEqual([]);
      expect(profile.confidence).toBe(0);
      expect(profile.detectedAt).toBeNull();
    });
  });

  // ============================================================
  // _loadPackageJson
  // ============================================================
  describe('_loadPackageJson', () => {
    test('retorna null quando package.json não existe', async () => {
      fs.pathExists.mockResolvedValue(false);
      const result = await detector._loadPackageJson();
      expect(result).toBeNull();
    });

    test('retorna conteúdo do package.json quando existe', async () => {
      const pkg = { name: 'test', dependencies: { react: '^18' } };
      fs.pathExists.mockResolvedValue(true);
      fs.readJson.mockResolvedValue(pkg);

      const result = await detector._loadPackageJson();
      expect(result).toEqual(pkg);
    });

    test('usa cache na segunda chamada', async () => {
      const pkg = { name: 'test' };
      fs.pathExists.mockResolvedValue(true);
      fs.readJson.mockResolvedValue(pkg);

      await detector._loadPackageJson();
      await detector._loadPackageJson();

      expect(fs.readJson).toHaveBeenCalledTimes(1);
    });

    test('retorna null quando JSON é inválido', async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readJson.mockRejectedValue(new Error('invalid json'));

      const result = await detector._loadPackageJson();
      expect(result).toBeNull();
    });
  });

  // ============================================================
  // _getAllDependencies
  // ============================================================
  describe('_getAllDependencies', () => {
    test('retorna objeto vazio quando não há package.json', async () => {
      const deps = await detector._getAllDependencies();
      expect(deps).toEqual({});
    });

    test('combina dependencies e devDependencies', async () => {
      const pkg = {
        dependencies: { react: '^18', express: '^4' },
        devDependencies: { jest: '^30', typescript: '^5' },
      };
      fs.pathExists.mockResolvedValue(true);
      fs.readJson.mockResolvedValue(pkg);

      const deps = await detector._getAllDependencies();
      expect(deps.react).toBe('^18');
      expect(deps.express).toBe('^4');
      expect(deps.jest).toBe('^30');
      expect(deps.typescript).toBe('^5');
    });

    test('funciona quando só tem dependencies', async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readJson.mockResolvedValue({ dependencies: { react: '^18' } });

      const deps = await detector._getAllDependencies();
      expect(deps.react).toBe('^18');
    });
  });

  // ============================================================
  // _detectDatabase
  // ============================================================
  describe('_detectDatabase', () => {
    test('detecta Supabase pelo diretório', async () => {
      fs.pathExists.mockImplementation(async (p) => {
        if (p.endsWith('supabase')) return true;
        if (p.endsWith('package.json')) return true;
        return false;
      });
      fs.readJson.mockResolvedValue({ dependencies: {} });

      const profile = detector._createEmptyProfile();
      await detector._detectDatabase(profile);

      expect(profile.hasDatabase).toBe(true);
      expect(profile.database.type).toBe('supabase');
    });

    test('detecta migrações no diretório supabase', async () => {
      fs.pathExists.mockImplementation(async (p) => {
        if (p.endsWith('supabase')) return true;
        if (p.endsWith('migrations')) return true;
        if (p.endsWith('package.json')) return true;
        return false;
      });
      fs.readJson.mockResolvedValue({ dependencies: {} });
      fs.readdir.mockResolvedValue(['001_init.sql']);
      fs.readFile.mockResolvedValue('CREATE TABLE users (id serial);');

      const profile = detector._createEmptyProfile();
      await detector._detectDatabase(profile);

      expect(profile.database.hasMigrations).toBe(true);
      expect(profile.database.hasSchema).toBe(true);
    });

    test('detecta RLS em migrações SQL', async () => {
      fs.pathExists.mockImplementation(async (p) => {
        if (p.endsWith('supabase')) return true;
        if (p.endsWith('migrations')) return true;
        if (p.endsWith('package.json')) return true;
        return false;
      });
      fs.readJson.mockResolvedValue({ dependencies: {} });
      fs.readdir.mockResolvedValue(['001_rls.sql']);
      fs.readFile.mockResolvedValue('ALTER TABLE users ENABLE ROW LEVEL SECURITY;');

      const profile = detector._createEmptyProfile();
      await detector._detectDatabase(profile);

      expect(profile.database.hasRLS).toBe(true);
    });

    test('detecta RLS via CREATE POLICY', async () => {
      fs.pathExists.mockImplementation(async (p) => {
        if (p.endsWith('supabase')) return true;
        if (p.endsWith('migrations')) return true;
        if (p.endsWith('package.json')) return true;
        return false;
      });
      fs.readJson.mockResolvedValue({ dependencies: {} });
      fs.readdir.mockResolvedValue(['002_policy.sql']);
      fs.readFile.mockResolvedValue('CREATE POLICY select_own ON users;');

      const profile = detector._createEmptyProfile();
      await detector._detectDatabase(profile);
      expect(profile.database.hasRLS).toBe(true);
    });

    test('detecta Prisma pelo diretório', async () => {
      fs.pathExists.mockImplementation(async (p) => {
        if (p.endsWith('prisma')) return true;
        if (p.endsWith('schema.prisma')) return true;
        if (p.endsWith('package.json')) return true;
        return false;
      });
      fs.readJson.mockResolvedValue({ dependencies: {} });

      const profile = detector._createEmptyProfile();
      await detector._detectDatabase(profile);

      expect(profile.hasDatabase).toBe(true);
      expect(profile.database.type).toBe('postgresql');
      expect(profile.database.hasSchema).toBe(true);
    });

    test('detecta Supabase por dependência npm', async () => {
      setupDeps({ '@supabase/supabase-js': '^2' });

      const profile = detector._createEmptyProfile();
      await detector._detectDatabase(profile);

      expect(profile.hasDatabase).toBe(true);
      expect(profile.database.type).toBe('supabase');
    });

    test('detecta PostgreSQL por dependência pg', async () => {
      setupDeps({ pg: '^8' });
      const profile = detector._createEmptyProfile();
      await detector._detectDatabase(profile);
      expect(profile.database.type).toBe('postgresql');
    });

    test('detecta PostgreSQL por dependência @prisma/client', async () => {
      setupDeps({ '@prisma/client': '^5' });
      const profile = detector._createEmptyProfile();
      await detector._detectDatabase(profile);
      expect(profile.database.type).toBe('postgresql');
    });

    test('detecta MongoDB por dependência mongoose', async () => {
      setupDeps({ mongoose: '^7' });
      const profile = detector._createEmptyProfile();
      await detector._detectDatabase(profile);
      expect(profile.database.type).toBe('mongodb');
    });

    test('detecta MySQL por dependência mysql2', async () => {
      setupDeps({ mysql2: '^3' });
      const profile = detector._createEmptyProfile();
      await detector._detectDatabase(profile);
      expect(profile.database.type).toBe('mysql');
    });

    test('detecta SQLite por dependência better-sqlite3', async () => {
      setupDeps({ 'better-sqlite3': '^9' });
      const profile = detector._createEmptyProfile();
      await detector._detectDatabase(profile);
      expect(profile.database.type).toBe('sqlite');
    });

    test('preserva primeira detecção de tipo (supabase > mongo)', async () => {
      setupDeps({ '@supabase/supabase-js': '^2', mongoose: '^7' });
      const profile = detector._createEmptyProfile();
      await detector._detectDatabase(profile);
      expect(profile.database.type).toBe('supabase');
    });

    test('detecta env vars de banco de dados', async () => {
      fs.pathExists.mockImplementation(async (p) => {
        if (p.endsWith('package.json')) return true;
        if (p.endsWith('.env')) return true;
        return false;
      });
      fs.readJson.mockResolvedValue({ dependencies: {} });
      fs.readFile.mockResolvedValue('DATABASE_URL=postgres://localhost/db');

      const profile = detector._createEmptyProfile();
      await detector._detectDatabase(profile);

      expect(profile.database.envVarsConfigured).toBe(true);
    });

    test('ignora erros de leitura em migrações', async () => {
      fs.pathExists.mockImplementation(async (p) => {
        if (p.endsWith('supabase')) return true;
        if (p.endsWith('migrations')) return true;
        if (p.endsWith('package.json')) return true;
        return false;
      });
      fs.readJson.mockResolvedValue({ dependencies: {} });
      fs.readdir.mockRejectedValue(new Error('permission denied'));

      const profile = detector._createEmptyProfile();
      await expect(detector._detectDatabase(profile)).resolves.toBeUndefined();
    });
  });

  // ============================================================
  // _detectFrontend
  // ============================================================
  describe('_detectFrontend', () => {
    test('detecta React', async () => {
      setupDeps({ react: '^18' });
      const profile = detector._createEmptyProfile();
      await detector._detectFrontend(profile);
      expect(profile.hasFrontend).toBe(true);
      expect(profile.frontend.framework).toBe('react');
    });

    test('detecta Vue', async () => {
      setupDeps({ vue: '^3' });
      const profile = detector._createEmptyProfile();
      await detector._detectFrontend(profile);
      expect(profile.frontend.framework).toBe('vue');
    });

    test('detecta Angular', async () => {
      setupDeps({ '@angular/core': '^17' });
      const profile = detector._createEmptyProfile();
      await detector._detectFrontend(profile);
      expect(profile.frontend.framework).toBe('angular');
    });

    test('detecta Svelte', async () => {
      setupDeps({ svelte: '^4' });
      const profile = detector._createEmptyProfile();
      await detector._detectFrontend(profile);
      expect(profile.frontend.framework).toBe('svelte');
    });

    test('detecta Next.js como React', async () => {
      setupDeps({ next: '^14' });
      const profile = detector._createEmptyProfile();
      await detector._detectFrontend(profile);
      expect(profile.frontend.framework).toBe('react');
    });

    test('detecta Nuxt como Vue', async () => {
      setupDeps({ nuxt: '^3' });
      const profile = detector._createEmptyProfile();
      await detector._detectFrontend(profile);
      expect(profile.frontend.framework).toBe('vue');
    });

    test('detecta Vite como build tool', async () => {
      setupDeps({ react: '^18', vite: '^5' });
      const profile = detector._createEmptyProfile();
      await detector._detectFrontend(profile);
      expect(profile.frontend.buildTool).toBe('vite');
    });

    test('detecta Webpack como build tool', async () => {
      setupDeps({ webpack: '^5' });
      const profile = detector._createEmptyProfile();
      await detector._detectFrontend(profile);
      expect(profile.frontend.buildTool).toBe('webpack');
    });

    test('detecta Tailwind como styling', async () => {
      setupDeps({ tailwindcss: '^3' });
      const profile = detector._createEmptyProfile();
      await detector._detectFrontend(profile);
      expect(profile.frontend.styling).toBe('tailwind');
    });

    test('detecta styled-components', async () => {
      setupDeps({ 'styled-components': '^6' });
      const profile = detector._createEmptyProfile();
      await detector._detectFrontend(profile);
      expect(profile.frontend.styling).toBe('styled-components');
    });

    test('detecta Emotion', async () => {
      setupDeps({ '@emotion/react': '^11' });
      const profile = detector._createEmptyProfile();
      await detector._detectFrontend(profile);
      expect(profile.frontend.styling).toBe('emotion');
    });

    test('detecta SCSS via sass', async () => {
      setupDeps({ sass: '^1' });
      const profile = detector._createEmptyProfile();
      await detector._detectFrontend(profile);
      expect(profile.frontend.styling).toBe('scss');
    });

    test('detecta shadcn pelo diretório src/components/ui', async () => {
      fs.pathExists.mockImplementation(async (p) => {
        if (p === path.join(PROJECT_ROOT, 'package.json')) return true;
        if (p === path.join(PROJECT_ROOT, 'src/components/ui')) return true;
        return false;
      });
      fs.readJson.mockResolvedValue({ dependencies: { react: '^18' } });

      const profile = detector._createEmptyProfile();
      await detector._detectFrontend(profile);
      expect(profile.frontend.componentLibrary).toBe('shadcn');
    });

    test('detecta MUI por dependência', async () => {
      setupDeps({ '@mui/material': '^5' });
      const profile = detector._createEmptyProfile();
      await detector._detectFrontend(profile);
      expect(profile.frontend.componentLibrary).toBe('mui');
    });

    test('detecta Chakra por dependência', async () => {
      setupDeps({ '@chakra-ui/react': '^2' });
      const profile = detector._createEmptyProfile();
      await detector._detectFrontend(profile);
      expect(profile.frontend.componentLibrary).toBe('chakra');
    });

    test('detecta Ant Design por dependência', async () => {
      setupDeps({ antd: '^5' });
      const profile = detector._createEmptyProfile();
      await detector._detectFrontend(profile);
      expect(profile.frontend.componentLibrary).toBe('antd');
    });

    test('detecta frontend por arquivos .tsx em src/', async () => {
      fs.pathExists.mockImplementation(async (p) => {
        if (p === path.join(PROJECT_ROOT, 'package.json')) return true;
        if (p === path.join(PROJECT_ROOT, 'src')) return true;
        return false;
      });
      fs.readJson.mockResolvedValue({ dependencies: {} });
      fs.readdir.mockResolvedValue(['App.tsx', 'index.ts']);

      const profile = detector._createEmptyProfile();
      await detector._detectFrontend(profile);
      expect(profile.hasFrontend).toBe(true);
    });

    test('não detecta frontend sem arquivos UI em src/', async () => {
      fs.pathExists.mockImplementation(async (p) => {
        if (p === path.join(PROJECT_ROOT, 'package.json')) return true;
        if (p === path.join(PROJECT_ROOT, 'src')) return true;
        return false;
      });
      fs.readJson.mockResolvedValue({ dependencies: {} });
      fs.readdir.mockResolvedValue(['server.js', 'utils.js']);

      const profile = detector._createEmptyProfile();
      await detector._detectFrontend(profile);
      expect(profile.hasFrontend).toBe(false);
    });
  });

  // ============================================================
  // _detectBackend
  // ============================================================
  describe('_detectBackend', () => {
    test('detecta Express', async () => {
      setupDeps({ express: '^4' });
      const profile = detector._createEmptyProfile();
      await detector._detectBackend(profile);
      expect(profile.hasBackend).toBe(true);
      expect(profile.backend.type).toBe('express');
    });

    test('detecta Fastify', async () => {
      setupDeps({ fastify: '^4' });
      const profile = detector._createEmptyProfile();
      await detector._detectBackend(profile);
      expect(profile.backend.type).toBe('fastify');
    });

    test('detecta NestJS', async () => {
      setupDeps({ '@nestjs/core': '^10' });
      const profile = detector._createEmptyProfile();
      await detector._detectBackend(profile);
      expect(profile.backend.type).toBe('nest');
    });

    test('detecta Hono', async () => {
      setupDeps({ hono: '^4' });
      const profile = detector._createEmptyProfile();
      await detector._detectBackend(profile);
      expect(profile.backend.type).toBe('hono');
    });

    test('detecta Edge Functions pelo diretório supabase/functions', async () => {
      fs.pathExists.mockImplementation(async (p) => {
        if (p === path.join(PROJECT_ROOT, 'package.json')) return true;
        if (p === path.join(PROJECT_ROOT, 'supabase', 'functions')) return true;
        return false;
      });
      fs.readJson.mockResolvedValue({ dependencies: {} });

      const profile = detector._createEmptyProfile();
      await detector._detectBackend(profile);
      expect(profile.hasBackend).toBe(true);
      expect(profile.backend.type).toBe('edge-functions');
    });

    test('detecta rotas API em api/', async () => {
      fs.pathExists.mockImplementation(async (p) => {
        if (p === path.join(PROJECT_ROOT, 'package.json')) return true;
        if (p === path.join(PROJECT_ROOT, 'api')) return true;
        return false;
      });
      fs.readJson.mockResolvedValue({ dependencies: {} });

      const profile = detector._createEmptyProfile();
      await detector._detectBackend(profile);
      expect(profile.backend.hasAPI).toBe(true);
    });

    test('detecta rotas API em pages/api/ (Next.js)', async () => {
      fs.pathExists.mockImplementation(async (p) => {
        if (p === path.join(PROJECT_ROOT, 'package.json')) return true;
        if (p === path.join(PROJECT_ROOT, 'pages/api')) return true;
        return false;
      });
      fs.readJson.mockResolvedValue({ dependencies: {} });

      const profile = detector._createEmptyProfile();
      await detector._detectBackend(profile);
      expect(profile.backend.hasAPI).toBe(true);
    });
  });

  // ============================================================
  // _detectTypeScript
  // ============================================================
  describe('_detectTypeScript', () => {
    test('detecta por dependência typescript', async () => {
      fs.pathExists.mockImplementation(async (p) => {
        if (p === path.join(PROJECT_ROOT, 'package.json')) return true;
        return false;
      });
      fs.readJson.mockResolvedValue({ devDependencies: { typescript: '^5' } });

      const profile = detector._createEmptyProfile();
      await detector._detectTypeScript(profile);
      expect(profile.hasTypeScript).toBe(true);
    });

    test('detecta por tsconfig.json', async () => {
      fs.pathExists.mockImplementation(async (p) => {
        if (p === path.join(PROJECT_ROOT, 'tsconfig.json')) return true;
        return false;
      });

      const profile = detector._createEmptyProfile();
      await detector._detectTypeScript(profile);
      expect(profile.hasTypeScript).toBe(true);
    });

    test('não detecta quando não há typescript', async () => {
      const profile = detector._createEmptyProfile();
      await detector._detectTypeScript(profile);
      expect(profile.hasTypeScript).toBe(false);
    });
  });

  // ============================================================
  // _detectTests
  // ============================================================
  describe('_detectTests', () => {
    test('detecta Jest por dependência', async () => {
      fs.pathExists.mockImplementation(async (p) => {
        if (p === path.join(PROJECT_ROOT, 'package.json')) return true;
        return false;
      });
      fs.readJson.mockResolvedValue({ devDependencies: { jest: '^30' } });

      const profile = detector._createEmptyProfile();
      await detector._detectTests(profile);
      expect(profile.hasTests).toBe(true);
    });

    test('detecta Vitest por dependência', async () => {
      fs.pathExists.mockImplementation(async (p) => {
        if (p === path.join(PROJECT_ROOT, 'package.json')) return true;
        return false;
      });
      fs.readJson.mockResolvedValue({ devDependencies: { vitest: '^1' } });

      const profile = detector._createEmptyProfile();
      await detector._detectTests(profile);
      expect(profile.hasTests).toBe(true);
    });

    test('detecta por diretório tests/', async () => {
      fs.pathExists.mockImplementation(async (p) => {
        if (p === path.join(PROJECT_ROOT, 'tests')) return true;
        return false;
      });

      const profile = detector._createEmptyProfile();
      await detector._detectTests(profile);
      expect(profile.hasTests).toBe(true);
    });

    test('detecta por diretório __tests__/', async () => {
      fs.pathExists.mockImplementation(async (p) => {
        if (p === path.join(PROJECT_ROOT, '__tests__')) return true;
        return false;
      });

      const profile = detector._createEmptyProfile();
      await detector._detectTests(profile);
      expect(profile.hasTests).toBe(true);
    });
  });

  // ============================================================
  // _computeApplicablePhases
  // ============================================================
  describe('_computeApplicablePhases', () => {
    test('fase 1 sempre incluída', () => {
      const profile = detector._createEmptyProfile();
      detector._computeApplicablePhases(profile);
      expect(profile.applicablePhases).toContain(1);
    });

    test('fases 4-10 sempre incluídas', () => {
      const profile = detector._createEmptyProfile();
      detector._computeApplicablePhases(profile);
      for (let i = 4; i <= 10; i++) {
        expect(profile.applicablePhases).toContain(i);
      }
    });

    test('fase 2 incluída quando hasDatabase', () => {
      const profile = detector._createEmptyProfile();
      profile.hasDatabase = true;
      detector._computeApplicablePhases(profile);
      expect(profile.applicablePhases).toContain(2);
    });

    test('fase 2 ausente quando sem database', () => {
      const profile = detector._createEmptyProfile();
      detector._computeApplicablePhases(profile);
      expect(profile.applicablePhases).not.toContain(2);
    });

    test('fase 3 incluída quando hasFrontend', () => {
      const profile = detector._createEmptyProfile();
      profile.hasFrontend = true;
      detector._computeApplicablePhases(profile);
      expect(profile.applicablePhases).toContain(3);
    });

    test('fase 3 ausente quando sem frontend', () => {
      const profile = detector._createEmptyProfile();
      detector._computeApplicablePhases(profile);
      expect(profile.applicablePhases).not.toContain(3);
    });

    test('todas as fases quando tem DB e frontend', () => {
      const profile = detector._createEmptyProfile();
      profile.hasDatabase = true;
      profile.hasFrontend = true;
      detector._computeApplicablePhases(profile);
      expect(profile.applicablePhases).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });
  });

  // ============================================================
  // _calculateConfidence
  // ============================================================
  describe('_calculateConfidence', () => {
    test('confiança base é 50', () => {
      const profile = detector._createEmptyProfile();
      detector._calculateConfidence(profile);
      expect(profile.confidence).toBe(50);
    });

    test('adiciona 10 para database, +5 para tipo, +5 para env vars', () => {
      const profile = detector._createEmptyProfile();
      profile.hasDatabase = true;
      profile.database.type = 'postgresql';
      profile.database.envVarsConfigured = true;
      detector._calculateConfidence(profile);
      expect(profile.confidence).toBe(50 + 10 + 5 + 5); // 70
    });

    test('adiciona 10 para frontend, +5 framework, +3 build, +2 styling', () => {
      const profile = detector._createEmptyProfile();
      profile.hasFrontend = true;
      profile.frontend.framework = 'react';
      profile.frontend.buildTool = 'vite';
      profile.frontend.styling = 'tailwind';
      detector._calculateConfidence(profile);
      expect(profile.confidence).toBe(50 + 10 + 5 + 3 + 2); // 70
    });

    test('adiciona 5 para backend, +3 para tipo', () => {
      const profile = detector._createEmptyProfile();
      profile.hasBackend = true;
      profile.backend.type = 'express';
      detector._calculateConfidence(profile);
      expect(profile.confidence).toBe(50 + 5 + 3); // 58
    });

    test('adiciona 3 para TypeScript', () => {
      const profile = detector._createEmptyProfile();
      profile.hasTypeScript = true;
      detector._calculateConfidence(profile);
      expect(profile.confidence).toBe(53);
    });

    test('adiciona 2 para testes', () => {
      const profile = detector._createEmptyProfile();
      profile.hasTests = true;
      detector._calculateConfidence(profile);
      expect(profile.confidence).toBe(52);
    });

    test('limita confiança a 100', () => {
      const profile = detector._createEmptyProfile();
      profile.hasDatabase = true;
      profile.database.type = 'supabase';
      profile.database.envVarsConfigured = true;
      profile.hasFrontend = true;
      profile.frontend.framework = 'react';
      profile.frontend.buildTool = 'vite';
      profile.frontend.styling = 'tailwind';
      profile.hasBackend = true;
      profile.backend.type = 'express';
      profile.hasTypeScript = true;
      profile.hasTests = true;

      detector._calculateConfidence(profile);
      expect(profile.confidence).toBe(100);
    });
  });

  // ============================================================
  // getSummary (static)
  // ============================================================
  describe('getSummary', () => {
    test('retorna "No stack detected" para profile vazio', () => {
      const profile = detector._createEmptyProfile();
      expect(TechStackDetector.getSummary(profile)).toBe('No stack detected');
    });

    test('mostra frontend com framework e styling', () => {
      const profile = detector._createEmptyProfile();
      profile.hasFrontend = true;
      profile.frontend.framework = 'react';
      profile.frontend.styling = 'tailwind';

      const summary = TechStackDetector.getSummary(profile);
      expect(summary).toContain('Frontend: react + tailwind');
    });

    test('mostra database com tipo e RLS', () => {
      const profile = detector._createEmptyProfile();
      profile.hasDatabase = true;
      profile.database.type = 'supabase';
      profile.database.hasRLS = true;

      const summary = TechStackDetector.getSummary(profile);
      expect(summary).toContain('Database: supabase (RLS)');
    });

    test('mostra backend com tipo', () => {
      const profile = detector._createEmptyProfile();
      profile.hasBackend = true;
      profile.backend.type = 'express';

      const summary = TechStackDetector.getSummary(profile);
      expect(summary).toContain('Backend: express');
    });

    test('mostra TypeScript', () => {
      const profile = detector._createEmptyProfile();
      profile.hasTypeScript = true;

      expect(TechStackDetector.getSummary(profile)).toContain('TypeScript');
    });

    test('usa "unknown" quando tipo é null', () => {
      const profile = detector._createEmptyProfile();
      profile.hasFrontend = true;

      expect(TechStackDetector.getSummary(profile)).toContain('Frontend: unknown');
    });

    test('combina múltiplas partes com pipe', () => {
      const profile = detector._createEmptyProfile();
      profile.hasFrontend = true;
      profile.frontend.framework = 'react';
      profile.hasDatabase = true;
      profile.database.type = 'postgresql';
      profile.hasTypeScript = true;

      const summary = TechStackDetector.getSummary(profile);
      expect(summary).toBe('Frontend: react | Database: postgresql | TypeScript');
    });
  });

  // ============================================================
  // detect (integração)
  // ============================================================
  describe('detect', () => {
    test('retorna profile completo para projeto vazio', async () => {
      const profile = await detector.detect();

      expect(profile.hasDatabase).toBe(false);
      expect(profile.hasFrontend).toBe(false);
      expect(profile.hasBackend).toBe(false);
      expect(profile.hasTypeScript).toBe(false);
      expect(profile.hasTests).toBe(false);
      expect(profile.confidence).toBe(50);
      expect(profile.detectedAt).toBeDefined();
      expect(profile.applicablePhases).toContain(1);
      expect(profile.applicablePhases).not.toContain(2);
      expect(profile.applicablePhases).not.toContain(3);
    });

    test('retorna profile completo para full-stack', async () => {
      fs.pathExists.mockImplementation(async (p) => {
        if (p === path.join(PROJECT_ROOT, 'package.json')) return true;
        if (p === path.join(PROJECT_ROOT, 'tsconfig.json')) return true;
        if (p === path.join(PROJECT_ROOT, 'tests')) return true;
        return false;
      });
      fs.readJson.mockResolvedValue({
        dependencies: {
          react: '^18',
          express: '^4',
          pg: '^8',
          vite: '^5',
          tailwindcss: '^3',
        },
        devDependencies: { typescript: '^5', jest: '^30' },
      });

      const profile = await detector.detect();

      expect(profile.hasDatabase).toBe(true);
      expect(profile.database.type).toBe('postgresql');
      expect(profile.hasFrontend).toBe(true);
      expect(profile.frontend.framework).toBe('react');
      expect(profile.frontend.buildTool).toBe('vite');
      expect(profile.frontend.styling).toBe('tailwind');
      expect(profile.hasBackend).toBe(true);
      expect(profile.backend.type).toBe('express');
      expect(profile.hasTypeScript).toBe(true);
      expect(profile.hasTests).toBe(true);
      expect(profile.applicablePhases).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      expect(profile.confidence).toBeGreaterThan(85);
      expect(profile.detectedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    test('detectedAt é ISO timestamp válido', async () => {
      const profile = await detector.detect();
      expect(Number.isNaN(Date.parse(profile.detectedAt))).toBe(false);
    });
  });
});
