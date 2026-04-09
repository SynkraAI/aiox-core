import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { COLORS, FONTS, SIZES, TIMING } from '../tokens';

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - TIMING.HOOK_START;
  if (localFrame < 0 || frame >= TIMING.HOOK_END) return null;

  // "2x Recordista Mundial" — slides up
  const titleProgress = spring({
    frame: localFrame,
    fps,
    config: { damping: 20, stiffness: 120, mass: 0.8 },
  });
  const titleY = interpolate(titleProgress, [0, 1], [60, 0]);
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);

  // "Zero dom." — appears after title with delay
  const subtitleProgress = spring({
    frame: localFrame,
    fps,
    delay: 12,
    config: { damping: 18, stiffness: 100, mass: 0.8 },
  });
  const subtitleY = interpolate(subtitleProgress, [0, 1], [40, 0]);
  const subtitleOpacity = interpolate(subtitleProgress, [0, 1], [0, 1]);

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
        padding: SIZES.MARGIN,
        gap: 24,
      }}
    >
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontFamily: FONTS.UI,
            fontWeight: 800,
            fontSize: SIZES.HERO,
            color: COLORS.FG,
            letterSpacing: -2,
          }}
        >
          2× Recordista Mundial
        </span>
      </div>
      <div
        style={{
          opacity: subtitleOpacity,
          transform: `translateY(${subtitleY}px)`,
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontFamily: FONTS.UI,
            fontWeight: FONTS.UI_WEIGHT,
            fontSize: SIZES.TITLE,
            color: COLORS.MUTED,
            letterSpacing: -1,
          }}
        >
          Zero dom.
        </span>
      </div>
    </div>
  );
};
