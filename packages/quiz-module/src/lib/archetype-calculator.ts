import { ArchetypeKey } from '@/types/quiz';
import { SCORING_MATRIX } from '@/data/questions';

const ARCHETYPE_ORDER: ArchetypeKey[] = ['comunicador', 'mentor', 'construtor', 'estrategista'];

export function calculateArchetype(answers: (number | null)[]): ArchetypeKey {
  const scores = [0, 0, 0, 0]; // comunicador, mentor, construtor, estrategista

  answers.forEach((answer, questionIndex) => {
    if (answer !== null && SCORING_MATRIX[questionIndex]?.[answer]) {
      const points = SCORING_MATRIX[questionIndex][answer];
      scores[0] += points[0];
      scores[1] += points[1];
      scores[2] += points[2];
      scores[3] += points[3];
    }
  });

  let maxIndex = 0;
  for (let i = 1; i < scores.length; i++) {
    if (scores[i] > scores[maxIndex]) {
      maxIndex = i;
    }
  }

  return ARCHETYPE_ORDER[maxIndex];
}
