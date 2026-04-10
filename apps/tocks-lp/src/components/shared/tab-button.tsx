import { cn } from '@/lib/utils'

interface TabButtonProps {
  label: string
  active: boolean
  onClick: () => void
}

export default function TabButton({ label, active, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-5 py-2 rounded-full text-sm transition-all duration-300 cursor-pointer',
        active
          ? 'bg-accent text-bg-primary'
          : 'border border-border text-text-secondary hover:border-accent/40'
      )}
    >
      {label}
    </button>
  )
}
