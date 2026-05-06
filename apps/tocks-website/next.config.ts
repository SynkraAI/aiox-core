import type { NextConfig } from 'next'
import createMDX from '@next/mdx'

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // S-8.5 Classe 5 — Next 16 View Transitions API
  // Browser-driven root crossfade/slide on route change (Approach A, CSS-only).
  // Chrome/Edge animate; Safari/Firefox degrade silently (instant nav).
  experimental: {
    viewTransition: true,
  },
}

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {},
})

export default withMDX(nextConfig)
