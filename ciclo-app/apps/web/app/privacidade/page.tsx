import type { Metadata } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://ciclodasestações.com.br'

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description: 'Politica de privacidade do Ciclo das Estações — Base Tríade. LGPD, dados coletados, finalidade e seus direitos.',
  alternates: {
    canonical: `${BASE_URL}/privacidade`,
  },
}

export default function PrivacidadePage() {
  return (
    <div className="px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
          Política de Privacidade
        </h1>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
          <p>
            A Base Tríade se compromete com a proteção dos seus dados pessoais, em
            conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018).
          </p>
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Dados Coletados
          </h2>
          <p>
            Coletamos nome, email e preferências de estações de interesse quando você
            preenche o formulário de interesse. Dados de UTM (origem do acesso) sao
            coletados automaticamente para fins de análise de marketing.
          </p>
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Finalidade
          </h2>
          <p>
            Seus dados sao utilizados exclusivamente para envio de informações sobre
            eventos do Ciclo das Estações e comunicações relacionadas ao programa.
          </p>
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Seus Direitos
          </h2>
          <p>
            Você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer
            momento através do email contato@basetriade.com.
          </p>
          <p className="mt-8 text-xs">
            Ultima atualização: Março de 2026
          </p>
        </div>
      </div>
    </div>
  )
}
