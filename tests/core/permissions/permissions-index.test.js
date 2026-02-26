/**
 * Unit tests for permissions index facade module.
 *
 * Validates that the facade correctly delegates to
 * PermissionMode and OperationGuard, and that the
 * convenience functions produce the expected results.
 *
 * @see .aios-core/core/permissions/index.js
 */

// ---------------------------------------------------------------------------
// Mocks — must be declared before require()
// ---------------------------------------------------------------------------

const mockLoad = jest.fn().mockResolvedValue(undefined);
const mockGetBadge = jest.fn(() => '[Ask]');
const mockSetMode = jest.fn().mockResolvedValue({ name: 'auto' });
const mockCycleMode = jest.fn().mockResolvedValue({ name: 'auto' });
const mockGuardFn = jest.fn().mockResolvedValue({ proceed: true, operation: 'read' });

jest.mock('../../../.aios-core/core/permissions/permission-mode', () => ({
  PermissionMode: jest.fn().mockImplementation(() => ({
    load: mockLoad,
    getBadge: mockGetBadge,
    setMode: mockSetMode,
    cycleMode: mockCycleMode,
  })),
}));

jest.mock('../../../.aios-core/core/permissions/operation-guard', () => ({
  OperationGuard: jest.fn().mockImplementation(() => ({
    guard: mockGuardFn,
  })),
}));

// ---------------------------------------------------------------------------
// Subject under test
// ---------------------------------------------------------------------------

const {
  PermissionMode,
  OperationGuard,
  createGuard,
  checkOperation,
  getModeBadge,
  setMode,
  cycleMode,
  enforcePermission,
} = require('../../../.aios-core/core/permissions/index');

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('permissions/index facade', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Re-exports ──────────────────────────────────────────────────────────

  describe('re-exports', () => {
    it('should re-export PermissionMode constructor', () => {
      expect(PermissionMode).toBeDefined();
      expect(typeof PermissionMode).toBe('function');
    });

    it('should re-export OperationGuard constructor', () => {
      expect(OperationGuard).toBeDefined();
      expect(typeof OperationGuard).toBe('function');
    });
  });

  // ── createGuard ─────────────────────────────────────────────────────────

  describe('createGuard()', () => {
    it('should create a PermissionMode, load it, and return mode + guard', async () => {
      const result = await createGuard('/project');

      expect(PermissionMode).toHaveBeenCalledWith('/project');
      expect(mockLoad).toHaveBeenCalled();
      expect(OperationGuard).toHaveBeenCalled();
      expect(result).toHaveProperty('mode');
      expect(result).toHaveProperty('guard');
    });

    it('should default projectRoot to process.cwd()', async () => {
      await createGuard();

      expect(PermissionMode).toHaveBeenCalledWith(process.cwd());
    });
  });

  // ── checkOperation ──────────────────────────────────────────────────────

  describe('checkOperation()', () => {
    it('should create guard and delegate to guard.guard()', async () => {
      const result = await checkOperation('Bash', { command: 'ls' }, '/project');

      expect(PermissionMode).toHaveBeenCalledWith('/project');
      expect(mockLoad).toHaveBeenCalled();
      expect(mockGuardFn).toHaveBeenCalledWith('Bash', { command: 'ls' });
      expect(result).toEqual({ proceed: true, operation: 'read' });
    });

    it('should default projectRoot to process.cwd()', async () => {
      await checkOperation('Read', { path: '/file' });

      expect(PermissionMode).toHaveBeenCalledWith(process.cwd());
    });
  });

  // ── getModeBadge ────────────────────────────────────────────────────────

  describe('getModeBadge()', () => {
    it('should create PermissionMode, load, and return badge', async () => {
      const badge = await getModeBadge('/project');

      expect(PermissionMode).toHaveBeenCalledWith('/project');
      expect(mockLoad).toHaveBeenCalled();
      expect(mockGetBadge).toHaveBeenCalled();
      expect(badge).toBe('[Ask]');
    });

    it('should default projectRoot to process.cwd()', async () => {
      await getModeBadge();

      expect(PermissionMode).toHaveBeenCalledWith(process.cwd());
    });
  });

  // ── setMode ─────────────────────────────────────────────────────────────

  describe('setMode()', () => {
    it('should create PermissionMode and call setMode with mode name', async () => {
      const result = await setMode('auto', '/project');

      expect(PermissionMode).toHaveBeenCalledWith('/project');
      expect(mockSetMode).toHaveBeenCalledWith('auto');
      expect(result).toEqual({ name: 'auto' });
    });

    it('should NOT call load() before setMode', async () => {
      await setMode('explore', '/project');

      expect(mockLoad).not.toHaveBeenCalled();
    });

    it('should default projectRoot to process.cwd()', async () => {
      await setMode('ask');

      expect(PermissionMode).toHaveBeenCalledWith(process.cwd());
    });
  });

  // ── cycleMode ───────────────────────────────────────────────────────────

  describe('cycleMode()', () => {
    it('should create PermissionMode, cycle, and return info with badge and message', async () => {
      const result = await cycleMode('/project');

      expect(PermissionMode).toHaveBeenCalledWith('/project');
      expect(mockCycleMode).toHaveBeenCalled();
      expect(mockGetBadge).toHaveBeenCalled();
      expect(result).toMatchObject({
        name: 'auto',
        badge: '[Ask]',
      });
      expect(result.message).toContain('auto');
      expect(result.message).toContain('[Ask]');
    });

    it('should default projectRoot to process.cwd()', async () => {
      await cycleMode();

      expect(PermissionMode).toHaveBeenCalledWith(process.cwd());
    });
  });

  // ── enforcePermission ──────────────────────────────────────────────────

  describe('enforcePermission()', () => {
    it('should return { action: "allow" } when guard says proceed', async () => {
      mockGuardFn.mockResolvedValueOnce({ proceed: true, operation: 'read' });

      const result = await enforcePermission('Read', { path: '/a' }, '/project');

      expect(result).toEqual({ action: 'allow', operation: 'read' });
    });

    it('should return { action: "prompt" } when guard says needsConfirmation', async () => {
      mockGuardFn.mockResolvedValueOnce({
        proceed: false,
        needsConfirmation: true,
        operation: 'write',
        tool: 'Write',
        params: { path: '/b' },
        message: 'Confirm write?',
      });

      const result = await enforcePermission('Write', { path: '/b' }, '/project');

      expect(result).toEqual({
        action: 'prompt',
        operation: 'write',
        tool: 'Write',
        params: { path: '/b' },
        message: 'Confirm write?',
      });
    });

    it('should return { action: "deny" } when guard blocks', async () => {
      mockGuardFn.mockResolvedValueOnce({
        proceed: false,
        needsConfirmation: false,
        operation: 'delete',
        message: 'Blocked in explore mode',
      });

      const result = await enforcePermission('Bash', { command: 'rm -rf /' }, '/project');

      expect(result).toEqual({
        action: 'deny',
        operation: 'delete',
        message: 'Blocked in explore mode',
      });
    });

    it('should default params to {} and projectRoot to process.cwd()', async () => {
      mockGuardFn.mockResolvedValueOnce({ proceed: true, operation: 'read' });

      const result = await enforcePermission('Read');

      expect(PermissionMode).toHaveBeenCalledWith(process.cwd());
      expect(mockGuardFn).toHaveBeenCalledWith('Read', {});
      expect(result.action).toBe('allow');
    });
  });
});
