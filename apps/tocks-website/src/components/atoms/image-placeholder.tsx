interface ImagePlaceholderProps {
  aspectRatio?: string
  className?: string
  label?: string
}

export function ImagePlaceholder({
  aspectRatio = '16/9',
  className = '',
  label,
}: ImagePlaceholderProps) {
  return (
    <div
      className={`relative w-full rounded-[4px] overflow-hidden placeholder-shimmer ${className}`}
      style={{ aspectRatio }}
    >
      {label && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-xs uppercase tracking-[0.1em] text-[var(--text-secondary)] opacity-50">
            {label}
          </span>
        </div>
      )}
    </div>
  )
}
