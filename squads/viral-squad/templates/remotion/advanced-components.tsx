// Advanced Remotion Components - Academia Lendaria v4.1
// Collection of viral-optimized components for Instagram Reels
// TEMPLATE REFERENCE - Import paths assume Remotion project context

import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  Easing,
} from "remotion";
import React from "react";
import { colors, typography, animation } from "@/styles/tokens";

// ============================================
// 1. FADE TRANSITION - Smooth Fades
// ============================================

export const FadeTransition: React.FC<{
  children: React.ReactNode;
  startFrame: number;
  durationInFrames: number;
  fadeIn?: boolean;
  fadeOut?: boolean;
}> = ({
  children,
  startFrame,
  durationInFrames,
  fadeIn = true,
  fadeOut = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeInDuration = 10; // frames
  const fadeOutDuration = 10; // frames

  let opacity = 1;

  if (fadeIn && frame < startFrame + fadeInDuration) {
    opacity = interpolate(
      frame,
      [startFrame, startFrame + fadeInDuration],
      [0, 1],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      },
    );
  }

  if (fadeOut && frame > startFrame + durationInFrames - fadeOutDuration) {
    opacity = interpolate(
      frame,
      [
        startFrame + durationInFrames - fadeOutDuration,
        startFrame + durationInFrames,
      ],
      [1, 0],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      },
    );
  }

  return <div style={{ opacity }}>{children}</div>;
};

// ============================================
// 2. SLIDE TRANSITION - Directional Slides
// ============================================

type SlideDirection = "left" | "right" | "up" | "down";

export const SlideTransition: React.FC<{
  children: React.ReactNode;
  startFrame: number;
  direction?: SlideDirection;
  durationInFrames?: number;
}> = ({ children, startFrame, direction = "left", durationInFrames = 20 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const progress = interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Ease-in-out
    },
  );

  let translateX = 0;
  let translateY = 0;

  switch (direction) {
    case "left":
      translateX = interpolate(progress, [0, 1], [width, 0]);
      break;
    case "right":
      translateX = interpolate(progress, [0, 1], [-width, 0]);
      break;
    case "up":
      translateY = interpolate(progress, [0, 1], [height, 0]);
      break;
    case "down":
      translateY = interpolate(progress, [0, 1], [-height, 0]);
      break;
  }

  return (
    <div
      style={{
        transform: `translate(${translateX}px, ${translateY}px)`,
      }}
    >
      {children}
    </div>
  );
};

// ============================================
// 3. SPLIT SCREEN - Before/After or Comparison
// ============================================

export const SplitScreen: React.FC<{
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
  splitPosition?: number; // 0-100 (default 50)
  animateSplit?: boolean;
  startFrame?: number;
}> = ({
  leftContent,
  rightContent,
  splitPosition = 50,
  animateSplit = false,
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();

  let position = splitPosition;

  if (animateSplit) {
    position = interpolate(
      frame,
      [startFrame, startFrame + 30],
      [0, splitPosition],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.bezier(0.33, 1, 0.68, 1),
      },
    );
  }

  return (
    <AbsoluteFill>
      {/* Left Side */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: `${position}%`,
          height: "100%",
          overflow: "hidden",
        }}
      >
        {leftContent}
      </div>

      {/* Right Side */}
      <div
        style={{
          position: "absolute",
          left: `${position}%`,
          top: 0,
          width: `${100 - position}%`,
          height: "100%",
          overflow: "hidden",
        }}
      >
        {rightContent}
      </div>

      {/* Divider Line (Gold) */}
      <div
        style={{
          position: "absolute",
          left: `${position}%`,
          top: 0,
          width: "4px",
          height: "100%",
          backgroundColor: colors.primary, // Gold
          transform: "translateX(-50%)",
        }}
      />
    </AbsoluteFill>
  );
};

// ============================================
// 4. COUNT UP ANIMATION - Numbers/Statistics
// ============================================

export const CountUpAnimation: React.FC<{
  from: number;
  to: number;
  startFrame: number;
  durationInFrames?: number;
  suffix?: string;
  prefix?: string;
  fontSize?: number;
  color?: string;
}> = ({
  from,
  to,
  startFrame,
  durationInFrames = 60,
  suffix = "",
  prefix = "",
  fontSize = 96,
  color = colors.primary,
}) => {
  const frame = useCurrentFrame();

  const value = interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [from, to],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    },
  );

  // Format number (add commas for thousands)
  const formattedValue = Math.round(value).toLocaleString("pt-BR");

  return (
    <div
      style={{
        fontFamily: typography.ui,
        fontSize,
        fontWeight: 700,
        color,
        textAlign: "center",
      }}
    >
      {prefix}
      {formattedValue}
      {suffix}
    </div>
  );
};

// ============================================
// 5. BOUNCE ENTRANCE - Spring Animation
// ============================================

export const BounceEntrance: React.FC<{
  children: React.ReactNode;
  startFrame: number;
  overshoot?: number;
}> = ({ children, startFrame, overshoot = 1.2 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame: frame - startFrame,
    fps,
    config: {
      damping: 10,
      stiffness: 100,
      mass: 0.5,
      overshootClamping: false,
    },
  });

  return (
    <div
      style={{
        transform: `scale(${scale})`,
      }}
    >
      {children}
    </div>
  );
};

// ============================================
// 6. TEXT REVEAL - Word by Word
// ============================================

export const TextReveal: React.FC<{
  text: string;
  startFrame: number;
  durationPerWord?: number;
  fontSize?: number;
  color?: string;
}> = ({
  text,
  startFrame,
  durationPerWord = 8,
  fontSize = 48,
  color = colors.foreground,
}) => {
  const frame = useCurrentFrame();
  const words = text.split(" ");

  return (
    <div
      style={{
        fontFamily: typography.ui,
        fontSize,
        fontWeight: 600,
        color,
        textAlign: "center",
        lineHeight: 1.4,
      }}
    >
      {words.map((word, index) => {
        const wordStartFrame = startFrame + index * durationPerWord;
        const opacity = interpolate(
          frame,
          [wordStartFrame, wordStartFrame + durationPerWord / 2],
          [0, 1],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        );

        return (
          <span
            key={index}
            style={{
              opacity,
              display: "inline-block",
              marginRight: "8px",
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

// ============================================
// 7. PROGRESS BAR - Visual Progress Indicator
// ============================================

export const ProgressBar: React.FC<{
  progress: number; // 0-100
  height?: number;
  backgroundColor?: string;
  fillColor?: string;
  animated?: boolean;
  startFrame?: number;
}> = ({
  progress,
  height = 8,
  backgroundColor = "#333333",
  fillColor = colors.primary,
  animated = true,
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();

  let displayProgress = progress;

  if (animated) {
    displayProgress = interpolate(
      frame,
      [startFrame, startFrame + 30],
      [0, progress],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      },
    );
  }

  return (
    <div
      style={{
        width: "80%",
        height,
        backgroundColor,
        borderRadius: height / 2,
        overflow: "hidden",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          width: `${displayProgress}%`,
          height: "100%",
          backgroundColor: fillColor,
          borderRadius: height / 2,
          transition: "width 0.3s ease",
        }}
      />
    </div>
  );
};

// ============================================
// 8. PULSE ANIMATION - Attention Grabber
// ============================================

export const PulseAnimation: React.FC<{
  children: React.ReactNode;
  startFrame: number;
  pulseCount?: number;
  pulseDuration?: number;
}> = ({ children, startFrame, pulseCount = 3, pulseDuration = 20 }) => {
  const frame = useCurrentFrame();

  const totalDuration = pulseCount * pulseDuration;
  const localFrame = (frame - startFrame) % pulseDuration;

  const scale = interpolate(
    localFrame,
    [0, pulseDuration / 2, pulseDuration],
    [1, 1.1, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  const shouldAnimate =
    frame >= startFrame && frame < startFrame + totalDuration;

  return (
    <div
      style={{
        transform: shouldAnimate ? `scale(${scale})` : "scale(1)",
      }}
    >
      {children}
    </div>
  );
};

// ============================================
// 9. ROTATE ENTRANCE - 3D-like Rotation
// ============================================

export const RotateEntrance: React.FC<{
  children: React.ReactNode;
  startFrame: number;
  durationInFrames?: number;
  axis?: "x" | "y" | "z";
}> = ({ children, startFrame, durationInFrames = 20, axis = "y" }) => {
  const frame = useCurrentFrame();

  const rotation = interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [90, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.33, 1, 0.68, 1),
    },
  );

  const opacity = interpolate(
    frame,
    [startFrame, startFrame + durationInFrames / 2],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  let transform = "";
  switch (axis) {
    case "x":
      transform = `perspective(1000px) rotateX(${rotation}deg)`;
      break;
    case "y":
      transform = `perspective(1000px) rotateY(${rotation}deg)`;
      break;
    case "z":
      transform = `perspective(1000px) rotateZ(${rotation}deg)`;
      break;
  }

  return (
    <div
      style={{
        transform,
        opacity,
      }}
    >
      {children}
    </div>
  );
};

// ============================================
// 10. GLITCH EFFECT - Trendy Glitch Animation
// ============================================

export const GlitchEffect: React.FC<{
  children: React.ReactNode;
  active: boolean;
  intensity?: number;
}> = ({ children, active, intensity = 5 }) => {
  const frame = useCurrentFrame();

  if (!active) {
    return <div>{children}</div>;
  }

  const glitchX = Math.sin(frame * 0.5) * intensity;
  const glitchY = Math.cos(frame * 0.7) * intensity;

  return (
    <div style={{ position: "relative" }}>
      {/* Original */}
      <div style={{ position: "relative", zIndex: 3 }}>{children}</div>

      {/* Red Channel */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: glitchX,
          zIndex: 1,
          opacity: 0.8,
          mixBlendMode: "screen",
          color: "#FF0000",
        }}
      >
        {children}
      </div>

      {/* Blue Channel */}
      <div
        style={{
          position: "absolute",
          top: glitchY,
          left: -glitchX,
          zIndex: 2,
          opacity: 0.8,
          mixBlendMode: "screen",
          color: "#00FFFF",
        }}
      >
        {children}
      </div>
    </div>
  );
};

// ============================================
// USAGE EXAMPLES
// ============================================

/*
// Example 1: Fade Transition
<FadeTransition startFrame={0} durationInFrames={120} fadeIn fadeOut>
  <YourComponent />
</FadeTransition>

// Example 2: Split Screen Before/After
<SplitScreen
  leftContent={<BeforeContent />}
  rightContent={<AfterContent />}
  splitPosition={50}
  animateSplit
  startFrame={30}
/>

// Example 3: Count Up Animation
<CountUpAnimation
  from={0}
  to={10000000}
  startFrame={60}
  durationInFrames={90}
  suffix=" views"
  prefix="+"
  fontSize={120}
  color={colors.primary}
/>

// Example 4: Bounce Entrance
<BounceEntrance startFrame={0}>
  <h1>VIRAL!</h1>
</BounceEntrance>

// Example 5: Progress Bar
<ProgressBar
  progress={75}
  animated
  startFrame={30}
  fillColor={colors.primary}
/>
*/
