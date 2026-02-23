import { useEffect, useState } from 'react';

interface ResultScreenProps {
  leadName: string;
}

const WHATSAPP_NUMBER = process.env.VITE_WHATSAPP_NUMBER || '5511999999999';

const ResultScreen = ({ leadName }: ResultScreenProps) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 0),
      setTimeout(() => setStep(2), 400),
      setTimeout(() => setStep(3), 800),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const show = (n: number) => ({
    opacity: step >= n ? 1 : 0,
    transform: step >= n ? 'translateY(0)' : 'translateY(20px)',
    transition: 'opacity 600ms ease-out, transform 600ms ease-out',
  });

  const waText = encodeURIComponent(
    `Oi! Respondi o quiz e estou pronto para começar minha jornada digital.`
  );
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`;

  return (
    <div className="min-h-[100dvh] px-6 py-12 flex flex-col justify-center">
      <div className="w-full max-w-[480px] mx-auto space-y-8">
        {/* Main message */}
        <div className="space-y-6" style={show(1)}>
          <p className="text-base md:text-lg leading-relaxed text-[#F5F5F5]">
            Você chegou até aqui.
          </p>

          <p className="text-base md:text-lg leading-relaxed text-[#A3A3A3]">
            A maioria das pessoas não chega. Elas fecham a página, voltam pra rotina e convencem a si mesmas de que não é o momento certo.
          </p>

          <p className="text-base md:text-lg leading-relaxed text-[#F5F5F5]">
            Você não fez isso.
          </p>

          <p className="text-base md:text-lg leading-relaxed text-[#A3A3A3]">
            Isso já diz muito sobre quem você é.
          </p>

          <p className="text-base md:text-lg leading-relaxed text-[#F5F5F5]">
            Guarda o que você sentiu ao responder essas perguntas. Não deixa essa sensação ir embora dessa vez.
          </p>

          <p className="text-base md:text-lg leading-relaxed text-[#A3A3A3]">
            Algo está sendo construído.
          </p>

          <p className="text-base md:text-lg leading-relaxed text-[#F5F5F5]">
            Quando estiver pronto — você vai ser o primeiro a saber.
          </p>
        </div>

        {/* Signature */}
        <div className="pt-4" style={show(2)}>
          <p className="text-sm text-[#737373] text-center">
            — {leadName} aqui está ele por completo
          </p>
        </div>

        {/* WhatsApp CTA */}
        <div className="pt-8 space-y-3" style={show(3)}>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full h-14 rounded-card bg-cria-whatsapp hover:brightness-110 active:scale-[0.97] text-white font-bold text-base transition-all duration-150"
          >
            <WhatsAppIcon />
            Continuar no WhatsApp
          </a>

          <p className="text-xs text-[#737373] text-center pt-2">
            Método Cria | Política de Privacidade
          </p>
        </div>
      </div>
    </div>
  );
};

function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default ResultScreen;
