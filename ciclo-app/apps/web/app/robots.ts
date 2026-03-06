import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://ciclodasestações.com.br'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/*', '/api/*', '/minha-conta/*', '/inscrição/*'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
