import type { Metadata } from 'next'
import { PageLayout } from '@/components/templates/page-layout'
import { Text } from '@/components/atoms/text'
import { ImagePlaceholder } from '@/components/atoms/image-placeholder'
import { BRAND_COPY } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Projetos',
  description: 'Casas que receberam Tocks — móveis de autor instalados em residências por todo o Brasil.',
}

const PROJECTS = [
  {
    id: 'proj-01',
    title: 'Residencia Alto de Pinheiros',
    location: 'Sao Paulo, SP',
    product: 'Tenro Luxo',
    year: '2024',
  },
  {
    id: 'proj-02',
    title: 'Casa de Praia Jurere',
    location: 'Florianopolis, SC',
    product: 'Curve',
    year: '2024',
  },
  {
    id: 'proj-03',
    title: 'Apartamento Batel',
    location: 'Curitiba, PR',
    product: 'Gabe',
    year: '2023',
  },
  {
    id: 'proj-04',
    title: 'Cobertura Leblon',
    location: 'Rio de Janeiro, RJ',
    product: 'Ark',
    year: '2023',
  },
  {
    id: 'proj-05',
    title: 'Chacara Alphaville',
    location: 'Campinas, SP',
    product: 'Vertice',
    year: '2024',
  },
  {
    id: 'proj-06',
    title: 'Escritorio Corporativo',
    location: 'Brasilia, DF',
    product: 'Nobus',
    year: '2024',
  },
] as const

export default function ProjetosPage() {
  return (
    <PageLayout title={BRAND_COPY.projects.headline} subtitle={BRAND_COPY.projects.subtitle}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {PROJECTS.map((project) => (
          <div key={project.id} className="group cursor-pointer">
            <div className="overflow-hidden rounded-[8px] mb-4">
              <ImagePlaceholder
                aspectRatio="16/10"
                label={project.title}
                className="transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <Text variant="label" className="mb-1">{project.product} &middot; {project.year}</Text>
            <span className="block font-heading text-xl font-medium text-[var(--text-primary)] mb-1">
              {project.title}
            </span>
            <Text variant="caption">{project.location}</Text>
          </div>
        ))}
      </div>
    </PageLayout>
  )
}
