'use client'

/**
 * useChapterScroll -- S-8.5b / AC-4
 *
 * GSAP ScrollTrigger wrapper para Classe 3 scroll storytelling. Toggles
 * `.is-active` em elementos `.chapter-target` conforme scroll progress:
 * - start 'top 70%' / end 'bottom 30%' (focus zone viewport).
 * - pin=false (val-head rule: no scroll-jacking).
 * - onEnter / onEnterBack adicionam `.is-active`; onLeave / onLeaveBack removem.
 *
 * SSR-safe: typeof window guard + dynamic import gsap/ScrollTrigger.
 * Reduced-motion: Patch #2c neutraliza `.chapter-target` transitions ao nivel
 * do CSS — ScrollTrigger ainda roda mas efeito visual e zero (opacity:1 forcado).
 *
 * Spec: docs/design/elevation-awwwards/06-motion-system-spec.md §6.3 Classe 3.
 *
 * Art. VII: < 100 linhas.
 */

import { useEffect, useRef } from 'react'

type AnyFn = () => void

export function useChapterScroll<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof window === 'undefined') return

    let cleanup: AnyFn | undefined
    let cancelled = false

    // Dynamic import para evitar carregar GSAP no bundle de rotas que nao consomem motion.
    ;(async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ])
      if (cancelled) return
      gsap.registerPlugin(ScrollTrigger)

      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top 70%',
        end: 'bottom 30%',
        onEnter: () => el.classList.add('is-active'),
        onEnterBack: () => el.classList.add('is-active'),
        onLeave: () => el.classList.remove('is-active'),
        onLeaveBack: () => el.classList.remove('is-active'),
      })
      cleanup = () => st.kill()
    })()

    return () => {
      cancelled = true
      if (cleanup) cleanup()
    }
  }, [])

  return ref
}
