import { Heading } from '@/components/atoms/heading'
import { Text } from '@/components/atoms/text'

interface PageLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  variant?: 'default' | 'concierge'
}

export function PageLayout({
  children,
  title,
  subtitle,
  variant = 'default',
}: PageLayoutProps) {
  if (variant === 'concierge') {
    return (
      <main className="pt-32 pb-24">
        <div className="max-w-[720px] mx-auto px-6">
          <div className="text-center mb-14">
            <Heading as="h1" className="mb-4">
              {title}
            </Heading>
            {subtitle && <Text className="text-lg">{subtitle}</Text>}
            <div className="gold-separator gold-separator-draw mt-8 mx-auto" />
          </div>
          {children}
        </div>
      </main>
    )
  }

  return (
    <main className="pt-32 pb-20">
      <div className="container-custom">
        <div className="max-w-3xl mb-16">
          <Heading as="h1" className="mb-4">
            {title}
          </Heading>
          {subtitle && <Text className="text-lg">{subtitle}</Text>}
          <div className="gold-separator gold-separator-draw mt-8" />
        </div>
        {children}
      </div>
    </main>
  )
}
