'use client'

import { useEffect, useRef } from 'react'
import { trackScroll } from '@/lib/analytics'

export default function SectionTracker() {
  const tracked = useRef<Set<string>>(new Set())

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const section = e.target.getAttribute('data-section')
          if (e.isIntersecting && section && !tracked.current.has(section)) {
            tracked.current.add(section)
            trackScroll(section)
          }
        })
      },
      { threshold: 0.25 }
    )

    document.querySelectorAll('[data-section]').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return null
}
