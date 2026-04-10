'use client'

import { useRef, useEffect } from 'react'
import Image from 'next/image'
import { gsap, ScrollTrigger } from '@/lib/gsap-config'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

interface ImageRevealProps {
  src: string
  alt: string
  width: number
  height: number
  direction?: 'left' | 'right' | 'bottom' | 'top'
  className?: string
}

export default function ImageReveal({
  src, alt, width, height,
  direction = 'left',
  className = '',
}: ImageRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!ref.current || reduced) return

    const clips: Record<string, { from: string; to: string }> = {
      left:   { from: 'inset(0 100% 0 0)', to: 'inset(0 0% 0 0)' },
      right:  { from: 'inset(0 0 0 100%)', to: 'inset(0 0 0 0%)' },
      top:    { from: 'inset(0 0 100% 0)', to: 'inset(0 0 0% 0)' },
      bottom: { from: 'inset(100% 0 0 0)', to: 'inset(0% 0 0 0)' },
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(ref.current,
        { clipPath: clips[direction].from },
        {
          clipPath: clips[direction].to,
          duration: 1.2,
          ease: 'power3.inOut',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      )
    }, ref)

    return () => ctx.revert()
  }, [direction, reduced])

  return (
    <div ref={ref} className={className}>
      <Image src={src} alt={alt} width={width} height={height} className="w-full h-auto" />
    </div>
  )
}
