/**
 * Cancellation Policy Display — Server Component
 * Story E3.5 — AC-4
 *
 * Shows event-specific policy or falls back to global policy.
 * Renders as an accordion/details element on the public event page.
 */
import { prisma } from '@ciclo/database'

interface CancellationPolicyDisplayProps {
  eventId: string
  eventPolicy: {
    earlyDaysThreshold: number
    earlyRefundPercent: number
    midDaysLowerThreshold: number
    midRefundPercent: number
    transferAllowed: boolean
    description: string | null
  } | null
}

export async function CancellationPolicyDisplay({
  eventId: _eventId,
  eventPolicy,
}: CancellationPolicyDisplayProps) {
  // Se evento não tem política própria, busca global
  let policy = eventPolicy

  if (!policy) {
    const globalPolicy = await prisma.cancellationPolicy.findFirst({
      where: { eventId: null, isActive: true },
      orderBy: { createdAt: 'desc' },
    })

    if (globalPolicy) {
      policy = {
        earlyDaysThreshold: globalPolicy.earlyDaysThreshold,
        earlyRefundPercent: globalPolicy.earlyRefundPercent,
        midDaysLowerThreshold: globalPolicy.midDaysLowerThreshold,
        midRefundPercent: globalPolicy.midRefundPercent,
        transferAllowed: globalPolicy.transferAllowed,
        description: globalPolicy.description,
      }
    }
  }

  if (!policy) return null

  return (
    <section className="mt-12" aria-labelledby="cancelamento-heading">
      <details className="group rounded-lg border border-border bg-card">
        <summary className="cursor-pointer px-4 py-3 font-heading text-xl font-semibold text-foreground hover:bg-muted/50 [&::-webkit-details-marker]:hidden">
          <span className="flex items-center justify-between">
            <span id="cancelamento-heading">Política de Cancelamento</span>
            <span
              className="ml-2 text-muted-foreground transition-transform group-open:rotate-180"
              aria-hidden="true"
            >
              &#9660;
            </span>
          </span>
        </summary>
        <div className="border-t border-border px-4 py-4">
          {policy.description ? (
            <p className="text-sm text-muted-foreground">{policy.description}</p>
          ) : (
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex justify-between">
                <span>Cancelamento com +{policy.earlyDaysThreshold} dias de antecedência:</span>
                <span className="font-medium text-foreground">{policy.earlyRefundPercent}% de reembolso</span>
              </li>
              <li className="flex justify-between">
                <span>Cancelamento entre {policy.midDaysLowerThreshold}-{policy.earlyDaysThreshold - 1} dias antes:</span>
                <span className="font-medium text-foreground">{policy.midRefundPercent}% de reembolso</span>
              </li>
              <li className="flex justify-between">
                <span>Cancelamento com menos de {policy.midDaysLowerThreshold} dias:</span>
                <span className="font-medium text-foreground">Sem reembolso</span>
              </li>
              {policy.transferAllowed && (
                <li className="mt-2 rounded-md bg-muted/50 px-3 py-2">
                  Transferência de inscrição para outra pessoa: <strong>sempre permitida, sem custo</strong>.
                </li>
              )}
            </ul>
          )}
        </div>
      </details>
    </section>
  )
}
