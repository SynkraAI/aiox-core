import { Fraunces, Inter, Space_Grotesk } from 'next/font/google'

// Fraunces — serif editorial with opsz + SOFT variable axes (Spiekermann ratified).
// Substitutes Cormorant Garamond (vetoed as commodity 2019-2024 luxury).
export const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['opsz', 'SOFT'],
})

// Inter — body type (MANTIDO per Spiekermann — "trabalha bem, neutro bom para body longo").
export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

// Space Grotesk — grotesk editorial for display (substitutes Montserrat — less Shopify).
export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

export const fontVariables = [
  inter.variable,
  fraunces.variable,
  spaceGrotesk.variable,
].join(' ')
