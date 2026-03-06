import { Card, CardContent } from '@ciclo/ui'

export default function ProdutosPage() {
  return (
    <div>
      <h1 className="text-2xl font-heading font-semibold text-base-dark">
        Produtos
      </h1>
      <p className="mt-1 text-sm text-base-dark/60">
        Passaportes, guias e outros produtos
      </p>

      <Card className="mt-6 border-base-gold/10">
        <CardContent className="flex items-center justify-center py-16">
          <p className="text-base-dark/40">
            Gestão de produtos em breve &mdash; implementado na E2.5
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
