'use client'

import * as React from 'react'
import { cn } from '../../lib/utils'

interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

function Sheet({ open, onOpenChange, children }: SheetProps) {
  // Close on Escape
  React.useEffect(() => {
    if (!open) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onOpenChange(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    // Prevent body scroll when open
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onOpenChange])

  if (!open) return null

  return <>{children}</>
}

interface SheetOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  onClose: () => void
}

function SheetOverlay({ onClose, className, ...props }: SheetOverlayProps) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 bg-black/50 animate-in fade-in-0',
        className,
      )}
      onClick={onClose}
      aria-hidden="true"
      {...props}
    />
  )
}

type SheetSide = 'left' | 'right'

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: SheetSide
  onClose: () => void
}

const sideStyles: Record<SheetSide, string> = {
  left: 'inset-y-0 left-0 border-r slide-in-from-left',
  right: 'inset-y-0 right-0 border-l slide-in-from-right',
}

function SheetContent({
  side = 'left',
  onClose,
  className,
  children,
  ...props
}: SheetContentProps) {
  return (
    <>
      <SheetOverlay onClose={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'fixed z-50 flex flex-col gap-4 bg-background p-6 shadow-lg transition-transform duration-300 ease-in-out',
          'w-3/4 max-w-sm',
          sideStyles[side],
          className,
        )}
        {...props}
      >
        {children}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Fechar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>
    </>
  )
}

export { Sheet, SheetContent, SheetOverlay }
export type { SheetProps, SheetContentProps }
