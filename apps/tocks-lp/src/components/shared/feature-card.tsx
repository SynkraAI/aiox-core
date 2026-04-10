import type { Feature } from '@/types'
import Icon from '@/components/ui/icon'

interface FeatureCardProps {
  feature: Feature
}

export default function FeatureCard({ feature }: FeatureCardProps) {
  return (
    <div className="flex flex-col items-center text-center p-6">
      <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-4">
        <Icon name={feature.icon} size={24} className="text-accent" />
      </div>
      <h3 className="font-heading text-xl font-semibold mb-2">{feature.title}</h3>
      <p className="text-text-secondary text-sm leading-relaxed">
        {feature.description}
      </p>
    </div>
  )
}
