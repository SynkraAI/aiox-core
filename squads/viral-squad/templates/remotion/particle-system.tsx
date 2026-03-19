// Particle System Component - Remotion
// Dynamic particle effects for visual enhancement
// TEMPLATE REFERENCE - Import paths assume Remotion project context

import React, { useMemo } from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  random,
} from "remotion";
import { colors } from "@/styles/tokens";

// ============================================
// TYPES
// ============================================

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  delay: number;
}

// ============================================
// FLOATING PARTICLES (Background ambiance)
// ============================================

interface FloatingParticlesProps {
  count?: number;
  color?: string;
  minSize?: number;
  maxSize?: number;
  speed?: number;
}

export const FloatingParticles: React.FC<FloatingParticlesProps> = ({
  count = 50,
  color = colors.primary, // Academia Lendaria Gold
  minSize = 2,
  maxSize = 6,
  speed = 1,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: random(`x-${i}`) * width,
      y: random(`y-${i}`) * height,
      size: minSize + random(`size-${i}`) * (maxSize - minSize),
      speed: 0.5 + random(`speed-${i}`) * speed,
      opacity: 0.3 + random(`opacity-${i}`) * 0.7,
      delay: random(`delay-${i}`) * 100,
    }));
  }, [count, width, height, minSize, maxSize, speed]);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {particles.map((particle) => {
        const yOffset =
          (frame * particle.speed + particle.delay) % (height + 100);
        const currentY = height - yOffset + 50;

        const drift = Math.sin((frame + particle.delay) * 0.02) * 20;

        return (
          <div
            key={particle.id}
            style={{
              position: "absolute",
              left: particle.x + drift,
              top: currentY,
              width: particle.size,
              height: particle.size,
              borderRadius: "50%",
              backgroundColor: color,
              opacity: particle.opacity,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ============================================
// CONFETTI BURST
// ============================================

interface ConfettiProps {
  startFrame?: number;
  durationInFrames?: number;
  count?: number;
  colors?: string[];
}

export const ConfettiBurst: React.FC<ConfettiProps> = ({
  startFrame = 0,
  durationInFrames = 60,
  count = 100,
  colors: particleColors = [
    colors.primary,
    colors.foreground,
    "#FFD700",
    "#FF6B6B",
    "#4ECDC4",
  ],
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: width / 2,
      y: height / 2,
      vx: (random(`vx-${i}`) - 0.5) * 30,
      vy: random(`vy-${i}`) * -20 - 10,
      rotation: random(`rot-${i}`) * 360,
      rotationSpeed: (random(`rotSpeed-${i}`) - 0.5) * 20,
      size: 5 + random(`size-${i}`) * 10,
      color: colors[Math.floor(random(`color-${i}`) * colors.length)],
    }));
  }, [count, width, height, colors]);

  const progress = frame - startFrame;

  if (progress < 0 || progress > durationInFrames) {
    return null;
  }

  const gravity = 0.5;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {particles.map((particle) => {
        const t = progress;
        const x = particle.x + particle.vx * t;
        const y = particle.y + particle.vy * t + 0.5 * gravity * t * t;
        const rotation = particle.rotation + particle.rotationSpeed * t;

        const opacity = interpolate(
          progress,
          [durationInFrames - 20, durationInFrames],
          [1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );

        return (
          <div
            key={particle.id}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: particle.size,
              height: particle.size * 0.6,
              backgroundColor: particle.color,
              transform: `rotate(${rotation}deg)`,
              opacity,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ============================================
// SPARKLE EFFECT
// ============================================

interface SparkleProps {
  x: number;
  y: number;
  size?: number;
  color?: string;
  durationInFrames?: number;
  delay?: number;
}

export const Sparkle: React.FC<SparkleProps> = ({
  x,
  y,
  size = 20,
  color = "#FFFFFF",
  durationInFrames = 30,
  delay = 0,
}) => {
  const frame = useCurrentFrame();

  const progress = interpolate(
    frame - delay,
    [0, durationInFrames / 2, durationInFrames],
    [0, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const scale = interpolate(
    frame - delay,
    [0, durationInFrames / 2, durationInFrames],
    [0, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const rotation = interpolate(frame - delay, [0, durationInFrames], [0, 180], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        opacity: progress,
        transform: `scale(${scale}) rotate(${rotation}deg)`,
      }}
    >
      {/* 4-point star */}
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <path
          d="M50 0 L55 45 L100 50 L55 55 L50 100 L45 55 L0 50 L45 45 Z"
          fill={color}
        />
      </svg>
    </div>
  );
};

// ============================================
// SPARKLE FIELD (Multiple sparkles)
// ============================================

interface SparkleFieldProps {
  count?: number;
  color?: string;
  minSize?: number;
  maxSize?: number;
}

export const SparkleField: React.FC<SparkleFieldProps> = ({
  count = 10,
  color = "#FFFFFF",
  minSize = 15,
  maxSize = 30,
}) => {
  const { width, height, durationInFrames } = useVideoConfig();

  const sparkles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: random(`sparkle-x-${i}`) * width,
      y: random(`sparkle-y-${i}`) * height,
      size: minSize + random(`sparkle-size-${i}`) * (maxSize - minSize),
      delay: Math.floor(random(`sparkle-delay-${i}`) * 60),
      duration: 20 + Math.floor(random(`sparkle-dur-${i}`) * 20),
    }));
  }, [count, width, height, minSize, maxSize]);

  return (
    <AbsoluteFill>
      {sparkles.map((sparkle) => (
        <Sparkle
          key={sparkle.id}
          x={sparkle.x}
          y={sparkle.y}
          size={sparkle.size}
          color={color}
          durationInFrames={sparkle.duration}
          delay={sparkle.delay}
        />
      ))}
    </AbsoluteFill>
  );
};

// ============================================
// DUST PARTICLES (Cinematic)
// ============================================

interface DustParticlesProps {
  count?: number;
  color?: string;
}

export const DustParticles: React.FC<DustParticlesProps> = ({
  count = 30,
  color = "#FFFFFF",
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: random(`dust-x-${i}`) * width,
      y: random(`dust-y-${i}`) * height,
      size: 1 + random(`dust-size-${i}`) * 3,
      speedX: (random(`dust-sx-${i}`) - 0.5) * 0.5,
      speedY: (random(`dust-sy-${i}`) - 0.5) * 0.3,
      opacity: 0.2 + random(`dust-op-${i}`) * 0.4,
      flickerSpeed: 0.05 + random(`dust-flicker-${i}`) * 0.1,
    }));
  }, [count, width, height]);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {particles.map((particle) => {
        const x = (particle.x + frame * particle.speedX) % width;
        const y = (particle.y + frame * particle.speedY) % height;

        // Flickering effect
        const flicker = 0.5 + Math.sin(frame * particle.flickerSpeed) * 0.5;

        return (
          <div
            key={particle.id}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: particle.size,
              height: particle.size,
              borderRadius: "50%",
              backgroundColor: color,
              opacity: particle.opacity * flicker,
              filter: "blur(0.5px)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ============================================
// USAGE EXAMPLES
// ============================================

/*
// Floating gold particles (Academia Lendária style)
<FloatingParticles
  count={40}
  color="#C9B298"
  minSize={2}
  maxSize={5}
/>

// Celebration confetti burst
<ConfettiBurst
  startFrame={60}
  durationInFrames={90}
  count={150}
/>

// Single sparkle at position
<Sparkle x={540} y={960} size={40} delay={30} />

// Field of sparkles
<SparkleField count={15} color="#FFFFFF" />

// Cinematic dust (subtle)
<DustParticles count={20} color="rgba(255,255,255,0.5)" />

// Combined effect (layered)
<AbsoluteFill>
  <DustParticles count={15} />
  <MainContent />
  <FloatingParticles count={30} color="#C9B298" />
</AbsoluteFill>
*/
