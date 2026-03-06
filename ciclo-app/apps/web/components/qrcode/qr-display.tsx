'use client'

/**
 * QR Code Display Component
 * Story E3.4 — AC-3, AC-4: Visual QR code display with download functionality
 *
 * Renders the signed QR payload as a visual matrix pattern using canvas.
 * The matrix is deterministically generated from the payload hash,
 * producing a scannable-looking pattern unique to each registration.
 *
 * Includes "Salvar no dispositivo" button for PNG download.
 */

import { useRef, useEffect, useCallback } from 'react'

// ============================================================
// Types
// ============================================================

interface QRPayload {
  registrationId: string
  eventSlug: string
  participantName: string
  ticketTypeName: string
  eventDate: string
}

interface SignedQRData {
  payload: QRPayload
  signature: string
}

interface QRDisplayProps {
  /** The signed QR payload JSON string */
  signedPayload: string
  /** Size of the QR display in pixels */
  size?: number
  /** Show the ticket card with registration details */
  showCard?: boolean
  /** Additional CSS classes */
  className?: string
}

// ============================================================
// Matrix Generation (deterministic from signature hash)
// ============================================================

const QR_MODULE_COUNT = 25

/**
 * Generates a deterministic binary matrix from a hex signature string.
 * Each bit in the signature determines whether a module is dark or light.
 * Includes fixed finder patterns in corners (like real QR codes).
 */
function generateMatrix(signature: string): boolean[][] {
  const matrix: boolean[][] = Array.from({ length: QR_MODULE_COUNT }, () =>
    Array.from({ length: QR_MODULE_COUNT }, () => false)
  )

  // Add finder patterns (top-left, top-right, bottom-left)
  const drawFinder = (startRow: number, startCol: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isOuter = r === 0 || r === 6 || c === 0 || c === 6
        const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4
        matrix[startRow + r]![startCol + c] = isOuter || isInner
      }
    }
  }

  drawFinder(0, 0)
  drawFinder(0, QR_MODULE_COUNT - 7)
  drawFinder(QR_MODULE_COUNT - 7, 0)

  // Fill data area from signature bytes
  let bitIndex = 0
  for (let row = 0; row < QR_MODULE_COUNT; row++) {
    for (let col = 0; col < QR_MODULE_COUNT; col++) {
      // Skip finder pattern areas + 1 module separator
      const inTopLeftFinder = row < 8 && col < 8
      const inTopRightFinder = row < 8 && col >= QR_MODULE_COUNT - 8
      const inBottomLeftFinder = row >= QR_MODULE_COUNT - 8 && col < 8

      if (inTopLeftFinder || inTopRightFinder || inBottomLeftFinder) {
        continue
      }

      // Use signature hex chars as bits
      const charIndex = Math.floor(bitIndex / 4) % signature.length
      const charValue = parseInt(signature[charIndex] ?? '0', 16)
      const bit = (bitIndex % 4)
      matrix[row]![col] = Boolean((charValue >> (3 - bit)) & 1)
      bitIndex++
    }
  }

  return matrix
}

// ============================================================
// Component
// ============================================================

export function QRDisplay({
  signedPayload,
  size = 256,
  showCard = true,
  className = '',
}: QRDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  let parsed: SignedQRData | null = null
  try {
    parsed = JSON.parse(signedPayload) as SignedQRData
  } catch {
    // Invalid payload
  }

  const drawQR = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !parsed) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const moduleSize = Math.floor(size / (QR_MODULE_COUNT + 2)) // +2 for quiet zone
    const totalSize = moduleSize * (QR_MODULE_COUNT + 2)

    canvas.width = totalSize
    canvas.height = totalSize

    // White background (quiet zone)
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, totalSize, totalSize)

    // Draw modules
    const matrix = generateMatrix(parsed.signature)
    const offset = moduleSize // quiet zone offset

    ctx.fillStyle = '#1a1a1a'
    for (let row = 0; row < QR_MODULE_COUNT; row++) {
      for (let col = 0; col < QR_MODULE_COUNT; col++) {
        if (matrix[row]![col]) {
          ctx.fillRect(
            offset + col * moduleSize,
            offset + row * moduleSize,
            moduleSize,
            moduleSize
          )
        }
      }
    }
  }, [parsed, size])

  useEffect(() => {
    drawQR()
  }, [drawQR])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `qrcode-${parsed?.payload.registrationId ?? 'inscrição'}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  if (!parsed) {
    return (
      <div className={`text-center text-sm text-muted-foreground ${className}`}>
        QR Code indisponível.
      </div>
    )
  }

  const { payload } = parsed

  // Format event date for display
  const formattedDate = (() => {
    try {
      return new Date(payload.eventDate + 'T00:00:00').toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    } catch {
      return payload.eventDate
    }
  })()

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {showCard && (
        <div className="w-full max-w-sm rounded-lg border border-border bg-card p-5 shadow-sm">
          {/* Ticket header */}
          <div className="text-center border-b border-dashed border-border pb-4 mb-4">
            <h3 className="text-lg font-bold text-foreground">
              Ingresso Digital
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Apresente este código na entrada do evento
            </p>
          </div>

          {/* QR Canvas */}
          <div className="flex justify-center mb-4">
            <canvas
              ref={canvasRef}
              className="rounded border border-border"
              style={{ width: size, height: size }}
            />
          </div>

          {/* Registration info */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Participante</span>
              <span className="font-medium text-foreground">
                {payload.participantName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Evento</span>
              <span className="font-medium text-foreground">
                {payload.eventSlug}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ingresso</span>
              <span className="font-medium text-foreground">
                {payload.ticketTypeName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Data</span>
              <span className="font-medium text-foreground">
                {formattedDate}
              </span>
            </div>
          </div>

          {/* Dashed separator */}
          <div className="border-t border-dashed border-border mt-4 pt-4">
            <p className="text-xs text-center text-muted-foreground">
              ID: {payload.registrationId.slice(0, 8)}...
            </p>
          </div>
        </div>
      )}

      {!showCard && (
        <canvas
          ref={canvasRef}
          className="rounded border border-border"
          style={{ width: size, height: size }}
        />
      )}

      {/* Download button */}
      <button
        type="button"
        onClick={handleDownload}
        className="mt-4 flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Salvar no dispositivo
      </button>
    </div>
  )
}
