'use client'

/**
 * ChapterEntrega -- Template S-8.4 / AC-8
 *
 * Ato 4 do longform. Testimonial placeholder honesto + CTA concierge.
 * Section bg --noir-mid (transicao para footer).
 *
 * AC-2: root recebe .chapter-target via useChapterScroll.
 * AC-8: CTA para /contato, Button atom, label "Converse com o ateliê".
 *
 * Art. VII: < 100 linhas.
 *
 * NOTE S-8.6: Testimonial placeholder pendente validacao cliente real.
 */

import { Button } from '@/components/atoms/button'
import { Text } from '@/components/atoms/text'
import { useChapterScroll } from '@/hooks/use-chapter-scroll'

export function ChapterEntrega() {
  const ref = useChapterScroll<HTMLElement>()

  return (
    <section
      ref={ref}
      className="chapter-target section-padding-editorial"
      style={{ backgroundColor: 'var(--noir-mid)' }}
    >
      <div className="container-editorial">
        <Text variant="label" className="mb-6">
          Ato 4 · Entrega
        </Text>

        <h2 className="font-heading text-3xl md:text-4xl leading-[var(--leading-snug)] text-[var(--text-primary)] mb-12 max-w-xl">
          Transporte especializado. Montagem no local.
        </h2>

        {/* NOTE S-8.6: testimonial placeholder — validar com cliente real antes do go-live. */}
        <blockquote className="max-w-2xl mb-16">
          <p className="font-heading text-xl md:text-2xl leading-[var(--leading-relaxed)] text-[var(--text-primary)] italic">
            &ldquo;Testimonial pendente de validação com cliente real — placeholder honesto
            para avaliar composição editorial da página. A peça entregue cumpriu expectativa
            de projeto assinado.&rdquo;
          </p>
          <footer className="mt-5">
            <Text
              variant="label"
              className="tracking-[var(--tracking-extreme)]"
            >
              Cliente · placeholder S-8.6
            </Text>
          </footer>
        </blockquote>

        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <Button href="/contato" size="lg">
            Converse com o ateliê
          </Button>
          <Text variant="caption" className="max-w-md pt-2">
            Cada projeto começa com uma conversa. Entendemos o espaço, o uso, a assinatura.
            Depois desenhamos.
          </Text>
        </div>
      </div>
    </section>
  )
}
