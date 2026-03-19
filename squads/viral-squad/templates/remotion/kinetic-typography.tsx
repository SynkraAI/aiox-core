// Kinetic Typography Component - Remotion
// TEMPLATE REFERENCE - Import paths assume Remotion project context

import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, typography, animation } from "@/styles/tokens";

export const KineticText: React.FC<{
  text: string;
  startFrame: number;
  color?: string;
  delay?: number;
}> = ({ text, startFrame, color = colors.foreground, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const adjustedFrame = frame - startFrame - delay;

  const opacity = interpolate(adjustedFrame, [0, animation.fast], [0, 1], {
    extrapolateRight: "clamp",
  });

  const scale = interpolate(adjustedFrame, [0, animation.normal], [0.8, 1], {
    extrapolateRight: "clamp",
  });

  const y = interpolate(adjustedFrame, [0, animation.normal], [50, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        fontSize: typography.sizes.headline,
        fontWeight: typography.weights.semibold,
        fontFamily: typography.ui,
        color,
        opacity,
        transform: `scale(${scale}) translateY(${y}px)`,
        textAlign: "center",
      }}
    >
      {text}
    </div>
  );
};
