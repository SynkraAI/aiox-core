import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { COLORS, FONTS, SIZES, TIMING } from '../tokens';

export const Signature: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - TIMING.SIGNATURE_START;
  if (localFrame < 0) return null;

  // Name
  const nameProgress = spring({
    frame: localFrame,
    fps,
    config: { damping: 20, stiffness: 100 },
  });

  // Tagline
  const taglineProgress = spring({
    frame: localFrame,
    fps,
    delay: 10,
    config: { damping: 18, stiffness: 80 },
  });

  // Hashtag
  const hashProgress = spring({
    frame: localFrame,
    fps,
    delay: 20,
    config: { damping: 18, stiffness: 80 },
  });

  // Divider line
  const lineWidth = interpolate(
    spring({
      frame: localFrame,
      fps,
      delay: 5,
      config: { damping: 20, stiffness: 120 },
    }),
    [0, 1],
    [0, 120]
  );

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
        gap: 24,
      }}
    >
      {/* Name */}
      <div
        style={{
          opacity: interpolate(nameProgress, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(nameProgress, [0, 1], [20, 0])}px)`,
        }}
      >
        <span
          style={{
            fontFamily: FONTS.UI,
            fontWeight: 800,
            fontSize: SIZES.HERO,
            color: COLORS.FG,
            letterSpacing: 6,
          }}
        >
          LUIZ FOSC
        </span>
      </div>

      {/* Gold divider */}
      <div
        style={{
          width: lineWidth,
          height: 2,
          background: COLORS.ACCENT,
          borderRadius: 1,
        }}
      />

      {/* Tagline */}
      <div
        style={{
          opacity: interpolate(taglineProgress, [0, 1], [0, 1]),
        }}
      >
        <span
          style={{
            fontFamily: FONTS.UI,
            fontWeight: FONTS.UI_WEIGHT,
            fontSize: SIZES.BODY,
            color: COLORS.ACCENT,
            letterSpacing: 2,
          }}
        >
          Não é dom, é estrutura.
        </span>
      </div>

      {/* Hashtag */}
      <div
        style={{
          opacity: interpolate(hashProgress, [0, 1], [0, 1]),
        }}
      >
        <span
          style={{
            fontFamily: FONTS.UI,
            fontWeight: FONTS.BODY_WEIGHT,
            fontSize: SIZES.CAPTION,
            color: COLORS.MUTED,
          }}
        >
          #pensecomoumilusionista
        </span>
      </div>
    </div>
  );
};
