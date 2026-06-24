'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Vault, Target, Plug, Bell, Crown, BarChart2, TrendingUp, Brain, Settings, LogOut, Bird, MessageSquare, PieChart, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import { useAuth } from '@/hooks/useAuth'

const mainLinks = [
  { href: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/coffres',      icon: Vault,           label: 'Coffres' },
  { href: '/objectifs',    icon: Target,          label: 'Objectifs' },
  { href: '/integrations', icon: Plug,            label: 'Intégrations' },
  { href: '/funtwit',      icon: Bird,            label: 'FunTwit' },
  { href: '/inbox',        icon: MessageSquare,   label: 'Messages' },
]
const analyseLinks = [
  { href: '/rapports',    icon: BarChart2,   label: 'Rapports' },
  { href: '/previsions',  icon: TrendingUp,  label: 'Prévisions' },
  { href: '/conseils-ia', icon: Brain,       label: 'Conseils IA' },
  { href: '/budget',      icon: PieChart,    label: 'Budget' },
  { href: '/recurrences', icon: RefreshCw,   label: 'Récurrences' },
]
const compteLinks = [
  { href: '/notifications', icon: Bell,     label: 'Alertes',    badge: true },
  { href: '/pricing',       icon: Crown,    label: 'Mon plan' },
  { href: '/parametres',    icon: Settings, label: 'Paramètres' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen, unreadCount } = useAppStore()
  const { signOut } = useAuth()

  // Sidebar is hidden on mobile (BottomNav handles navigation there)
  if (!sidebarOpen) return null

  return (
    <aside className="hidden md:flex w-52 bg-white dark:bg-dark-card border-r border-gray-100 dark:border-dark-border flex-col py-3 px-2 flex-shrink-0">
      <SidebarSection label="Principal"  links={mainLinks}    pathname={pathname ?? ''} />
      <SidebarSection label="Analyse"    links={analyseLinks} pathname={pathname ?? ''} />
      <SidebarSection label="Compte"     links={compteLinks}  pathname={pathname ?? ''} unreadCount={unreadCount} />
      <div className="mt-auto">
        <button onClick={signOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-colors">
          <LogOut size={15} /> Déconnexion
        </button>
      </div>
    </aside>
  )
}

function SidebarSection({ label, links, pathname, unreadCount }: {
  label: string; links: any[]; pathname: string; unreadCount?: number
}) {
  return (
    <div className="mb-4">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-1.5">{label}</p>
      {links.map(({ href, icon: Icon, label, badge }) => (
        <Link key={href} href={href}
          className={cn(
            'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors mb-0.5',
            pathname === href
              ? 'bg-gold-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:hover:bg-dark-bg dark:hover:text-gray-300'
          )}>
          <Icon size={15} />
          {label}
          {badge && unreadCount && unreadCount > 0 ? (
            <span className="ml-auto bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">{unreadCount}</span>
          ) : null}
        </Link>
      ))}
    </div>
  )
}
