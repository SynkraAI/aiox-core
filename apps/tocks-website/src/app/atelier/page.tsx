import type { Metadata } from 'next'
import { PageLayout } from '@/components/templates/page-layout'
import { Heading } from '@/components/atoms/heading'
import { Text } from '@/components/atoms/text'
import { ImagePlaceholder } from '@/components/atoms/image-placeholder'
import { BRAND_COPY } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Atelier',
  description: 'Conheca o atelier Tocks Custom em Itajai, SC. Marcenaria artesanal desde 2008.',
}

const PROCESS_STEPS = [
  {
    number: '01',
    title: 'Consulta',
    description: 'Entendemos seu espaco, estilo de vida e preferencias. Cada projeto comeca com uma conversa.',
  },
  {
    number: '02',
    title: 'Projeto',
    description: 'Nossos designers criam um projeto personalizado com materiais, acabamentos e dimensoes sob medida.',
  },
  {
    number: '03',
    title: 'Marcenaria',
    description: 'Artesaos com mais de 15 anos de experiencia transformam madeira macica na sua mesa.',
  },
  {
    number: '04',
    title: 'Acabamento',
    description: 'Camadas de verniz PU aplicadas a mao garantem protecao e beleza duradoura.',
  },
  {
    number: '05',
    title: 'Entrega',
    description: 'Transporte especializado e montagem profissional na sua residencia em todo o Brasil.',
  },
] as const

const MATERIALS = [
  { name: 'Madeira Macica', description: 'Reflorestamento certificado. Jamais MDF.' },
  { name: 'Ardosia Natural', description: 'Importada da Italia. Planura perfeita.' },
  { name: 'Tecido Profissional', description: 'Simonis e tecidos premium de competicao.' },
  { name: 'Couro Legitimo', description: 'Nos bolsos e acabamentos. Durabilidade e textura.' },
] as const

export default function AtelierPage() {
  return (
    <PageLayout title={BRAND_COPY.atelier.headline} subtitle={BRAND_COPY.atelier.subtitle}>
      {/* Hero Image */}
      <div className="mb-20">
        <ImagePlaceholder aspectRatio="21/9" label="Vista panoramica do atelier" />
      </div>

      {/* Story */}
      <section className="mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <Text variant="label" className="mb-3">Nossa Historia</Text>
            <Heading as="h2" className="mb-6">Desde 2008, cada peca conta uma historia</Heading>
            <Text className="mb-4">
              Fundada em Itajai, Santa Catarina, a Tocks Custom nasceu da paixao pela marcenaria e pelo bilhar.
              O que comecou como um atelier de um unico artesao cresceu para uma equipe dedicada que compartilha
              a mesma obsessao por qualidade.
            </Text>
            <Text>
              Nao produzimos em serie. Cada mesa e projetada individualmente, construida por maos experientes
              e entregue como uma peca unica. Esse e o nosso compromisso.
            </Text>
          </div>
          <ImagePlaceholder aspectRatio="4/5" label="Fundador no atelier" />
        </div>
      </section>

      {/* Process */}
      <section className="mb-20">
        <Text variant="label" className="mb-3">Processo</Text>
        <Heading as="h2" className="mb-12">Da conversa a entrega</Heading>
        <div className="space-y-8">
          {PROCESS_STEPS.map((step) => (
            <div
              key={step.number}
              className="flex gap-6 md:gap-8 items-start border-b border-[var(--surface)] pb-8 last:border-0"
            >
              <span className="font-heading text-4xl md:text-5xl font-semibold text-[var(--accent-gold)] opacity-40 shrink-0 w-16">
                {step.number}
              </span>
              <div>
                <Heading as="h3" className="!text-xl mb-2">{step.title}</Heading>
                <Text variant="caption">{step.description}</Text>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Materials */}
      <section className="mb-20">
        <Text variant="label" className="mb-3">Materiais</Text>
        <Heading as="h2" className="mb-12">So o melhor. Sem excecoes.</Heading>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MATERIALS.map((material) => (
            <div key={material.name} className="bg-[var(--surface)] rounded-[8px] p-6">
              <Heading as="h4" className="!text-lg mb-2">{material.name}</Heading>
              <Text variant="caption">{material.description}</Text>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section>
        <Text variant="label" className="mb-3">Equipe</Text>
        <Heading as="h2" className="mb-12">Quem faz acontecer</Heading>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {['Marceneiro Chefe', 'Designer', 'Acabamento', 'Montagem'].map((role) => (
            <div key={role} className="text-center">
              <ImagePlaceholder aspectRatio="1/1" label={role} className="rounded-full mb-4" />
              <Text variant="caption" className="text-[var(--text-primary)]">{role}</Text>
            </div>
          ))}
        </div>
      </section>
    </PageLayout>
  )
}
