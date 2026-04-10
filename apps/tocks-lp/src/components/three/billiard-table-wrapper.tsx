'use client'

import dynamic from 'next/dynamic'

const BilliardTableViewer = dynamic(
  () => import('@/components/three/billiard-table'),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full aspect-[4/3] rounded-sm flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-bg-secondary)' }}
      >
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[var(--color-text-secondary)] tracking-wider uppercase">
            Carregando visualizacao 3D
          </p>
        </div>
      </div>
    ),
  },
)

export default BilliardTableViewer
