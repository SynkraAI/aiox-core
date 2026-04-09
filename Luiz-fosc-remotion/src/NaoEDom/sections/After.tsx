import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { COLORS, FONTS, SIZES, TIMING } from '../tokens';

interface Achievement {
  number: string;
  label: string;
}

const ACHIEVEMENTS: Achievement[] = [
  { number: '500+', label: 'palestras' },
  { number: '2×', label: 'Guinness World Records' },
  { number: '7.000', label: 'pessoas num auditório' },
];

export const After: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - TIMING.AFTER_START;
  if (localFrame < 0 || frame >= TIMING.AFTER_END) return null;

  // "A diferença?" text
  const diffProgress = spring({
    frame: localFrame,
    fps,
    delay: 120,
    config: { damping: 20, stiffness: 100 },
  });

  // "ESTRUTURA" reveal — gold accent
  const estruturaProgress = spring({
    frame: localFrame,
    fps,
    delay: 150,
    config: { damping: 12, stiffness: 80, mass: 1 },
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
      {/* Achievement counters */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 40,
          alignItems: 'center',
        }}
      >
        {ACHIEVEMENTS.map((item, i) => {
          const itemProgress = spring({
            frame: localFrame,
            fps,
            delay: i * 30,
            config: { damping: 14, stiffness: 100, mass: 0.6 },
          });

          const scale = interpolate(itemProgress, [0, 1], [0.8, 1]);

          return (
            <div
              key={item.number}
              style={{
                opacity: interpolate(itemProgress, [0, 1], [0, 1]),
                transform: `scale(${scale})`,
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              {/* Number — gold accent (8% rule: only numbers get gold) */}
              <span
                style={{
                  fontFamily: FONTS.UI,
                  fontWeight: 800,
                  fontSize: 72,
                  color: COLORS.ACCENT,
                  letterSpacing: -2,
                }}
              >
                {item.number}
              </span>
              <span
                style={{
                  fontFamily: FONTS.UI,
                  fontWeight: FONTS.BODY_WEIGHT,
                  fontSize: SIZES.CAPTION,
                  color: COLORS.MUTED,
                  textTransform: 'lowercase',
                }}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* "A diferença? Estrutura." */}
      <div
        style={{
          opacity: interpolate(diffProgress, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(diffProgress, [0, 1], [30, 0])}px)`,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
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
          A diferença?
        </span>
        <span
          style={{
            fontFamily: FONTS.UI,
            fontWeight: 800,
            fontSize: SIZES.HERO,
            color: COLORS.ACCENT,
            letterSpacing: 4,
            opacity: interpolate(estruturaProgress, [0, 1], [0, 1]),
            transform: `scale(${interpolate(estruturaProgress, [0, 1], [0.6, 1])})`,
          }}
        >
          ESTRUTURA.
        </span>
      </div>
    </div>
  );
};
