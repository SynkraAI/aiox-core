'use client'

import { useState, useRef, useEffect } from 'react'
import type { FAQ } from '@/types'
import { cn } from '@/lib/utils'
import Icon from '@/components/ui/icon'

interface FaqItemProps {
  faq: FAQ
}

export default function FaqItem({ faq }: FaqItemProps) {
  const [isOpen, setIsOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight)
    }
  }, [isOpen])

  return (
    <div className="border-b border-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-5 text-left cursor-pointer group"
      >
        <span className="text-text-primary font-medium pr-4 transition-colors duration-300 group-hover:text-accent">
          {faq.question}
        </span>
        <span
          className={cn(
            'shrink-0 transition-transform duration-500',
            isOpen && 'rotate-180'
          )}
          style={{ transitionTimingFunction: 'var(--ease-luxury)' }}
        >
          <Icon name="chevron" size={20} className="text-accent" />
        </span>
      </button>
      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-500"
        style={{
          maxHeight: isOpen ? `${height}px` : '0px',
          opacity: isOpen ? 1 : 0,
          transitionTimingFunction: 'var(--ease-luxury)',
        }}
      >
        <p className="text-text-secondary text-sm leading-relaxed pb-5">{faq.answer}</p>
      </div>
    </div>
  )
}
