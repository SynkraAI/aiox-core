'use client'

/**
 * Step progress indicator for registration flow
 * Story E3.1 — AC-10: Visual step indicator (1/2/3)
 */

interface StepIndicatorProps {
  currentStep: number
  totalSteps?: number
}

const STEP_LABELS = ['Ingresso', 'Dados', 'Pagamento']

export function StepIndicator({
  currentStep,
  totalSteps = 3,
}: StepIndicatorProps) {
  return (
    <nav aria-label="Progresso da inscrição" className="mb-8">
      <ol className="flex items-center justify-center gap-2 sm:gap-4">
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1
          const isActive = step === currentStep
          const isCompleted = step < currentStep

          return (
            <li key={step} className="flex items-center gap-2 sm:gap-4">
              {/* Step circle */}
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                    isCompleted
                      ? 'bg-seasonal-primary text-primary-foreground'
                      : isActive
                        ? 'border-2 border-seasonal-primary bg-seasonal-primary/10 text-seasonal-primary'
                        : 'border-2 border-muted bg-muted/30 text-muted-foreground'
                  }`}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    step
                  )}
                </div>
                <span
                  className={`hidden text-sm font-medium sm:inline ${
                    isActive
                      ? 'text-foreground'
                      : isCompleted
                        ? 'text-seasonal-primary'
                        : 'text-muted-foreground'
                  }`}
                >
                  {STEP_LABELS[i]}
                </span>
              </div>

              {/* Connector line */}
              {step < totalSteps && (
                <div
                  className={`h-0.5 w-8 sm:w-12 ${
                    isCompleted ? 'bg-seasonal-primary' : 'bg-muted'
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
