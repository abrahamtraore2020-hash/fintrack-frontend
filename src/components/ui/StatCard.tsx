import { cn } from '@/lib/utils'
import { Card } from './Card'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string
  change?: string
  changeType?: 'up' | 'down' | 'neutral'
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
  valueColor?: string
}

export function StatCard({ label, value, change, changeType = 'neutral', icon: Icon, iconColor = 'text-gold', iconBg = 'bg-gold-light', valueColor = 'text-gray-800' }: StatCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', iconBg)}>
          <Icon size={16} className={iconColor} />
        </div>
      </div>
      <p className={cn('text-xl font-bold', valueColor)}>{value}</p>
      {change && (
        <p className={cn('text-xs mt-1', changeType === 'up' && 'text-green-600', changeType === 'down' && 'text-red-500', changeType === 'neutral' && 'text-gray-400')}>
          {changeType === 'up' ? '↑' : changeType === 'down' ? '↓' : ''} {change}
        </p>
      )}
    </Card>
  )
}
