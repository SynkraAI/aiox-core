'use client'

import { useState } from 'react'
import ScrollReveal from '@/components/animations/scroll-reveal'
import Breadcrumbs from '@/components/shared/breadcrumbs'
import Button from '@/components/ui/button'
import Icon from '@/components/ui/icon'
import { COMPANY } from '@/data/company'
import { PRODUCTS } from '@/data/products'
import { getWhatsAppUrlCustom } from '@/data/whatsapp'
import { trackEvent, trackWhatsAppClick } from '@/lib/analytics'

interface FormData {
  nome: string
  telefone: string
  modelo: string
  mensagem: string
}

const INITIAL_FORM: FormData = { nome: '', telefone: '', modelo: '', mensagem: '' }

const MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=Tocks+Custom+Itajai+SC'

interface ContactItem {
  label: string
  value: string
  icon: string
  href?: string
  cta?: string
  highlight?: boolean
}

const CONTACT_INFO: ContactItem[] = [
  {
    label: 'WhatsApp',
    value: COMPANY.phoneDisplay,
    icon: 'whatsapp',
    href: getWhatsAppUrlCustom('Olá! Gostaria de mais informações sobre as mesas Tocks.'),
    cta: 'Conversar no WhatsApp',
    highlight: true,
  },
  {
    label: 'Email',
    value: COMPANY.email,
    icon: 'mail',
    href: `mailto:${COMPANY.email}`,
  },
  {
    label: 'Endereço',
    value: `${COMPANY.address.street} — ${COMPANY.address.city}, ${COMPANY.address.state}`,
    icon: 'map',
    href: MAPS_URL,
  },
  {
    label: 'Horário',
    value: 'Segunda a Sexta, 8h às 18h',
    icon: 'clock',
  },
]

const INPUT_CLS =
  'w-full bg-bg-card border border-border rounded-lg px-5 py-4 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent transition-colors duration-300'

export default function ContatoPage() {
  const [form, setForm] = useState<FormData>(INITIAL_FORM)
  const [sent, setSent] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  function validate(): boolean {
    const next: typeof errors = {}
    if (!form.nome.trim()) next.nome = 'Informe seu nome'
    if (!form.telefone.trim()) next.telefone = 'Informe seu telefone'
    if (!form.mensagem.trim()) next.mensagem = 'Escreva sua mensagem'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    trackEvent('contact_form_submit', { method: 'whatsapp', page: 'contato' })

    const modelText = form.modelo ? `\nModelo: ${form.modelo}` : ''
    const message = `Olá! Sou ${form.nome}.\nTelefone: ${form.telefone}${modelText}\n\n${form.mensagem}`
    const url = getWhatsAppUrlCustom(message)
    window.open(url, '_blank')
    setSent(true)
  }

  function update(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  return (
    <>
      {/* Breadcrumbs */}
      <div className="pt-28 px-6 max-w-6xl mx-auto">
        <Breadcrumbs items={[{ label: 'Contato' }]} />
      </div>

      {/* Hero */}
      <section className="relative pt-8 pb-20 px-6 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--color-accent-glow)_0%,transparent_70%)] pointer-events-none" />
        <span className="text-accent text-sm uppercase tracking-[0.3em] mb-6 block relative">
          Estamos aqui para você
        </span>
        <h1 className="font-heading text-5xl md:text-7xl lg:text-[5.5rem] font-semibold text-text-primary leading-[0.95] relative">
          Fale Conosco
        </h1>
        <p className="mt-6 text-lg md:text-xl text-text-secondary max-w-lg mx-auto relative">
          Nossos especialistas estão prontos para ajudar
        </p>
      </section>

      {/* Split: Form + Contact Info */}
      <section className="py-16 md:py-32 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 md:gap-24">
          {/* Form */}
          <ScrollReveal>
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-semibold text-text-primary mb-8">
                Envie sua mensagem
              </h2>

              {sent ? (
                <div className="bg-bg-card border border-accent/30 rounded-lg p-10 text-center">
                  <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4 text-accent">
                    <Icon name="check" size={28} />
                  </div>
                  <p className="font-heading text-2xl font-semibold text-accent">
                    Mensagem enviada!
                  </p>
                  <p className="text-text-secondary text-sm mt-3">
                    O WhatsApp foi aberto com sua mensagem. Responderemos em breve.
                  </p>
                  <button
                    onClick={() => { setSent(false); setForm(INITIAL_FORM) }}
                    className="mt-6 text-accent text-sm underline underline-offset-4 hover:text-accent-hover transition-colors cursor-pointer"
                  >
                    Enviar outra mensagem
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  {/* Nome */}
                  <div>
                    <label htmlFor="contact-nome" className="sr-only">Seu nome</label>
                    <input
                      id="contact-nome"
                      type="text"
                      placeholder="Seu nome *"
                      value={form.nome}
                      onChange={(e) => update('nome', e.target.value)}
                      className={INPUT_CLS}
                    />
                    {errors.nome && <span className="text-red-400 text-xs mt-1 block">{errors.nome}</span>}
                  </div>

                  {/* Telefone */}
                  <div>
                    <label htmlFor="contact-telefone" className="sr-only">Telefone</label>
                    <input
                      id="contact-telefone"
                      type="tel"
                      placeholder="Telefone *"
                      value={form.telefone}
                      onChange={(e) => update('telefone', e.target.value)}
                      className={INPUT_CLS}
                    />
                    {errors.telefone && <span className="text-red-400 text-xs mt-1 block">{errors.telefone}</span>}
                  </div>

                  {/* Modelo */}
                  <div>
                    <label htmlFor="contact-modelo" className="sr-only">Modelo de interesse</label>
                    <select
                      id="contact-modelo"
                      value={form.modelo}
                      onChange={(e) => update('modelo', e.target.value)}
                      className={`${INPUT_CLS} appearance-none cursor-pointer`}
                    >
                      <option value="">Modelo de interesse</option>
                      {PRODUCTS.map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                      <option value="Não sei ainda">Não sei ainda</option>
                    </select>
                  </div>

                  {/* Mensagem */}
                  <div>
                    <label htmlFor="contact-mensagem" className="sr-only">Sua mensagem</label>
                    <textarea
                      id="contact-mensagem"
                      placeholder="Sua mensagem *"
                      rows={5}
                      value={form.mensagem}
                      onChange={(e) => update('mensagem', e.target.value)}
                      className={`${INPUT_CLS} resize-none`}
                    />
                    {errors.mensagem && <span className="text-red-400 text-xs mt-1 block">{errors.mensagem}</span>}
                  </div>

                  <Button variant="primary" size="lg" className="w-full mt-2">
                    Enviar mensagem
                  </Button>
                </form>
              )}
            </div>
          </ScrollReveal>

          {/* Contact Info Cards */}
          <ScrollReveal delay={0.2}>
            <div className="space-y-6">
              <h2 className="font-heading text-2xl md:text-3xl font-semibold text-text-primary mb-8">
                Outros canais
              </h2>

              {CONTACT_INFO.map((info) => (
                <div
                  key={info.label}
                  className={`bg-bg-card border rounded-lg p-6 ${
                    info.highlight
                      ? 'border-whatsapp/30'
                      : 'border-border'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        info.highlight
                          ? 'bg-whatsapp/10 text-whatsapp'
                          : 'bg-accent/10 text-accent'
                      }`}
                    >
                      <Icon name={info.icon} size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-secondary text-xs uppercase tracking-wider">
                        {info.label}
                      </p>
                      <p className="text-text-primary text-sm mt-1 break-words">
                        {info.value}
                      </p>
                      {'cta' in info && info.cta && info.href && (
                        <Button
                          variant="whatsapp"
                          size="sm"
                          href={info.href}
                          onClick={() => trackWhatsAppClick('contato-card')}
                          className="mt-4"
                        >
                          <Icon name="whatsapp" size={16} />
                          {info.cta}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Map placeholder */}
      <section className="py-20 md:py-32 px-6 bg-bg-secondary border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal>
            <div>
              <div className="w-14 h-14 rounded-full border border-accent/30 flex items-center justify-center mx-auto mb-8 text-accent">
                <Icon name="map" size={24} />
              </div>
              <h2 className="font-heading text-2xl md:text-3xl font-semibold text-text-primary">
                Nosso Atelier
              </h2>
              <p className="mt-4 text-text-secondary text-lg">
                {COMPANY.address.street} — {COMPANY.address.city}, {COMPANY.address.state}
              </p>
              <p className="mt-1 text-text-secondary text-sm">
                CEP {COMPANY.address.postalCode}
              </p>
              <div className="mt-8">
                <Button
                  variant="secondary"
                  size="md"
                  href={MAPS_URL}
                >
                  <Icon name="map" size={18} />
                  Ver no Google Maps
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

    </>
  )
}
