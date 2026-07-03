'use client'
import { useState, useMemo } from 'react'
import { Search, X, ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useTransactions } from '@/hooks/useTransactions'
import { cn, CATEGORY_COLORS, CATEGORY_LABELS_FR } from '@/lib/utils'

const PER_PAGE = 25

export default function TransactionsPage() {
  const { data: transactions = [], remove } = useTransactions(2000)
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [search, setSearch]   = useState('')
  const [page, setPage]       = useState(1)

  const filtered = useMemo(() => {
    return transactions
      .filter(tx => filter === 'all' || tx.type === filter)
      .filter(tx => !search || tx.description.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [transactions, filter, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const startIdx   = (page - 1) * PER_PAGE

  const handleFilter = (f: typeof filter) => { setFilter(f); setPage(1) }
  const handleSearch = (v: string)         => { setSearch(v);  setPage(1) }

  const totalIncome  = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  // Pages to display in pagination
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    if (page <= 4)       return [1, 2, 3, 4, 5, '…', totalPages]
    if (page >= totalPages - 3) return [1, '…', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    return [1, '…', page - 1, page, page + 1, '…', totalPages]
  }, [page, totalPages])

  return (
    <AppLayout>
      <div className="mb-5">
        <h1 className="text-lg font-bold text-gray-800 dark:text-white">
          Mes <span className="text-glow-blue">Transactions</span>
        </h1>
        <p className="text-sm text-gray-500">
          {filtered.length} transaction{filtered.length !== 1 ? 's' : ''} au total
        </p>
      </div>

      {/* Résumé rapide */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl px-4 py-3 flex items-center gap-3">
          <TrendingUp size={16} className="text-green-600 flex-shrink-0" />
          <div>
            <p className="text-[10px] text-gray-500">Revenus filtrés</p>
            <p className="text-sm font-bold text-green-600">+{totalIncome.toLocaleString('fr-FR')} F</p>
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3 flex items-center gap-3">
          <TrendingDown size={16} className="text-red-500 flex-shrink-0" />
          <div>
            <p className="text-[10px] text-gray-500">Dépenses filtrées</p>
            <p className="text-sm font-bold text-red-500">-{totalExpense.toLocaleString('fr-FR')} F</p>
          </div>
        </div>
      </div>

      {/* Barre de recherche + filtres */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="flex-1">
          <Input
            placeholder="Rechercher une transaction…"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            icon={<Search size={14} />}
          />
        </div>
        <div className="flex gap-1.5 bg-gray-100 dark:bg-dark-bg rounded-xl p-1 flex-shrink-0">
          {(['all', 'income', 'expense'] as const).map(f => (
            <button key={f} onClick={() => handleFilter(f)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                filter === f
                  ? 'bg-white dark:bg-dark-card shadow text-gray-800 dark:text-white'
                  : 'text-gray-400 hover:text-gray-600')}>
              {f === 'all' ? 'Tout' : f === 'income' ? '💰 Revenus' : '💸 Dépenses'}
            </button>
          ))}
        </div>
      </div>

      {/* Tableau */}
      <Card className="overflow-hidden p-0">
        {/* En-tête colonnes */}
        <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 dark:bg-dark-bg border-b border-gray-100 dark:border-dark-border">
          <span className="w-7 text-center text-[10px] font-bold text-gray-400 uppercase">#</span>
          <span className="w-16 text-[10px] font-bold text-gray-400 uppercase flex-shrink-0">Date</span>
          <span className="flex-1 text-[10px] font-bold text-gray-400 uppercase">Description</span>
          <span className="hidden sm:block w-28 text-[10px] font-bold text-gray-400 uppercase flex-shrink-0">Catégorie</span>
          <span className="w-24 text-[10px] font-bold text-gray-400 uppercase text-right flex-shrink-0">Montant</span>
          <span className="w-6 flex-shrink-0" />
        </div>

        {paginated.length === 0 ? (
          <div className="text-center py-16 text-gray-400 px-4">
            <p className="text-2xl mb-2">🔍</p>
            <p className="text-sm">Aucune transaction trouvée</p>
            {search && <p className="text-xs mt-1">Essayez un autre mot-clé</p>}
          </div>
        ) : (
          <div>
            {paginated.map((tx, i) => (
              <div key={tx.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors group border-b border-gray-50 dark:border-dark-border/40 last:border-0">
                {/* Numéro */}
                <span className="w-7 text-center text-[11px] text-gray-400 font-medium flex-shrink-0">
                  {startIdx + i + 1}
                </span>
                {/* Date */}
                <span className="w-16 text-[11px] text-gray-500 flex-shrink-0">
                  {new Date(tx.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                </span>
                {/* Icône + Description */}
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: (CATEGORY_COLORS[tx.category as keyof typeof CATEGORY_COLORS] || '#9CA3AF') + '25' }}>
                    <span className="text-[11px]">{tx.type === 'income' ? '💰' : '💸'}</span>
                  </div>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{tx.description}</p>
                </div>
                {/* Catégorie */}
                <span className="hidden sm:block w-28 text-[10px] text-gray-400 truncate flex-shrink-0">
                  {CATEGORY_LABELS_FR[tx.category as keyof typeof CATEGORY_LABELS_FR] || tx.category}
                </span>
                {/* Montant */}
                <span className={cn('w-24 text-xs font-semibold text-right flex-shrink-0',
                  tx.type === 'income' ? 'text-green-600' : 'text-red-500')}>
                  {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString('fr-FR')} F
                </span>
                {/* Supprimer */}
                <button
                  onClick={() => remove.mutate(tx.id)}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-5">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-bg disabled:opacity-30 transition-colors">
            <ChevronLeft size={16} />
          </button>
          {pageNumbers.map((n, i) =>
            n === '…' ? (
              <span key={`ellipsis-${i}`} className="w-8 text-center text-xs text-gray-400">…</span>
            ) : (
              <button key={n} onClick={() => setPage(n as number)}
                className={cn('w-8 h-8 rounded-lg text-xs font-semibold transition-colors',
                  page === n
                    ? 'bg-yellow-400 text-white shadow'
                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-bg')}>
                {n}
              </button>
            )
          )}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-bg disabled:opacity-30 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Infos pagination */}
      {filtered.length > 0 && (
        <p className="text-center text-[11px] text-gray-400 mt-2">
          Transactions {startIdx + 1}–{Math.min(startIdx + PER_PAGE, filtered.length)} sur {filtered.length}
        </p>
      )}
    </AppLayout>
  )
}
