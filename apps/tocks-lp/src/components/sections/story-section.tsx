import SectionHeader from '@/components/shared/section-header'
import ProcessStepCard from '@/components/shared/process-step'
import { PROCESS_STEPS } from '@/data/process-steps'

export default function StorySection() {
  return (
    <section className="py-24 md:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          badge="Nossa historia"
          title="Tres geracoes. Uma tradicao."
          subtitle="Em 1988, Milton de Cerqueira fundou a Tocks em Itajai, SC. A arte da marcenaria veio de seu pai, Martinho de Cerqueira, carpinteiro respeitado na regiao. No inicio, Milton alugava mesas para bares. Em 1999, passou a vender direto ao consumidor. Em 2015, sua filha e genro modernizaram a operacao, unindo tradicao artesanal a tecnologia. Sao mais de 35 anos de trabalho manual — cada mesa leva semanas para ficar pronta. E por isso que nenhuma delas e igual."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-6">
          {PROCESS_STEPS.map((step, i) => (
            <ProcessStepCard
              key={step.id}
              processStep={step}
              isLast={i === PROCESS_STEPS.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
