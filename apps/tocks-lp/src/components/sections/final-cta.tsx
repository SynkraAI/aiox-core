'use client'

import Button from '@/components/ui/button'
import Icon from '@/components/ui/icon'
import { getWhatsAppDefault } from '@/data/whatsapp'
import { trackWhatsAppClick } from '@/lib/analytics'

export default function FinalCta() {
  return (
    <section className="py-24 md:py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--color-accent-glow-soft),transparent_70%)]" />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-semibold">
          Sua mesa está esperando
          <br />
          <span className="text-accent">para ser projetada.</span>
        </h2>
        <p className="mt-6 text-text-secondary text-lg max-w-xl mx-auto">
          Envie as medidas do seu espaço e receba em 48h um projeto 3D
          personalizado, sem compromisso. Se gostar, produção em 45-60 dias.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="whatsapp"
            size="lg"
            href={getWhatsAppDefault()}
            onClick={() => trackWhatsAppClick('final-cta')}
          >
            <Icon name="whatsapp" size={20} />
            Solicitar meu projeto 3D gratuito
          </Button>
          <Button variant="secondary" size="lg" href="/colecao">
            Explorar a coleção
          </Button>
        </div>

        <p className="mt-8 text-text-secondary text-xs">
          Resposta em até 2 horas em horário comercial &middot;
          Atendimento humano e personalizado
        </p>
      </div>
    </section>
  )
}
