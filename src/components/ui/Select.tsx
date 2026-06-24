import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => (
    <div className="w-full">
      {label && <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>}
      <select ref={ref}
        className={cn('w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none transition-colors focus:border-gold bg-white dark:bg-dark-card dark:border-dark-border dark:text-gray-100', error && 'border-red-400', className)}
        {...props}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
)
Select.displayName = 'Select'
