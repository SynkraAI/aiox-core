'use client'

import { useState } from 'react'
import {
  SeasonProvider,
  SeasonalButton,
  EventCard,
  FacilitatorAvatar,
  SeasonalBadge,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Badge,
  Avatar,
  AvatarFallback,
  Skeleton,
  type Season,
} from '@ciclo/ui'

const SEASONS: Season[] = ['primavera', 'verao', 'outono', 'inverno']

const SEASON_LABELS: Record<Season, string> = {
  primavera: 'Primavera',
  verao: 'Verão',
  outono: 'Outono',
  inverno: 'Inverno',
}

export default function DesignSystemPage() {
  const [activeSeason, setActiveSeason] = useState<Season>('primavera')

  return (
    <SeasonProvider forceSeason={activeSeason}>
      <div data-season={activeSeason} className="min-h-screen bg-background p-4 sm:p-8">
        <div className="mx-auto max-w-5xl space-y-12">
          {/* Header */}
          <header className="space-y-4">
            <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
              Design System — Ciclo das Estações
            </h1>
            <p className="font-body text-muted-foreground">
              Paleta sazonal dinâmica, componentes core e tipografia.
            </p>
          </header>

          {/* Season Switcher */}
          <section className="space-y-4">
            <h2 className="font-heading text-2xl font-semibold">Seletor de Estação</h2>
            <div className="flex flex-wrap gap-3">
              {SEASONS.map((season) => (
                <button
                  key={season}
                  onClick={() => setActiveSeason(season)}
                  className={`rounded-lg border-2 px-4 py-2 font-body text-sm font-medium transition-all ${
                    activeSeason === season
                      ? 'border-base-gold bg-base-gold/10 text-base-dark'
                      : 'border-border text-muted-foreground hover:border-base-gold/50'
                  }`}
                  aria-pressed={activeSeason === season}
                >
                  {SEASON_LABELS[season]}
                </button>
              ))}
            </div>
          </section>

          {/* Paleta de Cores */}
          <section className="space-y-4">
            <h2 className="font-heading text-2xl font-semibold">Paleta Sazonal</h2>
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
              <div className="space-y-2">
                <div className="h-16 rounded-lg bg-seasonal-primary transition-seasonal" />
                <p className="text-xs text-muted-foreground">Primary</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 rounded-lg bg-seasonal-secondary transition-seasonal" />
                <p className="text-xs text-muted-foreground">Secondary</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 rounded-lg bg-seasonal-accent transition-seasonal" />
                <p className="text-xs text-muted-foreground">Accent</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 rounded-lg bg-base-dark" />
                <p className="text-xs text-muted-foreground">Dark</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 rounded-lg bg-base-gold" />
                <p className="text-xs text-muted-foreground">Gold</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 rounded-lg bg-base-sienna" />
                <p className="text-xs text-muted-foreground">Sienna</p>
              </div>
            </div>
          </section>

          {/* Tipografia */}
          <section className="space-y-4">
            <h2 className="font-heading text-2xl font-semibold">Tipografia</h2>
            <div className="space-y-3 rounded-lg border border-border p-6">
              <h1 className="font-heading text-4xl">Playfair Display — Heading h1</h1>
              <h2 className="font-heading text-3xl">Playfair Display — Heading h2</h2>
              <h3 className="font-heading text-2xl">Playfair Display — Heading h3</h3>
              <h4 className="font-heading text-xl">Playfair Display — Heading h4</h4>
              <p className="font-body text-base">Inter — Body text (base)</p>
              <p className="font-body text-sm text-muted-foreground">Inter — Body text (small, muted)</p>
            </div>
          </section>

          {/* SeasonalButton */}
          <section className="space-y-4">
            <h2 className="font-heading text-2xl font-semibold">SeasonalButton</h2>
            <div className="flex flex-wrap gap-3">
              <SeasonalButton variant="primary">Primary</SeasonalButton>
              <SeasonalButton variant="secondary">Secondary</SeasonalButton>
              <SeasonalButton variant="outline">Outline</SeasonalButton>
              <SeasonalButton variant="ghost">Ghost</SeasonalButton>
            </div>
            <div className="flex flex-wrap gap-3">
              <SeasonalButton size="sm" variant="primary">Small</SeasonalButton>
              <SeasonalButton size="default" variant="primary">Default</SeasonalButton>
              <SeasonalButton size="lg" variant="primary">Large</SeasonalButton>
            </div>
            <div className="flex flex-wrap gap-3">
              <SeasonalButton variant="primary" disabled>Disabled</SeasonalButton>
            </div>
          </section>

          {/* shadcn/ui Button */}
          <section className="space-y-4">
            <h2 className="font-heading text-2xl font-semibold">Button (shadcn/ui)</h2>
            <div className="flex flex-wrap gap-3">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
          </section>

          {/* SeasonalBadge */}
          <section className="space-y-4">
            <h2 className="font-heading text-2xl font-semibold">SeasonalBadge</h2>
            <div className="flex flex-wrap gap-3">
              <SeasonalBadge variant="filled">{SEASON_LABELS[activeSeason]}</SeasonalBadge>
              <SeasonalBadge variant="outline">Outline</SeasonalBadge>
              <SeasonalBadge variant="soft">Soft</SeasonalBadge>
            </div>
          </section>

          {/* Badge (shadcn/ui) */}
          <section className="space-y-4">
            <h2 className="font-heading text-2xl font-semibold">Badge (shadcn/ui)</h2>
            <div className="flex flex-wrap gap-3">
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
          </section>

          {/* Input */}
          <section className="space-y-4">
            <h2 className="font-heading text-2xl font-semibold">Input</h2>
            <div className="max-w-sm space-y-3">
              <Input placeholder="Nome completo" />
              <Input type="email" placeholder="seu@email.com" />
              <Input disabled placeholder="Desabilitado" />
            </div>
          </section>

          {/* Card */}
          <section className="space-y-4">
            <h2 className="font-heading text-2xl font-semibold">Card (shadcn/ui)</h2>
            <Card className="max-w-sm">
              <CardHeader>
                <CardTitle>Ciclo da {SEASON_LABELS[activeSeason]}</CardTitle>
                <CardDescription>Imersão sazonal de autocuidado</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Programa de reconexão com a natureza e autocuidado cíclico.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Avatar */}
          <section className="space-y-4">
            <h2 className="font-heading text-2xl font-semibold">Avatar (shadcn/ui)</h2>
            <div className="flex gap-4">
              <Avatar size="sm">
                <AvatarFallback>DL</AvatarFallback>
              </Avatar>
              <Avatar size="md">
                <AvatarFallback>MK</AvatarFallback>
              </Avatar>
              <Avatar size="lg">
                <AvatarFallback>BT</AvatarFallback>
              </Avatar>
            </div>
          </section>

          {/* Skeleton */}
          <section className="space-y-4">
            <h2 className="font-heading text-2xl font-semibold">Skeleton</h2>
            <div className="max-w-sm space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </section>

          {/* EventCard */}
          <section className="space-y-4">
            <h2 className="font-heading text-2xl font-semibold">EventCard</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <EventCard
                title="Renascença"
                date="18 de Outubro 2026"
                element="Madeira"
                status="disponível"
                priceFrom={287}
              />
              <EventCard
                title="Solstício de Inverno"
                date="21 de Junho 2026"
                element="Água"
                status="esgotado"
                priceFrom={287}
              />
              <EventCard
                title="Equinócio de Outono"
                date="20 de Março 2026"
                element="Metal"
                status="em-breve"
                priceFrom={287}
              />
            </div>
          </section>

          {/* FacilitatorAvatar */}
          <section className="space-y-4">
            <h2 className="font-heading text-2xl font-semibold">FacilitatorAvatar</h2>
            <div className="flex flex-wrap gap-8">
              <FacilitatorAvatar
                name="Daniela Lopper"
                title="Podcaster e Terapeuta"
                specialty="Desenvolvimento Pessoal"
              />
              <FacilitatorAvatar
                name="Milena Koch"
                title="Terapeuta Holística"
                specialty="Processos Regenerativos"
              />
              <FacilitatorAvatar
                name="Lionara Artn"
                title="Instrutora"
                specialty="Yoga"
              />
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t border-border pt-8 text-center text-xs text-muted-foreground">
            Design System v1.0 — Ciclo das Estações — iAi &middot; ECOssistema Base Tríade&trade;
          </footer>
        </div>
      </div>
    </SeasonProvider>
  )
}
