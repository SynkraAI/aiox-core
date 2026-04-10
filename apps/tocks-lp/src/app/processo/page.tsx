'use client'

import Image from 'next/image'
import ScrollReveal from '@/components/animations/scroll-reveal'
import Counter from '@/components/animations/counter'
import Button from '@/components/ui/button'
import Icon from '@/components/ui/icon'
import { getWhatsAppUrlCustom } from '@/data/whatsapp'
import { trackWhatsAppClick } from '@/lib/analytics'

const STEPS = [
  {
    number: '01',
    title: 'Seleção da Madeira',
    description:
      'Escolhemos cada tronco pela densidade, veio e resistência. Trabalhamos com madeiras nobres como Peroba, Cedrinho e Cumaru — cada peça é única.',
    image: '/images/products/Mesa-de-Sinuca-Rustic-Madeira-Maciça---001.jpg',
  },
  {
    number: '02',
    title: 'Corte e Preparação',
    description:
      'Cortes precisos respeitando a fibra natural da madeira. A secagem controlada garante estabilidade por décadas.',
    image: '/images/products/Mesa-de-Bilhar-Design-001.jpg',
  },
  {
    number: '03',
    title: 'Marcenaria',
    description:
      'Encaixes artesanais que garantem estrutura por gerações. Técnicas transmitidas de Martinho a Milton, e agora a nova geração.',
    image: '/images/products/Mesa-de-Bilhar-Vertice-001.jpg',
  },
  {
    number: '04',
    title: 'Montagem',
    description:
      'Cada peça é unida com técnica e paciência. A estrutura é testada em cada etapa para assegurar solidez absoluta.',
    image: '/images/products/Mesa-de-Bilhar-Elemento-Personalizada-001.jpg',
  },
  {
    number: '05',
    title: 'Acabamento',
    description:
      '12 camadas de verniz, lixadas à mão entre cada aplicação. O resultado é um toque sedoso e uma proteção que dura anos.',
    image: '/images/products/Mesa-de-Bilhar-Curve-001.jpg',
  },
  {
    number: '06',
    title: 'Instalação do Pano',
    description:
      'Pano de competição esticado sobre ardósia calibrada. A tensão é ajustada milimetricamente para rolamento perfeito.',
    image: '/images/products/Mesa-de-Bilhar-Elipse-001.jpg',
  },
  {
    number: '07',
    title: 'Controle de Qualidade',
    description:
      'Cada mesa é testada e inspecionada antes da entrega. Verificamos nivelamento, acabamento, encaixes e rolamento da bola.',
    image: '/images/products/Mesa-de-Bilhar-Aparato-Alto-Padrão-001.jpg',
  },
  {
    number: '08',
    title: 'Entrega e Instalação',
    description:
      'Nossa equipe instala, nivela e orienta os cuidados. Você recebe sua mesa pronta para jogar, com garantia total.',
    image: '/images/products/Mesa-de-sinuca-e-jantar-Master-Madeira-Maciça-002.jpg',
  },
] as const

export default function ProcessoPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--color-accent-glow)_0%,transparent_70%)] pointer-events-none" />

        <span className="text-[var(--color-accent)] text-sm uppercase tracking-[0.3em] mb-6 relative">
          Do tronco à sua sala
        </span>
        <h1 className="font-[family-name:var(--font-heading)] text-6xl md:text-7xl lg:text-[5.5rem] font-semibold text-[var(--color-text-primary)] leading-[0.95] relative">
          O Processo
        </h1>
        <p className="mt-6 text-lg md:text-xl text-[var(--color-text-secondary)] max-w-lg relative">
          Semanas de trabalho manual. 8 etapas de excelência artesanal.
        </p>

        {/* Stats */}
        <div className="relative mt-16 flex gap-12 md:gap-20">
          <div className="text-center">
            <Counter end={8} className="font-[family-name:var(--font-heading)] text-4xl font-semibold text-[var(--color-accent)]" />
            <p className="text-[var(--color-text-secondary)] text-xs mt-1 uppercase tracking-wider">etapas</p>
          </div>
          <div className="text-center">
            <Counter end={12} className="font-[family-name:var(--font-heading)] text-4xl font-semibold text-[var(--color-accent)]" />
            <p className="text-[var(--color-text-secondary)] text-xs mt-1 uppercase tracking-wider">camadas de verniz</p>
          </div>
          <div className="text-center">
            <Counter end={38} suffix=" anos" className="font-[family-name:var(--font-heading)] text-4xl font-semibold text-[var(--color-accent)]" />
            <p className="text-[var(--color-text-secondary)] text-xs mt-1 uppercase tracking-wider">de ofício</p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-px h-16 overflow-hidden">
          <div className="w-full h-full bg-[var(--color-accent)] animate-[scroll-pulse_2s_ease-in-out_infinite]" />
        </div>
      </section>

      {/* Steps */}
      {STEPS.map((step, i) => {
        const isEven = i % 2 === 0
        return (
          <section
            key={step.number}
            className="py-24 md:py-32 px-6 border-t border-[var(--color-border)]"
          >
            <div className="max-w-6xl mx-auto">
              <ScrollReveal>
                <div
                  className={`grid md:grid-cols-2 gap-12 md:gap-20 items-center ${
                    isEven ? '' : 'md:[direction:rtl]'
                  }`}
                >
                  {/* Image */}
                  <div className={`relative aspect-[4/3] overflow-hidden rounded-sm bg-[var(--color-bg-secondary)] ${isEven ? '' : 'md:[direction:ltr]'}`}>
                    <Image
                      src={step.image}
                      alt={`Etapa ${step.number} — ${step.title}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                    {/* Step number overlay */}
                    <div className="absolute top-6 left-6 font-[family-name:var(--font-heading)] text-6xl md:text-7xl font-bold text-[var(--color-accent)]/20">
                      {step.number}
                    </div>
                  </div>

                  {/* Text */}
                  <div className={isEven ? '' : 'md:[direction:ltr]'}>
                    <span className="font-[family-name:var(--font-heading)] text-5xl md:text-6xl font-bold text-[var(--color-accent)]">
                      {step.number}
                    </span>
                    <h2 className="font-[family-name:var(--font-heading)] text-2xl md:text-3xl lg:text-4xl font-semibold text-[var(--color-text-primary)] mt-4">
                      {step.title}
                    </h2>
                    <p className="mt-6 text-[var(--color-text-secondary)] text-base md:text-lg leading-relaxed max-w-md">
                      {step.description}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </section>
        )
      })}

      {/* Final CTA */}
      <section className="py-32 md:py-48 px-6 text-center bg-[var(--color-bg-secondary)]">
        <ScrollReveal>
          <div>
            <span className="text-[var(--color-accent)] text-sm uppercase tracking-[0.2em]">
              Sua mesa começa aqui
            </span>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl lg:text-5xl font-semibold text-[var(--color-text-primary)] mt-4">
              Quer acompanhar a fabricação da sua mesa?
            </h2>
            <p className="mt-6 text-[var(--color-text-secondary)] text-lg max-w-xl mx-auto">
              Envie uma mensagem e nosso time explica cada etapa do seu projeto personalizado.
            </p>
            <div className="mt-10">
              <Button
                variant="whatsapp"
                size="lg"
                href={getWhatsAppUrlCustom('Olá! Quero entender o processo de fabricação de uma mesa personalizada.')}
                onClick={() => trackWhatsAppClick('processo-cta')}
              >
                <Icon name="whatsapp" size={20} />
                Falar com um especialista
              </Button>
            </div>
          </div>
        </ScrollReveal>
      </section>

    </>
  )
}
