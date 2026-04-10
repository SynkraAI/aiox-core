import FeatureCard from '@/components/shared/feature-card'
import { FEATURES } from '@/data/features'

export default function TrustBar() {
  return (
    <section className="py-12 md:py-16 border-y border-border bg-bg-secondary/50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  )
}
