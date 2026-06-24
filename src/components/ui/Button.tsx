import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'dark' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-gold hover:bg-gold-500 text-[#1A1A2E] font-semibold shadow-sm',
      outline: 'bg-white border border-gray-200 hover:border-gold text-gray-700',
      ghost: 'bg-transparent hover:bg-gray-100 text-gray-600',
      dark: 'bg-[#1A1A2E] hover:bg-[#0F3460] text-white',
      danger: 'bg-red-500 hover:bg-red-600 text-white',
    }
    const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2.5 text-sm', lg: 'px-6 py-3 text-base' }

    return (
      <button ref={ref} disabled={disabled || loading}
        className={cn('inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed', variants[variant], sizes[size], className)}
        {...props}>
        {loading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
