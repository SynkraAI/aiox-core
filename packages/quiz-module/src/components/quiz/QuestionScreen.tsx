import { useState, useEffect } from 'react';
import { Question } from '@/types/quiz';
import ProgressBar from './ProgressBar';
import OptionCard from './OptionCard';

interface QuestionScreenProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  onAnswer: (optionIndex: number) => void;
}

const QuestionScreen = ({ question, questionIndex, totalQuestions, onAnswer }: QuestionScreenProps) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);
  const [entering, setEntering] = useState(true);

  useEffect(() => {
    setSelected(null);
    setAnimating(false);
    setEntering(true);
    const t = requestAnimationFrame(() => setEntering(false));
    return () => cancelAnimationFrame(t);
  }, [questionIndex]);

  const handleSelect = (optionIndex: number) => {
    if (selected !== null || animating) return;
    setSelected(optionIndex);

    setTimeout(() => {
      setAnimating(true);
      setTimeout(() => {
        onAnswer(optionIndex);
      }, 300);
    }, 200);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col px-6 pt-8 pb-12">
      <div className="w-full max-w-[480px] mx-auto flex-1 flex flex-col">
        <ProgressBar current={questionIndex + 1} total={totalQuestions} />

        <div
          className="flex-1 flex flex-col mt-8"
          style={{
            transform: entering ? 'translateX(40px)' : animating ? 'translateX(-40px)' : 'translateX(0)',
            opacity: entering ? 0 : animating ? 0 : 1,
            transition: entering
              ? 'transform 300ms ease-out, opacity 300ms ease-out'
              : animating
              ? 'transform 200ms ease-in, opacity 200ms ease-in'
              : 'transform 300ms ease-out, opacity 300ms ease-out',
          }}
        >
          <p className="text-sm text-[#737373] mb-2">
            Pergunta {questionIndex + 1} de {totalQuestions}
          </p>

          <h2 className="text-[22px] md:text-[24px] font-bold leading-snug text-[#F5F5F5] mb-8">
            {question.text}
          </h2>

          <div className="space-y-3" role="radiogroup">
            {question.options.map((option, i) => (
              <OptionCard
                key={i}
                letter={option.letter}
                text={option.text}
                selected={selected === i}
                dimmed={selected !== null && selected !== i}
                hideLabel={question.hideLetters}
                italic={question.italicOptions}
                onClick={() => handleSelect(i)}
              />
            ))}
          </div>

          {selected !== null && question.encouragement && (
            <p className="text-sm text-cria-accent text-center mt-6 animate-fade-in">
              {question.encouragement}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionScreen;
