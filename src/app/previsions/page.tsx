'use client'
import { useMemo, useState } from 'react'
import { TrendingUp, AlertTriangle, Target } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'

const SCENARIOS = [
  { label: 'Pessimiste', color: '#EF4444', desc: '-15% revenus, +10% dépenses', mult: 0.75 },
  { label: 'Réaliste', color: '#3B82F6', desc: 'Tendance actuelle', mult: 1 },
  { label: 'Optimiste', color: '#22C55E', desc: '+20% revenus, -5% dépenses', mult: 1.3 },
]

export default function PrevisionsPage() {
  const { transactions, objectifs } = useAppStore()
  const [scenario, setScenario] = useState(1)

  const now = new Date()

  // Épargne mensuelle moyenne sur les 3 derniers mois
  const avgMonthlySavings = useMemo(() => {
    let total = 0
    for (let i = 0; i < 3; i++) {
      const m = now.getMonth() - i
      const y = now.getFullYear()
      const txs = transactions.filter(tx => {
        const d = new Date(tx.date)
        return d.getMonth() === ((m % 12) + 12) % 12 && d.getFullYear() === y + Math.floor(m / 12)
      })
      const rev = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
      const dep = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
      total += rev - dep
    }
    return total / 3
  }, [transactions])

  const baseSavings = Math.max(0, avgMonthlySavings)
  const scenarioSavings = baseSavings * SCENARIOS[scenario].mult

  // Projection 6 mois
  const projections = useMemo(() => {
    const months = []
    let cumReal = 0, cumOpt = 0, cumPes = 0
    for (let i = 0; i <= 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
      const label = i === 0 ? 'Auj.' : d.toLocaleDateString('fr-FR', { month: 'short' })
      cumReal += baseSavings
      cumOpt += baseSavings * 1.3
      cumPes += baseSavings * 0.75
      months.push({ month: label, réaliste: Math.round(cumReal), optimiste: Math.round(cumOpt), pessimiste: Math.round(cumPes) })
    }
    return months
  }, [baseSavings])

  const isEmpty = transactions.length === 0

  return (
    <AppLayout>
      <div className="mb-5">
        <h1 className="text-lg font-bold text-gray-800 dark:text-white">
          Prévisions <span className="text-glow-blue">Financières</span>
        </h1>
        <p className="text-sm text-gray-500">Simulation basée sur vos données réelles</p>
      </div>

      {isEmpty ? (
        <Card className="text-center py-16">
          <TrendingUp size={48} className="mx-auto mb-4 text-gray-200" />
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Pas encore de données</p>
          <p className="text-xs text-gray-400">Les prévisions se basent sur vos transactions réelles.<br />Connectez un compte dans <strong>Intégrations</strong> pour commencer.</p>
        </Card>
      ) : (
        <>
          {/* Insights dynamiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
            {[
              {
                icon: '📈',
                title: `Épargne moyenne : ${baseSavings.toLocaleString('fr-FR')} F/mois`,
                desc: baseSavings > 0 ? 'Basé sur vos 3 derniers mois.' : 'Vos dépenses dépassent vos revenus ce mois.',
              },
              {
                icon: '🎯',
                title: `${objectifs.length} objectif${objectifs.length !== 1 ? 's' : ''} en cours`,
                desc: objectifs.length > 0 ? `Consultez les projections ci-dessous.` : 'Créez des objectifs dans la section Objectifs.',
              },
              {
                icon: '💡',
                title: 'Projection 6 mois',
                desc: `Scénario réaliste : +${(baseSavings * 6).toLocaleString('fr-FR')} F d'épargne supplémentaire.`,
              },
            ].map((ins, i) => (
              <Card key={i} className="flex items-start gap-3">
                <span className="text-2xl">{ins.icon}</span>
                <div>
                  <p className="text-xs font-semibold text-gray-800 dark:text-white mb-0.5">{ins.title}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">{ins.desc}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* Scénarios */}
          <Card className="mb-5">
            <CardTitle><TrendingUp size={16} className="text-gold" /> Scénarios de projection (6 mois)</CardTitle>
            <div className="grid grid-cols-3 gap-3 mb-5">
              {SCENARIOS.map((s, i) => (
                <button key={i} onClick={() => setScenario(i)}
                  className={cn('p-3 rounded-xl border text-left transition-all', scenario === i ? 'border-[#FFD700] bg-yellow-50 dark:bg-yellow-900/20' : 'border-gray-100 dark:border-dark-border hover:border-gray-200')}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{s.label}</span>
                  </div>
                  <p className="text-[10px] text-gray-400">{s.desc}</p>
                  <p className="text-sm font-bold mt-1" style={{ color: s.color }}>
                    {Math.round(scenarioSavings * SCENARIOS[i].mult / SCENARIOS[scenario].mult).toLocaleString('fr-FR')} F/mois
                  </p>
                </button>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={projections}>
                <defs>
                  {['réaliste', 'optimiste', 'pessimiste'].map((k, i) => (
                    <linearGradient key={k} id={`grad-${k}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={SCENARIOS[i === 0 ? 1 : i === 1 ? 2 : 0].color} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={SCENARIOS[i === 0 ? 1 : i === 1 ? 2 : 0].color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${Math.round(v / 1000)}k`} />
                <Tooltip formatter={(v: number) => [`${v.toLocaleString('fr-FR')} F`, '']} />
                <Area type="monotone" dataKey="pessimiste" name="Pessimiste" stroke="#EF4444" strokeWidth={1.5} strokeDasharray="4 4" fill="url(#grad-pessimiste)" />
                <Area type="monotone" dataKey="réaliste" name="Réaliste" stroke="#3B82F6" strokeWidth={2.5} fill="url(#grad-réaliste)" />
                <Area type="monotone" dataKey="optimiste" name="Optimiste" stroke="#22C55E" strokeWidth={1.5} strokeDasharray="4 4" fill="url(#grad-optimiste)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Projection objectifs */}
          {objectifs.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {objectifs.map(obj => {
                const pct = Math.min(100, Math.round((obj.currentAmount / obj.targetAmount) * 100))
                const remaining = obj.targetAmount - obj.currentAmount
                const monthsNeeded = scenarioSavings > 0 ? Math.ceil(remaining / scenarioSavings) : null
                const onTime = obj.deadline && monthsNeeded
                  ? new Date(now.getFullYear(), now.getMonth() + monthsNeeded, 1) <= new Date(obj.deadline)
                  : null

                return (
                  <Card key={obj.id}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-yellow-50 dark:bg-yellow-900/20">
                          {obj.icon || '🎯'}
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-800 dark:text-white">{obj.name}</h3>
                          {obj.deadline && <p className="text-[11px] text-gray-400">Échéance : {new Date(obj.deadline).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>}
                        </div>
                      </div>
                      {onTime !== null && (
                        <Badge variant={onTime ? 'green' : 'red'}>
                          {onTime ? '✓ Dans les délais' : '⚠ En retard'}
                        </Badge>
                      )}
                    </div>
                    <ProgressBar value={obj.currentAmount} max={obj.targetAmount} color="#FFD700" height="h-2" className="mb-2" />
                    <div className="flex items-center justify-between text-xs mb-3">
                      <span className="font-medium text-yellow-600">{pct}% atteint</span>
                      <span className="text-gray-400">{obj.currentAmount.toLocaleString('fr-FR')} / {obj.targetAmount.toLocaleString('fr-FR')} F</span>
                    </div>
                    {monthsNeeded !== null && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 rounded-lg p-3">
                        <p className="text-[11px] text-gray-600 dark:text-gray-400">
                          <span className="text-blue-500 font-semibold">💡 IA : </span>
                          À votre rythme actuel ({scenarioSavings.toLocaleString('fr-FR')} F/mois épargnés), vous atteindrez cet objectif en <strong>{monthsNeeded} mois</strong>.
                        </p>
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}
    </AppLayout>
  )
}
