'use client'
import { useState } from 'react'
import { Plus, Trash2, Edit2, Check, RefreshCw, Calendar, AlertCircle, Power } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { Toggle } from '@/components/ui/Toggle'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly'
type RecurType = 'expense' | 'income'

type Recurrence = {
  id: string
  name: string
  emoji: string
  amount: number
  type: RecurType
  frequency: Frequency
  nextDate: string
  category: string
  active: boolean
  account: string
}

const FREQ_LABELS: Record<Frequency, string> = {
  daily: 'Quotidien', weekly: 'Hebdomadaire', monthly: 'Mensuel', yearly: 'Annuel',
}

const SEED: Recurrence[] = [
  { id: '1', name: 'Loyer mensuel', emoji: '🏠', amount: 120000, type: 'expense', frequency: 'monthly', nextDate: '2025-07-01', category: 'Logement', active: true, account: 'Wave' },
  { id: '2', name: 'Salaire', emoji: '💰', amount: 350000, type: 'income', frequency: 'monthly', nextDate: '2025-06-30', category: 'Revenus', active: true, account: 'Wave' },
  { id: '3', name: 'Abonnement Netflix', emoji: '🎬', amount: 8000, type: 'expense', frequency: 'monthly', nextDate: '2025-06-28', category: 'Loisirs', active: true, account: 'Carte bancaire' },
  { id: '4', name: 'Forfait téléphone', emoji: '📱', amount: 5000, type: 'expense', frequency: 'monthly', nextDate: '2025-07-05', category: 'Télécom', active: true, account: 'Orange Money' },
  { id: '5', name: 'Cotisation mutuelle', emoji: '🛡️', amount: 15000, type: 'expense', frequency: 'monthly', nextDate: '2025-07-10', category: 'Santé', active: false, account: 'Wave' },
  { id: '6', name: 'Revenu locatif', emoji: '🏢', amount: 80000, type: 'income', frequency: 'monthly', nextDate: '2025-07-01', category: 'Revenus', active: true, account: 'Banque' },
]

const CATEGORY_EMOJIS: Record<string, string> = {
  'Logement': '🏠', 'Revenus': '💰', 'Loisirs': '🎭', 'Télécom': '📱',
  'Santé': '💊', 'Alimentation': '🍽️', 'Transport': '🚗', 'Autre': '📦',
}

export default function RecurrencesPage() {
  const [items, setItems] = useState<Recurrence[]>(SEED)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | RecurType>('all')
  const [form, setForm] = useState({
    name: '', emoji: '📦', amount: '', type: 'expense' as RecurType,
    frequency: 'monthly' as Frequency, nextDate: '', category: 'Autre', account: 'Wave',
  })

  const filtered = items.filter(i => filter === 'all' || i.type === filter)

  const monthlyExpenses = items.filter(i => i.active && i.type === 'expense' && i.frequency === 'monthly').reduce((s, i) => s + i.amount, 0)
  const monthlyIncome = items.filter(i => i.active && i.type === 'income' && i.frequency === 'monthly').reduce((s, i) => s + i.amount, 0)
  const upcoming = items.filter(i => {
    const d = new Date(i.nextDate)
    const now = new Date()
    const diff = (d.getTime() - now.getTime()) / 86400000
    return diff >= 0 && diff <= 7 && i.active
  })

  const openAdd = () => {
    setEditId(null)
    setForm({ name: '', emoji: '📦', amount: '', type: 'expense', frequency: 'monthly', nextDate: new Date().toISOString().slice(0, 10), category: 'Autre', account: 'Wave' })
    setShowModal(true)
  }
  const openEdit = (r: Recurrence) => {
    setEditId(r.id)
    setForm({ name: r.name, emoji: r.emoji, amount: String(r.amount), type: r.type, frequency: r.frequency, nextDate: r.nextDate, category: r.category, account: r.account })
    setShowModal(true)
  }
  const save = () => {
    if (!form.name || !form.amount) return toast.error('Remplissez tous les champs')
    if (editId) {
      setItems(p => p.map(i => i.id === editId ? { ...i, ...form, amount: Number(form.amount), emoji: CATEGORY_EMOJIS[form.category] || '📦' } : i))
      toast.success('Transaction récurrente mise à jour')
    } else {
      setItems(p => [...p, { id: `r-${Date.now()}`, ...form, amount: Number(form.amount), active: true, emoji: CATEGORY_EMOJIS[form.category] || '📦' }])
      toast.success('Transaction récurrente créée')
    }
    setShowModal(false)
  }
  const remove = (id: string) => { setItems(p => p.filter(i => i.id !== id)); toast.success('Supprimé') }
  const toggle = (id: string) => setItems(p => p.map(i => i.id === id ? { ...i, active: !i.active } : i))

  const daysUntil = (date: string) => {
    const diff = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000)
    if (diff === 0) return 'Aujourd\'hui'
    if (diff === 1) return 'Demain'
    if (diff < 0) return `${Math.abs(diff)}j en retard`
    return `dans ${diff}j`
  }

  return (
    <AppLayout>
      <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-gray-800 dark:text-white">
            Transactions <span className="text-glow-blue">Récurrentes</span>
          </h1>
          <p className="text-sm text-gray-500">Abonnements, salaires, loyers — automatisés</p>
        </div>
        <Button onClick={openAdd}><Plus size={15} /> Ajouter</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Sorties / mois', value: monthlyExpenses, color: 'text-red-500' },
          { label: 'Entrées / mois', value: monthlyIncome, color: 'text-green-600' },
          { label: 'Solde récurrent', value: monthlyIncome - monthlyExpenses, color: 'text-blue-600' },
          { label: 'Prochains 7 jours', value: null, display: `${upcoming.length} éché.`, color: upcoming.length > 0 ? 'text-yellow-600' : 'text-gray-500' },
        ].map((kpi, i) => (
          <Card key={i} className="text-center">
            <p className="text-xs text-gray-500 mb-1">{kpi.label}</p>
            <p className={`text-lg font-bold ${kpi.color}`}>
              {kpi.display ?? `${(kpi.value! / 1000).toFixed(0)}k F`}
            </p>
          </Card>
        ))}
      </div>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <Card className="mb-4">
          <CardTitle><AlertCircle size={16} className="text-yellow-500" /> Échéances cette semaine</CardTitle>
          <div className="space-y-2">
            {upcoming.map(u => (
              <div key={u.id} className="flex items-center gap-3 p-2.5 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                <span className="text-xl">{u.emoji}</span>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-800 dark:text-white">{u.name}</p>
                  <p className="text-[10px] text-gray-500">{new Date(u.nextDate).toLocaleDateString('fr-FR')} · {u.account}</p>
                </div>
                <span className={cn('text-sm font-bold', u.type === 'income' ? 'text-green-600' : 'text-red-500')}>
                  {u.type === 'income' ? '+' : '-'}{u.amount.toLocaleString('fr-FR')} F
                </span>
                <Badge variant="gold">{daysUntil(u.nextDate)}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {[['all','Toutes'], ['expense','Dépenses'], ['income','Revenus']].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v as any)}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
              filter === v ? 'bg-gold border-gold text-[#1A1A2E]' : 'border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400 hover:border-gold')}>
            {l}
          </button>
        ))}
      </div>

      {/* List */}
      <Card>
        <div className="space-y-3">
          {filtered.map(r => (
            <div key={r.id} className={cn('flex items-center gap-3 p-3 rounded-xl border transition-all',
              r.active ? 'border-gray-100 dark:border-dark-border' : 'border-gray-50 dark:border-dark-border opacity-50')}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-gray-50 dark:bg-dark-bg flex-shrink-0">
                {r.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{r.name}</p>
                  <Badge variant={r.type === 'income' ? 'green' : 'red'} className="flex-shrink-0 text-[9px]">
                    {r.type === 'income' ? 'Entrée' : 'Sortie'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <RefreshCw size={9} className="text-gray-400" />
                  <span className="text-[10px] text-gray-400">{FREQ_LABELS[r.frequency]}</span>
                  <span className="text-[10px] text-gray-400">·</span>
                  <Calendar size={9} className="text-gray-400" />
                  <span className="text-[10px] text-gray-400">{daysUntil(r.nextDate)}</span>
                  <span className="text-[10px] text-gray-400">· {r.account}</span>
                </div>
              </div>
              <span className={cn('text-sm font-bold flex-shrink-0', r.type === 'income' ? 'text-green-600' : 'text-red-500')}>
                {r.type === 'income' ? '+' : '-'}{r.amount.toLocaleString('fr-FR')} F
              </span>
              <Toggle checked={r.active} onChange={() => toggle(r.id)} />
              <button onClick={() => openEdit(r)} className="p-1.5 text-gray-400 hover:text-gold transition-colors">
                <Edit2 size={13} />
              </button>
              <button onClick={() => remove(r.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              <RefreshCw size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aucune transaction récurrente</p>
              <button onClick={openAdd} className="text-xs text-gold mt-1 hover:underline">En ajouter une</button>
            </div>
          )}
        </div>
      </Card>

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editId ? 'Modifier' : 'Nouvelle transaction récurrente'}>
        <div className="space-y-4">
          <Input label="Nom" placeholder="Ex: Loyer mensuel" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Type" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as RecurType }))} options={[
              { value: 'expense', label: 'Dépense' },
              { value: 'income', label: 'Revenu' },
            ]} />
            <Select label="Fréquence" value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value as Frequency }))} options={[
              { value: 'daily', label: 'Quotidien' },
              { value: 'weekly', label: 'Hebdomadaire' },
              { value: 'monthly', label: 'Mensuel' },
              { value: 'yearly', label: 'Annuel' },
            ]} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Montant (FCFA)" type="number" placeholder="120000" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            <Input label="Prochaine date" type="date" value={form.nextDate} onChange={e => setForm(f => ({ ...f, nextDate: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Catégorie" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} options={
              Object.keys(CATEGORY_EMOJIS).map(k => ({ value: k, label: `${CATEGORY_EMOJIS[k]} ${k}` }))
            } />
            <Select label="Compte" value={form.account} onChange={e => setForm(f => ({ ...f, account: e.target.value }))} options={[
              { value: 'Wave', label: 'Wave' },
              { value: 'Orange Money', label: 'Orange Money' },
              { value: 'MTN MoMo', label: 'MTN MoMo' },
              { value: 'Banque', label: 'Banque' },
              { value: 'Carte bancaire', label: 'Carte bancaire' },
              { value: 'Espèces', label: 'Espèces' },
            ]} />
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Annuler</Button>
            <Button className="flex-1" onClick={save}><Check size={14} /> {editId ? 'Mettre à jour' : 'Créer'}</Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  )
}
