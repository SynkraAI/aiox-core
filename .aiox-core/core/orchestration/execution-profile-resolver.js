'use strict';

const VALID_PROFILES = ['safe', 'balanced', 'aggressive'];
const VALID_CONTEXTS = ['production', 'migration', 'security-sensitive', 'development'];

const PROFILE_POLICIES = {
  safe: {
    require_confirmation: true,
    require_tests_before_handoff: true,
    max_parallel_changes: 1,
    allow_destructive_operations: false,
    allow_autonomous_refactors: false,
  },
  balanced: {
    require_confirmation: 'high-risk-only',
    require_tests_before_handoff: true,
    max_parallel_changes: 3,
    allow_destructive_operations: false,
    allow_autonomous_refactors: true,
  },
  aggressive: {
    require_confirmation: false,
    require_tests_before_handoff: false,
    max_parallel_changes: 8,
    allow_destructive_operations: false,
    allow_autonomous_refactors: true,
  },
};

function normalizeProfile(profile) {
  const value = String(profile || '').trim().toLowerCase();
  return VALID_PROFILES.includes(value) ? value : null;
}

function normalizeContext(context) {
  const value = String(context || '').trim().toLowerCase();
  return VALID_CONTEXTS.includes(value) ? value : 'development';
}

function resolveExecutionProfile(input = {}) {
  const context = normalizeContext(input.context);
  const explicitProfile = normalizeProfile(input.explicitProfile);
  const yolo = Boolean(input.yolo);
  const reasons = [];

  if (explicitProfile) {
    reasons.push(`explicit profile selected: ${explicitProfile}`);
    return {
      profile: explicitProfile,
      context,
      policy: PROFILE_POLICIES[explicitProfile],
      reasons,
      source: 'explicit',
    };
  }

  if (context === 'production' || context === 'security-sensitive') {
    reasons.push(`context "${context}" enforces safe profile`);
    return {
      profile: 'safe',
      context,
      policy: PROFILE_POLICIES.safe,
      reasons,
      source: 'context',
    };
  }

  if (context === 'migration') {
    reasons.push('migration context enforces balanced profile');
    return {
      profile: 'balanced',
      context,
      policy: PROFILE_POLICIES.balanced,
      reasons,
      source: 'context',
    };
  }

  if (yolo) {
    reasons.push('yolo mode enabled for non-critical context');
    return {
      profile: 'aggressive',
      context,
      policy: PROFILE_POLICIES.aggressive,
      reasons,
      source: 'yolo',
    };
  }

  reasons.push('default profile for standard development context');
  return {
    profile: 'balanced',
    context,
    policy: PROFILE_POLICIES.balanced,
    reasons,
    source: 'default',
  };
}

module.exports = {
  VALID_PROFILES,
  VALID_CONTEXTS,
  PROFILE_POLICIES,
  normalizeProfile,
  normalizeContext,
  resolveExecutionProfile,
};
