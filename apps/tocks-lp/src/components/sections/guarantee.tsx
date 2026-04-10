import Icon from '@/components/ui/icon'

const GUARANTEES = [
  { icon: 'shield', text: '5 anos na estrutura + 2 anos em acessorios' },
  { icon: 'truck', text: 'Entrega com instalacao e nivelamento profissional' },
  { icon: 'hand', text: 'Suporte direto com quem fabricou sua mesa' },
  { icon: 'check', text: 'Troca ou reparo sem burocracia' },
] as const

export default function Guarantee() {
  return (
    <section className="py-24 md:py-32 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="w-20 h-20 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center mx-auto mb-8">
          <Icon name="shield" size={36} className="text-accent" />
        </div>

        <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-semibold">
          5 anos de <span className="text-accent">garantia.</span>
        </h2>
        <p className="mt-4 text-text-secondary text-lg max-w-xl mx-auto">
          Decadas de tradicao em marcenaria naval nos ensinaram a construir para durar.
          Se qualquer defeito estrutural aparecer em 5 anos, reparamos ou
          substituimos sem custo.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12 max-w-lg mx-auto">
          {GUARANTEES.map((g) => (
            <div key={g.text} className="flex items-center gap-3 text-left">
              <Icon name={g.icon} size={20} className="text-accent" />
              <span className="text-sm">{g.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
