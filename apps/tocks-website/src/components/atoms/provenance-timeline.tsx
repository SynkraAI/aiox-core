/**
 * ProvenanceTimeline -- atom (SSR-safe, puro).
 *
 * 4 marcos (desenho -> corte -> acabamento -> entrega) ligados por linha
 * horizontal --bone-rule. Dots em gold-500 (non-text decorativo, OK S-8.1
 * Rule 1). Datas em Space Grotesk 12px tabular-nums.
 *
 * Story S-8.3 AC-3 block 2. Tufte: sem grade, sem label-bloat — a propria
 * tipografia + espacamento carrega a narrativa temporal.
 *
 * Art. VII: < 100 linhas.
 */

interface TimelineMarker {
  label: string
  date: string
}

interface ProvenanceTimelineProps {
  markers: [TimelineMarker, TimelineMarker, TimelineMarker, TimelineMarker]
}

export function ProvenanceTimeline({ markers }: ProvenanceTimelineProps) {
  return (
    <ol className="relative flex items-start justify-between gap-2 pt-4">
      {/* hairline connecting all dots — sits behind */}
      <span
        aria-hidden="true"
        className="absolute left-[10px] right-[10px] top-[18px] h-px bg-[var(--bone-rule)]"
      />
      {markers.map((m) => (
        <li
          key={m.label}
          className="relative flex min-w-0 flex-col items-start gap-2"
        >
          <span
            aria-hidden="true"
            className="relative z-10 block h-[9px] w-[9px] rounded-full"
            style={{ backgroundColor: 'var(--gold-500)' }}
          />
          <span className="font-display text-[11px] uppercase tracking-[0.18em] text-[var(--bone-ink)]/70">
            {m.label}
          </span>
          <span className="font-display text-xs tabular-nums text-[var(--bone-ink)]">
            {m.date}
          </span>
        </li>
      ))}
    </ol>
  )
}
