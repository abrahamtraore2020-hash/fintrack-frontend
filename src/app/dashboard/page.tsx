'use client'
import { useMemo } from 'react'
import { TrendingUp, TrendingDown, Wallet, Vault, Brain, ArrowRight, Plus, Plug } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import Link from 'next/link'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardTitle } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/store/useAppStore'
import { useCoffres } from '@/hooks/useCoffres'
import { useObjectifs } from '@/hooks/useObjectifs'
import { useTransactions } from '@/hooks/useTransactions'
import { formatAmount, CATEGORY_COLORS, CATEGORY_LABELS_FR, timeAgo } from '@/lib/utils'

export default function DashboardPage() {
  const { user } = useAppStore()
  const { data: coffres = [] } = useCoffres()
  const { data: objectifs = [] } = useObjectifs()
  const { data: transactions = [] } = useTransactions(200)

  // Calculs réels basés sur les vraies transactions
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const monthlyTransactions = transactions.filter(tx => {
    const d = new Date(tx.date)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  })

  const revenus = monthlyTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const depenses = monthlyTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const solde = revenus - depenses
  const totalCoffres = coffres.reduce((s, c) => s + c.currentAmount, 0)

  // Graphique mensuel des 6 derniers mois
  const monthlyData = useMemo(() => {
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1)
      const m = d.getMonth()
      const y = d.getFullYear()
      const label = d.toLocaleDateString('fr-FR', { month: 'short' })
      const txs = transactions.filter(tx => {
        const td = new Date(tx.date)
        return td.getMonth() === m && td.getFullYear() === y
      })
      months.push({
        month: label,
        revenus: txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        depenses: txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      })
    }
    return months
  }, [transactions, currentMonth, currentYear])

  // Répartition dépenses par catégorie (mois en cours)
  const pieData = useMemo(() => {
    const cats: Record<string, number> = {}
    monthlyTransactions.filter(t => t.type === 'expense').forEach(t => {
      cats[t.category] = (cats[t.category] || 0) + t.amount
    })
    return Object.entries(cats).map(([cat, value]) => ({
      name: CATEGORY_LABELS_FR[cat as keyof typeof CATEGORY_LABELS_FR] || cat,
      value,
      color: CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS] || '#9CA3AF',
    }))
  }, [monthlyTransactions])

  const recentTx = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)

  // Jours d'essai restants
  const trialDaysLeft = user?.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(user.trialEndsAt).getTime() - Date.now()) / 86400000))
    : 14

  const isEmpty = transactions.length === 0

  return (
    <AppLayout>
      {/* Trial Banner */}
      {trialDaysLeft > 0 && (
        <div className="flex items-center justify-between bg-gradient-dark rounded-xl px-5 py-3.5 mb-5">
          <div>
            <p className="text-white font-semibold text-sm">🎁 Essai gratuit — {trialDaysLeft} jours restants</p>
            <p className="text-white/60 text-xs mt-0.5">Passez au plan Pro pour débloquer coffres illimités & conseils IA</p>
          </div>
          <Link href="/pricing"><Button variant="primary" size="sm">Voir les plans</Button></Link>
        </div>
      )}

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-lg font-bold text-gray-800 dark:text-white">
          Bonjour, <span className="text-glow-blue">{user?.firstName || ''}</span> 👋
        </h1>
        <p className="text-sm text-gray-500">
          Aperçu de vos finances — {now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats réelles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatCard label="Revenus du mois" value={`${revenus.toLocaleString('fr-FR')} FCFA`} change={revenus > 0 ? 'Ce mois-ci' : 'Aucun revenu'} changeType={revenus > 0 ? 'up' : 'neutral'} icon={TrendingUp} iconColor="text-green-600" iconBg="bg-green-50" valueColor="text-green-600" />
        <StatCard label="Dépenses du mois" value={`${depenses.toLocaleString('fr-FR')} FCFA`} change={depenses > 0 ? 'Ce mois-ci' : 'Aucune dépense'} changeType={depenses > 0 ? 'down' : 'neutral'} icon={TrendingDown} iconColor="text-red-500" iconBg="bg-red-50" valueColor="text-red-500" />
        <StatCard label="Solde net" value={`${solde.toLocaleString('fr-FR')} FCFA`} change={solde >= 0 ? 'Bonne trajectoire' : 'Déficit ce mois'} changeType={solde >= 0 ? 'up' : 'down'} icon={Wallet} iconColor="text-yellow-600" iconBg="bg-yellow-50" valueColor="text-yellow-600" />
        <StatCard label="Total coffres" value={`${totalCoffres.toLocaleString('fr-FR')} FCFA`} change={`${coffres.length} coffre${coffres.length !== 1 ? 's' : ''}`} changeType="neutral" icon={Vault} iconColor="text-blue-500" iconBg="bg-blue-50" valueColor="text-glow-blue" />
      </div>

      {/* État vide — guide de démarrage */}
      {isEmpty && (
        <Card className="mb-5 border-2 border-dashed border-gold/40">
          <div className="text-center py-4">
            <div className="text-4xl mb-3">🚀</div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-2">Commencez à utiliser FinTrack</h3>
            <p className="text-xs text-gray-500 mb-4">Connectez un compte ou ajoutez vos premières transactions pour voir vos finances ici.</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Link href="/integrations">
                <Button size="sm"><Plug size={13} /> Connecter un compte</Button>
              </Link>
              <Link href="/coffres">
                <Button variant="outline" size="sm"><Plus size={13} /> Créer un coffre</Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Graphique revenus vs dépenses */}
        <Card>
          <CardTitle><TrendingUp size={16} className="text-gold" /> Revenus vs Dépenses</CardTitle>
          {monthlyData.every(m => m.revenus === 0 && m.depenses === 0) ? (
            <div className="h-[200px] flex items-center justify-center text-gray-400 text-xs">
              Aucune donnée — connectez un compte pour voir le graphique
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="depGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip formatter={(v: number) => [`${v.toLocaleString('fr-FR')} FCFA`, '']} contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="revenus" stroke="#22C55E" strokeWidth={2} fill="url(#revGrad)" name="Revenus" />
                <Area type="monotone" dataKey="depenses" stroke="#EF4444" strokeWidth={2} fill="url(#depGrad)" name="Dépenses" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Répartition dépenses */}
        <Card>
          <CardTitle><Wallet size={16} className="text-gold" /> Répartition des dépenses</CardTitle>
          {pieData.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-gray-400 text-xs">
              Aucune dépense ce mois-ci
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v.toLocaleString('fr-FR')} F`, '']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Transactions récentes */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="mb-0"><ArrowRight size={16} className="text-gold" /> Transactions récentes</CardTitle>
            <Link href="/rapports" className="text-xs text-blue-500 hover:underline">Voir tout</Link>
          </div>
          {recentTx.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <p className="text-sm">Aucune transaction</p>
              <Link href="/integrations" className="text-xs text-gold mt-1 hover:underline block">Connecter un compte →</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentTx.map(tx => (
                <div key={tx.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 dark:bg-dark-bg hover:bg-gray-100 dark:hover:bg-dark-border transition-colors">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: (CATEGORY_COLORS[tx.category as keyof typeof CATEGORY_COLORS] || '#9CA3AF') + '20' }}>
                    <span className="text-sm">{tx.type === 'income' ? '💰' : '💸'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{tx.description}</p>
                    <p className="text-[10px] text-gray-400">{timeAgo(tx.date)}</p>
                  </div>
                  <span className={`text-sm font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                    {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString('fr-FR')} F
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Conseil IA */}
        <Card>
          <CardTitle><Brain size={16} className="text-gold" /> Conseil IA du jour</CardTitle>
          {isEmpty ? (
            <div className="bg-gradient-to-br from-blue-50 to-yellow-50 dark:from-blue-900/20 dark:to-yellow-900/20 border border-blue-100 dark:border-blue-800/40 rounded-xl p-4">
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                <span className="text-glow-blue font-semibold">💡 Conseil de démarrage :</span> Commencez par connecter votre compte Wave ou Orange Money dans <strong>Intégrations</strong>. Vos transactions seront importées automatiquement et l'IA pourra vous donner des conseils personnalisés.
              </p>
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-br from-blue-50 to-yellow-50 dark:from-blue-900/20 dark:to-yellow-900/20 border border-blue-100 dark:border-blue-800/40 rounded-xl p-4 mb-3">
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  <span className="text-glow-blue font-semibold">💡 Analyse IA :</span>{' '}
                  {depenses > 0 && revenus > 0
                    ? `Vous avez dépensé ${Math.round((depenses / revenus) * 100)}% de vos revenus ce mois-ci. ${depenses / revenus < 0.7 ? 'Bonne maîtrise du budget !' : 'Essayez de réduire vos dépenses pour augmenter votre épargne.'}`
                    : 'Ajoutez vos transactions pour recevoir des conseils personnalisés.'
                  }
                </p>
              </div>
              {objectifs.length > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/40 rounded-xl p-4">
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    <span className="text-yellow-700 font-semibold">🎯 Objectif :</span>{' '}
                    Vous avez <strong>{objectifs.length} objectif{objectifs.length > 1 ? 's' : ''}</strong> en cours. Consultez la page <strong>Prévisions</strong> pour voir votre trajectoire.
                  </p>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </AppLayout>
  )
}
