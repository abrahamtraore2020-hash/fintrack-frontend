'use client'
import { TrendingUp, TrendingDown, Wallet, Vault, Brain, ArrowRight } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import Link from 'next/link'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardTitle } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useDashboard } from '@/hooks/useDashboard'
import { useAppStore } from '@/store/useAppStore'
import { formatAmount, CATEGORY_COLORS, CATEGORY_LABELS_FR, timeAgo } from '@/lib/utils'

// Données de démo
const MONTHLY_DATA = [
  { month: 'Jan', revenus: 320000, depenses: 210000 },
  { month: 'Fév', revenus: 410000, depenses: 290000 },
  { month: 'Mar', revenus: 380000, depenses: 340000 },
  { month: 'Avr', revenus: 500000, depenses: 280000 },
  { month: 'Mai', revenus: 450000, depenses: 310000 },
  { month: 'Jun', revenus: 485000, depenses: 312400 },
]

const PIE_DATA = [
  { name: 'Alimentation', value: 28, color: CATEGORY_COLORS.food },
  { name: 'Logement', value: 35, color: CATEGORY_COLORS.housing },
  { name: 'Transport', value: 12, color: CATEGORY_COLORS.transport },
  { name: 'Loisirs', value: 10, color: CATEGORY_COLORS.entertainment },
  { name: 'Autre', value: 15, color: CATEGORY_COLORS.other },
]

const RECENT_TX = [
  { id: '1', description: 'Wave — Virement reçu', category: 'salary', type: 'income', amount: 150000, date: new Date().toISOString(), currency: 'XOF' },
  { id: '2', description: 'Supermarché Hayat', category: 'food', type: 'expense', amount: 24500, date: new Date(Date.now()-86400000).toISOString(), currency: 'XOF' },
  { id: '3', description: 'Freelance — Projet web', category: 'freelance', type: 'income', amount: 200000, date: new Date(Date.now()-172800000).toISOString(), currency: 'XOF' },
  { id: '4', description: 'Loyer mensuel', category: 'housing', type: 'expense', amount: 120000, date: new Date(Date.now()-259200000).toISOString(), currency: 'XOF' },
]

export default function DashboardPage() {
  const { user } = useAppStore()
  const trialDaysLeft = 11

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
          Bonjour, <span className="text-glow-blue">{user?.firstName || 'Kofi'}</span> 👋
        </h1>
        <p className="text-sm text-gray-500">Aperçu de vos finances — Juin 2025</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatCard label="Revenus du mois" value="485 000 FCFA" change="+12% vs mois dernier" changeType="up" icon={TrendingUp} iconColor="text-green-600" iconBg="bg-green-50" valueColor="text-green-600" />
        <StatCard label="Dépenses du mois" value="312 400 FCFA" change="+5% vs mois dernier" changeType="down" icon={TrendingDown} iconColor="text-red-500" iconBg="bg-red-50" valueColor="text-red-500" />
        <StatCard label="Solde net" value="172 600 FCFA" change="Bonne trajectoire" changeType="up" icon={Wallet} iconColor="text-yellow-600" iconBg="bg-yellow-50" valueColor="text-yellow-600" />
        <StatCard label="Total coffres" value="94 000 FCFA" change="2 objectifs en cours" changeType="neutral" icon={Vault} iconColor="text-blue-500" iconBg="bg-blue-50" valueColor="text-glow-blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Graphique revenus vs dépenses */}
        <Card>
          <CardTitle><TrendingUp size={16} className="text-gold" /> Revenus vs Dépenses</CardTitle>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={MONTHLY_DATA}>
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
        </Card>

        {/* Répartition dépenses */}
        <Card>
          <CardTitle><Wallet size={16} className="text-gold" /> Répartition des dépenses</CardTitle>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                {PIE_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v: number) => [`${v}%`, '']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Transactions récentes */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="mb-0"><ArrowRight size={16} className="text-gold" /> Transactions récentes</CardTitle>
            <Link href="/transactions" className="text-xs text-blue-500 hover:underline">Voir tout</Link>
          </div>
          <div className="space-y-2">
            {RECENT_TX.map(tx => (
              <div key={tx.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: CATEGORY_COLORS[tx.category as keyof typeof CATEGORY_COLORS] + '20' }}>
                  <span className="text-sm">{tx.type === 'income' ? '💰' : '💸'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700 truncate">{tx.description}</p>
                  <p className="text-[10px] text-gray-400">{timeAgo(tx.date)}</p>
                </div>
                <span className={`text-sm font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                  {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString('fr-FR')} F
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Conseil IA */}
        <Card>
          <CardTitle><Brain size={16} className="text-gold" /> Conseil IA du jour</CardTitle>
          <div className="bg-gradient-to-br from-blue-50 to-yellow-50 border border-blue-100 rounded-xl p-4 mb-3">
            <p className="text-xs text-gray-600 leading-relaxed">
              <span className="text-glow-blue font-semibold">💡 Analyse IA :</span> Vos dépenses alimentaires représentent <strong>28%</strong> de vos revenus ce mois-ci. En les réduisant à 20%, vous pourriez épargner{' '}
              <strong className="text-green-600">~38 800 FCFA</strong> supplémentaires par mois, soit{' '}
              <strong className="text-yellow-700">465 600 FCFA/an</strong> de plus dans vos coffres.
            </p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-xs text-gray-600 leading-relaxed">
              <span className="text-yellow-700 font-semibold">🎯 Objectif épargne :</span> À votre rythme actuel, vous atteindrez votre objectif <strong>Vacances Dakar</strong> en <strong>8 mois</strong>. En ajoutant 5 000 FCFA/mois, vous pouvez réduire ce délai à <strong>5 mois</strong>.
            </p>
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}
