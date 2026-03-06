'use client'

import { useState, useTransition } from 'react'
import { Button } from '@ciclo/ui'
import type { UserRole } from '@ciclo/database'
import { promoteRole } from '../../lib/actions/participants'

// ============================================================
// Types
// ============================================================

interface RolePromotionProps {
  userId: string
  currentRole: UserRole
}

// ============================================================
// Constants
// ============================================================

const PROMOTION_MAP: Partial<Record<UserRole, { target: UserRole; label: string }>> = {
  USER: { target: 'THERAPIST', label: 'Promover para Terapeuta' },
  THERAPIST: { target: 'FACILITATOR', label: 'Promover para Facilitador' },
}

const ROLE_LABELS: Record<string, string> = {
  USER: 'Participante',
  THERAPIST: 'Terapeuta',
  FACILITATOR: 'Facilitador',
  ADMIN: 'Admin',
}

// ============================================================
// Confirmation Modal
// ============================================================

interface ConfirmModalProps {
  currentRole: string
  targetRole: string
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmModal({ currentRole, targetRole, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900">Confirmar promoção de role</h3>
        <p className="mt-2 text-sm text-gray-600">
          Deseja promover este participante de{' '}
          <strong>{ROLE_LABELS[currentRole] ?? currentRole}</strong> para{' '}
          <strong>{ROLE_LABELS[targetRole] ?? targetRole}</strong>?
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Esta acao altera as permissoes do usuario no sistema.
        </p>
        <div className="mt-4 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
          <Button size="sm" onClick={onConfirm}>
            Confirmar Promoção
          </Button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Component
// ============================================================

export function RolePromotion({ userId, currentRole }: RolePromotionProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  )

  const promotion = PROMOTION_MAP[currentRole]

  if (!promotion) {
    return (
      <p className="text-sm text-gray-500">
        Role atual: {ROLE_LABELS[currentRole] ?? currentRole} — sem promoção disponível.
      </p>
    )
  }

  const handleConfirm = () => {
    setShowConfirm(false)
    setFeedback(null)
    startTransition(async () => {
      const result = await promoteRole(userId, promotion.target)
      if (result.success) {
        setFeedback({ type: 'success', message: 'Role promovida com sucesso.' })
      } else {
        setFeedback({ type: 'error', message: result.error ?? 'Erro ao promover role.' })
      }
    })
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowConfirm(true)}
        disabled={isPending}
      >
        {isPending ? 'Promovendo...' : promotion.label}
      </Button>
      {feedback && (
        <span
          className={`text-sm ${feedback.type === 'success' ? 'text-green-600' : 'text-red-600'}`}
        >
          {feedback.message}
        </span>
      )}

      {showConfirm && (
        <ConfirmModal
          currentRole={currentRole}
          targetRole={promotion.target}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  )
}
