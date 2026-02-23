import { useState } from 'react';
import { LeadData } from '@/types/quiz';
import { validateLeadData, ValidationErrors } from '@/lib/validation';
import { cn } from '@/lib/utils';

interface EntryScreenProps {
  onSubmit: (data: LeadData) => void;
  submitting: boolean;
}

const EntryScreen = ({ onSubmit, submitting }: EntryScreenProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [shaking, setShaking] = useState<string | null>(null);

  const handleSubmit = () => {
    const data = { name, email, whatsapp };
    const validationErrors = validateLeadData(data);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstErrorField = Object.keys(validationErrors)[0];
      setShaking(firstErrorField);
      setTimeout(() => setShaking(null), 400);
      return;
    }

    setErrors({});
    onSubmit(data);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center px-6">
      <div className="w-full max-w-[480px] mx-auto space-y-8">
        <p className="text-sm text-[#737373] font-medium">Método Cria</p>

        <div className="space-y-3">
          <h1 className="text-[28px] md:text-[32px] font-extrabold leading-tight tracking-tight text-[#F5F5F5]">
            Responde 4 perguntas honestas. Eu te digo exatamente onde você está travado.
          </h1>
          <p className="text-base text-[#A3A3A3]">
            Sem enrolação. 3 minutos. Resultado na hora.
          </p>
        </div>

        <div className="space-y-4">
          <FloatingInput
            label="Seu nome"
            type="text"
            value={name}
            onChange={setName}
            error={errors.name}
            shaking={shaking === 'name'}
          />
          <FloatingInput
            label="Seu melhor email"
            type="email"
            value={email}
            onChange={setEmail}
            error={errors.email}
            shaking={shaking === 'email'}
          />
          <div className="relative">
            <div
              className={cn(
                'flex items-center h-[52px] rounded-lg border bg-cria-bg-secondary px-4 transition-all duration-200',
                errors.whatsapp ? 'border-cria-error' : 'border-cria-border focus-within:border-cria-accent focus-within:border-2 focus-within:shadow-focus-ring',
                shaking === 'whatsapp' && 'animate-shake'
              )}
            >
              <span className="text-[#737373] text-base mr-2 shrink-0">+55</span>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="WhatsApp (recomendado)"
                aria-label="WhatsApp"
                className="flex-1 bg-transparent text-base text-[#F5F5F5] placeholder:text-[#737373] outline-none"
              />
            </div>
            {errors.whatsapp && (
              <p className="text-sm text-cria-error mt-1">{errors.whatsapp}</p>
            )}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full h-14 rounded-card bg-cria-accent hover:bg-cria-accent-hover active:bg-cria-accent-pressed active:scale-[0.97] text-cria-bg font-bold text-base md:text-lg shadow-cta-glow hover:shadow-cta-glow-hover transition-all duration-150 disabled:opacity-60 focus-visible:outline-none focus-visible:shadow-focus-ring"
        >
          {submitting ? 'Aguarde...' : 'DESCOBRIR MEU PERFIL'}
        </button>

        <p className="text-xs text-[#737373] text-center leading-relaxed">
          Ao continuar, você concorda com nossa Política de Privacidade. Usamos seus dados apenas para enviar seu perfil e, se você quiser, conteúdos do Método Cria.
        </p>
      </div>
    </div>
  );
};

function FloatingInput({
  label,
  type,
  value,
  onChange,
  error,
  shaking,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  shaking?: boolean;
}) {
  return (
    <div>
      <div
        className={cn(
          'relative h-[52px] rounded-lg border bg-cria-bg-secondary transition-all duration-200',
          error ? 'border-cria-error' : 'border-cria-border focus-within:border-cria-accent focus-within:border-2 focus-within:shadow-focus-ring',
          shaking && 'animate-shake'
        )}
      >
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={label}
          aria-label={label}
          className="w-full h-full px-4 bg-transparent text-base text-[#F5F5F5] placeholder:text-[#737373] outline-none"
        />
      </div>
      {error && <p className="text-sm text-cria-error mt-1">{error}</p>}
    </div>
  );
}

export default EntryScreen;
