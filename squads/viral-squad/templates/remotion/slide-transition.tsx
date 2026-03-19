// Slide Transition Component - Remotion
// Directional slide animations for dynamic video transitions

import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

// ============================================
// TYPES
// ============================================

type Direction = "left" | "right" | "up" | "down";

// ============================================
// SLIDE IN
// ============================================

interface SlideInProps {
  children: React.ReactNode;
  direction?: Direction;
  durationInFrames?: number;
  delay?: number;
}

export const SlideIn: React.FC<SlideInProps> = ({
  children,
  direction = "left",
  durationInFrames = 20,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const getInitialPosition = () => {
    switch (direction) {
      case "left":
        return { x: -width, y: 0 };
      case "right":
        return { x: width, y: 0 };
      case "up":
        return { x: 0, y: -height };
      case "down":
        return { x: 0, y: height };
    }
  };

  const initial = getInitialPosition();

  const progress = interpolate(frame - delay, [0, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const x = interpolate(progress, [0, 1], [initial.x, 0]);
  const y = interpolate(progress, [0, 1], [initial.y, 0]);

  return (
    <AbsoluteFill
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// ============================================
// SLIDE OUT
// ============================================

interface SlideOutProps {
  children: React.ReactNode;
  direction?: Direction;
  startFrame: number;
  durationInFrames?: number;
}

export const SlideOut: React.FC<SlideOutProps> = ({
  children,
  direction = "right",
  startFrame,
  durationInFrames = 20,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const getFinalPosition = () => {
    switch (direction) {
      case "left":
        return { x: -width, y: 0 };
      case "right":
        return { x: width, y: 0 };
      case "up":
        return { x: 0, y: -height };
      case "down":
        return { x: 0, y: height };
    }
  };

  const final = getFinalPosition();

  const progress = interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.in(Easing.cubic),
    },
  );

  const x = interpolate(progress, [0, 1], [0, final.x]);
  const y = interpolate(progress, [0, 1], [0, final.y]);

  return (
    <AbsoluteFill
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// ============================================
// SLIDE REPLACE (Push transition)
// ============================================

interface SlideReplaceProps {
  children: [React.ReactNode, React.ReactNode];
  direction?: Direction;
  transitionFrame: number;
  durationInFrames?: number;
}

export const SlideReplace: React.FC<SlideReplaceProps> = ({
  children,
  direction = "left",
  transitionFrame,
  durationInFrames = 25,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const [elementA, elementB] = children;

  const getOffset = () => {
    switch (direction) {
      case "left":
        return { x: -width, y: 0 };
      case "right":
        return { x: width, y: 0 };
      case "up":
        return { x: 0, y: -height };
      case "down":
        return { x: 0, y: height };
    }
  };

  const offset = getOffset();

  const progress = interpolate(
    frame,
    [transitionFrame, transitionFrame + durationInFrames],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    },
  );

  // Element A slides out
  const aX = interpolate(progress, [0, 1], [0, offset.x]);
  const aY = interpolate(progress, [0, 1], [0, offset.y]);

  // Element B slides in from opposite direction
  const bX = interpolate(progress, [0, 1], [-offset.x, 0]);
  const bY = interpolate(progress, [0, 1], [-offset.y, 0]);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `translate(${aX}px, ${aY}px)` }}>
        {elementA}
      </AbsoluteFill>
      <AbsoluteFill style={{ transform: `translate(${bX}px, ${bY}px)` }}>
        {elementB}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================
// SLIDE REVEAL (Wipe effect)
// ============================================

interface SlideRevealProps {
  children: React.ReactNode;
  direction?: Direction;
  durationInFrames?: number;
  delay?: number;
}

export const SlideReveal: React.FC<SlideRevealProps> = ({
  children,
  direction = "right",
  durationInFrames = 20,
  delay = 0,
}) => {
  const frame = useCurrentFrame();

  const progress = interpolate(frame - delay, [0, durationInFrames], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const getClipPath = () => {
    switch (direction) {
      case "left":
        return `inset(0 ${100 - progress}% 0 0)`;
      case "right":
        return `inset(0 0 0 ${100 - progress}%)`;
      case "up":
        return `inset(0 0 ${100 - progress}% 0)`;
      case "down":
        return `inset(${100 - progress}% 0 0 0)`;
    }
  };

  return (
    <AbsoluteFill
      style={{
        clipPath: getClipPath(),
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// ============================================
// SLIDE BOUNCE (Elastic entrance)
// ============================================

interface SlideBounceProps {
  children: React.ReactNode;
  direction?: Direction;
  durationInFrames?: number;
  delay?: number;
}

export const SlideBounce: React.FC<SlideBounceProps> = ({
  children,
  direction = "up",
  durationInFrames = 30,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const getInitialPosition = () => {
    switch (direction) {
      case "left":
        return { x: -width * 0.5, y: 0 };
      case "right":
        return { x: width * 0.5, y: 0 };
      case "up":
        return { x: 0, y: height * 0.3 };
      case "down":
        return { x: 0, y: -height * 0.3 };
    }
  };

  const initial = getInitialPosition();

  const progress = interpolate(frame - delay, [0, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.5)),
  });

  const x = interpolate(progress, [0, 1], [initial.x, 0]);
  const y = interpolate(progress, [0, 1], [initial.y, 0]);
  const opacity = interpolate(progress, [0, 0.3, 1], [0, 1, 1]);

  return (
    <AbsoluteFill
      style={{
        transform: `translate(${x}px, ${y}px)`,
        opacity,
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
// Basic slide in from left
<SlideIn direction="left" durationInFrames={20}>
  <MyScene />
</SlideIn>

// Slide in from bottom with delay
<SlideIn direction="up" delay={15}>
  <TextOverlay />
</SlideIn>

// Push transition between scenes
<SlideReplace direction="left" transitionFrame={60}>
  <Scene1 />
  <Scene2 />
</SlideReplace>

// Wipe reveal effect
<SlideReveal direction="right" durationInFrames={15}>
  <Image src={myImage} />
</SlideReveal>

// Bouncy entrance (great for text)
<SlideBounce direction="up">
  <Title>Hello World!</Title>
</SlideBounce>
*/
