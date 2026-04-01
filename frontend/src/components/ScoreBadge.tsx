import { cn } from '@/lib/utils'

interface ScoreBadgeProps {
  score: number
  className?: string
}

export function ScoreBadge({ score, className }: ScoreBadgeProps) {
  const color =
    score >= 85
      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      : score >= 60
        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
        : 'bg-red-500/20 text-red-400 border-red-500/30'

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold tabular-nums',
        color,
        className
      )}
    >
      {score}
    </span>
  )
}
