'use client'

import { useState } from 'react'

import type { FAQ } from '@/types'

export default function FaqAccordion({ items }: { items: FAQ[] }) {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isOpen = openId === item.id
        return (
          <div key={item.id} className="border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-bg-secondary/50 transition-colors duration-300"
              aria-expanded={isOpen}
            >
              <span className="font-heading text-lg font-medium text-text-primary pr-4">
                {item.question}
              </span>
              <span className={`text-accent text-xl shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>
                +
              </span>
            </button>
            {isOpen && (
              <div className="px-6 pb-5">
                <p className="text-text-secondary text-sm leading-relaxed">
                  {item.answer}
                </p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
