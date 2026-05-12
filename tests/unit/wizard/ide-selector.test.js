/**
 * Unit tests for IDE Selector
 *
 * Story 1.4: IDE Selection
 * Tests validation and selection logic
 */

const {
  validateIDESelection,
  getIDESelectionQuestion,
} = require('../../../packages/installer/src/wizard/ide-selector');
const { getIDEKeys } = require('../../../packages/installer/src/config/ide-configs');

describe('IDE Selector', () => {
  describe('validateIDESelection', () => {
    it('should validate at least one IDE selected', () => {
      const result = validateIDESelection([]);
      expect(result).toBe('Please select at least one IDE');
    });

    it('should accept single IDE selection', () => {
      const result = validateIDESelection(['cursor']);
      expect(result).toBe(true);
    });

    it('should accept multiple IDE selections', () => {
      const result = validateIDESelection(['cursor', 'gemini', 'antigravity']);
      expect(result).toBe(true);
    });

    it('should accept all 6 IDE selections', () => {
      const allIDEs = getIDEKeys();
      const result = validateIDESelection(allIDEs);
      expect(result).toBe(true);
    });

    it('should reject invalid IDE keys', () => {
      const result = validateIDESelection(['cursor', 'invalid-ide']);
      expect(result).toContain('Invalid IDE selections');
      expect(result).toContain('invalid-ide');
    });

    it('should reject non-array input', () => {
      const result = validateIDESelection('cursor');
      expect(result).toBe('Invalid selection format');
    });

    it('should reject null input', () => {
      const result = validateIDESelection(null);
      expect(result).toBe('Invalid selection format');
    });

    it('should reject undefined input', () => {
      const result = validateIDESelection(undefined);
      expect(result).toBe('Invalid selection format');
    });
  });

  describe('getIDESelectionQuestion', () => {
    it('should return a valid inquirer question object', () => {
      const question = getIDESelectionQuestion();

      expect(question).toHaveProperty('type', 'checkbox');
      expect(question).toHaveProperty('name', 'selectedIDEs');
      expect(question).toHaveProperty('message');
      expect(question).toHaveProperty('choices');
      expect(question).toHaveProperty('validate');
    });

    it('should have 6 IDE choices', () => {
      const question = getIDESelectionQuestion();
      expect(question.choices).toHaveLength(6);
    });

    it('should have valid choice structure', () => {
      const question = getIDESelectionQuestion();

      question.choices.forEach((choice) => {
        expect(choice).toHaveProperty('name');
        expect(choice).toHaveProperty('value');
        expect(typeof choice.name).toBe('string');
        expect(typeof choice.value).toBe('string');
      });
    });

    it('should use validateIDESelection as validator', () => {
      const question = getIDESelectionQuestion();
      expect(question.validate).toBe(validateIDESelection);
    });
  });
});
