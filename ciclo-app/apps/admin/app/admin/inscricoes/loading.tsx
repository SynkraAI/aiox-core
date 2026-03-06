import { Skeleton } from '@ciclo/ui'

export default function InscriçõesLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-40 bg-base-dark/10" />
      <Skeleton className="h-4 w-64 bg-base-dark/10" />
      <Skeleton className="mt-4 h-64 rounded-lg bg-base-dark/10" />
    </div>
  )
}
