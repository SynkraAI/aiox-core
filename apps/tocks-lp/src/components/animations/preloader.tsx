'use client'

import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import { gsap } from '@/lib/gsap-config'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

export default function Preloader() {
  const containerRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const taglineRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(true)
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('tocks-loaded')) {
      setShow(false)
      return
    }

    if (reduced) {
      sessionStorage.setItem('tocks-loaded', 'true')
      setShow(false)
      return
    }

    const safety = setTimeout(() => {
      sessionStorage.setItem('tocks-loaded', 'true')
      setShow(false)
    }, 4000)

    try {
      tlRef.current = gsap.timeline({
        onComplete: () => {
          clearTimeout(safety)
          sessionStorage.setItem('tocks-loaded', 'true')
          setShow(false)
        },
      })

      tlRef.current.fromTo(logoRef.current,
        { scale: 0.6, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1, ease: 'power3.out' }
      )
      tlRef.current.fromTo(lineRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.8, ease: 'power2.inOut' },
        '-=0.3'
      )
      tlRef.current.fromTo(taglineRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' },
        '-=0.3'
      )
      tlRef.current.to(containerRef.current,
        { yPercent: -100, duration: 0.9, ease: 'power3.inOut', delay: 0.4 }
      )
    } catch {
      clearTimeout(safety)
      sessionStorage.setItem('tocks-loaded', 'true')
      setShow(false)
    }

    return () => {
      clearTimeout(safety)
      tlRef.current?.kill()
    }
  }, [reduced])

  if (!show) return null

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-bg-primary"
    >
      <div ref={logoRef} className="flex flex-col items-center">
        <Image
          src="/images/brand/tocks-logo.svg"
          alt="Tocks Custom"
          width={280}
          height={62}
          priority
          className="h-14 md:h-16 w-auto"
        />
      </div>
      <div
        ref={lineRef}
        className="w-32 h-px mt-6 origin-center bg-accent"
      />
      <div ref={taglineRef} className="mt-4 opacity-0">
        <span className="text-text-secondary text-xs tracking-[0.4em] uppercase">
          Artesanato que transforma espaços
        </span>
      </div>
    </div>
  )
}
