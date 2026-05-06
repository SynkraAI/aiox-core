export interface ProductSpec {
  dimensions: string
  weight: string
  materials: string[]
  playField: string
  cloth: string
}

// NOTE S-8.3: ProductProvenance — dossier arquivistico tufteano (Fase 4a master-plan).
// Campos origem madeira + timeline criacao + serie + isometric.
// Valores em cada produto sao PLACEHOLDERS plausiveis — validar com atelier
// antes de producao (S-8.6 QA ou Fase atelier handoff).
export interface ProductProvenance {
  woodOrigin: { species: string; region: string }
  timeline: { designed: string; milled: string; finished: string; deliveredEst: string }
  serieNumber: { current: number; total: number }
  isometricSvgPath?: string
}

export interface Product {
  id: string
  slug: string
  name: string
  tagline: string
  description: string
  price: number
  formattedPrice: string
  category: 'bilhar' | 'pebolim'
  specs: ProductSpec
  images: string[]
  features: string[]
  customizationOptions: string[]
  isNew: boolean
  // NOTE S-8.3: provenance placeholders — validar com atelier antes de producao
  provenance: ProductProvenance
}

export const PRODUCTS: Product[] = [
  {
    id: 'tenro-luxo',
    slug: 'tenro-luxo',
    name: 'Tenro Luxo',
    tagline: 'Elegancia em estado puro',
    description:
      'A Tenro Luxo e a expressao maxima da marcenaria artesanal. Linhas retas e acabamento impecavel em madeira macica de reflorestamento. Projetada para ambientes sofisticados que exigem uma peca de destaque.',
    price: 19900,
    formattedPrice: 'R$ 19.900',
    category: 'bilhar',
    specs: {
      dimensions: '2.54m x 1.42m x 0.82m',
      weight: '380kg',
      materials: ['Madeira macica de reflorestamento', 'Pedra ardosia natural', 'Tecido importado'],
      playField: 'Ardosia italiana 25mm',
      cloth: 'Simonis 860',
    },
    images: ['/images/products/tenro-luxo-01.jpg'],
    features: [
      'Pes torneados em madeira macica',
      'Sistema de nivelamento de precisao',
      'Bolsos em couro legitimo',
      'Acabamento em verniz PU acetinado',
    ],
    customizationOptions: [
      'Cor da madeira',
      'Cor do tecido',
      'Tipo de pe',
      'Gravacao personalizada',
    ],
    isNew: false,
    provenance: {
      woodOrigin: { species: 'Peroba Rosa', region: 'MT' },
      timeline: {
        designed: 'Abr 2024',
        milled: 'Jul 2024',
        finished: 'Nov 2024',
        deliveredEst: 'Fev 2025',
      },
      serieNumber: { current: 3, total: 8 },
    },
  },
  {
    id: 'gabe',
    slug: 'gabe',
    name: 'Gabe',
    tagline: 'Robustez encontra refinamento',
    description:
      'A Gabe une presenca imponente a detalhes minimalistas. Sua estrutura reforçada garante durabilidade por geracoes, enquanto o design limpo se adapta a qualquer ambiente.',
    price: 16900,
    formattedPrice: 'R$ 16.900',
    category: 'bilhar',
    specs: {
      dimensions: '2.54m x 1.42m x 0.82m',
      weight: '350kg',
      materials: ['Madeira macica de reflorestamento', 'Pedra ardosia', 'Tecido profissional'],
      playField: 'Ardosia 25mm',
      cloth: 'Tecido profissional premium',
    },
    images: ['/images/products/gabe-01.jpg'],
    features: [
      'Design minimalista contemporaneo',
      'Estrutura reforçada dupla',
      'Sistema de retorno de bolas',
      'Acabamento laca acetinada',
    ],
    customizationOptions: ['Cor da madeira', 'Cor do tecido', 'Dimensoes sob medida'],
    isNew: false,
    provenance: {
      woodOrigin: { species: 'Ipe', region: 'PA' },
      timeline: {
        designed: 'Mai 2024',
        milled: 'Ago 2024',
        finished: 'Dez 2024',
        deliveredEst: 'Mar 2025',
      },
      serieNumber: { current: 2, total: 6 },
    },
  },
  {
    id: 'ark',
    slug: 'ark',
    name: 'Ark',
    tagline: 'O classico reinventado',
    description:
      'Inspirada nos saloes europeus do seculo XIX, a Ark traz entalhes artesanais e detalhes em dourado que remetem a uma era de opulencia discreta. Cada peca leva mais de 200 horas de trabalho manual.',
    price: 18500,
    formattedPrice: 'R$ 18.500',
    category: 'bilhar',
    specs: {
      dimensions: '2.54m x 1.42m x 0.84m',
      weight: '400kg',
      materials: ['Madeira macica selecionada', 'Pedra ardosia premium', 'Detalhes folheados a ouro'],
      playField: 'Ardosia italiana 30mm',
      cloth: 'Simonis 760',
    },
    images: ['/images/products/ark-01.jpg'],
    features: [
      'Entalhes artesanais exclusivos',
      'Detalhes folheados a ouro',
      'Pes esculpidos a mao',
      'Couro natural nos bolsos',
    ],
    customizationOptions: [
      'Tonalidade da madeira',
      'Padrao de entalhe',
      'Cor do tecido',
      'Tipo de acabamento',
    ],
    isNew: false,
    provenance: {
      woodOrigin: { species: 'Jatoba', region: 'BA' },
      timeline: {
        designed: 'Jan 2024',
        milled: 'Abr 2024',
        finished: 'Set 2024',
        deliveredEst: 'Dez 2024',
      },
      serieNumber: { current: 1, total: 4 },
    },
  },
  {
    id: 'vertice',
    slug: 'vertice',
    name: 'Vertice',
    tagline: 'Geometria com alma',
    description:
      'A Vertice explora angulos e proporcoes com precisao milimetrica. Seu design angular cria um contraste visual marcante, ideal para ambientes de arquitetura moderna.',
    price: 15900,
    formattedPrice: 'R$ 15.900',
    category: 'bilhar',
    specs: {
      dimensions: '2.40m x 1.35m x 0.82m',
      weight: '320kg',
      materials: ['Madeira macica', 'Pedra ardosia', 'Aço escovado'],
      playField: 'Ardosia 25mm',
      cloth: 'Tecido profissional',
    },
    images: ['/images/products/vertice-01.jpg'],
    features: [
      'Design angular exclusivo',
      'Detalhes em aco escovado',
      'Sistema de nivelamento fino',
      'Iluminacao LED opcional',
    ],
    customizationOptions: ['Cor da madeira', 'Cor do tecido', 'Acabamento metalico', 'LED integrado'],
    isNew: true,
    provenance: {
      woodOrigin: { species: 'Sucupira', region: 'RO' },
      timeline: {
        designed: 'Jul 2024',
        milled: 'Out 2024',
        finished: 'Fev 2025',
        deliveredEst: 'Mai 2025',
      },
      serieNumber: { current: 1, total: 5 },
    },
  },
  {
    id: 'curve',
    slug: 'curve',
    name: 'Curve',
    tagline: 'Fluidez em cada linha',
    description:
      'A Curve desafia a rigidez com formas organicas suaves. Bordas arredondadas e transicoes delicadas fazem desta mesa uma escultura funcional que convida ao toque.',
    price: 14900,
    formattedPrice: 'R$ 14.900',
    category: 'bilhar',
    specs: {
      dimensions: '2.40m x 1.35m x 0.80m',
      weight: '310kg',
      materials: ['Madeira macica curvada', 'Pedra ardosia', 'Tecido premium'],
      playField: 'Ardosia 25mm',
      cloth: 'Tecido profissional premium',
    },
    images: ['/images/products/curve-01.jpg'],
    features: [
      'Bordas organicas curvadas',
      'Tecnica de curvatura em madeira macica',
      'Acabamento toque-seda',
      'Bolsos integrados ao design',
    ],
    customizationOptions: ['Tonalidade da madeira', 'Cor do tecido', 'Tipo de acabamento'],
    isNew: false,
    provenance: {
      woodOrigin: { species: 'Freijo', region: 'SC' },
      timeline: {
        designed: 'Fev 2024',
        milled: 'Jun 2024',
        finished: 'Out 2024',
        deliveredEst: 'Jan 2025',
      },
      serieNumber: { current: 2, total: 3 },
    },
  },
  {
    id: 'elipse',
    slug: 'elipse',
    name: 'Elipse',
    tagline: 'Onde forma e funcao se encontram',
    description:
      'A Elipse e a sintese do pensamento contemporaneo aplicado ao bilhar. Compacta sem perder a nobreza, ela se encaixa em espacos menores sem abrir mao da experiencia de jogo profissional.',
    price: 10990,
    formattedPrice: 'R$ 10.990',
    category: 'bilhar',
    specs: {
      dimensions: '2.20m x 1.22m x 0.80m',
      weight: '280kg',
      materials: ['Madeira macica', 'Pedra ardosia', 'Tecido profissional'],
      playField: 'Ardosia 20mm',
      cloth: 'Tecido profissional',
    },
    images: ['/images/products/elipse-01.jpg'],
    features: [
      'Formato compacto premium',
      'Ideal para espacos menores',
      'Acabamento acetinado',
      'Montagem facilitada',
    ],
    customizationOptions: ['Cor da madeira', 'Cor do tecido'],
    isNew: false,
    provenance: {
      woodOrigin: { species: 'Imbuia', region: 'RS' },
      timeline: {
        designed: 'Mar 2024',
        milled: 'Jun 2024',
        finished: 'Set 2024',
        deliveredEst: 'Dez 2024',
      },
      serieNumber: { current: 4, total: 7 },
    },
  },
  {
    id: 'nobus',
    slug: 'nobus',
    name: 'Nobus',
    tagline: 'Pebolim elevado a arte',
    description:
      'O Nobus redefine o pebolim com materiais nobres e acabamento de mesa de bilhar. Jogadores de aluminio fundido, campo de vidro temperado e estrutura em madeira macica.',
    price: 12900,
    formattedPrice: 'R$ 12.900',
    category: 'pebolim',
    specs: {
      dimensions: '1.50m x 0.90m x 0.90m',
      weight: '120kg',
      materials: ['Madeira macica', 'Aluminio fundido', 'Vidro temperado'],
      playField: 'Vidro temperado 8mm',
      cloth: 'N/A',
    },
    images: ['/images/products/nobus-01.jpg'],
    features: [
      'Jogadores em aluminio fundido',
      'Campo em vidro temperado',
      'Barras de aco cromado',
      'Placar integrado',
    ],
    customizationOptions: ['Cor da madeira', 'Cor dos jogadores', 'Gravacao personalizada'],
    isNew: false,
    provenance: {
      woodOrigin: { species: 'Cumaru', region: 'SP' },
      timeline: {
        designed: 'Jun 2024',
        milled: 'Ago 2024',
        finished: 'Nov 2024',
        deliveredEst: 'Fev 2025',
      },
      serieNumber: { current: 2, total: 6 },
    },
  },
  {
    id: 'rustic',
    slug: 'rustic',
    name: 'Rustic',
    tagline: 'O charme da imperfeicao intencional',
    description:
      'O Rustic celebra a madeira em seu estado mais autenticoco. Nos aparentes, textura natural preservada e acabamento que valoriza cada veiodo da madeira. Um pebolim com personalidade.',
    price: 10990,
    formattedPrice: 'R$ 10.990',
    category: 'pebolim',
    specs: {
      dimensions: '1.50m x 0.90m x 0.88m',
      weight: '110kg',
      materials: ['Madeira macica rustica', 'Aco carbono', 'MDF revestido'],
      playField: 'MDF revestido premium',
      cloth: 'N/A',
    },
    images: ['/images/products/rustic-01.jpg'],
    features: [
      'Acabamento rustico autenticoco',
      'Nos da madeira preservados',
      'Barras em aco carbono',
      'Design artesanal unico',
    ],
    customizationOptions: ['Nivel de rusticidade', 'Cor dos jogadores'],
    isNew: true,
    provenance: {
      woodOrigin: { species: 'Cedro', region: 'MG' },
      timeline: {
        designed: 'Mai 2024',
        milled: 'Jul 2024',
        finished: 'Nov 2024',
        deliveredEst: 'Jan 2025',
      },
      serieNumber: { current: 1, total: 4 },
    },
  },
] as const

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug)
}

export function getProductsByCategory(category: Product['category']): Product[] {
  return PRODUCTS.filter((p) => p.category === category)
}
