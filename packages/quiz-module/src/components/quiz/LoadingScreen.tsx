import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

const MESSAGES = [
  'Analisando suas respostas...',
  'Identificando seu perfil...',
  'Preparando seu resultado...',
];

const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const [visibleMessages, setVisibleMessages] = useState(0);

  useEffect(() => {
    setVisibleMessages(1);
    const t1 = setTimeout(() => setVisibleMessages(2), 1000);
    const t2 = setTimeout(() => setVisibleMessages(3), 2000);
    const t3 = setTimeout(onComplete, 3000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div
      className="min-h-[100dvh] flex flex-col items-center justify-center px-6"
      aria-live="polite"
      style={{
        background: 'radial-gradient(circle at 50% 40%, rgba(245,158,11,0.05) 0%, transparent 70%)',
      }}
    >
      {/* Spinner */}
      <svg className="w-12 h-12 mb-8 animate-spin" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="20" stroke="#252525" strokeWidth="4" />
        <path
          d="M44 24c0-11.046-8.954-20-20-20"
          stroke="#F59E0B"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>

      <div className="space-y-3 text-center">
        {MESSAGES.map((msg, i) => (
          <p
            key={i}
            className="text-base text-[#A3A3A3] transition-all duration-400"
            style={{
              opacity: i < visibleMessages ? 1 : 0,
              transform: i < visibleMessages ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity 400ms ease-out, transform 400ms ease-out',
            }}
          >
            {msg}
          </p>
        ))}
      </div>
    </div>
  );
};

export default LoadingScreen;
