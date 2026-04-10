import SectionHeader from '@/components/shared/section-header'
import TestimonialCard from '@/components/shared/testimonial-card'
import { TESTIMONIALS } from '@/data/testimonials'

export default function SocialProof() {
  return (
    <section className="py-24 md:py-32 px-6 bg-bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          badge="Clientes satisfeitos"
          title="Quem tem, recomenda"
          subtitle="Familias em todo o Brasil ja transformaram seus espacos com uma mesa Tocks."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TESTIMONIALS.map((t) => (
            <TestimonialCard key={t.id} testimonial={t} />
          ))}
        </div>
      </div>
    </section>
  )
}
