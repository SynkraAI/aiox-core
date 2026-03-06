'use client'

/**
 * Boleto Payment Client Component
 * Story E3.2 — AC-5: PDF link, barcode copy button, instructions, due date
 */

import { useState } from 'react'

interface BoletoPaymentClientProps {
  boletoUrl: string
  boletoCode: string
  dueDate: string
  paymentId: string
  registrationId: string
}

export function BoletoPaymentClient({
  boletoUrl,
  boletoCode,
  dueDate,
}: BoletoPaymentClientProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopyCode() {
    if (!boletoCode) return
    try {
      await navigator.clipboard.writeText(boletoCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch {
      // Fallback silently
    }
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Due date */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-medium text-amber-800">
          Vencimento: <span className="font-bold">{dueDate}</span>
        </p>
        <p className="mt-1 text-xs text-amber-600">
          O boleto pode levar até 3 dias úteis para compensar após o pagamento.
        </p>
      </div>

      {/* PDF Link */}
      {boletoUrl && (
        <div>
          <a
            href={boletoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-md bg-seasonal-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-seasonal-primary/90"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Visualizar Boleto (PDF)
          </a>
        </div>
      )}

      {/* Barcode / Linha Digitável */}
      {boletoCode && (
        <div>
          <label className="text-sm font-medium text-foreground">
            Linha Digitável
          </label>
          <div className="mt-1 flex gap-2">
            <input
              type="text"
              readOnly
              value={boletoCode}
              className="flex-1 rounded-md border border-input bg-muted/50 px-3 py-2 text-xs font-mono text-foreground"
            />
            <button
              onClick={handleCopyCode}
              className="shrink-0 rounded-md bg-seasonal-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-seasonal-primary/90"
            >
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground">Como pagar com Boleto</h3>
        <ol className="mt-2 space-y-1 text-sm text-muted-foreground">
          <li>1. Clique no botão acima para visualizar o boleto</li>
          <li>2. Copie a linha digitável ou imprima o PDF</li>
          <li>3. Pague pelo app do seu banco, lotéricas ou internet banking</li>
          <li>4. A confirmação pode levar até 3 dias úteis</li>
          <li>5. Você recebera um email quando o pagamento for confirmado</li>
        </ol>
      </div>

      {/* Status note */}
      <div className="text-center text-sm text-muted-foreground">
        <p>
          Apos o pagamento, você recebera a confirmação por email.
        </p>
        <p className="mt-1">
          Guarde o comprovante de pagamento.
        </p>
      </div>
    </div>
  )
}
