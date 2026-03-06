import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@ciclo/ui'
import { getEvent } from '../../../../../lib/actions/events'
import {
  SEASON_LABELS,
  SEASON_COLORS,
  ASTRONOMICAL_EVENT_LABELS,
} from '../../../../../lib/constants'

export const metadata: Metadata = {
  title: 'Preview Evento',
  description: 'Visualização do evento como sera exibido publicamente',
}

interface PreviewEventPageProps {
  params: Promise<{ id: string }>
}

function formatDateFull(date: Date): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function PreviewEventPage({ params }: PreviewEventPageProps) {
  const { id } = await params
  const event = await getEvent(id)

  if (!event) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Admin bar */}
      <div className="mb-6 flex items-center justify-between rounded-lg bg-yellow-50 border border-yellow-200 p-3">
        <span className="text-sm font-medium text-yellow-800">
          Preview - Visao publica do evento
        </span>
        <Link
          href={`/admin/eventos/${id}`}
          className="text-sm font-medium text-yellow-800 hover:underline"
        >
          Voltar para edicao
        </Link>
      </div>

      {/* Event Header */}
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-3">
          <Badge className={SEASON_COLORS[event.season] ?? 'bg-gray-100 text-gray-800'}>
            {SEASON_LABELS[event.season] ?? event.season}
          </Badge>
          {event.astronomicalEvent && (
            <Badge variant="outline">
              {ASTRONOMICAL_EVENT_LABELS[event.astronomicalEvent] ?? event.astronomicalEvent}
            </Badge>
          )}
          {!event.isPublished && (
            <Badge className="bg-gray-100 text-gray-600">Rascunho</Badge>
          )}
          {event.isSoldOut && (
            <Badge className="bg-red-100 text-red-800">Esgotado</Badge>
          )}
        </div>

        <h1 className="text-3xl font-bold text-gray-900">{event.name}</h1>
        {event.subtitle && (
          <p className="mt-2 text-xl text-gray-600">{event.subtitle}</p>
        )}
      </div>

      {/* Image Gallery */}
      {event.images.length > 0 && (
        <div className="mb-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {event.images.map((image) => (
              <div key={image.id} className="aspect-video overflow-hidden rounded-lg bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={image.alt ?? event.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event Details */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {event.description && (
            <div>
              <h2 className="mb-2 text-lg font-semibold text-gray-900">Sobre o Evento</h2>
              <div className="prose prose-sm max-w-none text-gray-700">
                {event.description.split('\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>
          )}

          {event.includedPractices.length > 0 && (
            <div>
              <h2 className="mb-2 text-lg font-semibold text-gray-900">Práticas Incluídas</h2>
              <div className="flex flex-wrap gap-2">
                {event.includedPractices.map((practice, i) => (
                  <Badge key={i} variant="secondary">
                    {practice}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* FAQs */}
          {event.faqs.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Perguntas Frequentes</h2>
              <div className="space-y-4">
                {event.faqs.map((faq) => (
                  <div key={faq.id} className="rounded-lg border border-gray-200 p-4">
                    <h3 className="font-medium text-gray-900">{faq.question}</h3>
                    <p className="mt-2 text-sm text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="mb-3 font-semibold text-gray-900">Detalhes</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="font-medium text-gray-500">Data Inicio</dt>
                <dd className="text-gray-900">{formatDateFull(event.startDate)}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Data Fim</dt>
                <dd className="text-gray-900">{formatDateFull(event.endDate)}</dd>
              </div>
              {event.venue && (
                <div>
                  <dt className="font-medium text-gray-500">Local</dt>
                  <dd className="text-gray-900">{event.venue}</dd>
                </div>
              )}
              {event.capacity && (
                <div>
                  <dt className="font-medium text-gray-500">Capacidade</dt>
                  <dd className="text-gray-900">{event.capacity} vagas</dd>
                </div>
              )}
            </dl>
          </div>

          {(event.elementMTC || event.organMTC) && (
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="mb-3 font-semibold text-gray-900">Medicina Tradicional Chinesa</h3>
              <dl className="space-y-3 text-sm">
                {event.elementMTC && (
                  <div>
                    <dt className="font-medium text-gray-500">Elemento</dt>
                    <dd className="text-gray-900">{event.elementMTC}</dd>
                  </div>
                )}
                {event.organMTC && (
                  <div>
                    <dt className="font-medium text-gray-500">Sistema de Orgaos</dt>
                    <dd className="text-gray-900">{event.organMTC}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
