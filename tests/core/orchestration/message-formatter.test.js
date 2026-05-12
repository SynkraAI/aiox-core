/**
 * Tests for Message Formatter
 *
 * Story 12.7: Modo Educativo (Opt-in)
 *
 * Tests cover:
 * - formatActionResult: concise (OFF) vs detailed (ON)
 * - formatDecisionExplanation: silence (OFF) vs detailed (ON)
 * - formatAgentAssignment: silence (OFF) vs explained (ON)
 * - formatToggleFeedback: enable/disable messages
 * - formatError: basic vs detailed with context
 */

'use strict';

const { MessageFormatter, createMessageFormatter } = require('../../../.aiox-core/core/orchestration/message-formatter');

describe('MessageFormatter', () => {
  describe('constructor', () => {
    it('should create instance with educationalMode OFF by default', () => {
      const formatter = new MessageFormatter();
      expect(formatter.isEducationalMode()).toBe(false);
    });

    it('should create instance with educationalMode ON when specified', () => {
      const formatter = new MessageFormatter({ educationalMode: true });
      expect(formatter.isEducationalMode()).toBe(true);
    });
  });

  describe('setEducationalMode', () => {
    it('should toggle educational mode', () => {
      const formatter = new MessageFormatter();
      expect(formatter.isEducationalMode()).toBe(false);

      formatter.setEducationalMode(true);
      expect(formatter.isEducationalMode()).toBe(true);

      formatter.setEducationalMode(false);
      expect(formatter.isEducationalMode()).toBe(false);
    });

    it('should coerce truthy values to boolean', () => {
      const formatter = new MessageFormatter();
      formatter.setEducationalMode(1);
      expect(formatter.isEducationalMode()).toBe(true);

      formatter.setEducationalMode(0);
      expect(formatter.isEducationalMode()).toBe(false);
    });
  });

  describe('formatActionResult', () => {
    describe('educational mode OFF', () => {
      let formatter;

      beforeEach(() => {
        formatter = new MessageFormatter({ educationalMode: false });
      });

      it('should return concise message with files created', () => {
        const result = formatter.formatActionResult('Autenticação JWT', {
          filesCreated: 4,
        });
        expect(result).toBe('✅ Autenticação JWT implementada. 4 arquivos criados.');
      });

      it('should return concise message with files modified', () => {
        const result = formatter.formatActionResult('Refatoração', {
          filesModified: 2,
        });
        expect(result).toBe('✅ Refatoração implementada. 2 arquivos modificados.');
      });

      it('should return concise message with both created and modified', () => {
        const result = formatter.formatActionResult('Feature X', {
          filesCreated: 3,
          filesModified: 2,
        });
        expect(result).toBe('✅ Feature X implementada. 3 arquivos criados, 2 modificados.');
      });

      it('should return concise message with no files', () => {
        const result = formatter.formatActionResult('Config update', {});
        expect(result).toBe('✅ Config update implementada. Concluído.');
      });

      it('should handle singular file counts', () => {
        const result = formatter.formatActionResult('Fix', {
          filesCreated: 1,
          filesModified: 1,
        });
        expect(result).toBe('✅ Fix implementada. 1 arquivo criado, 1 modificado.');
      });
    });

    describe('educational mode ON', () => {
      let formatter;

      beforeEach(() => {
        formatter = new MessageFormatter({ educationalMode: true });
      });

      it('should return detailed message with reason', () => {
        const result = formatter.formatActionResult('Autenticação JWT', {
          filesCreated: 4,
          reason: 'JWT é stateless e escalável',
        });
        expect(result).toContain('Vou implementar Autenticação JWT.');
        expect(result).toContain('📚 Por quê?');
        expect(result).toContain('JWT é stateless e escalável');
      });

      it('should include steps when provided', () => {
        const result = formatter.formatActionResult('API Endpoint', {
          steps: [
            'Criar handler',
            'Adicionar validação',
            'Implementar testes',
          ],
        });
        expect(result).toContain('🔧 O que vou fazer:');
        expect(result).toContain('1. Criar handler');
        expect(result).toContain('2. Adicionar validação');
        expect(result).toContain('3. Implementar testes');
      });

      it('should include agents when provided', () => {
        const result = formatter.formatActionResult('Database Migration', {
          agents: [
            { id: '@data-engineer', name: 'Dara', task: 'Create migration' },
            { id: '@dev', name: 'Dex', task: 'Update models' },
          ],
        });
        expect(result).toContain('👥 Agentes envolvidos:');
        expect(result).toContain('@data-engineer (Dara): Create migration');
        expect(result).toContain('@dev (Dex): Update models');
      });

      it('should include tradeoffs when provided', () => {
        const result = formatter.formatActionResult('Auth System', {
          tradeoffs: [
            { choice: 'JWT vs Session', selected: 'JWT', reason: 'Scalability' },
          ],
        });
        expect(result).toContain('Trade-offs:');
        expect(result).toContain('JWT vs Session: JWT');
        expect(result).toContain('Motivo: Scalability');
      });

      it('should include file summary', () => {
        const result = formatter.formatActionResult('Feature', {
          filesCreated: 2,
          filesModified: 3,
        });
        expect(result).toContain('📁 Arquivos: 2 criados, 3 modificados');
      });
    });
  });

  describe('formatDecisionExplanation', () => {
    it('should return empty string when educational mode is OFF', () => {
      const formatter = new MessageFormatter({ educationalMode: false });
      const result = formatter.formatDecisionExplanation('Use JWT', [
        { choice: 'Auth method', selected: 'JWT', reason: 'Stateless' },
      ]);
      expect(result).toBe('');
    });

    it('should return detailed explanation when educational mode is ON', () => {
      const formatter = new MessageFormatter({ educationalMode: true });
      const result = formatter.formatDecisionExplanation('Use JWT', [
        { choice: 'Auth method', selected: 'JWT', reason: 'Stateless' },
      ]);
      expect(result).toContain('💡 Decisão: Use JWT');
      expect(result).toContain('📊 Trade-offs considerados:');
      expect(result).toContain('Auth method');
      expect(result).toContain('→ Escolhido: JWT');
      expect(result).toContain('→ Motivo: Stateless');
    });

    it('should handle empty tradeoffs', () => {
      const formatter = new MessageFormatter({ educationalMode: true });
      const result = formatter.formatDecisionExplanation('Simple choice', []);
      expect(result).toContain('💡 Decisão: Simple choice');
      expect(result).not.toContain('📊 Trade-offs');
    });
  });

  describe('formatAgentAssignment', () => {
    it('should return empty string when educational mode is OFF', () => {
      const formatter = new MessageFormatter({ educationalMode: false });
      const result = formatter.formatAgentAssignment('@dev', 'Dex', 'Implement feature');
      expect(result).toBe('');
    });

    it('should return explanation when educational mode is ON', () => {
      const formatter = new MessageFormatter({ educationalMode: true });
      const result = formatter.formatAgentAssignment('@dev', 'Dex', 'Implement feature', 'Best for code implementation');
      expect(result).toContain('🤖 @dev (Dex) assumindo: Implement feature');
      expect(result).toContain('Por quê: Best for code implementation');
    });

    it('should work without reason', () => {
      const formatter = new MessageFormatter({ educationalMode: true });
      const result = formatter.formatAgentAssignment('@qa', 'Quinn', 'Run tests');
      expect(result).toContain('🤖 @qa (Quinn) assumindo: Run tests');
      expect(result).not.toContain('Por quê:');
    });
  });

  describe('formatToggleFeedback', () => {
    const formatter = new MessageFormatter();

    it('should return enable message', () => {
      const result = formatter.formatToggleFeedback(true);
      expect(result).toContain('🎓 Modo educativo ativado!');
      expect(result).toContain('explicações detalhadas');
    });

    it('should return disable message', () => {
      const result = formatter.formatToggleFeedback(false);
      expect(result).toContain('📋 Modo educativo desativado');
      expect(result).toContain('concisas');
    });
  });

  describe('formatPersistencePrompt', () => {
    it('should return persistence choice prompt', () => {
      const formatter = new MessageFormatter();
      const result = formatter.formatPersistencePrompt();
      expect(result).toContain('Ativar apenas para esta sessão ou permanentemente?');
      expect(result).toContain('[1] Sessão');
      expect(result).toContain('[2] Permanente');
    });
  });

  describe('formatPhaseTransition', () => {
    it('should return empty string when educational mode is OFF', () => {
      const formatter = new MessageFormatter({ educationalMode: false });
      const result = formatter.formatPhaseTransition('development', '12.7', '@dev');
      expect(result).toBe('');
    });

    it('should return phase info when educational mode is ON', () => {
      const formatter = new MessageFormatter({ educationalMode: true });
      const result = formatter.formatPhaseTransition('development', '12.7', '@dev');
      expect(result).toContain('📍 Fase: development → Story 12.7');
      expect(result).toContain('Executor: @dev');
    });
  });

  describe('formatError', () => {
    it('should return basic error in OFF mode', () => {
      const formatter = new MessageFormatter({ educationalMode: false });
      const result = formatter.formatError('Test failed', { phase: 'qa', agent: '@qa' });
      expect(result).toBe('❌ Erro: Test failed\n');
    });

    it('should return detailed error in ON mode', () => {
      const formatter = new MessageFormatter({ educationalMode: true });
      const result = formatter.formatError('Test failed', {
        phase: 'qa',
        agent: '@qa',
        suggestion: 'Check test configuration',
      });
      expect(result).toContain('❌ Erro: Test failed');
      expect(result).toContain('Fase: qa');
      expect(result).toContain('Agente: @qa');
      expect(result).toContain('💡 Sugestão: Check test configuration');
    });
  });

  describe('createMessageFormatter factory', () => {
    it('should create MessageFormatter instance', () => {
      const formatter = createMessageFormatter({ educationalMode: true });
      expect(formatter).toBeInstanceOf(MessageFormatter);
      expect(formatter.isEducationalMode()).toBe(true);
    });
  });
});
