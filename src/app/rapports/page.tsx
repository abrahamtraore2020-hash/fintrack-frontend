'use client'
import { useState } from 'react'
import { BarChart2, Download, TrendingUp, TrendingDown, Calendar, CalendarRange, X } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid } from 'recharts'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { cn } from '@/lib/utils'
import { CATEGORY_COLORS, CATEGORY_LABELS_FR } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'

const MONTHLY = [
  { month: 'Jan', revenus: 320000, depenses: 210000, epargne: 110000 },
  { month: 'Fév', revenus: 410000, depenses: 290000, epargne: 120000 },
  { month: 'Mar', revenus: 380000, depenses: 340000, epargne: 40000 },
  { month: 'Avr', revenus: 500000, depenses: 280000, epargne: 220000 },
  { month: 'Mai', revenus: 450000, depenses: 310000, epargne: 140000 },
  { month: 'Jun', revenus: 485000, depenses: 312400, epargne: 172600 },
]

const CATEGORIES = [
  { name: 'Alimentation', value: 87200, pct: 28, color: CATEGORY_COLORS.food },
  { name: 'Logement', value: 109200, pct: 35, color: CATEGORY_COLORS.housing },
  { name: 'Transport', value: 37500, pct: 12, color: CATEGORY_COLORS.transport },
  { name: 'Loisirs', value: 31200, pct: 10, color: CATEGORY_COLORS.entertainment },
  { name: 'Autre', value: 46800, pct: 15, color: CATEGORY_COLORS.other },
]

const TRANSACTIONS = [
  { id: '1', desc: 'Wave — Virement reçu', cat: 'salary', type: 'income', amount: 150000, date: '2025-06-23' },
  { id: '2', desc: 'Supermarché Hayat', cat: 'food', type: 'expense', amount: 24500, date: '2025-06-22' },
  { id: '3', desc: 'Freelance — Projet web', cat: 'freelance', type: 'income', amount: 200000, date: '2025-06-21' },
  { id: '4', desc: 'Loyer mensuel', cat: 'housing', type: 'expense', amount: 120000, date: '2025-06-20' },
  { id: '5', desc: 'Restaurant Le Dakar', cat: 'food', type: 'expense', amount: 18000, date: '2025-06-19' },
  { id: '6', desc: 'Orange Money — Rechargement', cat: 'utilities', type: 'expense', amount: 5000, date: '2025-06-18' },
  { id: '7', desc: 'Client Abidjan — Design', cat: 'freelance', type: 'income', amount: 135000, date: '2025-06-17' },
  { id: '8', desc: 'Transport Sotral', cat: 'transport', type: 'expense', amount: 3500, date: '2025-06-16' },
]

const PERIODS = [
  { value: '30', label: '30 derniers jours' },
  { value: '90', label: '3 derniers mois' },
  { value: '180', label: '6 derniers mois' },
  { value: '365', label: 'Cette année' },
]

export default function RapportsPage() {
  const [period, setPeriod] = useState('180')
  const [catFilter, setCatFilter] = useState('all')
  const [showCalendar, setShowCalendar] = useState(false)
  const [dateFrom, setDateFrom] = useState('2025-01-01')
  const [dateTo, setDateTo] = useState('2025-06-30')
  const { transactions } = useAppStore()

  const exportCSV = () => {
    const rows = [
      ['Date', 'Description', 'Catégorie', 'Type', 'Montant (FCFA)'],
      ...allTransactions.map(tx => [tx.date, `"${tx.desc}"`, tx.cat, tx.type === 'income' ? 'Revenu' : 'Dépense', tx.amount]),
    ]
    const csv = rows.map(r => r.join(';')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `fintrack-transactions-${dateFrom}-${dateTo}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const totalRevenu = MONTHLY.reduce((s, m) => s + m.revenus, 0)
  const totalDepenses = MONTHLY.reduce((s, m) => s + m.depenses, 0)
  const totalEpargne = MONTHLY.reduce((s, m) => s + m.epargne, 0)
  const tauxEpargne = Math.round((totalEpargne / totalRevenu) * 100)

  // Combine static demo + real store transactions
  const allTransactions = [
    ...TRANSACTIONS,
    ...transactions.map(tx => ({
      id: tx.id, desc: tx.description, cat: tx.category,
      type: tx.type as 'income' | 'expense',
      amount: tx.amount, date: tx.date.slice(0, 10),
    })),
  ]

  const filteredTx = allTransactions.filter(tx => {
    if (catFilter !== 'all' && tx.type !== catFilter) return false
    if (tx.date < dateFrom || tx.date > dateTo) return false
    return true
  })

  return (
    <AppLayout>
      <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-gray-800 dark:text-white">
            Rapports <span className="text-glow-blue">Analytiques</span>
          </h1>
          <p className="text-sm text-gray-500">Analyse détaillée de vos finances · {dateFrom} → {dateTo}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Calendar range picker */}
          <div className="relative">
            <button onClick={() => setShowCalendar(!showCalendar)}
              className={cn('flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all', showCalendar ? 'border-gold bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400' : 'border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400 hover:border-gold')}>
              <CalendarRange size={14} />
              <span>{new Date(dateFrom).toLocaleDateString('fr-FR', { day:'2-digit', month:'short' })} – {new Date(dateTo).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' })}</span>
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
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    {[
                      { label: 'Ce mois', from: '2025-06-01', to: '2025-06-30' },
                      { label: '3 mois', from: '2025-04-01', to: '2025-06-30' },
                      { label: '6 mois', from: '2025-01-01', to: '2025-06-30' },
                    ].map(p => (
                      <button key={p.label} onClick={() => { setDateFrom(p.from); setDateTo(p.to) }}
                        className="py-1.5 rounded-lg bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border text-[10px] font-medium text-gray-600 dark:text-gray-400 hover:border-gold hover:bg-yellow-50 dark:hover:bg-yellow-900/10 transition-all">
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setShowCalendar(false)}
                    className="w-full py-2 bg-gold rounded-lg text-xs font-semibold text-[#1A1A2E]">
                    Appliquer
                  </button>
                </div>
              </div>
            )}
          </div>
          <Select options={PERIODS} value={period} onChange={e => setPeriod(e.target.value)} />
          <Button variant="outline" size="sm" onClick={exportCSV}><Download size={14} /> Exporter CSV</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Total revenus', value: totalRevenu, color: 'text-green-600', icon: TrendingUp, bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Total dépenses', value: totalDepenses, color: 'text-red-500', icon: TrendingDown, bg: 'bg-red-50 dark:bg-red-900/20' },
          { label: 'Épargne nette', value: totalEpargne, color: 'text-glow-blue', icon: BarChart2, bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Taux d\'épargne', value: null, display: `${tauxEpargne}%`, color: 'text-gold', icon: TrendingUp, bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
        ].map((kpi, i) => {
          const Icon = kpi.icon
          return (
            <Card key={i}>
              <div className={`w-9 h-9 rounded-xl ${kpi.bg} flex items-center justify-center mb-3`}>
                <Icon size={16} className={kpi.color} />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{kpi.label}</p>
              <p className={`text-xl font-bold ${kpi.color}`}>
                {kpi.display ?? (kpi.value! / 1000).toFixed(0) + 'k F'}
              </p>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Revenus vs Dépenses */}
        <Card>
          <CardTitle><TrendingUp size={16} className="text-gold" /> Revenus vs Dépenses</CardTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MONTHLY} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v / 1000}k`} />
              <Tooltip formatter={(v: number) => [`${v.toLocaleString('fr-FR')} F`, '']} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="revenus" name="Revenus" fill="#22C55E" radius={[4, 4, 0, 0]} />
              <Bar dataKey="depenses" name="Dépenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Répartition catégories */}
        <Card>
          <CardTitle><BarChart2 size={16} className="text-gold" /> Dépenses par catégorie</CardTitle>
          <div className="flex items-center">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie data={CATEGORIES} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {CATEGORIES.map((c, i) => <Cell key={i} fill={c.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v.toLocaleString('fr-FR')} F`, '']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {CATEGORIES.map((c, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
                    <span className="text-gray-600 dark:text-gray-400">{c.name}</span>
                  </div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{c.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Évolution épargne */}
      <Card className="mb-4">
        <CardTitle><TrendingUp size={16} className="text-gold" /> Évolution de l'épargne mensuelle</CardTitle>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={MONTHLY}>
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

      {/* Transactions */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <CardTitle><Calendar size={16} className="text-gold" /> Toutes les transactions</CardTitle>
          <Select
            options={[
              { value: 'all', label: 'Toutes' },
              { value: 'income', label: 'Revenus' },
              { value: 'expense', label: 'Dépenses' },
            ]}
            value={catFilter}
            onChange={e => setCatFilter(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          {filteredTx.map(tx => (
            <div key={tx.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 dark:border-dark-border last:border-0">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                style={{ background: (CATEGORY_COLORS[tx.cat as keyof typeof CATEGORY_COLORS] || '#9CA3AF') + '20' }}>
                {tx.type === 'income' ? '📈' : '📉'}
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-800 dark:text-white">{tx.desc}</p>
                <p className="text-[10px] text-gray-400">{tx.date} · {CATEGORY_LABELS_FR[tx.cat as keyof typeof CATEGORY_LABELS_FR] || tx.cat}</p>
              </div>
              <span className={`text-sm font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString('fr-FR')} F
              </span>
            </div>
          ))}
        </div>
      </Card>
    </AppLayout>
  )
}
