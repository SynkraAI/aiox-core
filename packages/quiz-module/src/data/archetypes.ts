import { ArchetypeDefinition } from '@/types/quiz';

export const ARCHETYPES: Record<string, ArchetypeDefinition> = {
  comunicador: {
    key: 'comunicador',
    name: 'O COMUNICADOR',
    tagline: 'Você transforma conhecimento em conexão',
    description:
      'Você é aquela pessoa que não consegue guardar uma boa ideia só pra si. Quando descobre algo, sua reação natural é compartilhar — e as pessoas ao redor percebem isso. Você tem o dom de traduzir coisas complexas em algo que qualquer um entende.',
    strengths: [
      'Comunicação clara e envolvente',
      'Capacidade de criar conexão rápida com audiência',
      'Habilidade natural para ensinar',
    ],
    idealModel: 'Criação de conteúdo e influência digital — YouTube, podcast, ou newsletter.',
    nextStep:
      'Escolha UM tema que você já domina e grave um vídeo de 3 minutos explicando para um amigo. Não publique. Apenas grave. Esse é o seu primeiro treino.',
    color: '#F97316',
  },
  mentor: {
    key: 'mentor',
    name: 'O MENTOR',
    tagline: 'Você enxerga o potencial antes dos outros',
    description:
      'Você tem um olhar raro: consegue enxergar o que os outros podem se tornar antes mesmo deles perceberem. Sua paciência para ensinar e sua capacidade de simplificar o complexo fazem de você um guia natural.',
    strengths: ['Didática natural', 'Paciência para ensinar', 'Conhecimento profundo'],
    idealModel: 'Cursos online e mentoria.',
    nextStep: 'Escolha um tópico que você ensina bem e crie um roteiro de 5 aulas.',
    color: '#14B8A6',
  },
  construtor: {
    key: 'construtor',
    name: 'O CONSTRUTOR',
    tagline: 'Você só descansa quando vê funcionando',
    description:
      'Você não se contenta em planejar — precisa ver a coisa funcionando. Enquanto outros discutem, você já está testando. Sua energia prática e a capacidade de transformar ideias em realidade são seus maiores diferenciais.',
    strengths: ['Execução rápida', 'Pensamento prático', 'Resolução de problemas'],
    idealModel: 'SaaS, ferramentas e produtos digitais.',
    nextStep: 'Identifique um problema que você resolve bem e crie um MVP esta semana.',
    color: '#3B82F6',
  },
  estrategista: {
    key: 'estrategista',
    name: 'O ESTRATEGISTA',
    tagline: 'Você conecta os pontos que ninguém vê',
    description:
      'Você enxerga o mapa completo quando outros veem apenas a próxima esquina. Sua mente conecta padrões, dados e oportunidades de um jeito que parece mágica — mas é pura análise.',
    strengths: ['Visão sistêmica', 'Planejamento estratégico', 'Análise de mercado'],
    idealModel: 'Consultoria e serviços estratégicos.',
    nextStep: 'Mapeie 3 problemas do seu setor e escolha o mais lucrativo para resolver.',
    color: '#8B5CF6',
  },
};
