/**
 * CtaBlock -- Organism (SSR-safe).
 *
 * Bloco final de pagina: headline Cormorant + sub + single CTA gold.
 * AC-7 S-7.2: usa bg solid (SEM gradient-gold, removido em S-7.1).
 * Borda top em accent-gold-deep para marcar a separacao editorial.
 *
 * Art. VII: < 100 linhas.
 */

import { Heading } from '@/components/atoms/heading'
import { Text } from '@/components/atoms/text'
import { Button } from '@/components/atoms/button'

interface CtaBlockProps {
  headline: string
  subtitle?: string
  ctaLabel: string
  ctaHref: string
  external?: boolean
  className?: string
}

export function CtaBlock({
  headline,
  subtitle,
  ctaLabel,
  ctaHref,
  external = false,
  className = '',
}: CtaBlockProps) {
  return (
    <section
      className={`section-padding bg-[var(--background)] border-t border-[var(--accent-gold-deep)]/40 ${className}`}
    >
      <div className="container-custom text-center max-w-2xl mx-auto">
        <Heading as="h2" className="mb-6">
          {headline}
        </Heading>
        {subtitle && <Text className="mb-10">{subtitle}</Text>}
        <Button href={ctaHref} size="lg" external={external}>
          {ctaLabel}
        </Button>
      </div>
    </section>
  )
}
