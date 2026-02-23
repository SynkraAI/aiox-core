export type ArchetypeKey = 'comunicador' | 'mentor' | 'construtor' | 'estrategista';

export interface LeadData {
  name: string;
  email: string;
  whatsapp: string;
}

export interface QuizState {
  step: number; // 0=entry, 1-7=questions, 8=loading, 9=result
  answers: (number | null)[];
  leadData: LeadData;
  archetype: ArchetypeKey | null;
  submitting: boolean;
  error: string | null;
}

export type QuizAction =
  | { type: 'SET_LEAD_DATA'; payload: LeadData }
  | { type: 'ANSWER_QUESTION'; payload: { questionIndex: number; optionIndex: number } }
  | { type: 'NEXT_STEP' }
  | { type: 'SET_ARCHETYPE'; payload: ArchetypeKey }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

export interface QuestionOption {
  letter: string;
  text: string;
}

export interface Question {
  text: string;
  options: QuestionOption[];
  encouragement?: string;
  hideLetters?: boolean;
  italicOptions?: boolean;
}

export interface ArchetypeDefinition {
  key: ArchetypeKey;
  name: string;
  tagline: string;
  description: string;
  strengths: string[];
  idealModel: string;
  nextStep: string;
  color: string;
}
