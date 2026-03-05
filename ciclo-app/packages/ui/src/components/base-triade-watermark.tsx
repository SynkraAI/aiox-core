import type { HTMLAttributes } from 'react'
import { cn } from '../lib/utils'

interface BaseTriadeWatermarkProps extends HTMLAttributes<HTMLDivElement> {
  /** Opacidade da marca d'agua (5-8%) */
  opacity?: number
}

export function BaseTriadeWatermark({
  opacity = 0.06,
  className,
  ...props
}: BaseTriadeWatermarkProps) {
  const clampedOpacity = Math.min(0.08, Math.max(0.05, opacity))

  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-0 z-0 flex items-center justify-center print:hidden',
        className,
      )}
      style={{ opacity: clampedOpacity }}
      aria-hidden="true"
      {...props}
    >
      <svg
        viewBox="0 0 200 200"
        className="h-[min(60vw,600px)] w-[min(60vw,600px)] min-h-[200px] min-w-[200px]"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Triangulo Base Triade estilizado */}
        <polygon
          points="100,20 180,170 20,170"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-base-dark"
        />
        {/* Circulo interno */}
        <circle
          cx="100"
          cy="120"
          r="40"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-base-dark"
        />
        {/* Texto Base Triade */}
        <text
          x="100"
          y="195"
          textAnchor="middle"
          className="text-base-dark"
          style={{ fontSize: '12px', fontFamily: 'serif', letterSpacing: '3px' }}
        >
          BASE TRIADE
        </text>
      </svg>
    </div>
  )
}
