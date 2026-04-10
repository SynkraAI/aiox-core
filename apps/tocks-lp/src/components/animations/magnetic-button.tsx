'use client'

import { useRef, useCallback } from 'react'
import { gsap } from '@/lib/gsap-config'

interface MagneticButtonProps {
  children: React.ReactNode
  className?: string
  strength?: number
  onClick?: () => void
  href?: string
}

export default function MagneticButton({
  children, className = '', strength = 0.3, onClick, href,
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    gsap.to(ref.current, { x: x * strength, y: y * strength, duration: 0.4, ease: 'power2.out' })
  }, [strength])

  const handleMouseLeave = useCallback(() => {
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.3)' })
  }, [])

  const Tag = href ? 'a' : 'button'
  const props = href ? { href } : { onClick }

  return (
    <Tag
      ref={ref as any}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </Tag>
  )
}
