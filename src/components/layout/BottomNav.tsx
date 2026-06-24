'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Bird, MessageSquare, Plug, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'

const NAV_ITEMS = [
  { href: '/dashboard',    icon: LayoutDashboard, label: 'Accueil' },
  { href: '/funtwit',      icon: Bird,            label: 'FunTwit' },
  { href: '/inbox',        icon: MessageSquare,   label: 'Messages' },
  { href: '/integrations', icon: Plug,            label: 'Comptes' },
  { href: '/parametres',   icon: Settings,        label: 'Profil' },
]

export function BottomNav() {
  const pathname = usePathname()
  const { unreadCount } = useAppStore()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-dark-card border-t border-gray-100 dark:border-dark-border md:hidden safe-area-pb">
      <div className="flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 py-2 rounded-xl transition-all relative',
                active ? 'text-yellow-600' : 'text-gray-400 hover:text-gray-600'
              )}>
              <div className={cn('p-1.5 rounded-xl transition-all', active ? 'bg-yellow-50 dark:bg-yellow-900/30' : '')}>
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              </div>
              <span className={cn('text-[10px] font-medium leading-none', active ? 'text-yellow-600' : 'text-gray-400')}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
