import type { Testimonial } from '@/types'
import Icon from '@/components/ui/icon'

interface TestimonialCardProps {
  testimonial: Testimonial
}

export default function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <div className="bg-bg-card border border-border rounded-2xl p-6 flex flex-col relative overflow-hidden">
      {/* Accent top border line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
      {/* Large decorative quotation mark */}
      <span
        className="absolute top-4 right-5 font-heading text-[5rem] leading-none text-accent/[0.07] select-none pointer-events-none"
        aria-hidden="true"
      >
        &ldquo;
      </span>
      <Icon name="quote" size={28} className="text-accent/40 mb-4" />
      <p className="text-text-primary text-sm leading-relaxed flex-1">
        &ldquo;{testimonial.text}&rdquo;
      </p>
      <div className="mt-6 flex items-center gap-2">
        <div className="flex gap-0.5">
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <Icon key={i} name="star" size={14} className="text-accent fill-accent" />
          ))}
        </div>
      </div>
      <div className="mt-2">
        <p className="text-text-primary font-medium text-sm">{testimonial.name}</p>
        <p className="text-text-secondary text-xs">
          {testimonial.city} &middot; Mesa {testimonial.model}
        </p>
      </div>
    </div>
  )
}
