/**
 * Integration Tests: Wizard Validation Flow
 * Story 1.8 - Complete wizard flow including validation
 */

const { validateInstallation } = require('../../packages/installer/src/wizard/validation');

describe('Wizard Validation Flow', () => {
  it('should validate complete installation successfully', async () => {
    // Given - mock installation context
    const installationContext = {
      files: {
        ideConfigs: [],
        env: '.env',
        coreConfig: '.aiox-core/core-config.yaml',
        mcpConfig: '.mcp.json',
      },
      configs: {
        env: { envCreated: true, coreConfigCreated: true },
        mcps: {},
        coreConfig: '.aiox-core/core-config.yaml',
      },
      dependencies: {
        success: true,
        packageManager: 'npm',
        offlineMode: false,
      },
    };

    // When
    const validation = await validateInstallation(installationContext);

    // Then
    expect(validation).toHaveProperty('overallStatus');
    expect(validation).toHaveProperty('components');
    expect(validation).toHaveProperty('errors');
    expect(validation).toHaveProperty('warnings');
  });

  it('should handle validation with MCP health checks', async () => {
    // Given
    const installationContext = {
      files: { env: '.env' },
      configs: {},
      mcps: {
        installedMCPs: {
          browser: { status: 'success', message: 'Installed' },
          context7: { status: 'success', message: 'Installed' },
        },
        configPath: '.mcp.json',
      },
      dependencies: { success: true, packageManager: 'npm' },
    };

    // When
    const validation = await validateInstallation(installationContext);

    // Then
    expect(validation.components).toHaveProperty('mcps');
  });

  it('should call progress callback during validation', async () => {
    // Given
    const installationContext = {
      files: { env: '.env' },
      configs: {},
      dependencies: { success: true },
    };

    const progressCalls = [];
    const onProgress = (status) => progressCalls.push(status);

    // When
    await validateInstallation(installationContext, onProgress);

    // Then
    expect(progressCalls.length).toBeGreaterThan(0);
    expect(progressCalls[progressCalls.length - 1].step).toBe('complete');
  });
});
