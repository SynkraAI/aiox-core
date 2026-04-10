'use client'

import { useRef, useEffect, useMemo } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap-config'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

interface TextRevealProps {
  children: string
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
  className?: string
  delay?: number
}

export default function TextReveal({
  children,
  as: Tag = 'h2',
  className = '',
  delay = 0,
}: TextRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const words = useMemo(() => children.split(' '), [children])

  useEffect(() => {
    if (!ref.current || reduced) return

    const spans = ref.current.querySelectorAll('[data-word]')

    const ctx = gsap.context(() => {
      gsap.fromTo(spans,
        { y: '100%', opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.05,
          ease: 'power3.out',
          delay,
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      )
    }, ref)

    return () => ctx.revert()
  }, [children, delay, reduced])

  return (
    <Tag ref={ref as React.Ref<HTMLHeadingElement>} className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden">
          <span
            data-word
            className={`inline-block ${reduced ? '' : 'translate-y-full opacity-0'}`}
          >
            {word}
          </span>
          {i < words.length - 1 ? '\u00A0' : ''}
        </span>
      ))}
    </Tag>
  )
}
