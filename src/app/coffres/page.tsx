'use client'
import { useState } from 'react'
import { Plus, Info, Zap, Trash2, Loader2, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { calcProgress } from '@/lib/utils'
import { useCoffres } from '@/hooks/useCoffres'

const MODE_LABELS = { manual: 'Manuel', auto: 'Automatique', hybrid: 'Auto + Manuel' }
const MODE_COLORS: Record<string, any> = { manual: 'blue', auto: 'green', hybrid: 'gold' }

const ICONS = ['U+1F4B0', 'U+2708', 'U+1F4BB', 'U+1F6E1', 'U+1F697', 'U+1F3E0', 'U+1F4F1', 'U+1F393', 'U+1F48A', 'U+1F3AF', 'U+1F48D', 'U+1F30D']
const EMOJIS = ['💰', '✈️', '💻', '🛡️', '🚗', '🏠', '📱', '🎓', '💊', '🎯', '💍', '🌍']
const COLORS = ['#FFD700', '#22C55E', '#8B5CF6', '#3B82F6', '#EF4444', '#F97316', '#EC4899', '#14B8A6']

export default function CoffresPage() {
  const { data: coffres = [], isLoading, create, update, remove } = useCoffres()
  const [showModal, setShowModal] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [transaction, setTransaction] = useState<{ coffreId: string; type: 'depot' | 'retrait' } | null>(null)
  const [txAmount, setTxAmount] = useState('')

  const handleTransaction = () => {
    if (!transaction || !txAmount) return
    const coffre = coffres.find(c => c.id === transaction.coffreId)
    if (!coffre) return
    const amount = Number(txAmount)
    if (isNaN(amount) || amount <= 0) return
    const newAmount = transaction.type === 'depot'
      ? coffre.currentAmount + amount
      : Math.max(0, coffre.currentAmount - amount)
    update.mutate({ id: transaction.coffreId, currentAmount: newAmount }, {
      onSuccess: () => { setTransaction(null); setTxAmount('') }
    })
  }
  const [newCoffre, setNewCoffre] = useState({
    name: '', targetAmount: '', mode: 'manual', icon: '💰', color: '#FFD700',
    ruleType: 'percentage', ruleValue: '5', ruleTrigger: 'each_income',
  })

  const handleCreate = () => {
    if (!newCoffre.name || !newCoffre.targetAmount) return
    create.mutate({
      name: newCoffre.name,
      icon: newCoffre.icon,
      color: newCoffre.color,
      targetAmount: Number(newCoffre.targetAmount),
      mode: newCoffre.mode,
      ruleType: newCoffre.ruleType,
      ruleValue: Number(newCoffre.ruleValue),
      ruleTrigger: newCoffre.ruleTrigger,
    }, {
      onSuccess: () => {
        setShowModal(false)
        setNewCoffre({ name: '', targetAmount: '', mode: 'manual', icon: '💰', color: '#FFD700', ruleType: 'percentage', ruleValue: '5', ruleTrigger: 'each_income' })
      }
    })
  }

  const handleDelete = (id: string) => {
    remove.mutate(id, { onSuccess: () => setConfirmDelete(null) })
  }

  if (isLoading) return (
    <AppLayout>
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-gold" size={32} />
      </div>
    </AppLayout>
  )

  return (
    <AppLayout>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-800 dark:text-white">Mes <span className="text-glow-blue">Coffres</span> Virtuels</h1>
          <p className="text-sm text-gray-500">Enveloppes d epargne virtuelles — votre argent reste dans vos vrais comptes</p>
        </div>
        <Button onClick={() => setShowModal(true)}><Plus size={15} /> Nouveau coffre</Button>
      </div>

      <div className="flex items-center gap-2.5 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/40 rounded-xl px-4 py-3 mb-5 text-xs text-yellow-800 dark:text-yellow-300">
        <Info size={15} className="text-yellow-600 flex-shrink-0" />
        <p><strong>Important :</strong> FinTrack ne touche jamais à votre argent réel. Les coffres tracent virtuellement vos allocations.</p>
      </div>

      {coffres.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🏦</div>
          <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">Aucun coffre pour l instant</h3>
          <p className="text-sm text-gray-400 mb-5">Créez votre premier coffre virtuel pour commencer à épargner</p>
          <Button onClick={() => setShowModal(true)}><Plus size={14} /> Créer mon premier coffre</Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
            {coffres.map(c => {
              const pct = calcProgress(c.currentAmount, c.targetAmount)
              return (
                <Card key={c.id} hover className="flex flex-col group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: c.color + '20' }}>{c.icon}</div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant={MODE_COLORS[c.mode]}>{MODE_LABELS[c.mode as keyof typeof MODE_LABELS]}</Badge>
                      <button
                        onClick={() => setConfirmDelete(c.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-white text-sm mb-1">{c.name}</h3>
                  <p className="text-xl font-bold text-gray-800 dark:text-white">{c.currentAmount.toLocaleString('fr-FR')} F</p>
                  <p className="text-xs text-gray-400 mb-3">Objectif : {c.targetAmount.toLocaleString('fr-FR')} F</p>
                  <ProgressBar value={c.currentAmount} max={c.targetAmount} color={c.color} />
                  <div className="flex items-center justify-between mt-2.5">
                    <span className="text-xs font-semibold" style={{ color: c.color }}>{pct}%</span>
                    {c.rule && (
                      <span className="text-[10px] text-gray-400">
                        {c.rule.type === 'percentage' ? `${c.rule.value}% / revenu` : `${c.rule.value.toLocaleString()} F / mois`}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-dark-border">
                    <button
                      onClick={() => { setTransaction({ coffreId: c.id, type: 'depot' }); setTxAmount('') }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 text-xs font-semibold hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors">
                      <ArrowDownCircle size={14} /> Déposer
                    </button>
                    <button
                      onClick={() => { setTransaction({ coffreId: c.id, type: 'retrait' }); setTxAmount('') }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 text-xs font-semibold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
                      <ArrowUpCircle size={14} /> Retirer
                    </button>
                  </div>
                </Card>
              )
            })}
            <button onClick={() => setShowModal(true)} className="border-2 border-dashed border-gray-200 dark:border-dark-border rounded-xl flex flex-col items-center justify-center gap-2 min-h-44 hover:border-gold hover:bg-yellow-50 dark:hover:bg-yellow-900/10 transition-colors">
              <Plus size={24} className="text-gray-300" />
              <span className="text-sm text-gray-400">Ajouter un coffre</span>
            </button>
          </div>

          {coffres.some(c => c.rule && c.mode !== 'manual') && (
            <Card>
              <CardTitle><Zap size={16} className="text-gold" /> Règles d alimentation automatique</CardTitle>
              <div className="space-y-2.5">
                {coffres.filter(c => c.rule && c.mode !== 'manual').map(c => (
                  <div key={c.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-bg rounded-lg">
                    <span className="text-lg">{c.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{c.name}</p>
                      <p className="text-xs text-gray-400">
                        {c.rule?.type === 'percentage' ? `${c.rule.value}% de chaque revenu détecté` : `${c.rule?.value.toLocaleString()} FCFA fixes chaque 1er du mois`}
                      </p>
                    </div>
                    <Badge variant="green">Actif</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nouveau coffre virtuel" size="md">
        <div className="space-y-4">
          <Input label="Nom du coffre" placeholder="Ex: Vacances, Voiture, Urgence..." value={newCoffre.name} onChange={e => setNewCoffre({ ...newCoffre, name: e.target.value })} />

          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">Icône</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map(icon => (
                <button key={icon} onClick={() => setNewCoffre({ ...newCoffre, icon })}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${newCoffre.icon === icon ? 'bg-gold-100 border-2 border-gold' : 'bg-gray-100 dark:bg-dark-bg hover:bg-yellow-50'}`}>
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">Couleur</label>
            <div className="flex gap-2">
              {COLORS.map(color => (
                <button key={color} onClick={() => setNewCoffre({ ...newCoffre, color })}
                  className={`w-7 h-7 rounded-full transition-all ${newCoffre.color === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                  style={{ background: color }} />
              ))}
            </div>
          </div>

          <Input label="Montant cible (FCFA)" type="number" placeholder="200000" value={newCoffre.targetAmount} onChange={e => setNewCoffre({ ...newCoffre, targetAmount: e.target.value })} />

          <Select label="Mode d alimentation" value={newCoffre.mode} onChange={e => setNewCoffre({ ...newCoffre, mode: e.target.value })} options={[
            { value: 'manual', label: 'Manuel — Je verse quand je veux' },
            { value: 'auto', label: 'Automatique — Règle définie' },
            { value: 'hybrid', label: 'Hybride — Auto + Manuel combinés' },
          ]} />

          {newCoffre.mode !== 'manual' && (
            <div className="grid grid-cols-2 gap-3">
              <Select label="Type de règle" value={newCoffre.ruleType} onChange={e => setNewCoffre({ ...newCoffre, ruleType: e.target.value })} options={[
                { value: 'percentage', label: 'Pourcentage (%)' },
                { value: 'fixed', label: 'Montant fixe (FCFA)' },
              ]} />
              <Input label={newCoffre.ruleType === 'percentage' ? 'Pourcentage (%)' : 'Montant fixe'} type="number" placeholder={newCoffre.ruleType === 'percentage' ? '5' : '10000'} value={newCoffre.ruleValue} onChange={e => setNewCoffre({ ...newCoffre, ruleValue: e.target.value })} />
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Annuler</Button>
            <Button className="flex-1" onClick={handleCreate} disabled={create.isPending}>
              {create.isPending ? <Loader2 size={15} className="animate-spin" /> : 'Créer le coffre'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal dépôt / retrait */}
      <Modal
        isOpen={!!transaction}
        onClose={() => { setTransaction(null); setTxAmount('') }}
        title={transaction?.type === 'depot' ? '💰 Déposer dans le coffre' : '💸 Retirer du coffre'}
        size="sm">
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-dark-bg rounded-xl p-3 text-center">
            <p className="text-xs text-gray-400 mb-0.5">Solde actuel</p>
            <p className="text-lg font-bold text-gray-800 dark:text-white">
              {coffres.find(c => c.id === transaction?.coffreId)?.currentAmount.toLocaleString('fr-FR')} F
            </p>
          </div>
          <Input
            label={transaction?.type === 'depot' ? 'Montant à déposer (FCFA)' : 'Montant à retirer (FCFA)'}
            type="number"
            placeholder="Ex: 10000"
            value={txAmount}
            onChange={e => setTxAmount(e.target.value)}
          />
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => { setTransaction(null); setTxAmount('') }}>Annuler</Button>
            <Button
              className={`flex-1 ${transaction?.type === 'retrait' ? 'bg-red-500 hover:bg-red-600' : ''}`}
              onClick={handleTransaction}
              disabled={update.isPending}>
              {update.isPending ? <Loader2 size={15} className="animate-spin" /> : transaction?.type === 'depot' ? 'Déposer' : 'Retirer'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Supprimer ce coffre ?" size="sm">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Cette action est irréversible. Le solde virtuel sera perdu.</p>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setConfirmDelete(null)}>Annuler</Button>
          <Button variant="danger" className="flex-1" onClick={() => confirmDelete && handleDelete(confirmDelete)} disabled={remove.isPending}>
            {remove.isPending ? <Loader2 size={15} className="animate-spin" /> : 'Supprimer'}
          </Button>
        </div>
      </Modal>
    </AppLayout>
  )
}
