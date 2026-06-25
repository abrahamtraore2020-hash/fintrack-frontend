'use client'
import { useState } from 'react'
import { Bell, Plus, Mail, Smartphone, Globe, AppWindow, Check } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Toggle } from '@/components/ui/Toggle'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useNotifications } from '@/hooks/useNotifications'
import { timeAgo } from '@/lib/utils'
import toast from 'react-hot-toast'

type Alarm = { id: string; name: string; icon: string; desc: string; isActive: boolean; type: string }

const CHANNELS = [
  { id: 'email', label: 'Email', icon: Mail, color: 'text-blue-500', desc: 'Résumé hebdo & instantané' },
  { id: 'push_mobile', label: 'Push mobile', icon: Smartphone, color: 'text-green-500', desc: 'iOS & Android temps réel' },
  { id: 'web_push', label: 'Web Push', icon: Globe, color: 'text-purple-500', desc: 'Navigateur sans app ouverte' },
  { id: 'in_app', label: 'In-app', icon: AppWindow, color: 'text-yellow-600', desc: 'Dans l\'application' },
]

export default function NotificationsPage() {
  const { notifications: notifQuery, markRead, markAllRead } = useNotifications()
  const notifications = notifQuery.data || []
  const [alarms, setAlarms] = useState<Alarm[]>([])
  const [channels, setChannels] = useState({ email: true, push_mobile: true, web_push: false, in_app: true })
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'expense_threshold', threshold: '' })

  const unread = notifications.filter(n => !n.isRead)

  const addAlarm = () => {
    if (!form.name) return toast.error('Entrez un nom')
    const icons: Record<string, string> = { expense_threshold: '💸', balance_low: '📉', periodic_reminder: '📅', coffre_milestone: '🎯', income_received: '✅' }
    setAlarms(a => [...a, { id: `al-${Date.now()}`, name: form.name, icon: icons[form.type] || '🔔', desc: form.threshold ? `Seuil : ${Number(form.threshold).toLocaleString('fr-FR')} F` : 'Alerte activée', isActive: true, type: form.type }])
    toast.success('Alarme créée')
    setShowModal(false)
    setForm({ name: '', type: 'expense_threshold', threshold: '' })
  }

  return (
    <AppLayout>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-800 dark:text-white">Alertes & <span className="text-glow-blue">Notifications</span></h1>
          <p className="text-sm text-gray-500">Gérez vos alarmes et préférences de notification</p>
        </div>
        <Button onClick={() => setShowModal(true)}><Plus size={15} /> Nouvelle alarme</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Notifications réelles du store */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <CardTitle className="mb-0"><Bell size={16} className="text-gold" /> Notifications récentes</CardTitle>
            {unread.length > 0 && (
              <button onClick={() => markAllRead.mutate()} className="text-xs text-gold hover:underline flex items-center gap-1">
                <Check size={11} /> Tout marquer lu
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <Bell size={32} className="mx-auto mb-2 opacity-20" />
              <p className="text-sm">Aucune notification pour l'instant</p>
              <p className="text-xs mt-1">Les alertes apparaîtront ici en temps réel</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {notifications.slice(0, 10).map(n => (
                <button key={n.id} onClick={() => markRead.mutate(n.id)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${!n.isRead ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-100 dark:border-yellow-800/30' : 'bg-white dark:bg-transparent border-gray-100 dark:border-dark-border'}`}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0 bg-gray-100 dark:bg-dark-bg">🔔</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 dark:text-white">{n.title}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{n.body}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">{timeAgo(n.createdAt)}</span>
                    {!n.isRead && <div className="w-2 h-2 rounded-full bg-gold" />}
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>

        {/* Alarmes personnalisées */}
        <Card>
          <CardTitle><Bell size={16} className="text-gold" /> Alarmes personnalisées</CardTitle>
          <div className="space-y-2.5">
            {alarms.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">Aucune alarme — créez-en une pour être alerté automatiquement</p>
            )}
            {alarms.map(a => (
              <div key={a.id} className="flex items-center gap-3 p-3 border border-gray-100 dark:border-dark-border rounded-xl">
                <span className="text-base">{a.icon}</span>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-800 dark:text-white">{a.name}</p>
                  <p className="text-[11px] text-gray-400">{a.desc}</p>
                </div>
                <Toggle checked={a.isActive} onChange={v => setAlarms(alarms.map(al => al.id === a.id ? { ...al, isActive: v } : al))} />
              </div>
            ))}
            <button onClick={() => setShowModal(true)}
              className="w-full py-2.5 border-2 border-dashed border-gray-200 dark:border-dark-border rounded-xl text-xs text-gray-400 hover:border-gold hover:text-yellow-700 transition-colors flex items-center justify-center gap-2">
              <Plus size={14} /> Créer une alarme
            </button>
          </div>
        </Card>
      </div>

      {/* Canaux */}
      <Card>
        <CardTitle><Bell size={16} className="text-gold" /> Canaux de notification</CardTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CHANNELS.map(c => {
            const Icon = c.icon
            const isOn = channels[c.id as keyof typeof channels]
            return (
              <div key={c.id} className={`p-4 rounded-xl border text-center transition-all ${isOn ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800/40' : 'bg-gray-50 dark:bg-dark-bg border-gray-100 dark:border-dark-border'}`}>
                <Icon size={20} className={`${isOn ? c.color : 'text-gray-300'} mx-auto mb-2`} />
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{c.label}</p>
                <p className="text-[10px] text-gray-400 mb-3">{c.desc}</p>
                <Toggle checked={isOn} onChange={v => setChannels({ ...channels, [c.id]: v })} />
              </div>
            )
          })}
        </div>
      </Card>

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nouvelle alarme personnalisée">
        <div className="space-y-4">
          <Input label="Nom de l'alarme" placeholder="Ex: Budget restaurant" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <Select label="Type d'alarme" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} options={[
            { value: 'expense_threshold', label: 'Seuil de dépense dépassé' },
            { value: 'balance_low', label: 'Solde bas' },
            { value: 'periodic_reminder', label: 'Rappel périodique' },
            { value: 'coffre_milestone', label: 'Jalon de coffre (25%, 50%...)' },
            { value: 'income_received', label: 'Revenu reçu' },
          ]} />
          <Input label="Valeur seuil (FCFA)" type="number" placeholder="30000" value={form.threshold} onChange={e => setForm(f => ({ ...f, threshold: e.target.value }))} />
          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Annuler</Button>
            <Button className="flex-1" onClick={addAlarm}><Check size={14} /> Créer</Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  )
}
