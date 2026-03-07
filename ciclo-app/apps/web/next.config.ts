import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  transpilePackages: ['@ciclo/ui', '@ciclo/utils', '@ciclo/auth', '@ciclo/database'],
  outputFileTracingRoot: path.join(__dirname, '../../'),
  outputFileTracingIncludes: {
    '/**': [
      './node_modules/.prisma/**/*',
      './node_modules/@prisma/client/**/*',
      '../../node_modules/.pnpm/@prisma+client*/node_modules/.prisma/client/**/*',
      '../../node_modules/.pnpm/@prisma+engines*/node_modules/@prisma/engines/**/*',
    ],
  },
  experimental: {
    optimizePackageImports: ['@ciclo/ui'],
  },
}

export default nextConfig
