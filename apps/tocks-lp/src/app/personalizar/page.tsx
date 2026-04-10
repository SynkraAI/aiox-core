'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import ScrollReveal from '@/components/animations/scroll-reveal'
// TODO: Substituir por viewer 3D quando modelos profissionais estiverem prontos
// import BilliardTableViewer from '@/components/three/billiard-table-wrapper'
import Button from '@/components/ui/button'
import { PRODUCTS } from '@/data/products'
import { WOOD_FINISHES, FABRIC_FINISHES } from '@/data/finishes'
import type { Finish } from '@/data/finishes'
import { getWhatsAppUrlCustom } from '@/data/whatsapp'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/types'

const BILHAR_PRODUCTS = PRODUCTS

function FinishCircle({
  finish,
  selected,
  onSelect,
}: {
  finish: Finish
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className="group flex flex-col items-center gap-2"
      title={finish.name}
    >
      <div
        className={`
          relative w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden
          transition-all duration-300 ease-[var(--ease-luxury)]
          ${selected
            ? 'ring-2 ring-[var(--color-accent)] ring-offset-2 ring-offset-[var(--color-bg-primary)] scale-[1.15]'
            : 'ring-1 ring-[var(--color-border)] hover:ring-[var(--color-accent)]/50 hover:scale-105'
          }
        `}
      >
        <Image
          src={finish.image}
          alt={finish.name}
          fill
          sizes="64px"
          className="object-cover"
        />
      </div>
      <span
        className={`
          text-[10px] md:text-xs text-center leading-tight max-w-[72px] transition-colors duration-300
          ${selected ? 'text-[var(--color-accent)] font-medium' : 'text-[var(--color-text-secondary)]'}
        `}
      >
        {finish.name}
      </span>
    </button>
  )
}

function ProductThumb({
  product,
  selected,
  onSelect,
}: {
  product: Product
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={`
        relative aspect-[4/3] rounded-sm overflow-hidden
        transition-all duration-300 ease-[var(--ease-luxury)]
        ${selected
          ? 'ring-2 ring-[var(--color-accent)] ring-offset-2 ring-offset-[var(--color-bg-primary)] scale-[1.03]'
          : 'ring-1 ring-[var(--color-border)] hover:ring-[var(--color-accent)]/50 hover:scale-[1.02]'
        }
      `}
      title={product.name}
    >
      <Image
        src={product.image}
        alt={product.name}
        fill
        sizes="120px"
        className="object-cover"
      />
      <div
        className={`
          absolute inset-0 flex items-end p-2 transition-all duration-300
          ${selected ? 'bg-black/50' : 'bg-black/0 hover:bg-black/30'}
        `}
      >
        <span className="text-[10px] md:text-xs font-medium text-[var(--color-text-primary)] uppercase tracking-wider">
          {product.name}
        </span>
      </div>
    </button>
  )
}

function ConfigPreview({
  product,
  wood,
  fabric,
}: {
  product: Product
  wood: Finish
  fabric: Finish
}) {
  return (
    <div className="mt-6 rounded-sm border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5">
      <p className="text-xs uppercase tracking-widest text-[var(--color-accent)] mb-4 font-medium">
        Preview da sua configuracao
      </p>

      {/* Visual strip: wood swatch + product thumbnail + fabric swatch */}
      <div className="flex items-center justify-center gap-3 md:gap-5">
        {/* Wood swatch */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden ring-2 ring-[var(--color-accent)]/40">
            <Image
              src={wood.image}
              alt={wood.name}
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>
          <span className="text-[10px] text-[var(--color-text-secondary)]">{wood.name}</span>
        </div>

        {/* Connector line */}
        <div className="w-6 md:w-10 h-px bg-[var(--color-border)]" />

        {/* Product thumbnail */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="relative w-24 h-[72px] md:w-32 md:h-24 rounded-sm overflow-hidden ring-1 ring-[var(--color-border)]">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="128px"
              className="object-cover"
            />
          </div>
          <span className="text-[10px] text-[var(--color-text-secondary)]">{product.name}</span>
        </div>

        {/* Connector line */}
        <div className="w-6 md:w-10 h-px bg-[var(--color-border)]" />

        {/* Fabric swatch */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden ring-2 ring-[var(--color-accent)]/40">
            <Image
              src={fabric.image}
              alt={fabric.name}
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>
          <span className="text-[10px] text-[var(--color-text-secondary)]">{fabric.name}</span>
        </div>
      </div>

      {/* Description text */}
      <p className="mt-4 text-center text-sm text-[var(--color-text-secondary)]">
        Mesa <strong className="text-[var(--color-text-primary)]">{product.name}</strong> em{' '}
        <strong className="text-[var(--color-text-primary)]">{wood.name}</strong> com tecido{' '}
        <strong className="text-[var(--color-text-primary)]">{fabric.name}</strong>
      </p>

      {/* Price */}
      <p className="mt-2 text-center">
        <span className="text-xs text-[var(--color-text-secondary)]">A partir de </span>
        <span className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-[var(--color-accent)]">
          {formatPrice(product.price)}
        </span>
      </p>
      <p className="text-center text-xs text-[var(--color-text-secondary)] mt-0.5">
        ou 6x de {formatPrice(Math.ceil(product.price / 6))} sem juros
      </p>
    </div>
  )
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string
  title: string
  description: string
}) {
  return (
    <div className="text-center space-y-3">
      <div className="w-12 h-12 rounded-full border border-[var(--color-accent)] flex items-center justify-center mx-auto">
        <span className="font-[family-name:var(--font-heading)] text-lg text-[var(--color-accent)]">
          {number}
        </span>
      </div>
      <h3 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-text-primary)]">
        {title}
      </h3>
      <p className="text-sm text-[var(--color-text-secondary)] max-w-xs mx-auto">
        {description}
      </p>
    </div>
  )
}

export default function PersonalizarPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product>(BILHAR_PRODUCTS[0])
  const [selectedWood, setSelectedWood] = useState<Finish>(WOOD_FINISHES[0])
  const [selectedFabric, setSelectedFabric] = useState<Finish>(FABRIC_FINISHES[0])
  const whatsappUrl = useMemo(() => {
    return getWhatsAppUrlCustom(
      `Ola! Quero um orcamento para a mesa ${selectedProduct.name} com acabamento ${selectedWood.name} e tecido ${selectedFabric.name}.`
    )
  }, [selectedProduct.name, selectedWood.name, selectedFabric.name])

  function handleProductChange(product: Product) {
    setSelectedProduct(product)
  }

  return (
    <>
      {/* Hero */}
      <section className="pt-40 pb-16 px-6 text-center">
        <h1 className="font-[family-name:var(--font-heading)] text-5xl md:text-7xl font-semibold text-[var(--color-text-primary)] mb-4">
          Personalize Sua Mesa
        </h1>
        <p className="text-lg md:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto">
          Escolha cada detalhe. Visualize antes de aprovar.
        </p>
      </section>

      {/* Customizer */}
      <section className="max-w-7xl mx-auto px-6 pb-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

          {/* Left — Product Image + Preview (60%) */}
          <div className="lg:w-[60%]">
            <div className="sticky top-28 space-y-0">
              {/* Foto real do produto selecionado */}
              <div className="relative aspect-[4/3] rounded-sm overflow-hidden bg-[var(--color-bg-secondary)]">
                <Image
                  src={selectedProduct.image}
                  alt={`Mesa ${selectedProduct.name}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  priority
                  className="object-cover transition-opacity duration-500 ease-[var(--ease-luxury)]"
                />
                {/* Swatches selecionados no canto */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/60 shadow-lg">
                    <Image src={selectedWood.image} alt={selectedWood.name} fill sizes="40px" className="object-cover" />
                  </div>
                  <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/60 shadow-lg">
                    <Image src={selectedFabric.image} alt={selectedFabric.name} fill sizes="40px" className="object-cover" />
                  </div>
                </div>
                {/* Model label + price */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
                  <p className="font-[family-name:var(--font-heading)] text-2xl md:text-3xl font-semibold text-[var(--color-text-primary)]">
                    {selectedProduct.name}
                  </p>
                  <div className="flex items-baseline gap-3">
                    <p className="text-sm text-[var(--color-text-secondary)]">{selectedProduct.tagline}</p>
                    <p className="text-sm font-medium text-[var(--color-accent)]">{formatPrice(selectedProduct.price)}</p>
                  </div>
                </div>
              </div>

              {/* Configuration Preview */}
              <ConfigPreview
                product={selectedProduct}
                wood={selectedWood}
                fabric={selectedFabric}
              />
            </div>
          </div>

          {/* Right — Selection Panels (40%) */}
          <div className="lg:w-[40%] space-y-10">

            {/* Panel: Modelo */}
            <div>
              <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-text-primary)] mb-1">
                Escolha o modelo
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)] mb-4">
                {BILHAR_PRODUCTS.length} modelos disponiveis
              </p>
              <div className="grid grid-cols-3 gap-3">
                {BILHAR_PRODUCTS.map((product) => (
                  <ProductThumb
                    key={product.id}
                    product={product}
                    selected={selectedProduct.id === product.id}
                    onSelect={() => handleProductChange(product)}
                  />
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="section-divider" />

            {/* Panel: Acabamento em Madeira */}
            <div>
              <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-text-primary)] mb-1">
                Acabamento em madeira
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)] mb-4">
                {WOOD_FINISHES.length} acabamentos em madeira macica
              </p>
              <div className="flex flex-wrap gap-4">
                {WOOD_FINISHES.map((finish) => (
                  <FinishCircle
                    key={finish.name}
                    finish={finish}
                    selected={selectedWood.name === finish.name}
                    onSelect={() => setSelectedWood(finish)}
                  />
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="section-divider" />

            {/* Panel: Cor do Tecido */}
            <div>
              <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-text-primary)] mb-1">
                Cor do tecido
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)] mb-4">
                {FABRIC_FINISHES.length} cores de tecido profissional
              </p>
              <div className="flex flex-wrap gap-4">
                {FABRIC_FINISHES.map((finish) => (
                  <FinishCircle
                    key={finish.name}
                    finish={finish}
                    selected={selectedFabric.name === finish.name}
                    onSelect={() => setSelectedFabric(finish)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Summary Bar */}
      <div className="sticky bottom-0 z-40 border-t border-[var(--color-border)] bg-[var(--color-bg-primary)]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
            <span className="text-[var(--color-text-secondary)]">
              Modelo: <strong className="text-[var(--color-text-primary)]">{selectedProduct.name}</strong>
            </span>
            <span className="text-[var(--color-text-secondary)]">
              Madeira: <strong className="text-[var(--color-text-primary)]">{selectedWood.name}</strong>
            </span>
            <span className="text-[var(--color-text-secondary)]">
              Tecido: <strong className="text-[var(--color-text-primary)]">{selectedFabric.name}</strong>
            </span>
            <span className="text-[var(--color-accent)] font-medium">
              {formatPrice(selectedProduct.price)}
            </span>
          </div>
          <Button variant="whatsapp" size="md" href={whatsappUrl}>
            Solicitar Orcamento Personalizado
          </Button>
        </div>
      </div>

      {/* How It Works */}
      <section className="py-24 px-6">
        <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-5xl font-semibold text-center text-[var(--color-text-primary)] mb-16">
          Como funciona
        </h2>
        <ScrollReveal
          className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12"
          stagger={0.2}
        >
          <StepCard
            number="1"
            title="Escolha"
            description="Selecione modelo, madeira e tecido"
          />
          <StepCard
            number="2"
            title="Orcamento"
            description="Receba uma proposta personalizada"
          />
          <StepCard
            number="3"
            title="Aprovacao"
            description="Aprove e acompanhe a fabricacao"
          />
        </ScrollReveal>
      </section>

    </>
  )
}
