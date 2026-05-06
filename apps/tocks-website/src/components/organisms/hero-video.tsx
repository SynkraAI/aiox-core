'use client'

/**
 * HeroVideo -- Organism (S-8.2 / Epic 8 Direção B Gilded Noir Cinemático).
 *
 * LCP-safe cinematic background for Home hero:
 * - Poster is the LCP element (rendered via next/image with fetchPriority high).
 * - Video is a progressive enhancement: mounted only when prefers-reduced-motion
 *   is NOT reduce AND videoSrc is provided. If `onError` fires, video is hidden
 *   and poster stays.
 * - No audio, autoPlay muted loop playsInline, preload="metadata" only.
 *
 * Next 16 note: `priority` is deprecated -- using `preload` + `fetchPriority="high"`.
 *
 * Art. VII: < 100 linhas.
 * Art. IV: codecs H.264 / WebM / HEVC only (no 4th format invented).
 * Spec source: docs/design/elevation-awwwards/01-master-plan-phases-3-7.md Fase 3.
 */

import Image from 'next/image'
import { useRef, useState, useSyncExternalStore } from 'react'

// SSR-safe reduced-motion detector (React 19 idiomatic).
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
function subscribeReducedMotion(callback: () => void) {
  const mql = window.matchMedia(REDUCED_MOTION_QUERY)
  mql.addEventListener('change', callback)
  return () => mql.removeEventListener('change', callback)
}
const getReducedMotion = () => window.matchMedia(REDUCED_MOTION_QUERY).matches
const getReducedMotionServer = () => true // server assumes reduced (no video) -- hydrates to real value
function useReducedMotion() {
  return useSyncExternalStore(subscribeReducedMotion, getReducedMotion, getReducedMotionServer)
}

interface HeroVideoProps {
  videoSrc?: string
  videoSrcWebm?: string
  videoSrcHevc?: string
  posterSrc: string
  alt: string
  className?: string
}

export function HeroVideo({
  videoSrc,
  videoSrcWebm,
  videoSrcHevc,
  posterSrc,
  alt,
  className = '',
}: HeroVideoProps) {
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [videoFailed, setVideoFailed] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const reducedMotion = useReducedMotion()
  const hasAnySource = Boolean(videoSrc || videoSrcWebm || videoSrcHevc)
  // Mount video only client-side, not reduced-motion, and at least one source provided.
  const mountVideo = !reducedMotion && hasAnySource

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <Image
        src={posterSrc}
        alt={alt}
        fill
        preload
        fetchPriority="high"
        sizes="100vw"
        className="object-cover"
      />
      {mountVideo && !videoFailed && (
        <video
          ref={videoRef}
          aria-hidden="true"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={posterSrc}
          onLoadedData={() => setVideoLoaded(true)}
          onError={() => setVideoFailed(true)}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[400ms]"
          style={{ opacity: videoLoaded ? 1 : 0 }}
        >
          {videoSrcWebm && <source src={videoSrcWebm} type="video/webm" />}
          {videoSrcHevc && <source src={videoSrcHevc} type="video/mp4; codecs=hvc1" />}
          {videoSrc && <source src={videoSrc} type="video/mp4" />}
        </video>
      )}
    </div>
  )
}
