import type { ProcessStep } from '@/types'
import Icon from '@/components/ui/icon'

interface ProcessStepCardProps {
  processStep: ProcessStep
  isLast?: boolean
}

export default function ProcessStepCard({ processStep, isLast = false }: ProcessStepCardProps) {
  return (
    <div className="flex flex-col items-center text-center relative">
      <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center mb-4">
        <Icon name={processStep.icon} size={24} className="text-accent" />
      </div>
      <span className="text-accent text-xs font-medium tracking-widest uppercase mb-2">
        Passo {processStep.step}
      </span>
      <h3 className="font-heading text-xl font-semibold mb-2">{processStep.title}</h3>
      <p className="text-text-secondary text-sm leading-relaxed max-w-[240px]">
        {processStep.description}
      </p>
      {!isLast && (
        <div className="hidden md:block absolute top-8 left-[calc(100%_-_16px)] w-8 border-t border-dashed border-accent/30" />
      )}
    </div>
  )
}
