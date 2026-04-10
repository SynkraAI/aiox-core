export interface Finish {
  name: string
  image: string
  color: string
}

export const WOOD_FINISHES: Finish[] = [
  { name: 'Angelin', image: '/images/finishes/wood/Angelin.png', color: '#8B6914' },
  { name: 'Canelao', image: '/images/finishes/wood/Canelão.png', color: '#6B3A2A' },
  { name: 'Carvalho Branco', image: '/images/finishes/wood/Carvalho Branco Linheiro.png', color: '#C4A882' },
  { name: 'Cerejeira', image: '/images/finishes/wood/Cerejeira_.png', color: '#9E4A3A' },
  { name: 'Ebano', image: '/images/finishes/wood/ebano linheiro.png', color: '#2C1810' },
  { name: 'Freijo', image: '/images/finishes/wood/freijo.png', color: '#7A5C3E' },
  { name: 'Goiabao Escuro', image: '/images/finishes/wood/Goiabão Escuro.png', color: '#4A2820' },
  { name: 'Itauba', image: '/images/finishes/wood/Itaúba.png', color: '#A07840' },
  { name: 'Marupa', image: '/images/finishes/wood/Marupa.png', color: '#D4B896' },
  { name: 'Wengue', image: '/images/finishes/wood/Wengue.png', color: '#3C2415' },
] as const

export const FABRIC_FINISHES: Finish[] = [
  { name: 'Verde 102', image: '/images/finishes/fabric/102.png', color: '#1B6B3A' },
  { name: 'Verde 103', image: '/images/finishes/fabric/103-91.png', color: '#2D8B4E' },
  { name: 'Vermelho 143', image: '/images/finishes/fabric/143-1.png', color: '#C41E3A' },
  { name: 'Bordô 145', image: '/images/finishes/fabric/145-9.png', color: '#7B1F3A' },
  { name: 'Vinho 148', image: '/images/finishes/fabric/148-91.png', color: '#5E1224' },
  { name: 'Cinza 154', image: '/images/finishes/fabric/154-9.png', color: '#808080' },
  { name: 'Azul 191', image: '/images/finishes/fabric/191-801.png', color: '#1E3A6B' },
  { name: 'Azul 212', image: '/images/finishes/fabric/212-23.png', color: '#2B5EA7' },
  { name: 'Marrom 247', image: '/images/finishes/fabric/247-24.png', color: '#6B4226' },
  { name: 'Preto 269', image: '/images/finishes/fabric/269-9.png', color: '#1A1A1A' },
  { name: 'Grafite 269', image: '/images/finishes/fabric/269-21.png', color: '#3D3D3D' },
  { name: 'Bege 275', image: '/images/finishes/fabric/275-9.png', color: '#C8B89A' },
  { name: 'Caramelo 284', image: '/images/finishes/fabric/284.png', color: '#A0682C' },
  { name: 'Laranja 300', image: '/images/finishes/fabric/300-1.png', color: '#D4722A' },
  { name: 'Amarelo 309', image: '/images/finishes/fabric/309.png', color: '#D4A928' },
  { name: 'Branco 310', image: '/images/finishes/fabric/310.png', color: '#F0ECE4' },
] as const
