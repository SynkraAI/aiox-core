/**
 * ============================================
 * REFERENCIA DE TOKENS - Remotion
 * Academia Lendaria Design System v4.1
 * ============================================
 *
 * Este arquivo serve como REFERENCIA para agentes do viral-squad.
 * NAO e codigo executavel - e material de consulta.
 *
 * FONTE DE VERDADE: academia-lendaria-ds/src/tokens/remotion.ts
 * IMPORT NO REMOTION: import { colors, typography, spacing, animation } from '@/styles/tokens';
 *
 * REGRA SAGRADA: Gold (#C9B298) NUNCA excede 8% da tela
 */

// ============================================
// COLORS - Paleta de cores
// ============================================
// REGRA: 70% background | 22% foreground | MAX 8% primary (gold)
export const colors = {
  background: "#000000", // ~70% da tela - SEMPRE fundo principal
  foreground: "#FFFFFF", // ~22% da tela - textos, icones
  primary: "#C9B298", // MAX 8% - CTAs, highlights, numeros, bordas accent
  muted: "#A8A8A8", // Subtextos, labels secundarios

  // Semanticos - usar com moderacao
  success: "#22C55E", // Indicadores positivos, trends up
  error: "#EF4444", // Alertas, indicadores negativos
  warning: "#F59E0B", // Avisos, atencao

  // Gradiente Gold - para elementos especiais
  gradientGold: "linear-gradient(135deg, #C9B298 0%, #8B7355 100%)",
} as const;

// ============================================
// TYPOGRAPHY - Fontes e tamanhos
// ============================================
// REGRA: Inter para UI/titulos | Source Serif 4 para corpo/leitura
export const typography = {
  // Familias de fonte
  ui: "Inter, system-ui, sans-serif", // Titulos, labels, CTAs, numeros
  body: '"Source Serif 4", Georgia, serif', // Paragrafos, citacoes, corpo

  // Pesos
  weights: {
    regular: 400, // Corpo de texto
    semibold: 600, // Titulos, labels, UI
    bold: 700, // Headlines, emphasis forte
  },

  // Tamanhos em px (otimizados para 1080x1920 vertical)
  sizes: {
    headline: 72, // Hero text, numeros grandes
    title: 56, // Titulos de secao
    subtitle: 40, // Subtitulos
    body: 32, // Texto principal
    label: 28, // Labels, categorias
    small: 24, // Texto secundario
    tiny: 18, // Disclaimers, fine print
  },
} as const;

// ============================================
// SPACING - Sistema de espacamento (grid 8px)
// ============================================
export const spacing = {
  base: 8, // Unidade base
  xs: 8, // Gaps minimos
  sm: 16, // Gaps pequenos
  md: 24, // Padding padrao
  lg: 32, // Gaps medios
  xl: 48, // Separacao de secoes
  xxl: 64, // Espacamento grande
  xxxl: 96, // Espacamento hero
} as const;

// ============================================
// ANIMATION - Configuracoes de animacao
// ============================================
// Duracoes em FRAMES (a 30fps)
// Easing configs para Remotion spring()
export const animation = {
  // Duracoes
  instant: 0, // Sem animacao
  fast: 10, // 0.33s - Acentos rapidos, micro-interacoes
  normal: 15, // 0.5s - Transicoes padrao
  slow: 30, // 1s - Reveals dramaticos
  verySlow: 60, // 2s - Entradas epicas

  // Configs para spring() do Remotion
  easing: {
    smooth: { damping: 15, stiffness: 100 }, // Reveals suaves
    snappy: { damping: 12, stiffness: 200 }, // Entradas punchy
    bouncy: { damping: 8, stiffness: 150 }, // Elementos playful
    gentle: { damping: 20, stiffness: 80 }, // Movimentos sutis
  },
} as const;

// ============================================
// VIDEO - Configuracao do video
// ============================================
export const video = {
  width: 1080, // Instagram Reels
  height: 1920, // 9:16 vertical
  fps: 30,
  durationInSeconds: 35,
} as const;

// ============================================
// LAYOUT - Zonas seguras e margens
// ============================================
// IMPORTANTE: Evitar conteudo em safe zones (UI do Instagram cobre)
export const layout = {
  safeZone: {
    top: 200, // Evitar: barra de status, nome do perfil
    bottom: 200, // Evitar: botoes de interacao, legenda
  },
  margin: 40, // Margem lateral
  contentWidth: 1000, // 1080 - 2*40 = area util
} as const;

// ============================================
// EXEMPLO DE USO EM COMPONENTE REMOTION
// ============================================
/*
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { colors, typography, spacing, animation } from '@/styles/tokens';

interface MeuComponenteProps {
  titulo: string;
  delay?: number;
}

export const MeuComponente: React.FC<MeuComponenteProps> = ({
  titulo,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame - delay, [0, animation.normal], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const scale = spring({
    frame: frame - delay,
    fps,
    config: animation.easing.smooth,
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.background,
        padding: spacing.xl,
      }}
    >
      <h1
        style={{
          fontFamily: typography.ui,
          fontSize: typography.sizes.title,
          fontWeight: typography.weights.semibold,
          color: colors.foreground,
          opacity,
          transform: `scale(${scale})`,
        }}
      >
        {titulo}
      </h1>
    </AbsoluteFill>
  );
};
*/
