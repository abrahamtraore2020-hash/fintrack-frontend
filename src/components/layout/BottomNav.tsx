'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Bird, MessageSquare, Plug, Settings,
  Grid3X3, BarChart2, TrendingUp, Brain, PieChart, RefreshCw,
  Bell, CreditCard, Target, Vault, X, Gift, CalendarDays, Shield
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import { Tooltip } from '@/components/ui/Tooltip'

const NAV_ITEMS = [
  { href: '/dashboard',    icon: LayoutDashboard, label: 'Accueil', tooltip: 'Tableau de bord financier' },
  { href: '/funtwit',      icon: Bird,            label: 'FunTwit', tooltip: 'Communauté de conseils financiers' },
  { href: '/inbox',        icon: MessageSquare,   label: 'Messages', tooltip: 'Vos messages et notifications' },
  { href: '/integrations', icon: Plug,            label: 'Comptes',  tooltip: 'Gérez vos comptes connectés' },
  { href: '/parametres',   icon: Settings,        label: 'Profil',   tooltip: 'Paramètres et profil utilisateur' },
]

const MORE_SECTIONS = [
  {
    label: 'Épargne',
    items: [
      { href: '/coffres',   icon: Vault,   label: 'Coffres',   color: 'bg-purple-100 text-purple-600', tooltip: 'Enveloppes d\'épargne pour vos projets' },
      { href: '/objectifs', icon: Target,  label: 'Objectifs', color: 'bg-blue-100 text-blue-600',    tooltip: 'Progressez vers vos objectifs financiers' },
    ],
  },
  {
    label: 'Analyse',
    items: [
      { href: '/planification', icon: CalendarDays, label: 'Planification', color: 'bg-yellow-100 text-yellow-700', tooltip: 'Planifiez votre budget mensuel' },
      { href: '/rapports',      icon: BarChart2,    label: 'Rapports',      color: 'bg-green-100 text-green-600',  tooltip: 'Analyses détaillées de vos finances' },
      { href: '/previsions',    icon: TrendingUp,   label: 'Prévisions',    color: 'bg-cyan-100 text-cyan-600',    tooltip: 'Projections financières intelligentes' },
      { href: '/conseils-ia',   icon: Brain,        label: 'Conseils IA',   color: 'bg-indigo-100 text-indigo-600', tooltip: 'Recommandations personnalisées par IA' },
    ],
  },
  {
    label: 'Budget',
    items: [
      { href: '/budget',      icon: PieChart,  label: 'Budget',      color: 'bg-orange-100 text-orange-600', tooltip: 'Gérez votre budget par catégorie' },
      { href: '/recurrences', icon: RefreshCw, label: 'Récurrences', color: 'bg-yellow-100 text-yellow-700', tooltip: 'Abonnements et paiements réguliers' },
    ],
  },
  {
    label: 'Compte',
    items: [
      { href: '/notifications', icon: Bell,       label: 'Alertes',   color: 'bg-red-100 text-red-500',       tooltip: 'Configurez vos alertes financières' },
      { href: '/pricing',       icon: CreditCard, label: 'Mon plan',  color: 'bg-gold-100 text-yellow-700',   tooltip: 'Gérez votre abonnement FINTRACK' },
      { href: '/affiliation',   icon: Gift,       label: 'Affiliation', color: 'bg-green-100 text-green-600', tooltip: 'Parrainez et gagnez des récompenses' },
    ],
  },
]

export function BottomNav() {
  const pathname = usePathname()
  const { unreadCount, user } = useAppStore()
  const [showMore, setShowMore] = useState(false)

  const sections = [
    ...MORE_SECTIONS,
    ...(user?.role ? [{
      label: 'Équipe',
      items: [{ href: '/admin', icon: Shield, label: 'Admin', color: 'bg-red-100 text-red-600', tooltip: 'Gérer les utilisateurs et l\'équipe' }],
    }] : []),
  ]

  return (
    <>
      {/* Drawer "Plus" */}
      {showMore && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setShowMore(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="absolute bottom-16 left-0 right-0 bg-white dark:bg-dark-card rounded-t-2xl shadow-2xl border-t border-gray-100 dark:border-dark-border p-4 pb-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-gray-800 dark:text-white">Toutes les pages</p>
              <button onClick={() => setShowMore(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-bg">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              {sections.map(section => (
                <div key={section.label}>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">{section.label}</p>
                  <div className="grid grid-cols-4 gap-2">
                    {section.items.map(item => {
                      const Icon = item.icon
                      const active = pathname === item.href
                      return (
                        <Tooltip key={item.href} content={item.tooltip} position="top" className="w-full">
                          <Link href={item.href} onClick={() => setShowMore(false)}
                            className={cn('flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all w-full',
                              active ? 'ring-2 ring-gold ring-offset-1' : 'hover:bg-gray-50 dark:hover:bg-dark-bg')}>
                            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', item.color)}>
                              <Icon size={18} />
                            </div>
                            <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400 text-center leading-tight">{item.label}</span>
                          </Link>
                        </Tooltip>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-dark-card border-t border-gray-100 dark:border-dark-border md:hidden">
        <div className="flex items-center justify-around h-16 px-1">
          {NAV_ITEMS.map(({ href, icon: Icon, label, tooltip }) => {
            const active = pathname === href || (pathname?.startsWith(href + '/') ?? false)
            return (
              <Tooltip key={href} content={tooltip} position="top" className="flex-1 flex">
                <Link href={href}
                  className={cn(
                    'flex flex-col items-center justify-center gap-0.5 flex-1 py-2 rounded-xl transition-all relative',
                    active ? 'text-yellow-600' : 'text-gray-400'
                  )}>
                  <div className={cn('p-1.5 rounded-xl transition-all', active ? 'bg-yellow-50 dark:bg-yellow-900/30' : '')}>
                    <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                  </div>
                  <span className={cn('text-[10px] font-medium leading-none', active ? 'text-yellow-600' : 'text-gray-400')}>
                    {label}
                  </span>
                  {label === 'Messages' && unreadCount > 0 && (
                    <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </Link>
              </Tooltip>
            )
          })}

          {/* Bouton Plus */}
          <Tooltip content="Voir toutes les sections de l'application" position="top" className="flex-1 flex">
            <button
              onClick={() => setShowMore(v => !v)}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 py-2 rounded-xl transition-all',
                showMore ? 'text-yellow-600' : 'text-gray-400'
              )}>
              <div className={cn('p-1.5 rounded-xl transition-all', showMore ? 'bg-yellow-50 dark:bg-yellow-900/30' : '')}>
                <Grid3X3 size={20} strokeWidth={showMore ? 2.5 : 1.8} />
              </div>
              <span className={cn('text-[10px] font-medium leading-none', showMore ? 'text-yellow-600' : 'text-gray-400')}>
                Plus
              </span>
            </button>
          </Tooltip>
        </div>
      </nav>
    </>
  )
}
