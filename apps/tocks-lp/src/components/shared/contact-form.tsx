'use client'

import { useState } from 'react'
import Button from '@/components/ui/button'
import { trackEvent } from '@/lib/analytics'

interface FormData {
  nome: string
  email: string
  telefone: string
  mensagem: string
}

const INITIAL_FORM: FormData = { nome: '', email: '', telefone: '', mensagem: '' }

export default function ContactForm() {
  const [form, setForm] = useState<FormData>(INITIAL_FORM)
  const [sent, setSent] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  function validate(): boolean {
    const next: typeof errors = {}
    if (!form.nome.trim()) next.nome = 'Informe seu nome'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Email invalido'
    if (!form.mensagem.trim()) next.mensagem = 'Escreva sua mensagem'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    trackEvent('contact_form_submit', { method: 'mailto' })
    const subject = encodeURIComponent(`Contato Tocks - ${form.nome}`)
    const body = encodeURIComponent(
      `Nome: ${form.nome}\nEmail: ${form.email}\nTelefone: ${form.telefone || 'Nao informado'}\n\n${form.mensagem}`
    )
    window.open(`mailto:contato@tockscustom.com.br?subject=${subject}&body=${body}`, '_self')
    setSent(true)
  }

  const inputCls = 'w-full bg-bg-card border border-border rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent transition-colors'

  if (sent) {
    return (
      <div className="text-center py-6">
        <p className="text-accent font-heading text-xl">Mensagem preparada!</p>
        <p className="text-text-secondary text-sm mt-2">Seu cliente de email foi aberto. Caso nao tenha funcionado, envie para contato@tockscustom.com.br</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto flex flex-col gap-3 text-left">
      <input className={inputCls} placeholder="Nome *" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
      {errors.nome && <span className="text-red-400 text-xs -mt-2">{errors.nome}</span>}
      <input className={inputCls} placeholder="Email *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      {errors.email && <span className="text-red-400 text-xs -mt-2">{errors.email}</span>}
      <input className={inputCls} placeholder="Telefone (opcional)" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
      <textarea className={`${inputCls} resize-none h-24`} placeholder="Sua mensagem *" value={form.mensagem} onChange={(e) => setForm({ ...form, mensagem: e.target.value })} />
      {errors.mensagem && <span className="text-red-400 text-xs -mt-2">{errors.mensagem}</span>}
      <Button variant="primary" size="md" className="w-full mt-1">Enviar mensagem</Button>
    </form>
  )
}
