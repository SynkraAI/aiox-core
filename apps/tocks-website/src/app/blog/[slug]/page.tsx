import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BlogLayout } from '@/components/templates/blog-layout'
import { Text } from '@/components/atoms/text'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

const BLOG_METADATA: Record<string, { title: string; description: string; date: string; readTime: string }> = {
  'como-escolher-mesa-sinuca': {
    title: 'Como escolher a mesa de sinuca ideal para sua casa',
    description: 'Tamanho do ambiente, tipo de jogo e acabamento. Os tres pilares para uma decisao acertada.',
    date: '2024-03-15',
    readTime: '5 min',
  },
  'madeira-macica-vs-mdf': {
    title: 'Madeira macica vs MDF: por que nunca usamos MDF',
    description: 'A diferenca entre uma mesa que dura geracoes e uma que nao sobrevive a primeira mudanca.',
    date: '2024-02-28',
    readTime: '4 min',
  },
}

export async function generateStaticParams() {
  return Object.keys(BLOG_METADATA).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = BLOG_METADATA[slug]
  if (!post) return {}
  return {
    title: post.title,
    description: post.description,
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = BLOG_METADATA[slug]

  if (!post) {
    notFound()
  }

  // Dynamic MDX import
  let Content: React.ComponentType
  try {
    const mdxModule = await import(`@/content/blog/${slug}.mdx`)
    Content = mdxModule.default
  } catch {
    notFound()
  }

  const formattedDate = new Date(post.date).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <BlogLayout>
      <header className="mb-12">
        <Text variant="label" className="mb-4">{post.readTime} de leitura</Text>
        <h1 className="font-heading text-4xl md:text-5xl font-semibold leading-[0.95] text-[var(--text-primary)] mb-4">
          {post.title}
        </h1>
        <Text variant="caption">{formattedDate}</Text>
        <div className="gold-separator mt-8" />
      </header>
      <Content />
    </BlogLayout>
  )
}
