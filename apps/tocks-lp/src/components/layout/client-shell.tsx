'use client'

import Navigation from '@/components/layout/navigation'

export default function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      {children}
    </>
  )
}
