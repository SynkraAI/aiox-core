import { useCurrentFrame, useVideoConfig, spring, interpolate, Easing } from "remotion";

interface Billionaire {
  name: string;
  netWorth: number;
  country: string;
  color: string;
}

const BILLIONAIRES: Billionaire[] = [
  { name: "Elon Musk", netWorth: 241, country: "🇺🇸", color: "#3B82F6" },
  { name: "Jeff Bezos", netWorth: 231, country: "🇺🇸", color: "#F97316" },
  { name: "Mark Zuckerberg", netWorth: 217, country: "🇺🇸", color: "#6366F1" },
  { name: "Larry Ellison", netWorth: 209, country: "🇺🇸", color: "#EF4444" },
  { name: "Bernard Arnault", netWorth: 174, country: "🇫🇷", color: "#8B5CF6" },
  { name: "Warren Buffett", netWorth: 162, country: "🇺🇸", color: "#10B981" },
  { name: "Larry Page", netWorth: 156, country: "🇺🇸", color: "#F59E0B" },
  { name: "Sergey Brin", netWorth: 149, country: "🇺🇸", color: "#EC4899" },
  { name: "Steve Ballmer", netWorth: 147, country: "🇺🇸", color: "#14B8A6" },
  { name: "Jensen Huang", netWorth: 127, country: "🇺🇸", color: "#84CC16" },
];

const MAX_WORTH = Math.max(...BILLIONAIRES.map((b) => b.netWorth));
const STAGGER_DELAY = 4;
const BAR_HEIGHT = 48;
const GAP = 8;

export const BillionairesChart: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title fade in
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [0, 15], [-30, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Source fade in (appears after bars)
  const sourceOpacity = interpolate(frame, [80, 95], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        flex: 1,
        background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
        padding: 60,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Title */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          marginBottom: 40,
        }}
      >
        <h1
          style={{
            color: "#F8FAFC",
            fontSize: 42,
            fontWeight: 800,
            margin: 0,
            letterSpacing: -1,
          }}
        >
          Top 10 Bilionários do Mundo
        </h1>
        <p
          style={{
            color: "#94A3B8",
            fontSize: 18,
            margin: "8px 0 0",
            fontWeight: 500,
          }}
        >
          Patrimônio líquido em bilhões (USD)
        </p>
      </div>

      {/* Bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: GAP }}>
        {BILLIONAIRES.map((person, i) => {
          const barProgress = spring({
            frame,
            fps,
            delay: 10 + i * STAGGER_DELAY,
            config: { damping: 30, stiffness: 80, mass: 0.5 },
          });

          const labelOpacity = interpolate(
            frame,
            [15 + i * STAGGER_DELAY, 25 + i * STAGGER_DELAY],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          const barWidth = barProgress * (person.netWorth / MAX_WORTH) * 100;

          return (
            <div
              key={person.name}
              style={{
                display: "flex",
                alignItems: "center",
                height: BAR_HEIGHT,
                gap: 12,
              }}
            >
              {/* Rank */}
              <div
                style={{
                  color: "#64748B",
                  fontSize: 14,
                  fontWeight: 700,
                  width: 24,
                  textAlign: "right",
                  opacity: labelOpacity,
                }}
              >
                {i + 1}
              </div>

              {/* Name + Flag */}
              <div
                style={{
                  width: 200,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  opacity: labelOpacity,
                }}
              >
                <span style={{ fontSize: 20 }}>{person.country}</span>
                <span
                  style={{
                    color: "#E2E8F0",
                    fontSize: 15,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                >
                  {person.name}
                </span>
              </div>

              {/* Bar */}
              <div
                style={{
                  flex: 1,
                  position: "relative",
                  height: "70%",
                  borderRadius: 6,
                  overflow: "hidden",
                  background: "rgba(255,255,255,0.05)",
                }}
              >
                <div
                  style={{
                    width: `${barWidth}%`,
                    height: "100%",
                    borderRadius: 6,
                    background: `linear-gradient(90deg, ${person.color}CC, ${person.color})`,
                    boxShadow: `0 0 20px ${person.color}40`,
                  }}
                />
              </div>

              {/* Value */}
              <div
                style={{
                  width: 70,
                  textAlign: "right",
                  opacity: labelOpacity,
                }}
              >
                <span
                  style={{
                    color: "#F8FAFC",
                    fontSize: 16,
                    fontWeight: 700,
                  }}
                >
                  ${person.netWorth}B
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Source */}
      <p
        style={{
          color: "#475569",
          fontSize: 13,
          marginTop: 24,
          opacity: sourceOpacity,
        }}
      >
        Fonte: Forbes Real-Time Billionaires List — 2025
      </p>
    </div>
  );
};
