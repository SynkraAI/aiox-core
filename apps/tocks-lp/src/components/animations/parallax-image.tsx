'use client'

import { useRef, useEffect } from 'react'
import Image from 'next/image'
import { gsap, ScrollTrigger } from '@/lib/gsap-config'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

interface ParallaxImageProps {
  src: string
  alt: string
  width: number
  height: number
  speed?: number
  className?: string
  priority?: boolean
}

export default function ParallaxImage({
  src, alt, width, height,
  speed = 0.3,
  className = '',
  priority = false,
}: ParallaxImageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!containerRef.current || !imageRef.current || reduced) return

    const ctx = gsap.context(() => {
      gsap.to(imageRef.current, {
        yPercent: -speed * 100,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      })
    }, containerRef)

    return () => ctx.revert()
  }, [speed, reduced])

  return (
    <div ref={containerRef} className={`overflow-hidden ${className}`}>
      <div ref={imageRef} className={reduced ? '' : 'scale-[1.3]'}>
        <Image src={src} alt={alt} width={width} height={height} priority={priority} sizes="(max-width: 768px) 100vw, 50vw" className="w-full h-full object-cover" />
      </div>
    </div>
  )
}
