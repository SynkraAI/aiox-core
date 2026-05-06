import type { Metadata } from 'next'
import { ChapterLead } from '@/components/templates/atelier/chapter-lead'
import { ChapterMadeira } from '@/components/templates/atelier/chapter-madeira'
import { ChapterCorte } from '@/components/templates/atelier/chapter-corte'
import { ChapterAcabamento } from '@/components/templates/atelier/chapter-acabamento'
import { ChapterEntrega } from '@/components/templates/atelier/chapter-entrega'
import { ChapterColofon } from '@/components/templates/atelier/chapter-colofon'

/**
 * AtelierPage -- S-8.4 Longform orquestrador.
 *
 * Reportagem editorial NYT Magazine / Gentlewoman em 5 atos + colofon. Cada
 * chapter e um template independente em src/components/templates/atelier/.
 *
 * Server Component por design:
 * - metadata export e suportado apenas em Server Components (Next 16 docs:
 *   01-getting-started/14-metadata-and-og-images.md).
 * - Chapters 1-4 (lead/madeira/corte/acabamento/entrega) sao 'use client'
 *   porque consomem useChapterScroll (GSAP ScrollTrigger). Composicao
 *   Server→Client documentada em 05-server-and-client-components.md.
 * - Colofon e Server Component puro (sem motion, static).
 *
 * Art. VII: < 100 linhas.
 */

export const metadata: Metadata = {
  title: 'Ateliê',
  description:
    'Desde 2008 em Itajaí, desenhamos e acabamos móveis de autor em madeira maciça. Um ateliê onde marcenaria tradicional encontra desenho contemporâneo.',
}

export default function AtelierPage() {
  return (
    <main>
      <ChapterLead />
      <ChapterMadeira />
      <ChapterCorte />
      <ChapterAcabamento />
      <ChapterEntrega />
      <ChapterColofon />
    </main>
  )
}
