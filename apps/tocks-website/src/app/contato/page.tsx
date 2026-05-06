import type { Metadata } from 'next'
import { PageLayout } from '@/components/templates/page-layout'
import { ConciergeForm } from '@/components/organisms/concierge-form'
import { FaqItem } from '@/components/molecules/faq-item'
import { Heading } from '@/components/atoms/heading'
import { Text } from '@/components/atoms/text'
import { WhatsAppCTA } from '@/components/molecules/whatsapp-cta'
import { BRAND_COPY, CONTACT_EMAIL } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Contato',
  description: 'Fale com o Atelier Tocks Custom. Solicite sua criacao sob medida.',
}

const FAQ_ITEMS = [
  { q: 'Como funciona o processo de criacao?', a: 'Cada peca nasce de uma conversa. Apos o briefing, enviamos um projeto em 3D, cronograma e orcamento detalhado. A producao so inicia apos sua aprovacao.' },
  { q: 'Qual o prazo de entrega?', a: 'O prazo varia de 45 a 90 dias, conforme o modelo e as personalizacoes escolhidas. Cada mesa e construida sob demanda no Atelier em Itajai.' },
  { q: 'Qual a garantia das pecas?', a: 'Cinco anos de garantia na estrutura, 2 anos em acabamento e garantia vitalicia na ardosia.' },
  { q: 'Entregam em todo o Brasil?', a: 'Sim. Realizamos entregas em todo territorio nacional com transporte especializado e montagem inclusa.' },
  { q: 'Qual a faixa de investimento?', a: 'Nossas pecas partem de R$ 10.990. O valor final depende das personalizacoes, madeira escolhida e dimensoes.' },
] as const

export default function ContatoPage() {
  return (
    <PageLayout
      title="Comece sua criacao"
      subtitle="Uma conversa sob medida com nosso Atelier."
      variant="concierge"
    >
      <div className="flex flex-col gap-16">
        <ConciergeForm />

        <div className="text-center flex flex-col items-center gap-6">
          <Text variant="label">Prefere conversar agora?</Text>
          <WhatsAppCTA variant="inline" label="Abrir WhatsApp" />
        </div>

        <div className="text-center">
          <Text variant="caption" className="text-[var(--text-primary)]">
            Atelier em Itajai, SC
          </Text>
          <Text variant="caption">E-mail: {CONTACT_EMAIL}</Text>
        </div>

        <section>
          <div className="text-center mb-10">
            <Text variant="label" className="mb-3">FAQ</Text>
            <Heading as="h2" className="!text-3xl md:!text-4xl">
              {BRAND_COPY.faq.headline}
            </Heading>
          </div>
          <div>
            {FAQ_ITEMS.map((item) => (
              <FaqItem key={item.q} question={item.q} answer={item.a} />
            ))}
          </div>
        </section>
      </div>
    </PageLayout>
  )
}
