'use client'

import { useRef, useEffect } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap-config'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

interface CounterProps {
  end: number
  suffix?: string
  prefix?: string
  duration?: number
  className?: string
}

export default function Counter({
  end, suffix = '', prefix = '',
  duration = 2, className = '',
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!ref.current) return

    if (reduced) {
      ref.current.textContent = `${prefix}${end}${suffix}`
      return
    }

    const obj = { value: 0 }

    const ctx = gsap.context(() => {
      gsap.to(obj, {
        value: end,
        duration,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        onUpdate: () => {
          if (ref.current) {
            ref.current.textContent = `${prefix}${Math.round(obj.value)}${suffix}`
          }
        },
      })
    }, ref)

    return () => ctx.revert()
  }, [end, duration, prefix, suffix, reduced])

  return <span ref={ref} className={className}>0</span>
}
