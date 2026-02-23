import { Question } from '@/types/quiz';

export const QUESTIONS: Question[] = [
  {
    text: 'Qual dessas frases mais representa você hoje?',
    options: [
      { letter: 'A', text: 'Sou CLT e quero uma renda extra sem largar o emprego' },
      { letter: 'B', text: 'Sou CLT e quero no futuro ter coragem de sair' },
      { letter: 'C', text: 'Já tentei o digital, não funcionou e desisti' },
      { letter: 'D', text: 'Estou pronto para começar mas não sei por onde' },
    ],
    encouragement: 'Bom começo!',
  },
  {
    text: 'O que te impede de dar o primeiro passo?',
    options: [
      { letter: 'A', text: 'Não sei por onde começar' },
      { letter: 'B', text: 'Tenho medo de investir e perder dinheiro' },
      { letter: 'C', text: 'Tenho vergonha do que as pessoas podem falar' },
      { letter: 'D', text: 'Acho que não tenho conhecimento suficiente' },
    ],
  },
  {
    text: 'Quanto tempo você consegue dedicar por dia?',
    options: [
      { letter: 'A', text: 'Menos de 1 hora' },
      { letter: 'B', text: 'Entre 1 e 2 horas' },
      { letter: 'C', text: 'Mais de 2 horas' },
      { letter: 'D', text: 'Preciso ser honesto: nenhum tempo no momento' },
    ],
    encouragement: 'Metade do caminho!',
  },
  {
    text: 'Qual dessas situações mais te incomoda no seu dia a dia?',
    options: [
      { letter: 'A', text: 'Saber que dependo 100% de uma empresa que pode me demitir amanhã' },
      { letter: 'B', text: 'Ver outras pessoas construindo algo próprio enquanto eu fico parado' },
      { letter: 'C', text: 'Chegar em casa cansado e sentir que minha vida está acontecendo no lugar errado' },
      { letter: 'D', text: 'Não conseguir dar para minha família o que eles merecem' },
    ],
  },
  {
    text: 'Se você tivesse um caminho claro e alguém do seu lado, você estaria disposto a dedicar 45 minutos por dia para construir sua primeira venda digital?',
    options: [
      { letter: 'A', text: 'Sim, estou pronto' },
      { letter: 'B', text: 'Sim, mas tenho medo de não conseguir' },
      { letter: 'C', text: 'Não tenho certeza ainda' },
      { letter: 'D', text: 'Preciso pensar melhor sobre isso' },
    ],
    encouragement: 'Quase lá...',
  },
  {
    text: 'O que a sua primeira venda digital representaria para você?',
    options: [
      { letter: 'A', text: 'Prova de que sou capaz' },
      { letter: 'B', text: 'O começo da minha independência financeira' },
      { letter: 'C', text: 'Segurança para minha família' },
      { letter: 'D', text: 'A confirmação de que não preciso depender de ninguém' },
    ],
  },
];

// Scoring matrix for 6 questions mapping to archetypes
// This is a simplified scoring for the Método Cria quiz
// [ambição, segurança, coragem, visão]
export const SCORING_MATRIX: number[][][] = [
  // Q1: Situação de vida
  [[3, 0, 1, 0], [1, 3, 0, 0], [0, 0, 3, 1], [0, 0, 1, 3]],
  // Q2: O que te impede
  [[3, 0, 0, 1], [0, 3, 0, 1], [1, 0, 3, 0], [0, 0, 1, 3]],
  // Q3: Quanto tempo
  [[3, 0, 0, 0], [0, 3, 0, 0], [0, 0, 3, 0], [0, 0, 0, 3]],
  // Q4: Situação incômoda
  [[3, 0, 1, 0], [0, 3, 0, 0], [0, 0, 3, 1], [0, 0, 1, 3]],
  // Q5: Disposição
  [[3, 0, 1, 0], [1, 3, 0, 0], [0, 0, 3, 1], [0, 0, 1, 3]],
  // Q6: O que representaria
  [[3, 0, 0, 1], [0, 3, 0, 0], [0, 0, 3, 0], [0, 0, 0, 3]],
];
