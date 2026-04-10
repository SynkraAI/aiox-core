'use client'

import dynamic from 'next/dynamic'

const ProductViewer = dynamic(
  () => import('@/components/three/product-viewer'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-square rounded-lg animate-pulse" style={{ backgroundColor: 'var(--color-bg-secondary)' }} />
    ),
  }
)

export default ProductViewer
