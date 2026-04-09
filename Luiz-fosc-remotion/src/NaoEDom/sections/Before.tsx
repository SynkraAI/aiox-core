import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { COLORS, FONTS, SIZES, TIMING } from '../tokens';

const CONFESSIONS = [
  'Tímido demais pra falar em público',
  'Mão tremia no primeiro show',
  'Achava que não era pra mim',
];

export const Before: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - TIMING.BEFORE_START;
  if (localFrame < 0 || frame >= TIMING.BEFORE_END) return null;

  // "Eu era assim:" header
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
        gap: 56,
      }}
    >
      {/* Header */}
      <div
        style={{
          opacity: interpolate(headerProgress, [0, 1], [0, 1]),
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontFamily: FONTS.UI,
            fontWeight: FONTS.UI_WEIGHT,
            fontSize: SIZES.TITLE,
            color: COLORS.MUTED,
          }}
        >
          Eu era assim:
        </span>
      </div>

      {/* Confessions - typewriter-like */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 36,
          alignItems: 'flex-start',
          paddingLeft: SIZES.MARGIN,
          paddingRight: SIZES.MARGIN,
        }}
      >
        {CONFESSIONS.map((text, i) => {
          const itemDelay = 30 + i * 40;
          const itemProgress = spring({
            frame: localFrame,
            fps,
            delay: itemDelay,
            config: { damping: 18, stiffness: 80, mass: 0.8 },
          });

          // Typing cursor blink
          const cursorFrame = localFrame - itemDelay;
          const showCursor = cursorFrame > 0 && cursorFrame < 50;
          const cursorBlink = showCursor && Math.floor(cursorFrame / 8) % 2 === 0;

          return (
            <div
              key={text}
              style={{
                opacity: interpolate(itemProgress, [0, 1], [0, 1]),
                transform: `translateY(${interpolate(itemProgress, [0, 1], [20, 0])}px)`,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <span
                style={{
                  fontFamily: FONTS.UI,
                  fontWeight: 800,
                  fontSize: SIZES.CAPTION,
                  color: COLORS.MUTED,
                }}
              >
                →
              </span>
              <span
                style={{
                  fontFamily: FONTS.UI,
                  fontWeight: FONTS.BODY_WEIGHT,
                  fontSize: SIZES.BODY,
                  color: COLORS.FG,
                  lineHeight: 1.3,
                }}
              >
                {text}
                {cursorBlink && (
                  <span style={{ color: COLORS.ACCENT }}>|</span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
