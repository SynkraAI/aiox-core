import { useReducer } from 'react';
import { QuizState, QuizAction } from '@/types/quiz';

const initialState: QuizState = {
  step: 0,
  answers: Array(7).fill(null),
  leadData: { name: '', email: '', whatsapp: '' },
  archetype: null,
  submitting: false,
  error: null,
};

function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'SET_LEAD_DATA':
      return { ...state, leadData: action.payload };
    case 'ANSWER_QUESTION': {
      const newAnswers = [...state.answers];
      newAnswers[action.payload.questionIndex] = action.payload.optionIndex;
      return { ...state, answers: newAnswers };
    }
    case 'NEXT_STEP':
      return { ...state, step: state.step + 1 };
    case 'SET_ARCHETYPE':
      return { ...state, archetype: action.payload };
    case 'SET_SUBMITTING':
      return { ...state, submitting: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

export function useQuizReducer() {
  return useReducer(quizReducer, initialState);
}
