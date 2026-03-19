// Fade Transition Component - Remotion
// Smooth opacity-based transitions for professional video editing
// TEMPLATE REFERENCE - Import paths assume Remotion project context

import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from "remotion";
import { colors } from "@/styles/tokens";

// ============================================
// FADE IN
// ============================================

interface FadeInProps {
  children: React.ReactNode;
  durationInFrames?: number;
  delay?: number;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  durationInFrames = 15,
  delay = 0,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame - delay, [0, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

// ============================================
// FADE OUT
// ============================================

interface FadeOutProps {
  children: React.ReactNode;
  durationInFrames?: number;
  startFrame: number;
}

export const FadeOut: React.FC<FadeOutProps> = ({
  children,
  durationInFrames = 15,
  startFrame,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

// ============================================
// CROSSFADE (Between two elements)
// ============================================

interface CrossfadeProps {
  children: [React.ReactNode, React.ReactNode];
  transitionFrame: number;
  durationInFrames?: number;
}

export const Crossfade: React.FC<CrossfadeProps> = ({
  children,
  transitionFrame,
  durationInFrames = 20,
}) => {
  const frame = useCurrentFrame();
  const [elementA, elementB] = children;

  const progress = interpolate(
    frame,
    [transitionFrame, transitionFrame + durationInFrames],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: 1 - progress }}>{elementA}</AbsoluteFill>
      <AbsoluteFill style={{ opacity: progress }}>{elementB}</AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================
// FADE TO BLACK
// ============================================

interface FadeToBlackProps {
  startFrame: number;
  durationInFrames?: number;
  color?: string;
}

export const FadeToBlack: React.FC<FadeToBlackProps> = ({
  startFrame,
  durationInFrames = 15,
  color = colors.background,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: color,
        opacity,
      }}
    />
  );
};

// ============================================
// FADE FROM BLACK
// ============================================

interface FadeFromBlackProps {
  durationInFrames?: number;
  delay?: number;
  color?: string;
}

export const FadeFromBlack: React.FC<FadeFromBlackProps> = ({
  durationInFrames = 15,
  delay = 0,
  color = colors.background,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame - delay, [0, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: color,
        opacity,
      }}
    />
  );
};

// ============================================
// FADE WITH SCALE (Zoom fade)
// ============================================

interface FadeWithScaleProps {
  children: React.ReactNode;
  durationInFrames?: number;
  delay?: number;
  initialScale?: number;
  finalScale?: number;
}

export const FadeWithScale: React.FC<FadeWithScaleProps> = ({
  children,
  durationInFrames = 20,
  delay = 0,
  initialScale = 0.9,
  finalScale = 1,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame - delay, [0, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scale = interpolate(
    frame - delay,
    [0, durationInFrames],
    [initialScale, finalScale],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  return (
    <AbsoluteFill
      style={{
        opacity,
        transform: `scale(${scale})`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// ============================================
// USAGE EXAMPLES
// ============================================

/*
// Simple Fade In
<FadeIn durationInFrames={20}>
  <MyComponent />
</FadeIn>

// Fade In with Delay
<FadeIn durationInFrames={15} delay={30}>
  <Text>Appears after 1 second</Text>
</FadeIn>

// Crossfade between scenes
<Crossfade transitionFrame={60} durationInFrames={20}>
  <Scene1 />
  <Scene2 />
</Crossfade>

// Fade to black at end
<Sequence from={150}>
  <FadeToBlack startFrame={0} durationInFrames={30} />
</Sequence>

// Open with fade from black
<FadeFromBlack durationInFrames={20} />

// Zoom fade in (cinematic)
<FadeWithScale initialScale={1.1} finalScale={1}>
  <HeroImage />
</FadeWithScale>
*/
