import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { COLORS, FONTS, SIZES, TIMING } from '../tokens';

const MYTHS = ['DOM', 'TALENTO NATURAL', 'NASCEU PRA ISSO'];

export const Agitation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - TIMING.AGITATION_START;
  if (localFrame < 0 || frame >= TIMING.AGITATION_END) return null;

  // "A maior mentira" text fade in
  const headerProgress = spring({
    frame: localFrame,
    fps,
    config: { damping: 20, stiffness: 100 },
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
        gap: 48,
      }}
    >
      {/* Header */}
      <div
        style={{
          opacity: interpolate(headerProgress, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(headerProgress, [0, 1], [30, 0])}px)`,
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontFamily: FONTS.UI,
            fontWeight: FONTS.BODY_WEIGHT,
            fontSize: SIZES.BODY,
            color: COLORS.MUTED,
          }}
        >
          A maior mentira que te contaram:
        </span>
      </div>

      {/* Myths with X marks */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 40,
          alignItems: 'center',
        }}
      >
        {MYTHS.map((myth, i) => {
          const mythDelay = 20 + i * 25;
          const mythProgress = spring({
            frame: localFrame,
            fps,
            delay: mythDelay,
            config: { damping: 14, stiffness: 120, mass: 0.6 },
          });

          // X mark appears after text
          const xProgress = spring({
            frame: localFrame,
            fps,
            delay: mythDelay + 15,
            config: { damping: 10, stiffness: 200, mass: 0.4 },
          });

          const strikeWidth = interpolate(xProgress, [0, 1], [0, 100]);

          return (
            <div
              key={myth}
              style={{
                opacity: interpolate(mythProgress, [0, 1], [0, 1]),
                transform: `translateX(${interpolate(mythProgress, [0, 1], [-40, 0])}px)`,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 24,
              }}
            >
              {/* X mark */}
              <span
                style={{
                  fontFamily: FONTS.UI,
                  fontWeight: 800,
                  fontSize: SIZES.TITLE,
                  color: COLORS.DANGER,
                  opacity: interpolate(xProgress, [0, 1], [0, 1]),
                  transform: `scale(${interpolate(xProgress, [0, 1], [2, 1])})`,
                }}
              >
                ✕
              </span>

              {/* Myth text */}
              <span
                style={{
                  fontFamily: FONTS.UI,
                  fontWeight: 800,
                  fontSize: SIZES.TITLE,
                  color: COLORS.FG,
                  letterSpacing: 2,
                  position: 'relative',
                }}
              >
                {myth}
                {/* Strikethrough line */}
                <div
                  style={{
                    position: 'absolute',
                    top: '52%',
                    left: 0,
                    height: 4,
                    width: `${strikeWidth}%`,
                    background: COLORS.DANGER,
                    borderRadius: 2,
                  }}
                />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
