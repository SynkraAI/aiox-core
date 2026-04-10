'use client'

import { useRef, useEffect, useState } from 'react'

interface HeroVideoProps {
  videoSrc?: string
  fallbackImage: string
}

export default function HeroVideo({ videoSrc, fallbackImage }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoLoaded, setVideoLoaded] = useState(false)

  useEffect(() => {
    if (!videoRef.current || !videoSrc) return
    const video = videoRef.current
    const handleCanPlay = () => setVideoLoaded(true)
    video.addEventListener('canplay', handleCanPlay)
    return () => video.removeEventListener('canplay', handleCanPlay)
  }, [videoSrc])

  return (
    <div className="absolute inset-0">
      {/* Video layer */}
      {videoSrc && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            videoLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}

      {/* Fallback image — shown while video loads or if no video */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${
          videoLoaded ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <img
          src={fallbackImage}
          alt=""
          className="w-full h-full object-cover animate-[ken-burns_20s_ease-out_forwards]"
        />
      </div>

      {/* Cinematic overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-[var(--color-bg-primary)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.5))]" />
    </div>
  )
}
