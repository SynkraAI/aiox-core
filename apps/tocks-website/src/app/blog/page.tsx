import type { Metadata } from 'next'
import Link from 'next/link'
import { PageLayout } from '@/components/templates/page-layout'
import { Text } from '@/components/atoms/text'
import { Heading } from '@/components/atoms/heading'
import { ImagePlaceholder } from '@/components/atoms/image-placeholder'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Reflexões sobre marcenaria, madeira maciça, design de interiores e o ateliê Tocks Custom.',
}

const BLOG_POSTS = [
  {
    slug: 'como-escolher-mesa-sinuca',
    title: 'Como escolher a mesa de sinuca ideal para sua casa',
    excerpt:
      'Tamanho do ambiente, tipo de jogo e acabamento. Os tres pilares para uma decisao acertada.',
    date: '2024-03-15',
    readTime: '5 min',
    category: 'Guia',
  },
  {
    slug: 'madeira-macica-vs-mdf',
    title: 'Madeira macica vs MDF: por que nunca usamos MDF',
    excerpt:
      'A diferenca entre uma mesa que dura geracoes e uma que nao sobrevive a primeira mudanca.',
    date: '2024-02-28',
    readTime: '4 min',
    category: 'Materiais',
  },
] as const

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function BlogPage() {
  return (
    <PageLayout title="Blog" subtitle="Reflexões sobre marcenaria, madeira e o ofício do ateliê.">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {BLOG_POSTS.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block bg-[var(--surface)] rounded-[8px] overflow-hidden transition-colors duration-300 hover:bg-[var(--surface-hover)]"
          >
            <ImagePlaceholder aspectRatio="16/9" label={post.title} />
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Text variant="label">{post.category}</Text>
                <Text variant="caption">{post.readTime}</Text>
              </div>
              <Heading as="h3" className="!text-xl mb-2 group-hover:text-[var(--accent-gold)] transition-colors">
                {post.title}
              </Heading>
              <Text variant="caption" className="mb-4">{post.excerpt}</Text>
              <Text variant="caption" className="text-[var(--text-secondary)]">
                {formatDate(post.date)}
              </Text>
            </div>
          </Link>
        ))}
      </div>
    </PageLayout>
  )
}
