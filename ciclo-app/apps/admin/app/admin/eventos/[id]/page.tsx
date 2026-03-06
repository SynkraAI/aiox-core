import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getEvent } from '../../../../lib/actions/events'
import { getActivities } from '../../../../lib/actions/activities'
import { getFacilitators } from '../../../../lib/actions/facilitators'
import { EventForm } from '../../../../components/events/event-form'
import { FAQManager } from '../../../../components/events/faq-manager'
import { ImageGalleryManager } from '../../../../components/events/image-gallery-manager'
import { TicketTypeManager } from '../../../../components/events/ticket-type-manager'
import { ActivityManager } from '../../../../components/events/activity-manager'
import { CancellationPolicyForm } from '../../../../components/cancellation/cancellation-policy-form'

export const metadata: Metadata = {
  title: 'Editar Evento',
  description: 'Editar evento do Ciclo das Estações',
}

interface EditEventPageProps {
  params: Promise<{ id: string }>
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params
  const [event, activities, facilitators] = await Promise.all([
    getEvent(id),
    getActivities(id),
    getFacilitators(),
  ])

  if (!event) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <nav className="mb-4 text-sm text-gray-500">
          <Link href="/admin/eventos" className="hover:text-gray-700">
            Eventos
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{event.name}</span>
        </nav>
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Editar Evento</h1>
          <Link
            href={`/admin/eventos/${id}/preview`}
            className="text-sm text-primary hover:underline"
          >
            Ver Preview
          </Link>
        </div>
      </div>

      <EventForm
        mode="edit"
        event={{
          id: event.id,
          name: event.name,
          subtitle: event.subtitle,
          slug: event.slug,
          season: event.season,
          astronomicalEvent: event.astronomicalEvent,
          startDate: event.startDate,
          endDate: event.endDate,
          elementMTC: event.elementMTC,
          organMTC: event.organMTC,
          description: event.description,
          includedPractices: event.includedPractices,
          capacity: event.capacity,
          venue: event.venue,
          isPublished: event.isPublished,
          isSoldOut: event.isSoldOut,
        }}
      />

      {/* Image Gallery Manager */}
      <div className="mt-12 border-t pt-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Galeria de Imagens</h2>
        <ImageGalleryManager eventId={event.id} images={event.images} />
      </div>

      {/* FAQ Manager */}
      <div className="mt-12 border-t pt-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Perguntas Frequentes (FAQ)</h2>
        <FAQManager eventId={event.id} faqs={event.faqs} />
      </div>

      {/* Activity / Schedule Manager */}
      <div className="mt-12 border-t pt-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Cronograma / Atividades</h2>
        <ActivityManager
          eventId={event.id}
          activities={activities}
          facilitators={facilitators.map((f) => ({ id: f.id, name: f.name }))}
        />
      </div>

      {/* Ticket Types Manager */}
      <div className="mt-12 border-t pt-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Tipos de Ingresso</h2>
        <TicketTypeManager eventId={event.id} ticketTypes={event.ticketTypes} />
      </div>

      {/* Cancellation Policy Override (AC-2) */}
      <div className="mt-12 border-t pt-8">
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          Política de Cancelamento
        </h2>
        <p className="mb-4 text-sm text-gray-500">
          {event.cancellationPolicy
            ? 'Este evento tem uma política de cancelamento customizada.'
            : 'Este evento usa a política global. Configure um override abaixo se necessário.'}
        </p>
        <CancellationPolicyForm
          mode="event"
          eventId={event.id}
          initialPolicy={
            event.cancellationPolicy
              ? {
                  earlyDaysThreshold: event.cancellationPolicy.earlyDaysThreshold,
                  earlyRefundPercent: event.cancellationPolicy.earlyRefundPercent,
                  midDaysLowerThreshold: event.cancellationPolicy.midDaysLowerThreshold,
                  midRefundPercent: event.cancellationPolicy.midRefundPercent,
                  transferAllowed: event.cancellationPolicy.transferAllowed,
                }
              : undefined
          }
        />
      </div>
    </div>
  )
}
