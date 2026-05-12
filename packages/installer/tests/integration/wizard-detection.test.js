const fs = require('fs');
const path = require('path');
const { runWizard, getProjectType, confirmProjectType } = require('../../src/wizard/wizard');
const { detectProjectType } = require('../../src/detection/detect-project-type');

// Mock fs module
jest.mock('fs');

// Mock console methods to avoid test output pollution
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
};

describe('Wizard Integration with Project Type Detection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Task 1.3.5.2: Test full wizard flow with GREENFIELD detection
  // ============================================================================
  describe('GREENFIELD Detection Flow', () => {
    test('wizard correctly detects and processes GREENFIELD project', async () => {
      // Setup: Empty directory (directory exists but no markers)
      const targetPath = path.resolve('/test-greenfield');
      fs.existsSync.mockImplementation((checkPath) => {
        if (checkPath === targetPath) return true; // Directory exists
        // No markers exist
        if (checkPath.includes('.aiox-core')) return false;
        if (checkPath.includes('package.json')) return false;
        if (checkPath.includes('.git')) return false;
        return false;
      });
      fs.readdirSync.mockReturnValue([]);

      const result = await runWizard({ targetDir: '/test-greenfield' });

      expect(result.projectType).toBe('GREENFIELD');
      expect(result.targetDir).toBe('/test-greenfield');
      // Output uses lowercase format for display
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('greenfield'));
    });

    test('getProjectType helper returns GREENFIELD for empty directory', () => {
      const targetPath = path.resolve('/test/empty');
      fs.existsSync.mockImplementation((checkPath) => {
        if (checkPath === targetPath) return true;
        if (checkPath.includes('.aiox-core')) return false;
        if (checkPath.includes('package.json')) return false;
        if (checkPath.includes('.git')) return false;
        return false;
      });
      fs.readdirSync.mockReturnValue([]);

      const type = getProjectType('/test/empty');

      expect(type).toBe('GREENFIELD');
    });
  });

  // ============================================================================
  // Task 1.3.5.3: Test full wizard flow with BROWNFIELD detection
  // ============================================================================
  describe('BROWNFIELD Detection Flow', () => {
    test('wizard correctly detects and processes BROWNFIELD project with package.json', async () => {
      // Setup: Directory with package.json
      const targetPath = path.resolve('/test-brownfield');
      fs.existsSync.mockImplementation((checkPath) => {
        if (checkPath === targetPath) return true;
        if (checkPath.includes('.aiox-core')) return false; // No AIOX
        if (checkPath.includes('package.json')) return true; // Has package.json
        if (checkPath.includes('.git')) return false;
        return false;
      });
      fs.readdirSync.mockReturnValue(['package.json', 'src', 'README.md']);

      const result = await runWizard({ targetDir: '/test-brownfield' });

      expect(result.projectType).toBe('BROWNFIELD');
      expect(result.targetDir).toBe('/test-brownfield');
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('brownfield'));
    });

    test('wizard correctly detects and processes BROWNFIELD project with .git', async () => {
      // Setup: Directory with .git
      const targetPath = path.resolve('/test-git');
      fs.existsSync.mockImplementation((checkPath) => {
        if (checkPath === targetPath) return true;
        if (checkPath.includes('.aiox-core')) return false; // No AIOX
        if (checkPath.includes('package.json')) return false;
        if (checkPath.includes('.git')) return true; // Has .git
        return false;
      });
      fs.readdirSync.mockReturnValue(['.git', 'README.md']);

      const result = await runWizard({ targetDir: '/test-git' });

      expect(result.projectType).toBe('BROWNFIELD');
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('brownfield'));
    });

    test('getProjectType helper returns BROWNFIELD for existing project', () => {
      const targetPath = path.resolve('/test/brownfield');
      fs.existsSync.mockImplementation((checkPath) => {
        if (checkPath === targetPath) return true;
        if (checkPath.includes('.aiox-core')) return false;
        if (checkPath.includes('package.json')) return true;
        if (checkPath.includes('.git')) return false;
        return false;
      });
      fs.readdirSync.mockReturnValue(['package.json', 'src']);

      const type = getProjectType('/test/brownfield');

      expect(type).toBe('BROWNFIELD');
    });
  });

  // ============================================================================
  // Task 1.3.5.4: Test full wizard flow with EXISTING_AIOX detection
  // ============================================================================
  describe('EXISTING_AIOX Detection Flow', () => {
    test('wizard correctly detects and processes EXISTING_AIOX installation', async () => {
      // Setup: Directory with .aiox-core
      fs.existsSync.mockImplementation((checkPath) => {
        if (checkPath.includes('test-existing')) return true;
        if (checkPath.endsWith('.aiox-core')) return true;
        return true; // Other files exist
      });
      fs.readdirSync.mockReturnValue(['.aiox-core', 'package.json', '.git']);

      const result = await runWizard({ targetDir: '/test-existing' });

      expect(result.projectType).toBe('EXISTING_AIOX');
      expect(result.targetDir).toBe('/test-existing');
      // Output shows "brownfield" since EXISTING_AIOX is treated as brownfield update
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('brownfield'));
    });

    test('confirmProjectType shows update/reinstall message for EXISTING_AIOX', async () => {
      const confirmed = await confirmProjectType('EXISTING_AIOX');

      expect(confirmed).toBe('EXISTING_AIOX');
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('update or reinstall'),
      );
    });

    test('getProjectType helper returns EXISTING_AIOX when .aiox-core exists', () => {
      fs.existsSync.mockImplementation((checkPath) => {
        if (checkPath.includes('existing')) return true;
        if (checkPath.endsWith('.aiox-core')) return true;
        return false;
      });
      fs.readdirSync.mockReturnValue(['.aiox-core']);

      const type = getProjectType('/test/existing');

      expect(type).toBe('EXISTING_AIOX');
    });
  });

  // ============================================================================
  // Task 1.3.5.5: Test user override of detection result
  // ============================================================================
  describe('User Override Functionality', () => {
    test('confirmProjectType accepts detected type', async () => {
      const confirmed = await confirmProjectType('GREENFIELD');

      expect(confirmed).toBe('GREENFIELD');
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('GREENFIELD'));
    });

    test('confirmProjectType shows appropriate message for each type', async () => {
      const types = ['GREENFIELD', 'BROWNFIELD', 'EXISTING_AIOX', 'UNKNOWN'];

      for (const type of types) {
        jest.clearAllMocks();
        const confirmed = await confirmProjectType(type);

        expect(confirmed).toBe(type);
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining(type));
      }
    });

    test('confirmProjectType provides description for GREENFIELD', async () => {
      await confirmProjectType('GREENFIELD');

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('New project'),
      );
    });

    test('confirmProjectType provides description for BROWNFIELD', async () => {
      await confirmProjectType('BROWNFIELD');

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Existing project'),
      );
    });
  });

  // ============================================================================
  // Task 1.3.5.6: Test error handling and fallback to manual selection
  // ============================================================================
  describe('Error Handling in Wizard Flow', () => {
    test('wizard propagates detection errors correctly', async () => {
      // Setup: Invalid directory
      fs.existsSync.mockImplementation((checkPath) => {
        if (checkPath.includes('invalid')) return false;
        return false;
      });

      await expect(runWizard({ targetDir: '/invalid' })).rejects.toThrow(
        'Directory does not exist',
      );
    });

    test('wizard logs error message on detection failure', async () => {
      // Setup: Permission error
      fs.existsSync.mockImplementation(() => {
        throw new Error('EACCES: permission denied');
      });

      await expect(runWizard({ targetDir: '/denied' })).rejects.toThrow();
      // Check that console.error was called with the error message
      const errorCalls = console.error.mock.calls;
      const hasInstallationFailed = errorCalls.some(call => 
        call.some(arg => String(arg).includes('Installation failed')),
      );
      expect(hasInstallationFailed).toBe(true);
    });

    test('confirmProjectType handles UNKNOWN type gracefully', async () => {
      const confirmed = await confirmProjectType('UNKNOWN');

      expect(confirmed).toBe('UNKNOWN');
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Manual selection required'),
      );
    });
  });

  // ============================================================================
  // Task 1.3.5.7: Verify detection result flows correctly to Story 1.4
  // ============================================================================
  describe('Integration with Downstream Stories', () => {
    test('wizard returns configuration object with projectType for downstream use', async () => {
      const targetPath = path.resolve('/test/downstream');
      fs.existsSync.mockImplementation((checkPath) => {
        if (checkPath === targetPath) return true;
        if (checkPath.includes('.aiox-core')) return false;
        if (checkPath.includes('package.json')) return false;
        if (checkPath.includes('.git')) return false;
        return false;
      });
      fs.readdirSync.mockReturnValue([]);

      const config = await runWizard({ targetDir: '/test/downstream' });

      // Verify config has required fields for downstream stories
      expect(config).toHaveProperty('projectType');
      expect(config).toHaveProperty('targetDir');
      expect(config.projectType).toBe('GREENFIELD');
      expect(config.targetDir).toBe('/test/downstream');
    });

    test('getProjectType can be called independently by downstream stories', () => {
      const targetPath = path.resolve('/test/standalone');
      fs.existsSync.mockImplementation((checkPath) => {
        if (checkPath === targetPath) return true;
        if (checkPath.includes('.aiox-core')) return false;
        if (checkPath.includes('package.json')) return false;
        if (checkPath.includes('.git')) return false;
        return false;
      });
      fs.readdirSync.mockReturnValue([]);

      // Story 1.4 (IDE Selection) can call this directly
      const type = getProjectType('/test/standalone');

      expect(type).toBe('GREENFIELD');
      expect(typeof type).toBe('string');
    });

    test('detection result remains consistent across multiple calls', () => {
      const targetPath = path.resolve('/test/consistent');
      fs.existsSync.mockImplementation((checkPath) => {
        if (checkPath === targetPath) return true;
        if (checkPath.includes('.aiox-core')) return false;
        if (checkPath.includes('package.json')) return true;
        if (checkPath.includes('.git')) return false;
        return false;
      });
      fs.readdirSync.mockReturnValue(['package.json']);

      const type1 = getProjectType('/test/consistent');
      const type2 = getProjectType('/test/consistent');
      const type3 = detectProjectType('/test/consistent');

      expect(type1).toBe(type2);
      expect(type2).toBe(type3);
      expect(type1).toBe('BROWNFIELD');
    });
  });

  // ============================================================================
  // Default Behavior Tests
  // ============================================================================
  describe('Default Wizard Behavior', () => {
    test('wizard uses process.cwd() when no targetDir provided', async () => {
      const mockCwd = process.cwd();
      
      fs.existsSync.mockImplementation((checkPath) => {
        if (checkPath === path.resolve(mockCwd)) return true;
        return false;
      });
      fs.readdirSync.mockReturnValue([]);

      const result = await runWizard();

      expect(result.targetDir).toBe(mockCwd);
      expect(result.projectType).toBe('GREENFIELD');
    });

    test('wizard displays welcome message', async () => {
      fs.existsSync.mockImplementation(() => true);
      fs.readdirSync.mockReturnValue([]);

      await runWizard({ targetDir: '/test' });

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Welcome to AIOX Installer'),
      );
    });

    test('wizard displays detection step message', async () => {
      fs.existsSync.mockImplementation(() => true);
      fs.readdirSync.mockReturnValue([]);

      await runWizard({ targetDir: '/test' });

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Analyzing project directory'),
      );
    });
  });
});

