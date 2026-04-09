import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { COLORS, FONTS, SIZES, TIMING } from '../tokens';

const PRINCIPLES = [
  { label: 'Método', beats: 'Talento' },
  { label: 'Repetição', beats: 'Inspiração' },
  { label: 'Estrutura', beats: 'Sorte' },
];

export const Bridge: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - TIMING.BRIDGE_START;
  if (localFrame < 0 || frame >= TIMING.BRIDGE_END) return null;

  // "NÃO É DOM. É ESTRUTURA." header
  const headerProgress = spring({
    frame: localFrame,
    fps,
    config: { damping: 16, stiffness: 120, mass: 0.6 },
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
        gap: 64,
      }}
    >
      {/* Header */}
      <div
        style={{
          opacity: interpolate(headerProgress, [0, 1], [0, 1]),
          transform: `scale(${interpolate(headerProgress, [0, 1], [0.9, 1])})`,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <span
          style={{
            fontFamily: FONTS.UI,
            fontWeight: 800,
            fontSize: SIZES.TITLE,
            color: COLORS.FG,
            letterSpacing: 2,
          }}
        >
          NÃO É DOM.
        </span>
        <span
          style={{
            fontFamily: FONTS.UI,
            fontWeight: 800,
            fontSize: SIZES.HERO,
            color: COLORS.ACCENT,
            letterSpacing: 4,
          }}
        >
          É ESTRUTURA.
        </span>
      </div>

      {/* Principles checklist */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 32,
          alignItems: 'center',
        }}
      >
        {PRINCIPLES.map((item, i) => {
          const itemDelay = 30 + i * 25;
          const itemProgress = spring({
            frame: localFrame,
            fps,
            delay: itemDelay,
            config: { damping: 16, stiffness: 100, mass: 0.6 },
          });

          // Checkmark pops in after text
          const checkProgress = spring({
            frame: localFrame,
            fps,
            delay: itemDelay + 15,
            config: { damping: 10, stiffness: 200, mass: 0.3 },
          });

          return (
            <div
              key={item.label}
              style={{
                opacity: interpolate(itemProgress, [0, 1], [0, 1]),
                transform: `translateX(${interpolate(itemProgress, [0, 1], [-30, 0])}px)`,
                display: 'flex',
                alignItems: 'center',
                gap: 20,
              }}
            >
              {/* Checkmark */}
              <span
                style={{
                  fontSize: 36,
                  opacity: interpolate(checkProgress, [0, 1], [0, 1]),
                  transform: `scale(${interpolate(checkProgress, [0, 1], [2, 1])})`,
                }}
              >
                ✓
              </span>

              {/* "X > Y" */}
              <span
                style={{
                  fontFamily: FONTS.UI,
                  fontWeight: FONTS.UI_WEIGHT,
                  fontSize: SIZES.BODY,
                  color: COLORS.FG,
                }}
              >
                <span style={{ color: COLORS.ACCENT, fontWeight: 800 }}>
                  {item.label}
                </span>
                {' > '}
                <span style={{ color: COLORS.MUTED, textDecoration: 'line-through' }}>
                  {item.beats}
                </span>
              </span>
            </div>
          );
        })}
      </div>

      {/* "Sempre." emphasis */}
      <div
        style={{
          opacity: interpolate(
            spring({
              frame: localFrame,
              fps,
              delay: 120,
              config: { damping: 20, stiffness: 80 },
            }),
            [0, 1],
            [0, 1]
          ),
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontFamily: FONTS.UI,
            fontWeight: 800,
            fontSize: SIZES.TITLE,
            color: COLORS.FG,
            letterSpacing: 6,
          }}
        >
          SEMPRE.
        </span>
      </div>
    </div>
  );
};
