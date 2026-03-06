import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button, Badge, Card, CardContent, CardHeader, CardTitle } from '@ciclo/ui'
import { formatCurrency } from '@ciclo/utils'
import { getParticipant } from '../../../../lib/actions/participants'
import { NotesEditor } from '../../../../components/participants/notes-editor'
import { RolePromotion } from '../../../../components/participants/role-promotion'

export const metadata: Metadata = {
  title: 'Detalhe do Participante',
  description: 'Perfil completo do participante com historico',
}

// ============================================================
// Helpers
// ============================================================

const STATUS_LABELS: Record<string, string> = {
  CONFIRMED: 'Confirmado',
  PENDING: 'Pendente',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Reembolsado',
  TRANSFERRED: 'Transferido',
}

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
  TRANSFERRED: 'bg-blue-100 text-blue-800',
}

const ROLE_LABELS: Record<string, string> = {
  USER: 'Participante',
  THERAPIST: 'Terapeuta',
  FACILITATOR: 'Facilitador',
  ADMIN: 'Admin',
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}


// ============================================================
// Page Component
// ============================================================

interface ParticipanteDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ParticipanteDetailPage({ params }: ParticipanteDetailPageProps) {
  const { id } = await params
  const participant = await getParticipant(id)

  if (!participant) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back navigation */}
      <div className="mb-6">
        <Link href="/admin/participantes">
          <Button variant="ghost" size="sm">
            &larr; Voltar para lista
          </Button>
        </Link>
      </div>

      {/* User Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{participant.name}</span>
            <Badge className="bg-blue-100 text-blue-800">
              {ROLE_LABELS[participant.role] ?? participant.role}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-sm text-gray-900">{participant.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Telefone</p>
              <p className="text-sm text-gray-900">{participant.phone ?? '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Role</p>
              <p className="text-sm text-gray-900">
                {ROLE_LABELS[participant.role] ?? participant.role}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Cadastro</p>
              <p className="text-sm text-gray-900">{formatDate(participant.createdAt)}</p>
            </div>
          </div>

          {/* Role Promotion */}
          <div className="mt-4 border-t pt-4">
            <RolePromotion userId={participant.id} currentRole={participant.role} />
          </div>
        </CardContent>
      </Card>

      {/* Registration History */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Historico de Inscrições</CardTitle>
        </CardHeader>
        <CardContent>
          {participant.registrations.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma inscrição encontrada.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Evento
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Data
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Tipo de Ingresso
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Valor Pago
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {participant.registrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{reg.eventName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(reg.eventDate)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{reg.ticketTypeName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatCurrency(reg.amountPaid)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={
                            STATUS_COLORS[reg.status] ?? 'bg-gray-100 text-gray-800'
                          }
                        >
                          {STATUS_LABELS[reg.status] ?? reg.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Internal Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Anotações Internas</CardTitle>
        </CardHeader>
        <CardContent>
          <NotesEditor
            userId={participant.id}
            existingNotes={participant.internalNotes.map((n) => ({
              text: n.text,
              adminEmail: n.adminEmail,
              createdAt: n.createdAt,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  )
}
