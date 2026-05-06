'use client'

/**
 * useReveal -- S-8.5b / AC-2
 *
 * IntersectionObserver hook para Classe 2 product-reveal. Quando ref element
 * entra viewport com threshold 0.2, toggles `.is-revealed` (once, auto-disconnect).
 *
 * SSR-safe: retorna ref sem side effects durante render. useEffect so roda client-side.
 * Reduced-motion respeitado via Patch #2c em globals.css (kill-switch global).
 *
 * Spec: docs/design/elevation-awwwards/06-motion-system-spec.md §6.3 Classe 2.
 *
 * Art. VII: < 100 linhas.
 */

import { useEffect, useRef } from 'react'

const THRESHOLD = 0.2

export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Guard: IntersectionObserver pode nao existir em browsers muito antigos.
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-revealed')
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting) {
          el.classList.add('is-revealed')
          io.disconnect()
        }
      },
      { threshold: THRESHOLD }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return ref
}
