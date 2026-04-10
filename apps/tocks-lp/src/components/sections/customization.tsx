'use client'

import { useState } from 'react'
import Image from 'next/image'
import SectionHeader from '@/components/shared/section-header'
import TabButton from '@/components/shared/tab-button'
import Button from '@/components/ui/button'
import Icon from '@/components/ui/icon'
import { getWhatsAppDefault } from '@/data/whatsapp'
import { trackWhatsAppClick } from '@/lib/analytics'
import { WOOD_FINISHES, FABRIC_FINISHES } from '@/data/finishes'

type TabKey = 'wood' | 'fabric'

const CUSTOMIZATION_OPTIONS = [
  { icon: 'tree', label: 'Tipo de madeira' },
  { icon: 'palette', label: 'Cor do pano' },
  { icon: 'hand', label: 'Acabamento' },
  { icon: 'star', label: 'Projeto 3D gratis' },
] as const

export default function Customization() {
  const [activeTab, setActiveTab] = useState<TabKey>('wood')
  const swatches = activeTab === 'wood' ? WOOD_FINISHES : FABRIC_FINISHES

  return (
    <section className="py-24 md:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex gap-3 mb-8">
              <TabButton label="Madeiras" active={activeTab === 'wood'} onClick={() => setActiveTab('wood')} />
              <TabButton label="Tecidos" active={activeTab === 'fabric'} onClick={() => setActiveTab('fabric')} />
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
              {swatches.map((swatch) => (
                <div key={swatch.name} className="group cursor-pointer text-center">
                  <div className="min-w-[44px] min-h-[44px] w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-border group-hover:border-accent transition-colors mx-auto">
                    <Image src={swatch.image} alt={swatch.name} width={64} height={64} className="object-cover w-full h-full" />
                  </div>
                  <span className="text-[10px] md:text-xs text-text-secondary mt-2 block leading-tight">{swatch.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionHeader
              badge="Personalizacao"
              title="Sua mesa, do seu jeito"
              subtitle="Escolha cada detalhe — madeira, acabamento, tecido e dimensoes. Receba o projeto 3D gratuito antes de aprovar."
              centered={false}
            />
            <div className="grid grid-cols-2 gap-4 mb-8">
              {CUSTOMIZATION_OPTIONS.map((opt) => (
                <div key={opt.label} className="flex items-center gap-3 p-3 bg-bg-card rounded-lg border border-border">
                  <Icon name={opt.icon} size={20} className="text-accent" />
                  <span className="text-sm">{opt.label}</span>
                </div>
              ))}
            </div>
            <Button variant="whatsapp" size="lg" href={getWhatsAppDefault()} onClick={() => trackWhatsAppClick('customization')}>
              <Icon name="whatsapp" size={20} />
              Montar minha mesa
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
