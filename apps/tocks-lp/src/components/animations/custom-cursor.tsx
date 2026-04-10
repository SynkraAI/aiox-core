'use client'

import { useRef, useEffect, useState } from 'react'
import { gsap } from '@/lib/gsap-config'

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  useEffect(() => {
    if (isMobile) return
    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    const xDot = gsap.quickTo(dot, 'x', { duration: 0.1 })
    const yDot = gsap.quickTo(dot, 'y', { duration: 0.1 })
    const xRing = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power2.out' })
    const yRing = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power2.out' })

    const onMove = (e: MouseEvent) => {
      xDot(e.clientX)
      yDot(e.clientY)
      xRing(e.clientX)
      yRing(e.clientY)
    }

    const onEnter = () => gsap.to(ring, { scale: 2.5, opacity: 0.4, duration: 0.3, overwrite: true })
    const onLeave = () => gsap.to(ring, { scale: 1, opacity: 1, duration: 0.3, overwrite: true })

    document.addEventListener('mousemove', onMove)

    const hoverElements = new WeakSet<Element>()
    const addHoverListeners = () => {
      document.querySelectorAll('a, button, [data-cursor-hover]').forEach((el) => {
        if (hoverElements.has(el)) return
        hoverElements.add(el)
        el.addEventListener('mouseenter', onEnter)
        el.addEventListener('mouseleave', onLeave)
      })
    }

    addHoverListeners()
    const observer = new MutationObserver(addHoverListeners)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      document.removeEventListener('mousemove', onMove)
      observer.disconnect()
    }
  }, [isMobile])

  if (isMobile) return null

  return (
    <>
      <div ref={dotRef} className="fixed top-0 left-0 w-2 h-2 rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2" style={{ backgroundColor: 'var(--color-accent)' }} />
      <div ref={ringRef} className="fixed top-0 left-0 w-10 h-10 rounded-full pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2" style={{ border: '1px solid var(--color-accent)', opacity: 0.5 }} />
    </>
  )
}
