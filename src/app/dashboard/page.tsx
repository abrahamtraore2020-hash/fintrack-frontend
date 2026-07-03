'use client'
import { useMemo, useState } from 'react'
import { TrendingUp, TrendingDown, Wallet, Vault, Brain, ArrowRight, Plus, Minus, Plug, Loader2 } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import Link from 'next/link'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardTitle } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { useAppStore } from '@/store/useAppStore'
import { useCoffres } from '@/hooks/useCoffres'
import { useObjectifs } from '@/hooks/useObjectifs'
import { useTransactions } from '@/hooks/useTransactions'
import { formatAmount, CATEGORY_COLORS, CATEGORY_LABELS_FR, timeAgo } from '@/lib/utils'
import { CurrencyBanner } from '@/components/ui/AfricanCurrencies'
import { BackgroundDecor } from '@/components/ui/AfricanIllustrations'
import { supabase, ensureSession } from '@/lib/supabase'
import toast from 'react-hot-toast'

const INCOME_CATS = [
  { value: 'salary',     label: '💼 Salaire / Revenu mensuel' },
  { value: 'freelance',  label: '💻 Freelance / Client' },
  { value: 'investment', label: '📈 Investissement / Dividende' },
  { value: 'other',      label: '💰 Autre revenu' },
]
const EXPENSE_CATS = [
  { value: 'food',          label: '🍔 Alimentation' },
  { value: 'transport',     label: '🚗 Transport' },
  { value: 'housing',       label: '🏠 Logement / Loyer' },
  { value: 'health',        label: '💊 Santé' },
  { value: 'entertainment', label: '🎬 Loisirs / Détente' },
  { value: 'shopping',      label: '🛍 Shopping' },
  { value: 'utilities',     label: '⚡ Factures / Services' },
  { value: 'education',     label: '📚 Éducation / Formation' },
  { value: 'other',         label: '📌 Autre dépense' },
]

export default function DashboardPage() {
  const { user } = useAppStore()
  const { data: coffres = [] } = useCoffres()
  const { data: objectifs = [] } = useObjectifs()
  const { data: transactions = [], create } = useTransactions(200)

  const [modal, setModal] = useState<'income' | 'expense' | null>(null)
  const [form, setForm]   = useState({ amount: '', description: '', category: 'salary', date: new Date().toISOString().slice(0, 10) })
  const [saving, setSaving] = useState(false)

  const openModal = (type: 'income' | 'expense') => {
    setForm({ amount: '', description: '', category: type === 'income' ? 'salary' : 'food', date: new Date().toISOString().slice(0, 10) })
    setModal(type)
  }
  const closeModal = () => setModal(null)

  const getOrCreateManualAccountId = async (): Promise<string> => {
    const uid = await ensureSession()
    const { data: existing } = await supabase
      .from('accounts').select('id')
      .eq('user_id', uid).eq('name', 'Saisie manuelle').maybeSingle()
    if (existing) return (existing as Record<string, unknown>).id as string
    const { data: created, error } = await supabase
      .from('accounts')
      .insert({ user_id: uid, type: 'custom', provider: 'custom', name: 'Saisie manuelle', balance: 0, currency: user?.currency || 'XOF', is_connected: true })
      .select('id').single()
    if (error) throw error
    return (created as Record<string, unknown>).id as string
  }

  const handleSave = async () => {
    if (!form.amount || !form.description.trim()) return toast.error('Remplissez le montant et la description')
    setSaving(true)
    try {
      const accountId = await getOrCreateManualAccountId()
      await create.mutateAsync({
        type: modal!,
        amount: parseFloat(form.amount.replace(/\s/g, '').replace(',', '.')),
        currency: user?.currency || 'XOF',
        category: form.category as any,
        description: form.description.trim(),
        date: new Date(form.date).toISOString(),
        accountId,
        isRecurring: false,
      })
      closeModal()
    } catch (e: any) {
      toast.error(e.message || 'Erreur lors de l\'enregistrement')
    } finally {
      setSaving(false)
    }
  }

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
      <BackgroundDecor />
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
      <div className="mb-4">
        <h1 className="text-lg font-bold text-gray-800 dark:text-white">
          Bonjour, <span className="text-glow-blue">{user?.firstName || ''}</span> 👋
        </h1>
        <p className="text-sm text-gray-500">
          Aperçu de vos finances — {now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Monnaies africaines */}
      <CurrencyBanner className="mb-5" />

      {/* Stats réelles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">

        {/* Revenus — avec bouton + */}
        <Card>
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs text-gray-500 font-medium">Revenus du mois</p>
            <div className="flex items-center gap-1.5">
              <button onClick={() => openModal('income')}
                className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 flex items-center justify-center hover:bg-green-200 dark:hover:bg-green-800/60 transition-colors"
                title="Ajouter un revenu">
                <Plus size={14} />
              </button>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-50 dark:bg-green-900/30">
                <TrendingUp size={16} className="text-green-600" />
              </div>
            </div>
          </div>
          <p className="text-xl font-bold text-green-600">{revenus.toLocaleString('fr-FR')} FCFA</p>
          <p className="text-xs mt-1 text-green-600">↑ {revenus > 0 ? 'Ce mois-ci' : 'Aucun revenu'}</p>
        </Card>

        {/* Dépenses — avec bouton - */}
        <Card>
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs text-gray-500 font-medium">Dépenses du mois</p>
            <div className="flex items-center gap-1.5">
              <button onClick={() => openModal('expense')}
                className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-900/40 text-red-500 flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-800/60 transition-colors"
                title="Ajouter une dépense">
                <Minus size={14} />
              </button>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-50 dark:bg-red-900/30">
                <TrendingDown size={16} className="text-red-500" />
              </div>
            </div>
          </div>
          <p className="text-xl font-bold text-red-500">{depenses.toLocaleString('fr-FR')} FCFA</p>
          <p className="text-xs mt-1 text-red-500">↓ {depenses > 0 ? 'Ce mois-ci' : 'Aucune dépense'}</p>
        </Card>

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
      {/* Modale ajout revenu / dépense */}
      {modal && (
        <Modal open onClose={closeModal} title={modal === 'income' ? '💰 Ajouter un revenu' : '💸 Ajouter une dépense'}>
          <div className="space-y-4 mt-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Montant (FCFA) *</label>
              <Input
                type="number"
                placeholder="Ex : 150000"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">À quoi ça a servi *</label>
              <Input
                placeholder={modal === 'income' ? 'Ex : Salaire juillet, Vente client…' : 'Ex : Courses, Loyer, Carburant…'}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Catégorie</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-dark-border rounded-lg text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-dark-card focus:outline-none focus:border-gold transition-colors">
                {(modal === 'income' ? INCOME_CATS : EXPENSE_CATS).map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Date de la transaction</label>
              <Input
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={closeModal} disabled={saving}>Annuler</Button>
              <Button
                className={`flex-1 ${modal === 'income' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
                onClick={handleSave}
                disabled={saving || !form.amount || !form.description.trim()}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : modal === 'income' ? '+ Enregistrer' : '- Enregistrer'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </AppLayout>
  )
}
