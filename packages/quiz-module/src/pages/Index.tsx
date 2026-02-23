import { useCallback } from 'react';
import { useQuizReducer } from '@/hooks/useQuizReducer';
import { QUESTIONS } from '@/data/questions';
import { calculateArchetype } from '@/lib/archetype-calculator';
import { supabase } from '@/integrations/supabase/client';
import { LeadData, ArchetypeKey } from '@/types/quiz';
import EntryScreen from '@/components/quiz/EntryScreen';
import QuestionScreen from '@/components/quiz/QuestionScreen';
import LoadingScreen from '@/components/quiz/LoadingScreen';
import ResultScreen from '@/components/quiz/ResultScreen';

const Index = () => {
  const [state, dispatch] = useQuizReducer();

  const handleEntrySubmit = useCallback(async (data: LeadData) => {
    dispatch({ type: 'SET_LEAD_DATA', payload: data });
    dispatch({ type: 'SET_SUBMITTING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Dedup check
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { data: existing } = await supabase
        .from('quiz_responses')
        .select('archetype')
        .eq('user_email', data.email.trim().toLowerCase())
        .gte('created_at', todayStart.toISOString())
        .is('deleted_at', null)
        .maybeSingle();

      if (existing) {
        dispatch({ type: 'SET_ARCHETYPE', payload: existing.archetype as ArchetypeKey });
        dispatch({ type: 'SET_SUBMITTING', payload: false });
        // Skip to result
        for (let i = 0; i < 9; i++) dispatch({ type: 'NEXT_STEP' });
        return;
      }
    } catch {
      // Continue even if dedup check fails
    }

    dispatch({ type: 'SET_SUBMITTING', payload: false });
    dispatch({ type: 'NEXT_STEP' });
  }, [dispatch]);

  const handleAnswer = useCallback((optionIndex: number) => {
    const questionIndex = state.step - 1;
    dispatch({ type: 'ANSWER_QUESTION', payload: { questionIndex, optionIndex } });

    if (state.step === 7) {
      // Last question — go to loading with fade
      setTimeout(() => dispatch({ type: 'NEXT_STEP' }), 700);
    } else {
      dispatch({ type: 'NEXT_STEP' });
    }
  }, [state.step, dispatch]);

  const handleLoadingComplete = useCallback(async () => {
    const archetype = calculateArchetype(state.answers);
    dispatch({ type: 'SET_ARCHETYPE', payload: archetype });

    // Save to database
    try {
      await supabase.from('quiz_responses').insert({
        user_name: state.leadData.name.trim(),
        user_email: state.leadData.email.trim().toLowerCase(),
        user_whatsapp: state.leadData.whatsapp || null,
        answers: state.answers.map(a => a ?? 0),
        archetype,
        metadata: {
          device: window.innerWidth < 768 ? 'mobile' : 'desktop',
          completed_at: new Date().toISOString(),
        },
      });
    } catch {
      // Don't block result display on save failure
    }

    dispatch({ type: 'NEXT_STEP' });
  }, [state.answers, state.leadData, dispatch]);

  // Render based on step
  if (state.step === 0) {
    return (
      <div className="bg-cria-bg min-h-[100dvh]">
        <EntryScreen onSubmit={handleEntrySubmit} submitting={state.submitting} />
      </div>
    );
  }

  if (state.step >= 1 && state.step <= 7) {
    return (
      <div className="bg-cria-bg min-h-[100dvh]">
        <QuestionScreen
          question={QUESTIONS[state.step - 1]}
          questionIndex={state.step - 1}
          totalQuestions={7}
          onAnswer={handleAnswer}
        />
      </div>
    );
  }

  if (state.step === 8) {
    return (
      <div className="bg-cria-bg min-h-[100dvh]">
        <LoadingScreen onComplete={handleLoadingComplete} />
      </div>
    );
  }

  if (state.step === 9 && state.archetype) {
    return (
      <div className="bg-cria-bg min-h-[100dvh]">
        <ResultScreen
          leadName={state.leadData.name}
        />
      </div>
    );
  }

  return null;
};

export default Index;
