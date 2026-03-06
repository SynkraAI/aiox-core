import type { Metadata } from 'next'
import Link from 'next/link'
import { getRawCancellationPolicy } from '../../../../lib/actions/cancellation-policy'
import { CancellationPolicyForm } from '../../../../components/cancellation/cancellation-policy-form'

export const metadata: Metadata = {
  title: 'Política de Cancelamento',
  description: 'Configurar política global de cancelamento',
}

export default async function CancellationPolicyPage() {
  const policy = await getRawCancellationPolicy()

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <nav className="mb-4 text-sm text-gray-500">
          <Link href="/admin/configurações" className="hover:text-gray-700">
            Configurações
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Política de Cancelamento</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">
          Política de Cancelamento Global
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Define a política padrão de reembolso para todos os eventos.
          Eventos individuais podem ter overrides.
        </p>
      </div>

      <CancellationPolicyForm
        mode="global"
        initialPolicy={
          policy
            ? {
                earlyDaysThreshold: policy.earlyDaysThreshold,
                earlyRefundPercent: policy.earlyRefundPercent,
                midDaysLowerThreshold: policy.midDaysLowerThreshold,
                midRefundPercent: policy.midRefundPercent,
                transferAllowed: policy.transferAllowed,
              }
            : undefined
        }
      />
    </div>
  )
}
