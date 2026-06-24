import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  max?: number
  color?: string
  height?: string
  animated?: boolean
  className?: string
}

export function ProgressBar({ value, max = 100, color = '#FFD700', height = 'h-1.5', animated = true, className }: ProgressBarProps) {
  const pct = Math.min(Math.round((value / max) * 100), 100)
  return (
    <div className={cn('w-full bg-gray-100 rounded-full overflow-hidden', height, className)}>
      <div className={cn('h-full rounded-full transition-all duration-700', animated && 'animate-progress')}
        style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  )
}
