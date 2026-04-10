import SectionHeader from '@/components/shared/section-header'
import FaqItem from '@/components/shared/faq-item'
import { FAQ_ITEMS } from '@/data/faq'

export default function FaqSection() {
  return (
    <section className="py-24 md:py-32 px-6 bg-bg-secondary/30">
      <div className="max-w-3xl mx-auto">
        <SectionHeader
          badge="Duvidas frequentes"
          title="Perguntas e respostas"
          subtitle="Tudo que voce precisa saber antes de escolher sua mesa."
        />

        <div className="divide-y divide-border border-t border-border">
          {FAQ_ITEMS.map((faq) => (
            <FaqItem key={faq.id} faq={faq} />
          ))}
        </div>
      </div>
    </section>
  )
}
