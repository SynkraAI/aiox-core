/**
 * UAP Collector — Verifies UAP → SYNAPSE bridge status.
 *
 * Checks if _active-agent.json exists and contains valid data.
 *
 * @module core/synapse/diagnostics/collectors/uap-collector
 * @version 1.0.0
 * @created Story SYN-13
 */

'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Collect UAP bridge status data.
 *
 * @param {string} projectRoot - Absolute path to project root
 * @returns {{ checks: Array<{ name: string, status: string, detail: string }> }}
 */
function collectUapBridgeStatus(projectRoot) {
  const checks = [];
  const bridgePath = path.join(projectRoot, '.synapse', 'sessions', '_active-agent.json');

  // Check 1: Bridge file exists
  const exists = fs.existsSync(bridgePath);
  checks.push({
    name: '_active-agent.json exists',
    status: exists ? 'PASS' : 'FAIL',
    detail: exists ? 'Written at activation' : 'File not found — UAP may not have written it',
  });

  if (!exists) {
    checks.push({
      name: 'active_agent matches',
      status: 'SKIP',
      detail: 'Bridge file does not exist',
    });
    return { checks };
  }

  // Check 2: File is valid JSON with expected fields
  try {
    const data = JSON.parse(fs.readFileSync(bridgePath, 'utf8'));

    if (data.id) {
      checks.push({
        name: 'active_agent matches',
        status: 'PASS',
        detail: `Agent: ${data.id}, quality: ${data.activation_quality || 'unknown'}, source: ${data.source || 'unknown'}`,
      });
    } else {
      checks.push({
        name: 'active_agent matches',
        status: 'FAIL',
        detail: 'Bridge file exists but id field is missing',
      });
    }

    // Check 3: Freshness (was it written recently?)
    if (data.activated_at) {
      const activatedAt = new Date(data.activated_at);
      const ageMs = Date.now() - activatedAt.getTime();
      const ageMinutes = Math.round(ageMs / 60000);
      checks.push({
        name: 'Bridge freshness',
        status: ageMinutes < 60 ? 'PASS' : 'WARN',
        detail: `Activated ${ageMinutes}m ago${ageMinutes >= 60 ? ' (stale — may be from previous session)' : ''}`,
      });
    }
  } catch (error) {
    checks.push({
      name: 'active_agent matches',
      status: 'ERROR',
      detail: `Failed to parse bridge file: ${error.message}`,
    });
  }

  return { checks };
}

module.exports = { collectUapBridgeStatus };
