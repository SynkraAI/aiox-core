'use strict';

const fs = require('fs-extra');
const os = require('os');
const path = require('path');
const { syncAntigravityWorkflows } = require('../../../.aiox-core/infrastructure/scripts/ide-sync/utils/antigravity-workflows');

describe('antigravity-workflows', () => {
    let tmpRoot;

    beforeEach(async () => {
        tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'ide-sync-antigravity-'));

        // Create source template dir
        const sourceDir = path.join(tmpRoot, '.aiox-core', 'product', 'templates', 'ide-rules', 'antigravity', 'workflows');
        await fs.ensureDir(sourceDir);

        // Create a mock template
        await fs.writeFile(path.join(sourceDir, 'aios-mock-story.md'), '# Mock Template', 'utf8');
        // Also add a non-markdown file
        await fs.writeFile(path.join(sourceDir, 'ignore-me.json'), '{}', 'utf8');
    });

    afterEach(async () => {
        await fs.remove(tmpRoot);
    });

    it('syncs markdown workflows to the target directory and registers results', () => {
        const resultFiles = [];
        syncAntigravityWorkflows(tmpRoot, false, resultFiles, false);

        const targetDir = path.join(tmpRoot, '.agent', 'workflows');
        expect(fs.existsSync(targetDir)).toBe(true);
        expect(fs.existsSync(path.join(targetDir, 'aios-mock-story.md'))).toBe(true);
        expect(fs.existsSync(path.join(targetDir, 'ignore-me.json'))).toBe(false);

        expect(resultFiles.length).toBe(1);
        expect(resultFiles[0]).toEqual({
            agent: 'Workflow',
            type: 'workflow',
            filename: 'aios-mock-story.md',
            path: path.join(targetDir, 'aios-mock-story.md')
        });
    });

    it('respects dry-run flag', () => {
        const resultFiles = [];
        syncAntigravityWorkflows(tmpRoot, true, resultFiles, false);

        const targetDir = path.join(tmpRoot, '.agent', 'workflows');
        expect(fs.existsSync(targetDir)).toBe(false); // Shouldn't have created the directory

        expect(resultFiles.length).toBe(1);
        expect(resultFiles[0]).toEqual({
            agent: 'Workflow',
            type: 'workflow',
            filename: 'aios-mock-story.md',
            path: undefined
        });
    });

    it('reports errors in resultFiles when fs operations fail', () => {
        const resultFiles = [];
        // Use jest.spyOn to prevent interference with other tests that might run in parallel
        const readdirSpy = jest.spyOn(fs, 'readdirSync').mockImplementation(() => {
            throw new Error('Mocked FS Error');
        });

        try {
            syncAntigravityWorkflows(tmpRoot, false, resultFiles, false);
        } finally {
            readdirSpy.mockRestore();
        }

        expect(resultFiles.length).toBe(1);
        expect(resultFiles[0]).toEqual({
            agent: 'Workflow',
            type: 'workflow-error',
            filename: null,
            path: null,
            error: 'Mocked FS Error'
        });
    });
});
