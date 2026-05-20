// PRO-UX.1 / PRO-UX.2 — Pro-specific error registry for the AIOX Pro CLI.
// Extends the canonical error-governance infra (EPIC-AIOX-ERROR-GOVERNANCE):
// reuses AIOXError + ErrorRegistry, maps to EXISTING ErrorCategory values
// (no new categories — constants.js is Object.freeze), and mirrors the
// license-server ErrorCodes (no AIOX_ prefix — deliberate, validated by the
// /^[A-Z0-9_]+$/ regex in ErrorRegistry._normalizeDefinition).
//
// userMessage holds the warm G3-approved PT-BR copy (fallback when the server
// envelope omits message_pt). recovery holds actionable PT-BR steps.

const { ErrorRegistry } = require('./error-registry');
const { ErrorCategory, ErrorSeverity } = require('./constants');

const PRO_ERROR_DEFINITIONS = Object.freeze([
  {
    code: 'SEAT_LIMIT_EXCEEDED',
    category: ErrorCategory.PERMISSION, // license-server "auth says no" → permission
    severity: ErrorSeverity.ERROR,
    retryable: false,
    exitCode: 13,
    userMessage:
      'Opa! Você já está usando o Pro no número máximo de máquinas. Pega o código de suporte aqui embaixo e fala com a gente que a gente libera rapidinho.',
    recovery: [
      'Pega o código de suporte abaixo',
      'Cola no chat com o suporte',
      'Depois que liberarem, roda o comando de instalação de novo',
    ],
  },
  {
    code: 'NOT_A_BUYER',
    category: ErrorCategory.PERMISSION,
    severity: ErrorSeverity.ERROR,
    retryable: false,
    exitCode: 13,
    userMessage:
      'Hmm, sua licença Pro não está ativa no momento. Pega o código de suporte aqui embaixo e fala com a gente que resolvemos rapidinho.',
    recovery: [
      'Pega o código de suporte abaixo',
      'Cola no chat com o suporte',
      'Aguarda a verificação da sua compra',
    ],
  },
  {
    code: 'REVOKED_KEY',
    category: ErrorCategory.PERMISSION,
    severity: ErrorSeverity.ERROR,
    retryable: false,
    exitCode: 13,
    userMessage:
      'Hmm, sua licença Pro não está ativa no momento. Pega o código de suporte aqui embaixo e fala com a gente que a gente verifica pra você.',
    recovery: [
      'Pega o código de suporte abaixo',
      'Cola no chat com o suporte',
      'Aguarda o retorno do financeiro',
    ],
  },
  {
    code: 'RATE_LIMITED',
    category: ErrorCategory.NETWORK, // throttling → network layer
    severity: ErrorSeverity.WARNING,
    retryable: true,
    userMessage:
      'Calma! Foram muitas tentativas em pouco tempo. Espera uns minutinhos e tenta de novo.',
    recovery: ['Aguarda 5 minutos', 'Tenta o comando de novo'],
  },
  {
    code: 'PRO_ARTIFACT_UNAVAILABLE',
    category: ErrorCategory.EXTERNAL_EXECUTOR, // npm/tarball fetch → external executor
    severity: ErrorSeverity.ERROR,
    retryable: true,
    userMessage:
      'Tivemos um probleminha pra baixar o componente Pro. Limpa o cache e tenta de novo em alguns minutos que deve rolar.',
    recovery: [
      'Aguarda 5 minutos (o servidor pode estar reiniciando)',
      'Roda `aiox install --recover-cache` para limpar o cache local',
      'Tenta de novo',
    ],
  },
]);

const proErrorRegistry = new ErrorRegistry(PRO_ERROR_DEFINITIONS);

module.exports = { proErrorRegistry, PRO_ERROR_DEFINITIONS };
