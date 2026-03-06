import type { MetadataRoute } from 'next'
import { prisma } from '@ciclo/database'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://ciclodasestações.com.br'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all published event slugs for dynamic pages
  const events = await prisma.event.findMany({
    where: { isPublished: true, isDeleted: false },
    select: { slug: true, updatedAt: true },
    orderBy: { startDate: 'asc' },
  })

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/eventos`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/privacidade`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  const eventPages: MetadataRoute.Sitemap = events.map((event) => ({
    url: `${BASE_URL}/eventos/${event.slug}`,
    lastModified: event.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...eventPages]
}
