import { Card, CardContent } from '@ciclo/ui'

export default function ConfiguraçõesPage() {
  return (
    <div>
      <h1 className="text-2xl font-heading font-semibold text-base-dark">
        Configurações
      </h1>
      <p className="mt-1 text-sm text-base-dark/60">
        Configurações gerais do sistema
      </p>

      <Card className="mt-6 border-base-gold/10">
        <CardContent className="flex items-center justify-center py-16">
          <p className="text-base-dark/40">
            Configurações em breve &mdash; implementado na E4.2
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
