const fs = require('fs-extra');
const path = require('path');

const colors = {
    reset: '\x1b[0m',
    yellow: '\x1b[33m',
};

/**
 * Copies native Antigravity workflows to the project's .agent directory
 * 
 * @param {string} projectRoot - Root directory of the project
 * @param {boolean} dryRun - If true, do not write files
 * @param {Array} resultFiles - Array to push copied file metadata into
 * @param {boolean} verbose - If true, log warnings
 */
function syncAntigravityWorkflows(projectRoot, dryRun, resultFiles, verbose = false) {
    try {
        const sourceDir = path.join(projectRoot, '.aios-core', 'product', 'templates', 'ide-rules', 'antigravity', 'workflows');
        const targetDir = path.join(projectRoot, '.agent', 'workflows');

        if (fs.existsSync(sourceDir)) {
            if (!dryRun) {
                fs.ensureDirSync(targetDir);
            }

            const files = fs.readdirSync(sourceDir);
            for (const file of files) {
                if (file.endsWith('.md')) {
                    const targetPath = path.join(targetDir, file);

                    if (!dryRun) {
                        fs.copyFileSync(path.join(sourceDir, file), targetPath);
                    }

                    resultFiles.push({
                        agent: 'Workflow',
                        type: 'workflow',
                        filename: file,
                        path: dryRun ? undefined : targetPath
                    });
                }
            }
        }
    } catch (e) {
        if (verbose) {
            console.warn(`${colors.yellow}⚠ Antigravity static workflow copy failed: ${e.message}${colors.reset}`);
        }
    }
}

module.exports = {
    syncAntigravityWorkflows
};
