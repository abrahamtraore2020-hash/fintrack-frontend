'use client'
import { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Plus, Trash2, Edit2, Check, X, AlertTriangle, TrendingDown } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

type BudgetItem = {
  id: string
  category: string
  emoji: string
  limit: number
  spent: number
  color: string
}

const DEFAULT_BUDGETS: BudgetItem[] = []

const CATEGORY_OPTIONS = [
  { emoji: '🍽️', label: 'Alimentation' },
  { emoji: '🏠', label: 'Logement' },
  { emoji: '🚗', label: 'Transport' },
  { emoji: '🎭', label: 'Loisirs' },
  { emoji: '💊', label: 'Santé' },
  { emoji: '📱', label: 'Télécom' },
  { emoji: '👗', label: 'Vêtements' },
  { emoji: '📚', label: 'Éducation' },
  { emoji: '🍺', label: 'Sorties' },
  { emoji: '✈️', label: 'Voyages' },
  { emoji: '🛒', label: 'Courses' },
  { emoji: '💡', label: 'Charges' },
  { emoji: '🎁', label: 'Cadeaux' },
  { emoji: '📦', label: 'Autre' },
]

const COLORS = ['#F59E0B','#3B82F6','#8B5CF6','#EC4899','#10B981','#6366F1','#EF4444','#14B8A6']

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<BudgetItem[]>(DEFAULT_BUDGETS)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ category: 'Alimentation', emoji: '🍽️', limit: '', spent: '' })

  const totalLimit = budgets.reduce((s, b) => s + b.limit, 0)
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0)
  const overBudget = budgets.filter(b => b.spent > b.limit)
  const nearLimit = budgets.filter(b => b.spent >= b.limit * 0.8 && b.spent <= b.limit)

  const openAdd = () => {
    setEditId(null)
    setForm({ category: 'Alimentation', emoji: '🍽️', limit: '', spent: '' })
    setShowModal(true)
  }
  const openEdit = (b: BudgetItem) => {
    setEditId(b.id)
    setForm({ category: b.category, emoji: b.emoji, limit: String(b.limit), spent: String(b.spent) })
    setShowModal(true)
  }
  const save = () => {
    if (!form.limit) return toast.error('Entrez un plafond')
    if (editId) {
      setBudgets(p => p.map(b => b.id === editId ? { ...b, category: form.category, emoji: form.emoji, limit: Number(form.limit), spent: Number(form.spent || b.spent) } : b))
      toast.success('Budget mis à jour')
    } else {
      const colorIdx = budgets.length % COLORS.length
      setBudgets(p => [...p, { id: `b-${Date.now()}`, category: form.category, emoji: form.emoji, limit: Number(form.limit), spent: Number(form.spent || 0), color: COLORS[colorIdx] }])
      toast.success('Budget créé')
    }
    setShowModal(false)
  }
  const remove = (id: string) => {
    setBudgets(p => p.filter(b => b.id !== id))
    toast.success('Budget supprimé')
  }

  const chartData = budgets.map(b => ({ name: b.category, plafond: b.limit, dépensé: b.spent }))
  const pieData = budgets.map(b => ({ name: b.category, value: b.spent, color: b.color }))

  return (
    <AppLayout>
      <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-gray-800 dark:text-white">
            Budget <span className="text-glow-blue">par Catégorie</span>
          </h1>
          <p className="text-sm text-gray-500">Définissez vos plafonds de dépenses mensuels</p>
        </div>
        <Button onClick={openAdd}><Plus size={15} /> Nouveau budget</Button>
      </div>

      {/* Alertes */}
      {(overBudget.length > 0 || nearLimit.length > 0) && (
        <div className="space-y-2 mb-5">
          {overBudget.map(b => (
            <div key={b.id} className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl">
              <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-700 dark:text-red-400">
                <strong>{b.emoji} {b.category}</strong> — Plafond dépassé de {(b.spent - b.limit).toLocaleString('fr-FR')} FCFA
              </p>
              <Badge variant="red" className="ml-auto">Dépassé</Badge>
            </div>
          ))}
          {nearLimit.map(b => (
            <div key={b.id} className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/40 rounded-xl">
              <AlertTriangle size={16} className="text-yellow-500 flex-shrink-0" />
              <p className="text-xs text-yellow-700 dark:text-yellow-400">
                <strong>{b.emoji} {b.category}</strong> — Proche du plafond ({Math.round((b.spent / b.limit) * 100)}%)
              </p>
              <Badge variant="gold" className="ml-auto">Attention</Badge>
            </div>
          ))}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total alloué', value: totalLimit, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Total dépensé', value: totalSpent, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
          { label: 'Restant', value: totalLimit - totalSpent, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Budgets dépassés', value: null, display: `${overBudget.length}/${budgets.length}`, color: overBudget.length > 0 ? 'text-red-500' : 'text-green-600', bg: 'bg-gray-50 dark:bg-dark-bg' },
        ].map((kpi, i) => (
          <Card key={i} className="text-center">
            <p className="text-xs text-gray-500 mb-1">{kpi.label}</p>
            <p className={`text-lg font-bold ${kpi.color}`}>
              {kpi.display ?? `${(kpi.value! / 1000).toFixed(0)}k F`}
            </p>
            <div className="w-full bg-gray-100 dark:bg-dark-bg rounded-full h-1 mt-2">
              {kpi.value !== null && (
                <div className="bg-current h-1 rounded-full" style={{ width: `${Math.min(100, (kpi.value / totalLimit) * 100)}%` }} />
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        {/* Bar chart */}
        <Card>
          <CardTitle><TrendingDown size={16} className="text-gold" /> Plafond vs Dépenses</CardTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `${v/1000}k`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => `${v.toLocaleString('fr-FR')} F`} />
              <Bar dataKey="plafond" name="Plafond" fill="#E5E7EB" radius={[0, 4, 4, 0]} />
              <Bar dataKey="dépensé" name="Dépensé" fill="#FFD700" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Pie chart */}
        <Card>
          <CardTitle>Répartition des dépenses</CardTitle>
          <div className="flex items-center">
            <ResponsiveContainer width="55%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={2}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => `${v.toLocaleString('fr-FR')} F`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5">
              {budgets.map(b => (
                <div key={b.id} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: b.color }} />
                  <span className="text-gray-600 dark:text-gray-400 truncate">{b.emoji} {b.category}</span>
                  <span className="ml-auto text-gray-500 flex-shrink-0">{Math.round((b.spent / totalSpent) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Budget list */}
      <Card>
        <CardTitle>Détail par catégorie</CardTitle>
        <div className="space-y-4">
          {budgets.map(b => {
            const pct = Math.min(100, Math.round((b.spent / b.limit) * 100))
            const over = b.spent > b.limit
            const near = pct >= 80 && !over
            return (
              <div key={b.id}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-base">{b.emoji}</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white flex-1">{b.category}</span>
                  <span className={cn('text-xs font-semibold', over ? 'text-red-500' : near ? 'text-yellow-600' : 'text-gray-500')}>
                    {b.spent.toLocaleString('fr-FR')} / {b.limit.toLocaleString('fr-FR')} F
                  </span>
                  <button onClick={() => openEdit(b)} className="p-1 text-gray-400 hover:text-gold transition-colors">
                    <Edit2 size={12} />
                  </button>
                  <button onClick={() => remove(b.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
                <ProgressBar
                  value={b.spent}
                  max={b.limit}
                  color={over ? '#EF4444' : near ? '#F59E0B' : b.color}
                  height="h-2"
                />
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[10px] text-gray-400">{pct}% utilisé</span>
                  <span className={cn('text-[10px] font-medium', over ? 'text-red-500' : 'text-green-600')}>
                    {over ? `−${(b.spent - b.limit).toLocaleString('fr-FR')} F dépassé` : `${(b.limit - b.spent).toLocaleString('fr-FR')} F restant`}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editId ? 'Modifier le budget' : 'Nouveau budget'}>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2 block">Catégorie</label>
            <div className="grid grid-cols-4 gap-1.5 max-h-48 overflow-y-auto">
              {CATEGORY_OPTIONS.map(c => (
                <button key={c.label} onClick={() => setForm(f => ({ ...f, category: c.label, emoji: c.emoji }))}
                  className={cn('p-2 rounded-xl border text-center transition-all',
                    form.category === c.label ? 'border-gold bg-yellow-50 dark:bg-yellow-900/20' : 'border-gray-100 dark:border-dark-border hover:border-gray-200')}>
                  <div className="text-lg">{c.emoji}</div>
                  <p className="text-[9px] text-gray-600 dark:text-gray-400 mt-0.5 leading-tight">{c.label}</p>
                </button>
              ))}
            </div>
          </div>
          <Input label="Plafond mensuel (FCFA)" type="number" placeholder="Ex: 80000" value={form.limit} onChange={e => setForm(f => ({ ...f, limit: e.target.value }))} />
          {editId && <Input label="Dépenses actuelles (FCFA)" type="number" placeholder="Montant déjà dépensé" value={form.spent} onChange={e => setForm(f => ({ ...f, spent: e.target.value }))} />}
          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Annuler</Button>
            <Button className="flex-1" onClick={save}><Check size={14} /> {editId ? 'Mettre à jour' : 'Créer'}</Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  )
}
