'use client'

import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'

interface HeroVideoProps {
  videoSrc?: string
  fallbackImage: string
}

export default function HeroVideo({ videoSrc, fallbackImage }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])

  useEffect(() => {
    if (!videoRef.current || !videoSrc) return
    const video = videoRef.current

    const handleCanPlay = () => setVideoLoaded(true)
    const handleError = () => setVideoError(true)

    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('error', handleError)
    return () => {
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('error', handleError)
    }
  }, [videoSrc])

  const showFallback = !videoSrc || !videoLoaded || videoError

  return (
    <div className="absolute inset-0">
      {/* Video layer — only if file exists */}
      {videoSrc && !videoError && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload={isMobile ? 'metadata' : 'auto'}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            videoLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}

      {/* Fallback image */}
      {showFallback && (
        <Image
          src={fallbackImage}
          alt="Tocks Custom — mesas de sinuca artesanais"
          fill
          priority
          sizes="100vw"
          className="object-cover animate-[ken-burns_20s_ease-out_forwards]"
          quality={85}
        />
      )}

      {/* Cinematic overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-bg-primary" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.5))]" />
    </div>
  )
}
