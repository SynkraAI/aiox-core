'use strict';

const path = require('path');

const repoRoot = path.resolve(__dirname, '../..');
const requireFromRoot = (modulePath) => require(path.join(repoRoot, modulePath));

describe('config cache cleanup timers', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetModules();
  });

  it.each([
    '.aiox-core/core/config/config-cache',
    '.aiox-core/infrastructure/scripts/config-cache',
  ])('unrefs the cleanup interval in %s', (modulePath) => {
    const cleanupTimer = { unref: jest.fn() };
    const setIntervalSpy = jest
      .spyOn(global, 'setInterval')
      .mockImplementation(() => cleanupTimer);

    const moduleExports = requireFromRoot(modulePath);

    expect(moduleExports.globalConfigCache).toBeDefined();
    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 60 * 1000);
    expect(cleanupTimer.unref).toHaveBeenCalledTimes(1);
  });
});
