'use client'
import { useState, useMemo } from 'react'
import { BarChart2, Download, TrendingUp, TrendingDown, Calendar, CalendarRange, X } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { cn } from '@/lib/utils'
import { CATEGORY_COLORS, CATEGORY_LABELS_FR } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'

export default function RapportsPage() {
  const { transactions } = useAppStore()
  const [catFilter, setCatFilter] = useState('all')
  const [showCalendar, setShowCalendar] = useState(false)

  const now = new Date()
  const defaultFrom = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().slice(0, 10)
  const defaultTo = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10)
  const [dateFrom, setDateFrom] = useState(defaultFrom)
  const [dateTo, setDateTo] = useState(defaultTo)

  // Filtrer les transactions par période
  const filtered = useMemo(() => transactions.filter(tx => {
    const d = tx.date.slice(0, 10)
    if (d < dateFrom || d > dateTo) return false
    if (catFilter !== 'all' && tx.type !== catFilter) return false
    return true
  }), [transactions, dateFrom, dateTo, catFilter])

  // Graphique mensuel sur 6 mois
  const monthlyData = useMemo(() => {
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const m = d.getMonth(); const y = d.getFullYear()
      const label = d.toLocaleDateString('fr-FR', { month: 'short' })
      const txs = transactions.filter(tx => {
        const td = new Date(tx.date); return td.getMonth() === m && td.getFullYear() === y
      })
      const revenus = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
      const depenses = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
      months.push({ month: label, revenus, depenses, epargne: revenus - depenses })
    }
    return months
  }, [transactions])

  // Répartition par catégorie
  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {}
    filtered.filter(t => t.type === 'expense').forEach(t => {
      cats[t.category] = (cats[t.category] || 0) + t.amount
    })
    const total = Object.values(cats).reduce((s, v) => s + v, 0)
    return Object.entries(cats).map(([cat, value]) => ({
      name: CATEGORY_LABELS_FR[cat as keyof typeof CATEGORY_LABELS_FR] || cat,
      value,
      pct: total > 0 ? Math.round((value / total) * 100) : 0,
      color: CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS] || '#9CA3AF',
    })).sort((a, b) => b.value - a.value)
  }, [filtered])

  const totalRevenu = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalDepenses = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const totalEpargne = totalRevenu - totalDepenses
  const tauxEpargne = totalRevenu > 0 ? Math.round((totalEpargne / totalRevenu) * 100) : 0

  const exportCSV = () => {
    const rows = [
      ['Date', 'Description', 'Catégorie', 'Type', 'Montant (FCFA)'],
      ...filtered.map(tx => [
        tx.date.slice(0, 10),
        `"${tx.description}"`,
        CATEGORY_LABELS_FR[tx.category as keyof typeof CATEGORY_LABELS_FR] || tx.category,
        tx.type === 'income' ? 'Revenu' : 'Dépense',
        tx.amount,
      ]),
    ]
    const csv = rows.map(r => r.join(';')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `fintrack-${dateFrom}-${dateTo}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const isEmpty = transactions.length === 0

  return (
    <AppLayout>
      <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-gray-800 dark:text-white">
            Rapports <span className="text-glow-blue">Analytiques</span>
          </h1>
          <p className="text-sm text-gray-500">{dateFrom} → {dateTo}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <button onClick={() => setShowCalendar(!showCalendar)}
              className={cn('flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all', showCalendar ? 'border-gold bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800' : 'border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400 hover:border-gold')}>
              <CalendarRange size={14} />
              <span>{new Date(dateFrom).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} – {new Date(dateTo).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </button>
            {showCalendar && (
              <div className="absolute right-0 top-full mt-2 z-50 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl shadow-xl p-4 w-72">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Période personnalisée</p>
                  <button onClick={() => setShowCalendar(false)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] text-gray-500 mb-1 block">Date de début</label>
                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} max={dateTo}
                      className="w-full border border-gray-200 dark:border-dark-border rounded-lg px-3 py-2 text-xs bg-white dark:bg-dark-bg text-gray-700 dark:text-gray-300 focus:outline-none focus:border-gold" />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-500 mb-1 block">Date de fin</label>
                    <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} min={dateFrom}
                      className="w-full border border-gray-200 dark:border-dark-border rounded-lg px-3 py-2 text-xs bg-white dark:bg-dark-bg text-gray-700 dark:text-gray-300 focus:outline-none focus:border-gold" />
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { label: 'Ce mois', from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0,10), to: new Date(now.getFullYear(), now.getMonth()+1, 0).toISOString().slice(0,10) },
                      { label: '3 mois', from: new Date(now.getFullYear(), now.getMonth()-2, 1).toISOString().slice(0,10), to: new Date(now.getFullYear(), now.getMonth()+1, 0).toISOString().slice(0,10) },
                      { label: '6 mois', from: new Date(now.getFullYear(), now.getMonth()-5, 1).toISOString().slice(0,10), to: new Date(now.getFullYear(), now.getMonth()+1, 0).toISOString().slice(0,10) },
                    ].map(p => (
                      <button key={p.label} onClick={() => { setDateFrom(p.from); setDateTo(p.to) }}
                        className="py-1.5 rounded-lg bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border text-[10px] font-medium text-gray-600 dark:text-gray-400 hover:border-gold transition-all">
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setShowCalendar(false)} className="w-full py-2 bg-gold rounded-lg text-xs font-semibold text-[#1A1A2E]">Appliquer</button>
                </div>
              </div>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={exportCSV} disabled={filtered.length === 0}>
            <Download size={14} /> Exporter CSV
          </Button>
        </div>
      </div>

      {isEmpty ? (
        <Card className="text-center py-16">
          <BarChart2 size={48} className="mx-auto mb-4 text-gray-200" />
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Aucune transaction à analyser</p>
          <p className="text-xs text-gray-400">Connectez un compte dans <strong>Intégrations</strong> pour voir vos rapports.</p>
        </Card>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            {[
              { label: 'Total revenus', value: totalRevenu, color: 'text-green-600', icon: TrendingUp, bg: 'bg-green-50 dark:bg-green-900/20' },
              { label: 'Total dépenses', value: totalDepenses, color: 'text-red-500', icon: TrendingDown, bg: 'bg-red-50 dark:bg-red-900/20' },
              { label: 'Épargne nette', value: totalEpargne, color: totalEpargne >= 0 ? 'text-glow-blue' : 'text-red-500', icon: BarChart2, bg: 'bg-blue-50 dark:bg-blue-900/20' },
              { label: 'Taux d\'épargne', value: null, display: `${tauxEpargne}%`, color: tauxEpargne >= 20 ? 'text-gold' : 'text-red-500', icon: TrendingUp, bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
            ].map((kpi, i) => {
              const Icon = kpi.icon
              return (
                <Card key={i}>
                  <div className={`w-9 h-9 rounded-xl ${kpi.bg} flex items-center justify-center mb-3`}>
                    <Icon size={16} className={kpi.color} />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{kpi.label}</p>
                  <p className={`text-xl font-bold ${kpi.color}`}>
                    {kpi.display ?? `${(kpi.value! / 1000).toFixed(0)}k F`}
                  </p>
                </Card>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <Card>
              <CardTitle><TrendingUp size={16} className="text-gold" /> Revenus vs Dépenses</CardTitle>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v / 1000}k`} />
                  <Tooltip formatter={(v: number) => [`${v.toLocaleString('fr-FR')} F`, '']} />
                  <Bar dataKey="revenus" name="Revenus" fill="#22C55E" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="depenses" name="Dépenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card>
              <CardTitle><BarChart2 size={16} className="text-gold" /> Dépenses par catégorie</CardTitle>
              {categoryData.length === 0 ? (
                <div className="h-[200px] flex items-center justify-center text-gray-400 text-xs">Aucune dépense sur cette période</div>
              ) : (
                <div className="flex items-center">
                  <ResponsiveContainer width="50%" height={200}>
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                        {categoryData.map((c, i) => <Cell key={i} fill={c.color} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => [`${v.toLocaleString('fr-FR')} F`, '']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2">
                    {categoryData.slice(0, 6).map((c, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
                          <span className="text-gray-600 dark:text-gray-400 truncate max-w-[80px]">{c.name}</span>
                        </div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{c.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>

          <Card className="mb-4">
            <CardTitle><TrendingUp size={16} className="text-gold" /> Évolution de l'épargne mensuelle</CardTitle>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="epGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFD700" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#FFD700" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v / 1000}k`} />
                <Tooltip formatter={(v: number) => [`${v.toLocaleString('fr-FR')} F`, 'Épargne']} />
                <Area type="monotone" dataKey="epargne" stroke="#FFD700" strokeWidth={2} fill="url(#epGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-3">
              <CardTitle><Calendar size={16} className="text-gold" /> Toutes les transactions</CardTitle>
              <Select options={[{ value: 'all', label: 'Toutes' }, { value: 'income', label: 'Revenus' }, { value: 'expense', label: 'Dépenses' }]}
                value={catFilter} onChange={e => setCatFilter(e.target.value)} />
            </div>
            {filtered.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-6">Aucune transaction sur cette période</p>
            ) : (
              <div className="space-y-2">
                {[...filtered].sort((a,b) => b.date.localeCompare(a.date)).map(tx => (
                  <div key={tx.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 dark:border-dark-border last:border-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                      style={{ background: (CATEGORY_COLORS[tx.category as keyof typeof CATEGORY_COLORS] || '#9CA3AF') + '20' }}>
                      {tx.type === 'income' ? '📈' : '📉'}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-800 dark:text-white">{tx.description}</p>
                      <p className="text-[10px] text-gray-400">{tx.date.slice(0, 10)} · {CATEGORY_LABELS_FR[tx.category as keyof typeof CATEGORY_LABELS_FR] || tx.category}</p>
                    </div>
                    <span className={`text-sm font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                      {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString('fr-FR')} F
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </AppLayout>
  )
}
