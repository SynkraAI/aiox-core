import { cn } from '@/lib/utils';

interface OptionCardProps {
  letter: string;
  text: string;
  selected: boolean;
  dimmed: boolean;
  hideLabel?: boolean;
  italic?: boolean;
  onClick: () => void;
}

const OptionCard = ({ letter, text, selected, dimmed, hideLabel, italic, onClick }: OptionCardProps) => {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        'w-full min-h-[72px] rounded-card border text-left flex items-center gap-4 transition-all duration-150',
        hideLabel ? 'px-5 py-5' : 'px-4 py-4',
        selected
          ? 'border-2 border-cria-accent bg-cria-accent/[0.08]'
          : 'border border-cria-border bg-cria-bg-secondary hover:bg-cria-bg-elevated hover:border-cria-bg-elevated',
        dimmed && 'opacity-50',
        'active:scale-[0.97] focus-visible:outline-none focus-visible:shadow-focus-ring'
      )}
    >
      {!hideLabel && letter && (
        <span
          className={cn(
            'text-xl font-semibold w-8 shrink-0 text-center',
            selected ? 'text-cria-accent' : 'text-[#737373]'
          )}
        >
          {letter}
        </span>
      )}
      <span className={cn('text-base font-medium text-[#F5F5F5]', italic && 'italic')}>
        {text}
      </span>
    </button>
  );
};

export default OptionCard;
