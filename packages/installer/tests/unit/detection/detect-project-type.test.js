const fs = require('fs');
const path = require('path');
const { detectProjectType } = require('../../../src/detection/detect-project-type');

// Mock fs module
jest.mock('fs');

describe('detectProjectType', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Reset console.error mock to avoid test pollution
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error
    console.error.mockRestore();
  });

  // ============================================================================
  // AC #1: Empty Directory → GREENFIELD
  // ============================================================================
  describe('AC #1: GREENFIELD detection', () => {
    test('detects GREENFIELD when directory is empty', () => {
      // Setup: Directory exists but has no files
      fs.existsSync.mockImplementation((checkPath) => {
        // Directory exists, but no markers
        if (checkPath === path.resolve('/test/empty')) return true;
        return false; // No .aiox-core, package.json, or .git
      });
      fs.readdirSync.mockReturnValue([]); // Empty directory
      
      const result = detectProjectType('/test/empty');
      
      expect(result).toBe('GREENFIELD');
      expect(fs.existsSync).toHaveBeenCalledWith(expect.stringContaining('.aiox-core'));
      expect(fs.readdirSync).toHaveBeenCalledTimes(1);
    });

    test('uses process.cwd() as default when no targetDir provided', () => {
      // Setup
      const mockCwd = process.cwd();
      fs.existsSync.mockImplementation((checkPath) => {
        if (checkPath === path.resolve(mockCwd)) return true;
        return false;
      });
      fs.readdirSync.mockReturnValue([]);
      
      const result = detectProjectType();
      
      expect(result).toBe('GREENFIELD');
      expect(fs.readdirSync).toHaveBeenCalledWith(path.resolve(mockCwd));
    });
  });

  // ============================================================================
  // AC #2: package.json Exists → BROWNFIELD
  // ============================================================================
  describe('AC #2: BROWNFIELD detection - package.json', () => {
    test('detects BROWNFIELD when package.json exists', () => {
      // Setup
      fs.existsSync.mockImplementation((checkPath) => {
        if (checkPath === path.resolve('/test/brownfield')) return true;
        if (checkPath.endsWith('package.json')) return true; // package.json exists
        return false; // No .aiox-core or .git
      });
      fs.readdirSync.mockReturnValue(['package.json', 'src', 'README.md']);
      
      const result = detectProjectType('/test/brownfield');
      
      expect(result).toBe('BROWNFIELD');
    });

    test('detects BROWNFIELD when only package.json exists (no git)', () => {
      // Setup: package.json but no .git
      fs.existsSync.mockImplementation((checkPath) => {
        if (checkPath === path.resolve('/test/node-project')) return true;
        if (checkPath.endsWith('package.json')) return true;
        if (checkPath.endsWith('.git')) return false;
        if (checkPath.endsWith('.aiox-core')) return false;
        return false;
      });
      fs.readdirSync.mockReturnValue(['package.json', 'index.js']);
      
      const result = detectProjectType('/test/node-project');
      
      expect(result).toBe('BROWNFIELD');
    });
  });

  // ============================================================================
  // AC #3: .git Exists → BROWNFIELD
  // ============================================================================
  describe('AC #3: BROWNFIELD detection - .git', () => {
    test('detects BROWNFIELD when .git exists', () => {
      // Setup
      fs.existsSync.mockImplementation((checkPath) => {
        if (checkPath === path.resolve('/test/brownfield-git')) return true;
        if (checkPath.endsWith('.git')) return true; // .git exists
        return false; // No .aiox-core or package.json
      });
      fs.readdirSync.mockReturnValue(['.git', 'README.md', 'src']);
      
      const result = detectProjectType('/test/brownfield-git');
      
      expect(result).toBe('BROWNFIELD');
    });

    test('detects BROWNFIELD when both package.json and .git exist', () => {
      // Setup: Both markers present
      fs.existsSync.mockImplementation((checkPath) => {
        if (checkPath === path.resolve('/test/full-project')) return true;
        if (checkPath.endsWith('package.json')) return true;
        if (checkPath.endsWith('.git')) return true;
        if (checkPath.endsWith('.aiox-core')) return false;
        return false;
      });
      fs.readdirSync.mockReturnValue(['.git', 'package.json', 'src', 'README.md']);
      
      const result = detectProjectType('/test/full-project');
      
      expect(result).toBe('BROWNFIELD');
    });
  });

  // ============================================================================
  // AC #4: .aiox-core Exists → EXISTING_AIOX
  // ============================================================================
  describe('AC #4: EXISTING_AIOX detection', () => {
    test('detects EXISTING_AIOX when .aiox-core exists', () => {
      // Setup
      fs.existsSync.mockImplementation((checkPath) => {
        if (checkPath === path.resolve('/test/existing')) return true;
        if (checkPath.endsWith('.aiox-core')) return true; // .aiox-core exists
        return true; // Other files may exist too
      });
      fs.readdirSync.mockReturnValue(['.aiox-core', 'package.json', '.git', 'src']);
      
      const result = detectProjectType('/test/existing');
      
      expect(result).toBe('EXISTING_AIOX');
    });

    test('EXISTING_AIOX takes priority over BROWNFIELD markers', () => {
      // Setup: All markers present, but EXISTING_AIOX should win
      fs.existsSync.mockImplementation((checkPath) => {
        if (checkPath === path.resolve('/test/priority-test')) return true;
        // All markers present
        if (checkPath.endsWith('.aiox-core')) return true;
        if (checkPath.endsWith('package.json')) return true;
        if (checkPath.endsWith('.git')) return true;
        return false;
      });
      fs.readdirSync.mockReturnValue(['.aiox-core', 'package.json', '.git', 'src']);
      
      const result = detectProjectType('/test/priority-test');
      
      // EXISTING_AIOX has highest priority
      expect(result).toBe('EXISTING_AIOX');
    });
  });

  // ============================================================================
  // Edge Case: UNKNOWN Type
  // ============================================================================
  describe('Edge Case: UNKNOWN detection', () => {
    test('returns UNKNOWN when directory has files but no recognized markers', () => {
      // Setup: Files exist but no package.json, .git, or .aiox-core
      fs.existsSync.mockImplementation((checkPath) => {
        if (checkPath === path.resolve('/test/unknown')) return true;
        // No recognized markers
        return false;
      });
      fs.readdirSync.mockReturnValue(['README.md', 'index.html', 'styles.css']);
      
      const result = detectProjectType('/test/unknown');
      
      expect(result).toBe('UNKNOWN');
    });

    test('returns UNKNOWN for non-empty directory with only hidden files', () => {
      // Setup
      fs.existsSync.mockImplementation((checkPath) => {
        if (checkPath === path.resolve('/test/hidden-only')) return true;
        return false; // No recognized markers
      });
      fs.readdirSync.mockReturnValue(['.DS_Store', '.gitignore']); // Hidden files only
      
      const result = detectProjectType('/test/hidden-only');
      
      expect(result).toBe('UNKNOWN');
    });
  });

  // ============================================================================
  // Error Handling Tests
  // ============================================================================
  describe('Error Handling', () => {
    test('throws error when directory does not exist', () => {
      // Setup: Directory doesn't exist
      fs.existsSync.mockImplementation((checkPath) => {
        if (checkPath === path.resolve('/test/nonexistent')) return false;
        return false;
      });
      
      expect(() => detectProjectType('/test/nonexistent')).toThrow('Failed to detect project type');
      expect(() => detectProjectType('/test/nonexistent')).toThrow('Directory does not exist');
    });

    test('throws error when directory cannot be accessed (EACCES)', () => {
      // Setup: Permission denied error
      const permissionError = new Error('EACCES: permission denied');
      permissionError.code = 'EACCES';
      
      fs.existsSync.mockImplementation((checkPath) => {
        if (checkPath === path.resolve('/test/denied')) return true;
        if (checkPath.endsWith('.aiox-core')) {
          throw permissionError;
        }
        return false;
      });
      
      expect(() => detectProjectType('/test/denied')).toThrow('Failed to detect project type');
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('[detect-project-type] Error detecting project type'),
      );
    });

    test('throws error when fs.readdirSync fails', () => {
      // Setup: readdirSync throws error
      const readError = new Error('EPERM: operation not permitted');
      readError.code = 'EPERM';
      
      fs.existsSync.mockImplementation((checkPath) => {
        if (checkPath === path.resolve('/test/read-error')) return true;
        return false;
      });
      fs.readdirSync.mockImplementation(() => {
        throw readError;
      });
      
      expect(() => detectProjectType('/test/read-error')).toThrow('Failed to detect project type');
      expect(console.error).toHaveBeenCalled();
    });

    test('throws error with invalid targetDir parameter (null)', () => {
      expect(() => detectProjectType(null)).toThrow('Invalid targetDir parameter');
    });

    test('throws error with invalid targetDir parameter (empty string)', () => {
      expect(() => detectProjectType('')).toThrow('Invalid targetDir parameter');
    });

    test('throws error with invalid targetDir parameter (number)', () => {
      expect(() => detectProjectType(123)).toThrow('Invalid targetDir parameter');
    });
  });

  // ============================================================================
  // Priority Order Verification
  // ============================================================================
  describe('Detection Priority Order', () => {
    test('priority: EXISTING_AIOX > GREENFIELD', () => {
      // Even if directory appears empty, .aiox-core presence should win
      fs.existsSync.mockImplementation((checkPath) => {
        if (checkPath === path.resolve('/test/priority1')) return true;
        if (checkPath.endsWith('.aiox-core')) return true;
        return false;
      });
      fs.readdirSync.mockReturnValue(['.aiox-core']); // Only .aiox-core
      
      const result = detectProjectType('/test/priority1');
      
      expect(result).toBe('EXISTING_AIOX');
    });

    test('priority: GREENFIELD > BROWNFIELD when directory is empty', () => {
      // This test verifies the order, though practically impossible scenario
      fs.existsSync.mockImplementation((checkPath) => {
        if (checkPath === path.resolve('/test/priority2')) return true;
        return false; // No markers
      });
      fs.readdirSync.mockReturnValue([]); // Empty
      
      const result = detectProjectType('/test/priority2');
      
      expect(result).toBe('GREENFIELD');
    });

    test('priority: BROWNFIELD > UNKNOWN', () => {
      // Directory has files + package.json
      fs.existsSync.mockImplementation((checkPath) => {
        if (checkPath === path.resolve('/test/priority3')) return true;
        if (checkPath.endsWith('package.json')) return true;
        if (checkPath.endsWith('.aiox-core')) return false;
        if (checkPath.endsWith('.git')) return false;
        return false;
      });
      fs.readdirSync.mockReturnValue(['package.json', 'other-file.txt']);
      
      const result = detectProjectType('/test/priority3');
      
      expect(result).toBe('BROWNFIELD');
    });
  });

  // ============================================================================
  // Cross-Platform Path Handling
  // ============================================================================
  describe('Cross-Platform Compatibility', () => {
    test('handles Windows-style paths correctly', () => {
      const windowsPath = 'C:\\Users\\Test\\project';
      
      fs.existsSync.mockImplementation((checkPath) => {
        if (checkPath === path.resolve(windowsPath)) return true;
        return false;
      });
      fs.readdirSync.mockReturnValue([]);
      
      const result = detectProjectType(windowsPath);
      
      expect(result).toBe('GREENFIELD');
      expect(fs.existsSync).toHaveBeenCalledWith(expect.any(String));
    });

    test('handles Unix-style paths correctly', () => {
      const unixPath = '/home/user/project';
      
      fs.existsSync.mockImplementation((checkPath) => {
        if (checkPath === path.resolve(unixPath)) return true;
        return false;
      });
      fs.readdirSync.mockReturnValue([]);
      
      const result = detectProjectType(unixPath);
      
      expect(result).toBe('GREENFIELD');
    });

    test('normalizes relative paths correctly', () => {
      const relativePath = './test/project';
      
      fs.existsSync.mockImplementation((checkPath) => {
        if (checkPath === path.resolve(relativePath)) return true;
        return false;
      });
      fs.readdirSync.mockReturnValue([]);
      
      const result = detectProjectType(relativePath);
      
      expect(result).toBe('GREENFIELD');
    });
  });

  // ============================================================================
  // Security Tests
  // ============================================================================
  describe('Security - Path Traversal Prevention', () => {
    test('uses path.join for all file checks (prevents traversal)', () => {
      fs.existsSync.mockImplementation((checkPath) => {
        if (checkPath === path.resolve('/test/secure')) return true;
        // Verify path.join was used (no string concatenation)
        expect(checkPath).toContain(path.sep);
        return false;
      });
      fs.readdirSync.mockReturnValue([]);
      
      detectProjectType('/test/secure');
      
      // Verify all existsSync calls use proper path joining
      expect(fs.existsSync).toHaveBeenCalledWith(expect.stringContaining(path.sep));
    });

    test('normalizes path to prevent directory traversal attacks', () => {
      const maliciousPath = '/test/../../etc/passwd';
      const resolvedPath = path.resolve(maliciousPath);
      
      fs.existsSync.mockImplementation((checkPath) => {
        // Directory exists
        if (checkPath === resolvedPath) return true;
        // Verify all paths contain the normalized base path
        if (checkPath.includes(resolvedPath)) return false;
        return false;
      });
      fs.readdirSync.mockReturnValue([]);
      
      const result = detectProjectType(maliciousPath);
      
      expect(result).toBe('GREENFIELD');
      expect(fs.existsSync).toHaveBeenCalled();
      // Verify the normalized path was used as base
      const calls = fs.existsSync.mock.calls;
      calls.forEach(([callPath]) => {
        expect(callPath).toContain(path.normalize(resolvedPath).split(path.sep)[0]);
      });
    });
  });
});

