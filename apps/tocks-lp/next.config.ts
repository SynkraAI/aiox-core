import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Vercel handles Next.js natively — no need for static export.
  // This enables Image Optimization, ISR, edge functions, and headers.
  images: {
    formats: ['image/avif', 'image/webp'],
  },
}

export default nextConfig
