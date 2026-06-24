'use client'
import { useState } from 'react'
import { Target, Plus, TrendingUp, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { calcProgress } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import { Objectif } from '@/types'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
  on_track: { label: 'En bonne voie', variant: 'green' as const, icon: CheckCircle },
  at_risk: { label: 'En retard', variant: 'red' as const, icon: AlertTriangle },
  completed: { label: 'Atteint !', variant: 'gold' as const, icon: CheckCircle },
  overdue: { label: 'Dépassé', variant: 'red' as const, icon: AlertTriangle },
}

export default function ObjectifsPage() {
  const { objectifs, coffres, addObjectif, deleteObjectif, user } = useAppStore()
  const [showModal, setShowModal] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', coffreId: '', targetAmount: '', deadline: '' })

  const handleCreate = () => {
    if (!form.name || !form.targetAmount || !form.deadline) {
      toast.error('Remplissez tous les champs obligatoires')
      return
    }
    const target = Number(form.targetAmount)
    const coffre = coffres.find(c => c.id === form.coffreId)
    const current = coffre?.currentAmount || 0
    const objectif: Objectif = {
      id: `obj-${Date.now()}`,
      userId: user?.id || 'guest',
      coffreId: form.coffreId,
      name: form.name,
      targetAmount: target,
      currentAmount: current,
      currency: 'XOF',
      deadline: form.deadline,
      status: 'on_track',
      progressPercent: Math.round((current / target) * 100),
      estimatedCompletion: 'À calculer',
      createdAt: new Date().toISOString(),
    }
    addObjectif(objectif)
    setShowModal(false)
    setForm({ name: '', coffreId: '', targetAmount: '', deadline: '' })
    toast.success('Objectif créé !')
  }

  const handleDelete = (id: string) => {
    deleteObjectif(id)
    setConfirmDelete(null)
    toast.success('Objectif supprimé')
  }

  return (
    <AppLayout>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-800 dark:text-white">Mes <span className="text-glow-blue">Objectifs</span> d'Épargne</h1>
          <p className="text-sm text-gray-500">Définissez vos cibles et suivez votre progression avec l'aide de l'IA</p>
        </div>
        <Button onClick={() => setShowModal(true)}><Plus size={15} /> Nouvel objectif</Button>
      </div>

      {objectifs.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🎯</div>
          <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">Aucun objectif pour l'instant</h3>
          <p className="text-sm text-gray-400 mb-5">Définissez votre premier objectif financier pour rester motivé</p>
          <Button onClick={() => setShowModal(true)}><Plus size={14} /> Créer mon premier objectif</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
          {objectifs.map(obj => {
            const pct = calcProgress(obj.currentAmount, obj.targetAmount)
            const sc = STATUS_CONFIG[obj.status as keyof typeof STATUS_CONFIG]
            const StatusIcon = sc.icon
            const coffre = coffres.find(c => c.id === obj.coffreId)
            return (
              <Card key={obj.id} className="group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: (coffre?.color || '#FFD700') + '20' }}>
                      {coffre?.icon || '🎯'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white text-sm">{obj.name}</h3>
                      <p className="text-[11px] text-gray-400">
                        {coffre ? `Coffre: ${coffre.name}` : 'Sans coffre'} · Échéance {new Date(obj.deadline).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant={sc.variant}><StatusIcon size={11} /> {sc.label}</Badge>
                    <button onClick={() => setConfirmDelete(obj.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <div className="flex items-end justify-between mb-2">
                  <span className="text-2xl font-bold" style={{ color: coffre?.color || '#FFD700' }}>{obj.currentAmount.toLocaleString('fr-FR')} F</span>
                  <span className="text-sm text-gray-400">/ {obj.targetAmount.toLocaleString('fr-FR')} F</span>
                </div>
                <ProgressBar value={obj.currentAmount} max={obj.targetAmount} color={coffre?.color || '#FFD700'} height="h-2" />
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-500">
                    <TrendingUp size={12} className="inline mr-1" />
                    {obj.targetAmount - obj.currentAmount > 0 ? (obj.targetAmount - obj.currentAmount).toLocaleString('fr-FR') + ' F restants' : 'Objectif atteint !'}
                  </span>
                  <span className="text-xs font-medium text-glow-blue">~{obj.estimatedCompletion}</span>
                </div>
                {obj.aiAdvice && (
                  <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 rounded-lg p-3 text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                    <span className="text-glow-blue font-semibold">💡 IA : </span>{obj.aiAdvice}
                  </div>
                )}
              </Card>
            )
          })}
          <button onClick={() => setShowModal(true)} className="border-2 border-dashed border-gray-200 dark:border-dark-border rounded-xl flex flex-col items-center justify-center gap-2 min-h-52 hover:border-gold hover:bg-yellow-50 dark:hover:bg-yellow-900/10 transition-colors">
            <Plus size={24} className="text-gray-300" />
            <span className="text-sm text-gray-400">Ajouter un objectif</span>
          </button>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nouvel objectif d'épargne">
        <div className="space-y-4">
          <Input label="Nom de l'objectif" placeholder="Ex: Vacances, Voiture, Maison..." value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          {coffres.length > 0 && (
            <Select label="Coffre associé (optionnel)" value={form.coffreId} onChange={e => setForm({ ...form, coffreId: e.target.value })}
              options={[{ value: '', label: 'Aucun coffre' }, ...coffres.map(c => ({ value: c.id, label: `${c.icon} ${c.name}` }))]} />
          )}
          <Input label="Montant cible (FCFA)" type="number" placeholder="200000" value={form.targetAmount} onChange={e => setForm({ ...form, targetAmount: e.target.value })} />
          <Input label="Date limite" type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Annuler</Button>
            <Button className="flex-1" onClick={handleCreate}>Créer l'objectif</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Supprimer cet objectif ?" size="sm">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Cette action est irréversible.</p>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setConfirmDelete(null)}>Annuler</Button>
          <Button variant="danger" className="flex-1" onClick={() => confirmDelete && handleDelete(confirmDelete)}>Supprimer</Button>
        </div>
      </Modal>
    </AppLayout>
  )
}
