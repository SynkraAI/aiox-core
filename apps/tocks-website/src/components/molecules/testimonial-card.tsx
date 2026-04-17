import { Text } from '@/components/atoms/text'
import type { Testimonial } from '@/data/testimonials'

interface TestimonialCardProps {
  testimonial: Testimonial
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <div className="bg-[var(--surface)] rounded-[8px] p-8 flex flex-col">
      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <span key={i} className="text-[var(--accent-gold)] text-sm">
            &#9733;
          </span>
        ))}
      </div>

      {/* Quote */}
      <Text className="flex-1 mb-6 italic">
        &ldquo;{testimonial.text}&rdquo;
      </Text>

      {/* Author */}
      <div className="border-t border-[var(--surface-hover)] pt-4">
        <span className="block font-display text-sm font-medium text-[var(--text-primary)]">
          {testimonial.name}
        </span>
        <span className="block font-body text-xs text-[var(--text-secondary)]">
          {testimonial.location} &middot; {testimonial.product}
        </span>
      </div>
    </div>
  )
}
