'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Vault, Target, Plug, Bell, Crown, BarChart2, TrendingUp, Brain, Settings, LogOut, Bird, MessageSquare, PieChart, RefreshCw, Gift, CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import { useAuth } from '@/hooks/useAuth'
import { useT } from '@/hooks/useT'
import { Tooltip } from '@/components/ui/Tooltip'

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen, unreadCount } = useAppStore()
  const { signOut } = useAuth()
  const t = useT()

  const mainLinks = [
    { href: '/dashboard',    icon: LayoutDashboard, label: t('nav_dashboard'),    tooltip: 'Résumé de vos finances du mois en cours' },
    { href: '/coffres',      icon: Vault,           label: t('nav_coffres'),      tooltip: 'Enveloppes d\'épargne pour chaque projet' },
    { href: '/objectifs',    icon: Target,          label: t('nav_objectifs'),    tooltip: 'Suivez l\'avancement de vos objectifs' },
    { href: '/integrations', icon: Plug,            label: t('nav_integrations'), tooltip: 'Connectez Wave, Orange Money, Stripe…', soon: true },
    { href: '/funtwit',      icon: Bird,            label: t('nav_funtwit'),      tooltip: 'Communauté de conseils et partages financiers' },
    { href: '/inbox',        icon: MessageSquare,   label: t('nav_inbox'),        tooltip: 'Vos messages et notifications non lus' },
  ]
  const analyseLinks = [
    { href: '/planification', icon: CalendarDays, label: t('nav_planification'), tooltip: 'Planifiez votre budget mois par mois' },
    { href: '/rapports',      icon: BarChart2,    label: t('nav_rapports'),      tooltip: 'Analyses détaillées de vos finances' },
    { href: '/previsions',    icon: TrendingUp,   label: 'Prévisions',           tooltip: 'Projections financières intelligentes' },
    { href: '/conseils-ia',   icon: Brain,        label: t('nav_conseils'),      tooltip: 'Recommandations personnalisées par l\'IA' },
    { href: '/budget',        icon: PieChart,     label: t('nav_budget'),        tooltip: 'Gérez votre budget par catégorie' },
    { href: '/recurrences',   icon: RefreshCw,    label: t('nav_recurrences'),   tooltip: 'Abonnements et paiements réguliers' },
  ]
  const compteLinks = [
    { href: '/notifications', icon: Bell,     label: 'Alertes',            badge: true, tooltip: 'Alertes et seuils financiers configurables' },
    { href: '/pricing',       icon: Crown,    label: t('nav_pricing'),              tooltip: 'Gérez votre abonnement FINTRACK' },
    { href: '/affiliation',   icon: Gift,     label: t('nav_affiliation'),          tooltip: 'Parrainez vos proches et gagnez des récompenses' },
    { href: '/parametres',    icon: Settings, label: t('nav_parametres'),           tooltip: 'Profil, sécurité et préférences d\'affichage' },
  ]

  if (!sidebarOpen) return null

  return (
    <aside className="hidden md:flex w-52 bg-white dark:bg-dark-card border-r border-gray-100 dark:border-dark-border flex-col py-3 px-2 flex-shrink-0">
      <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 mb-2">
        <img src="/logo.svg" alt="FINTRACK" className="w-8 h-8 rounded-xl" />
        <span className="font-bold text-gray-800 dark:text-white text-sm tracking-wide">FIN<span className="text-gold">TRACK</span></span>
      </Link>
      <SidebarSection label="Principal"  links={mainLinks}    pathname={pathname ?? ''} />
      <SidebarSection label="Analyse"    links={analyseLinks} pathname={pathname ?? ''} />
      <SidebarSection label="Compte"     links={compteLinks}  pathname={pathname ?? ''} unreadCount={unreadCount} />
      <div className="mt-auto">
        <Tooltip content="Se déconnecter de votre compte FINTRACK" position="right" className="block">
          <button onClick={signOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-colors">
            <LogOut size={15} /> {t('logout')}
          </button>
        </Tooltip>
      </div>
    </aside>
  )
}

function SidebarSection({ label, links, pathname, unreadCount }: {
  label: string
  links: Array<{ href: string; icon: any; label: string; badge?: boolean; tooltip?: string; soon?: boolean }>
  pathname: string
  unreadCount?: number
}) {
  return (
    <div className="mb-4">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-1.5">{label}</p>
      {links.map(({ href, icon: Icon, label, badge, tooltip, soon }) => (
        <Tooltip key={href} content={tooltip ?? ''} position="right" className="block">
          <Link href={href}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors mb-0.5',
              pathname === href
                ? 'bg-gold-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:hover:bg-dark-bg dark:hover:text-gray-300'
            )}>
            <Icon size={15} />
            {label}
            {soon && (
              <span className="ml-auto text-[8px] font-bold bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-1.5 py-0.5 rounded-full tracking-wide">
                Bientôt
              </span>
            )}
            {badge && !soon && unreadCount && unreadCount > 0 ? (
              <span className="ml-auto bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">{unreadCount}</span>
            ) : null}
          </Link>
        </Tooltip>
      ))}
    </div>
  )
}
