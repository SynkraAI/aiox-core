// Wizard test - uses describeIntegration due to file dependencies
/**
 * Questions Test Suite
 * 
 * Tests question definitions and sequencing logic
 */

const {
  getProjectTypeQuestion,
  getUserProfileQuestion,
  getIDEQuestions,
  getMCPQuestions,
  getTechPresetQuestion,
  getEnvironmentQuestions,
  buildQuestionSequence,
  getQuestionById,
} = require('../../packages/installer/src/wizard/questions');

describeIntegration('questions', () => {
  describeIntegration('getProjectTypeQuestion', () => {
    test('returns valid inquirer question object', () => {
      const question = getProjectTypeQuestion();

      expect(question).toHaveProperty('type', 'list');
      expect(question).toHaveProperty('name', 'projectType');
      expect(question).toHaveProperty('message');
      expect(question).toHaveProperty('choices');
      expect(question).toHaveProperty('validate');
    });

    test('has greenfield and brownfield choices', () => {
      const question = getProjectTypeQuestion();

      expect(question.choices).toHaveLength(2);
      expect(question.choices[0]).toHaveProperty('value', 'greenfield');
      expect(question.choices[1]).toHaveProperty('value', 'brownfield');
    });

    test('includes validator function', () => {
      const question = getProjectTypeQuestion();
      
      expect(typeof question.validate).toBe('function');
    });

    test('validator accepts valid project types', () => {
      const question = getProjectTypeQuestion();
      
      expect(question.validate('greenfield')).toBe(true);
      expect(question.validate('brownfield')).toBe(true);
    });

    test('validator rejects invalid project types', () => {
      const question = getProjectTypeQuestion();

      const result = question.validate('invalid');
      expect(result).not.toBe(true);
      expect(typeof result).toBe('string');
    });
  });

  describeIntegration('getUserProfileQuestion (Story 10.2)', () => {
    test('returns valid inquirer question object', () => {
      const question = getUserProfileQuestion();

      expect(question).toHaveProperty('type', 'list');
      expect(question).toHaveProperty('name', 'userProfile');
      expect(question).toHaveProperty('message');
      expect(question).toHaveProperty('choices');
    });

    test('has bob (assisted) and advanced choices', () => {
      const question = getUserProfileQuestion();

      expect(question.choices).toHaveLength(2);
      expect(question.choices[0]).toHaveProperty('value', 'bob');
      expect(question.choices[1]).toHaveProperty('value', 'advanced');
    });

    test('bob choice includes assisted mode indicator', () => {
      const question = getUserProfileQuestion();

      // First choice should be bob (Modo Assistido)
      expect(question.choices[0].name).toContain('🟢');
      expect(question.choices[0].value).toBe('bob');
    });

    test('advanced choice includes advanced mode indicator', () => {
      const question = getUserProfileQuestion();

      // Second choice should be advanced (Modo Avançado)
      expect(question.choices[1].name).toContain('🔵');
      expect(question.choices[1].value).toBe('advanced');
    });

    test('defaults to advanced (index 1) for backward compatibility', () => {
      const question = getUserProfileQuestion();

      // Default should be index 1 (advanced) for backward compatibility
      expect(question.default).toBe(1);
    });

    test('bob choice is marked as recommended', () => {
      const question = getUserProfileQuestion();

      // Bob choice should include recommended indicator
      expect(question.choices[0].name.toLowerCase()).toMatch(/recommend|recomend/);
    });
  });

  describeIntegration('getIDEQuestions', () => {
    test('returns array of IDE selection questions (Story 1.4)', () => {
      const questions = getIDEQuestions();
      expect(Array.isArray(questions)).toBe(true);
    });

    test('returns one IDE selection question', () => {
      const questions = getIDEQuestions();
      expect(questions).toHaveLength(1);
      expect(questions[0]).toHaveProperty('name', 'selectedIDEs');
      expect(questions[0]).toHaveProperty('type', 'checkbox');
    });
  });

  describeIntegration('getMCPQuestions', () => {
    test('returns array (placeholder for Story 1.5)', () => {
      const questions = getMCPQuestions();
      expect(Array.isArray(questions)).toBe(true);
    });

    test('returns one optional MCP selection question', () => {
      const questions = getMCPQuestions();
      expect(questions).toHaveLength(1);
      expect(questions[0]).toHaveProperty('name', 'selectedMCPs');
      expect(questions[0]).toHaveProperty('type', 'checkbox');
    });
  });

  describeIntegration('getTechPresetQuestion', () => {
    test('returns one tech preset selection question', () => {
      const questions = getTechPresetQuestion();
      expect(questions).toHaveLength(1);
      expect(questions[0]).toHaveProperty('name', 'selectedTechPreset');
      expect(questions[0]).toHaveProperty('type', 'list');
    });

    test('includes Angular NestJS preset choice', () => {
      const [question] = getTechPresetQuestion();
      const values = question.choices.map((choice) => choice.value);

      expect(values).toContain('angular-nestjs');
    });
  });

  describeIntegration('getEnvironmentQuestions', () => {
    test('returns array (placeholder for Story 1.6)', () => {
      const questions = getEnvironmentQuestions();
      expect(Array.isArray(questions)).toBe(true);
    });

    test('currently returns empty array', () => {
      const questions = getEnvironmentQuestions();
      expect(questions).toHaveLength(0);
    });
  });

  describeIntegration('buildQuestionSequence', () => {
    test('returns array of questions', () => {
      const questions = buildQuestionSequence();
      expect(Array.isArray(questions)).toBe(true);
    });

    test('includes project type question', () => {
      const questions = buildQuestionSequence();
      expect(questions).toHaveLength(4);
      expect(questions.map((question) => question.name)).toEqual([
        'language',
        'projectType',
        'selectedIDEs',
        'selectedTechPreset',
      ]);
    });

    test('accepts context parameter', () => {
      const context = { someValue: 'test' };
      const questions = buildQuestionSequence(context);
      expect(Array.isArray(questions)).toBe(true);
    });

    test('future: conditional questions based on context', () => {
      // This test documents future behavior for Stories 1.3-1.6
      // When implemented, questions should vary based on context.projectType
      const contextGreenfield = { projectType: 'greenfield' };
      const contextBrownfield = { projectType: 'brownfield' };

      // Currently same length; tech preset is always selected explicitly.
      expect(buildQuestionSequence(contextGreenfield)).toHaveLength(4);
      expect(buildQuestionSequence(contextBrownfield)).toHaveLength(4);

      // Future: lengths may differ based on project type
      // expect(buildQuestionSequence(contextGreenfield).length).not.toBe(
      //   buildQuestionSequence(contextBrownfield).length
      // );
    });
  });

  describeIntegration('getQuestionById', () => {
    test('returns projectType question by ID', () => {
      const question = getQuestionById('projectType');
      expect(question).not.toBeNull();
      expect(question).toHaveProperty('name', 'projectType');
    });

    test('returns null for unknown ID', () => {
      const question = getQuestionById('unknownQuestion');
      expect(question).toBeNull();
    });

    test('handles undefined ID', () => {
      const question = getQuestionById(undefined);
      expect(question).toBeNull();
    });
  });

  describeIntegration('Question Message Formatting', () => {
    test('projectType question has colored message', () => {
      const question = getProjectTypeQuestion();
      // Message should be wrapped in color function (contains ANSI codes)
      expect(typeof question.message).toBe('string');
      expect(question.message.length).toBeGreaterThan(0);
    });

    test('choices have descriptive names', () => {
      const question = getProjectTypeQuestion();
      
      expect(question.choices[0].name).toContain('Greenfield');
      expect(question.choices[1].name).toContain('Brownfield');
    });

    test('choices include helpful descriptions', () => {
      const question = getProjectTypeQuestion();
      
      expect(question.choices[0].name).toContain('new project');
      expect(question.choices[1].name).toContain('existing project');
    });
  });
});
