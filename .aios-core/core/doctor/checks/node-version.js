/**
 * Doctor Check: Node.js Version
 *
 * Validates Node.js >= 18 via process.version.
 *
 * @module aios-core/doctor/checks/node-version
 * @story INS-4.1
 */

const name = 'node-version';

async function run() {
  const version = process.version.replace('v', '');
  const [major] = version.split('.').map(Number);

  if (major >= 18) {
    return {
      check: name,
      status: 'PASS',
      message: `Node.js ${process.version}`,
      fixCommand: null,
    };
  }

  return {
    check: name,
    status: 'FAIL',
    message: `Node.js ${process.version} (requires >= 18.0.0)`,
    fixCommand: 'nvm install 20 && nvm use 20',
  };
}

module.exports = { name, run };
