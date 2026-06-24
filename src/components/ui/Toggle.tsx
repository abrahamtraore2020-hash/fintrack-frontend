'use client'
import { cn } from '@/lib/utils'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export function Toggle({ checked, onChange, disabled }: ToggleProps) {
  return (
    <button role="switch" aria-checked={checked} disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn('relative inline-flex w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-1',
        checked ? 'bg-gold' : 'bg-gray-200', disabled && 'opacity-50 cursor-not-allowed')}>
      <span className={cn('inline-block w-4 h-4 mt-0.5 rounded-full bg-white shadow transition-transform duration-200',
        checked ? 'translate-x-5' : 'translate-x-0.5')} />
    </button>
  )
}
