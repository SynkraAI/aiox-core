'use client'

import { useRef, useEffect } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap-config'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  stagger?: number
  y?: number
  delay?: number
}

export default function ScrollReveal({
  children,
  className = '',
  stagger = 0.15,
  y = 50,
  delay = 0,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!ref.current || reduced) return
    const items = ref.current.children

    const ctx = gsap.context(() => {
      gsap.fromTo(items,
        { y, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger,
          delay,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      )
    }, ref)

    return () => ctx.revert()
  }, [stagger, y, delay, reduced])

  return <div ref={ref} className={className}>{children}</div>
}
