'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, LayoutDashboard, Vault, Target, Plug, BarChart2, TrendingUp, Brain, Bell, CreditCard, Settings, RefreshCw, PieChart, Bird, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'

type Result = {
  id: string
  type: 'page' | 'transaction' | 'coffre' | 'objectif'
  label: string
  sub?: string
  href: string
  icon?: React.ReactNode
}

const PAGES: Result[] = [
  { id: 'dashboard', type: 'page', label: 'Dashboard', sub: 'Accueil', href: '/dashboard', icon: <LayoutDashboard size={15} /> },
  { id: 'coffres', type: 'page', label: 'Coffres', sub: 'Épargne', href: '/coffres', icon: <Vault size={15} /> },
  { id: 'objectifs', type: 'page', label: 'Objectifs', sub: 'Buts financiers', href: '/objectifs', icon: <Target size={15} /> },
  { id: 'integrations', type: 'page', label: 'Intégrations', sub: 'Comptes connectés', href: '/integrations', icon: <Plug size={15} /> },
  { id: 'rapports', type: 'page', label: 'Rapports', sub: 'Analytiques', href: '/rapports', icon: <BarChart2 size={15} /> },
  { id: 'previsions', type: 'page', label: 'Prévisions', sub: 'Projections', href: '/previsions', icon: <TrendingUp size={15} /> },
  { id: 'conseils-ia', type: 'page', label: 'Conseils IA', sub: 'FinTrack AI', href: '/conseils-ia', icon: <Brain size={15} /> },
  { id: 'budget', type: 'page', label: 'Budget', sub: 'Par catégorie', href: '/budget', icon: <PieChart size={15} /> },
  { id: 'recurrences', type: 'page', label: 'Récurrences', sub: 'Transactions auto', href: '/recurrences', icon: <RefreshCw size={15} /> },
  { id: 'notifications', type: 'page', label: 'Notifications', sub: 'Alertes', href: '/notifications', icon: <Bell size={15} /> },
  { id: 'pricing', type: 'page', label: 'Abonnement', sub: 'Plans & tarifs', href: '/pricing', icon: <CreditCard size={15} /> },
  { id: 'funtwit', type: 'page', label: 'FunTwit', sub: 'Réseau social', href: '/funtwit', icon: <Bird size={15} /> },
  { id: 'inbox', type: 'page', label: 'Messages', sub: 'Inbox privé', href: '/inbox', icon: <MessageSquare size={15} /> },
  { id: 'parametres', type: 'page', label: 'Paramètres', sub: 'Profil & préférences', href: '/parametres', icon: <Settings size={15} /> },
]

interface Props { isOpen: boolean; onClose: () => void }

export function SearchModal({ isOpen, onClose }: Props) {
  const router = useRouter()
  const { coffres, objectifs, transactions } = useAppStore()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) { setQuery(''); setSelected(0); setTimeout(() => inputRef.current?.focus(), 50) }
  }, [isOpen])

  const results: Result[] = query.length < 2 ? PAGES.slice(0, 6) : [
    ...PAGES.filter(p =>
      p.label.toLowerCase().includes(query.toLowerCase()) ||
      (p.sub || '').toLowerCase().includes(query.toLowerCase())
    ),
    ...coffres.filter(c => c.name.toLowerCase().includes(query.toLowerCase())).map(c => ({
      id: c.id, type: 'coffre' as const, label: c.name,
      sub: `Coffre · ${c.currentAmount.toLocaleString('fr-FR')} F`, href: '/coffres', icon: <Vault size={15} />,
    })),
    ...objectifs.filter(o => o.name.toLowerCase().includes(query.toLowerCase())).map(o => ({
      id: o.id, type: 'objectif' as const, label: o.name,
      sub: `Objectif · ${o.currentAmount.toLocaleString('fr-FR')} F / ${o.targetAmount.toLocaleString('fr-FR')} F`, href: '/objectifs', icon: <Target size={15} />,
    })),
    ...transactions.filter(t => t.description.toLowerCase().includes(query.toLowerCase())).slice(0, 5).map(t => ({
      id: t.id, type: 'transaction' as const, label: t.description,
      sub: `Transaction · ${t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString('fr-FR')} F`, href: '/rapports', icon: <BarChart2 size={15} />,
    })),
  ]

  const go = (r: Result) => { router.push(r.href); onClose() }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, results.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)) }
    if (e.key === 'Enter' && results[selected]) go(results[selected])
    if (e.key === 'Escape') onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg bg-white dark:bg-dark-card rounded-2xl shadow-2xl border border-gray-100 dark:border-dark-border overflow-hidden"
        onClick={e => e.stopPropagation()}>
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-dark-border">
          <Search size={18} className="text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(0) }}
            onKeyDown={handleKey}
            placeholder="Rechercher une page, un coffre, une transaction..."
            className="flex-1 text-sm bg-transparent text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-2">
          {query.length === 0 && (
            <p className="text-[10px] text-gray-400 px-4 py-1 uppercase tracking-wider font-semibold">Navigation rapide</p>
          )}
          {results.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">Aucun résultat pour « {query} »</p>
          )}
          {results.map((r, i) => (
            <button key={r.id} onClick={() => go(r)}
              className={cn('w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                i === selected ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'hover:bg-gray-50 dark:hover:bg-dark-bg')}>
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                i === selected ? 'bg-gold text-[#1A1A2E]' : 'bg-gray-100 dark:bg-dark-bg text-gray-500')}>
                {r.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{r.label}</p>
                {r.sub && <p className="text-[10px] text-gray-400 truncate">{r.sub}</p>}
              </div>
              <span className={cn('text-[10px] px-2 py-0.5 rounded-full',
                r.type === 'page' ? 'bg-gray-100 dark:bg-dark-bg text-gray-400' :
                r.type === 'coffre' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' :
                r.type === 'objectif' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700' :
                'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
              )}>
                {r.type === 'page' ? 'Page' : r.type === 'coffre' ? 'Coffre' : r.type === 'objectif' ? 'Objectif' : 'Transaction'}
              </span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-gray-100 dark:border-dark-border flex items-center gap-4 text-[10px] text-gray-400">
          <span>↑↓ Naviguer</span>
          <span>↵ Ouvrir</span>
          <span>Esc Fermer</span>
        </div>
      </div>
    </div>
  )
}
