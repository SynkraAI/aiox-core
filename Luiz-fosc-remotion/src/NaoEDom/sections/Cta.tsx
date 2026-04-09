import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { COLORS, FONTS, SIZES, TIMING } from '../tokens';

export const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - TIMING.CTA_START;
  if (localFrame < 0 || frame >= TIMING.CTA_END) return null;

  // Main text
  const textProgress = spring({
    frame: localFrame,
    fps,
    config: { damping: 20, stiffness: 100 },
  });

  // Save icon pulse
  const saveProgress = spring({
    frame: localFrame,
    fps,
    delay: 30,
    config: { damping: 12, stiffness: 80, mass: 0.8 },
  });

  // Pulse animation for save icon
  const pulseScale = 1 + 0.05 * Math.sin((localFrame - 30) * 0.15);

  // "Comenta: qual é a sua estrutura?" appears last
  const commentProgress = spring({
    frame: localFrame,
    fps,
    delay: 60,
    config: { damping: 18, stiffness: 100 },
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: COLORS.BG,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SIZES.MARGIN * 2,
        gap: 56,
      }}
    >
      {/* Main CTA text */}
      <div
        style={{
          opacity: interpolate(textProgress, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(textProgress, [0, 1], [30, 0])}px)`,
          textAlign: 'center',
          maxWidth: 900,
        }}
      >
        <span
          style={{
            fontFamily: FONTS.UI,
            fontWeight: FONTS.BODY_WEIGHT,
            fontSize: SIZES.BODY,
            color: COLORS.FG,
            lineHeight: 1.4,
          }}
        >
          Se alguém já te disse que você{' '}
          <span style={{ fontWeight: 800 }}>não nasceu pra algo</span>...
        </span>
      </div>

      {/* Save icon + text */}
      <div
        style={{
          opacity: interpolate(saveProgress, [0, 1], [0, 1]),
          transform: `scale(${localFrame > 30 ? pulseScale : interpolate(saveProgress, [0, 1], [0.5, 1])})`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        {/* Bookmark icon */}
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke={COLORS.ACCENT}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
        <span
          style={{
            fontFamily: FONTS.UI,
            fontWeight: 800,
            fontSize: SIZES.BODY,
            color: COLORS.ACCENT,
            letterSpacing: 2,
          }}
        >
          SALVA ESSE VÍDEO
        </span>
      </div>

      {/* Comment bait */}
      <div
        style={{
          opacity: interpolate(commentProgress, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(commentProgress, [0, 1], [20, 0])}px)`,
          textAlign: 'center',
          borderTop: `1px solid ${COLORS.MUTED}33`,
          paddingTop: 32,
          maxWidth: 800,
        }}
      >
        <span
          style={{
            fontFamily: FONTS.UI,
            fontWeight: FONTS.BODY_WEIGHT,
            fontSize: SIZES.CAPTION + 4,
            color: COLORS.MUTED,
          }}
        >
          Comenta:{' '}
          <span style={{ color: COLORS.FG, fontWeight: FONTS.UI_WEIGHT }}>
            qual é a sua estrutura?
          </span>
        </span>
      </div>
    </div>
  );
};
