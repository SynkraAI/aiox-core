/**
 * Repository Health Domain Checks
 *
 * Checks for git repository health and configuration.
 * Domain: repository
 *
 * @module aios-core/health-check/checks/repository
 * @version 1.0.0
 * @story HCS-2 - Health Check System Implementation
 */

const GitRepoCheck = require('./git-repo');
const GitStatusCheck = require('./git-status');
const BranchProtectionCheck = require('./branch-protection');
const CommitHistoryCheck = require('./commit-history');
const LockfileIntegrityCheck = require('./lockfile-integrity');
const GitignoreCheck = require('./gitignore');
const ConflictsCheck = require('./conflicts');
const LargeFilesCheck = require('./large-files');

/**
 * All repository domain checks
 */
module.exports = {
  GitRepoCheck,
  GitStatusCheck,
  BranchProtectionCheck,
  CommitHistoryCheck,
  LockfileIntegrityCheck,
  GitignoreCheck,
  ConflictsCheck,
  LargeFilesCheck,
};
