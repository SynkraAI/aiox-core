/**
 * ViralStatCard - Componente Remotion
 * Adaptado do 21st.dev para videos virais
 * Design System: Academia Lendaria v4.1
 *
 * TEMPLATE REFERENCE - Import paths assume Remotion project context
 *
 * @usage
 * <Sequence from={0} durationInFrames={150}>
 *   <ViralStatCard
 *     title="Resultados Explosivos"
 *     stats={[
 *       { label: "Views", value: "2.4M", trend: "+12.5%" },
 *       { label: "Likes", value: "184K", trend: "+8.3%" },
 *     ]}
 *   />
 * </Sequence>
 */

import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { colors, typography, spacing, animation } from "@/styles/tokens";

// ============================================
// TYPES
// ============================================
interface StatItem {
  label: string;
  value: string;
  trend?: string;
  icon?: "views" | "likes" | "shares" | "engagement";
}

interface ViralStatCardProps {
  title?: string;
  stats: StatItem[];
  showTrends?: boolean;
  animationStyle?: "fade" | "scale" | "slide" | "stagger";
}

// ============================================
// ICONS (inline SVG for Remotion compatibility)
// ============================================
const Icons = {
  views: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke={colors.primary}
      strokeWidth="2"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  likes: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke={colors.primary}
      strokeWidth="2"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  shares: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke={colors.primary}
      strokeWidth="2"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  ),
  engagement: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke={colors.primary}
      strokeWidth="2"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
};

// ============================================
// STAT ITEM COMPONENT
// ============================================
const StatItemComponent: React.FC<{
  stat: StatItem;
  index: number;
  frame: number;
  fps: number;
  showTrends: boolean;
}> = ({ stat, index, frame, fps, showTrends }) => {
  const delay = index * 8;
  const adjustedFrame = Math.max(0, frame - delay);

  const opacity = interpolate(adjustedFrame, [0, animation.normal], [0, 1], {
    extrapolateRight: "clamp",
  });

  const translateY = interpolate(
    adjustedFrame,
    [0, animation.normal],
    [20, 0],
    {
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    },
  );

  const scale = spring({
    frame: adjustedFrame,
    fps,
    config: {
      ...animation.easing.snappy,
      mass: 0.5,
    },
  });

  const icon = stat.icon ? Icons[stat.icon] : Icons.views;

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: spacing.sm,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: spacing.xs,
          color: colors.muted,
        }}
      >
        {icon}
        <span
          style={{
            fontSize: typography.sizes.tiny * 0.67,
            textTransform: "uppercase",
            letterSpacing: 2,
            fontFamily: typography.ui,
            fontWeight: typography.weights.semibold,
          }}
        >
          {stat.label}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: spacing.sm * 0.75,
        }}
      >
        <span
          style={{
            fontSize: typography.sizes.subtitle * 1.2,
            fontWeight: typography.weights.bold,
            color: colors.foreground,
            fontFamily: typography.ui,
            letterSpacing: -1,
          }}
        >
          {stat.value}
        </span>

        {showTrends && stat.trend && (
          <span
            style={{
              fontSize: typography.sizes.tiny * 0.78,
              color: colors.primary,
              fontFamily: typography.ui,
              fontWeight: typography.weights.semibold,
              opacity: interpolate(adjustedFrame, [25, 35], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            {stat.trend}
          </span>
        )}
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
export const ViralStatCard: React.FC<ViralStatCardProps> = ({
  title = "Performance",
  stats,
  showTrends = true,
  animationStyle = "stagger",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const cardScale = spring({
    frame,
    fps,
    config: animation.easing.gentle,
  });

  const lineWidth = interpolate(
    frame,
    [animation.normal, animation.slow + 5],
    [0, 60],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    },
  );

  const glowOpacity = interpolate(frame, [0, 30, 60, 90], [0, 0.3, 0.5, 0.3], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.background,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: spacing.xxl,
      }}
    >
      <div
        style={{
          opacity: cardOpacity,
          transform: `scale(${cardScale})`,
          backgroundColor: colors.background,
          border: `1px solid rgba(201, 178, 152, ${glowOpacity})`,
          borderRadius: 16,
          padding: spacing.lg,
          maxWidth: 500,
          width: "100%",
          boxShadow: `0 0 40px rgba(201, 178, 152, ${glowOpacity * 0.3})`,
        }}
      >
        <div
          style={{
            borderBottom: `1px solid rgba(201, 178, 152, 0.2)`,
            paddingBottom: 20,
            marginBottom: spacing.md,
          }}
        >
          <h3
            style={{
              fontSize: typography.sizes.small,
              fontWeight: typography.weights.semibold,
              color: colors.foreground,
              fontFamily: typography.ui,
              letterSpacing: -0.5,
              margin: 0,
            }}
          >
            {title}
          </h3>

          <div
            style={{
              marginTop: spacing.xs,
              height: 2,
              width: lineWidth,
              background: `linear-gradient(90deg, ${colors.primary}, transparent)`,
              borderRadius: 1,
            }}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: stats.length > 2 ? "1fr 1fr" : "1fr",
            gap: spacing.sm,
          }}
        >
          {stats.map((stat, index) => (
            <StatItemComponent
              key={stat.label}
              stat={stat}
              index={index}
              frame={frame}
              fps={fps}
              showTrends={showTrends}
            />
          ))}
        </div>

        <div
          style={{
            marginTop: spacing.md,
            paddingTop: spacing.sm,
            borderTop: `1px solid rgba(201, 178, 152, 0.2)`,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 40,
              height: 3,
              backgroundColor: colors.primary,
              borderRadius: 2,
              opacity: interpolate(frame, [50, 60], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================
// PRESET CONFIGURATIONS
// ============================================
export const ViralStatCardPresets = {
  videoMetrics: {
    title: "Video Performance",
    stats: [
      {
        label: "Views",
        value: "2.4M",
        trend: "+12.5%",
        icon: "views" as const,
      },
      { label: "Likes", value: "184K", trend: "+8.3%", icon: "likes" as const },
      {
        label: "Shares",
        value: "42.3K",
        trend: "+15.7%",
        icon: "shares" as const,
      },
      { label: "Engagement", value: "7.8%", icon: "engagement" as const },
    ],
  },
  growthMetrics: {
    title: "Growth This Month",
    stats: [
      {
        label: "Followers",
        value: "+50K",
        trend: "+340%",
        icon: "likes" as const,
      },
      { label: "Reach", value: "12M", trend: "+89%", icon: "views" as const },
    ],
  },
  singleStat: {
    title: "Milestone Reached",
    stats: [{ label: "Total Views", value: "10M+", icon: "views" as const }],
  },
};

export default ViralStatCard;
