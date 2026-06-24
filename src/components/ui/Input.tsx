import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => (
    <div className="w-full">
      {label && <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>}
        <input ref={ref}
          className={cn('w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none transition-colors placeholder:text-gray-300 focus:border-gold bg-white dark:bg-dark-card dark:border-dark-border dark:text-gray-100',
            icon && 'pl-10', error && 'border-red-400', className)}
          {...props} />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
)
Input.displayName = 'Input'
