'use client'
import { useState, useRef, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface TooltipProps {
  content: string
  children: ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

export function Tooltip({ content, children, position = 'top', className }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  if (!content) return <>{children}</>

  const show = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setVisible(true)
  }
  const hide = (delay = 100) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setVisible(false), delay)
  }

  const bubbleClass = {
    top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left:   'right-full top-1/2 -translate-y-1/2 mr-2',
    right:  'left-full top-1/2 -translate-y-1/2 ml-2',
  }[position]

  return (
    <div
      className={cn('relative', className ?? 'inline-flex')}
      onMouseEnter={show}
      onMouseLeave={() => hide(120)}
      onTouchStart={show}
      onTouchEnd={() => hide(2200)}
    >
      {children}
      {visible && (
        <div className={`absolute z-[300] pointer-events-none ${bubbleClass}`} role="tooltip">
          <div className="bg-gray-900 dark:bg-gray-700 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg shadow-xl max-w-[190px] whitespace-normal text-center leading-snug">
            {content}
          </div>
        </div>
      )}
    </div>
  )
}
