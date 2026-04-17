import { TestimonialCard } from '@/components/molecules/testimonial-card'
import { TESTIMONIALS } from '@/data/testimonials'

export function TestimonialCarousel() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {TESTIMONIALS.slice(0, 3).map((testimonial) => (
        <TestimonialCard key={testimonial.id} testimonial={testimonial} />
      ))}
    </div>
  )
}
