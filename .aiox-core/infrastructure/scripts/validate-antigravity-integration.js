#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

function getDefaultOptions() {
    const projectRoot = process.cwd();
    return {
        projectRoot,
        workflowsDir: path.join(projectRoot, '.aios-core', 'product', 'templates', 'ide-rules', 'antigravity', 'workflows'),
        quiet: false,
        json: false,
    };
}

function parseArgs(argv = process.argv.slice(2)) {
    const args = new Set(argv);
    return {
        quiet: args.has('--quiet') || args.has('-q'),
        json: args.has('--json'),
    };
}

function validateAntigravityIntegration(options = {}) {
    const projectRoot = options.projectRoot || process.cwd();
    const resolved = {
        ...getDefaultOptions(),
        ...options,
        projectRoot,
    };
    const errors = [];
    const warnings = [];

    if (!fs.existsSync(resolved.workflowsDir)) {
        warnings.push(`Antigravity workflows dir not found: ${path.relative(resolved.projectRoot, resolved.workflowsDir)}`);
    } else {
        const requiredFiles = ['aios-execute-story.md', 'aios-qa-review.md'];
        for (const file of requiredFiles) {
            if (!fs.existsSync(path.join(resolved.workflowsDir, file))) {
                errors.push(`Missing Antigravity workflow file: ${file}`);
            }
        }
    }

    return {
        ok: errors.length === 0,
        errors,
        warnings,
        metrics: {
            workflowsDirExists: fs.existsSync(resolved.workflowsDir),
        },
    };
}

function formatHumanReport(result) {
    if (result.ok) {
        const lines = [
            `✅ Antigravity integration validation passed`,
        ];
        if (result.warnings.length > 0) {
            lines.push(...result.warnings.map((w) => `⚠️ ${w}`));
        }
        return lines.join('\n');
    }
    const lines = [
        `❌ Antigravity integration validation failed (${result.errors.length} issue(s))`,
        ...result.errors.map((e) => `- ${e}`),
    ];
    if (result.warnings.length > 0) {
        lines.push(...result.warnings.map((w) => `⚠️ ${w}`));
    }
    return lines.join('\n');
}

function main() {
    const args = parseArgs();
    const result = validateAntigravityIntegration(args);

    if (!args.quiet) {
        if (args.json) {
            console.log(JSON.stringify(result, null, 2));
        } else {
            console.log(formatHumanReport(result));
        }
    }

    if (!result.ok) {
        process.exitCode = 1;
    }
}

if (require.main === module) {
    main();
}

module.exports = {
    validateAntigravityIntegration,
    parseArgs,
    getDefaultOptions,
};
