'use client'
import { useState } from 'react'
import { TrendingUp, Target, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { cn } from '@/lib/utils'

const PROJECTIONS = [
  { month: 'Jun', solde: 172600, epargne: 172600, pessimiste: 150000, optimiste: 195000 },
  { month: 'Jul', solde: 345200, epargne: 172600, pessimiste: 290000, optimiste: 400000 },
  { month: 'Aoû', solde: 517800, epargne: 172600, pessimiste: 420000, optimiste: 620000 },
  { month: 'Sep', solde: 690400, epargne: 172600, pessimiste: 545000, optimiste: 850000 },
  { month: 'Oct', solde: 863000, epargne: 172600, pessimiste: 660000, optimiste: 1090000 },
  { month: 'Nov', solde: 1035600, epargne: 172600, pessimiste: 770000, optimiste: 1340000 },
  { month: 'Déc', solde: 1208200, epargne: 172600, pessimiste: 875000, optimiste: 1600000 },
]

const OBJECTIF_PROJECTIONS = [
  {
    name: 'Vacances Dakar', icon: '✈️', color: '#FFD700',
    current: 45000, target: 200000,
    deadline: '2025-12-31',
    monthlyNeeded: 25900,
    currentMonthly: 10000,
    status: 'at_risk' as const,
    projection: 'Décembre 2026',
    tip: 'Augmentez votre contribution mensuelle de 10 000 F à 26 000 F pour atteindre l\'objectif à temps.',
  },
  {
    name: 'Ordinateur Pro', icon: '💻', color: '#22C55E',
    current: 49000, target: 350000,
    deadline: '2026-06-30',
    monthlyNeeded: 21500,
    currentMonthly: 10000,
    status: 'at_risk' as const,
    projection: 'Janvier 2028',
    tip: 'À votre rythme actuel, il vous faudra 26 mois. Doublez la contribution pour finir en 13 mois.',
  },
]

const SCENARIOS = [
  { label: 'Pessimiste', color: '#EF4444', desc: '-15% revenus, +10% dépenses', monthly: 124000 },
  { label: 'Réaliste', color: '#3B82F6', desc: 'Tendance actuelle maintenue', monthly: 172600 },
  { label: 'Optimiste', color: '#22C55E', desc: '+20% revenus, -5% dépenses', monthly: 228500 },
]

const INSIGHTS = [
  { icon: '📈', title: 'Taux d\'épargne actuel : 35.6%', desc: 'Excellent ! Vous épargnez plus que la moyenne recommandée de 20%.', variant: 'green' as const },
  { icon: '⚠️', title: 'Objectif Vacances en retard', desc: 'Sans ajustement, vous n\'atteindrez cet objectif qu\'en décembre 2026.', variant: 'red' as const },
  { icon: '💡', title: 'Potentiel d\'optimisation', desc: 'Réduire les dépenses alimentaires de 5% libèrerait ~15 000 F/mois.', variant: 'gold' as const },
]

export default function PrevisionsPage() {
  const [scenario, setScenario] = useState(1)

  return (
    <AppLayout>
      <div className="mb-5">
        <h1 className="text-lg font-bold text-gray-800 dark:text-white">
          Prévisions <span className="text-glow-blue">Financières</span>
        </h1>
        <p className="text-sm text-gray-500">Simulation de votre trajectoire d'épargne sur 6 mois</p>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        {INSIGHTS.map((ins, i) => (
          <Card key={i} className="flex items-start gap-3">
            <span className="text-2xl">{ins.icon}</span>
            <div>
              <p className="text-xs font-semibold text-gray-800 dark:text-white mb-0.5">{ins.title}</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">{ins.desc}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Scénario selector */}
      <Card className="mb-5">
        <CardTitle><TrendingUp size={16} className="text-gold" /> Scénarios de projection</CardTitle>
        <div className="grid grid-cols-3 gap-3 mb-5">
          {SCENARIOS.map((s, i) => (
            <button key={i} onClick={() => setScenario(i)}
              className={cn('p-3 rounded-xl border text-left transition-all', scenario === i ? 'border-[#FFD700] bg-yellow-50 dark:bg-yellow-900/20' : 'border-gray-100 dark:border-dark-border hover:border-gray-200')}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{s.label}</span>
              </div>
              <p className="text-[10px] text-gray-400">{s.desc}</p>
              <p className="text-sm font-bold mt-1" style={{ color: s.color }}>{s.monthly.toLocaleString('fr-FR')} F/mois</p>
            </button>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={PROJECTIONS}>
            <defs>
              <linearGradient id="soldeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="optGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="pesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${Math.round(v / 1000)}k`} />
            <Tooltip formatter={(v: number) => [`${v.toLocaleString('fr-FR')} F`, '']} />
            <Area type="monotone" dataKey="pessimiste" name="Pessimiste" stroke="#EF4444" strokeWidth={1.5} strokeDasharray="4 4" fill="url(#pesGrad)" />
            <Area type="monotone" dataKey="solde" name="Réaliste" stroke="#3B82F6" strokeWidth={2.5} fill="url(#soldeGrad)" />
            <Area type="monotone" dataKey="optimiste" name="Optimiste" stroke="#22C55E" strokeWidth={1.5} strokeDasharray="4 4" fill="url(#optGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Projection par objectif */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {OBJECTIF_PROJECTIONS.map((obj, i) => {
          const pct = Math.round((obj.current / obj.target) * 100)
          return (
            <Card key={i}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: obj.color + '20' }}>{obj.icon}</div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-white">{obj.name}</h3>
                    <p className="text-[11px] text-gray-400">Échéance : {new Date(obj.deadline).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
                <Badge variant="red"><AlertTriangle size={10} /> En retard</Badge>
              </div>

              <ProgressBar value={obj.current} max={obj.target} color={obj.color} height="h-2" className="mb-2" />
              <div className="flex items-center justify-between text-xs mb-4">
                <span className="font-medium" style={{ color: obj.color }}>{pct}% atteint</span>
                <span className="text-gray-400">{obj.current.toLocaleString('fr-FR')} / {obj.target.toLocaleString('fr-FR')} F</span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-gray-50 dark:bg-dark-bg rounded-lg p-2.5 text-center">
                  <p className="text-[10px] text-gray-400 mb-0.5">Contribution actuelle</p>
                  <p className="text-sm font-bold text-gray-700 dark:text-white">{obj.currentMonthly.toLocaleString('fr-FR')} F</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2.5 text-center">
                  <p className="text-[10px] text-gray-400 mb-0.5">Nécessaire / mois</p>
                  <p className="text-sm font-bold text-red-600">{obj.monthlyNeeded.toLocaleString('fr-FR')} F</p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 rounded-lg p-3">
                <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                  <span className="text-blue-500 font-semibold">💡 IA : </span>{obj.tip}
                </p>
              </div>
            </Card>
          )
        })}
      </div>
    </AppLayout>
  )
}
