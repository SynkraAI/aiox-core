/**
 * TEMPLATE REFERENCE - Import paths assume Remotion project context
 *
 * Academia Lendaria Design System v4.1 - Componentes Integrados
 *
 * Este arquivo demonstra o padrao CORRETO para criar componentes Remotion
 * utilizando o Design System Academia Lendaria. Deve ser usado como
 * referencia definitiva por agentes de IA.
 *
 * REGRA SAGRADA: Gold (#C9B298) NUNCA excede 8% da area visivel da tela.
 * - Background preto: ~70%
 * - Texto branco: ~22%
 * - Gold (primary): MAX 8%
 *
 * Tokens disponiveis:
 *   colors    - background, foreground, primary, muted, success, error, warning, gradientGold
 *   typography - ui, body, weights.{regular,semibold,bold}, sizes.{headline..tiny}
 *   spacing   - base(8), xs(8), sm(16), md(24), lg(32), xl(48), xxl(64), xxxl(96)
 *   animation - fast(10), normal(15), slow(30), verySlow(60), easing.{smooth,snappy,bouncy,gentle}
 *   layout    - safeZone.{top,bottom}, margin(40), contentWidth(1000)
 */

import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from "remotion";
import {
  colors,
  typography,
  spacing,
  animation,
  layout,
} from "@/styles/tokens";

// ============================================
// 1. DSHeadline - Titulo Animado com Linha Gold
// ============================================

/**
 * Titulo animado que entra com spring + fade, acompanhado de uma
 * linha de acento em gold que se expande horizontalmente.
 *
 * Demonstra: typography tokens + animation.easing tokens + spring()
 *
 * A linha gold ocupa uma area minima da tela (~0.3%), respeitando
 * a regra de 8% maximo para o gold.
 *
 * @usage
 * ```tsx
 * <Sequence from={0} durationInFrames={120}>
 *   <DSHeadline
 *     titulo="Transforme Seu Negocio"
 *     subtitulo="Resultados que falam por si"
 *     delay={5}
 *   />
 * </Sequence>
 * ```
 */

interface DSHeadlineProps {
  /** Texto principal do titulo */
  titulo: string;
  /** Texto secundario abaixo do titulo (opcional) */
  subtitulo?: string;
  /** Frames de atraso antes da animacao iniciar */
  delay?: number;
}

export const DSHeadline: React.FC<DSHeadlineProps> = ({
  titulo,
  subtitulo,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Frame ajustado pelo delay
  const adjustedFrame = Math.max(0, frame - delay);

  // Entrada do titulo com spring usando easing.snappy do DS
  const titleScale = spring({
    frame: adjustedFrame,
    fps,
    config: animation.easing.snappy,
  });

  // Fade-in do titulo
  const titleOpacity = interpolate(adjustedFrame, [0, animation.fast], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Slide vertical do titulo (de baixo para cima)
  const titleTranslateY = interpolate(
    adjustedFrame,
    [0, animation.normal],
    [spacing.xl, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  // Linha gold se expande apos o titulo aparecer
  // REGRA 8% GOLD: a linha tem 4px de altura x ~200px de largura
  // em uma tela 1080x1920 = 2.073.600px totais, isso e ~0.04% - bem dentro do limite
  const lineWidth = interpolate(
    adjustedFrame,
    [animation.fast, animation.slow],
    [0, 200],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  // Subtitulo aparece com delay adicional
  const subtitleOpacity = interpolate(
    adjustedFrame,
    [animation.normal, animation.normal + animation.fast],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  const subtitleTranslateY = interpolate(
    adjustedFrame,
    [animation.normal, animation.normal + animation.normal],
    [spacing.md, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.background,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: spacing.xxl,
      }}
    >
      {/* Container respeitando safe zones */}
      <div
        style={{
          maxWidth: layout.contentWidth,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: spacing.md,
        }}
      >
        {/* Titulo Principal */}
        <h1
          style={{
            fontFamily: typography.ui,
            fontSize: typography.sizes.headline,
            fontWeight: typography.weights.bold,
            color: colors.foreground,
            textAlign: "center",
            lineHeight: 1.1,
            margin: 0,
            opacity: titleOpacity,
            transform: `translateY(${titleTranslateY}px) scale(${titleScale})`,
          }}
        >
          {titulo}
        </h1>

        {/* Linha de Acento Gold */}
        {/* REGRA 8% GOLD: elemento decorativo pequeno, contribui minimamente para o total gold */}
        <div
          style={{
            height: 4,
            width: lineWidth,
            background: colors.gradientGold,
            borderRadius: spacing.base / 4,
          }}
        />

        {/* Subtitulo (opcional) */}
        {subtitulo && (
          <p
            style={{
              fontFamily: typography.body,
              fontSize: typography.sizes.subtitle,
              fontWeight: typography.weights.regular,
              color: colors.muted,
              textAlign: "center",
              lineHeight: 1.4,
              margin: 0,
              opacity: subtitleOpacity,
              transform: `translateY(${subtitleTranslateY}px)`,
            }}
          >
            {subtitulo}
          </p>
        )}
      </div>
    </AbsoluteFill>
  );
};

// ============================================
// 2. DSStatCard - Card de Estatistica
// ============================================

/**
 * Card simples exibindo uma estatistica com label, valor e variacao.
 * Usa entrada com spring e stagger para multiplos cards.
 *
 * Demonstra: colors tokens, spacing tokens, layout tokens
 *
 * O gold aparece apenas no valor de trend e na borda sutil do card.
 * Ambos somados representam menos de 1% da area da tela.
 *
 * @usage
 * ```tsx
 * <Sequence from={30} durationInFrames={120}>
 *   <DSStatCard
 *     rotulo="Clientes Ativos"
 *     valor="2.847"
 *     variacao="+34%"
 *     delay={0}
 *   />
 * </Sequence>
 * ```
 */

interface DSStatCardProps {
  /** Label descritivo da estatistica */
  rotulo: string;
  /** Valor numerico formatado */
  valor: string;
  /** Variacao percentual (ex: "+34%") */
  variacao?: string;
  /** Frames de atraso antes da animacao iniciar */
  delay?: number;
}

export const DSStatCard: React.FC<DSStatCardProps> = ({
  rotulo,
  valor,
  variacao,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const adjustedFrame = Math.max(0, frame - delay);

  // Entrada com spring suave (easing.gentle)
  const cardScale = spring({
    frame: adjustedFrame,
    fps,
    config: animation.easing.gentle,
  });

  // Fade-in do card
  const cardOpacity = interpolate(
    adjustedFrame,
    [0, animation.normal],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  // Borda gold com glow sutil que pulsa
  // REGRA 8% GOLD: borda de 1px em um card de ~400x200px contribui minimamente
  const borderGlow = interpolate(
    adjustedFrame,
    [animation.normal, animation.slow, animation.verySlow],
    [0, 0.4, 0.25],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  // Variacao aparece com atraso
  const variacaoOpacity = interpolate(
    adjustedFrame,
    [animation.normal + animation.fast, animation.slow + animation.fast],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  return (
    <div
      style={{
        opacity: cardOpacity,
        transform: `scale(${cardScale})`,
        backgroundColor: colors.background,
        border: `1px solid rgba(201, 178, 152, ${borderGlow})`,
        borderRadius: spacing.sm,
        padding: spacing.lg,
        width: layout.contentWidth * 0.42,
        display: "flex",
        flexDirection: "column",
        gap: spacing.sm,
        boxShadow: `0 0 ${spacing.lg}px rgba(201, 178, 152, ${borderGlow * 0.2})`,
      }}
    >
      {/* Label */}
      <span
        style={{
          fontFamily: typography.ui,
          fontSize: typography.sizes.tiny,
          fontWeight: typography.weights.semibold,
          color: colors.muted,
          textTransform: "uppercase",
          letterSpacing: spacing.base / 4,
        }}
      >
        {rotulo}
      </span>

      {/* Valor + Variacao */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: spacing.sm,
        }}
      >
        <span
          style={{
            fontFamily: typography.ui,
            fontSize: typography.sizes.title,
            fontWeight: typography.weights.bold,
            color: colors.foreground,
            letterSpacing: -1,
          }}
        >
          {valor}
        </span>

        {/* REGRA 8% GOLD: variacao em gold, area textual minima (~0.1% da tela) */}
        {variacao && (
          <span
            style={{
              fontFamily: typography.ui,
              fontSize: typography.sizes.label,
              fontWeight: typography.weights.semibold,
              color: colors.primary,
              opacity: variacaoOpacity,
            }}
          >
            {variacao}
          </span>
        )}
      </div>

      {/* Linha decorativa inferior */}
      <div
        style={{
          height: spacing.base / 4,
          width: spacing.xxl,
          background: colors.gradientGold,
          borderRadius: spacing.base / 4,
          marginTop: spacing.xs,
        }}
      />
    </div>
  );
};

// ============================================
// 3. DSCallToAction - Botao CTA com Glow Pulsante
// ============================================

/**
 * Botao de chamada para acao com glow pulsante em gold.
 * Projetado para ser o elemento de maior destaque gold na tela,
 * por isso o calculo de area e feito com cuidado.
 *
 * Demonstra: regra de 8% gold em elemento de destaque
 *
 * Calculo de area gold:
 * - Botao: ~400x80px = 32.000px
 * - Glow (halo): ~440x120px com opacity 0.3 = contribuicao efetiva ~15.840px
 * - Total efetivo: ~47.840px de 2.073.600px totais = ~2.3%
 * - Somado com outros elementos gold na tela: deve ficar abaixo de 8%
 *
 * @usage
 * ```tsx
 * <Sequence from={90} durationInFrames={150}>
 *   <DSCallToAction
 *     texto="Comece Agora Mesmo"
 *     subtexto="Vagas limitadas"
 *     delay={10}
 *   />
 * </Sequence>
 * ```
 */

interface DSCallToActionProps {
  /** Texto principal do botao */
  texto: string;
  /** Texto secundario abaixo do botao (opcional) */
  subtexto?: string;
  /** Frames de atraso antes da animacao iniciar */
  delay?: number;
}

export const DSCallToAction: React.FC<DSCallToActionProps> = ({
  texto,
  subtexto,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const adjustedFrame = Math.max(0, frame - delay);

  // Entrada com spring bouncy para chamar atencao
  const buttonScale = spring({
    frame: adjustedFrame,
    fps,
    config: animation.easing.bouncy,
  });

  // Fade-in do CTA inteiro
  const ctaOpacity = interpolate(adjustedFrame, [0, animation.normal], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // REGRA 8% GOLD: glow pulsante com ciclo de 60 frames (~2s)
  // A opacidade oscila entre 0.15 e 0.5 para manter a contribuicao gold controlada.
  // Em pico (0.5), o halo contribui com ~1.5% da tela.
  // No vale (0.15), apenas ~0.5%.
  const glowCycle = adjustedFrame % animation.verySlow;
  const glowOpacity = interpolate(
    glowCycle,
    [0, animation.slow, animation.verySlow],
    [0.15, 0.5, 0.15],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  // Escala sutil do glow acompanhando o pulso
  const glowScale = interpolate(
    glowCycle,
    [0, animation.slow, animation.verySlow],
    [1, 1.08, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  // Subtexto aparece com atraso
  const subtextoOpacity = interpolate(
    adjustedFrame,
    [animation.normal, animation.slow],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.background,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.md,
      }}
    >
      {/* Container do Botao com Glow */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: ctaOpacity,
          transform: `scale(${buttonScale})`,
        }}
      >
        {/* Camada de Glow (atras do botao) */}
        {/* REGRA 8% GOLD: glow pulsante tem opacity controlada para nao exceder contribuicao */}
        <div
          style={{
            position: "absolute",
            inset: -spacing.sm,
            background: colors.gradientGold,
            borderRadius: spacing.md + spacing.xs,
            opacity: glowOpacity,
            transform: `scale(${glowScale})`,
            filter: `blur(${spacing.sm}px)`,
          }}
        />

        {/* Botao Principal */}
        <div
          style={{
            position: "relative",
            background: colors.gradientGold,
            borderRadius: spacing.md,
            paddingTop: spacing.md,
            paddingBottom: spacing.md,
            paddingLeft: spacing.xl,
            paddingRight: spacing.xl,
            minWidth: layout.contentWidth * 0.6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: typography.ui,
              fontSize: typography.sizes.subtitle,
              fontWeight: typography.weights.bold,
              color: colors.background,
              textAlign: "center",
              letterSpacing: -0.5,
            }}
          >
            {texto}
          </span>
        </div>
      </div>

      {/* Subtexto abaixo do botao */}
      {subtexto && (
        <p
          style={{
            fontFamily: typography.body,
            fontSize: typography.sizes.small,
            fontWeight: typography.weights.regular,
            color: colors.muted,
            textAlign: "center",
            margin: 0,
            opacity: subtextoOpacity,
          }}
        >
          {subtexto}
        </p>
      )}
    </AbsoluteFill>
  );
};

// ============================================
// PRESETS - Configuracoes Prontas
// ============================================

/**
 * Presets prontos para uso rapido dos componentes.
 * Cada preset e uma configuracao completa de props
 * que pode ser espalhada diretamente no componente.
 */
export const DSPresets = {
  /** Headline para abertura de video */
  headlineAbertura: {
    titulo: "O Segredo que Ninguem Te Conta",
    subtitulo: "Descubra o metodo que ja transformou milhares de negocios",
    delay: 5,
  } satisfies DSHeadlineProps,

  /** Headline para revelacao/solucao */
  headlineRevelacao: {
    titulo: "A Solucao Definitiva",
    subtitulo: "Simples, rapido e comprovado",
    delay: 0,
  } satisfies DSHeadlineProps,

  /** StatCard de faturamento */
  statFaturamento: {
    rotulo: "Faturamento Mensal",
    valor: "R$ 147K",
    variacao: "+284%",
    delay: 0,
  } satisfies DSStatCardProps,

  /** StatCard de clientes */
  statClientes: {
    rotulo: "Clientes Ativos",
    valor: "2.847",
    variacao: "+34%",
    delay: 8,
  } satisfies DSStatCardProps,

  /** StatCard de conversao */
  statConversao: {
    rotulo: "Taxa de Conversao",
    valor: "12,4%",
    variacao: "+5,2pp",
    delay: 16,
  } satisfies DSStatCardProps,

  /** CTA principal de venda */
  ctaVenda: {
    texto: "Quero Comecar Agora",
    subtexto: "Ultimas vagas com desconto de lancamento",
    delay: 10,
  } satisfies DSCallToActionProps,

  /** CTA para captura de lead */
  ctaLead: {
    texto: "Baixar Material Gratuito",
    subtexto: "Acesso imediato ao seu e-mail",
    delay: 5,
  } satisfies DSCallToActionProps,

  /** CTA para WhatsApp */
  ctaWhatsApp: {
    texto: "Falar com Especialista",
    subtexto: "Atendimento personalizado via WhatsApp",
    delay: 0,
  } satisfies DSCallToActionProps,
} as const;

// ============================================
// USAGE EXAMPLES - Como Compor em um Video
// ============================================

/*
 * ============================================================
 * EXEMPLO COMPLETO: Composicao de Video com Design System
 * ============================================================
 *
 * Cada componente e envolvido em <Sequence> para controlar
 * quando aparece e desaparece no timeline do video.
 *
 * Timeline (30fps):
 *   0-90    (0s-3s)   -> Headline de abertura
 *   60-180  (2s-6s)   -> StatCards (stagger)
 *   150-300 (5s-10s)  -> CTA final
 *
 * ```tsx
 * import { Composition, Sequence, AbsoluteFill } from "remotion";
 * import { colors } from "@/styles/tokens";
 * import { DSHeadline, DSStatCard, DSCallToAction, DSPresets } from "./ds-integrated-component";
 *
 * const MeuVideoViral: React.FC = () => {
 *   return (
 *     <AbsoluteFill style={{ backgroundColor: colors.background }}>
 *
 *       {/* Cena 1: Headline de Abertura *\/}
 *       <Sequence from={0} durationInFrames={90}>
 *         <DSHeadline {...DSPresets.headlineAbertura} />
 *       </Sequence>
 *
 *       {/* Cena 2: Estatisticas com Stagger *\/}
 *       <Sequence from={60} durationInFrames={120}>
 *         <AbsoluteFill
 *           style={{
 *             display: "flex",
 *             flexDirection: "row",
 *             alignItems: "center",
 *             justifyContent: "center",
 *             gap: 24,
 *             padding: 64,
 *           }}
 *         >
 *           <DSStatCard {...DSPresets.statFaturamento} />
 *           <DSStatCard {...DSPresets.statClientes} />
 *         </AbsoluteFill>
 *       </Sequence>
 *
 *       {/* Cena 3: CTA Final *\/}
 *       <Sequence from={150} durationInFrames={150}>
 *         <DSCallToAction {...DSPresets.ctaVenda} />
 *       </Sequence>
 *
 *     </AbsoluteFill>
 *   );
 * };
 *
 * // Registrar composicao
 * export const MeuVideoViralComposition = () => (
 *   <Composition
 *     id="MeuVideoViral"
 *     component={MeuVideoViral}
 *     durationInFrames={300}
 *     fps={30}
 *     width={1080}
 *     height={1920}
 *   />
 * );
 * ```
 *
 * ============================================================
 * NOTAS IMPORTANTES SOBRE A REGRA DE 8% GOLD:
 * ============================================================
 *
 * Ao compor multiplos componentes em uma mesma cena, some a
 * contribuicao gold de cada um:
 *
 *   DSHeadline:   linha gold = ~0.04%
 *   DSStatCard:   borda + trend + linha = ~0.3% (por card)
 *   DSCallToAction: botao + glow = ~2.3% (pico)
 *
 * Exemplo de cena com todos visíveis simultaneamente:
 *   1 headline + 2 stat cards + 1 CTA = 0.04 + 0.6 + 2.3 = ~2.94%
 *   Resultado: BEM DENTRO do limite de 8%
 *
 * CUIDADO: evite empilhar mais de 1 CTA ou mais de 4 StatCards
 * na mesma cena, pois pode ultrapassar o limite.
 *
 * ============================================================
 * CHECKLIST DO DESIGN SYSTEM:
 * ============================================================
 *
 * [ ] ZERO valores hardcoded - tudo via tokens
 * [ ] Gold (colors.primary / gradientGold) abaixo de 8%
 * [ ] Fontes via typography.ui ou typography.body
 * [ ] Espacamento via spacing.* (grid de 8px)
 * [ ] Animacoes via animation.easing.* + animation.{fast,normal,slow}
 * [ ] Safe zones respeitadas via layout.safeZone.*
 * [ ] Conteudo dentro de layout.contentWidth
 * [ ] Todos os textos em portugues (pt-BR)
 *
 * ============================================================
 */

export default { DSHeadline, DSStatCard, DSCallToAction, DSPresets };
