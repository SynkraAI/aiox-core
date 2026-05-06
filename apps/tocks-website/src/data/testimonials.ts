export interface Testimonial {
  id: string
  name: string
  location: string
  product: string
  text: string
  rating: number
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'dep-01',
    name: 'Ricardo M.',
    location: 'Sao Paulo, SP',
    product: 'Tenro Luxo',
    text: 'A mesa chegou exatamente como planejamos. Cada detalhe da madeira e impecavel. Meus convidados sempre perguntam onde encontrei uma peca assim.',
    rating: 5,
  },
  {
    id: 'dep-02',
    name: 'Fernanda L.',
    location: 'Florianopolis, SC',
    product: 'Curve',
    text: 'Procurei por meses uma mesa que combinasse com a arquitetura da casa. A Tocks entendeu o projeto e entregou algo que parece ter sido feito junto com a casa.',
    rating: 5,
  },
  {
    id: 'dep-03',
    name: 'Carlos A.',
    location: 'Curitiba, PR',
    product: 'Gabe',
    text: 'Tenho a Gabe ha tres anos e ela permanece impecavel. A qualidade da ardosia e do acabamento e visivel a cada jogo.',
    rating: 5,
  },
  {
    id: 'dep-04',
    name: 'Marina S.',
    location: 'Brasilia, DF',
    product: 'Ark',
    text: 'A Ark transformou completamente nosso espaco de lazer. Os entalhes sao verdadeiras obras de arte. Vale cada centavo do investimento.',
    rating: 5,
  },
  {
    id: 'dep-05',
    name: 'Eduardo P.',
    location: 'Balneario Camboriu, SC',
    product: 'Nobus',
    text: 'Queria um pebolim que nao parecesse brinquedo. O Nobus e uma peca de mobiliario serio que por acaso e tambem o melhor pebolim que ja joguei.',
    rating: 5,
  },
  {
    id: 'dep-06',
    name: 'Patricia R.',
    location: 'Rio de Janeiro, RJ',
    product: 'Vertice',
    text: 'O design angular da Vertice e exatamente o que nosso escritorio de arquitetura precisava. Funcional para jogar, impressionante para exibir.',
    rating: 5,
  },
  {
    id: 'dep-07',
    name: 'Joao V.',
    location: 'Porto Alegre, RS',
    product: 'Elipse',
    text: 'Achei que nao conseguiria uma mesa de qualidade para meu apartamento. A Elipse provou que espaco compacto nao significa abrir mao de excelencia.',
    rating: 5,
  },
] as const
